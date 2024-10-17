use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread::sleep;

use kv::Codec;
use tracing::{info, warn};

use crate::{config::Config, error::ServerError};

use super::{extract::InfoGlob, scrape_cines::parse_all};

pub async fn wait(
    reload: bool,
    config: Config,
    movies_mutex: Arc<Mutex<HashMap<u32, InfoGlob>>>,
    store: &kv::Store,
) {
    // Check if the database is empty
    let empty: bool;
    {
        let bucket = store
            .bucket::<String, kv::Json<InfoGlob>>(None)
            .expect("Can't open bucket");

        empty = bucket.is_empty();
    }

    if reload || empty {
        match refresh(&config, movies_mutex.clone(), store).await {
            Ok(_) => (),
            Err(e) => warn!("{e:?}"),
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

        match refresh(&config, movies_mutex.clone(), store).await {
            Ok(_) => (),
            Err(e) => warn!("{e:?}"),
        };
    }
}

pub async fn refresh(
    config: &Config,
    movies_mutex: Arc<Mutex<HashMap<u32, InfoGlob>>>,
    store: &kv::Store,
) -> Result<(), ServerError> {
    let infos_glob = parse_all(config).await.unwrap();

    {
        // Using a Json encoded type is easy, thanks to Serde
        let bucket = store
            .bucket::<String, kv::Json<InfoGlob>>(None)
            .expect("Can't open bucket");

        let _ = bucket
            .clear()
            .inspect_err(|e| warn!("Failed to clear bucket: {e:?}"));

        for (key, value) in infos_glob {
            if !value.dates.is_empty() {
                let _ = bucket
                    .set(&key, &kv::Json(value))
                    .inspect_err(|e| warn!("Error inserting movie {e:?}"));
            } else {
                warn!("Movie {} has no showtimes", value.movie.title);
            }
        }

        let _ = bucket
            .flush()
            .inspect_err(|e| warn!("Error flushing to disk {e}"));
    }

    {
        let mut m = movies_mutex.lock().map_err(|_| ServerError::MutexLock)?;

        *m = refresh_movies(store)?;
    }

    Ok(())
}

pub(crate) fn refresh_movies(store: &kv::Store) -> Result<HashMap<u32, InfoGlob>, ServerError> {
    // Using a Json encoded type is easy, thanks to Serde
    let bucket = store
        .bucket::<String, kv::Json<InfoGlob>>(None)
        .expect("Can't open bucket");

    let mut movies = HashMap::new();
    let mut id = 0;
    for item in bucket.iter() {
        let item = item.map_err(|_| ServerError::BucketRead)?;
        let value: InfoGlob = item
            .value::<kv::Json<InfoGlob>>()
            .map_err(|_| ServerError::BucketRead)?
            .into_inner();
        movies.insert(id, value);
        id += 1;
    }
    info!("Number of movies in the list: {id}");
    Ok(movies)
}
