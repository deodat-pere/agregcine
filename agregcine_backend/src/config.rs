use clap::Parser;
use std::net::Ipv4Addr;
use std::path::PathBuf;
use std::str::FromStr;

use serde::{Deserialize, Deserializer, Serialize};

use crate::error::ServerError;

/// Contain Command Center Configuration
/// * `server` - [`Server`]
/// * `database` - [`DataBase`]
/// * `log` - [`LogConfiguration`]
/// * `rewind` - [`Vec`]<[`Rewind`]> (Optional)
#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    /// * `server` - [`Server`]
    pub server: Server,
    /// * `frontend` - [`Frontend`]
    pub frontend: Frontend,
    /// * `log` - [`LogConfiguration`]
    pub log: LogConfiguration,
    /// * `database` - [`DataBase`]
    pub database: DataBase,
    /// * `cinemas` - [`Vec<Cinema>`]
    pub cinemas: Vec<Cinema>,
}

/// Contain Server Configuration
#[derive(Clone, Debug, Deserialize)]
pub struct Server {
    /// * `address` - [`Ipv4Addr`] the ip address
    #[serde(deserialize_with = "deserialize_string_to_ipv4")]
    pub address: Ipv4Addr,
    /// * `port` - [`u16`] the port to listen on
    pub port: u16,
    /// * `static_files` - [`PathBuf`] static files directory
    pub static_files: PathBuf,
}

/// Contains informations that will be sent to the frontend directly
#[derive(Clone, Debug, Deserialize)]
pub struct Frontend {
    /// * `presentation_text` - [`String`]Custom text describing the selection of cinemas
    pub presentation_text: String,
}

/// Contain Server Configuration
#[derive(Clone, Debug, Deserialize)]
pub struct DataBase {
    /// Directory of the KV store
    pub file: String,
}

pub(crate) fn deserialize_string_to_ipv4<'de, D>(deserializer: D) -> Result<Ipv4Addr, D::Error>
where
    D: Deserializer<'de>,
{
    let ip_str: String = Deserialize::deserialize(deserializer)?;
    Ipv4Addr::from_str(&ip_str).map_err(|_| serde::de::Error::custom("Invalid IPv4 addr"))
}

/// Logging configuration
#[derive(Clone, Debug, Deserialize)]
pub struct LogConfiguration {
    /// Logging directory
    pub dir: PathBuf,
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

/// Contain Command Line Arguments
///
/// ## Members
/// * `path` - [`String`] path to the new config file
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
pub struct Args {
    /// * `path` - [`String`] path to the new config file
    #[clap(short, long, default_value = "config.json")]
    pub path: String,
    /// * `reload` - [`bool`] should the movies be reloaded at server startup
    #[clap(short, long, action)]
    pub reload: bool,
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
