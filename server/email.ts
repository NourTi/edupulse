const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendCommerceReportEmail(input: { to: string; subject: string; csv: string; summary: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Report email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL.");
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>EduPulse — تقرير التجارة</h2><p>${input.summary}</p><p>أُرفق التقرير بصيغة CSV. يحتوي على بيانات المؤسسة المحددة فقط.</p></div>`, attachments: [{ filename: "edupulse-commerce-report.csv", content: Buffer.from(input.csv, "utf8").toString("base64") }] }),
  });
  if (!response.ok) throw new Error(`Resend report request failed with status ${response.status}.`);
}

export async function sendPasswordResetEmail(input: { to: string; token: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  if (!apiKey || !from) throw new Error("Resend is not configured.");
  const resetUrl = `${appUrl.replace(/\/$/, "")}/?reset=${encodeURIComponent(input.token)}`;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: "EduPulse password reset",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>إعادة تعيين كلمة مرور EduPulse</h2><p>استخدم الرابط التالي لإعداد كلمة مرور جديدة. تنتهي صلاحية الرابط خلال ساعة واحدة.</p><p><a href="${resetUrl}">إعادة تعيين كلمة المرور</a></p><p dir="ltr">If you did not request this, ignore this email.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend request failed with status ${response.status}.`);
}
