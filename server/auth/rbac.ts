import type { Request, Response, NextFunction } from "express";
import { userFromPasswordSession } from "./session";
import type { User } from "../../drizzle/schema";

export type RoleType = "admin" | "teacher" | "guardian" | "student";

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

/**
 * RBAC middleware: ensures the requesting user is logged in and possesses one of the allowed roles.
 * Admins are granted universal access.
 */
export function requireRole(allowedRoles: RoleType[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userFromPasswordSession(req);
      if (!user) {
        return res.status(401).json({ error: "401 Unauthorized: Please sign in to access this resource." });
      }

      req.user = user;
      const role = (user.role || "student") as RoleType;

      if (role === "admin" || allowedRoles.includes(role)) {
        return next();
      }

      return res.status(403).json({
        error: "403 Forbidden: Insufficient role permissions.",
        requiredRoles: allowedRoles,
        userRole: role,
      });
    } catch (err) {
      console.error("[RBAC] Verification failure:", err);
      return res.status(500).json({ error: "Internal role verification error." });
    }
  };
}

/**
 * Guardian filter validator: ensures a guardian user can only query or modify their linked child's records.
 */
export function validateGuardianStudentAccess(req: Request, requestedStudentId: string): boolean {
  if (!req.user) return false;
  if (req.user.role === "admin" || req.user.role === "teacher") return true;
  if (req.user.role === "guardian") {
    return Boolean(req.user.linkedStudentId && req.user.linkedStudentId === requestedStudentId);
  }
  if (req.user.role === "student") {
    // If student, they can only view their own profile if linked, or if their id matches
    return String(req.user.id) === requestedStudentId || req.user.linkedStudentId === requestedStudentId;
  }
  return false;
}
