import { useState } from "react";
import { CheckCircle2, MessageCircle, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { getWhatsAppAuthStatus, sendWhatsAppMessage } from "@/lib/whatsappDesktop";

type Props = { isArabic: boolean; studentName: string; guardianPhone: string; initialMessage: string; guardianConsent: boolean; phoneVerified: boolean; whatsappOptOut: boolean; onSaveDraft: (message: string) => Promise<void>; onDeliveryRecorded: (delivery: { guardianPhone: string; status: "sent" | "failed"; createdAt: string; error?: string }) => Promise<void> };

export function WhatsAppDesktopPanel({ isArabic, studentName, guardianPhone, initialMessage, guardianConsent, phoneVerified, whatsappOptOut, onSaveDraft, onDeliveryRecorded }: Props) {
  const [message, setMessage] = useState(initialMessage);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const desktopOnly = isArabic ? "هذه الميزة متاحة داخل تطبيق EduPulse لسطح المكتب فقط." : "This feature is available only inside the EduPulse desktop app.";
  const canSend = guardianConsent && phoneVerified && !whatsappOptOut;
  const consentMessage = whatsappOptOut ? (isArabic ? "أوقف ولي الأمر رسائل واتساب." : "The guardian opted out of WhatsApp messages.") : !guardianConsent ? (isArabic ? "تحتاج المؤسسة إلى موافقة ولي الأمر قبل الإرسال." : "Institution-recorded guardian consent is required before sending.") : !phoneVerified ? (isArabic ? "يجب التحقق من رقم الهاتف قبل الإرسال." : "The phone number must be verified before sending.") : "";

  const checkStatus = async () => {
    setBusy(true);
    try {
      const result = await getWhatsAppAuthStatus();
      setStatus(JSON.stringify(result));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "WhatsApp is not ready.");
    } finally { setBusy(false); }
  };

  const send = async () => {
    if (!canSend || !guardianPhone.trim() || !message.trim()) return;
    setBusy(true);
    try {
      await onSaveDraft(message);
      await sendWhatsAppMessage(guardianPhone, message);
      await onDeliveryRecorded({ guardianPhone, status: "sent", createdAt: new Date().toISOString() });
      setStatus(isArabic ? "تم إرسال الرسالة بنجاح." : "Message sent successfully.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not send the message.";
      await onDeliveryRecorded({ guardianPhone, status: "failed", createdAt: new Date().toISOString(), error: detail });
      setStatus(detail);
    } finally { setBusy(false); }
  };

  return <section className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-black/10 sm:p-6" dir={isArabic ? "rtl" : "ltr"}>
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">{isArabic ? "تواصل محلي آمن" : "Secure local communication"}</p><h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-white"><MessageCircle className="h-5 w-5 text-emerald-300" />{isArabic ? "رسالة ولي الأمر" : "Guardian message"}</h2><p className="mt-2 text-sm leading-7 text-white/60">{isArabic ? `ملخص خاص بـ ${studentName}، مع مراجعة قبل الإرسال.` : `A private summary for ${studentName}, with review before sending.`}</p></div>
      <ShieldCheck className="h-6 w-6 text-emerald-200" />
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
      <div><label className="mb-2 block text-xs text-white/60">{isArabic ? "رقم ولي الأمر" : "Guardian phone"}</label><input value={guardianPhone} readOnly className="w-full rounded-xl border border-white/15 bg-black/15 px-4 py-3 text-sm text-white/75" /><label className="mb-2 mt-4 block text-xs text-white/60">{isArabic ? "نص الرسالة" : "Message preview"}</label><textarea value={message} onChange={event => setMessage(event.target.value)} rows={6} maxLength={4000} className="w-full resize-y rounded-xl border border-white/15 bg-black/15 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-emerald-200/60" /></div>
      <div className="flex flex-col gap-3 lg:min-w-52 lg:justify-end"><button type="button" onClick={checkStatus} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 disabled:opacity-50"><RefreshCw className="h-4 w-4" />{isArabic ? "فحص اتصال واتساب" : "Check WhatsApp"}</button><button type="button" onClick={send} disabled={busy || !canSend || !guardianPhone.trim() || !message.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />{isArabic ? "مراجعة وإرسال" : "Review & send"}</button></div>
    </div>
    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/15 bg-amber-200/5 px-3 py-3 text-xs leading-6 text-amber-100/70"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0" /><span>{desktopOnly} {isArabic ? "لا تُرسل الرسائل إلا بعد تحقق المؤسسة من العلاقة والرقم." : "Messages send only after the institution verifies the relationship and number."} {consentMessage}</span></div>
    {status && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-xs leading-6 text-white/70">{status}</p>}
  </section>;
}
