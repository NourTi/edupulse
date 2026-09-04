import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portalSource = readFileSync(new URL("../client/src/components/AccountPortal.tsx", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../client/src/main.tsx", import.meta.url), "utf8");

describe("Descope provider boundary", () => {
  it("guards the Descope widget when the public project id is absent", () => {
    expect(portalSource).toContain('const descopeProjectId = import.meta.env.VITE_DESCOPE_PROJECT_ID?.trim() ?? "";');
    expect(portalSource).toContain('{mode === "login" && <>{descopeProjectId && <>');
  });

  it("wraps the application with AuthProvider only when a project id exists", () => {
    expect(mainSource).toContain('const descopeProjectId = import.meta.env.VITE_DESCOPE_PROJECT_ID?.trim() ?? "";');
    expect(mainSource).toContain("descopeProjectId ? <AuthProvider projectId={descopeProjectId}>");
  });
});
