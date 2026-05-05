use scraper::thread::refresh;
use tracing::metadata::LevelFilter;

use std::str::FromStr;

use crate::config::load_config;
use crate::error::ServerError;

mod config;
mod error;
mod scraper;

#[allow(clippy::needless_return)]
fn main() -> Result<(), ServerError> {
    let config_path = std::env::args().nth(1).unwrap_or("config.json".to_string());
    let config = load_config(&config_path).expect("Failed to load config from {&config_path}");

    let my_filter =
        LevelFilter::from_str(&config.log.level).map_err(|_| ServerError::LogConfigParse)?;

    let (non_blocking, _guard) = tracing_appender::non_blocking(std::io::stdout());
    tracing_subscriber::fmt()
        .with_ansi(false)
        .with_max_level(my_filter)
        .with_level(true)
        .with_writer(non_blocking)
        .init();

    tracing::info!("init config from: {:?}", &config_path);

    refresh(&config)
}
