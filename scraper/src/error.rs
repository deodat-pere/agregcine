#[derive(Debug)]
pub(crate) enum ServerError {
    JsonParse,
    ConfigParse,
    LogConfigParse,
    File,
}
