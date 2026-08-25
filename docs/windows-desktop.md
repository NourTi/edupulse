# EduPulse for Windows

EduPulse now contains a **Tauri 2 desktop scaffold** aimed at Windows. The desktop package retains the existing Arabic-first interface, local browser-record workflows, local search, and export capability. It is configured to produce an NSIS Windows installer once built on a Windows computer.

## What Works Offline

The learner record workspace, registration, CEFR view, subjects, attendance interactions, payments, printable receipts, and local record search remain usable without the internet. Browser preview mode uses IndexedDB. In the Tauri desktop runtime, the same workspace record persists in the bundled SQLite database in the user’s application-data directory.

## What Needs a Connection

The grounded knowledge agent, administrator sign-in, source ingestion, and citation-backed answers use the managed EduPulse server. The desktop client must show an offline state for those functions rather than inventing answers.

## Building on Windows

Install Rust and the Microsoft C++ Build Tools, then run:

```powershell
pnpm install
pnpm tauri:build
```

The Windows installer is emitted by Tauri under `src-tauri/target/release/bundle/nsis/`. The current configuration selects NSIS with the WebView2 download bootstrapper. An MSI package must be built on Windows.

## Local Data and Backup

The desktop bridge lets the user choose where to save an EduPulse JSON backup. Do not place the live database on a shared network drive; use the built-in export/import workflow for transfer and backups. The starter SQLite store is local at rest; OS-level disk encryption or a later SQLCipher/keychain layer is required before claiming application-level encrypted storage.


## Reproducible Windows packaging

The repository includes `.github/workflows/windows-desktop.yml`. A Windows runner installs Node 22 and pnpm, runs the unit tests and type check, then executes `pnpm run tauri:build` to produce NSIS `.exe` and MSI artifacts. The workflow uploads artifacts for manual download and publishes them to a GitHub Release when triggered by a version tag such as `v0.1.0`.

The current sandbox can validate the frontend and server build but cannot create a native Windows installer. Build the installer either on Windows with Rust and WebView2 installed or through the Windows GitHub Actions workflow. Do not place the local SQLite file in the repository or on a shared network drive; keep it in the per-user application-data directory and export backups through the desktop bridge.
