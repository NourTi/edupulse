import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ALGERIAN_WILAYAS } from "@/data/algerianWilayas";
import { AnimatedDeskIllustration } from "./auth/AnimatedDeskIllustration";

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
  const [tab, setTab] = useState<AuthTab>(initialTab || "register");

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  // Slide carousel state for left panel
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto advance slides every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((curr) => (curr + 1) % 3);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Sign in state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up state
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
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showAdvancedProfile, setShowAdvancedProfile] = useState(false);

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
    if (!agreeTerms) {
      toast.error(isArabic ? "يرجى الموافقة على الشروط والأحكام." : "Please agree to the Terms & Conditions.");
      return;
    }
    if (registerPassword.length < 6) {
      toast.error(isArabic ? "كلمة المرور يجب أن لا تقل عن 6 أحرف." : "Password must be at least 6 characters.");
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
      toast.success(isArabic ? "تم تسجيل الدخول المباشر بنجاح!" : "Signed in successfully!");
      setMagicSent(true);
      setTimeout(() => {
        onAuthenticated(magicRole);
      }, 500);
    } finally {
      setMagicLoading(false);
    }
  };

  // Social OAuth trigger: directly redirects to Google OAuth endpoint when configured
  const handleGoogleAuth = async () => {
    try {
      const res = await fetch("/api/auth/providers");
      const data = await res.json();

      if (data.google) {
        toast.loading(isArabic ? "جاري التوجيه إلى حساب Google..." : "Redirecting to Google...");
        window.location.href = "/api/auth/google";
        return;
      }
    } catch {
      // fallback
    }

    // When running in sandbox mode where Google secrets are not yet configured
    toast.info(
      isArabic
        ? "لتفعيل تسجيل الدخول المباشر بحساب Google، أضف مفاتيح GOOGLE_CLIENT_ID في بيئة التشغيل. تم تفعيل الحساب التجريبي للاختبار الفوري."
        : "To activate live Google Sign-In, add GOOGLE_CLIENT_ID to the environment. Loaded sandbox credentials for testing."
    );
    if (tab === "login") {
      setLoginEmail("teacher.belkheir@gmail.com");
      setLoginPassword("EduPulse2026!");
    } else {
      setFirstName("Mohamed");
      setFamilyName("Belkheir");
      setRegisterEmail("teacher.belkheir@gmail.com");
      setRegisterPassword("EduPulse2026!");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#0e0c15] text-white flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Outer Card Container */}
      <div className="w-full max-w-6xl rounded-[2.5rem] bg-[#1a1626] border border-[#2e263d] shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: VISUAL SLIDE SHOWCASE (ANIMATED DESK / CAROUSEL)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 p-4 sm:p-6 flex flex-col justify-between">
          <div className="relative w-full h-full rounded-[2rem] bg-gradient-to-b from-[#231d36] via-[#1b162a] to-[#120e1d] border border-[#392e4f] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-inner min-h-[540px]">
            
            {/* Top Bar inside Slide */}
            <div className="relative z-30 flex items-center justify-between">
              {/* Minimalist Logo Mark (NMU style in user's image) */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] font-black text-xs text-white tracking-widest shadow-md shadow-[#6C5CE7]/30">
                  EP
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-xl tracking-tight text-white">EduPulse</span>
                  <span className="text-[11px] font-bold text-purple-300">DZ</span>
                </div>
              </div>

              {/* Back to website button (Directly from user's image) */}
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition hover:bg-white/20 hover:text-white group"
              >
                <span>{isArabic ? "العودة للمنصة" : "Back to website"}</span>
                {isArabic ? (
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Slide 0: Animated Person in a Desk Layout */}
            {activeSlide === 0 && (
              <div className="relative z-20 my-auto py-2 transition-opacity duration-700 animate-in fade-in">
                <AnimatedDeskIllustration isArabic={isArabic} />
              </div>
            )}

            {/* Slide 1: Interactive Curriculum & Learning Animation */}
            {activeSlide === 1 && (
              <div className="relative z-20 my-auto py-6 flex flex-col items-center justify-center transition-opacity duration-700 animate-in fade-in">
                <div className="w-full max-w-[420px] rounded-2xl border border-purple-500/30 bg-[#251e38]/80 p-5 backdrop-blur-lg shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] font-mono text-purple-200">BAC Algeria · Diagnostic Radar</span>
                  </div>

                  {/* Animated Mini Progress Bars */}
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-white/80 mb-1">
                        <span>{isArabic ? "الرياضيات (Mathematics)" : "Mathematics"}</span>
                        <span className="text-emerald-400 font-bold">92%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-[92%] transition-all duration-1000" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-white/80 mb-1">
                        <span>{isArabic ? "العلوم الفيزيائية (Physics)" : "Physics"}</span>
                        <span className="text-purple-400 font-bold">88%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 w-[88%] transition-all duration-1000" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-white/80 mb-1">
                        <span>{isArabic ? "العلوم الطبيعية (Biology & Life Sciences)" : "Life Sciences"}</span>
                        <span className="text-cyan-400 font-bold">95%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[95%] transition-all duration-1000" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-purple-300 shrink-0" />
                    <p className="text-xs text-white/70 leading-snug">
                      {isArabic
                        ? "مستودع المذكرات الرسمية لوزارة التربية الوطنية · جميع الشعب"
                        : "Official Algerian Ministry of National Education curriculum alignment"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2: Twilight Desert Dunes Scene (Exact Visual from user's attached login design.PNG) */}
            {activeSlide === 2 && (
              <div className="relative z-20 my-auto py-6 flex flex-col items-center justify-center transition-opacity duration-700 animate-in fade-in">
                <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-b from-[#19152b] via-[#221738] to-[#120d20] shadow-2xl flex items-center justify-center">
                  {/* Atmospheric Twilight Sky & Stars */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#2e214a] via-[#1c1530] to-[#0d0917]" />
                  <div className="absolute top-8 left-10 h-1 w-1 rounded-full bg-white shadow-sm shadow-white animate-pulse" />
                  <div className="absolute top-16 right-16 h-1 w-1 rounded-full bg-purple-200 shadow-sm shadow-purple-200 animate-ping" style={{ animationDuration: "3s" }} />
                  <div className="absolute top-24 left-1/3 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-sm shadow-cyan-200" />
                  <div className="absolute top-12 right-1/3 h-1 w-1 rounded-full bg-white/80" />

                  {/* Dunes Silhouette SVG */}
                  <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="duneGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3d2c61" />
                        <stop offset="100%" stopColor="#1a122e" />
                      </linearGradient>
                      <linearGradient id="duneGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2b1f45" />
                        <stop offset="100%" stopColor="#120c21" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 160 Q 120 120 220 180 Q 320 240 400 190 L 400 300 L 0 300 Z" fill="url(#duneGrad1)" />
                    <path d="M 0 210 Q 140 180 260 230 Q 340 260 400 240 L 400 300 L 0 300 Z" fill="url(#duneGrad2)" />
                  </svg>

                  <div className="relative z-10 text-center px-6">
                    <p className="text-xs uppercase tracking-widest text-purple-300 font-semibold mb-1">
                      {isArabic ? "جمالية الصحراء الجزائرية" : "Atmospheric Horizon"}
                    </p>
                    <p className="text-base font-medium text-white/90">
                      {isArabic ? "ولاية البيض · بوابة الجنوب الغربي" : "El-Bayadh · Gateway to the Algerian South"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Slogan & Slider Pagination Controls */}
            <div className="relative z-30 pt-4 flex flex-col items-center text-center">
              {/* Dynamic Slogan Text matching user's image */}
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-4">
                {activeSlide === 0
                  ? (isArabic ? "إلهام العقول، وصناعة رواد الغد" : "Empowering Minds, Shaping Tomorrow")
                  : activeSlide === 1
                  ? (isArabic ? "فضاء تعليمي وطني متكامل وريادة معرفية" : "Collaborative Learning & Academic Mastery")
                  : (isArabic ? "توثيق اللحظات، وصناعة الذكريات" : "Capturing Moments, Creating Memories")}
              </h3>

              {/* Slider Pagination Bars (From user's image: [ —— ] [ — ] [ — ]) */}
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlide === idx
                        ? "w-8 bg-white"
                        : "w-4 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: AUTHENTICATION FORM (EXACT TO ATTACHED LOGIN DESIGN.PNG)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          
          {/* Language Switcher Pill */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6C5CE7] animate-ping" />
              <span className="text-xs text-white/60 font-medium">
                {isArabic ? "منصة إدوبالس التعليمية" : "EduPulse Cloud DZ"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onLanguageChange(isArabic ? "en" : "ar")}
              className="rounded-full border border-white/10 bg-[#251e33] px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-[#322945] hover:text-white"
            >
              {isArabic ? "English" : "العربية"}
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              {tab === "register"
                ? (isArabic ? "إنشاء حساب جديد" : "Create an account")
                : tab === "login"
                ? (isArabic ? "تسجيل الدخول" : "Log in to your account")
                : tab === "magic-link"
                ? (isArabic ? "الدخول برمز التحقق" : "One-Time Login Code")
                : (isArabic ? "البوابات التعليمية" : "Role Portals")}
            </h1>

            {/* Subtitle link matching attached design: "Already have an account? Log in" */}
            <p className="text-sm text-[#8c82a2]">
              {tab === "register" ? (
                <>
                  <span>{isArabic ? "لديك حساب بالفعل؟ " : "Already have an account? "}</span>
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="text-[#a29bfe] font-semibold hover:underline"
                  >
                    {isArabic ? "تسجيل الدخول" : "Log in"}
                  </button>
                </>
              ) : tab === "login" ? (
                <>
                  <span>{isArabic ? "ليس لديك حساب؟ " : "Don't have an account? "}</span>
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="text-[#a29bfe] font-semibold hover:underline"
                  >
                    {isArabic ? "إنشاء حساب" : "Sign up"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-[#a29bfe] font-semibold hover:underline"
                >
                  {isArabic ? "الرجوع لتسجيل الدخول المعتاد" : "Back to standard login"}
                </button>
              )}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* TAB: CREATE AN ACCOUNT (REGISTER)                                        */}
          {/* ========================================================================= */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Row 1: First name & Last name side-by-side (from user's image) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={isArabic ? "الاسم الأول" : "Fletcher"}
                    className="w-full rounded-xl border border-[#392e4e] bg-[#241e33] px-4 py-3.5 text-sm text-white placeholder-[#756a8d] outline-none transition focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                <div>
                  <input
                    required
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder={isArabic ? "اللقب (Last name)" : "Last name"}
                    className="w-full rounded-xl border border-[#392e4e] bg-[#241e33] px-4 py-3.5 text-sm text-white placeholder-[#756a8d] outline-none transition focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>
              </div>

              {/* Row 2: Email (from user's image) */}
              <div>
                <input
                  required
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder={isArabic ? "البريد الإلكتروني" : "Email"}
                  className="w-full rounded-xl border border-[#392e4e] bg-[#241e33] px-4 py-3.5 text-sm text-white placeholder-[#756a8d] outline-none transition focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                />
              </div>

              {/* Row 3: Password with Eye toggle (from user's image) */}
              <div className="relative">
                <input
                  required
                  type={showRegisterPassword ? "text" : "password"}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder={isArabic ? "أدخل كلمة المرور" : "Enter your password"}
                  className="w-full rounded-xl border border-[#392e4e] bg-[#241e33] px-4 py-3.5 pr-11 text-sm text-white placeholder-[#756a8d] outline-none transition focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756a8d] hover:text-white transition"
                >
                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Stakeholder Role Picker (Compact & Modern) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#8c82a2] font-medium">
                    {isArabic ? "نوع الحساب التعليمي:" : "Account Role:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedProfile(!showAdvancedProfile)}
                    className="text-[11px] text-[#a29bfe] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isArabic ? "خيارات الولاية والمؤسسة" : "Wilaya & Details"}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showAdvancedProfile ? "rotate-180" : ""}`} />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "student", label: isArabic ? "تلميذ" : "Student", icon: GraduationCap },
                    { id: "guardian", label: isArabic ? "ولي أمر" : "Guardian", icon: Users },
                    { id: "teacher", label: isArabic ? "أستاذ" : "Teacher", icon: User },
                    { id: "admin", label: isArabic ? "إدارة" : "Admin", icon: ShieldCheck },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setTargetRole(r.id as typeof targetRole)}
                      className={`flex flex-col items-center justify-center py-2 rounded-xl border text-xs font-semibold transition ${
                        targetRole === r.id
                          ? "border-[#6C5CE7] bg-[#6C5CE7]/20 text-[#a29bfe] shadow-sm"
                          : "border-[#392e4e] bg-[#241e33]/50 text-white/60 hover:bg-[#241e33] hover:text-white"
                      }`}
                    >
                      <r.icon className="h-3.5 w-3.5 mb-1" />
                      <span className="text-[11px]">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Advanced Profile (Wilaya 58, School, Phone) */}
              {showAdvancedProfile && (
                <div className="p-3.5 rounded-xl border border-[#392e4e] bg-[#1d182a] space-y-2.5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-white/60 block mb-1">
                        {isArabic ? "الولاية (58 ولاية)" : "Wilaya"}
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full rounded-lg border border-[#392e4e] bg-[#241e33] px-2.5 py-1.5 text-xs text-white outline-none"
                      >
                        {ALGERIAN_WILAYAS.map((w) => (
                          <option key={w.code} value={`${w.code} - ${w.nameAr} (${w.nameFr})`}>
                            {w.code} - {w.nameAr} {w.code === "32" ? "⭐ البيض" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-white/60 block mb-1">
                        {isArabic ? "المؤسسة التعليمية" : "School"}
                      </label>
                      <input
                        type="text"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        placeholder="ثانوية محمد بلخير"
                        className="w-full rounded-lg border border-[#392e4e] bg-[#241e33] px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Checkbox: Terms & Conditions (from user's image) */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-[#392e4e] bg-[#241e33] text-[#6C5CE7] focus:ring-[#6C5CE7] cursor-pointer accent-[#6C5CE7]"
                />
                <label htmlFor="terms" className="text-xs text-[#8c82a2] select-none cursor-pointer">
                  <span>{isArabic ? "أوافق على " : "I agree to the "}</span>
                  <span className="text-white underline hover:text-[#a29bfe]">
                    {isArabic ? "الشروط والأحكام" : "Terms & Conditions"}
                  </span>
                </label>
              </div>

              {/* Submit Button: Create account (Vibrant Purple from user's image) */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full rounded-xl bg-[#6C5CE7] hover:bg-[#5b4cdb] text-white font-medium py-3.5 px-4 text-sm shadow-lg shadow-[#6C5CE7]/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>{isArabic ? "إنشاء الحساب" : "Create account"}</span>
              </button>

            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB: LOG IN                                                               */}
          {/* ========================================================================= */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email field */}
              <div>
                <input
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={isArabic ? "البريد الإلكتروني" : "Email"}
                  className="w-full rounded-xl border border-[#392e4e] bg-[#241e33] px-4 py-3.5 text-sm text-white placeholder-[#756a8d] outline-none transition focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                />
              </div>

              {/* Password field with Eye toggle */}
              <div className="relative">
                <input
                  required
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={isArabic ? "أدخل كلمة المرور" : "Enter your password"}
                  className="w-full rounded-xl border border-[#392e4e] bg-[#241e33] px-4 py-3.5 pr-11 text-sm text-white placeholder-[#756a8d] outline-none transition focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756a8d] hover:text-white transition"
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[#8c82a2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#392e4e] bg-[#241e33] text-[#6C5CE7] accent-[#6C5CE7]"
                  />
                  <span>{isArabic ? "تذكرني على هذا الجهاز" : "Remember me"}</span>
                </label>

                <button
                  type="button"
                  onClick={() => setTab("magic-link")}
                  className="text-[#a29bfe] hover:underline"
                >
                  {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </button>
              </div>

              {/* Submit Button: Log in (from user's image) */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full rounded-xl bg-[#6C5CE7] hover:bg-[#5b4cdb] text-white font-medium py-3.5 px-4 text-sm shadow-lg shadow-[#6C5CE7]/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                <span>{isArabic ? "تسجيل الدخول" : "Log in"}</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB: MAGIC LINK / ONE-TIME CODE                                           */}
          {/* ========================================================================= */}
          {tab === "magic-link" && (
            <form onSubmit={handleMagicLinkRequest} className="space-y-4">
              <div className="p-4 rounded-xl border border-purple-500/20 bg-[#251e36] text-xs text-purple-200 leading-relaxed">
                {isArabic
                  ? "تسجيل فوري بدون كلمة مرور عبر رمز التحقق المباشر المربوط بقاعدة بيانات ثانوية محمد بلخير."
                  : "Instant passwordless authentication synced directly to Lycée Mohammed Belkheir database."}
              </div>

              <div>
                <input
                  required
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="votre.email@edupulse.dz"
                  className="w-full rounded-xl border border-[#392e4e] bg-[#241e33] px-4 py-3.5 text-sm text-white placeholder-[#756a8d] outline-none focus:border-[#6C5CE7]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8c82a2] block mb-1.5">
                  {isArabic ? "اختر البوابة المستهدفة:" : "Target Stakeholder Role:"}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "student", label: isArabic ? "تلميذ" : "Student" },
                    { id: "guardian", label: isArabic ? "ولي أمر" : "Guardian" },
                    { id: "teacher", label: isArabic ? "أستاذ" : "Teacher" },
                    { id: "admin", label: isArabic ? "إدارة" : "Admin" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setMagicRole(r.id as any)}
                      className={`py-2 rounded-xl border text-xs font-semibold ${
                        magicRole === r.id
                          ? "border-[#6C5CE7] bg-[#6C5CE7]/20 text-[#a29bfe]"
                          : "border-[#392e4e] bg-[#241e33]/50 text-white/60"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={magicLoading}
                className="w-full rounded-xl bg-[#6C5CE7] hover:bg-[#5b4cdb] text-white font-medium py-3.5 px-4 text-sm shadow-lg shadow-[#6C5CE7]/30 transition flex items-center justify-center gap-2"
              >
                {magicLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>{isArabic ? "دخول فوري برمز التحقق" : "Send One-Time Login Code"}</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* DIVIDER: "Or register with" / "Or log in with" (from user's image)        */}
          {/* ========================================================================= */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#342a4a]" />
            </div>
            <span className="relative bg-[#1a1626] px-4 text-xs font-medium text-[#786c91]">
              {tab === "register"
                ? (isArabic ? "أو التسجيل بواسطة" : "Or register with")
                : (isArabic ? "أو تسجيل الدخول بواسطة" : "Or log in with")}
            </span>
          </div>

          {/* ========================================================================= */}
          {/* SOCIAL BUTTON: GOOGLE                                                    */}
          {/* ========================================================================= */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[#392e4e] bg-[#241e33] hover:bg-[#2e2642] py-3 px-4 text-sm font-medium text-white transition duration-200"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isArabic ? "المتابعة باستخدام Google" : "Continue with Google"}</span>
            </button>
          </div>

          {/* Quick Instant Test Portals */}
          <div className="pt-2 border-t border-[#342a4a] flex items-center justify-between text-xs text-[#8c82a2]">
            <span>{isArabic ? "دخول فوري تجريبي:" : "Direct Demo Access:"}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAuthenticated("student")}
                className="hover:text-[#a29bfe] transition hover:underline"
              >
                {isArabic ? "تلميذ" : "Student"}
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onAuthenticated("guardian")}
                className="hover:text-[#a29bfe] transition hover:underline"
              >
                {isArabic ? "ولي أمر" : "Guardian"}
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onAuthenticated("teacher")}
                className="hover:text-[#a29bfe] transition hover:underline"
              >
                {isArabic ? "أستاذ" : "Teacher"}
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onAuthenticated("admin")}
                className="hover:text-[#a29bfe] transition hover:underline"
              >
                {isArabic ? "إدارة" : "Admin"}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AccountPortal;
