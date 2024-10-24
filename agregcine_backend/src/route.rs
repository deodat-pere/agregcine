use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;

use serde::{Deserialize, Serialize};
use tracing::warn;

use crate::scraper::extract::{InfoGlob, InfoSeance};

pub(crate) async fn up() -> Result<impl IntoResponse, Response> {
    Ok(StatusCode::OK)
}

pub(crate) async fn get_movies(
    State(movies): State<Arc<Mutex<HashMap<u32, InfoGlob>>>>,
) -> Result<Json<Vec<Movie>>, StatusCode> {
    let mov = movies.lock().map_err(|e| {
        warn!("Route get_movies: Could not lock movies Mutex {e}");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let movies = mov
        .iter()
        .map(|(k, v)| Movie {
            id: *k,
            runtime: v.movie.duration.clone(),
            name: v.movie.title.clone(),
            image_link: v.movie.image.clone(),
            summary: v.movie.summary.clone(),
            release_date: v.movie.release.clone(),
            is_new: v.movie.is_new,
            is_premiere: v.movie.is_premiere,
            is_unique: { v.dates.len() == 1 },
        })
        .collect();
    Ok(Json(movies))
}

pub(crate) async fn get_movie_by_id(
    State(movies): State<Arc<Mutex<HashMap<u32, InfoGlob>>>>,
    Path(id): Path<u32>,
) -> Result<Json<Movie>, StatusCode> {
    let mov = movies.lock().map_err(|e| {
        warn!("Rout get_movie_by_id: Could not lock movies Mutex {e}");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let movie = mov.get(&id).ok_or(StatusCode::NOT_FOUND).map(|m| Movie {
        id,
        runtime: m.movie.duration.clone(),
        name: m.movie.title.clone(),
        image_link: m.movie.image.clone(),
        summary: m.movie.summary.clone(),
        release_date: m.movie.release.clone(),
        is_new: m.movie.is_new,
        is_premiere: m.movie.is_premiere,
        is_unique: { m.dates.len() == 1 },
    })?;
    Ok(Json(movie))
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct Movie {
    id: u32,
    runtime: String,
    name: String,
    image_link: String,
    summary: String,
    release_date: String,
    is_new: bool,
    is_premiere: bool,
    is_unique: bool,
}

pub(crate) async fn get_showings(
    State(movies): State<Arc<Mutex<HashMap<u32, InfoGlob>>>>,
    Path(id): Path<u32>,
) -> Result<Json<Vec<InfoSeance>>, StatusCode> {
    let mov = movies.lock().map_err(|e| {
        warn!("Route get_showings: Could not lock movies Mutex {e}");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let seances = mov.get(&id).ok_or(StatusCode::NOT_FOUND)?.dates.clone();
    Ok(Json(seances))
}

#[derive(Serialize, Deserialize)]
pub(crate) struct Showing {
    cine: String,
    time: String,
}
