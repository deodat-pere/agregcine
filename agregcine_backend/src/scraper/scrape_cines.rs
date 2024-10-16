use crate::config::{Cinema, Config};
use crate::scraper::extract::{do_request, extract_info};
use std::collections::HashMap;
use std::thread::sleep;
use std::time::Duration;
use tracing::info;

use super::extract::InfoGlob;

pub(crate) fn gen_day_tags() -> Result<Vec<String>, ()> {
    let mut vec = Vec::new();
    let now = chrono::Utc::now();
    for days in 0..7 {
        vec.push(
            now.checked_add_days(chrono::Days::new(days))
                .ok_or(())?
                .format("%Y-%m-%d")
                .to_string(),
        );
    }
    Ok(vec)
}

pub(crate) async fn parse_one_day<'a>(
    cine: &Cinema,
    day_tag: &str,
    dict: &'a mut HashMap<String, InfoGlob>,
) -> Result<&'a mut HashMap<String, InfoGlob>, ()> {
    // Create a reqwest client
    let client = reqwest::Client::new();
    let url = format!(
        "https://www.allocine.fr/_/showtimes/theater-{}/d-{day_tag}/",
        cine.id
    );
    let body = do_request(url.clone(), &client).await.map_err(|e| {
        info!("Error: {e}");
        info!("On {url}");
    })?;
    info!("cine {}, jour {day_tag}", cine.id);
    extract_info(body, dict, cine).map_err(|_| info!("On {url}"))
}

pub(crate) async fn parse_one_cine<'a>(
    cine: &Cinema,
    dict: &'a mut HashMap<String, InfoGlob>,
) -> Result<&'a mut HashMap<String, InfoGlob>, ()> {
    let day_tags = gen_day_tags()?;
    for day_tag in day_tags {
        parse_one_day(cine, &day_tag, dict).await?;
        let dur = Duration::from_millis(500);
        sleep(dur);
    }
    Ok(dict)
}

pub(crate) async fn parse_all(config: &Config) -> Result<HashMap<String, InfoGlob>, ()> {
    let mut info_dict: HashMap<String, InfoGlob> = HashMap::new();

    for cine in &config.cinemas {
        parse_one_cine(cine, &mut info_dict).await?;
    }
    Ok(info_dict)
}
