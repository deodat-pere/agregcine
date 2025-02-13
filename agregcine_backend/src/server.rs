use std::net::{Ipv4Addr, SocketAddr, TcpListener};

use axum::Router;
use tower_http::services::{ServeDir, ServeFile};

use crate::config::Config;
use crate::error::ServerError;

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
pub async fn spawn_server(addr: Ipv4Addr, port: u16, config: Config) -> Result<(), ServerError> {
    let listener =
        TcpListener::bind(SocketAddr::new(addr.into(), port)).map_err(|_| ServerError::AddrBind)?;

    spawn_server_with_listener(listener, config).await
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
) -> Result<(), ServerError> {
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
