use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;

use serde::{Deserialize, Serialize};
use tracing::warn;

use crate::scraper::extract::InfoSeance;
use crate::server::ServerState;

pub(crate) async fn up() -> Result<impl IntoResponse, Response> {
    Ok(StatusCode::OK)
}

pub(crate) async fn get_movies(
    State(state): State<ServerState>,
) -> Result<Json<Vec<Movie>>, StatusCode> {
    let mov = state.movies.lock().map_err(|e| {
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
            rating: v.movie.rating,
            genres: v.movie.genres.clone(),
        })
        .collect();
    Ok(Json(movies))
}

pub(crate) async fn get_movie_by_id(
    State(state): State<ServerState>,
    Path(id): Path<u32>,
) -> Result<Json<Movie>, StatusCode> {
    let mov = state.movies.lock().map_err(|e| {
        warn!("Route get_movie_by_id: Could not lock movies Mutex {e}");
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
        rating: m.movie.rating,
        genres: m.movie.genres.clone(),
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
    rating: u32,
    genres: Vec<String>,
}

pub(crate) async fn get_all_times(
    State(state): State<ServerState>,
) -> Result<Json<Vec<IDedSeance>>, StatusCode> {
    let mov = state.movies.lock().map_err(|e| {
        warn!("Route get_all_times: Could not lock movies Mutex {e}");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let seances = mov
        .iter()
        .flat_map(|(k, v)| {
            v.dates.iter().map(|seance| IDedSeance {
                id: *k,
                seance: seance.clone(),
            })
        })
        .collect::<Vec<_>>();
    Ok(Json(seances))
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct IDedSeance {
    id: u32,
    seance: InfoSeance,
}

pub(crate) async fn get_showings(
    State(state): State<ServerState>,
    Path(id): Path<u32>,
) -> Result<Json<Vec<InfoSeance>>, StatusCode> {
    let mov = state.movies.lock().map_err(|e| {
        warn!("Route get_showings: Could not lock movies Mutex {e}");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let seances = mov.get(&id).ok_or(StatusCode::NOT_FOUND)?.dates.clone();
    Ok(Json(seances))
}

pub(crate) async fn get_presentation_text(
    State(state): State<ServerState>,
) -> Result<Json<PresentationTextResponse>, StatusCode> {
    Ok(Json(PresentationTextResponse {
        presentation_text: state.frontend.presentation_text,
    }))
}

#[derive(Serialize, Deserialize)]
pub(crate) struct PresentationTextResponse {
    pub(crate) presentation_text: String,
}
