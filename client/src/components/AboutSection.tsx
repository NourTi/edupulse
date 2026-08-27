import { ArrowUpRight, BookOpenCheck, BriefcaseBusiness, GraduationCap, Languages, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

export const PROFILE_PDF_URL = "/manus-storage/main_8a3b9e44.pdf";

type AboutSectionProps = { isArabic: boolean };

export const aboutAudiences = [
  { icon: GraduationCap, ar: "المدارس الخاصة", en: "Private schools", arText: "سجل موحد للتسجيل والحضور والتقييم والتواصل.", enText: "One operating record for enrollment, attendance, assessment, and communication." },
  { icon: Languages, ar: "مراكز اللغات", en: "Language centres", arText: "متابعة CEFR ومهارات اللغة وتقارير التقدم.", enText: "CEFR progress, language skills, and readable progress reports." },
  { icon: BriefcaseBusiness, ar: "المربون المستقلون", en: "Independent educators", arText: "مهام، موارد، متابعات، ومجموعات في مساحة عملية.", enText: "Tasks, resources, follow-ups, and groups in one practical workspace." },
  { icon: UsersRound, ar: "الفرق الجامعية", en: "University teams", arText: "تنظيم المقررات والمتعلمين والمعرفة التعليمية.", enText: "Organize courses, learners, educator work, and institutional knowledge." },
];

export default function AboutSection({ isArabic }: AboutSectionProps) {
  return (
    <section id="about" className="border-t border-slate-200 bg-[#f7fbfc] px-6 py-24 text-[#07384a] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#087f8c]">
              <span className="h-px w-9 bg-[#087f8c]" />
              {isArabic ? "عن EduPulse" : "About EduPulse"}
            </div>
            <h2 className="text-display max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              {isArabic ? <>ذاكرة تشغيلية<br /><em className="not-italic text-[#087f8c]">للتعليم الذي يتحرك.</em></> : <>One operating memory<br /><em className="not-italic text-[#087f8c]">for education in motion.</em></>}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#496875] sm:text-lg">
              {isArabic ? "EduPulse مساحة عربية أولاً تجمع معلومات المتعلم، التشغيل اليومي، متابعة المربي، والمعرفة المعتمدة في نظام واضح يناسب المؤسسات التعليمية الجزائرية." : "EduPulse is an Arabic-first education operations workspace that brings learner information, daily work, educator follow-up, and approved knowledge into one clear system for Algerian education."}
            </p>
            <a href={PROFILE_PDF_URL} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#07384a] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#07384a]/15 transition hover:-translate-y-0.5">
              {isArabic ? "اقرأ ملف المنصة PDF" : "Read the platform profile PDF"}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {aboutAudiences.map(({ icon: Icon, ar, en, arText, enText }) => (
              <article key={en} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(7,56,74,0.07)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(7,56,74,0.11)]">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e1f6f4] text-[#087f8c]"><Icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-bold">{isArabic ? ar : en}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5a737d]">{isArabic ? arText : enText}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(7,56,74,0.08)] sm:grid-cols-3 sm:p-7">
          <div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0d6] text-[#c56d10]"><ShieldCheck className="h-5 w-5" /></div><div><h3 className="font-bold">{isArabic ? "بيانات بحسب الدور" : "Role-aware data"}</h3><p className="mt-1 text-sm leading-6 text-[#5a737d]">{isArabic ? "كل مستخدم يرى ما يحتاجه فقط." : "Each user sees only what their role requires."}</p></div></div>
          <div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eee7ff] text-[#7452c8]"><BookOpenCheck className="h-5 w-5" /></div><div><h3 className="font-bold">{isArabic ? "معرفة معتمدة" : "Grounded knowledge"}</h3><p className="mt-1 text-sm leading-6 text-[#5a737d]">{isArabic ? "إجابات موثقة لا تخمينات." : "Cited answers instead of invented policy."}</p></div></div>
          <div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffe4e9] text-[#c34c63]"><Sparkles className="h-5 w-5" /></div><div><h3 className="font-bold">{isArabic ? "مصمم للمربي" : "Built for educators"}</h3><p className="mt-1 text-sm leading-6 text-[#5a737d]">{isArabic ? "تتبع العمل الذي لا يظهر في السجل التقليدي." : "Track the work ordinary school records miss."}</p></div></div>
        </div>
      </div>
    </section>
  );
}
