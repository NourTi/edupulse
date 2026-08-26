import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function context(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: 9,
      openId: `test-${role}`,
      email: "test@example.edu",
      name: "Test user",
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("knowledge router boundaries", () => {
  it("rejects non-administrators before they can list or ingest sources", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.knowledge.listSources()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.knowledge.ingestText({ title: "School handbook", content: "A".repeat(80), visibility: "public", mimeType: "text/plain" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("answers a visitor’s conversational thanks without institution sign-in or retrieval", async () => {
    const caller = appRouter.createCaller(context(null));
    const result = await caller.knowledge.askPublic({ question: "thank you" });
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain("welcome");
  });

  it("refuses individual student-record requests without querying a private record", async () => {
    const caller = appRouter.createCaller(context(null));
    const result = await caller.knowledge.askPublic({ question: "ما هي درجات ابني؟" });
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain("خصوصية الطلاب");
  });
});
