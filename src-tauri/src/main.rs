#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rand::RngCore;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const KEYRING_SERVICE: &str = "com.edupulse.desktop";
const KEYRING_ACCOUNT: &str = "sqlcipher-local-database";
const DATABASE_FILENAME: &str = "edupulse-secure.db";

#[derive(Debug, Serialize)]
struct LocalDatabaseStatus {
  encrypted: bool,
  storage: &'static str,
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
  let directory = app
    .path()
    .app_local_data_dir()
    .map_err(|error| format!("Unable to resolve local application data directory: {error}"))?;
  fs::create_dir_all(&directory).map_err(|error| format!("Unable to create local data directory: {error}"))?;
  Ok(directory.join(DATABASE_FILENAME))
}

fn database_key() -> Result<String, String> {
  let entry = keyring::Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
    .map_err(|error| format!("Unable to access the operating system credential store: {error}"))?;

  match entry.get_password() {
    Ok(password) => return Ok(password),
    Err(keyring::Error::NoEntry) => {}
    Err(error) => {
      return Err(format!("Unable to read the local database key from the operating system credential store: {error}"));
    }
  }

  let mut bytes = [0_u8; 32];
  rand::rng().fill_bytes(&mut bytes);
  let mut generated = String::with_capacity(bytes.len() * 2);
  for byte in bytes {
    generated.push(char::from(b"0123456789abcdef"[(byte >> 4) as usize]));
    generated.push(char::from(b"0123456789abcdef"[(byte & 0x0f) as usize]));
  }

  entry
    .set_password(&generated)
    .map_err(|error| format!("Unable to store the local database key securely: {error}"))?;
  Ok(generated)
}

fn open_encrypted_database(app: &AppHandle) -> Result<Connection, String> {
  let path = database_path(app)?;
  let key = database_key()?;
  let connection = Connection::open(path).map_err(|error| format!("Unable to open encrypted local database: {error}"))?;
  connection
    .pragma_update(None, "key", &key)
    .map_err(|error| format!("Unable to unlock encrypted local database: {error}"))?;
  connection
    .execute_batch("PRAGMA cipher_memory_security = ON;")
    .map_err(|error| format!("Unable to enable SQLCipher memory protection: {error}"))?;
  connection
    .execute_batch("SELECT count(*) FROM sqlite_master;")
    .map_err(|error| format!("Unable to verify encrypted local database key: {error}"))?;
  connection
    .execute_batch(
      "CREATE TABLE IF NOT EXISTS workspace_records (
        id TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );",
    )
    .map_err(|error| format!("Unable to prepare encrypted workspace storage: {error}"))?;
  Ok(connection)
}

#[tauri::command]
fn local_database_status() -> LocalDatabaseStatus {
  LocalDatabaseStatus {
    encrypted: true,
    storage: "SQLCipher + OS credential manager",
  }
}

#[tauri::command]
fn local_database_load(app: AppHandle) -> Result<Option<String>, String> {
  let connection = open_encrypted_database(&app)?;
  connection
    .query_row(
      "SELECT payload FROM workspace_records WHERE id = 'main' LIMIT 1",
      [],
      |row| row.get(0),
    )
    .optional()
    .map_err(|error| format!("Unable to read encrypted workspace: {error}"))
}

#[tauri::command]
fn local_database_save(app: AppHandle, payload: String, updated_at: String) -> Result<(), String> {
  let connection = open_encrypted_database(&app)?;
  connection
    .execute(
      "INSERT INTO workspace_records (id, payload, updated_at) VALUES ('main', ?, ?) \
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at",
      params![payload, updated_at],
    )
    .map_err(|error| format!("Unable to save encrypted workspace: {error}"))?;
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      local_database_status,
      local_database_load,
      local_database_save
    ])
    .run(tauri::generate_context!())
    .expect("error while running EduPulse desktop");
}
