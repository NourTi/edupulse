/** Safe desktop bridge: all calls fall back cleanly when EduPulse runs in a browser. */
export function isDesktopRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function saveDesktopBackup(filename: string, payload: unknown) {
  if (!isDesktopRuntime()) return false;
  const [{ save }, { writeTextFile }] = await Promise.all([
    import("@tauri-apps/plugin-dialog"),
    import("@tauri-apps/plugin-fs"),
  ]);
  const target = await save({
    defaultPath: filename,
    filters: [{ name: "EduPulse backup", extensions: ["json"] }],
  });
  if (!target) return false;
  await writeTextFile(target, JSON.stringify(payload, null, 2));
  return true;
}
