import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: 9,
      openId: `crm-test-${role}`,
      email: "crm-test@example.edu",
      name: "CRM test user",
      loginMethod: "test",
      role,
      status: "active",
      passwordHash: null,
      mustChangePassword: false,
      passwordChangedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("educator CRM task boundaries", () => {
  it("rejects an unaffiliated user before task access", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.records.educatorTasks()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects anonymous task creation", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.records.createEducatorTask({ title: "Follow up" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unaffiliated access to educator records", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.records.educatorRecords()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects anonymous educator record creation", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.records.createEducatorRecord({ category: "essay", title: "Draft", summary: "Needs review" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
