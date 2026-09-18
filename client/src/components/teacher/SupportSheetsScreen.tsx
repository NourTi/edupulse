import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Award,
  Shield,
  Zap,
  Copy,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { CurriculumMemoryBar } from "./CurriculumMemoryBar";
import { GenerationProgressState } from "./GenerationProgressState";
import { ExportHubBar } from "./ExportHubBar";

interface SupportSheetsScreenProps {
  isArabic?: boolean;
  defaultSubject?: string;
  defaultGrade?: string;
  topSubjects?: string[];
  topGrades?: string[];
  onCurriculumUpdate?: (subject: string, grade: string) => void;
}

interface TierData {
  easy: string;
  standard: string;
  advanced: string;
  fullMarkdown: string;
}

export function SupportSheetsScreen({
  isArabic = true,
  defaultSubject = "الرياضيات",
  defaultGrade = "3 ثانوي",
  topSubjects = [],
  topGrades = [],
  onCurriculumUpdate,
}: SupportSheetsScreenProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"ar" | "fr" | "both">("ar");
  const [mode, setMode] = useState<"quick" | "detailed">("detailed");

  const [loading, setLoading] = useState(false);
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [activeTierTab, setActiveTierTab] = useState<"easy" | "standard" | "advanced">("easy");
  const [regeneratingTier, setRegeneratingTier] = useState<string | null>(null);

  const PROGRESS_STEPS = isArabic
    ? [
        "تحليل الفروق الفردية والعوائق الإدراكية الشائعة...",
        "تصميم ورقة المستوى الميسّر (Easy) بدعائم ونماذج موجهة...",
        "معايرة ورقة المستوى القياسي (Standard) وفق كفاءات المنهاج...",
        "صياغة وضعيات التحدي والتعميق للمستوى المتقدم (Advanced)...",
      ]
    : [
        "Analyzing cognitive profiles & learning bottlenecks...",
        "Building scaffolded guidance for the Easy tier...",
        "Calibrating standard curriculum mastery for the Standard tier...",
        "Designing open-ended challenges for the Advanced tier...",
      ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error(isArabic ? "يرجى إدخال موضوع أوراق الدعم" : "Please enter support sheets topic");
      return;
    }

    setLoading(true);
    setTierData(null);

    try {
      const res = await fetch("/api/teacher-generators/support-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          language,
          mode,
          gradeLevel: defaultGrade,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.output) {
        throw new Error(data.error || "Failed to generate support sheets");
      }

      setTierData(data.output);
      onCurriculumUpdate?.(subject, defaultGrade);

      toast.success(
        isArabic
          ? "أوراق العمل المتمايزة جاهزة لتغطية كافة الفروق الفردية!"
          : "Your differentiated worksheets are ready for classroom use!",
        {
          description: isArabic
            ? "تم توليد 3 أوراق عمل مستقلة (ميسّر، قياسي، متقدم) قابلة للتجديد الفردي."
            : "Generated 3 distinct tiers: Easy, Standard, and Advanced.",
        }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "تعذر توليد أوراق الدعم");
    } finally {
      setLoading(false);
    }
  };

  // Sheet-Level Regeneration for individual tier
  const handleRegenerateTier = async (tierKey: "easy" | "standard" | "advanced") => {
    setRegeneratingTier(tierKey);
    const tierTitle =
      tierKey === "easy"
        ? isArabic ? "ورقة الدعم 1: المستوى الميسّر (Easy)" : "Worksheet 1: Easy"
        : tierKey === "standard"
        ? isArabic ? "ورقة الدعم 2: المستوى القياسي (Standard)" : "Worksheet 2: Standard"
        : isArabic ? "ورقة الدعم 3: المستوى المتقدم (Advanced)" : "Worksheet 3: Advanced";

    try {
      const res = await fetch("/api/teacher-generators/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatorType: "support_sheets",
          sectionKey: tierKey,
          sectionTitle: tierTitle,
          subject,
          topic,
          gradeLevel: defaultGrade,
          language,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.regeneratedContent) {
        throw new Error(data.error || "Failed to regenerate tier");
      }

      if (tierData) {
        const updated = {
          ...tierData,
          [tierKey]: data.regeneratedContent,
          fullMarkdown: `${tierKey === "easy" ? data.regeneratedContent : tierData.easy}\n\n---\n\n${
            tierKey === "standard" ? data.regeneratedContent : tierData.standard
          }\n\n---\n\n${tierKey === "advanced" ? data.regeneratedContent : tierData.advanced}`,
        };
        setTierData(updated);
      }

      toast.success(
        isArabic
          ? `تم إعادة توليد ورقة "${tierTitle}" بنجاح!`
          : `Worksheet "${tierKey.toUpperCase()}" regenerated successfully!`
      );
    } catch (err: any) {
      toast.error(err?.message || "تعذر تجديد الورقة");
    } finally {
      setRegeneratingTier(null);
    }
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#14532d] via-[#166534] to-[#0f172a] p-6 text-white shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
              <Layers className="h-3.5 w-3.5" />
              <span>{isArabic ? "البيداغوجيا الفارقية والتعليم المتمايز" : "Differentiated Instruction"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مولّد أوراق الدعم والتمايز (3 مستويات)" : "Differentiated Support Sheets"}
            </h1>
            <p className="mt-1 text-sm text-emerald-100/80">
              {isArabic
                ? "توليد 3 أوراق عمل مستقلة معنونة بـ Easy و Standard و Advanced لمراعاة الفروق الفردية مع إمكانية تجديد كل ورقة بشكل منفصل."
                : "Produces 3 separate worksheets: Easy, Standard, and Advanced, each independently regenerable."}
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm">
            <span className="text-[11px] text-emerald-200 block uppercase tracking-wider">
              {isArabic ? "المستويات البيداغوجية" : "Tiers"}
            </span>
            <span className="text-xl font-bold text-amber-300">3 Tiers</span>
            <span className="text-[11px] text-white/60 block">{isArabic ? "ميسّر · قياسي · متقدم" : "Easy / Std / Adv"}</span>
          </div>
        </div>
      </div>

      {/* Curriculum Memory */}
      <CurriculumMemoryBar
        currentSubject={subject}
        currentGrade={defaultGrade}
        topSubjects={topSubjects}
        topGrades={topGrades}
        onSelectSubject={(s) => setSubject(s)}
        onSelectGrade={() => {}}
        isArabic={isArabic}
      />

      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "المادة الدراسية" : "Subject"}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isArabic ? "مثال: الرياضيات، الفيزياء، اللغة الإنجليزية..." : "e.g., Mathematics"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "لغة أوراق الدعم" : "Language"}
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/15 bg-white/10 p-1">
                {[
                  { id: "ar", label: "عربي" },
                  { id: "fr", label: "Français" },
                  { id: "both", label: isArabic ? "ثنائي" : "Both" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id as any)}
                    className={`rounded-lg py-1.5 text-xs font-medium transition ${
                      language === l.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {isArabic ? "موضوع الدرس أو المهارة المستهدفة بالدعم" : "Target Topic / Competency"}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                isArabic
                  ? "مثال: حساب التكامل والمساحات المستوية، حل جمل المعادلات الخطية، المفعول المطلق وتطبيقاته..."
                  : "e.g., Integral Calculus & Area Under Curves"
              }
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">{isArabic ? "النمط البيداغوجي:" : "Style:"}</span>
              <div className="inline-flex rounded-lg border border-white/15 bg-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "quick" ? "bg-amber-500/80 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "سريع" : "Quick"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "detailed" ? "bg-emerald-600 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "مفصل ومتدرج" : "Detailed"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {loading
                  ? isArabic
                    ? "جاري إعداد الأوراق المتمايزة..."
                    : "Calibrating..."
                  : isArabic
                  ? "توليد أوراق الدعم والتمايز (3 مستويات)"
                  : "Generate Support Sheets"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Progress */}
      <GenerationProgressState steps={PROGRESS_STEPS} active={loading} isArabic={isArabic} />

      {/* Output Screen */}
      {tierData && (
        <div className="space-y-6">
          {/* Warm encouraging confirmation banner */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? "أوراق العمل المتمايزة جاهزة لتغطية كافة الفروق الفردية" : "Your differentiated worksheets are ready for classroom use"}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {isArabic
                    ? "تضم 3 مستويات مدروسة (ميسّر، قياسي، متقدم) مع زر مستقل لتجديد أي ورقة في أي وقت."
                    : "Formulated across 3 tiers (Easy, Standard, Advanced) with sheet-level regeneration."}
                </p>
              </div>
            </div>
          </div>

          {/* Export Hub */}
          <ExportHubBar
            title={`أوراق الدعم المتمايز (3 مستويات): ${topic}`}
            content={tierData.fullMarkdown}
            meta={{ subject, grade: defaultGrade, type: "support_sheets" }}
            isArabic={isArabic}
            isSaved={true}
          />

          {/* 3 Tier Navigation Tabs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: "easy",
                title: isArabic ? "ورقة 1: المستوى الميسّر (Easy)" : "Sheet 1: Easy",
                desc: isArabic ? "دعائم مساعدة ونماذج موجهة" : "Scaffolded guidance",
                icon: Shield,
                badgeColor: "text-amber-300 bg-amber-500/20 border-amber-400/30",
              },
              {
                id: "standard",
                title: isArabic ? "ورقة 2: المستوى القياسي (Standard)" : "Sheet 2: Standard",
                desc: isArabic ? "مستوى المنهاج والاستقلالية" : "Grade-level mastery",
                icon: Zap,
                badgeColor: "text-blue-300 bg-blue-500/20 border-blue-400/30",
              },
              {
                id: "advanced",
                title: isArabic ? "ورقة 3: المستوى المتقدم (Advanced)" : "Sheet 3: Advanced",
                desc: isArabic ? "تحدي وتفكير نقدي وتركيبي" : "Enrichment & Challenge",
                icon: Award,
                badgeColor: "text-purple-300 bg-purple-500/20 border-purple-400/30",
              },
            ].map((tab) => {
              const isActive = activeTierTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTierTab(tab.id as any)}
                  className={`rounded-2xl border p-4 text-right transition backdrop-blur-xl ${
                    isActive
                      ? "border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-950/50"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-bold border ${tab.badgeColor}`}>
                      {tab.id.toUpperCase()}
                    </span>
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-white/40"}`} />
                  </div>
                  <h4 className="mt-2 text-xs sm:text-sm font-bold text-white line-clamp-1">{tab.title}</h4>
                  <p className="mt-0.5 text-[11px] text-white/50">{tab.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Active Tier Sheet View + Sheet-Level Regeneration Button */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {activeTierTab === "easy"
                    ? isArabic ? "ورقة الدعم 1: المستوى الميسّر (Easy)" : "Sheet 1: Easy"
                    : activeTierTab === "standard"
                    ? isArabic ? "ورقة الدعم 2: المستوى القياسي (Standard)" : "Sheet 2: Standard"
                    : isArabic ? "ورقة الدعم 3: المستوى المتقدم (Advanced)" : "Sheet 3: Advanced"}
                </h3>
              </div>

              {/* Sheet-Level Regeneration Button */}
              <button
                type="button"
                onClick={() => handleRegenerateTier(activeTierTab)}
                disabled={Boolean(regeneratingTier)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-500/25 transition disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${regeneratingTier === activeTierTab ? "animate-spin" : ""}`} />
                <span>
                  {regeneratingTier === activeTierTab
                    ? isArabic ? "جاري التجديد..." : "Regenerating..."
                    : isArabic
                    ? `تجديد ورقة ${activeTierTab.toUpperCase()} فقط`
                    : `Regenerate ${activeTierTab.toUpperCase()} Sheet Only`}
                </span>
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-white/85">
              {tierData[activeTierTab]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
