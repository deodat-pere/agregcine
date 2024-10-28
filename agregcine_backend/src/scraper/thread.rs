use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread::sleep;

use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use tracing::{info, warn};

use crate::{config::Config, error::ServerError};

use super::{extract::InfoGlob, scrape_cines::parse_all};

pub async fn wait(reload: bool, config: Config, movies_mutex: Arc<Mutex<HashMap<u32, InfoGlob>>>) {
    // Check if the database is empty
    let empty = refresh_movies(&config.database.file).is_empty();

    if reload || empty {
        match refresh(&config, movies_mutex.clone()).await {
            Ok(_) => (),
            Err(e) => warn!("Failed refresh: {e:?}"),
        };
    }

    loop {
        let now = chrono::Utc::now();

        let next_wake = (now + chrono::Duration::days(1))
            .date_naive()
            .and_hms_opt(0, 1, 0)
            .expect("This should not crash");

        let duration = next_wake
            .signed_duration_since(now.naive_utc())
            .to_std()
            .expect("This should not crash");

        info!("Waking up next at {next_wake:?} in {duration:?}");

        sleep(duration);

        match refresh(&config, movies_mutex.clone()).await {
            Ok(_) => (),
            Err(e) => warn!("Failed refresh: {e:?}"),
        };
    }
}

pub async fn refresh(
    config: &Config,
    movies_mutex: Arc<Mutex<HashMap<u32, InfoGlob>>>,
) -> Result<(), ServerError> {
    let infos_glob = parse_all(config).await.unwrap();

    {
        let time = chrono::Utc::now()
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap();

        let stored_infos = StoredInfos {
            time,
            movies: infos_glob,
        };
        let json = serde_json::to_string(&stored_infos).unwrap();
        let _ = std::fs::write(&config.database.file, json)
            .inspect_err(|e| warn!("Failed to write to the store: {e}"));
    }

    {
        let mut m = movies_mutex.lock().map_err(|_| ServerError::MutexLock)?;

        *m = refresh_movies(&config.database.file);
    }

    Ok(())
}

pub(crate) fn refresh_movies(store: &String) -> HashMap<u32, InfoGlob> {
    let mut res = HashMap::new();
    if let Ok(json) = std::fs::read_to_string(store) {
        let stored_infos: StoredInfos = serde_json::from_str(&json)
            .inspect_err(|e| warn!("Failed to parse content of the store: {e}"))
            .unwrap_or_default();

        // If it has been more than a day since the last scraping day, scrape again
        if stored_infos
            .time
            .signed_duration_since(chrono::Utc::now().naive_utc())
            .num_hours()
            > 23
        {
            return res;
        }

        let mut id = 0;
        for (_, info) in stored_infos.movies {
            res.insert(id, info);
            id += 1;
        }

        info!("Number of movies in the list: {id}");
    };
    res
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct StoredInfos {
    /// time in ms since epoch of the last scrape day
    pub time: NaiveDateTime,
    /// All the scraped movies
    pub movies: HashMap<String, InfoGlob>,
}
