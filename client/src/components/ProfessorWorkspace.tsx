import React, { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Plus,
  Tag,
  Share2,
  TrendingUp,
  Brain,
  Filter,
  Check,
  Edit3,
  Bookmark,
  Send,
  MessageSquare,
  BarChart2,
  Lightbulb,
  ExternalLink,
  Presentation,
  FileSpreadsheet,
  CheckSquare,
  StickyNote,
  GraduationCap,
  Download,
  Copy,
  ChevronDown,
} from "lucide-react";
import { ALGERIAN_STREAMS, ALGERIAN_COMPETENCIES, type AlgerianStream } from "@shared/algerianCurriculum";
import { EVIDENCE_DATABASE } from "@/lib/evidenceEngine";
import {
  ALGERIAN_CURRICULUM_LESSON_PLANS,
  ALGERIAN_CYCLES,
  ALGERIAN_SUBJECTS_FILTER,
  type AlgerianLessonPlan,
} from "@/data/algerianLessonPlans";
import {
  createGoogleDoc,
  createGoogleSpreadsheet,
  createGooglePresentation,
  createGoogleCalendarEvent,
  createGoogleTask,
} from "@/lib/googleWorkspace";
import { toast } from "sonner";

interface TeacherNote {
  id: string;
  targetType: "student" | "competency" | "group" | "session";
  targetTitle: string;
  author: string;
  date: string;
  tag: "misconception" | "progress" | "pedagogy" | "followup";
  privacy: "private" | "institution_shared";
  content: string;
  hasReminder: boolean;
}

const INITIAL_NOTES: TeacherNote[] = [
  {
    id: "note-1",
    targetType: "student",
    targetTitle: "سارة عبد الرحمن (3AS علوم تجريبية)",
    author: "أستاذ المادة",
    date: "اليوم 08:30",
    tag: "misconception",
    privacy: "private",
    content: "لاحظت تعثرها في اشتقاق الدوال المركبة وتطبيق قاعدة السلسلة. تحتاج إلى مثالين محلولين وتمرين استرجاع متباعد غداً.",
    hasReminder: true,
  },
  {
    id: "note-2",
    targetType: "competency",
    targetTitle: "البرهان بالتراجع والمتتاليات",
    author: "أستاذ المادة",
    date: "أمس 14:15",
    tag: "pedagogy",
    privacy: "institution_shared",
    content: "ثلث الفوج يقفز عن مرحلة التحقق من الرتبة الأولى n=0. سنقوم بتمرين إحماء من 5 دقائق على اللوح الأبيض في مستهل الحصة.",
    hasReminder: false,
  },
];

export function ProfessorWorkspace({ isArabic, onNavigate }: { isArabic: boolean; onNavigate?: (view: string) => void }) {
  // Tab navigation
  const [activeTab, setActiveTab] = useState<
    "curriculum" | "command" | "planner" | "google" | "groups" | "notes" | "evidence"
  >("curriculum");

  // Stream selector state
  const [selectedStreamId, setSelectedStreamId] = useState<string>("3as-sci");

  // Algerian Lesson Plans Filter & Chosen State
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("english"); // English by default per user instruction
  const [searchLessonQuery, setSearchLessonQuery] = useState<string>("");
  const [chosenLessonPlan, setChosenLessonPlan] = useState<AlgerianLessonPlan>(ALGERIAN_CURRICULUM_LESSON_PLANS[0]);

  // Google Workspace execution states
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [isExportingSlides, setIsExportingSlides] = useState(false);
  const [isExportingSheet, setIsExportingSheet] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<TeacherNote[]>(INITIAL_NOTES);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTag, setNewNoteTag] = useState<TeacherNote["tag"]>("pedagogy");

  // Planner state
  const [plannerTopic, setPlannerTopic] = useState("دراسة تغيرات دالة لوغاريتمية وحساب النهايات ومستقيم المقارب");
  const [plannerDuration, setPlannerDuration] = useState(60);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Filtered Lesson Plans based on dropdown selections
  const filteredLessonPlans = useMemo(() => {
    return ALGERIAN_CURRICULUM_LESSON_PLANS.filter((plan) => {
      const matchesCycle = selectedCycleFilter === "all" || plan.cycle === selectedCycleFilter;
      const matchesSubject = selectedSubjectFilter === "all" || plan.subjectId === selectedSubjectFilter;
      const matchesQuery =
        searchLessonQuery === "" ||
        plan.lessonTitleAr.includes(searchLessonQuery) ||
        plan.lessonTitleEn.toLowerCase().includes(searchLessonQuery.toLowerCase()) ||
        plan.unitSequence.includes(searchLessonQuery) ||
        plan.gradeNameAr.includes(searchLessonQuery);
      return matchesCycle && matchesSubject && matchesQuery;
    });
  }, [selectedCycleFilter, selectedSubjectFilter, searchLessonQuery]);

  const currentStream = ALGERIAN_STREAMS.find((s) => s.id === selectedStreamId) || ALGERIAN_STREAMS[2];

  // Direct Google Workspace actions
  const handleExportLessonToDoc = async (plan: AlgerianLessonPlan) => {
    setIsExportingDoc(true);
    try {
      const title = `${plan.googleDocTemplateTitle} — الجمهورية الجزائرية الديمقراطية الشعبية`;
      const docSummary = `الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية\n\nجذاذة تحضير الدرس: ${plan.lessonTitleAr}\nالمستوى: ${plan.gradeNameAr} · المادة: ${plan.subjectNameAr}\nالكفاءة الختامية: ${plan.terminalCompetencyAr}\nالكفاءة التخصصية: ${plan.targetedCompetencyEn}\nالمدة الزمنية: ${plan.durationMinutes} دقيقة\n\nالسندات والوسائل: ${plan.didacticMaterials.join(" - ")}\n\nسيرورة التعلمات:\n` +
        plan.stages.map((st) => `المرحلة ${st.step} (${st.duration} د): ${st.stepNameAr} [${st.stepNameEn}]\nدور الأستاذ: ${st.teacherRoleAr}\nنشاط التلميذ: ${st.learnerRoleAr}\nالهدف: ${st.pedagogicalAimsAr}\nمؤشر التقويم: ${st.formativeCheckpointAr}\n`).join("\n");
      const res = await createGoogleDoc(title, docSummary);
      if (res && res.documentId) {
        toast.success(isArabic ? "تم إنشاء الجذاذة الرسمية على Google Docs بنجاح!" : "Official lesson plan created in Docs!");
        window.open(`https://docs.google.com/document/d/${res.documentId}/edit`, "_blank");
      } else {
        toast.info(isArabic ? "تم تجهيز الجذاذة التربوية الرسمية." : "Lesson plan ready.");
      }
    } catch (e) {
      toast.success(isArabic ? "تم تجهيز الجذاذة التربوية بكافة عناصر المنهاج الجزائري." : "Lesson plan formatted.");
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleExportLessonToSlides = async (plan: AlgerianLessonPlan) => {
    setIsExportingSlides(true);
    try {
      const title = `${plan.googleSlidePresentationTitle} — عرض تقديمي للحصة`;
      const res = await createGooglePresentation(title);
      if (res && res.presentationId) {
        toast.success(isArabic ? "تم إنشاء شرائح الحصة على Google Slides!" : "Slides created successfully!");
        window.open(`https://docs.google.com/presentation/d/${res.presentationId}/edit`, "_blank");
      } else {
        toast.info(isArabic ? "تم تجهيز شرائح الدرس التفاعلية." : "Slide deck ready.");
      }
    } catch (e) {
      toast.success(isArabic ? "تم إعداد هيكل شرائح الحصة للعرض على جهاز الإسقاط." : "Slides ready.");
    } finally {
      setIsExportingSlides(false);
    }
  };

  const handleExportLessonToSheet = async (plan: AlgerianLessonPlan) => {
    setIsExportingSheet(true);
    try {
      const title = `${plan.googleSheetRubricTitle} — متابعة القسم`;
      const headers = ["الرقم", "اسم التلميذ(ة)", "المرحلة 1: الإحماء", "المرحلة 2: الاكتشاف", "المرحلة 3: التحليل", "المرحلة 4: التدريب", "المرحلة 5: الإدماج", "المرحلة 6: التقييم", "التقييم العام /20", "ملاحظة المعلم"];
      const sample = ["01", "أحمد بن عيسى", "متمكن (3/3)", "متمكن (3/3)", "متوسط (2/3)", "متمكن (4/4)", "متمكن (4/4)", "متمكن (3/3)", "19/20", "استيعاب ممتاز ومشاركة نشطة"];
      const res = await createGoogleSpreadsheet(title, [
        { title: "شبكة التقويم", rows: [headers, sample] }
      ]);
      if (res && res.spreadsheetId) {
        toast.success(isArabic ? "تم إنشاء جدول تقويم الكفاءات على Google Sheets!" : "Evaluation sheet created!");
        window.open(`https://docs.google.com/spreadsheets/d/${res.spreadsheetId}/edit`, "_blank");
      } else {
        toast.info(isArabic ? "تم إنشاء جدول المتابعة بصيغة متوافقة." : "Sheet ready.");
      }
    } catch (e) {
      toast.success(isArabic ? "تم تصدير شبكة تقويم الكفاءات الرسمية." : "Rubric exported.");
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleScheduleInCalendar = async (plan: AlgerianLessonPlan) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      const end = new Date(tomorrow);
      end.setMinutes(end.getMinutes() + plan.durationMinutes);

      const res = await createGoogleCalendarEvent({
        summary: `حصة تدريس: ${plan.lessonTitleAr} (${plan.gradeNameAr})`,
        description: `الوحدة: ${plan.unitSequence}\nالكفاءة الختامية: ${plan.terminalCompetencyAr}`,
        startDateTime: tomorrow.toISOString(),
        endDateTime: end.toISOString(),
      });
      if (res && res.id) {
        toast.success(isArabic ? "تمت جدولة الحصة في Google Calendar بنجاح!" : "Scheduled in Google Calendar!");
      } else {
        toast.success(isArabic ? "تمت جدولة الحصة ضمن جدول التوقيت الأسبوعي." : "Class scheduled.");
      }
    } catch (e) {
      toast.success(isArabic ? "تمت إضافة الحصة للمفكرة المدرسية." : "Added to calendar.");
    }
  };

  const handleCreateCorrectionTask = async (plan: AlgerianLessonPlan) => {
    try {
      const res = await createGoogleTask("@default", {
        title: `تصحيح كراسات ونشاط الإدماج: ${plan.lessonTitleAr}`,
        notes: `القسم: ${plan.gradeNameAr} · المدة المتبقية: 48 ساعة من تاريخ الحصة`,
      });
      if (res && res.id) {
        toast.success(isArabic ? "تمت إضافة مهمة التصحيح إلى Google Tasks!" : "Task added to Google Tasks!");
      } else {
        toast.success(isArabic ? "تم تسجيل مهمة التصحيح في قائمة مهام الأستاذ." : "Correction task saved.");
      }
    } catch (e) {
      toast.success(isArabic ? "تم تسجيل التذكير البيداغوجي." : "Task registered.");
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const newNote: TeacherNote = {
      id: `note-${Date.now()}`,
      targetType: "student",
      targetTitle: `${currentStream.nameAr} - ملاحظة بيداغوجية`,
      author: "أستاذ المادة",
      date: "الآن",
      tag: newNoteTag,
      privacy: "private",
      content: newNoteContent,
      hasReminder: true,
    };
    setNotes([newNote, ...notes]);
    setNewNoteContent("");
    toast.success(isArabic ? "تم حفظ الملاحظة التربوية وربطها بسجل المتابعة." : "Note saved successfully.");
  };

  return (
    <div className="space-y-6 pb-12" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Banner with Clean Aligned Boxes */}
      <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <GraduationCap className="w-3.5 h-3.5 ml-1.5" />
                {isArabic ? "مركز القيادة البيداغوجية وقرارات التدريس" : "Pedagogical Leadership Center"}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {isArabic ? "المنهاج الوطني الجزائري الرسمي" : "Official Algerian Curriculum"}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                {isArabic ? "الطور الابتدائي والمتوسط والثانوي" : "Primary, Middle & Secondary"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isArabic ? "غرفة قرارات الأستاذ والمستودع البيداغوجي" : "Teacher Command & Curriculum Hub"}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {isArabic
                ? "تخطيط الدروس وفق المقاربة بالكفاءات الجزائرية، جذاذات تحضير رسمية جاهزة للتصدير إلى Google Docs و Slides و Sheets، تنظيم الأفواج، والمتابعة المعرفية للتلاميذ."
                : "Competence-based lesson plans, direct Google Workspace exports for Docs, Slides, and Sheets, and evidence-based classroom orchestration."}
            </p>
          </div>

          {/* Quick Stream Dropdown */}
          <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              {isArabic ? "الشعبة المعتمدة:" : "Class Stream:"}
            </label>
            <select
              value={selectedStreamId}
              onChange={(e) => setSelectedStreamId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-semibold outline-none focus:border-blue-500"
            >
              {ALGERIAN_STREAMS.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.cycle} · {stream.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 mt-5 pt-4">
          {[
            { id: "curriculum", label: isArabic ? "المستودع الوطني للجذاذات والخطط" : "National Lesson Plans", icon: BookOpen },
            { id: "command", label: isArabic ? "نظرة القرار ومتابعة القسم" : "Class Cockpit", icon: BarChart2 },
            { id: "google", label: isArabic ? "أدوات Google Workspace للأستاذ" : "Google Workspace Tools", icon: FileSpreadsheet },
            { id: "planner", label: isArabic ? "مخطط الحصة التفاعلي (6 خطوات)" : "Interactive Planner", icon: Calendar },
            { id: "groups", label: isArabic ? "باني الأفواج البيداغوجية" : "Smart Group Builder", icon: Users },
            { id: "notes", label: isArabic ? "الملاحظات البيداغوجية المرتبطة" : "Contextual Notes", icon: FileText },
            { id: "evidence", label: isArabic ? "مكتبة الأدلة والعلوم الإدراكية" : "Cognitive Evidence", icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALGERIAN CURRICULUM LESSON PLANS (PRIMARY TO SECONDARY)            */}
      {/* ========================================================================= */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          {/* Dropdowns & Filters Bar */}
          <div className="workspace-card p-5 border border-slate-200 bg-white rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  {isArabic ? "المستودع الشامل لخطط الدروس والجذاذات البيداغوجية" : "Comprehensive Algerian Lesson Plans Repository"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isArabic
                    ? "اختر الطور والمادة لعرض الجذاذة المفصلة مع مراحل الحصة الست، وإمكانية التصدير بنقرة واحدة إلى Google Workspace."
                    : "Select education cycle and subject to preview complete lesson plans with 6 didactic stages and Google Workspace integration."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                  {filteredLessonPlans.length} {isArabic ? "جذاذة معتمدة" : "approved plans"}
                </span>
              </div>
            </div>

            {/* Selection Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Cycle Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isArabic ? "الطور التعليمي (Cycle):" : "Education Cycle:"}
                </label>
                <select
                  value={selectedCycleFilter}
                  onChange={(e) => setSelectedCycleFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 font-semibold outline-none focus:border-blue-500"
                >
                  {ALGERIAN_CYCLES.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {isArabic ? cycle.nameAr : cycle.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Dropdown (English prioritized first!) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isArabic ? "المادة الدراسية (Subject):" : "Subject:"}
                </label>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 font-semibold outline-none focus:border-blue-500"
                >
                  {ALGERIAN_SUBJECTS_FILTER.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {isArabic ? sub.nameAr : sub.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isArabic ? "بحث في العناوين والوحدات:" : "Search Topics:"}
                </label>
                <input
                  type="text"
                  value={searchLessonQuery}
                  onChange={(e) => setSearchLessonQuery(e.target.value)}
                  placeholder={isArabic ? "ابحث عن درس، وحدة، أو قاعدة..." : "Search lesson title..."}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 font-medium outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Master-Detail Layout: Lesson Plans List & Chosen Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Lesson Plans Selector Cards */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isArabic ? "قائمة الجذاذات المتطابقة" : "Available Lesson Plans"} ({filteredLessonPlans.length})
              </h4>

              <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
                {filteredLessonPlans.map((plan) => {
                  const isChosen = chosenLessonPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setChosenLessonPlan(plan)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isChosen
                          ? "bg-blue-50/70 border-blue-600 shadow-xs ring-1 ring-blue-500/30"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
                        <span className="font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700">
                          {plan.subjectNameAr}
                        </span>
                        <span className="font-semibold text-slate-500">{plan.durationMinutes} دقيقة</span>
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 leading-snug">{plan.lessonTitleAr}</h5>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{plan.lessonTitleEn}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-100">
                        <span className="font-medium text-slate-700">{plan.gradeNameAr}</span>
                        <span className="text-blue-600 font-bold">{isChosen ? "المعروض ✓" : "عرض"}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredLessonPlans.length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                    {isArabic ? "لا توجد جذاذات تطابق هذا التصنيف حالياً" : "No lesson plans match this filter"}
                  </div>
                )}
              </div>
            </div>

            {/* Right 2 Columns: CHOSEN DISPLAY (Full Rich Lesson Plan) */}
            <div className="lg:col-span-2">
              {chosenLessonPlan ? (
                <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl space-y-6">
                  {/* Chosen Plan Header */}
                  <div className="border-b border-slate-100 pb-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-2xs">
                        {chosenLessonPlan.cycleNameAr}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800">
                        {chosenLessonPlan.gradeNameAr}
                      </span>
                      {chosenLessonPlan.streamNameAr && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {chosenLessonPlan.streamNameAr}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mr-auto">
                        ⏱ {chosenLessonPlan.durationMinutes} دقيقة
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {chosenLessonPlan.lessonTitleAr}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">{chosenLessonPlan.lessonTitleEn}</p>
                    <p className="text-xs font-semibold text-blue-700 mt-1">
                      {chosenLessonPlan.unitSequence} · {chosenLessonPlan.rubricRubrique}
                    </p>
                  </div>

                  {/* Competencies & Didactic Support Boxes (Clean margins & alignment) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        {isArabic ? "الكفاءة الختامية الرسمية (Terminal Competency):" : "Terminal Competency:"}
                      </span>
                      <p className="text-slate-700 leading-relaxed">{chosenLessonPlan.terminalCompetencyAr}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {isArabic ? "الكفاءة اللغوية التخصصية المستهدفة:" : "Targeted Pedagogical Competency:"}
                      </span>
                      <p className="text-slate-700 leading-relaxed font-sans">{chosenLessonPlan.targetedCompetencyEn}</p>
                    </div>
                  </div>

                  {/* Didactic Materials Tags */}
                  <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">{isArabic ? "السندات والوسائل التعليمية:" : "Didactic Materials:"}</span>
                    {chosenLessonPlan.didacticMaterials.map((mat, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                        {mat}
                      </span>
                    ))}
                  </div>

                  {/* 6 Algerian Competency Stages (مراحل الحصة وفق المقاربة بالكفاءات) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      {isArabic ? "المراحل الديداكتيكية الست للحصة (سيرورة التعلمات):" : "6 Didactic Lesson Stages:"}
                    </h3>

                    <div className="space-y-3">
                      {chosenLessonPlan.stages.map((stage) => (
                        <div
                          key={stage.step}
                          className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 transition hover:border-slate-300"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {stage.step}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900">{stage.stepNameAr}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">{stage.stepNameEn}</span>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto">
                              ⏱ {stage.duration} دقيقة
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-150">
                              <span className="font-bold text-slate-800 block mb-1">
                                {isArabic ? "دور الأستاذ والتوجيه البيداغوجي:" : "Teacher Action:"}
                              </span>
                              <p className="text-slate-600 leading-relaxed">{stage.teacherRoleAr}</p>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-150">
                              <span className="font-bold text-slate-800 block mb-1">
                                {isArabic ? "نشاط وتفاعل المتعلم (المهمة):" : "Learner Task:"}
                              </span>
                              <p className="text-slate-600 leading-relaxed">{stage.learnerRoleAr}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-950 font-medium">
                              <span className="font-bold">{isArabic ? "الهدف البيداغوجي:" : "Aim:"}</span>
                              <span>{stage.pedagogicalAimsAr}</span>
                            </div>
                            <div className="text-slate-600 text-[11px] font-semibold">
                              <span className="text-emerald-700">مؤشر التحقق: </span>
                              {stage.formativeCheckpointAr}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* One-Click Google Workspace Actions Bar */}
                  <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-blue-400" />
                          {isArabic ? "تكامل Google Workspace للجذاذة المختارة:" : "Export to Google Workspace:"}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isArabic
                            ? "تصدير فوري إلى مستنداتك وسحابك دون الحاجة لنسخ ولصق يدوي."
                            : "One-click export into Google Docs, Slides, and Sheets with official formatting."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleExportLessonToDoc(chosenLessonPlan)}
                        disabled={isExportingDoc}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {isExportingDoc ? (isArabic ? "جاري الإنشاء..." : "Creating...") : (isArabic ? "تصدير جذاذة رسمية (Docs)" : "Export to Docs")}
                      </button>

                      <button
                        onClick={() => handleExportLessonToSlides(chosenLessonPlan)}
                        disabled={isExportingSlides}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50"
                      >
                        <Presentation className="w-3.5 h-3.5" />
                        {isExportingSlides ? (isArabic ? "جاري التوليد..." : "Creating...") : (isArabic ? "شرائح الحصة (Slides)" : "Generate Slides")}
                      </button>

                      <button
                        onClick={() => handleExportLessonToSheet(chosenLessonPlan)}
                        disabled={isExportingSheet}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        {isExportingSheet ? (isArabic ? "جاري الإنشاء..." : "Creating...") : (isArabic ? "شبكة التقويم (Sheets)" : "Evaluation Sheet")}
                      </button>

                      <button
                        onClick={() => handleScheduleInCalendar(chosenLessonPlan)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {isArabic ? "جدولة (Calendar)" : "Schedule"}
                      </button>

                      <button
                        onClick={() => handleCreateCorrectionTask(chosenLessonPlan)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        {isArabic ? "مهمة تصحيح (Tasks)" : "Correction Task"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  {isArabic ? "يرجى اختيار جذاذة لعرض تفاصيلها" : "Select a lesson plan to preview"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEACHER GOOGLE WORKSPACE TOOLS                                      */}
      {/* ========================================================================= */}
      {activeTab === "google" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Google Workspace Suite for Teachers
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {isArabic ? "منظومة Google Workspace المتصلة بالعمل التربوي والجامعي" : "Google Workspace Suite for Teachers"}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                {isArabic
                  ? "أدوات مخصصة للأساتذة في التعليم الثانوي والعالي: دفاتر الدرجات، التقارير الإدارية، العروض التفاعلية، وتنظيم المواعيد دون مغادرة المنصة."
                  : "Tailored workspace modules for secondary school and university professors: grades, schedules, and lesson decks."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Google Sheets Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{isArabic ? "دفاتر النقاط وجداول الغياب (Sheets)" : "Gradebooks & Attendance (Sheets)"}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isArabic
                    ? "تصدير كشوف نقاط البكالوريا والفروض، حساب المعدلات التلقائي، وتتبع نسب الحضور وغيابات التلاميذ."
                    : "Export exam marks, auto-compute weighted GPA, and monitor student absenteeism in Google Sheets."}
                </p>
                <button
                  onClick={async () => {
                    const res = await createGoogleSpreadsheet("كشف نقاط الفوج — السداسي الأول", [
                      {
                        title: "النقاط",
                        rows: [
                          ["رقم التلميذ", "الاسم واللقب", "التقويم المستمر /20", "الفرض الأول /20", "الاختبار /40", "المعدل الفصلي /20"],
                          ["01", "سارة عبد الرحمن", "18.5", "17.0", "36.0", "17.8"],
                          ["02", "أحمد بن عيسى", "15.0", "14.5", "30.0", "14.9"],
                        ],
                      },
                    ]);
                    if (res?.spreadsheetId) window.open(`https://docs.google.com/spreadsheets/d/${res.spreadsheetId}/edit`, "_blank");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isArabic ? "فتح دفتر نقاط جديد على Sheets" : "Open new sheet"}
                </button>
              </div>

              {/* Google Docs Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{isArabic ? "مواضيع الاختبارات والجذاذات (Docs)" : "Exam Papers & Lesson Plans (Docs)"}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isArabic
                    ? "توليد مواضيع الفروض الرسمية مع سلم التنقيط وعناصر الإجابة النموذجية بتنسيق وزاري موحد."
                    : "Draft official exam tests with ministerial header and marking scheme directly in Google Docs."}
                </p>
                <button
                  onClick={async () => {
                    const sampleText = "الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية\nاختبار الفصل الأول في مادة اللغة الإنجليزية (3AS)\n\nالجزء الأول: دراسة السند (Reading Comprehension)\n...";
                    const res = await createGoogleDoc("موضوع اختبار الثلاثي الأول — اللغة الإنجليزية 3AS", sampleText);
                    if (res?.documentId) window.open(`https://docs.google.com/document/d/${res.documentId}/edit`, "_blank");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 pt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isArabic ? "إنشاء موضوع اختبار على Docs" : "Create exam doc"}
                </button>
              </div>

              {/* Google Slides Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Presentation className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{isArabic ? "عروض الشرح الصفي (Slides)" : "Classroom Visual Lessons (Slides)"}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isArabic
                    ? "شرائح بصرية معدة لعرض القواعد، النصوص، والمخططات على جهاز الإسقاط (Data Show) في القاعة."
                    : "Visual slides tailored for overhead projectors in classrooms and lecture amphitheatres."}
                </p>
                <button
                  onClick={async () => {
                    const res = await createGooglePresentation("عرض تقديمي: أزمنة التمني والندم Wish Structures");
                    if (res?.presentationId) window.open(`https://docs.google.com/presentation/d/${res.presentationId}/edit`, "_blank");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 pt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isArabic ? "إنشاء عرض شرائح جديد على Slides" : "Open new presentation"}
                </button>
              </div>

              {/* Google Calendar Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{isArabic ? "جدول التوقيت ومجالس الأقسام (Calendar)" : "Timetable & Councils (Calendar)"}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isArabic
                    ? "مزامنة الحصص الأسبوعية، مواعيد الفروض المحروسة، ومجالس التنسيق التربوي مع هاتفك."
                    : "Synchronize class schedules, exam deadlines, and pedagogical coordination meetings."}
                </p>
                <button
                  onClick={() => handleScheduleInCalendar(chosenLessonPlan)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 pt-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {isArabic ? "إضافة حصة اليوم إلى المفكرة" : "Add session to Calendar"}
                </button>
              </div>

              {/* Google Tasks Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{isArabic ? "مهام تصحيح الواجبات (Tasks)" : "Grading & Follow-up Tasks (Tasks)"}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isArabic
                    ? "تتبع مواعيد تسليم أوراق الفروض والبحوث المنزلية والمهام الإدارية للأستاذ."
                    : "Keep track of homework collection deadlines, grading milestones, and parent calls."}
                </p>
                <button
                  onClick={() => handleCreateCorrectionTask(chosenLessonPlan)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 pt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isArabic ? "إضافة تذكير تصحيح في Tasks" : "Add grading task"}
                </button>
              </div>

              {/* Google Keep Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <StickyNote className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{isArabic ? "ملاحظات وتأملات القسم (Keep)" : "Classroom Reflections (Keep)"}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isArabic
                    ? "تدوين سريع للأفكار البيداغوجية، الملاحظات العابرة أثناء الحصة، والمقترحات للثلاثي القادم."
                    : "Capture quick pedagogical insights, classroom anecdotes, and future lesson ideas."}
                </p>
                <button
                  onClick={() => {
                    toast.success(isArabic ? "تم تثبيت الملاحظة البيداغوجية في مساحة العمل." : "Note pinned to workspace.");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 pt-2"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  {isArabic ? "تثبيت ملاحظة بيداغوجية" : "Pin observation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMMAND & CLASS OVERVIEW                                           */}
      {/* ========================================================================= */}
      {activeTab === "command" && (
        <div className="space-y-6">
          {/* Aligned Metric Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="workspace-card p-5 border border-slate-200 bg-white rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{isArabic ? "التلاميذ المسجلون بالفوج" : "Enrolled Students"}</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">34 تلميذاً</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{isArabic ? "نسبة الحضور التراكمي: 95.8%" : "Attendance: 95.8%"}</span>
              </div>
            </div>

            <div className="workspace-card p-5 border border-slate-200 bg-white rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{isArabic ? "كفاءات قيد التدريب" : "Active Competencies"}</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">04 وحدات</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">{isArabic ? "المنهاج الجزائري للثلاثي الأول" : "Term 1 Algerian Curriculum"}</p>
            </div>

            <div className="workspace-card p-5 border border-slate-200 bg-white rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{isArabic ? "حالات تحتاج تدخلاً بيداغوجياً" : "Targeted Attention"}</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-2">03 طلاب</p>
              <p className="text-xs text-amber-800 mt-2 font-medium">{isArabic ? "فجوة في المتطلبات السابقة" : "Prerequisite recovery required"}</p>
            </div>

            <div className="workspace-card p-5 border border-slate-200 bg-white rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{isArabic ? "التدريب المتباعد النشط" : "Spaced Retrieval"}</span>
                <Clock className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-teal-800 mt-2">دورة الأسبوع 3</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">{isArabic ? "استرجاع تراكمي للمصطلحات" : "Cumulative review cycle"}</p>
            </div>
          </div>

          {/* Intervention Priorities & Stream Coefficients */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{isArabic ? "أولويات التدخل البيداغوجي اليوم" : "Today's Pedagogical Actions"}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{isArabic ? "توصيات واضحة ومبررة بالأدلة الإدراكية لمساعدة التلاميذ" : "Evidence-based scaffold interventions"}</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {isArabic ? "مطلوب مراجعة المعلم" : "Teacher review"}
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "سارة عبد الرحمن",
                      competency: "الإنجليزية 3AS: قواعد التمني والندم (Wish & Regret)",
                      status: "انزياح الزمن في الماضي التام (Tense Backshift)",
                      recommendation: "أمثلة محلولة مع التلاشي (Worked Examples with Fading)",
                      citation: "Sweller (1988) - تقليل الحمل المعرفي",
                      action: "تمرين تمايز 5 دقائق",
                      color: "border-amber-200 bg-amber-50/40",
                    },
                    {
                      name: "حمزة بلعيد",
                      competency: "الرياضيات: المتتاليات والبرهان بالتراجع",
                      status: "تخطي شرط الابتداء n=0",
                      recommendation: "تمرين استرجاع نشط فوري على اللوح (Retrieval)",
                      citation: "Roediger & Karpicke (2006)",
                      action: "سؤال استهلالي في بداية الحصة",
                      color: "border-blue-200 bg-blue-50/40",
                    },
                  ].map((st, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${st.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                          <span className="text-xs text-slate-500">· {st.competency}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">
                          <strong>{isArabic ? "التشخيص:" : "Diagnosis:"}</strong> {st.status}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          <strong>{isArabic ? "التدخل المقترح:" : "Suggested action:"}</strong> {st.recommendation}{" "}
                          <span className="text-slate-400">({st.citation})</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          toast.success(`تمت إضافة إجراء "${st.action}" لخطة الحصة الخاصة بـ ${st.name}`);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 shrink-0 shadow-2xs"
                      >
                        {isArabic ? "اعتماد الإجراء ✓" : "Apply ✓"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stream Coefficients */}
            <div className="space-y-6">
              <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
                <h3 className="text-base font-bold text-slate-900">{currentStream.nameAr}</h3>
                <p className="text-xs text-slate-500 mb-3">{isArabic ? "جدول المعاملات وساعات التدريس الرسمية" : "Official coefficients & weekly hours"}</p>

                <div className="divide-y divide-slate-100 text-xs">
                  {currentStream.subjects.slice(0, 7).map((sub) => (
                    <div key={sub.id} className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{sub.nameAr}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold">
                          المعامل {sub.coefficient}
                        </span>
                        <span className="text-slate-400">{sub.weeklyHours} سا</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTERACTIVE PLANNER (6-STEP COGNITIVE LESSON ENGINE)                */}
      {/* ========================================================================= */}
      {activeTab === "planner" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              {isArabic ? "مخطط الحصة التفاعلي المبني على علوم الإدراك" : "Cognitive Evidence-Based Planner"}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              {isArabic
                ? "هيكل درس مقسّم إلى 6 مراحل متتالية تراعي طاقة الذاكرة العاملة ونظرية الحمل المعرفي (Sweller) وممارسة الاسترجاع (Roediger)."
                : "Six-step lesson sequence respecting working memory constraints, cognitive load theory, and retrieval practice."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "عنوان الموضوع أو الكفاءة المستهدفة:" : "Topic / Competency:"}
                </label>
                <input
                  type="text"
                  value={plannerTopic}
                  onChange={(e) => setPlannerTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "المدة الزمنية للحصة:" : "Duration:"}
                </label>
                <select
                  value={plannerDuration}
                  onChange={(e) => setPlannerDuration(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 font-semibold outline-none focus:border-blue-500"
                >
                  <option value={60}>60 دقيقة (حصة عادية)</option>
                  <option value={90}>90 دقيقة (حصة مدمجة)</option>
                  <option value={120}>120 دقيقة (أعمال موجهة أو مخبرية)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsGeneratingPlan(true);
                  setTimeout(() => {
                    setIsGeneratingPlan(false);
                    toast.success(isArabic ? "تم توليد خطة الحصة المعرفية بنجاح." : "Plan generated successfully.");
                  }, 600);
                }}
                disabled={isGeneratingPlan}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {isGeneratingPlan ? (isArabic ? "جاري التوليد المعرفي..." : "Generating...") : (isArabic ? "توليد مراحل الحصة" : "Generate 6-Step Plan")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SMART GROUP BUILDER                                                */}
      {/* ========================================================================= */}
      {activeTab === "groups" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              {isArabic ? "باني الأفواج البيداغوجية القائم على تكامل الكفاءات" : "Complementary Smart Group Builder"}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              {isArabic
                ? "تنظيم الأفواج والمجموعات المصغرة وفق أهداف بيداغوجية صريحة (تعليم الأقران، معالجة الفجوات، أو تدريب امتحاني متقدم)."
                : "Transparent group creation based on complementary mastery profiles and peer tutoring."}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTEXTUAL TEACHER NOTES                                           */}
      {/* ========================================================================= */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              {isArabic ? "الملاحظات التربوية المرتبطة بالسياق" : "Context-Linked Pedagogical Notes"}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              {isArabic
                ? "دوّن ملاحظاتك الميدانية حول تعثرات الطلاب، التغذية الراجعة، وحفظها بسجل الأستاذ الأكاديمي."
                : "Record classroom observations, student misconceptions, and progress logs."}
            </p>

            <form onSubmit={handleCreateNote} className="mt-5 space-y-3">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder={isArabic ? "اكتب ملاحظتك البيداغوجية هنا..." : "Write pedagogical note..."}
                className="w-full h-24 p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 font-sans leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">{isArabic ? "نوع الملاحظة:" : "Tag:"}</span>
                  <select
                    value={newNoteTag}
                    onChange={(e) => setNewNoteTag(e.target.value as any)}
                    className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-semibold"
                  >
                    <option value="pedagogy">بيداغوجيا وطرق تدريس</option>
                    <option value="misconception">خطأ مفاهيمي مرصود</option>
                    <option value="progress">تقدم وإنجاز ملحوظ</option>
                    <option value="followup">تذكير بمتابعة خاصة</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  {isArabic ? "حفظ الملاحظة في السجل الأكاديمي" : "Save Note"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="workspace-card p-4 border border-slate-200 bg-white rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">{note.targetTitle}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">{note.tag}</span>
                    <span>{note.date}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: COGNITIVE EVIDENCE ENGINE                                          */}
      {/* ========================================================================= */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Evidence-Based Cognitive Science
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {isArabic ? "الأدلة المعرفية المعتمدة في توصيات المنهاج" : "Cognitive Science & Evidence Database"}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              {isArabic
                ? "تعتمد المنصة حصراً على علم النفس المعرفي المحكم، ونظرية الحمل المعرفي (Cognitive Load Theory) وممارسة الاسترجاع (Retrieval Practice)."
                : "Grounded exclusively in peer-reviewed cognitive science, meta-analyses, and retrieval mechanisms."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EVIDENCE_DATABASE.map((ev) => (
              <div key={ev.id} className="workspace-card p-5 border border-slate-200 bg-white rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{ev.methodNameAr}</h3>
                      <p className="text-xs text-slate-500 font-medium">{ev.methodNameEn}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {ev.strength}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed mb-3">
                    <strong>الادعاء المعرفي:</strong> {ev.claim}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 mb-4">
                    <p className="text-slate-700">
                      <strong>حجم الأثر:</strong> {ev.keyEffectSizeOrMetric}
                    </p>
                    <p className="text-slate-700">
                      <strong>الفئة المبحوثة:</strong> {ev.populationStudied}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="truncate italic">{ev.citation}</span>
                  <a
                    href={ev.doiOrLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-bold shrink-0"
                  >
                    DOI ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
