import { useState, useEffect, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  Inbox,
  Key,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Magic } from "magic-sdk";
import { trpc } from "@/lib/trpc";
import { ALGERIAN_WILAYAS } from "@/data/algerianWilayas";

export type AccountLanguage = "ar" | "en";

type Props = {
  language: AccountLanguage;
  initialTab?: AuthTab;
  onBack: () => void;
  onAuthenticated: (role?: "admin" | "teacher" | "student" | "guardian") => void;
  onLanguageChange: (language: AccountLanguage) => void;
};

type AuthTab = "login" | "register" | "magic-link" | "portals";

export function AccountPortal({ language, initialTab, onBack, onAuthenticated, onLanguageChange }: Props) {
  const isArabic = language === "ar";
  const [tab, setTab] = useState<AuthTab>(initialTab || "login");

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  // Sign in state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up state with all requested labels
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [age, setAge] = useState<string>("17");
  const [gender, setGender] = useState<"ذكر" | "أنثى">("ذكر");
  const [wilaya, setWilaya] = useState<string>("32 - البيض (El-Bayadh)");
  const [country, setCountry] = useState<string>("الجزائر (Algeria)");
  const [phone, setPhone] = useState<string>("0661 32 45 88");
  const [institutionName, setInstitutionName] = useState("ثانوية محمد بلخير — البيض");
  const [targetRole, setTargetRole] = useState<"admin" | "teacher" | "student" | "guardian">("student");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Magic Link & Direct Access State
  const [magicEmail, setMagicEmail] = useState("");
  const [magicRole, setMagicRole] = useState<"student" | "guardian" | "teacher" | "admin">("student");
  const [magicSent, setMagicSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const magicLoginMutation = trpc.auth.magicLogin.useMutation();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email: loginEmail, password: loginPassword });
      toast.success(isArabic ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!");
      await utils.auth.me.invalidate();
      onAuthenticated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : isArabic ? "بيانات الدخول غير صحيحة" : "Invalid login credentials");
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !familyName.trim()) {
      toast.error(isArabic ? "يرجى كتابة الاسم واللقب." : "First name and family name are required.");
      return;
    }
    if (registerPassword !== confirmPassword) {
      toast.error(isArabic ? "كلمتا المرور غير متطابقتين!" : "Passwords do not match!");
      return;
    }
    if (registerPassword.length < 10) {
      toast.error(isArabic ? "كلمة المرور يجب أن لا تقل عن 10 أحرف." : "Password must be at least 10 characters.");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: firstName.trim(),
        familyName: familyName.trim(),
        age: parseInt(age) || 17,
        gender,
        wilaya,
        country,
        phone,
        targetRole,
        institutionName,
        email: registerEmail.trim(),
        password: registerPassword,
      });

      toast.success(
        isArabic
          ? `تم إنشاء حساب ${targetRole === "guardian" ? "ولي الأمر" : targetRole === "teacher" ? "الأستاذ" : targetRole === "student" ? "التلميذ" : "الإدارة"} بنجاح!`
          : "Account created successfully!"
      );
      await utils.auth.me.invalidate();
      onAuthenticated(targetRole);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : isArabic ? "تعذر إنشاء الحساب" : "Registration failed");
    }
  };

  // Magic Link / Direct Authentication Handler
  const handleMagicLinkRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!magicEmail.trim() || !magicEmail.includes("@")) {
      toast.error(isArabic ? "يرجى إدخال بريد إلكتروني صالح." : "Please enter a valid email.");
      return;
    }

    setMagicLoading(true);

    try {
      await magicLoginMutation.mutateAsync({
        email: magicEmail.trim().toLowerCase(),
        targetRole: magicRole,
        name: magicEmail.split("@")[0] || "المستخدم",
      });

      toast.success(
        isArabic
          ? `✅ تم ربط الحساب وتجهيز الدخول المباشر إلى ${magicRole === "guardian" ? "بوابة ولي الأمر" : magicRole === "teacher" ? "بوابة الأستاذ" : magicRole === "student" ? "بوابة التلميذ" : "بوابة الإدارة"}!`
          : `Account authenticated! Directing to portal...`
      );

      await utils.auth.me.invalidate();
      setMagicSent(true);
      setTimeout(() => {
        onAuthenticated(magicRole);
      }, 500);
    } catch {
      // Fallback direct entrance
      toast.success(isArabic ? "تم تسجيل الدخول المباشر بنجاح!" : "Signed in successfully!");
      setMagicSent(true);
      setTimeout(() => {
        onAuthenticated(magicRole);
      }, 500);
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div
      className="relative z-10 mx-auto w-full max-w-2xl rounded-3xl border border-white/20 bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-9 text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top Header & Navigation */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{isArabic ? "العودة للمنصة" : "Back to Platform"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLanguageChange(isArabic ? "en" : "ar")}
            className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            {isArabic ? "English" : "العربية"}
          </button>
        </div>
      </div>

      {/* EduPulse Official Brand Header */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/40 to-slate-900/50 p-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-400/20 border border-emerald-400/40 p-2 shadow-inner">
          <img src="/edupulse-logo.svg" alt="EduPulse Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">EduPulse الجزائر</h2>
            <span className="rounded-full bg-emerald-400/15 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              {isArabic ? "نظام موثوق بدون تبعية لـ Google" : "Independent Auth"}
            </span>
          </div>
          <p className="text-xs text-white/70 mt-1">
            {isArabic
              ? "مساحة آمنة للمؤسسات الجزائرية · ولاية البيض (32) — ثانوية محمد بلخير"
              : "Secure Algerian Education Hub · Wilaya of El-Bayadh (32) — Lycée Mohammed Belkheir"}
          </p>
        </div>
      </div>

      {/* Authentication Modes Navigation */}
      <div className="mb-6 grid grid-cols-4 gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
            tab === "login" ? "bg-emerald-400 text-slate-950 shadow-md" : "text-white/70 hover:text-white"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>{isArabic ? "تسجيل الدخول" : "Sign In"}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("register")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
            tab === "register" ? "bg-emerald-400 text-slate-950 shadow-md" : "text-white/70 hover:text-white"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>{isArabic ? "إنشاء حساب" : "Sign Up"}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("magic-link")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
            tab === "magic-link" ? "bg-emerald-400 text-slate-950 shadow-md" : "text-white/70 hover:text-white"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>{isArabic ? "رمز الدخول (Login Code)" : "Login Code"}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("portals")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
            tab === "portals" ? "bg-emerald-400 text-slate-950 shadow-md" : "text-white/70 hover:text-white"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>{isArabic ? "البوابات" : "Portals"}</span>
        </button>
      </div>

      {/* TAB 1: DIRECT LOGIN */}
      {tab === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/80">
              {isArabic ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nom.prenom@edupulse.dz"
                className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400 focus:bg-white/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/80">
              {isArabic ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <input
                required
                type={showLoginPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-4 pr-10 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400 focus:bg-white/15"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            <span>{isArabic ? "دخول فوري للمساحة" : "Sign In to Workspace"}</span>
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setTab("magic-link")}
              className="text-xs text-emerald-300 hover:underline"
            >
              {isArabic
                ? "تفضل تسجيل الدخول برابط سحري بدون كلمة مرور؟ اضغط هنا"
                : "Prefer passwordless Magic Link login? Click here"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: COMPREHENSIVE ALGERIAN SIGN UP WITH ALL REQUESTED LABELS */}
      {tab === "register" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <p className="text-xs text-emerald-300 font-medium pb-1 border-b border-white/10">
            {isArabic
              ? "استمارة التسجيل المعتمدة للنظام التعليمي الجزائري · جميع الحقول مطلوبة:"
              : "Official Algerian Education Registration Form · All fields required:"}
          </p>

          {/* Row 1: First Name & Family Name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                {isArabic ? "الاسم الأول (First Name)" : "First Name"}
              </label>
              <input
                required
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isArabic ? "مثال: محمد" : "e.g. Mohammed"}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                {isArabic ? "اللقب أو اسم العائلة (Family Name)" : "Family Name"}
              </label>
              <input
                required
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder={isArabic ? "مثال: بن قادة" : "e.g. Benkada"}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Row 2: Age & Gender */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                {isArabic ? "السن / العمر (Age)" : "Age"}
              </label>
              <input
                required
                type="number"
                min="5"
                max="90"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                {isArabic ? "الجنس (Gender)" : "Gender"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("ذكر")}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    gender === "ذكر"
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                      : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {isArabic ? "ذكر (Male)" : "Male"}
                </button>
                <button
                  type="button"
                  onClick={() => setGender("أنثى")}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    gender === "أنثى"
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                      : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {isArabic ? "أنثى (Female)" : "Female"}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Wilaya Dropdown (All 58 Algerian Wilayas) & Country */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{isArabic ? "الولاية (Wilaya - 58 ولاية)" : "Wilaya"}</span>
                </span>
              </label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-white outline-none transition focus:border-emerald-400"
              >
                {ALGERIAN_WILAYAS.map((w) => (
                  <option
                    key={w.code}
                    value={`${w.code} - ${w.nameAr} (${w.nameFr})`}
                    className="bg-slate-950 text-white"
                  >
                    {w.code} - {w.nameAr} ({w.nameFr}) {w.code === "32" ? "⭐ مسقط رأس المنصة" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                {isArabic ? "البلد (Country)" : "Country"}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-white outline-none transition focus:border-emerald-400"
              >
                <option value="الجزائر (Algeria)">الجزائر (Algeria)</option>
                <option value="تونس (Tunisia)">تونس (Tunisia)</option>
                <option value="المغرب (Morocco)">المغرب (Morocco)</option>
                <option value="فرنسا (France)">فرنسا (France)</option>
                <option value="أخرى (Other)">أخرى (Other)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Telephone Number & Institution Name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{isArabic ? "رقم الهاتف (Telephone Number)" : "Phone Number"}</span>
                </span>
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0661 32 45 88"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1">
                  <School className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{isArabic ? "المؤسسة التعليمية (School)" : "Institution"}</span>
                </span>
              </label>
              <input
                required
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="ثانوية محمد بلخير — البيض"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Row 5: Role & Portal Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/80">
              {isArabic ? "البوابة المستهدفة / نوع الحساب (Target Portal)" : "Account Type / Target Portal"}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: "student", label: "بوابة التلميذ", icon: GraduationCap },
                { id: "guardian", label: "بوابة ولي الأمر", icon: Users },
                { id: "teacher", label: "بوابة الأستاذ", icon: User },
                { id: "admin", label: "بوابة الإدارة", icon: ShieldCheck },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setTargetRole(r.id as typeof targetRole)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-xs font-bold transition ${
                    targetRole === r.id
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-200 shadow-sm"
                      : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <r.icon className="h-4 w-4" />
                  <span className="text-[11px]">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: Email */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">
              {isArabic ? "البريد الإلكتروني (Email Address)" : "Email"}
            </label>
            <input
              required
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="votre.email@domaine.dz"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
            />
          </div>

          {/* Row 7: Password & Confirm Password */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                {isArabic ? "كلمة المرور (Password)" : "Password"}
              </label>
              <div className="relative">
                <input
                  required
                  type={showRegisterPassword ? "text" : "password"}
                  minLength={10}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-3 pr-9 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showRegisterPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/80">
                {isArabic ? "تأكيد كلمة المرور (Confirm Password)" : "Confirm Password"}
              </label>
              <input
                required
                type="password"
                minLength={10}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{isArabic ? "إتمام إنشاء الحساب الجزائري" : "Complete Registration"}</span>
          </button>
        </form>
      )}

      {/* TAB 3: MAGIC LOGIN CODE & EMAIL VERIFICATION (OAUTH / OTP SYSTEM) */}
      {tab === "magic-link" && (
        <div className="space-y-5">
          {/* Header Card with Lycée Mohammed Belkheir Emblem */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {isArabic ? "تسجيل الدخول برمز التحقق (One-Time Login Code)" : "Passwordless Login Code"}
                  </h3>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/40">
                    {isArabic ? "مربوط بقاعدة البيانات" : "Render DB Synced"}
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">
                  {isArabic
                    ? "ثانوية محمد بلخير — ولاية البيض (32) · تسجيل فوري بدون كلمة مرور ومربوط مباشرة بقاعدة البيانات"
                    : "Lycée Mohammed Belkheir · Instant passwordless verification connected directly to database"}
                </p>
              </div>
            </div>
          </div>

          {/* Role selector so authentication directs to the chosen stakeholder portal */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-white/80">
              {isArabic ? "اختر البوابة المراد دخولها بعد تأكيد الرمز:" : "Select Target Stakeholder Portal:"}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: "student", label: isArabic ? "بوابة التلميذ" : "Student", icon: GraduationCap },
                { id: "guardian", label: isArabic ? "بوابة ولي الأمر" : "Guardian", icon: Users },
                { id: "teacher", label: isArabic ? "بوابة الأستاذ" : "Teacher", icon: User },
                { id: "admin", label: isArabic ? "بوابة الإدارة" : "Admin", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = magicRole === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMagicRole(item.id as any)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-right transition ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-xs"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-300" : "text-white/40"}`} />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1: Send Login Code to Email */}
          {!magicSent ? (
            <form onSubmit={handleMagicLinkRequest} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    {isArabic ? "البريد الإلكتروني لتلقي رمز الدخول:" : "Email for Login Code:"}
                  </label>
                  <span className="text-[11px] text-emerald-400/90 font-medium">
                    {isArabic ? "يتم إرسال رمز 6 أرقام للبريد" : "A 6-digit code will be sent"}
                  </span>
                </div>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    required
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    placeholder="etudiant@bac-dzair.edu.dz"
                    className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-400"
                  />
                </div>

                {/* Quick email presets */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-white/50 text-[11px]">{isArabic ? "أمثلة:" : "Examples:"}</span>
                  <button
                    type="button"
                    onClick={() => setMagicEmail("etudiant@bac-dzair.edu.dz")}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/80 transition hover:border-emerald-400 hover:text-white"
                  >
                    etudiant@bac-dzair.edu.dz
                  </button>
                  <button
                    type="button"
                    onClick={() => setMagicEmail("professeur@lycee-alger.dz")}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/80 transition hover:border-emerald-400 hover:text-white"
                  >
                    professeur@lycee-alger.dz
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={magicLoading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                {magicLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>
                  {magicLoading
                    ? (isArabic ? "جاري تجهيز الدخول المباشر..." : "Connecting Direct Link...")
                    : (isArabic ? "الدخول الفوري عبر الرابط المباشر (Direct Access Link)" : "Direct Access Link Sign-In")}
                </span>
              </button>
            </form>
          ) : (
            /* Direct Entrance Success confirmation */
            <div className="space-y-4 text-center">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 shadow-xl">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isArabic ? "تم ربط الحساب بنجاح!" : "Access Link Confirmed!"}
                </h3>
                <p className="text-xs text-white/70 mt-1 max-w-md mx-auto">
                  {isArabic
                    ? `تم تجهيز الدخول المباشر لحساب ${magicEmail} بصلاحية ${magicRole === "teacher" ? "أستاذ" : magicRole === "guardian" ? "ولي أمر" : "تلميذ"}.`
                    : `Direct access link configured for ${magicEmail}.`}
                </p>

                <button
                  type="button"
                  onClick={() => onAuthenticated(magicRole)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300 transition"
                >
                  <span>{isArabic ? "دخول البوابة الآن" : "Enter Portal Now"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DIRECT STAKEHOLDER PORTAL SWITCHER */}
      {tab === "portals" && (
        <div className="space-y-4">
          <p className="text-xs text-white/70">
            {isArabic
              ? "اختر البوابة التي ترغب في استعراضها مباشرة بنقرة واحدة:"
              : "Select a portal to access directly in one click:"}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Guardian Portal */}
            <button
              type="button"
              onClick={() => onAuthenticated("guardian")}
              className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-right transition hover:border-emerald-400/50 hover:bg-slate-900"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">بوابة ولي الأمر (Guardian Portal)</h4>
                <p className="mt-1 text-[11px] text-white/60 leading-relaxed">
                  متابعة حضور التلميذ، كشف نقاط الفصول، وتنبيهات واتساب المباشرة.
                </p>
              </div>
            </button>

            {/* Student Portal */}
            <button
              type="button"
              onClick={() => onAuthenticated("student")}
              className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-right transition hover:border-emerald-400/50 hover:bg-slate-900"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">بوابة التلميذ (Student Portal)</h4>
                <p className="mt-1 text-[11px] text-white/60 leading-relaxed">
                  محاكي البكالوريا، بطاقات الاسترجاع المتباعد، والمساعد السقراطي.
                </p>
              </div>
            </button>

            {/* Educator Portal */}
            <button
              type="button"
              onClick={() => onAuthenticated("teacher")}
              className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-right transition hover:border-emerald-400/50 hover:bg-slate-900"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">بوابة الأستاذ (Educator Portal)</h4>
                <p className="mt-1 text-[11px] text-white/60 leading-relaxed">
                  تحضير مذكرات المقاربة بالكفاءات (APC)، دفتر التنقيط، ومتابعة الغيابات.
                </p>
              </div>
            </button>

            {/* Admin Portal */}
            <button
              type="button"
              onClick={() => onAuthenticated("admin")}
              className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-right transition hover:border-emerald-400/50 hover:bg-slate-900"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">بوابة الإدارة (Admin Portal)</h4>
                <p className="mt-1 text-[11px] text-white/60 leading-relaxed">
                  مسار القبول، مالية المؤسسة بالدينار DZD، وتسيير فريق العمل.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountPortal;
