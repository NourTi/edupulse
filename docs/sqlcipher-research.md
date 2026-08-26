# SQLCipher integration research

## Verified references

- Rusqlite feature metadata: https://docs.rs/crate/rusqlite/latest/features
  - `bundled-sqlcipher` enables the SQLCipher build through `libsqlite3-sys`.
  - `bundled-sqlcipher-vendored-openssl` adds a vendored OpenSSL crypto provider.
  - `bundled-windows` is a separate SQLite bundling feature, so Windows support must be validated on a Windows runner rather than assumed from a Linux build.

- Keyring crate: https://docs.rs/crate/keyring/latest
  - The crate provides a cross-platform API for native secure stores on Windows, macOS, and Unix-like systems.
  - The Windows backend uses the Windows Credential Manager through the keyring ecosystem.

## Design implication

The desktop runtime should store the SQLCipher key in the OS keyring, never in the SQLite file, browser localStorage, source code, or a committed configuration file. The native Windows build must be validated in the existing Windows GitHub Actions runner because this Linux sandbox does not have Rust/Windows tooling. Browser mode should keep its existing IndexedDB path and must not claim SQLCipher protection.
