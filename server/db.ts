import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { PoolOptions } from "mysql2";
import {
  auditLogs,
  authSessions,
  InsertUser,
  institutions,
  invitations,
  knowledgeChunks,
  knowledgeSources,
  memberships,
  learners,
  learnerUsers,
  learnerGuardians,
  attendanceRecords,
  cefrAssessments,
  paymentRecords,
  commerceProducts,
  commerceInvoices,
  educatorTasks,
  educatorRecords,
  passwordResetTokens,
  schoolSettings,
  users,
  userAuthAccounts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { calculateCommerceMetrics } from "./commerce/reporting";

let _db: ReturnType<typeof drizzle> | null = null;

export function databaseErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) return String((error as { code?: unknown }).code).slice(0, 80);
  if (error instanceof Error) return error.name;
  return "unknown_error";
}

export function databaseConnectionOptions(connectionUrl: string): PoolOptions {
  const parsed = new URL(connectionUrl);
  const hostname = parsed.hostname.toLowerCase();
  const sslRequested = process.env.DATABASE_SSL === "true" || parsed.searchParams.get("sslaccept") === "strict" || hostname.endsWith(".tidbcloud.com") || hostname.endsWith(".aivencloud.com");
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!parsed.hostname || !parsed.username || !database) throw new Error("DATABASE_URL must include a host, username, and database name.");
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    connectTimeout: 15_000,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
    ssl: sslRequested ? { minVersion: "TLSv1.2" } : undefined,
  };
}

export async function getDb() {
  if (_db) return _db;
  const connectionUrl = process.env.DATABASE_URL?.trim();
  if (!connectionUrl) {
    console.warn("[Database] DATABASE_URL is missing.");
    return null;
  }
  try {
    const options = databaseConnectionOptions(connectionUrl);
    console.log(`[Database] Configured for ${options.host}:${options.port}/${options.database}; TLS ${options.ssl ? "enabled" : "disabled"}.`);
    _db = drizzle({ connection: options });
  } catch (error) {
    console.warn(`[Database] Failed to initialize connection (${databaseErrorCode(error)}).`);
    _db = null;
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("OAuth user openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      const value = user[field] ?? null;
      values[field] = value;
      updateSet[field] = value;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserAuthAccount(provider: string, providerAccountId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ account: userAuthAccounts, user: users }).from(userAuthAccounts).innerJoin(users, eq(userAuthAccounts.userId, users.id)).where(and(eq(userAuthAccounts.provider, provider), eq(userAuthAccounts.providerAccountId, providerAccountId))).limit(1);
  return rows[0];
}

export async function createUserAuthAccount(input: typeof userAuthAccounts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(userAuthAccounts).values(input);
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createExternalUser(input: { name: string; email: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(users).values({ name: input.name, email: input.email, passwordHash: null, loginMethod: "google", role: "user", status: "active", mustChangePassword: false });
  return getUserById(Number(result[0].insertId));
}

export async function createPasswordUser(input: { name: string; email: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(users).values({
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    loginMethod: "password",
    role: "user",
    status: "active",
    mustChangePassword: false,
    passwordChangedAt: new Date(),
  });
  return getUserById(Number(result[0].insertId));
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.update(users).set({ passwordHash, passwordChangedAt: new Date(), mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function createAuthSession(input: typeof authSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Session storage is unavailable.");
  await db.insert(authSessions).values(input);
}

export async function getUserBySessionHash(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select({ user: users })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, tokenHash), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, new Date()), eq(users.status, "active")))
    .limit(1);
  return rows[0]?.user;
}

export async function revokeAuthSession(tokenHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.tokenHash, tokenHash));
}

export async function createPasswordResetToken(input: typeof passwordResetTokens.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Reset storage is unavailable.");
  await db.insert(passwordResetTokens).values(input);
}

export async function consumePasswordResetToken(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date()))).limit(1);
  const token = rows[0];
  if (!token) return undefined;
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, token.id));
  return token;
}

export async function createInstitution(input: typeof institutions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Institution storage is unavailable.");
  await db.insert(institutions).values(input);
  return db.select().from(institutions).where(eq(institutions.id, input.id)).limit(1).then(rows => rows[0]);
}

export async function getInstitution(institutionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(institutions).where(eq(institutions.id, institutionId)).limit(1);
  return rows[0];
}

export async function getMembership(userId: number, institutionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.institutionId, institutionId))).limit(1);
  return rows[0];
}

export async function getUserMemberships(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ membership: memberships, institution: institutions }).from(memberships).innerJoin(institutions, eq(memberships.institutionId, institutions.id)).where(and(eq(memberships.userId, userId), eq(memberships.status, "active"))).orderBy(desc(memberships.createdAt));
}

export async function createMembership(input: typeof memberships.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Membership storage is unavailable.");
  await db.insert(memberships).values(input);
}

export async function listInstitutionMembers(institutionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ user: users, membership: memberships }).from(memberships).innerJoin(users, eq(memberships.userId, users.id)).where(eq(memberships.institutionId, institutionId)).orderBy(desc(memberships.createdAt));
}

export async function createInvitation(input: typeof invitations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Invitation storage is unavailable.");
  await db.insert(invitations).values(input);
}

export async function getInvitationByHash(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(invitations).where(and(eq(invitations.tokenHash, tokenHash), isNull(invitations.acceptedAt), gt(invitations.expiresAt, new Date()))).limit(1);
  return rows[0];
}

export async function acceptInvitation(id: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, id));
}

export async function writeAuditLog(input: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(input);
}

export async function listAuditLogs(institutionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).where(eq(auditLogs.institutionId, institutionId)).orderBy(desc(auditLogs.createdAt)).limit(100);
}

export async function createKnowledgeSource(source: typeof knowledgeSources.$inferInsert, chunks: Array<typeof knowledgeChunks.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Knowledge storage is unavailable.");
  await db.transaction(async tx => {
    await tx.insert(knowledgeSources).values(source);
    if (chunks.length) await tx.insert(knowledgeChunks).values(chunks);
  });
}

export async function listKnowledgeSources(institutionId?: string) {
  const db = await getDb();
  if (!db) return [];
  const where = institutionId ? eq(knowledgeSources.institutionId, institutionId) : undefined;
  return db.select().from(knowledgeSources).where(where).orderBy(desc(knowledgeSources.createdAt));
}

export async function getPublicKnowledgeChunks(institutionId?: string) {
  const db = await getDb();
  if (!db) return [];
  // Visitors have no session to carry a tenant ID. The singleton school setting
  // is the explicit public-school mapping for this deployment; it is never a
  // wildcard across institutions. An explicit institutionId remains supported
  // for signed-in, institution-specific surfaces.
  const publicSettings = institutionId ? undefined : await getSchoolSettings();
  const resolvedInstitutionId = institutionId ?? publicSettings?.institutionId ?? undefined;
  const tenantFilter = resolvedInstitutionId ? eq(knowledgeSources.institutionId, resolvedInstitutionId) : isNull(knowledgeSources.institutionId);
  return db.select({ id: knowledgeChunks.id, sourceId: knowledgeSources.id, title: knowledgeSources.title, sourceUrl: knowledgeSources.sourceUrl, content: knowledgeChunks.content }).from(knowledgeChunks).innerJoin(knowledgeSources, eq(knowledgeChunks.sourceId, knowledgeSources.id)).where(and(eq(knowledgeSources.status, "ready"), eq(knowledgeSources.visibility, "public"), tenantFilter));
}

export async function getSchoolSettings(institutionId?: string) {
  const db = await getDb();
  if (!db) return undefined;
  const where = institutionId ? eq(schoolSettings.institutionId, institutionId) : eq(schoolSettings.id, 1);
  const rows = await db.select().from(schoolSettings).where(where).limit(1);
  return rows[0];
}

export async function upsertSchoolSettings(input: Omit<typeof schoolSettings.$inferInsert, "id">) {
  const db = await getDb();
  if (!db) throw new Error("School settings storage is unavailable.");
  await db.insert(schoolSettings).values({ ...input, id: 1 }).onDuplicateKeyUpdate({ set: { name: input.name, logoKey: input.logoKey ?? null, logoUrl: input.logoUrl ?? null, institutionId: input.institutionId ?? null, updatedById: input.updatedById, updatedAt: new Date() } });
  return getSchoolSettings(input.institutionId ?? undefined);
}

export async function createInvitedUser(input: { email: string; name?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const existing = await getUserByEmail(input.email);
  if (existing) return existing;
  const result = await db.insert(users).values({ email: input.email, name: input.name ?? null, loginMethod: "password", role: "user", status: "invited", mustChangePassword: true }).$returningId();
  const id = result[0]?.id;
  return id ? getUserById(id) : undefined;
}

export async function activateUser(input: { userId: number; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.update(users).set({ name: input.name, passwordHash: input.passwordHash, status: "active", mustChangePassword: false, passwordChangedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, input.userId));
}

export async function activateMembership(userId: number, institutionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Membership storage is unavailable.");
  await db.update(memberships).set({ status: "active", updatedAt: new Date() }).where(and(eq(memberships.userId, userId), eq(memberships.institutionId, institutionId)));
}

export async function createLearner(input: typeof learners.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(learners).values(input);
  return db.select().from(learners).where(eq(learners.id, input.id)).limit(1).then(rows => rows[0]);
}

export async function listLearners(institutionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(learners).where(eq(learners.institutionId, institutionId)).orderBy(desc(learners.createdAt));
}

export async function getLearner(institutionId: string, learnerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return db.select().from(learners).where(and(eq(learners.institutionId, institutionId), eq(learners.id, learnerId))).limit(1).then(rows => rows[0]);
}

export async function linkLearnerGuardian(input: typeof learnerGuardians.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(learnerGuardians).values(input);
}

export async function listGuardianLearners(institutionId: string, guardianUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ learner: learners, link: learnerGuardians }).from(learnerGuardians).innerJoin(learners, eq(learners.id, learnerGuardians.learnerId)).where(and(eq(learnerGuardians.institutionId, institutionId), eq(learnerGuardians.guardianUserId, guardianUserId), eq(learners.institutionId, institutionId)));
}

export async function createAttendance(input: typeof attendanceRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(attendanceRecords).values(input);
}

export async function listAttendance(institutionId: string, learnerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendanceRecords).where(and(eq(attendanceRecords.institutionId, institutionId), eq(attendanceRecords.learnerId, learnerId))).orderBy(desc(attendanceRecords.date));
}

export async function createCefrAssessment(input: typeof cefrAssessments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(cefrAssessments).values(input);
}

export async function listCefrAssessments(institutionId: string, learnerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cefrAssessments).where(and(eq(cefrAssessments.institutionId, institutionId), eq(cefrAssessments.learnerId, learnerId))).orderBy(desc(cefrAssessments.assessedAt));
}

export async function createEducatorTask(input: typeof educatorTasks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(educatorTasks).values(input);
  return db.select().from(educatorTasks).where(eq(educatorTasks.id, input.id)).limit(1).then(rows => rows[0]);
}

export async function listEducatorTasks(institutionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(educatorTasks).where(eq(educatorTasks.institutionId, institutionId)).orderBy(desc(educatorTasks.createdAt));
}

export async function completeEducatorTask(institutionId: string, taskId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const task = await db.select().from(educatorTasks).where(and(eq(educatorTasks.institutionId, institutionId), eq(educatorTasks.id, taskId))).limit(1).then(rows => rows[0]);
  if (!task) return undefined;
  await db.update(educatorTasks).set({ completedAt: new Date(), updatedAt: new Date() }).where(and(eq(educatorTasks.institutionId, institutionId), eq(educatorTasks.id, taskId)));
  return { ...task, completedAt: new Date() };
}

export async function createEducatorRecord(input: typeof educatorRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(educatorRecords).values(input);
  return db.select().from(educatorRecords).where(eq(educatorRecords.id, input.id)).limit(1).then(rows => rows[0]);
}

export async function listEducatorRecords(institutionId: string, category?: typeof educatorRecords.$inferSelect["category"]) {
  const db = await getDb();
  if (!db) return [];
  const categoryWhere = category ? eq(educatorRecords.category, category) : undefined;
  const where = categoryWhere ? and(eq(educatorRecords.institutionId, institutionId), categoryWhere, isNull(educatorRecords.archivedAt)) : and(eq(educatorRecords.institutionId, institutionId), isNull(educatorRecords.archivedAt));
  return db.select().from(educatorRecords).where(where).orderBy(desc(educatorRecords.createdAt));
}

export async function updateEducatorRecord(institutionId: string, recordId: string, input: Partial<Pick<typeof educatorRecords.$inferInsert, "title" | "summary" | "stage" | "score" | "learnerId">>) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const existing = await db.select().from(educatorRecords).where(and(eq(educatorRecords.institutionId, institutionId), eq(educatorRecords.id, recordId), isNull(educatorRecords.archivedAt))).limit(1).then(rows => rows[0]);
  if (!existing) return undefined;
  const changes = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
  await db.update(educatorRecords).set({ ...changes, updatedAt: new Date() }).where(and(eq(educatorRecords.institutionId, institutionId), eq(educatorRecords.id, recordId), isNull(educatorRecords.archivedAt)));
  return db.select().from(educatorRecords).where(and(eq(educatorRecords.institutionId, institutionId), eq(educatorRecords.id, recordId))).limit(1).then(rows => rows[0]);
}

export async function archiveEducatorRecord(institutionId: string, recordId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const existing = await db.select().from(educatorRecords).where(and(eq(educatorRecords.institutionId, institutionId), eq(educatorRecords.id, recordId), isNull(educatorRecords.archivedAt))).limit(1).then(rows => rows[0]);
  if (!existing) return undefined;
  const archivedAt = new Date();
  await db.update(educatorRecords).set({ archivedAt, updatedAt: archivedAt }).where(and(eq(educatorRecords.institutionId, institutionId), eq(educatorRecords.id, recordId), isNull(educatorRecords.archivedAt)));
  return { ...existing, archivedAt };
}

export async function createCommerceProduct(input: typeof commerceProducts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(commerceProducts).values(input);
  return db.select().from(commerceProducts).where(and(eq(commerceProducts.institutionId, input.institutionId), eq(commerceProducts.id, input.id))).limit(1).then(rows => rows[0]);
}

export async function listCommerceProducts(institutionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(commerceProducts).where(and(eq(commerceProducts.institutionId, institutionId), eq(commerceProducts.status, "active"))).orderBy(desc(commerceProducts.createdAt));
}

export async function createCommerceInvoice(input: typeof commerceInvoices.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const learner = await db.select({ id: learners.id }).from(learners).where(and(eq(learners.institutionId, input.institutionId), eq(learners.id, input.learnerId))).limit(1);
  if (!learner[0]) throw new Error("Learner does not belong to this institution.");
  const product = await db.select({ id: commerceProducts.id }).from(commerceProducts).where(and(eq(commerceProducts.institutionId, input.institutionId), eq(commerceProducts.id, input.productId))).limit(1);
  if (!product[0]) throw new Error("Commerce product does not belong to this institution.");
  await db.insert(commerceInvoices).values(input);
  return db.select().from(commerceInvoices).where(and(eq(commerceInvoices.institutionId, input.institutionId), eq(commerceInvoices.id, input.id))).limit(1).then(rows => rows[0]);
}

export async function listCommerceInvoices(institutionId: string, learnerId?: string) {
  const db = await getDb();
  if (!db) return [];
  const where = learnerId ? and(eq(commerceInvoices.institutionId, institutionId), eq(commerceInvoices.learnerId, learnerId)) : eq(commerceInvoices.institutionId, institutionId);
  return db.select().from(commerceInvoices).where(where).orderBy(desc(commerceInvoices.createdAt));
}

export async function updateCommerceInvoiceStatus(institutionId: string, invoiceId: string, status: typeof commerceInvoices.$inferInsert["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const existing = await db.select().from(commerceInvoices).where(and(eq(commerceInvoices.institutionId, institutionId), eq(commerceInvoices.id, invoiceId))).limit(1).then(rows => rows[0]);
  if (!existing) return undefined;
  await db.update(commerceInvoices).set({ status, updatedAt: new Date() }).where(and(eq(commerceInvoices.institutionId, institutionId), eq(commerceInvoices.id, invoiceId)));
  return db.select().from(commerceInvoices).where(and(eq(commerceInvoices.institutionId, institutionId), eq(commerceInvoices.id, invoiceId))).limit(1).then(rows => rows[0]);
}

export async function recordCommerceInvoicePayment(input: { paymentId: string; invoiceId: string; institutionId: string; learnerId: string; amountMinor: number; method: string; recordedById: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const invoice = await db.select().from(commerceInvoices).where(and(eq(commerceInvoices.institutionId, input.institutionId), eq(commerceInvoices.id, input.invoiceId), eq(commerceInvoices.learnerId, input.learnerId))).limit(1).then(rows => rows[0]);
  if (!invoice) throw new Error("Invoice not found for this institution and learner.");
  const due = Math.max(0, invoice.amountMinor - invoice.discountMinor);
  if (input.amountMinor <= 0 || input.amountMinor > due) throw new Error("Payment amount must be positive and cannot exceed the invoice balance.");
  await db.insert(paymentRecords).values({ id: input.paymentId, institutionId: input.institutionId, learnerId: input.learnerId, amountMinor: input.amountMinor, currency: invoice.currency, method: input.method, status: "paid", paidAt: new Date(), recordedById: input.recordedById });
  const prior = await db.select({ amountMinor: paymentRecords.amountMinor }).from(paymentRecords).where(and(eq(paymentRecords.institutionId, input.institutionId), eq(paymentRecords.learnerId, input.learnerId), eq(paymentRecords.status, "paid")));
  const totalPaid = prior.reduce((sum, row) => sum + row.amountMinor, 0);
  const status = totalPaid >= due ? "paid" : "partially_paid";
  await db.update(commerceInvoices).set({ status, updatedAt: new Date() }).where(and(eq(commerceInvoices.institutionId, input.institutionId), eq(commerceInvoices.id, input.invoiceId)));
  return db.select().from(commerceInvoices).where(and(eq(commerceInvoices.institutionId, input.institutionId), eq(commerceInvoices.id, input.invoiceId))).limit(1).then(rows => rows[0]);
}

export async function createPaymentRecord(input: typeof paymentRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(paymentRecords).values(input);
}

export async function listPaymentRecords(institutionId: string, learnerId?: string) {
  const db = await getDb();
  if (!db) return [];
  const where = learnerId ? and(eq(paymentRecords.institutionId, institutionId), eq(paymentRecords.learnerId, learnerId)) : eq(paymentRecords.institutionId, institutionId);
  return db.select().from(paymentRecords).where(where).orderBy(desc(paymentRecords.paidAt));
}

export async function getCommerceReport(institutionId: string) {
  const db = await getDb();
  if (!db) return { invoices: [], payments: [], metrics: { revenueMinor: 0, discountsMinor: 0, refundedMinor: 0, refundRate: 0, invoiceCount: 0, paidInvoiceCount: 0 } };
  const [invoices, payments] = await Promise.all([listCommerceInvoices(institutionId), listPaymentRecords(institutionId)]);
  const metrics = calculateCommerceMetrics(invoices, payments);
  return { invoices, payments, metrics };
}

export async function linkLearnerStudent(input: typeof learnerUsers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(learnerUsers).values(input);
}

export async function getStudentLearner(institutionId: string, studentUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ learner: learners, link: learnerUsers }).from(learnerUsers).innerJoin(learners, eq(learners.id, learnerUsers.learnerId)).where(and(eq(learnerUsers.institutionId, institutionId), eq(learnerUsers.studentUserId, studentUserId), eq(learners.institutionId, institutionId))).limit(1);
  return rows[0];
}
