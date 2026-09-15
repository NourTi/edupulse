import { useState, useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Brain,
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Users,
  Printer,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export interface StudentRadarData {
  id: string;
  name: string;
  nameAr: string;
  grade: string;
  guardian: string;
  phone?: string;
  level: string;
  attendance: number;
  subjects: string[];
  status: string;
}

export interface StudentAssessmentData {
  studentId: string;
  date: string;
  level: string;
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
  note: string;
}

type Props = {
  student: StudentRadarData;
  assessment?: StudentAssessmentData | null;
  canEditKpi?: boolean;
  language?: "ar" | "en";
};

export function StudentRadarProfile({
  student,
  assessment,
  canEditKpi = true,
  language = "ar",
}: Props) {
  const isArabic = language === "ar";

  // Calculate base academic score from assessment if available
  const baseAcademic = useMemo(() => {
    if (assessment) {
      return Math.round(
        (assessment.speaking +
          assessment.listening +
          assessment.reading +
          assessment.writing) /
          4
      );
    }
    return student.level === "B2" ? 88 : student.level === "B1" ? 78 : 70;
  }, [assessment, student.level]);

  // Customizable KPI state for real-time calibration
  const [kpis, setKpis] = useState({
    academic: baseAcademic,
    attendance: student.attendance || 90,
    participation: assessment ? Math.round(assessment.speaking * 0.95 + 4) : 84,
    cognitive: assessment ? Math.round(assessment.reading * 0.92 + 6) : 88,
    assignments: assessment ? Math.round(assessment.writing * 0.9 + 8) : 85,
    problemSolving: 82,
  });

  const [showBenchmark, setShowBenchmark] = useState(true);
  const [activeKpiKey, setActiveKpiKey] = useState<string | null>(null);

  // Benchmarks (Class averages)
  const benchmarks: Record<keyof typeof kpis, number> = {
    academic: 74,
    attendance: 88,
    participation: 75,
    cognitive: 78,
    assignments: 80,
    problemSolving: 72,
  };

  const radarData = useMemo(() => {
    return [
      {
        kpiKey: "academic",
        subject: isArabic ? "الأداء الأكاديمي" : "Academic Performance",
        shortLabel: isArabic ? "الأكاديمي" : "Academic",
        score: kpis.academic,
        benchmark: benchmarks.academic,
        fullMark: 100,
        description: isArabic
          ? "التحصيل في المقررات، الاختبارات الشفهية والكتابية ومهارات CEFR"
          : "Overall coursework scores, CEFR competencies, and subject evaluations",
      },
      {
        kpiKey: "attendance",
        subject: isArabic ? "نسبة الحضور والالتزام" : "Attendance & Diligence",
        shortLabel: isArabic ? "الحضور" : "Attendance",
        score: kpis.attendance,
        benchmark: benchmarks.attendance,
        fullMark: 100,
        description: isArabic
          ? "الانتظام الصفي، الانضباط في المواعيد والغياب المبرر"
          : "Punctuality, class presence, and session adherence",
      },
      {
        kpiKey: "participation",
        subject: isArabic ? "المشاركة والتفاعل" : "Participation",
        shortLabel: isArabic ? "المشاركة" : "Participation",
        score: kpis.participation,
        benchmark: benchmarks.participation,
        fullMark: 100,
        description: isArabic
          ? "المبادرة في القسم، التفاعل في ورشات العمل والأنشطة التعاونية"
          : "Active classroom discourse, peer collaboration, and dialogue initiative",
      },
      {
        kpiKey: "cognitive",
        subject: isArabic ? "الانخراط الإدراكي" : "Cognitive Engagement",
        shortLabel: isArabic ? "الإدراك" : "Cognitive",
        score: kpis.cognitive,
        benchmark: benchmarks.cognitive,
        fullMark: 100,
        description: isArabic
          ? "مستوى الاستيعاب العميق، التركيز الذهني ومعالجة المفاهيم المعقدة"
          : "Conceptual grasp, sustained mental focus, and complex concept processing",
      },
      {
        kpiKey: "assignments",
        subject: isArabic ? "إنجاز الواجبات" : "Assignment Completion",
        shortLabel: isArabic ? "الواجبات" : "Assignments",
        score: kpis.assignments,
        benchmark: benchmarks.assignments,
        fullMark: 100,
        description: isArabic
          ? "تسليم المشاريع، حل التمارين المنزلية واستكمال المذكرات البيداغوجية"
          : "Homework consistency, project delivery, and curricular portfolio quality",
      },
      {
        kpiKey: "problemSolving",
        subject: isArabic ? "حل المسائل والاستنتاج" : "Problem Solving",
        shortLabel: isArabic ? "حل المسائل" : "Problem Solving",
        score: kpis.problemSolving,
        benchmark: benchmarks.problemSolving,
        fullMark: 100,
        description: isArabic
          ? "التفكير النقدي، تطبيق القواعد في وضعيات جديدة والاستدلال المنطقي"
          : "Deductive reasoning, critical synthesis, and novel situational application",
      },
    ];
  }, [kpis, benchmarks, isArabic]);

  // Calculate overall performance index
  const overallIndex = useMemo(() => {
    const values = Object.values(kpis);
    return Math.round(values.reduce((acc, v) => acc + v, 0) / values.length);
  }, [kpis]);

  // Cognitive synthesis & insights
  const insights = useMemo(() => {
    const entries = Object.entries(kpis) as [keyof typeof kpis, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    const growth = entries[entries.length - 1];

    const labelMap: Record<keyof typeof kpis, string> = {
      academic: isArabic ? "الأداء الأكاديمي" : "Academic Performance",
      attendance: isArabic ? "الحضور والالتزام" : "Attendance",
      participation: isArabic ? "المشاركة الصيفية" : "Participation",
      cognitive: isArabic ? "الانخراط الإدراكي" : "Cognitive Engagement",
      assignments: isArabic ? "إنجاز الواجبات" : "Assignments",
      problemSolving: isArabic ? "حل المسائل والاستدلال" : "Problem Solving",
    };

    return {
      strength: labelMap[top[0]],
      strengthScore: top[1],
      focusArea: labelMap[growth[0]],
      focusScore: growth[1],
    };
  }, [kpis, isArabic]);

  const handleSliderChange = (key: keyof typeof kpis, val: number) => {
    setKpis((prev) => ({ ...prev, [key]: val }));
  };

  const handlePrintRadar = () => {
    window.print();
    toast.success(
      isArabic
        ? "تم تجهيز تقرير البصمة الإدراكية للطباعة"
        : "Cognitive radar report ready for export"
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/40 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 text-2xl font-black text-white shadow-md shadow-indigo-500/20">
              {student.nameAr.slice(0, 1)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {student.nameAr}
                </h2>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-xs font-bold text-indigo-700">
                  {student.grade}
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700">
                  CEFR {student.level}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-3">
                <span>{isArabic ? "ولي الأمر:" : "Guardian:"} {student.guardian}</span>
                <span>•</span>
                <span>{isArabic ? "المعرف الرقمي:" : "ID:"} {student.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                showBenchmark
                  ? "border-cyan-200 bg-cyan-50 text-cyan-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-cyan-600" />
              <span>{isArabic ? "مقارنة مع معدل الفوج" : "Class Benchmark"}</span>
            </button>
            <button
              onClick={handlePrintRadar}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>{isArabic ? "طباعة المخطط" : "Print Report"}</span>
            </button>
          </div>
        </div>

        {/* Global KPI Summary Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-indigo-100/60 pt-5">
          <div className="rounded-2xl bg-white/80 p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400">
              {isArabic ? "المؤشر الإجمالي المركب" : "Overall Index"}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">{overallIndex}%</span>
              <span className="text-[10px] font-bold text-emerald-600">
                {overallIndex >= 85 ? (isArabic ? "متفوق" : "Advanced") : (isArabic ? "مستقر" : "On Track")}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400">
              {isArabic ? "أعلى نقطة تميز" : "Primary Strength"}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-black text-slate-800 truncate">{insights.strength}</span>
              <span className="text-xs font-bold text-indigo-500">({insights.strengthScore}%)</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400">
              {isArabic ? "مجال التطوير البيداغوجي" : "Growth Opportunity"}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-black text-amber-700 truncate">{insights.focusArea}</span>
              <span className="text-xs font-bold text-amber-600">({insights.focusScore}%)</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400">
              {isArabic ? "الالتزام بالحضور" : "Attendance Rate"}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-600">{kpis.attendance}%</span>
              <span className="text-[10px] text-slate-400">
                {isArabic ? "سجل نظامي" : "Consistent"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Radar Workspace (Grid: Spider Chart + Interactive Calibrator / Cards) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left/Main Column: The Interactive Spider / Radar Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Compass className="h-5 w-5 text-indigo-600" />
                  <span>
                    {isArabic
                      ? "المخطط العنكبوتي للمؤشرات (Radar / Spider Chart)"
                      : "Multi-KPI Radar Diagram"}
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {isArabic
                    ? "تمثيل بياني تفاعلي متعدد الأبعاد للأداء، الحضور، والمشاركة الإدراكية"
                    : "Interactive visualization mapping core multidimensional student competencies"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-600" />
                  <span className="text-slate-700">{student.nameAr}</span>
                </div>
                {showBenchmark && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-cyan-400" />
                    <span className="text-slate-500">{isArabic ? "معدل الفوج" : "Class Avg"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Radar Canvas Container */}
            <div className="mt-6 h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="shortLabel"
                    tick={{ fill: "#334155", fontSize: 12, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-2xl border border-indigo-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
                          <p className="font-black text-slate-900 text-sm">{data.subject}</p>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-bold text-indigo-600">
                                {isArabic ? "درجة التلميذ:" : "Student Score:"}
                              </span>
                              <span className="font-black text-slate-800">{data.score}%</span>
                            </div>
                            {showBenchmark && (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">
                                  {isArabic ? "معدل الفوج:" : "Class Benchmark:"}
                                </span>
                                <span className="font-bold text-cyan-600">{data.benchmark}%</span>
                              </div>
                            )}
                          </div>
                          <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-4 text-slate-500 max-w-[200px]">
                            {data.description}
                          </p>
                        </div>
                      );
                    }}
                  />
                  {showBenchmark && (
                    <Radar
                      name={isArabic ? "معدل الفوج" : "Class Average"}
                      dataKey="benchmark"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                  )}
                  <Radar
                    name={student.nameAr}
                    dataKey="score"
                    stroke="#4f46e5"
                    fill="#6366f1"
                    fillOpacity={0.42}
                    strokeWidth={2.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-50/50 p-3.5 text-xs text-indigo-900">
            <span className="flex items-center gap-2 font-bold">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              {isArabic ? "التفسير البيداغوجي:" : "Pedagogical Assessment:"}
            </span>
            <span>
              {overallIndex >= 85
                ? isArabic
                  ? "توازن إدراكي وأكاديمي ممتاز يخول التلميذ خوض تحديات إثرائية متقدمة"
                  : "Balanced high-performance profile suitable for enriched academic tracks"
                : isArabic
                ? "مستوى إيجابي متوازن؛ يوصى بدعم مهارات الاستدلال وحل المسائل لتعزيز الأداء"
                : "Solid baseline; recommend targeted problem-solving drills to boost retention"}
            </span>
          </div>
        </div>

        {/* Right Column: Detailed KPI Cards & Live Teacher Calibrator */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                <Sliders className="h-4 w-4 text-indigo-600" />
                <span>
                  {isArabic ? "معايرة ومقاييس الأداء" : "Performance Metrics & Calibration"}
                </span>
              </h3>
              {canEditKpi && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  {isArabic ? "تعديل فوري متاح" : "Interactive Live Tuning"}
                </span>
              )}
            </div>

            {/* List of 6 Key Performance Indicators with visual sliders / bars */}
            <div className="mt-4 space-y-3.5">
              {radarData.map((item) => {
                const key = item.kpiKey as keyof typeof kpis;
                const isSelected = activeKpiKey === key;
                return (
                  <div
                    key={key}
                    onMouseEnter={() => setActiveKpiKey(key)}
                    onMouseLeave={() => setActiveKpiKey(null)}
                    className={`rounded-2xl border p-3.5 transition ${
                      isSelected
                        ? "border-indigo-300 bg-indigo-50/40 shadow-xs"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>{item.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-indigo-700 text-sm">{kpis[key]}%</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            kpis[key] >= 85
                              ? "bg-emerald-100 text-emerald-800"
                              : kpis[key] >= 75
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {kpis[key] >= 85
                            ? isArabic ? "ممتاز" : "Distinction"
                            : kpis[key] >= 75
                            ? isArabic ? "جيد جداً" : "Proficient"
                            : isArabic ? "قيد التطوير" : "Developing"}
                        </span>
                      </div>
                    </div>

                    {/* Progress visual or slider */}
                    {canEditKpi ? (
                      <div className="mt-2.5 flex items-center gap-3">
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={kpis[key]}
                          onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
                        />
                      </div>
                    ) : (
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
                          style={{ width: `${kpis[key]}%` }}
                        />
                      </div>
                    )}

                    <p className="mt-1.5 text-[11px] text-slate-500 leading-4">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment Note Box if available */}
          {assessment && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isArabic ? "ملاحظة التقييم المعتمد" : "Certified Assessment Note"}
                </span>
                <span className="text-[11px] font-bold text-indigo-600">{assessment.date}</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {assessment.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
