use std::collections::HashMap;
use std::net::{Ipv4Addr, SocketAddr, TcpListener};
use std::sync::{Arc, Mutex};

use axum::http::Method;
use axum::{routing::get, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};

use crate::config::{Config, Frontend};
use crate::error::ServerError;
use crate::route::{
    get_all_times, get_movie_by_id, get_movies, get_presentation_text, get_showings, up,
};
use crate::scraper::extract::InfoGlob;

/// Create a TCP listener and call [`spawn_server_with_listener`]
///
/// ## Parameters
/// * `addr` - [`Ipv4Addr`] server address
/// * `port` - [`u16`] server port
/// * `config` - [`Config`] server config
/// * `movies` - [`Arc<Mutex<HashMap<u32,InfoGlob>>>`] List of movies
///
/// ## Returned value
/// [`Result<(),ServerError>`]<()>
pub async fn spawn_server(
    addr: Ipv4Addr,
    port: u16,
    config: Config,
    movies: Arc<Mutex<HashMap<u32, InfoGlob>>>,
) -> Result<(), ServerError> {
    let listener =
        TcpListener::bind(SocketAddr::new(addr.into(), port)).map_err(|_| ServerError::AddrBind)?;

    spawn_server_with_listener(listener, config, movies).await
}

/// Create a Router and Spawn the HTTP server using a TcpListener
///
/// ## Parameters
/// * `listener` - [`TcpListener`]
/// * `_config` - [`Config`] server config (maybe used later for init a database client or else...)
/// * `movies` - [`Arc<Mutex<HashMap<u32,InfoGlob>>>`] List of movies
///
/// ## Returned value
/// [`Result<(),ServerError>`]<()>
pub async fn spawn_server_with_listener(
    listener: TcpListener,
    config: Config,
    movies: Arc<Mutex<HashMap<u32, InfoGlob>>>,
) -> Result<(), ServerError> {
    let state = ServerState {
        movies,
        frontend: config.frontend.clone(),
    };
    let routes: Router = Router::new()
        .route("/up", get(up))
        .route("/movies", get(get_movies))
        .route("/showings/:id", get(get_showings))
        .route("/movie/:id", get(get_movie_by_id))
        .route("/presentation_text", get(get_presentation_text))
        .route("/all_times", get(get_all_times))
        .with_state(state);

    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods([Method::GET, Method::POST])
        // allow requests from any origin
        .allow_origin(Any);

    let static_dir = ServeDir::new(config.server.static_files.clone()).not_found_service(
        ServeFile::new(format!(
            "{}/index.html",
            config.server.static_files.as_path().display()
        )),
    );
    tracing::info!(
        "Serving static files: {}/index.html",
        config.server.static_files.as_path().display()
    );
    let app = Router::new()
        .nest("/api", routes)
        .layer(cors)
        .nest_service("/", static_dir.clone())
        .nest_service("/movie/:id", static_dir.clone())
        .nest_service("/timeline", static_dir);

    println!("Running...");
    tracing::info!("Running...");

    axum_server::from_tcp(listener)
        .serve(app.into_make_service())
        .await
        .map_err(|_| ServerError::ServerRun)
}

#[derive(Clone, Debug)]
pub(crate) struct ServerState {
    pub(crate) movies: Arc<Mutex<HashMap<u32, InfoGlob>>>,
    pub(crate) frontend: Frontend,
}
