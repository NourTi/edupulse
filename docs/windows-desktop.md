# EduPulse for Windows

EduPulse now contains a **Tauri 2 desktop scaffold** aimed at Windows. The desktop package retains the existing Arabic-first interface, local browser-record workflows, local search, and export capability. It is configured to produce an NSIS Windows installer once built on a Windows computer.

## What Works Offline

The learner record workspace, registration, CEFR view, subjects, attendance interactions, payments, printable receipts, and local record search remain usable without the internet. Browser preview mode uses IndexedDB. In the Tauri desktop runtime, the workspace record persists in a local SQLCipher database in the user’s application-data directory.

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

The desktop bridge lets the user choose where to save an EduPulse JSON backup. The live desktop database is SQLCipher-encrypted. Its randomly generated key is stored in the operating system credential manager, not in the database file, browser storage, source code, or a backup export. On Windows this uses the native Windows credential store through the Rust keyring integration. Do not place the live database on a shared network drive; use the built-in export/import workflow for transfer and backups. Browser preview mode continues to use IndexedDB and does not claim SQLCipher protection.


## Reproducible Windows packaging

The repository includes `.github/workflows/windows-desktop.yml`. A Windows runner installs Node 22 and pnpm, runs the unit tests and type check, then executes `pnpm run tauri:build` to produce NSIS `.exe` and MSI artifacts. The workflow runs on pushes to `main`, manual dispatches, and version tags. For a normal commit, open the repository’s **Actions → Windows desktop build → latest successful run → Artifacts → edupulse-windows-installer** and download the ZIP containing the installer. For a version tag such as `v0.1.0`, the workflow also attaches the `.exe` and `.msi` files to a GitHub Release.

CI artifacts are currently **unsigned**. They are suitable for controlled testing, but Windows SmartScreen may warn users. A public production release should add an Authenticode certificate and signing secret to the GitHub repository, then sign the installer before publishing it. Never commit the certificate or private key.

The current sandbox can validate the frontend and server build but cannot create a native Windows installer or validate the native SQLCipher build. Build and test the installer on Windows with Rust and WebView2 installed or through the Windows GitHub Actions workflow. The workflow must be the final authority for Windows SQLCipher compilation. Do not place the local encrypted database in the repository or on a shared network drive; keep it in the per-user application-data directory and export backups through the desktop bridge.
