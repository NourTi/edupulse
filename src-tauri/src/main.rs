#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use argon2::{password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString}, Argon2};
use rand::RngCore;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use serde_json::{json, Value};
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use sha2::{Digest, Sha256};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, State};

const KEYRING_SERVICE: &str = "com.edupulse.desktop";
const KEYRING_ACCOUNT: &str = "sqlcipher-local-database";
const DATABASE_FILENAME: &str = "edupulse-secure.db";

#[derive(Debug, Serialize)]
struct LocalDatabaseStatus {
  encrypted: bool,
  storage: &'static str,
}

struct WhatsAppProcess {
  child: Child,
  stdin: ChildStdin,
  stdout: BufReader<ChildStdout>,
  next_id: u64,
}

#[derive(Default)]
struct WhatsAppState(Mutex<Option<WhatsAppProcess>>);

fn whatsapp_executable(app: &AppHandle) -> Result<PathBuf, String> {
  if let Ok(path) = std::env::var("EDUPULSE_WHATSAPP_MCP_PATH") {
    return Ok(PathBuf::from(path));
  }
  let resource_dir = app.path().resource_dir().map_err(|error| format!("Unable to resolve WhatsApp MCP resources: {error}"))?;
  #[cfg(target_os = "windows")]
  {
    let direct = resource_dir.join("whatsapp-mcp-server.exe");
    return Ok(if direct.exists() { direct } else { resource_dir.join("binaries/whatsapp-mcp-server.exe") });
  }
  #[cfg(not(target_os = "windows"))]
  {
    let direct = resource_dir.join("whatsapp-mcp-server");
    Ok(if direct.exists() { direct } else { resource_dir.join("binaries/whatsapp-mcp-server") })
  }
}

fn start_whatsapp_process(app: &AppHandle) -> Result<WhatsAppProcess, String> {
  let executable = whatsapp_executable(app)?;
  let mut child = Command::new(&executable).stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::null()).spawn()
    .map_err(|error| format!("Unable to start the bundled WhatsApp bridge at {}: {error}", executable.display()))?;
  let stdin = child.stdin.take().ok_or_else(|| "WhatsApp bridge stdin is unavailable.".to_string())?;
  let stdout = child.stdout.take().ok_or_else(|| "WhatsApp bridge stdout is unavailable.".to_string())?;
  Ok(WhatsAppProcess { child, stdin, stdout: BufReader::new(stdout), next_id: 1 })
}

impl WhatsAppProcess {
  fn call(&mut self, method: &str, params: Value) -> Result<Value, String> {
    if self.child.try_wait().map_err(|error| error.to_string())?.is_some() { return Err("The local WhatsApp bridge has stopped. Restart EduPulse and try again.".to_string()); }
    let id = self.next_id;
    self.next_id += 1;
    writeln!(self.stdin, "{}", json!({ "jsonrpc": "2.0", "id": id, "method": method, "params": params })).map_err(|error| format!("Unable to send a request to the WhatsApp bridge: {error}"))?;
    self.stdin.flush().map_err(|error| format!("Unable to flush the WhatsApp bridge request: {error}"))?;
    let mut line = String::new();
    loop {
      line.clear();
      if self.stdout.read_line(&mut line).map_err(|error| format!("Unable to read the WhatsApp bridge response: {error}"))? == 0 { return Err("The WhatsApp bridge closed its output.".to_string()); }
      let response: Value = serde_json::from_str(line.trim()).map_err(|error| format!("Invalid JSON from the WhatsApp bridge: {error}"))?;
      if response.get("id").and_then(Value::as_u64) != Some(id) { continue; }
      if let Some(error) = response.get("error") { return Err(error.to_string()); }
      return Ok(response.get("result").cloned().unwrap_or(Value::Null));
    }
  }

  fn initialize(&mut self) -> Result<(), String> {
    self.call("initialize", json!({ "protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": { "name": "EduPulse", "version": "1.0.0" } }))?;
    writeln!(self.stdin, "{}", json!({ "jsonrpc": "2.0", "method": "notifications/initialized" })).map_err(|error| error.to_string())?;
    self.stdin.flush().map_err(|error| error.to_string())?;
    Ok(())
  }
}

fn with_whatsapp_process<T>(app: &AppHandle, state: &WhatsAppState, operation: impl FnOnce(&mut WhatsAppProcess) -> Result<T, String>) -> Result<T, String> {
  let mut slot = state.0.lock().map_err(|_| "WhatsApp bridge lock is unavailable.".to_string())?;
  if slot.is_none() { let mut process = start_whatsapp_process(app)?; process.initialize()?; *slot = Some(process); }
  operation(slot.as_mut().expect("WhatsApp process initialized"))
}

#[tauri::command]
fn whatsapp_auth_status(app: AppHandle, state: State<'_, WhatsAppState>) -> Result<Value, String> {
  with_whatsapp_process(&app, &state, |process| process.call("tools/call", json!({ "name": "get_auth_status", "arguments": {} })))
}

#[tauri::command]
fn whatsapp_send_message(app: AppHandle, state: State<'_, WhatsAppState>, phone_number: String, text: String) -> Result<Value, String> {
  let normalized = phone_number.trim().replace([' ', '-', '(', ')'], "");
  if normalized.len() < 8 || normalized.len() > 20 || !normalized.chars().all(|character| character.is_ascii_digit() || character == '+') { return Err("The guardian phone number is not valid.".to_string()); }
  if text.trim().is_empty() || text.len() > 4000 { return Err("The WhatsApp message must contain between 1 and 4000 characters.".to_string()); }
  with_whatsapp_process(&app, &state, |process| process.call("tools/call", json!({ "name": "send_message", "arguments": { "phone_number": normalized, "text": text } })))
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
      );
      CREATE TABLE IF NOT EXISTS local_support_evaluations (
        id TEXT PRIMARY KEY NOT NULL,
        institution_id TEXT NOT NULL,
        learner_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_by_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        review_status TEXT NOT NULL DEFAULT 'draft'
      );
      CREATE INDEX IF NOT EXISTS idx_local_support_eval_learner ON local_support_evaluations(institution_id, learner_id, created_at);",
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

fn local_session_identity(connection: &Connection, session_token: &str) -> Result<(i64, String), String> {
  connection.query_row("SELECT u.id, u.institution_id FROM local_sessions s INNER JOIN local_users u ON u.id=s.user_id WHERE s.token_hash=?1 AND s.revoked_at IS NULL AND s.expires_at>?2 AND u.active=1", params![token_hash(session_token), now_epoch()], |row| Ok((row.get(0)?, row.get(1)?))).map_err(|_| "The local session is invalid or expired.".to_string())
}

#[tauri::command]
fn local_support_evaluation_save(app: AppHandle, session_token: String, learner_id: String, payload: String, review_status: Option<String>) -> Result<String, String> {
  if learner_id.trim().is_empty() || learner_id.len() > 64 || payload.len() > 50_000 { return Err("The local evaluation payload is invalid.".to_string()); }
  let connection = open_encrypted_database(&app)?;
  ensure_auth_schema(&connection)?;
  let (user_id, institution_id) = local_session_identity(&connection, &session_token)?;
  let status = review_status.unwrap_or_else(|| "draft".to_string());
  if !["draft", "reviewed", "shared"].contains(&status.as_str()) { return Err("Invalid local evaluation review status.".to_string()); }
  let id = format!("local_support_{}", &token_hash(&format!("{}{}{}", learner_id, user_id, now_epoch()))[..24]);
  connection.execute("INSERT INTO local_support_evaluations(id,institution_id,learner_id,payload,created_by_id,created_at,review_status) VALUES(?1,?2,?3,?4,?5,?6,?7)", params![id, institution_id, learner_id.trim(), payload, user_id, now_epoch(), status]).map_err(|error| format!("Unable to save encrypted local evaluation: {error}"))?;
  connection.execute("INSERT INTO local_audit_events(id,user_id,action,created_at,metadata) VALUES(?1,?2,'local.support_evaluation_saved',?3,?4)", params![audit_id(), user_id, now_epoch(), format!("{{\"evaluation_id\":\"{}\",\"learner_id\":\"{}\"}}", id, learner_id.trim())]).map_err(|error| error.to_string())?;
  Ok(id)
}

#[tauri::command]
fn local_support_evaluation_load(app: AppHandle, session_token: String, learner_id: Option<String>) -> Result<Vec<Value>, String> {
  let connection = open_encrypted_database(&app)?;
  ensure_auth_schema(&connection)?;
  let (_user_id, institution_id) = local_session_identity(&connection, &session_token)?;
  let mut output = Vec::new();
  if let Some(learner_id) = learner_id {
    let mut statement = connection.prepare("SELECT id, learner_id, payload, created_at, review_status FROM local_support_evaluations WHERE institution_id=?1 AND learner_id=?2 ORDER BY created_at DESC LIMIT 50").map_err(|error| error.to_string())?;
    let rows = statement.query_map(params![institution_id, learner_id], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?, row.get::<_, i64>(3)?, row.get::<_, String>(4)?))).map_err(|error| error.to_string())?;
    for row in rows { let (id, learner, payload, created_at, review_status) = row.map_err(|error| error.to_string())?; output.push(json!({"id": id, "learner_id": learner, "payload": serde_json::from_str::<Value>(&payload).unwrap_or(Value::String(payload)), "created_at": created_at, "review_status": review_status})); }
  }
  Ok(output)
}

#[derive(Debug, Serialize)]
struct LocalAuthUser {
  id: i64,
  institution_id: String,
  first_name: String,
  family_name: String,
  email: String,
  designation: String,
  role: String,
}

#[derive(Debug, serde::Deserialize)]
struct OwnerRegistration {
  first_name: String,
  family_name: String,
  birthplace: String,
  date_of_birth: String,
  sex: String,
  institution_name: String,
  designation: String,
  email: String,
  password: String,
}

fn now_epoch() -> i64 { SystemTime::now().duration_since(UNIX_EPOCH).map(|duration| duration.as_secs() as i64).unwrap_or_default() }
fn normalized_email(value: &str) -> String { value.trim().to_lowercase() }
fn token_hash(value: &str) -> String { let mut digest = Sha256::new(); digest.update(value.as_bytes()); format!("{:x}", digest.finalize()) }
fn audit_id() -> String { let mut bytes = [0_u8; 12]; rand::rng().fill_bytes(&mut bytes); format!("audit_{}", bytes.iter().map(|byte| format!("{byte:02x}")).collect::<String>()) }
fn validate_owner(input: &OwnerRegistration) -> Result<(), String> {
  for (label, value) in [("first name", &input.first_name), ("family name", &input.family_name), ("birthplace", &input.birthplace), ("date of birth", &input.date_of_birth), ("sex", &input.sex), ("institution name", &input.institution_name), ("designation", &input.designation), ("email", &input.email), ("password", &input.password)] {
    if value.trim().is_empty() { return Err(format!("The {label} field is required.")); }
  }
  if !input.email.contains('@') { return Err("Enter a valid email address.".to_string()); }
  if input.password.len() < 10 || !input.password.chars().any(|c| c.is_ascii_uppercase()) || !input.password.chars().any(|c| c.is_ascii_lowercase()) || !input.password.chars().any(|c| c.is_ascii_digit()) { return Err("Password must contain at least 10 characters, including uppercase, lowercase, and a number.".to_string()); }
  Ok(())
}

fn ensure_auth_schema(connection: &Connection) -> Result<(), String> {
  connection.execute_batch("CREATE TABLE IF NOT EXISTS local_institutions (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS local_users (id INTEGER PRIMARY KEY AUTOINCREMENT, institution_id TEXT NOT NULL, first_name TEXT NOT NULL, family_name TEXT NOT NULL, birthplace TEXT NOT NULL, date_of_birth TEXT NOT NULL, sex TEXT NOT NULL, designation TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, FOREIGN KEY(institution_id) REFERENCES local_institutions(id)); CREATE TABLE IF NOT EXISTS local_sessions (id TEXT PRIMARY KEY NOT NULL, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, last_seen_at INTEGER NOT NULL, revoked_at INTEGER, FOREIGN KEY(user_id) REFERENCES local_users(id)); CREATE TABLE IF NOT EXISTS local_audit_events (id TEXT PRIMARY KEY NOT NULL, user_id INTEGER, action TEXT NOT NULL, created_at INTEGER NOT NULL, metadata TEXT NOT NULL); CREATE INDEX IF NOT EXISTS idx_local_sessions_token ON local_sessions(token_hash); CREATE INDEX IF NOT EXISTS idx_local_users_email ON local_users(email);").map_err(|error| format!("Unable to prepare local authentication schema: {error}"))
}

fn auth_user_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<LocalAuthUser> { Ok(LocalAuthUser { id: row.get(0)?, institution_id: row.get(1)?, first_name: row.get(2)?, family_name: row.get(3)?, email: row.get(4)?, designation: row.get(5)?, role: row.get(6)? }) }
fn issue_local_session(connection: &Connection, user_id: i64) -> Result<String, String> { let mut bytes = [0_u8; 32]; rand::rng().fill_bytes(&mut bytes); let raw = bytes.iter().map(|byte| format!("{byte:02x}")).collect::<String>(); connection.execute("INSERT INTO local_sessions (id,user_id,token_hash,expires_at,last_seen_at) VALUES (?1,?2,?3,?4,?5)", params![format!("session_{}", &raw[..16]), user_id, token_hash(&raw), now_epoch() + 60 * 60 * 12, now_epoch()]).map_err(|error| format!("Unable to create local session: {error}"))?; Ok(raw) }

#[tauri::command]
fn local_auth_status(app: AppHandle) -> Result<bool, String> { let connection = open_encrypted_database(&app)?; ensure_auth_schema(&connection)?; connection.query_row("SELECT EXISTS(SELECT 1 FROM local_users WHERE role = 'owner' AND active = 1)", [], |row| row.get(0)).map_err(|error| format!("Unable to read local authentication status: {error}")) }

#[tauri::command]
fn local_register_owner(app: AppHandle, input: OwnerRegistration) -> Result<LocalAuthUser, String> { validate_owner(&input)?; let connection = open_encrypted_database(&app)?; ensure_auth_schema(&connection)?; let exists: bool = connection.query_row("SELECT EXISTS(SELECT 1 FROM local_users WHERE role = 'owner' AND active = 1)", [], |row| row.get(0)).map_err(|error| error.to_string())?; if exists { return Err("A school manager account already exists on this computer.".to_string()); } let email = normalized_email(&input.email); let salt = SaltString::generate(&mut rand::rng()); let password_hash = Argon2::default().hash_password(input.password.as_bytes(), &salt).map_err(|error| format!("Unable to hash the local password: {error}"))?.to_string(); let institution_id = format!("local_inst_{}", &token_hash(&format!("{}{}", input.institution_name, now_epoch()))[..16]); let transaction = connection.unchecked_transaction().map_err(|error| error.to_string())?; transaction.execute("INSERT INTO local_institutions (id,name,created_at) VALUES (?1,?2,?3)", params![institution_id, input.institution_name.trim(), now_epoch()]).map_err(|error| format!("Unable to create local institution: {error}"))?; transaction.execute("INSERT INTO local_users (institution_id,first_name,family_name,birthplace,date_of_birth,sex,designation,email,password_hash,role,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'owner',?10)", params![institution_id, input.first_name.trim(), input.family_name.trim(), input.birthplace.trim(), input.date_of_birth.trim(), input.sex.trim(), input.designation.trim(), email, password_hash, now_epoch()]).map_err(|error| format!("Unable to create local owner account: {error}"))?; let user_id = transaction.last_insert_rowid(); transaction.execute("INSERT INTO local_audit_events (id,user_id,action,created_at,metadata) VALUES (?1,?2,'local.owner_registered',?3,?4)", params![audit_id(), user_id, now_epoch(), "{}"] ).map_err(|error| error.to_string())?; transaction.commit().map_err(|error| error.to_string())?; connection.query_row("SELECT id,institution_id,first_name,family_name,email,designation,role FROM local_users WHERE id=?1", params![user_id], auth_user_from_row).map_err(|error| error.to_string()) }

#[tauri::command]
fn local_login(app: AppHandle, email: String, password: String) -> Result<(LocalAuthUser, String), String> { let connection = open_encrypted_database(&app)?; ensure_auth_schema(&connection)?; let email = normalized_email(&email); let result = connection.query_row("SELECT id,institution_id,first_name,family_name,email,password_hash,designation,role FROM local_users WHERE email=?1 AND active=1", params![email], |row| { Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?, row.get::<_, String>(3)?, row.get::<_, String>(4)?, row.get::<_, String>(5)?, row.get::<_, String>(6)?, row.get::<_, String>(7)?)) }); let (id, institution_id, first_name, family_name, email, stored_hash, designation, role) = result.map_err(|_| "Email or password is incorrect.".to_string())?; let parsed = PasswordHash::new(&stored_hash).map_err(|_| "The local password record is invalid.".to_string())?; Argon2::default().verify_password(password.as_bytes(), &parsed).map_err(|_| "Email or password is incorrect.".to_string())?; let session = issue_local_session(&connection, id)?; connection.execute("INSERT INTO local_audit_events (id,user_id,action,created_at,metadata) VALUES (?1,?2,'local.login',?3,?4)", params![audit_id(), id, now_epoch(), "{}"] ).map_err(|error| error.to_string())?; Ok((LocalAuthUser { id, institution_id, first_name, family_name, email, designation, role }, session)) }

#[tauri::command]
fn local_logout(app: AppHandle, session_token: String) -> Result<(), String> { let connection = open_encrypted_database(&app)?; ensure_auth_schema(&connection)?; connection.execute("UPDATE local_sessions SET revoked_at=?1 WHERE token_hash=?2 AND revoked_at IS NULL", params![now_epoch(), token_hash(&session_token)]).map_err(|error| format!("Unable to close local session: {error}"))?; Ok(()) }

fn main() {
  tauri::Builder::default()
    .manage(WhatsAppState::default())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      local_database_status,
      local_database_load,
      local_database_save,
      whatsapp_auth_status,
      whatsapp_send_message,
      local_auth_status,
      local_register_owner,
      local_login,
      local_logout,
      local_support_evaluation_save,
      local_support_evaluation_load
    ])
    .run(tauri::generate_context!())
    .expect("error while running EduPulse desktop");
}
