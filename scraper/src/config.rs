use serde::{Deserialize, Serialize};

use crate::error::ServerError;

/// Contain Command Center Configuration
/// * `server` - [`Server`]
/// * `database` - [`DataBase`]
/// * `log` - [`LogConfiguration`]
/// * `rewind` - [`Vec`]<[`Rewind`]> (Optional)
#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    /// * `log` - [`LogConfiguration`]
    pub log: LogConfiguration,
    /// * `database` - [`DataBase`]
    pub database: DataBase,
    /// * `cinemas` - [`Vec<Cinema>`]
    pub cinemas: Vec<Cinema>,
}

/// Contain Server Configuration
#[derive(Clone, Debug, Deserialize)]
pub struct DataBase {
    /// Directory of the KV store
    pub file: String,
}

/// Logging configuration
#[derive(Clone, Debug, Deserialize)]
pub struct LogConfiguration {
    /// Max level of logging
    pub level: String,
}

/// Cinemas to parse
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Cinema {
    /// Id of the cinemas on allocine
    pub id: String,
    /// Human readable name
    pub name: String,
}

/// Load the config from a ".json" file
///
/// ## Errors
/// * [`std::io::ErrorKind::Interrupted`]
/// * [`std::io::ErrorKind::InvalidData`]
pub fn load_config(path: &str) -> Result<Config, ServerError> {
    let content = std::fs::read_to_string(path).map_err(|_| ServerError::File)?;
    let parsed_config = serde_json::from_str(&content).map_err(|_| ServerError::ConfigParse)?;
    Ok(parsed_config)
}
