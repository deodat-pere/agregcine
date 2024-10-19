use std::collections::{HashMap, HashSet};

use reqwest::{Client, Error};
use serde_json::Value;
use tracing::warn;

use crate::config::Cinema;
use crate::error::ServerError;

pub(crate) async fn do_request(url: String, client: &Client) -> Result<String, Error> {
    let response = client.post(url.clone()).send().await.inspect_err(|_| {
        warn!("Couldn't download url {url}");
    })?;
    response.text().await
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

    InfoMovie {
        title: get_string(movie, "title")
            .expect("We checked the title exists")
            .into(),
        duration,
        release,
        summary,
        image,
    }
}

pub(crate) fn build_showtimes(showtimes: &Value, cine: &Cinema) -> Vec<InfoSeance> {
    let mut hash_set = HashSet::new();

    for tag in ["dubbed", "original", "local", "multiple"] {
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

#[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq, Clone)]
pub(crate) struct InfoMovie {
    pub(crate) title: String,
    pub(crate) duration: String,
    pub(crate) release: String,
    pub(crate) summary: String,
    pub(crate) image: String,
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
}
