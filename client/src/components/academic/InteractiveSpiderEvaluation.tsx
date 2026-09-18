import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
  Brain,
  Sliders,
  Sparkles,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  User,
  Lightbulb,
  ShieldCheck,
  Send,
  Printer,
  ChevronRight,
  BookOpen,
  X,
  ExternalLink,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { ACADEMIC_COLLECTION, type AcademicNodeItem } from "./InteractiveRadarKnowledgeExplorer";

export interface SpiderTrait {
  key: string;
  labelAr: string;
  labelEn: string;
  value: number; // 0 to 100
  color: string;
  descriptionAr: string;
}

export interface StudentPedagogicalDecision {
  id: string;
  studentName: string;
  date: string;
  decisionTitle: string;
  recommendationAr: string;
  groupStrategy: string;
  assessmentAdaptation: string;
  scaffoldingLevel: "high" | "medium" | "low_independent";
  status: "active" | "implemented";
}

interface InteractiveSpiderEvaluationProps {
  isArabic?: boolean;
  studentName?: string;
  onIssueDecision?: (decision: StudentPedagogicalDecision) => void;
  compact?: boolean;
}

const PRESET_STUDENTS = [
  {
    name: "سارة عبد الرحمن (3AS علوم تجريبية)",
    traits: [
      { key: "openness", value: 88 },
      { key: "conscientiousness", value: 92 },
      { key: "extraversion", value: 55 },
      { key: "agreeableness", value: 78 },
      { key: "emotional_stability", value: 65 },
      { key: "analytical_depth", value: 95 },
    ],
  },
  {
    name: "حمزة بلعيد (3AS رياضيات)",
    traits: [
      { key: "openness", value: 75 },
      { key: "conscientiousness", value: 68 },
      { key: "extraversion", value: 85 },
      { key: "agreeableness", value: 82 },
      { key: "emotional_stability", value: 70 },
      { key: "analytical_depth", value: 90 },
    ],
  },
  {
    name: "كريم مرواني (3AS تقني رياضي)",
    traits: [
      { key: "openness", value: 62 },
      { key: "conscientiousness", value: 60 },
      { key: "extraversion", value: 40 },
      { key: "agreeableness", value: 70 },
      { key: "emotional_stability", value: 50 },
      { key: "analytical_depth", value: 72 },
    ],
  },
];

export function InteractiveSpiderEvaluation({
  isArabic = true,
  studentName: initialStudentName,
  onIssueDecision,
  compact = false,
}: InteractiveSpiderEvaluationProps) {
  const [selectedStudent, setSelectedStudent] = useState(
    initialStudentName || "سارة عبد الرحمن (3AS علوم تجريبية)"
  );

  const [traits, setTraits] = useState<SpiderTrait[]>([
    {
      key: "openness",
      labelAr: "الاستكشاف والإبداع",
      labelEn: "Openness & Curiosity",
      value: 85,
      color: "#8b5cf6", // Purple
      descriptionAr: "القدرة على الربط بين المفاهيم غير المألوفة وطرح فرضيات بديلة.",
    },
    {
      key: "conscientiousness",
      labelAr: "الانضباط والمثابرة",
      labelEn: "Conscientiousness",
      value: 90,
      color: "#10b981", // Emerald
      descriptionAr: "الالتزام بتسليم المهام ومتابعة خطوات البرهان بدقة وتنظيم الدفتر.",
    },
    {
      key: "extraversion",
      labelAr: "المشاركة والتفاعل الصفي",
      labelEn: "Classroom Engagement",
      value: 60,
      color: "#3b82f6", // Blue
      descriptionAr: "المبادرة في الإجابة الشفوية والمناقشة الجماعية ومساعدة الأقران.",
    },
    {
      key: "agreeableness",
      labelAr: "العمل الفريقي والتعاون",
      labelEn: "Collaboration & Teamwork",
      value: 75,
      color: "#f59e0b", // Amber
      descriptionAr: "تقبل آراء الزملاء والمساهمة الإيجابية في الورشات والحل الجماعي.",
    },
    {
      key: "emotional_stability",
      labelAr: "الثبات وضبط قلق الامتحان",
      labelEn: "Exam Stress Stability",
      value: 65,
      color: "#ec4899", // Pink
      descriptionAr: "الهدوء تحت ضغط الوقت في الفروض المحروسة وسرعة استعادة التركيز.",
    },
    {
      key: "analytical_depth",
      labelAr: "العمق التحليلي والرياضي",
      labelEn: "Analytical & STEM Depth",
      value: 92,
      color: "#06b6d4", // Cyan
      descriptionAr: "سرعة استيعاب النماذج التجريدية وقواعد الاشتقاق والمنطق الصوري.",
    },
  ]);

  const [decisionNotes, setDecisionNotes] = useState("");
  const [issuedDecisions, setIssuedDecisions] = useState<StudentPedagogicalDecision[]>([
    {
      id: "dec-1",
      studentName: "سارة عبد الرحمن",
      date: "2026-03-12",
      decisionTitle: "تكليف بمهام التمايز وحل نماذج BAC المتفوقة",
      recommendationAr: "توجيه الطالبة لمسائل المرحلة الثالثة (BAC Plus) وتخفيف التمارين المكررة، مع دعم الثبات في إدارة زمن الفرض.",
      groupStrategy: "قائدة فوج مصغر للتعلم بالأقران",
      assessmentAdaptation: "مسائل مفتوحة النهاية ذات ربط تركيبي متعدد الفصول",
      scaffoldingLevel: "low_independent",
      status: "active",
    },
  ]);

  const updateTraitValue = (key: string, newValue: number) => {
    setTraits((prev) =>
      prev.map((t) => (t.key === key ? { ...t, value: Math.max(0, Math.min(100, newValue)) } : t))
    );
  };

  const handleSelectPreset = (preset: typeof PRESET_STUDENTS[0]) => {
    setSelectedStudent(preset.name);
    setTraits((prev) =>
      prev.map((t) => {
        const found = preset.traits.find((pt) => pt.key === t.key);
        return found ? { ...t, value: found.value } : t;
      })
    );
    toast.info(isArabic ? `تم تحميل بصمة تقييم: ${preset.name}` : `Loaded preset for ${preset.name}`);
  };

  // SVG Radar Dimensions & Coordinates
  const size = 320;
  const center = size / 2;
  const radius = center - 45;
  const numSides = traits.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = (Math.PI * 2 / numSides) * index - Math.PI / 2;
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build SVG polygon points for current traits
  const polygonPoints = traits
    .map((t, i) => {
      const { x, y } = getCoordinates(i, t.value);
      return `${x},${y}`;
    })
    .join(" ");

  // Derive pedagogical recommendation based on spider geometry
  const dynamicDiagnosis = useMemo(() => {
    const analytical = traits.find((t) => t.key === "analytical_depth")?.value || 0;
    const conscientiousness = traits.find((t) => t.key === "conscientiousness")?.value || 0;
    const emotional = traits.find((t) => t.key === "emotional_stability")?.value || 0;
    const extraversion = traits.find((t) => t.key === "extraversion")?.value || 0;

    let recommendation = "";
    let group = "";
    let scaffolding: "high" | "medium" | "low_independent" = "medium";
    let assessment = "";

    if (analytical >= 85 && conscientiousness >= 80) {
      recommendation = "الملف يُظهر نمطاً تحليلياً متقدماً وانضباطاً رفيعاً؛ ينبغي تقديم مسائل إثرائية (Extending Scenarios) وتفادي التكرار الميكانيكي.";
      group = "قائد مجموعة لحل المشكلات المعقدة وتعليم الأقران.";
      scaffolding = "low_independent";
      assessment = "تحديات نمذجة ومسائل استدلالية مركبة تحاكي أسئلة التميز في البكالوريا.";
    } else if (analytical >= 75 && emotional < 60) {
      recommendation = "كفاءة معرفية ممتازة تتأثر بضغط الوقت والتوتر؛ يوصى بجلسات تدريب متباعد منخفضة الرهان (Low-stakes retrieval) وتقنيات تدريجية في استراتيجية الإجابة.";
      group = "مجموعة ثنائية مستقرة مع زميل هادئ داعم.";
      scaffolding = "medium";
      assessment = "فروض تدريبية مع تقليم الوقت تدريجياً لكسر حاجز قلق الاختبار.";
    } else if (extraversion >= 80 && conscientiousness < 70) {
      recommendation = "تفاعل شفهي ونشاط بارز لكن يحتاج لهيكلة الكتابة والتنظيم؛ يوصى باستخدام خرائط تفكير (Graphic Organizers) وسجلات متابعة أسبوعية.";
      group = "مجموعة موجهة مع توزيع أدوار صارم وتوثيق كتابي إلزامي.";
      scaffolding = "medium";
      assessment = "واجبات كتابية مجزأة مع تغذية راجعة فورية على الخطوات.";
    } else {
      recommendation = "نمط متوازن يحتاج إلى استمرار المرافقة البيداغوجية القياسية وتعزيز الممارسة الموزعة.";
      group = "فوج عمل تعاوني متوازن الكفاءات.";
      scaffolding = "medium";
      assessment = "تقويم تكويني مرحلي بعد كل وحدة تعليمية.";
    }

    return { recommendation, group, scaffolding, assessment };
  }, [traits]);

  const chartRef = useRef<any>(null);
  const [selectedPaperModal, setSelectedPaperModal] = useState<AcademicNodeItem | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const echartsRadarOption = useMemo(() => {
    const indicators = traits.map((t) => ({
      name: isArabic ? `${t.labelAr} (${t.value})` : `${t.labelEn} (${t.value})`,
      max: 100,
      color: "#334155",
    }));

    const values = traits.map((t) => t.value);

    return {
      backgroundColor: "transparent",
      animation: true,
      animationDuration: 1000,
      animationEasing: "elasticOut",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(99, 102, 241, 0.5)",
        borderWidth: 1.5,
        padding: [10, 14],
        textStyle: { color: "#f8fafc", fontSize: 12 },
        formatter: (params: any) => {
          return `
            <div style="font-weight: 700; color: #818cf8; margin-bottom: 4px;">
              ${selectedStudent} - ${isArabic ? "البصمة الإدراكية" : "Cognitive Profile"}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              ${isArabic ? "انقر على الرادار لفتح المراجع الأكاديمية المتصلة بهذا البعد" : "Click to view connected academic research"}
            </div>
            ${traits
              .map(
                (t) => `
              <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 11px; margin: 2px 0;">
                <span style="color: #cbd5e1;">${isArabic ? t.labelAr : t.labelEn}:</span>
                <b style="color: #a5b4fc;">${t.value}/100</b>
              </div>
            `
              )
              .join("")}
          `;
        },
      },
      radar: {
        indicator: indicators,
        shape: "polygon",
        splitNumber: 4,
        axisName: {
          color: "#475569",
          fontSize: 11,
          fontWeight: 600,
        },
        splitLine: {
          lineStyle: {
            color: [
              "rgba(99, 102, 241, 0.15)",
              "rgba(99, 102, 241, 0.25)",
              "rgba(99, 102, 241, 0.35)",
              "rgba(99, 102, 241, 0.5)",
            ],
            width: 1.2,
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: [
              "rgba(241, 245, 249, 0.3)",
              "rgba(238, 242, 255, 0.4)",
              "rgba(224, 231, 255, 0.5)",
              "rgba(199, 210, 254, 0.4)",
            ],
          },
        },
        axisLine: {
          lineStyle: {
            color: "rgba(148, 163, 184, 0.4)",
          },
        },
      },
      series: [
        {
          name: selectedStudent,
          type: "radar",
          data: [
            {
              value: values,
              name: selectedStudent,
              symbol: "circle",
              symbolSize: 8,
              itemStyle: {
                color: "#4f46e5",
                borderColor: "#ffffff",
                borderWidth: 2,
                shadowBlur: 14,
                shadowColor: "rgba(79, 70, 229, 0.8)",
              },
              lineStyle: {
                color: "#4f46e5",
                width: 3,
                shadowBlur: 10,
                shadowColor: "rgba(79, 70, 229, 0.5)",
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "rgba(79, 70, 229, 0.65)" },
                  { offset: 0.5, color: "rgba(124, 58, 237, 0.45)" },
                  { offset: 1, color: "rgba(6, 182, 212, 0.3)" },
                ]),
              },
              emphasis: {
                lineStyle: { width: 4.5 },
                itemStyle: {
                  color: "#06b6d4",
                  shadowBlur: 20,
                  shadowColor: "rgba(6, 182, 212, 1)",
                },
              },
            },
          ],
        },
      ],
    };
  }, [traits, isArabic, selectedStudent]);

  const onChartClick = () => {
    // Open connected paper from repository
    const matchedPaper = ACADEMIC_COLLECTION[0];
    setSelectedPaperModal(matchedPaper);
    toast.info(
      isArabic
        ? `فتح ورقة البحث المتصلة بالبعد الإدراكي: ${matchedPaper.name}`
        : `Connected paper opened: ${matchedPaper.name}`
    );
  };

  const handleIssueDecision = () => {
    const newDecision: StudentPedagogicalDecision = {
      id: `dec-${Date.now()}`,
      studentName: selectedStudent,
      date: new Date().toISOString().split("T")[0],
      decisionTitle: `قرار بيداغوجي وتكييف تعليمي لـ ${selectedStudent.split(" ")[0]}`,
      recommendationAr: decisionNotes.trim() || dynamicDiagnosis.recommendation,
      groupStrategy: dynamicDiagnosis.group,
      assessmentAdaptation: dynamicDiagnosis.assessment,
      scaffoldingLevel: dynamicDiagnosis.scaffolding,
      status: "active",
    };

    setIssuedDecisions([newDecision, ...issuedDecisions]);
    if (onIssueDecision) {
      onIssueDecision(newDecision);
    }
    setDecisionNotes("");
    toast.success(
      isArabic
        ? `تم إصدار قرار الأستاذ الرسمي بنجاح وإدراجه في لوحة القيادة البيداغوجية!`
        : `Pedagogical decision issued and linked to Cockpit!`
    );
  };

  return (
    <div className={`space-y-6 ${compact ? "" : "surface-panel rounded-2xl p-6"}`} dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-600/10 text-indigo-700 px-2.5 py-1 text-xs font-bold border border-indigo-600/20 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isArabic ? "مخطط العنكبوت لتقييم المتعلم (Spider Cognitive Radar)" : "Cognitive Spider Radar"}</span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {isArabic ? "مرتبط بقرارات الأستاذ" : "Linked to Decision Section"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {isArabic ? "التقييم الإدراكي متعدد الأبعاد وبصمة القرار البيداغوجي" : "Multidimensional Student Evaluation & Teacher Decision"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? "تحليل بصمة المتعلم عبر 6 محاور إدراكية ونفسية، واستنتاج القرار التعليمي المناسب لتكييف الحصص والأفواج والتقويم."
              : "6-axis cognitive evaluation chart mapping student strengths and generating actionable pedagogical decisions."}
          </p>
        </div>

        {/* Preset Student Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600">{isArabic ? "نماذج سريعة:" : "Presets:"}</span>
          {PRESET_STUDENTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedStudent === p.name
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Spider Visualization & Real-time Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: ECharts Radar Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col items-center justify-center">
          <div className="flex items-center justify-between w-full border-b border-slate-100 pb-2 mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{selectedStudent}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              {traits.reduce((acc, t) => acc + t.value, 0) / traits.length | 0}% مؤشر التوازن
            </span>
          </div>

          <div className="w-full h-[320px] relative">
            <ReactECharts
              ref={chartRef}
              option={echartsRadarOption}
              style={{ height: "100%", width: "100%" }}
              onEvents={{ click: onChartClick }}
              opts={{ renderer: "canvas" }}
            />
          </div>

          {/* Quick Summary Pill */}
          <div
            onClick={onChartClick}
            className="mt-3 text-center text-xs text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition cursor-pointer rounded-xl px-4 py-2 border border-indigo-200/80 w-full flex items-center justify-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isArabic ? "انقر لاستعراض أوراق البحث والمراجع المرتبطة بالمتعلم" : "Click to view connected academic papers"}</span>
          </div>
        </div>

        {/* Right Column: 6 Interactive Sliders */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>{isArabic ? "معايرة أبعاد التقييم الصفي (0 - 100):" : "Calibrate Trait Dimensions:"}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">تحديث فوري للمخطط</span>
          </div>

          <div className="space-y-3">
            {traits.map((trait) => (
              <div key={trait.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: trait.color }}
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {isArabic ? trait.labelAr : trait.labelEn}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                    {trait.value} / 100
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={trait.value}
                  onChange={(e) => updateTraitValue(trait.key, Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />

                <p className="text-[11px] text-slate-500 mt-1 leading-tight">{trait.descriptionAr}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Decision Section (linked to radar) */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                قسم القرار البيداغوجي للأستاذ
              </span>
              <span className="text-xs text-indigo-900 font-semibold">{selectedStudent}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {isArabic ? "التشخيص الإدراكي وخطة التدخل المعتمدة" : "Pedagogical Diagnosis & Action Plan"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مستوى الدعم: {dynamicDiagnosis.scaffolding === "low_independent" ? "استقلالية وتوسيع" : "تأطير موجه ومستمر"}</span>
            </span>
          </div>
        </div>

        {/* Actionable Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs space-y-1">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              {isArabic ? "التوجيه البيداغوجي المقترح:" : "Instructional Recommendation:"}
            </span>
            <p className="text-slate-700 leading-relaxed">{dynamicDiagnosis.recommendation}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs space-y-1">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-500" />
              {isArabic ? "استراتيجية الفوج والتسكين الصفي:" : "Grouping Strategy:"}
            </span>
            <p className="text-slate-700 leading-relaxed">{dynamicDiagnosis.group}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs space-y-1">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              {isArabic ? "تكييف صيغة الاختبار والفروض:" : "Assessment Adaptation:"}
            </span>
            <p className="text-slate-700 leading-relaxed">{dynamicDiagnosis.assessment}</p>
          </div>
        </div>

        {/* Custom Teacher Note Input & Issue Decision Button */}
        <div className="pt-2 border-t border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder={isArabic ? "ملاحظة أو تعديل إضافي من الأستاذ على القرار قبل الاعتماد..." : "Optional teacher decision refinement..."}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={handleIssueDecision}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isArabic ? "إصدار وتثبيت قرار الأستاذ" : "Issue & Lock Decision"}</span>
          </button>
        </div>

        {/* Past Issued Decisions Ledger */}
        {issuedDecisions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-indigo-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              {isArabic ? "سجل القرارات البيداغوجية الصادرة حديثاً لهذا الفوج:" : "Recent Pedagogical Decisions Log:"}
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {issuedDecisions.map((dec) => (
                <div key={dec.id} className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{dec.decisionTitle}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{dec.date}</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-snug">{dec.recommendationAr}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px] shrink-0 self-start sm:self-auto">
                    تم الاعتماد ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connected Paper Details Modal on Node Click */}
      {selectedPaperModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedPaperModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedPaperModal.source} · {selectedPaperModal.category}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{selectedPaperModal.name}</h4>
                <p className="text-xs text-slate-500">{selectedPaperModal.author} ({selectedPaperModal.year})</p>
              </div>
              <button
                onClick={() => setSelectedPaperModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">{isArabic ? "الملخص العلمي والتطبيقي:" : "Abstract & Findings:"}</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {selectedPaperModal.abstract}
              </p>
              {selectedPaperModal.pedagogicalUse && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                  <b className="block mb-1">{isArabic ? "الربط مع البكالوريا الجزائرية:" : "BAC Alignment:"}</b>
                  {selectedPaperModal.pedagogicalUse}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {isArabic ? "مفهرس ضمن مكتبة EduPulse" : "Indexed in EduPulse Hub"}
              </span>
              {selectedPaperModal.pdfUrl && (
                <a
                  href={selectedPaperModal.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isArabic ? "فتح المرجع المباشر" : "Open Source"}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
