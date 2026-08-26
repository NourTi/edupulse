# Tauri Windows WebView2 Packaging Note

Source: https://v2.tauri.app/distribute/windows-installer/
Title: Tauri 2 Windows Installer

The official Tauri 2 documentation lists four WebView2 installation modes: `downloadBootstrapper` (requires internet and adds approximately 0 MB), `embedBootstrapper` (requires internet and adds approximately 1.8 MB), `offlineInstaller` (does not require internet and adds approximately 127 MB), and `fixedVersion` (does not require internet and adds approximately 180 MB). EduPulse uses `offlineInstaller` because the desired end-user experience is one installer that includes the WebView2 installer. The documentation states that the compiled frontend and native shell are bundled by the Tauri installer; Git, Node.js, pnpm, Rust, and source cloning are developer build requirements, not end-user requirements.

The current EduPulse Windows artifact produced successfully from GitHub Actions is `EduPulse_1.0.0_x64-setup.exe`. It was uploaded by run `32982342052` from the corrected private-main commit and measured 224,192,077 bytes. The artifact is unsigned; Windows SmartScreen may warn until code signing is configured.
