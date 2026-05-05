use serde_json::{Number, Value};
use std::collections::{HashMap, HashSet};
use tracing::warn;

use crate::config::Cinema;
use crate::error::ServerError;

pub(crate) fn do_request(url: String) -> Result<String, ureq::Error> {
    ureq::post(&url)
        .send_empty()
        .inspect_err(|_| {
            warn!("Couldn't download url {url}");
        })?
        .body_mut()
        .read_to_string()
}

pub(crate) fn extract_info<'a>(
    body: String,
    dict: &'a mut HashMap<String, InfoGlob>,
    cine: &Cinema,
) -> Result<&'a mut HashMap<String, InfoGlob>, ServerError> {
    // parse json
    let value: Value = serde_json::from_str(&body).unwrap();

    let movie_vec = get_array(&value, "results")?;

    for entry in movie_vec {
        let movie = match entry.get("movie") {
            Some(t) => t,
            None => continue,
        };
        let title = match get_string(movie, "title") {
            Ok(t) => t,
            Err(_) => continue,
        };

        let showtimes = match entry.get("showtimes") {
            Some(t) => t,
            None => continue,
        };

        let mut vec_showtimes = build_showtimes(showtimes, cine);

        dict.entry(title.clone())
            .and_modify(|InfoGlob { movie: _, dates }| dates.append(&mut vec_showtimes))
            .or_insert(InfoGlob {
                movie: build_movie(movie),
                dates: vec_showtimes,
            });
    }

    Ok(dict)
}

pub(crate) fn build_movie(movie: &Value) -> InfoMovie {
    let duration = match get_string(movie, "runtime") {
        Ok(t) => t.into(),
        Err(_) => String::new(),
    };

    let release = match movie
        .get("releases")
        .and_then(|t| t.get(0).and_then(|t| t.get("releaseDate")))
    {
        None => String::new(),
        Some(t) => match get_string(t, "date") {
            Err(_) => String::new(),
            Ok(t) => t.into(),
        },
    };

    let summary = match get_string(movie, "synopsisFull") {
        Ok(t) => t.into(),
        Err(_) => String::new(),
    };

    let image = match movie.get("poster") {
        None => String::new(),
        Some(t) => match get_string(t, "url") {
            Err(_) => String::new(),
            Ok(t) => t.into(),
        },
    };

    let is_new = match movie.get("customFlags") {
        None => bool::default(),
        Some(t) => match get_bool(t, "weeklyOuting") {
            Err(_) => bool::default(),
            Ok(t) => *t,
        },
    };

    let is_premiere = match movie.get("customFlags") {
        None => bool::default(),
        Some(t) => match get_bool(t, "isPremiere") {
            Err(_) => bool::default(),
            Ok(t) => *t,
        },
    };

    let rating = match movie.get("stats").and_then(|t| t.get("userRating")) {
        None => 0,
        Some(t) => match get_number(t, "score") {
            Err(_) => 0,
            Ok(t) => (t.as_f64().unwrap() * 10.) as u32,
        },
    };

    let mut genres = Vec::new();
    for genre in get_array(movie, "genres").unwrap_or(&Vec::new()) {
        match get_string(genre, "translate") {
            Err(_) => {}
            Ok(t) => genres.push(t.clone()),
        }
    }

    InfoMovie {
        title: get_string(movie, "title")
            .expect("We checked the title exists")
            .into(),
        duration,
        release,
        summary,
        image,
        is_new,
        is_premiere,
        rating,
        genres,
    }
}

pub(crate) fn build_showtimes(showtimes: &Value, cine: &Cinema) -> Vec<InfoSeance> {
    let mut hash_set = HashSet::new();

    for tag in [
        "original",
        "original_st",
        "original_st_sme",
        "multiple",
        "multiple_st",
        "multiple_st_sme",
    ] {
        let mut vec: Vec<&String> = Vec::new();
        match get_array(showtimes, tag) {
            Err(_) => println!("Not found {tag}"),
            Ok(t) => {
                vec = t
                    .iter()
                    .filter_map(|value| get_string(value, "startsAt").ok())
                    .collect::<Vec<&String>>()
            }
        }
        let _ = vec
            .into_iter()
            .map(|time| {
                hash_set.insert(InfoSeance {
                    time: time.into(),
                    cine: cine.name.clone(),
                    dubbed: tag == "multiple" || tag == "multiple_st" || tag == "multiple_st_sme",
                    subtitled: tag == "original"
                        || tag == "original_st"
                        || tag == "original_st_sme",
                })
            })
            .collect::<Vec<_>>();
    }
    hash_set.into_iter().collect()
}

pub(crate) fn get_array<'a>(val: &'a Value, tag: &'a str) -> Result<&'a Vec<Value>, ServerError> {
    match val.get(tag) {
        Some(Value::Array(t)) => Ok(t),
        _ => Err(ServerError::JsonParse),
    }
}

pub(crate) fn get_string<'a>(val: &'a Value, tag: &'a str) -> Result<&'a String, ServerError> {
    match val.get(tag) {
        Some(Value::String(t)) => Ok(t),
        _ => Err(ServerError::JsonParse),
    }
}

pub(crate) fn get_bool<'a>(val: &'a Value, tag: &'a str) -> Result<&'a bool, ServerError> {
    match val.get(tag) {
        Some(Value::Bool(t)) => Ok(t),
        _ => Err(ServerError::JsonParse),
    }
}

pub(crate) fn get_number<'a>(val: &'a Value, tag: &'a str) -> Result<&'a Number, ServerError> {
    match val.get(tag) {
        Some(Value::Number(t)) => Ok(t),
        _ => Err(ServerError::JsonParse),
    }
}

#[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq, Clone)]
pub(crate) struct InfoMovie {
    pub(crate) title: String,
    pub(crate) duration: String,
    pub(crate) release: String,
    pub(crate) summary: String,
    pub(crate) image: String,
    pub(crate) is_new: bool,
    pub(crate) is_premiere: bool,
    pub(crate) rating: u32,
    pub(crate) genres: Vec<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq, Clone)]
pub(crate) struct InfoGlob {
    pub(crate) movie: InfoMovie,
    pub(crate) dates: Vec<InfoSeance>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq, Clone, Hash)]
pub(crate) struct InfoSeance {
    pub(crate) time: String,
    pub(crate) cine: String,
    pub(crate) dubbed: bool,
    pub(crate) subtitled: bool,
}
