use clap::Parser;

use scraper::thread::{refresh_movies, wait};
use tracing::metadata::LevelFilter;

use std::collections::HashMap;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::{ops::Not, str::FromStr};

use crate::config::{load_config, Args};
use crate::error::ServerError;
use crate::scraper::extract::InfoGlob;
use crate::server::spawn_server;

mod config;
mod error;
mod route;
mod scraper;
mod server;

#[allow(clippy::needless_return)]
#[tokio::main]
async fn main() -> Result<(), ServerError> {
    let args = Args::parse();
    let config = load_config(&args.path).expect("Failed to load config");

    verify_log_dir(&config.log.dir)?;

    let my_filter =
        LevelFilter::from_str(&config.log.level).map_err(|_| ServerError::LogConfigParse)?;

    let file_appender = tracing_appender::rolling::daily(&config.log.dir, "log.txt");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);
    tracing_subscriber::fmt()
        .with_ansi(false)
        .with_max_level(my_filter)
        .with_level(true)
        .with_writer(non_blocking)
        .init();

    tracing::info!("init config from: {:?}", &args.path);

    let movies: HashMap<u32, InfoGlob> = HashMap::new();

    let movies_mutex = Arc::new(Mutex::new(movies));

    {
        let mut m = movies_mutex.lock().map_err(|_| ServerError::MutexLock)?;

        *m = refresh_movies(&config.database.file);
    }

    let mm_clone = movies_mutex.clone();
    let config_clone = config.clone();
    tokio::spawn(async move {
        wait(args.reload, config_clone, mm_clone.clone()).await;
    });

    spawn_server(
        config.server.address,
        config.server.port,
        config,
        movies_mutex.clone(),
    )
    .await
}

/// Check if the log directory exist
/// Create it if not
fn verify_log_dir<P: AsRef<Path>>(path: &P) -> Result<(), ServerError> {
    let path = path.as_ref();

    if path.exists().not() {
        std::fs::create_dir_all(path).map_err(|_| ServerError::File)?
    }
    Ok(())
}
