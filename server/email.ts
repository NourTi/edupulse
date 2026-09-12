/**
 * Email notifications service.
 * Resend dependency removed per user request.
 * Logs transactional emails cleanly to console / audit log.
 */

export async function sendCommerceReportEmail(input: { to: string; subject: string; csv: string; summary: string }) {
  console.log(`[Email Service] Commerce report sent to: ${input.to} | Subject: ${input.subject} | Summary: ${input.summary.slice(0, 100)}...`);
  return { success: true, logged: true };
}

export async function sendPasswordResetEmail(input: { to: string; token: string }) {
  const appUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl.replace(/\/$/, "")}/?reset=${encodeURIComponent(input.token)}`;
  console.log(`[Email Service] Password reset requested for: ${input.to} | Reset Link: ${resetUrl}`);
  return { success: true, resetUrl };
}
