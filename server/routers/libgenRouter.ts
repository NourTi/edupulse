/**
 * LibGen tRPC Router
 * Works with the existing server/integrations/libgen.ts
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getMembership,
  getUserById,
  getUserMemberships,
  getInstitution,
  createInstitution,
  createMembership,
  writeAuditLog,
} from "../db";
import { searchLibgen, getDownloadLink } from "../integrations/libgen";

// ─── Copied from routers.ts ───────────────────────────────────────────────────

const schoolRoles = [
  "owner", "admin", "registrar", "finance_admin",
  "teacher", "counsellor", "student", "guardian",
] as const;
type SchoolRole = (typeof schoolRoles)[number];

async function defaultInstitutionId(userId: number, requested?: string): Promise<string> {
  if (requested) return requested;
  try {
    const memberships = await getUserMemberships(userId);
    const first = memberships[0]?.membership.institutionId;
    if (first) return first;
  } catch (error) {
    console.warn("[defaultInstitutionId] Failed to read memberships:", error);
  }
  const defaultInstId = "inst_edupulse_primary";
  try {
    const existing = await getInstitution(defaultInstId);
    if (!existing) {
      await createInstitution({
        id: defaultInstId,
        name: "ثانوية محمد بلخير والقطب الجامعي — البيض",
        slug: `edupulse-inst-${nanoid(6).toLowerCase()}`,
        createdById: userId,
      });
    }
    await createMembership({
      id: `mem_auto_${userId}_${nanoid(8)}`,
      institutionId: defaultInstId,
      userId,
      role: "owner",
      status: "active",
    });
    return defaultInstId;
  } catch (err) {
    console.warn("[defaultInstitutionId] Auto-healing fallback triggered:", err);
    return defaultInstId;
  }
}

async function requireInstitutionRole(
  userId: number,
  institutionId: string,
  allowed: readonly SchoolRole[]
) {
  try {
    let membership = await getMembership(userId, institutionId);
    if (!membership || membership.status !== "active") {
      const user = await getUserById(userId);
      const isOwner =
        user?.role === "admin" ||
        user?.email?.toLowerCase() ===
          (process.env.OWNER_OPEN_ID?.toLowerCase() ?? "admin@edupulse.edu.dz");
      if (isOwner) {
        await createMembership({
          id: `mem_owner_${userId}_${nanoid(6)}`,
          institutionId,
          userId,
          role: "owner",
          status: "active",
        });
        membership = await getMembership(userId, institutionId);
      }
    }
    if (
      membership &&
      membership.status === "active" &&
      (allowed.includes(membership.role as SchoolRole) || membership.role === "owner")
    ) {
      return membership;
    }
  } catch (err) {
    console.warn("[requireInstitutionRole] Warning during check:", err);
  }
  const user = await getUserById(userId);
  if (
    user?.role === "admin" ||
    user?.email?.toLowerCase() ===
      (process.env.OWNER_OPEN_ID?.toLowerCase() ?? "admin@edupulse.edu.dz")
  ) {
    return { id: `mem_virtual_${userId}`, institutionId, userId, role: "owner", status: "active" } as any;
  }
  throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this institution." });
}

const LIBRARY_ROLES = [
  "owner", "admin", "registrar", "finance_admin",
  "teacher", "counsellor", "student", "guardian",
] as const;

// ─── Router ───────────────────────────────────────────────────────────────────

export const libgenRouter = router({
  /**
   * Search books and papers.
   */
  search: protectedProcedure
    .input(
      z.object({
        institutionId: z.string().max(64).optional(),
        query: z.string().trim().min(2).max(300),
        topics: z
          .array(z.enum(["nonfiction", "fiction", "articles", "magazines", "comics", "standards"]))
          .optional(),
        page: z.number().int().min(1).max(100).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const institutionId = await defaultInstitutionId(ctx.user.id, input.institutionId);
      await requireInstitutionRole(ctx.user.id, institutionId, LIBRARY_ROLES);
      try {
        return await searchLibgen(
          input.query,
          input.topics ?? ["nonfiction", "fiction", "articles"],
          input.page
        );
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Search failed.",
        });
      }
    }),

  /**
   * Get a direct download link for a book by MD5.
   * Audit-logged on every request.
   */
  downloadLink: protectedProcedure
    .input(
      z.object({
        institutionId: z.string().max(64).optional(),
        md5: z.string().trim().length(32),
        title: z.string().trim().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const institutionId = await defaultInstitutionId(ctx.user.id, input.institutionId);
      await requireInstitutionRole(ctx.user.id, institutionId, LIBRARY_ROLES);

      let url: string;
      try {
        url = await getDownloadLink(input.md5);
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Could not resolve download link.",
        });
      }

      await writeAuditLog({
        id: `audit_${nanoid(16)}`,
        institutionId,
        actorUserId: ctx.user.id,
        action: "library.book.downloaded",
        entityType: "libgen_book",
        entityId: input.md5,
        metadata: JSON.stringify({ title: input.title ?? "unknown", md5: input.md5 }),
      });

      return { url, filename: `${input.md5}.pdf` };
    }),
});
