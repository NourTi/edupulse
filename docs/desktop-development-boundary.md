# EduPulse Desktop Development Boundary

## What is implemented in the project

EduPulse’s Tauri 2 desktop scaffold, SQLCipher initialization, local authentication commands, encrypted local workspace persistence, WhatsApp bridge boundary, and local support-evaluation save/load commands are implemented in the project. The React application includes a browser-safe bridge that invokes the native commands only when the Tauri runtime is present.

## What does not require the user’s computer

Source-code changes, Rust command design, SQLCipher schema and queries, IPC contracts, React UI, server procedures, unit tests, TypeScript checks, production builds, and browser verification can all be developed and checked in the managed EduPulse project.

## What requires Windows tooling

Only native compilation and runtime verification require a Windows environment: Cargo with the Windows target, WebView2 behavior, Windows keyring behavior, SQLCipher dynamic-link/runtime loading, installer launch, and SmartScreen/signing behavior. This is a validation boundary, not a requirement to access the user’s computer for continued coding.

## Playwright boundary

Playwright can verify the web UI and browser-facing flows. It cannot launch or validate a native Windows `.exe`, Windows WebView2 runtime, Windows keyring, or signed installer. Those checks belong in the existing Windows GitHub Actions workflow or a local Windows build machine.
