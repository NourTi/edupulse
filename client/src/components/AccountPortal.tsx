import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type AccountLanguage = "ar" | "en";
type Props = { language: AccountLanguage; onBack: () => void; onAuthenticated: () => void; onLanguageChange: (language: AccountLanguage) => void };
type Mode = "login" | "register" | "invite" | "forgot" | "reset";

function AccountBrandMark() {
  return <svg aria-label="EduPulse" role="img" viewBox="0 0 48 48" className="h-11 w-11" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="42" height="42" rx="13" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.65)"/><path d="M14 29c4-8 8-12 12-12 3 0 5 2 8 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M14 34c5-6 9-9 13-9 3 0 5 1 7 4" stroke="#B6F2E4" strokeWidth="2.5" strokeLinecap="round"/><circle cx="15" cy="16" r="2.5" fill="#F9D58A"/></svg>;
}

const copy = {
  ar: { login: "تسجيل الدخول", google: "المتابعة باستخدام Google", register: "إنشاء حساب المؤسسة", invite: "قبول الدعوة", forgot: "استعادة كلمة المرور", reset: "كلمة مرور جديدة", email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم الكامل", institution: "اسم المؤسسة التعليمية", token: "رمز الدعوة", submitLogin: "تسجيل الدخول", submitRegister: "إنشاء الحساب", submitInvite: "تفعيل الحساب", submitForgot: "إرسال رابط الاستعادة", submitReset: "حفظ كلمة المرور", switchRegister: "إنشاء حساب جديد", switchLogin: "لديك حساب؟ سجّل الدخول", switchInvite: "لديك دعوة من مؤسسة؟", switchForgot: "هل نسيت كلمة المرور؟", back: "العودة إلى المنصة", note: "أدخل بياناتك للوصول إلى مساحة مؤسستك التعليمية.", strength: "10 أحرف على الأقل، تشمل حرفاً كبيراً وحرفاً صغيراً ورقماً.", error: "تعذّر إتمام العملية. راجع البيانات وحاول مرة أخرى.", success: "تم تسجيل الدخول بنجاح.", created: "تم إنشاء الحساب بنجاح.", activated: "تم تفعيل الحساب بنجاح.", sent: "إذا كان الحساب موجوداً، سيصل رابط الاستعادة إلى بريدك.", resetDone: "تم تحديث كلمة المرور." },
  en: { login: "Sign in", google: "Continue with Google", register: "Create school account", invite: "Accept invitation", forgot: "Recover password", reset: "Create a new password", email: "Email address", password: "Password", name: "Full name", institution: "School or institution name", token: "Invitation code", submitLogin: "Sign in", submitRegister: "Create account", submitInvite: "Activate account", submitForgot: "Send recovery link", submitReset: "Save password", switchRegister: "Create a new account", switchLogin: "Already have an account? Sign in", switchInvite: "Have an invitation from your school?", switchForgot: "Forgot your password?", back: "Back to platform", note: "Enter your details to access your school workspace.", strength: "At least 10 characters, including an uppercase letter, lowercase letter, and number.", error: "We could not complete this action. Check your details and try again.", success: "You are signed in.", created: "Your account was created.", activated: "Your account was activated.", sent: "If the account exists, a recovery link will arrive by email.", resetDone: "Your password was updated." },
};

export function AccountPortal({ language, onBack, onAuthenticated, onLanguageChange }: Props) {
  const t = copy[language];
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation();
  const register = trpc.auth.register.useMutation();
  const acceptInvite = trpc.auth.acceptInvite.useMutation();
  const requestReset = trpc.auth.requestPasswordReset.useMutation();
  const resetPassword = trpc.auth.resetPassword.useMutation();
  useEffect(() => { const urlToken = new URLSearchParams(window.location.search).get("reset"); if (urlToken) { setToken(urlToken); setMode("reset"); } }, []);
  const googleLoginUrl = `/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`;
  const pending = login.isPending || register.isPending || acceptInvite.isPending || requestReset.isPending || resetPassword.isPending;
  const error = login.error ?? register.error ?? acceptInvite.error ?? requestReset.error ?? resetPassword.error;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "forgot") { await requestReset.mutateAsync({ email }); toast.success(t.sent); setMode("login"); return; }
      if (mode === "reset") { await resetPassword.mutateAsync({ token, newPassword: password }); toast.success(t.resetDone); setPassword(""); setToken(""); window.history.replaceState({}, "", window.location.pathname); setMode("login"); return; }
      if (mode === "login") { await login.mutateAsync({ email, password }); toast.success(t.success); }
      else if (mode === "register") { await register.mutateAsync({ name, institutionName, email, password }); toast.success(t.created); }
      else { await acceptInvite.mutateAsync({ token, name, password }); toast.success(t.activated); }
      await utils.auth.me.invalidate(); onAuthenticated();
    } catch (caught) { toast.error(caught instanceof Error && caught.message ? caught.message : t.error); }
  };
  const heading = mode === "login" ? t.login : mode === "register" ? t.register : mode === "invite" ? t.invite : mode === "forgot" ? t.forgot : t.reset;
  const title = language === "ar"
    ? (mode === "login" ? "مساحتك التعليمية." : mode === "register" ? "أنشئ حسابك." : mode === "invite" ? "انضم إلى مؤسستك." : mode === "forgot" ? "نستعيد وصولك." : "أنشئ كلمة مرور جديدة.")
    : (mode === "login" ? "Your school space." : mode === "register" ? "Create your account." : mode === "invite" ? "Join your school." : mode === "forgot" ? "Recover your access." : "Create a new password.");
  return <section className="relative z-10 mx-auto w-full max-w-xl rounded-[2rem] border border-white/30 bg-[#002334]/[0.97] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-9" dir={language === "ar" ? "rtl" : "ltr"}>
    <div className="mb-8 flex items-start justify-between gap-4"><button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-white/80 transition hover:text-white"><ArrowLeft className="h-4 w-4" />{t.back}</button><div className="flex items-center gap-2"><button type="button" onClick={() => onLanguageChange(language === "ar" ? "en" : "ar")} className="rounded-full border border-white/20 px-3 py-2 text-[11px] text-white/80 transition hover:bg-white/10">{language === "ar" ? "English" : "العربية"}</button><div className="rounded-2xl border border-white/25 bg-white/10 p-2 text-white/90"><AccountBrandMark /></div></div></div>
    <div className="mb-8 rounded-2xl border border-white/10 bg-black/10 px-4 py-5"><p className="mb-3 text-xs font-medium tracking-[0.16em] text-white/85">EduPulse · {heading}</p><h1 className="text-display text-5xl leading-[1.15] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">{title}</h1><p className="mt-4 text-base leading-8 text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">{t.note}</p></div>
    <form onSubmit={submit} className="space-y-4">
      {mode !== "login" && mode !== "forgot" && mode !== "reset" && <label className="block"><span className="mb-2 block text-xs text-white/70">{t.name}</span><input required value={name} onChange={event => setName(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/60" /></label>}
      {mode === "register" && <label className="block"><span className="mb-2 block text-xs text-white/70">{t.institution}</span><input required value={institutionName} onChange={event => setInstitutionName(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/60" /></label>}
      {mode === "invite" && <label className="block"><span className="mb-2 block text-xs text-white/70">{t.token}</span><input required minLength={20} value={token} onChange={event => setToken(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/60" /></label>}
      {(mode === "login" || mode === "register" || mode === "forgot") && <label className="block"><span className="mb-2 block text-xs text-white/70">{t.email}</span><span className="relative block"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/60" /></span></label>}
      {(mode === "login" || mode === "register" || mode === "invite" || mode === "reset") && <label className="block"><span className="mb-2 block text-xs text-white/70">{t.password}</span><span className="relative block"><KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" /><input required minLength={10} type="password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/60" /></span><span className="mt-2 block text-[11px] leading-5 text-white/55">{t.strength}</span></label>}
      {error && <p role="alert" className="rounded-xl border border-amber-200/30 bg-amber-200/15 px-4 py-3 text-xs leading-6 text-amber-50">{error.message}</p>}
      <button disabled={pending} className="liquid-glass flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "login" ? t.submitLogin : mode === "register" ? t.submitRegister : mode === "invite" ? t.submitInvite : mode === "forgot" ? t.submitForgot : t.submitReset}</button>
      {mode === "login" && <><div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/40"><span className="h-px flex-1 bg-white/15" />{language === "ar" ? "أو" : "or"}<span className="h-px flex-1 bg-white/15" /></div><a href={googleLoginUrl} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/15"><span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-[#4285f4]">G</span>{t.google}</a></>}
    </form>
    <div className="mt-7 flex flex-col gap-3 border-t border-white/15 pt-5 text-center text-xs text-white/70">{mode === "login" && <button onClick={() => setMode("forgot")} className="transition hover:text-white">{t.switchForgot}</button>}{(mode === "login" || mode === "register") && <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="transition hover:text-white">{mode === "login" ? t.switchRegister : t.switchLogin}</button>}{mode !== "reset" && <button onClick={() => setMode(mode === "invite" ? "login" : "invite")} className="transition hover:text-white">{t.switchInvite}</button>}{mode !== "login" && mode !== "reset" && <button onClick={() => setMode("login")} className="transition hover:text-white">{t.switchLogin}</button>}</div>
  </section>;
}
