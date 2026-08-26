import { describe, expect, it, vi } from "vitest";

const record = {
  id: "crm_record_1",
  institutionId: "inst_test",
  learnerId: "learner_1",
  category: "essay" as const,
  title: "Draft review",
  summary: "Review the second draft.",
  stage: "review",
  score: null,
  createdById: 7,
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
};

const updateEducatorRecord = vi.fn(async (_institutionId: string, recordId: string) => recordId === record.id ? { ...record, title: "Updated draft" } : undefined);
const archiveEducatorRecord = vi.fn(async (_institutionId: string, recordId: string) => recordId === record.id ? { ...record, archivedAt: new Date() } : undefined);
const writeAuditLog = vi.fn(async () => undefined);

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getUserMemberships: vi.fn(async () => [{ membership: { institutionId: "inst_test", role: "teacher", status: "active" } }]),
    getMembership: vi.fn(async (_userId: number, institutionId: string) => institutionId === "inst_test" ? ({ institutionId, role: "teacher", status: "active" }) : undefined),
    getLearner: vi.fn(async (_institutionId: string, learnerId: string) => learnerId === "learner_1" ? ({ id: learnerId }) : undefined),
    updateEducatorRecord,
    archiveEducatorRecord,
    writeAuditLog,
  };
});

const { appRouter } = await import("./routers");
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return {
    user: { id: 7, openId: "crm-success-test", email: "teacher@example.edu", name: "Teacher", loginMethod: "test", role: "user", status: "active", passwordHash: null, mustChangePassword: false, passwordChangedAt: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("educator CRM record success paths", () => {
  it("updates an existing record within the member institution", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.records.updateEducatorRecord({ recordId: record.id, learnerId: record.learnerId, title: "Updated draft", summary: record.summary, stage: record.stage });
    expect(result.title).toBe("Updated draft");
    expect(updateEducatorRecord).toHaveBeenCalledWith("inst_test", record.id, expect.objectContaining({ learnerId: "learner_1", title: "Updated draft" }));
    expect(writeAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "educator_record.updated", institutionId: "inst_test" }));
  });

  it("archives an existing record and writes an audit entry", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.records.archiveEducatorRecord({ recordId: record.id });
    expect(result.archivedAt).toBeInstanceOf(Date);
    expect(archiveEducatorRecord).toHaveBeenCalledWith("inst_test", record.id);
    expect(writeAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "educator_record.archived", institutionId: "inst_test" }));
  });

  it("rejects a record owned by another institution", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.records.updateEducatorRecord({ institutionId: "inst_other", recordId: record.id, title: "Cross-tenant edit" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.records.archiveEducatorRecord({ institutionId: "inst_other", recordId: record.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects a missing learner link before updating", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.records.updateEducatorRecord({ recordId: record.id, learnerId: "learner_missing", title: "Invalid link" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns not-found for missing record edits and archives", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.records.updateEducatorRecord({ recordId: "crm_missing", title: "Missing" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller.records.archiveEducatorRecord({ recordId: "crm_missing" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid record input before persistence", async () => {
    updateEducatorRecord.mockClear();
    const caller = appRouter.createCaller(context());
    await expect(caller.records.updateEducatorRecord({ recordId: record.id, title: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(updateEducatorRecord).not.toHaveBeenCalledWith("inst_test", record.id, expect.anything());
  });
});

export { updateEducatorRecord, archiveEducatorRecord };

