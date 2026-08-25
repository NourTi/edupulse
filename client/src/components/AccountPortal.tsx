import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type AccountLanguage = "ar" | "en";

type Props = {
  language: AccountLanguage;
  onBack: () => void;
  onAuthenticated: () => void;
};

type Mode = "login" | "register" | "invite";

const copy = {
  ar: {
    login: "تسجيل الدخول", register: "إنشاء مؤسسة", invite: "قبول دعوة", email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم الكامل", institution: "اسم المؤسسة", token: "رمز الدعوة", submitLogin: "دخول آمن", submitRegister: "إنشاء مساحة المؤسسة", submitInvite: "تفعيل الحساب", switchRegister: "أنشئ مساحة تعليمية جديدة", switchLogin: "لديك حساب؟ تسجيل الدخول", switchInvite: "لديك دعوة من مؤسسة؟", back: "العودة للمنصة", note: "حسابات EduPulse تُدار بكلمة مرور وتُحفظ صلاحياتها داخل المؤسسة.", strength: "10 أحرف على الأقل، حرف كبير، حرف صغير، ورقم.", error: "تعذر إتمام العملية. راجع البيانات وحاول مرة أخرى.", success: "تم تسجيل الدخول.", created: "تم إنشاء مساحة المؤسسة.", activated: "تم تفعيل الحساب.",
  },
  en: {
    login: "Sign in", register: "Create institution", invite: "Accept invite", email: "Email address", password: "Password", name: "Full name", institution: "Institution name", token: "Invitation token", submitLogin: "Secure sign in", submitRegister: "Create institution workspace", submitInvite: "Activate account", switchRegister: "Create a new education workspace", switchLogin: "Already have an account? Sign in", switchInvite: "Have an institution invitation?", back: "Back to platform", note: "EduPulse accounts use passwords and institution-scoped permissions.", strength: "At least 10 characters, uppercase, lowercase, and a number.", error: "The request could not be completed. Check the details and try again.", success: "Signed in.", created: "Institution workspace created.", activated: "Account activated.",
  },
};

export function AccountPortal({ language, onBack, onAuthenticated }: Props) {
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
  const pending = login.isPending || register.isPending || acceptInvite.isPending;
  const error = login.error ?? register.error ?? acceptInvite.error;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
        toast.success(t.success);
      } else if (mode === "register") {
        await register.mutateAsync({ name, institutionName, email, password });
        toast.success(t.created);
      } else {
        await acceptInvite.mutateAsync({ token, name, password });
        toast.success(t.activated);
      }
      await utils.auth.me.invalidate();
      onAuthenticated();
    } catch {
      toast.error(t.error);
    }
  };

  return <section className="relative z-10 mx-auto w-full max-w-xl rounded-[2rem] border border-white/15 bg-[#002b3c]/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-9" dir={language === "ar" ? "rtl" : "ltr"}>
    <div className="mb-8 flex items-start justify-between gap-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-white/55 transition hover:text-white"><ArrowLeft className="h-4 w-4" />{t.back}</button>
      <div className="rounded-full border border-white/15 bg-white/5 p-3 text-white/75"><ShieldCheck className="h-5 w-5" /></div>
    </div>
    <div className="mb-8"><p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/45">EduPulse · {mode === "login" ? t.login : mode === "register" ? t.register : t.invite}</p><h1 className="text-display text-5xl leading-none">{mode === "login" ? "مساحة موثوقة." : mode === "register" ? "ابدأ السجل." : "انضم بأمان."}</h1><p className="mt-4 text-sm leading-7 text-white/55">{t.note}</p></div>
    <form onSubmit={submit} className="space-y-4">
      {mode !== "login" && <label className="block"><span className="mb-2 block text-xs text-white/55">{t.name}</span><input required value={name} onChange={event => setName(event.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/45" /></label>}
      {mode === "register" && <label className="block"><span className="mb-2 block text-xs text-white/55">{t.institution}</span><input required value={institutionName} onChange={event => setInstitutionName(event.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/45" /></label>}
      {mode === "invite" && <label className="block"><span className="mb-2 block text-xs text-white/55">{t.token}</span><input required value={token} onChange={event => setToken(event.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/45" /></label>}
      {mode !== "invite" && <label className="block"><span className="mb-2 block text-xs text-white/55">{t.email}</span><span className="relative block"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/45" /></span></label>}
      <label className="block"><span className="mb-2 block text-xs text-white/55">{t.password}</span><span className="relative block"><KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input required minLength={10} type="password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/45" /></span><span className="mt-2 block text-[11px] leading-5 text-white/35">{t.strength}</span></label>
      {error && <p role="alert" className="rounded-xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-xs leading-6 text-amber-100">{error.message}</p>}
      <button disabled={pending} className="liquid-glass flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "login" ? t.submitLogin : mode === "register" ? t.submitRegister : t.submitInvite}</button>
    </form>
    <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-center text-xs text-white/55"><button onClick={() => setMode(mode === "login" ? "register" : "login")} className="transition hover:text-white">{mode === "login" ? t.switchRegister : t.switchLogin}</button><button onClick={() => setMode(mode === "invite" ? "login" : "invite")} className="transition hover:text-white">{t.switchInvite}</button></div>
  </section>;
}
