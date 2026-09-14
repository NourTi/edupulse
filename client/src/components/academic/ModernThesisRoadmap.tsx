import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  Plus,
  Printer,
  FileCheck2,
  GraduationCap,
  Award,
  ChevronRight,
  TrendingUp,
  ListTodo,
  FileText,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_RESEARCH_ROADMAP, type ResearchRoadmapTask } from "@/data/academicResearchData";

interface ModernThesisRoadmapProps {
  isArabic?: boolean;
}

interface DefenseCriteriaItem {
  id: string;
  titleAr: string;
  titleEn: string;
  authority: string;
  status: "fulfilled" | "pending" | "in_review";
  detailsAr: string;
}

const MESRS_DEFENSE_CRITERIA: DefenseCriteriaItem[] = [
  {
    id: "crit-1",
    titleAr: "نشر أو قبول نشر مقال علمي في مجلة محكمة (Catégorie B أو C)",
    titleEn: "Indexed Journal Publication (Cat B/C on ASJP)",
    authority: "وزارة التعليم العالي MESRS",
    status: "fulfilled",
    detailsAr: "مقال في مجلة مصنفة ذات معامل تأثير بصفة المؤلف الأول (First Author).",
  },
  {
    id: "crit-2",
    titleAr: "استيفاء رصيد التكوين النظري والحلقات الدراسية (180 نقطة ECTS)",
    titleEn: "Doctoral Training Credits (180 ECTS)",
    authority: "مدرسة الدكتوراه والمجلس العلمي",
    status: "fulfilled",
    detailsAr: "حضور الملتقيات الوطنية والدولية، الورشات المنهجية، والمحاضرات الأكاديمية.",
  },
  {
    id: "crit-3",
    titleAr: "تقرير المشرف الإيجابي بالموافقة على إيداع الأطروحة (Avis Favorable)",
    titleEn: "Supervisor Favorable Report",
    authority: "الأستاذ المشرف / Rapporteur",
    status: "fulfilled",
    detailsAr: "توقيع تقرير الصلاحية العلمية من الأستاذ المشرف والمشرف المساعد.",
  },
  {
    id: "crit-4",
    titleAr: "شهادة الفحص ضد الانتحال العلمي (Plagiarism Check < 15%)",
    titleEn: "Plagiarism Clearance Certificate",
    authority: "المكتبة المركزية والجامعة",
    status: "in_review",
    detailsAr: "تقرير الفحص عبر برمجيات كشف الانتحال المعتمدة (Urkund / Turnitin / iThenticate).",
  },
  {
    id: "crit-5",
    titleAr: "ملخص الأطروحة باللغات الثلاث (العربية، الإنجليزية، الفرنسية)",
    titleEn: "Trilingual Thesis Abstract",
    authority: "نيابة المديرية لما بعد التدرج",
    status: "fulfilled",
    detailsAr: "إيداع الملخص والكلمات المفتاحية في البوابة الوطنية للأطروحات PNST.",
  },
];

export function ModernThesisRoadmap({ isArabic = true }: ModernThesisRoadmapProps) {
  const [roadmap, setRoadmap] = useState<ResearchRoadmapTask[]>(DEFAULT_RESEARCH_ROADMAP);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [defenseCriteria, setDefenseCriteria] = useState<DefenseCriteriaItem[]>(MESRS_DEFENSE_CRITERIA);

  // New task modal / inline form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskHours, setNewTaskHours] = useState(15);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    let totalMilestones = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let totalHours = 0;

    roadmap.forEach((phase) => {
      phase.milestones.forEach((m) => {
        totalMilestones++;
        totalHours += m.timeEstimateHours;
        if (m.status === "completed") completedCount++;
        if (m.status === "in_progress") inProgressCount++;
      });
    });

    const percent = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;
    return { totalMilestones, completedCount, inProgressCount, totalHours, percent };
  }, [roadmap]);

  // Toggle milestone status cycle: pending -> in_progress -> completed -> pending
  const handleToggleStatus = (phaseIdx: number, milestoneIdx: number) => {
    setRoadmap((prev) => {
      const next = [...prev];
      const targetMilestone = { ...next[phaseIdx].milestones[milestoneIdx] };
      if (targetMilestone.status === "pending") {
        targetMilestone.status = "in_progress";
      } else if (targetMilestone.status === "in_progress") {
        targetMilestone.status = "completed";
      } else {
        targetMilestone.status = "pending";
      }
      next[phaseIdx].milestones[milestoneIdx] = targetMilestone;
      return next;
    });

    toast.success(isArabic ? "تم تحديث حالة المهمة الأكاديمية بنجاح!" : "Milestone status updated!");
  };

  // Add custom milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setRoadmap((prev) => {
      const next = [...prev];
      next[activePhaseIndex].milestones.push({
        titleAr: newTaskTitle.trim(),
        deadlineWeek: newTaskDeadline.trim() || "خلال 2 أسابيع",
        timeEstimateHours: Number(newTaskHours) || 10,
        status: "pending",
      });
      return next;
    });

    setNewTaskTitle("");
    setNewTaskDeadline("");
    setIsAddingTask(false);
    toast.success(isArabic ? "تمت إضافة المعلم الأكاديمي الجديد لخارطة الطريق." : "Milestone added.");
  };

  // Toggle Criteria
  const handleToggleCriteria = (critId: string) => {
    setDefenseCriteria((prev) =>
      prev.map((c) => {
        if (c.id === critId) {
          const nextStatus = c.status === "fulfilled" ? "pending" : "fulfilled";
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Print Readiness Dossier
  const handlePrintDossier = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>وثيقة الجاهزية الأكاديمية للمناقشة — EduPulse Research Studio</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            h1 { font-size: 22px; color: #0f172a; margin: 0; }
            h2 { font-size: 16px; color: #0369a1; margin-top: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
            th { background: #f8fafc; font-weight: bold; }
            .completed { color: #16a34a; font-weight: bold; }
            .in-progress { color: #d97706; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>بطاقة متابعة إنجاز الأطروحة ومعايير الجاهزية للمناقشة</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">وفق معايير وزارة التعليم العالي والبحث العلمي الجزائرية (MESRS)</p>
            </div>
            <div class="badge">نسبة الإنجاز: ${stats.percent}%</div>
          </div>

          <h2>1. معايير الأهلية للمناقشة (MESRS Defense Eligibility):</h2>
          <table>
            <thead>
              <tr>
                <th>المعيار الأكاديمي</th>
                <th>الهيئة المعنية</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${defenseCriteria
                .map(
                  (c) => `
                <tr>
                  <td>${c.titleAr}</td>
                  <td>${c.authority}</td>
                  <td class="${c.status === "fulfilled" ? "completed" : "in-progress"}">
                    ${c.status === "fulfilled" ? "مستوفى ✓" : "قيد المعالجة / استكمال"}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2>2. ملخص مراحل البحث وخارطة الطريق:</h2>
          <table>
            <thead>
              <tr>
                <th>المرحلة</th>
                <th>المهمة / المعلم</th>
                <th>الأجل الزمني</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${roadmap
                .map((p) =>
                  p.milestones
                    .map(
                      (m) => `
                  <tr>
                    <td>${p.phaseAr.split(":")[0]}</td>
                    <td>${m.titleAr}</td>
                    <td>${m.deadlineWeek}</td>
                    <td class="${m.status === "completed" ? "completed" : m.status === "in_progress" ? "in-progress" : ""}">
                      ${m.status === "completed" ? "منجز ✓" : m.status === "in_progress" ? "قيد التنفيذ ⏳" : "مجدول"}
                    </td>
                  </tr>
                `
                    )
                    .join("")
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            وثيقة مولدة تلقائياً من منصة EduPulse Research Studio · ${new Date().toLocaleDateString("ar-DZ")}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 350);
  };

  const currentPhase = roadmap[activePhaseIndex] || roadmap[0];

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Banner & Progress Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <GraduationCap className="w-3.5 h-3.5" />
                {isArabic ? "خارطة طريق الأطروحة والجاهزية للمناقشة" : "Thesis & Defense Milestone Navigator"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isArabic ? "وفق معايير MESRS" : "MESRS Compliant"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isArabic ? "مخطط الإنجاز الأكاديمي والجدولة الزمنية للأطروحة" : "Academic Timeline & Dissertation Progress"}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isArabic
                ? "تتبع تفاعلي للمراحل الأربع من مسح الأدبيات حتى المناقشة، مع إدارة معايير الأهلية الوزارية، وحساب الجاهزية الإجمالية في الزمن الحقيقي."
                : "Interactive 4-phase milestone tracking with live progress calculations, task toggling, and ministry defense criteria checklist."}
            </p>
          </div>

          {/* Real-time Readiness Progress Meter */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center">
              <span className="text-[11px] text-indigo-200 font-semibold block">{isArabic ? "الجاهزية الكلية" : "Readiness"}</span>
              <span className="text-4xl font-extrabold text-emerald-400 font-mono">{stats.percent}%</span>
            </div>

            <div className="h-10 w-px bg-white/20 hidden sm:block"></div>

            <div className="space-y-1 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{stats.completedCount} من أصل {stats.totalMilestones} مهام منجزة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>{stats.inProgressCount} مهام قيد التنفيذ النشط</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-300"></span>
                <span>إجمالي الجهد المقدر: {stats.totalHours} ساعة عمل</span>
              </div>
            </div>

            <button
              onClick={handlePrintDossier}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shrink-0"
              title="Print Dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isArabic ? "طباعة الملف" : "Print"}</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
            <span>{isArabic ? "المسار الزمني العام نحو إيداع الأطروحة (Thesis Completion Rate)" : "Overall Completion"}</span>
            <span className="font-bold text-white font-mono">{stats.percent}%</span>
          </div>
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive 4-Phase Stepper Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roadmap.map((phase, pIdx) => {
          const isActive = activePhaseIndex === pIdx;
          const completedInPhase = phase.milestones.filter((m) => m.status === "completed").length;
          const phasePercent = phase.milestones.length > 0 ? Math.round((completedInPhase / phase.milestones.length) * 100) : 0;

          return (
            <div
              key={pIdx}
              onClick={() => setActivePhaseIndex(pIdx)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                  : "bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isArabic ? `المرحلة ${pIdx + 1}` : `Phase ${pIdx + 1}`}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">{phasePercent}%</span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                {isArabic ? phase.phaseAr.split(":")[1] || phase.phaseAr : phase.phaseEn}
              </h4>

              {/* Mini Phase Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    phasePercent === 100 ? "bg-emerald-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${phasePercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Phase Details & Milestone Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Milestones */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-600">
                {isArabic ? `تفاصيل المرحلة ${activePhaseIndex + 1}` : `Phase ${activePhaseIndex + 1} Tasks`}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {isArabic ? currentPhase.phaseAr : currentPhase.phaseEn}
              </h3>
            </div>

            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingTask ? (isArabic ? "إلغاء" : "Cancel") : isArabic ? "إضافة معلم" : "Add Task"}</span>
            </button>
          </div>

          {/* Inline Add Task Form */}
          {isAddingTask && (
            <form onSubmit={handleAddMilestone} className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-indigo-950">{isArabic ? "إضافة معلم بحثي جديد لهذه المرحلة:" : "Add New Milestone:"}</h4>
              <div>
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={isArabic ? "عنوان المعلم (مثال: صياغة جدول المتغيرات وتوزيع الاستبانة)..." : "Milestone title..."}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  placeholder={isArabic ? "المدى الزمني (مثال: الأسبوع 7 - 8)" : "Deadline (e.g. Week 7)"}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                />
                <input
                  type="number"
                  value={newTaskHours}
                  onChange={(e) => setNewTaskHours(Number(e.target.value))}
                  placeholder="الساعات التقديرية"
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                >
                  {isArabic ? "تثبيت المعلم ✓" : "Save Milestone"}
                </button>
              </div>
            </form>
          )}

          {/* Milestone List with Interactive Status Toggle */}
          <div className="space-y-3">
            {currentPhase.milestones.map((m, mIdx) => {
              const isDone = m.status === "completed";
              const isWorking = m.status === "in_progress";

              return (
                <div
                  key={mIdx}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? "bg-emerald-50/40 border-emerald-200 text-slate-800"
                      : isWorking
                      ? "bg-amber-50/40 border-amber-200 text-slate-800"
                      : "bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(activePhaseIndex, mIdx)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isDone
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isWorking
                          ? "bg-amber-500 text-white shadow-xs animate-pulse"
                          : "bg-white border border-slate-300 text-slate-400 hover:border-indigo-500"
                      }`}
                      title={isArabic ? "انقر لتغيير الحالة (منجز / قيد التنفيذ / مؤجل)" : "Click to cycle status"}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : isWorking ? <Clock className="w-3.5 h-3.5" /> : mIdx + 1}
                    </button>

                    <div>
                      <p className={`text-xs font-bold leading-snug ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>
                        {m.titleAr}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{m.deadlineWeek}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{m.timeEstimateHours} ساعة عمل</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span
                      onClick={() => handleToggleStatus(activePhaseIndex, mIdx)}
                      className={`cursor-pointer px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        isDone
                          ? "bg-emerald-100 text-emerald-800"
                          : isWorking
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {isDone ? "منجز ✓" : isWorking ? "قيد التنفيذ ⏳" : "مجدول"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: MESRS Defense Eligibility Checklist */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              شروط التأهيل الرسمية
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {isArabic ? "معايير وزارة التعليم العالي للمناقشة (MESRS)" : "MESRS Defense Clearance Criteria"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic
                ? "الشروط النظامية الإلزامية لإيداع ملف الأطروحة ومصادقة المجلس العلمي."
                : "Mandatory regulatory milestones for doctoral viva defense clearance."}
            </p>
          </div>

          <div className="space-y-3">
            {defenseCriteria.map((c) => {
              const isFulfilled = c.status === "fulfilled";
              return (
                <div
                  key={c.id}
                  onClick={() => handleToggleCriteria(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isFulfilled
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isFulfilled ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 leading-snug">{c.titleAr}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{c.authority}</span>
                      <p className="text-[11px] text-slate-600 leading-tight">{c.detailsAr}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>انقر على أي شرط لتحديث حالة استيفائه</span>
            <span className="font-bold text-emerald-700 font-mono">
              {defenseCriteria.filter((c) => c.status === "fulfilled").length} / {defenseCriteria.length} مستوفاة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
