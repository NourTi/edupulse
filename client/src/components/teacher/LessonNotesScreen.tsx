import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Layers,
  ChevronDown,
  Globe,
  Sliders,
  Send,
  Download,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { CurriculumMemoryBar } from "./CurriculumMemoryBar";
import { GenerationProgressState } from "./GenerationProgressState";
import { ExportHubBar } from "./ExportHubBar";

interface LessonNotesScreenProps {
  isArabic?: boolean;
  defaultSubject?: string;
  defaultGrade?: string;
  topSubjects?: string[];
  topGrades?: string[];
  onCurriculumUpdate?: (subject: string, grade: string) => void;
}

const SECTION_KEYS = [
  "Objectives",
  "Prerequisites",
  "Materials",
  "Introduction",
  "Detailed Content",
  "Timeline/Pacing",
  "Pedagogical Differentiation",
  "Student Activities",
  "Evaluation",
  "Conclusion",
];

const SECTION_AR_TITLES: Record<string, string> = {
  Objectives: "1. Objectives | الأهداف التعلمية",
  Prerequisites: "2. Prerequisites | المكتسبات القبلية",
  Materials: "3. Materials | الوسائل والوسائط الديداكتيكية",
  Introduction: "4. Introduction | وضعية الانطلاق والتمهيد",
  "Detailed Content": "5. Detailed Content | المضمون المعرفي المفصل",
  "Timeline/Pacing": "6. Timeline/Pacing | التوزيع الزمني وسيرورة الحصة",
  "Pedagogical Differentiation": "7. Pedagogical Differentiation | الفروق الفردية والتمايز البيداغوجي",
  "Student Activities": "8. Student Activities | أنشطة وممارسات المتعلمين",
  Evaluation: "9. Evaluation | التقويم التكويني ومؤشرات الكفاءة",
  Conclusion: "10. Conclusion | الحوصلة والخاتمة البيداغوجية",
};

export function LessonNotesScreen({
  isArabic = true,
  defaultSubject = "الرياضيات",
  defaultGrade = "3 ثانوي",
  topSubjects = [],
  topGrades = [],
  onCurriculumUpdate,
}: LessonNotesScreenProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [gradeLevel, setGradeLevel] = useState(defaultGrade);
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"ar" | "fr" | "both">("ar");
  const [mode, setMode] = useState<"quick" | "detailed">("detailed");

  const [loading, setLoading] = useState(false);
  const [outputMarkdown, setOutputMarkdown] = useState<string | null>(null);
  const [sectionsMap, setSectionsMap] = useState<Record<string, string>>({});
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  const PROGRESS_STEPS = isArabic
    ? [
        "تحليل المنهاج وتحديد الأهداف والكفاءات الختامية...",
        "حصر المكتسبات القبلية وتجهيز الوسائل الديداكتيكية...",
        "بناء المضمون المعرفي والتقسيم الزمني الدقيق...",
        "صياغة خطة التمايز البيداغوجي وأنشطة الطلاب...",
        "ضبط معايير التقويم التكويني وحوصلة الدرس...",
      ]
    : [
        "Analyzing curriculum standards & competencies...",
        "Identifying prerequisites and instructional materials...",
        "Structuring detailed content and timeline pacing...",
        "Drafting pedagogical differentiation & student activities...",
        "Finalizing formative evaluation and conclusion...",
      ];

  // Parse 10 sections from markdown
  const parseSections = (fullText: string) => {
    const map: Record<string, string> = {};
    const lines = fullText.split("\n");
    let currentKey: string | null = null;
    let buffer: string[] = [];

    for (const line of lines) {
      const match = line.match(/^##\s*\d*\.?\s*([A-Za-z\s/]+)/);
      if (match) {
        if (currentKey) {
          map[currentKey] = buffer.join("\n").trim();
          buffer = [];
        }
        const matchedName = match[1].trim();
        const foundKey = SECTION_KEYS.find(
          (k) =>
            matchedName.toLowerCase().includes(k.toLowerCase()) ||
            k.toLowerCase().includes(matchedName.toLowerCase())
        );
        currentKey = foundKey || matchedName;
      } else {
        buffer.push(line);
      }
    }
    if (currentKey && buffer.length > 0) {
      map[currentKey] = buffer.join("\n").trim();
    }
    setSectionsMap(map);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error(isArabic ? "يرجى كتابة موضوع الدرس" : "Please enter the lesson topic");
      return;
    }

    setLoading(true);
    setOutputMarkdown(null);

    try {
      const res = await fetch("/api/teacher-generators/lesson-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          gradeLevel,
          topic,
          language,
          mode,
          autoSave: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.output) {
        throw new Error(data.error || "Failed to generate lesson notes");
      }

      setOutputMarkdown(data.output);
      parseSections(data.output);
      onCurriculumUpdate?.(subject, gradeLevel);

      toast.success(
        isArabic ? "مذكرتك البيداغوجية جاهزة للتدريس الآن!" : "Your lesson is ready to teach!",
        {
          description: isArabic
            ? "تم بناء المذكرة وفق الأقسام العشرة النظامية، وجرى حفظها تلقائياً في مكتبتك."
            : "Formatted in 10 pedagogical sections and saved to your Content Library.",
        }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || (isArabic ? "تعذر توليد المذكرة" : "Failed to generate lesson"));
    } finally {
      setLoading(false);
    }
  };

  // Section-Level Regeneration
  const handleRegenerateSection = async (sectionKey: string) => {
    setRegeneratingSection(sectionKey);
    try {
      const res = await fetch("/api/teacher-generators/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatorType: "lesson_notes",
          sectionKey,
          sectionTitle: SECTION_AR_TITLES[sectionKey] || sectionKey,
          subject,
          topic,
          gradeLevel,
          fullContext: outputMarkdown?.slice(0, 1500),
          language,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.regeneratedContent) {
        throw new Error(data.error || "Failed to regenerate section");
      }

      const updated = {
        ...sectionsMap,
        [sectionKey]: data.regeneratedContent,
      };
      setSectionsMap(updated);

      // Rebuild output markdown
      const rebuilt = Object.entries(updated)
        .map(([k, text]) => `## ${SECTION_AR_TITLES[k] || k}\n${text}`)
        .join("\n\n");
      setOutputMarkdown(rebuilt);

      toast.success(
        isArabic
          ? `تم تحديث قسم "${SECTION_AR_TITLES[sectionKey] || sectionKey}" بنجاح!`
          : `Section "${sectionKey}" regenerated successfully!`
      );
    } catch (err: any) {
      toast.error(err?.message || "تعذر إعادة توليد القسم");
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header with single focused action */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0a2540] via-[#0d3b66] to-[#0a2540] p-6 text-white shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-200 border border-cyan-400/30">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{isArabic ? "المولد البيداغوجي المعتمد" : "Pedagogical Lesson Notes"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مولّد مذكرات الدروس الكاملة (10 أقسام)" : "Lesson Notes Generator"}
            </h1>
            <p className="mt-1 text-sm text-cyan-100/75">
              {isArabic
                ? "توليد خطة درس نموذجية بيداغوجية تتضمن بدقة الأقسام العشرة الرسمية مع إمكانية تجديد أي قسم فردياً."
                : "Produces structured lesson plans with strictly 10 ordered sections, editable per section."}
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm">
            <span className="text-[11px] text-cyan-200 block uppercase tracking-wider">
              {isArabic ? "الهيكلة الصارمة" : "Structure Standard"}
            </span>
            <span className="text-xl font-bold text-amber-300">10 / 10</span>
            <span className="text-[11px] text-white/60 block">{isArabic ? "أقسام مرتبة" : "Ordered Sections"}</span>
          </div>
        </div>
      </div>

      {/* Curriculum Context Memory Bar */}
      <CurriculumMemoryBar
        currentSubject={subject}
        currentGrade={gradeLevel}
        topSubjects={topSubjects}
        topGrades={topGrades}
        onSelectSubject={(s) => setSubject(s)}
        onSelectGrade={(g) => setGradeLevel(g)}
        isArabic={isArabic}
      />

      {/* Input Form Screen */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-lg">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Subject Input */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "المادة الدراسية" : "Subject"}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isArabic ? "مثال: الرياضيات، الفيزياء، اللغة العربية..." : "e.g., Mathematics"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Grade Level Input */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "المستوى / الطور الدراسي" : "Grade Level"}
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder={isArabic ? "مثال: 3 ثانوي علوم تجريبية، 4 متوسط..." : "e.g., Grade 10"}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {isArabic ? "لغة المذكرة (Bilingual Support)" : "Language"}
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
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {isArabic ? "عنوان الدرس أو المحور التعليمي" : "Lesson Topic"}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                isArabic
                  ? "مثال: حساب النهايات والسلوك التقاربي للمنحنيات، التفاعلات الكيميائية في المحاليل المائية..."
                  : "e.g., Photosynthesis and Cellular Respiration"
              }
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          {/* Mode Toggle & Clear Primary Call-To-Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">{isArabic ? "نمط التوليد:" : "Generation Mode:"}</span>
              <div className="inline-flex rounded-lg border border-white/15 bg-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "quick" ? "bg-amber-500/80 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "سريع وموجز" : "Quick Mode"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className={`rounded-md px-3 py-1 transition ${
                    mode === "detailed" ? "bg-cyan-500 text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  {isArabic ? "مفصل وشامل (موصى به)" : "Detailed Mode"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {loading
                  ? isArabic
                    ? "جاري إعداد المذكرة..."
                    : "Structuring..."
                  : isArabic
                  ? "توليد مذكرة الدرس البيداغوجية"
                  : "Generate Lesson Notes"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Progress State */}
      <GenerationProgressState steps={PROGRESS_STEPS} active={loading} isArabic={isArabic} />

      {/* Generated Result Screen */}
      {outputMarkdown && (
        <div className="space-y-6">
          {/* Warm encouraging confirmation banner */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isArabic ? "مذكرتك البيداغوجية جاهزة للتدريس الآن" : "Your lesson is ready to teach"}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {isArabic
                    ? `تم تنسيق مذكرة "${topic}" بدقة في 10 أقسام متكاملة. يمكنك تجديد أي قسم بشكل مستقل أدناه.`
                    : "Fully structured in 10 standard sections with section-level regeneration support."}
                </p>
              </div>
            </div>
          </div>

          {/* Export Hub Toolbar */}
          <ExportHubBar
            title={`مذكرة درس: ${topic}`}
            content={outputMarkdown}
            meta={{ subject, grade: gradeLevel, type: "lesson_notes" }}
            isArabic={isArabic}
            isSaved={true}
          />

          {/* 10 Ordered Sections with Section-Level Regeneration */}
          <div className="space-y-4">
            {SECTION_KEYS.map((key, idx) => {
              const content = sectionsMap[key] || "";
              const isBusy = regeneratingSection === key;

              return (
                <article
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-white/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-xs font-bold text-cyan-300">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        {SECTION_AR_TITLES[key] || key}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRegenerateSection(key)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/15 hover:text-white transition disabled:opacity-50"
                      title={isArabic ? "إعادة توليد هذا القسم فقط" : "Regenerate this section only"}
                    >
                      <RefreshCw className={`h-3 w-3 ${isBusy ? "animate-spin text-cyan-400" : ""}`} />
                      <span>{isBusy ? (isArabic ? "جاري التجديد..." : "Regenerating...") : (isArabic ? "تجديد هذا القسم" : "Regenerate Section")}</span>
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-white/85 leading-relaxed whitespace-pre-line font-sans">
                    {content || (
                      <span className="text-white/40 italic">
                        {isArabic ? "محتوى القسم قيد المعالجة..." : "Section content..."}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
