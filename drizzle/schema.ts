import {
  boolean,
  index,
  int,
  uniqueIndex,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core identity table. Manus OAuth fields remain nullable for legacy/platform compatibility; EduPulse application users authenticate with passwords. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }).default("password"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  passwordHash: text("passwordHash"),
  status: mysqlEnum("status", ["active", "invited", "suspended"]).default("active").notNull(),
  mustChangePassword: boolean("mustChangePassword").default(false).notNull(),
  passwordChangedAt: timestamp("passwordChangedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** External identities are linked separately so a Google account never replaces a user's password or memberships. */
export const userAuthAccounts = mysqlTable("userAuthAccounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 32 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  providerEmail: varchar("providerEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ providerAccountIdx: uniqueIndex("user_auth_accounts_provider_account_idx").on(table.provider, table.providerAccountId), userIdx: index("user_auth_accounts_user_idx").on(table.userId) }));

export type UserAuthAccount = typeof userAuthAccounts.$inferSelect;
export type InsertUserAuthAccount = typeof userAuthAccounts.$inferInsert;

/** A school, university department, language centre, or independent educator workspace. */
export const institutions = mysqlTable("institutions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  locale: varchar("locale", { length: 16 }).default("ar-DZ").notNull(),
  timezone: varchar("timezone", { length: 80 }).default("Africa/Algiers").notNull(),
  retentionDays: int("retentionDays").default(730).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = typeof institutions.$inferInsert;

/** Institution-scoped roles are authoritative for school access; the legacy users.role is not used for record authorization. */
export const memberships = mysqlTable(
  "memberships",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    institutionId: varchar("institutionId", { length: 64 }).notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["owner", "admin", "registrar", "finance_admin", "teacher", "counsellor", "student", "guardian"]).notNull(),
    status: mysqlEnum("status", ["invited", "active", "suspended"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    institutionUserIdx: index("memberships_institution_user_idx").on(table.institutionId, table.userId),
    userIdx: index("memberships_user_idx").on(table.userId),
  }),
);

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

/** Hashed application session tokens. Raw tokens never enter the database. */
export const authSessions = mysqlTable(
  "authSessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId").notNull(),
    tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
    revokedAt: timestamp("revokedAt"),
    userAgent: varchar("userAgent", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ userIdx: index("auth_sessions_user_idx").on(table.userId) }),
);

export type AuthSession = typeof authSessions.$inferSelect;
export type InsertAuthSession = typeof authSessions.$inferInsert;

export const passwordResetTokens = mysqlTable(
  "passwordResetTokens",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId").notNull(),
    tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    usedAt: timestamp("usedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ userIdx: index("password_reset_user_idx").on(table.userId) }),
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export const invitations = mysqlTable(
  "invitations",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    institutionId: varchar("institutionId", { length: 64 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "registrar", "finance_admin", "teacher", "counsellor", "student", "guardian"]).notNull(),
    tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    invitedById: int("invitedById").notNull(),
    acceptedAt: timestamp("acceptedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ institutionIdx: index("invitations_institution_idx").on(table.institutionId) }),
);

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    institutionId: varchar("institutionId", { length: 64 }),
    actorUserId: int("actorUserId"),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entityType", { length: 120 }).notNull(),
    entityId: varchar("entityId", { length: 128 }),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ institutionIdx: index("audit_logs_institution_idx").on(table.institutionId, table.createdAt) }),
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/** Institution-owned learner records replace the former browser-only demo records. */
export const learners = mysqlTable("learners", {
  id: varchar("id", { length: 64 }).primaryKey(),
  institutionId: varchar("institutionId", { length: 64 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  nameAr: varchar("nameAr", { length: 160 }).notNull(),
  grade: varchar("grade", { length: 80 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  status: mysqlEnum("status", ["active", "new", "review", "archived"]).default("active").notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ institutionIdx: index("learners_institution_idx").on(table.institutionId) }));

export const learnerUsers = mysqlTable("learnerUsers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  institutionId: varchar("institutionId", { length: 64 }).notNull(),
  learnerId: varchar("learnerId", { length: 64 }).notNull(),
  studentUserId: int("studentUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ institutionIdx: index("learner_users_institution_idx").on(table.institutionId), learnerIdx: index("learner_users_learner_idx").on(table.learnerId), studentIdx: index("learner_users_student_idx").on(table.studentUserId) }));

export const learnerGuardians = mysqlTable("learnerGuardians", {
  id: varchar("id", { length: 64 }).primaryKey(),
  institutionId: varchar("institutionId", { length: 64 }).notNull(),
  learnerId: varchar("learnerId", { length: 64 }).notNull(),
  guardianUserId: int("guardianUserId").notNull(),
  relationship: varchar("relationship", { length: 80 }).notNull().default("guardian"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ institutionIdx: index("learner_guardians_institution_idx").on(table.institutionId), learnerIdx: index("learner_guardians_learner_idx").on(table.learnerId), guardianIdx: index("learner_guardians_guardian_idx").on(table.guardianUserId) }));

export const attendanceRecords = mysqlTable("attendanceRecords", {
  id: varchar("id", { length: 64 }).primaryKey(),
  institutionId: varchar("institutionId", { length: 64 }).notNull(),
  learnerId: varchar("learnerId", { length: 64 }).notNull(),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["present", "late", "excused", "absent"]).notNull(),
  note: text("note"),
  recordedById: int("recordedById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ institutionDateIdx: index("attendance_institution_date_idx").on(table.institutionId, table.date), learnerIdx: index("attendance_learner_idx").on(table.learnerId) }));

export const cefrAssessments = mysqlTable("cefrAssessments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  institutionId: varchar("institutionId", { length: 64 }).notNull(),
  learnerId: varchar("learnerId", { length: 64 }).notNull(),
  level: varchar("level", { length: 8 }).notNull(),
  speaking: int("speaking").notNull(),
  listening: int("listening").notNull(),
  reading: int("reading").notNull(),
  writing: int("writing").notNull(),
  note: text("note"),
  status: mysqlEnum("status", ["draft", "approved"]).default("draft").notNull(),
  assessedById: int("assessedById").notNull(),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
}, table => ({ institutionIdx: index("cefr_institution_idx").on(table.institutionId), learnerIdx: index("cefr_learner_idx").on(table.learnerId) }));

export const paymentRecords = mysqlTable("paymentRecords", {
  id: varchar("id", { length: 64 }).primaryKey(),
  institutionId: varchar("institutionId", { length: 64 }).notNull(),
  learnerId: varchar("learnerId", { length: 64 }).notNull(),
  amountMinor: int("amountMinor").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("DZD"),
  method: varchar("method", { length: 60 }).notNull(),
  status: mysqlEnum("status", ["paid", "balance_due", "void"]).default("paid").notNull(),
  paidAt: timestamp("paidAt").notNull(),
  recordedById: int("recordedById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ institutionIdx: index("payments_institution_idx").on(table.institutionId), learnerIdx: index("payments_learner_idx").on(table.learnerId) }));

export type Learner = typeof learners.$inferSelect;
export type InsertLearner = typeof learners.$inferInsert;
export type LearnerUser = typeof learnerUsers.$inferSelect;
export type LearnerGuardian = typeof learnerGuardians.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type CefrAssessment = typeof cefrAssessments.$inferSelect;
export type PaymentRecord = typeof paymentRecords.$inferSelect;

/** Approved, institution-owned information available to the education assistant. */
export const knowledgeSources = mysqlTable(
  "knowledgeSources",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    institutionId: varchar("institutionId", { length: 64 }),
    title: varchar("title", { length: 255 }).notNull(),
    kind: mysqlEnum("kind", ["document", "webpage"]).notNull(),
    visibility: mysqlEnum("visibility", ["public", "staff"]).default("public").notNull(),
    status: mysqlEnum("status", ["ready", "failed"]).default("ready").notNull(),
    sourceUrl: text("sourceUrl"),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    mimeType: varchar("mimeType", { length: 128 }).notNull(),
    createdById: int("createdById").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ institutionIdx: index("knowledge_sources_institution_idx").on(table.institutionId) }),
);

/** Searchable excerpts retained with a source so every response can cite its evidence. */
export const knowledgeChunks = mysqlTable(
  "knowledgeChunks",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sourceId: varchar("sourceId", { length: 64 }).notNull(),
    ordinal: int("ordinal").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ sourceIdx: index("knowledge_chunks_source_idx").on(table.sourceId) }),
);

export type KnowledgeSource = typeof knowledgeSources.$inferSelect;
export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;

/** Institution identity used by branded receipts and public-facing documents. */
export const schoolSettings = mysqlTable("schoolSettings", {
  id: int("id").primaryKey(),
  institutionId: varchar("institutionId", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull().default("EduPulse"),
  logoKey: varchar("logoKey", { length: 512 }),
  logoUrl: text("logoUrl"),
  updatedById: int("updatedById").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SchoolSettings = typeof schoolSettings.$inferSelect;
export type InsertSchoolSettings = typeof schoolSettings.$inferInsert;
