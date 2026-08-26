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
    const result = await caller.knowledge.askPublic({ question: "thank you very much" });
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain("welcome");
  });

  it("answers public enrolment requests without treating them as a private-record request", async () => {
    const caller = appRouter.createCaller(context(null));
    const result = await caller.knowledge.askPublic({ question: "I want to sign my son" });
    expect(result.answer).toContain("enrolment");
    expect(result.answer).not.toContain("cannot access");
    expect(result.sources[0]?.id).toBe("platform_profile");
  });

  it("answers platform questions for visitors with an approved profile citation", async () => {
    const caller = appRouter.createCaller(context(null));
    const about = await caller.knowledge.askPublic({ question: "What is EduPulse?" });
    const creator = await caller.knowledge.askPublic({ question: "Who created EduPulse?" });
    expect(about.answer).toContain("Arabic-first");
    expect(about.sources[0]?.id).toBe("platform_profile");
    expect(creator.answer).toContain("created by");
    expect(creator.sources[0]?.id).toBe("platform_profile");
  });

  it("refuses individual student-record requests without querying a private record", async () => {
    const caller = appRouter.createCaller(context(null));
    const result = await caller.knowledge.askPublic({ question: "ما هي درجات ابني؟" });
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain("خصوصية الطلاب");
  });
});
