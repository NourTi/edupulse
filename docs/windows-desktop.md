# EduPulse for Windows

EduPulse now contains a **Tauri 2 desktop scaffold** aimed at Windows. The desktop package retains the existing Arabic-first interface, local browser-record workflows, local search, and export capability. It is configured to produce an NSIS Windows installer once built on a Windows computer.

## What Works Offline

The learner record workspace, registration, CEFR view, subjects, attendance interactions, payments, printable receipts, and local record search remain usable without the internet. Browser preview mode uses IndexedDB. In the Tauri desktop runtime, the workspace record persists in a local SQLCipher database in the user’s application-data directory.

## What Needs a Connection

The grounded knowledge agent, administrator sign-in, source ingestion, and citation-backed answers use the managed EduPulse server. The desktop client must show an offline state for those functions rather than inventing answers.

## Building on Windows

Use a Windows 10 or Windows 11 computer for the **developer build only**. The developer must install **Git for Windows**, **Node.js 22**, **pnpm**, the **Rust stable toolchain**, and **Microsoft C++ Build Tools** with the Desktop development with C++ workload. The installer is configured with Tauri’s `offlineInstaller` WebView2 mode, so it bundles the WebView2 installer instead of requiring the end user to download it during setup. This adds roughly 127 MB to the installer.

**End users do not install Git, Node.js, pnpm, Rust, or the source repository.** They download the finished `EduPulse_1.0.0_x64-setup.exe`, run it, and use EduPulse like a normal Windows application. The application bundle contains the compiled EduPulse frontend, the compiled native desktop shell, and the offline WebView2 installer. The developer commands below are never part of the end-user process.

From PowerShell, run:

```powershell
git clone https://github.com/NourTi/edupulse.git
cd edupulse
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm run desktop:web-build
pnpm run tauri:build
```

The installer is emitted under `src-tauri\\target\\release\\bundle\\nsis\\`, normally as `EduPulse_1.0.0_x64-setup.exe`. Copy that `.exe` to a separate folder before sharing it. This build is unsigned, so Windows SmartScreen may display a warning; choose **More info → Run anyway** only when you trust the file and its source. Do not distribute a public release until an Authenticode certificate is configured.

After installation, verify first launch, create one local record, close and reopen EduPulse, confirm the record remains, export a backup, and test that the grounded policy assistant clearly reports offline state when the network is unavailable. The live database remains in the per-user application-data directory and must not be copied from the installation folder.

## Local Data and Backup

The desktop bridge lets the user choose where to save an EduPulse JSON backup. The live desktop database is SQLCipher-encrypted. Its randomly generated key is stored in the operating system credential manager, not in the database file, browser storage, source code, or a backup export. On Windows this uses the native Windows credential store through the Rust keyring integration. Do not place the live database on a shared network drive; use the built-in export/import workflow for transfer and backups. Browser preview mode continues to use IndexedDB and does not claim SQLCipher protection.


## Reproducible Windows packaging

The repository includes `.github/workflows/windows-desktop.yml`. A Windows runner installs the developer toolchain, runs the unit tests and type check, then executes `pnpm run tauri:build` to produce an NSIS `.exe` containing the compiled application and offline WebView2 installer. The workflow runs on pushes to `main`, manual dispatches, and version tags. For a normal commit, open the repository’s **Actions → Windows desktop build → latest successful run → Artifacts → edupulse-windows-installer** and download the ZIP containing the installer. For a version tag such as `v0.1.0`, the workflow also attaches the `.exe` and `.msi` files to a GitHub Release.

CI artifacts are currently **unsigned**. They are suitable for controlled testing, but Windows SmartScreen may warn users. A public production release should add an Authenticode certificate and signing secret to the GitHub repository, then sign the installer before publishing it. Never commit the certificate or private key.

The current sandbox can validate the frontend and server build but cannot create a native Windows installer or validate the native SQLCipher build. The final `.exe` must still be produced by the Windows runner or a Windows developer machine; once produced, the end user needs only the installer. Build and test the installer on Windows with Rust and WebView2 installed or through the Windows GitHub Actions workflow. The workflow must be the final authority for Windows SQLCipher compilation. Do not place the local encrypted database in the repository or on a shared network drive; keep it in the per-user application-data directory and export backups through the desktop bridge.
