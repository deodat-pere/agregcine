use std::collections::HashMap;
use std::net::{Ipv4Addr, SocketAddr, TcpListener};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use axum::http::Method;
use axum::{routing::get, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

use crate::config::Config;
use crate::error::ServerError;
use crate::route::{get_movie_by_id, get_movies, get_showings, up};
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
    _config: Config,
    movies: Arc<Mutex<HashMap<u32, InfoGlob>>>,
) -> Result<(), ServerError> {
    let routes: Router = Router::new()
        .route("/up", get(up))
        .route("/movies", get(get_movies))
        .route("/showings/:id", get(get_showings))
        .route("/movie/:id", get(get_movie_by_id))
        .with_state(movies);

    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods([Method::GET, Method::POST])
        // allow requests from any origin
        .allow_origin(Any);

    let app = Router::new().nest("/api", routes).layer(cors);

    println!("Running...");
    tracing::info!("Running...");

    axum_server::from_tcp(listener)
        .serve(app.into_make_service())
        .await
        .map_err(|_| ServerError::ServerRun)
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
pub async fn serve_static_files(static_files: PathBuf, address: Ipv4Addr, port: u16) {
    let addr = SocketAddr::from((address, port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    let app = Router::new().nest_service("/", ServeDir::new(static_files));
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
