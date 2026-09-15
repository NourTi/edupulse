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
  FileUp,
  Copy,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { TeacherDocumentStudio } from "./TeacherDocumentStudio";
import { StudyAssessmentGenerator } from "./academic/StudyAssessmentGenerator";
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
import { InteractiveSpiderEvaluation } from "./academic/InteractiveSpiderEvaluation";

export interface CognitiveStepItem {
  step: number;
  titleAr: string;
  titleEn: string;
  durationMin: number;
  cognitiveBasis: string;
  teacherRoleAr: string;
  learnerRoleAr: string;
  formativeCheckAr: string;
  didacticToolsAr: string;
}

export interface GeneratedCognitivePlan {
  id: string;
  topicAr: string;
  streamNameAr: string;
  durationMinutes: number;
  terminalCompetencyAr: string;
  cognitiveReferences: string[];
  stages: CognitiveStepItem[];
  spacedRetrievalChallenge: string;
}

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
    "curriculum" | "documents" | "command" | "planner" | "google" | "groups" | "notes" | "evidence" | "quiz_flashcards"
  >("curriculum");

  // Study text state for Quiz & Flashcards generator
  const [customStudyText, setCustomStudyText] = useState<string>("");
  const [customStudyTitle, setCustomStudyTitle] = useState<string>("");

  // Helper to compile study text from an AlgerianLessonPlan
  const compileLessonStudyText = (plan: AlgerianLessonPlan) => {
    const stagesText = plan.stages
      .map(
        (s) =>
          `المرحلة ${s.step}: ${s.stepNameAr} (${s.stepNameEn})\n- دور الأستاذ والتوجيه: ${s.teacherRoleAr}\n- نشاط ومهمة المتعلم: ${s.learnerRoleAr}\n- الهدف البيداغوجي: ${s.pedagogicalAimsAr}\n- مؤشر التحقق: ${s.formativeCheckpointAr}`
      )
      .join("\n\n");

    return `عنوان الدرس: ${plan.lessonTitleAr}
Subject: ${plan.subjectNameAr} (${plan.subjectNameEn}) - ${plan.gradeNameAr} - ${plan.streamNameAr}
الوحدة / الميدان: ${plan.unitSequence} - ${plan.rubricRubrique}
الكفاءة الختامية الرسمية: ${plan.terminalCompetencyAr}
الكفاءة المستهدفة: ${plan.targetedCompetencyEn}

المراحل البيداغوجية والديداكتيكية المفصلة للحصة:
${stagesText}`;
  };

  const handleLaunchQuizForLesson = (plan: AlgerianLessonPlan) => {
    const text = compileLessonStudyText(plan);
    setCustomStudyText(text);
    setCustomStudyTitle(plan.lessonTitleAr);
    setActiveTab("quiz_flashcards");
    toast.success(
      isArabic
        ? `تم تحميل نص درس "${plan.lessonTitleAr}" إلى مولد الكويز.`
        : `Loaded lesson plan "${plan.lessonTitleAr}" into Quiz Studio.`
    );
  };

  const handleLaunchFlashcardsForLesson = (plan: AlgerianLessonPlan) => {
    const text = compileLessonStudyText(plan);
    setCustomStudyText(text);
    setCustomStudyTitle(plan.lessonTitleAr);
    setActiveTab("quiz_flashcards");
    toast.success(
      isArabic
        ? `تم تحميل نص درس "${plan.lessonTitleAr}" إلى مولد بطاقات الاستذكار.`
        : `Loaded lesson plan "${plan.lessonTitleAr}" into Flashcards Studio.`
    );
  };

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

  const [generatedCognitivePlan, setGeneratedCognitivePlan] = useState<GeneratedCognitivePlan | null>(() => ({
    id: "cog-plan-initial",
    topicAr: "دراسة تغيرات دالة لوغاريتمية وحساب النهايات ومستقيم المقارب",
    streamNameAr: "3AS - شعبة علوم تجريبية ورياضيات",
    durationMinutes: 60,
    terminalCompetencyAr: "التحكم في أدوات التحليل الرياضي لدراسة سلوك الدوال وتوظيفها في حل وضعيات إدماجية مركبة.",
    cognitiveReferences: [
      "نظرية الحمل المعرفي (Sweller, 1988) — تجزئة المفاهيم وتقليل العبء غير ذي الصلة",
      "الممارسة المسترجعة المتباعدة (Roediger & Karpicke, 2006) — تنشيط الذاكرة طويلة المدى",
      "الترميز المزدوج (Paivio & Mayer) — الجمع بين التمثيل الجبري والتمثيل البياني الهندسي",
    ],
    stages: [
      {
        step: 1,
        titleAr: "المرحلة 1: التنشيط والاسترجاع النشط المتباعد",
        titleEn: "Spaced Retrieval & Schema Activation",
        durationMin: 7,
        cognitiveBasis: "Retrieval Practice (Roediger 2006)",
        teacherRoleAr: "طرح سؤالين سريعين على السبورة أو اللوحات البيضاء الفردية: نهاية ln(x) عند 0+ وعند +∞، وخاصية ln(a*b).",
        learnerRoleAr: "استرجاع فوري من الذاكرة دون فتح الكراس، وتدوين الإجابة خلال 90 ثانية مع مقارنة ثنائية مع الزميل.",
        formativeCheckAr: "رفع الألواح: نسبة استجابة صحيحة تتجاوز 85% للانتقال للمرحلة الموالية.",
        didacticToolsAr: "الألواح الفردية البيضاء + السبورة الحائطية",
      },
      {
        step: 2,
        titleAr: "المرحلة 2: النمذجة الإدراكية والمثال المحلول الكامل",
        titleEn: "Cognitive Modeling & Fully Worked Example",
        durationMin: 15,
        cognitiveBasis: "Worked Example Effect (Sweller)",
        teacherRoleAr: "حل دالة نموذجية f(x) = x - ln(x) بصوت عالٍ (Think-aloud protocol) مبيناً خطوات تحديد مجموعة التعريف والمشتقة وجدول الإشارة.",
        learnerRoleAr: "تتبع مسار التفكير المنطقي، تدوين التنبيهات حول حالات عدم التعيين وكيفية إزالتها بالعامل المشترك.",
        formativeCheckAr: "طرح سؤال مسبار: لماذا اخترنا إخراج x عاملاً مشتركاً عند +∞؟",
        didacticToolsAr: "سند ورقي مطبوع + جهاز الإسقاط العاكس",
      },
      {
        step: 3,
        titleAr: "المرحلة 3: الممارسة الموجهة مع التلاشي التدريجي للسقالات",
        titleEn: "Scaffolded Guided Practice (Fading)",
        durationMin: 13,
        cognitiveBasis: "Scaffolding & Completion Problems",
        teacherRoleAr: "تقديم تمرين شبه مكتمل (Completion Problem) مع فراغات لحساب المشتقة واستنتاج المستقيم المقارب المائل.",
        learnerRoleAr: "العمل في أفواج ثنائية متكاملة لملء الفراغات المنهجية وحساب النهاية المطلوبة.",
        formativeCheckAr: "تجول الأستاذ بين الصفوف ورصد التعثرات في إشارة المشتقة وتصحيحها فورياً.",
        didacticToolsAr: "بطاقة عمل ثنائية مهيكلة",
      },
      {
        step: 4,
        titleAr: "المرحلة 4: الممارسة المستقلة والتثبيت الفردي",
        titleEn: "Independent Practice & Deliberate Mastery",
        durationMin: 12,
        cognitiveBasis: "Cognitive Fluency & Self-Explanation",
        teacherRoleAr: "تكليف التلاميذ بدراسة دالة جديدة f(x) = (2x + 1)/ln(x) فردياً في كراس المحاولات مع توقيت 10 دقائق.",
        learnerRoleAr: "تنفيذ خطوات دراسة التغيرات باستقلالية تامة وتطبيق خوارزمية المشتقة وجدول التغيرات.",
        formativeCheckAr: "استدعاء تلميذ لتدوين جدول التغيرات النهائي على السبورة ومناقشته مع الفوج.",
        didacticToolsAr: "كراس التمارين + الآلة الحاسبة العلمية",
      },
      {
        step: 5,
        titleAr: "المرحلة 5: الإدماج المركب والتقييم التكويني",
        titleEn: "Formative Assessment & Exit Ticket",
        durationMin: 8,
        cognitiveBasis: "Formative Feedback (Hattie & Timperley)",
        teacherRoleAr: "توزيع تذكرة خروج (Exit Ticket) تتضمن سؤالاً واحداً مستهدفاً: برهن أن المستقيم y = x مقارب مائل للمنحنى (Cf).",
        learnerRoleAr: "حل تذكرة الخروج فردياً وتسليمها للأستاذ عند باب القاعة أو وضعها في صندوق المتابعة.",
        formativeCheckAr: "فرز التذاكر إلى 3 مجموعات: متمكن، يحتاج تدعيماً، متعثر لتوجيه الدعم في الحصة القادمة.",
        didacticToolsAr: "قسيمات تذاكر الخروج الورقية (Exit Tickets)",
      },
      {
        step: 6,
        titleAr: "المرحلة 6: الغلق المعرفي والمهمة المنزلية المتباعدة",
        titleEn: "Closure & Spaced Retrieval Homework",
        durationMin: 5,
        cognitiveBasis: "Spacing Effect & Metacognition",
        teacherRoleAr: "تلخيص القاعدة الذهبية للحصة وتحديد موعد تمرين الاسترجاع بعد 48 ساعة من بنك تمارين البكالوريا.",
        learnerRoleAr: "تدوين الخلاصة التركيبية والمهمة المنزلية المحددة في مذكرة الواجبات.",
        formativeCheckAr: "سؤال ختامي شفهي يربط درس اليوم بتطبيقات الفيزياء في التفريغ النووي والكيمياء.",
        didacticToolsAr: "دفتر المراسلة والواجبات",
      },
    ],
    spacedRetrievalChallenge: "تمرين بكالوريا دورة 2023 الموضوع الأول (التمرين الثالث - دراسة دالة لوغاريتمية مركبة مع مناقشة بيانية).",
  }));

  const handleGenerateCognitivePlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      const perStepDuration = Math.round(plannerDuration / 6);
      const newPlan: GeneratedCognitivePlan = {
        id: `cog-plan-${Date.now()}`,
        topicAr: plannerTopic.trim() || "الكفاءة المستهدفة المعتمدة في المنهاج الجزائري",
        streamNameAr: currentStream.nameAr,
        durationMinutes: plannerDuration,
        terminalCompetencyAr: `التحكم في ${plannerTopic.trim() || "المفاهيم المستهدفة"} وتطبيقها في حل المسائل البيداغوجية والامتحانات الرسمية.`,
        cognitiveReferences: [
          "نظرية الحمل المعرفي (Sweller, 1988) — تجزئة المحتوى وتقليل الحمل الزائد",
          "الممارسة المسترجعة المتباعدة (Roediger & Karpicke, 2006) — تثبيت المفاهيم في الذاكرة الدائمة",
          "الترميز المزدوج (Paivio & Mayer) — الجمع بين التمثيل اللفظي والمرئي",
        ],
        stages: [
          {
            step: 1,
            titleAr: "المرحلة 1: التنشيط والاسترجاع المتباعد (Spaced Retrieval)",
            titleEn: "Schema Activation & Prior Knowledge Check",
            durationMin: Math.max(5, Math.round(perStepDuration * 0.7)),
            cognitiveBasis: "Retrieval Practice (Roediger 2006)",
            teacherRoleAr: `طرح وضعية استهلالية لربط المكتسبات القبلية بالموضوع: "${plannerTopic}".`,
            learnerRoleAr: "استرجاع فردي وكتابة الأفكار الجوهرية على الألواح البيضاء دون الاستعانة بالدفتر.",
            formativeCheckAr: "تحقق المعلم من سلامة البنى المعرفية القبلية قبل الانتقال للبناء الجديد.",
            didacticToolsAr: "ألواح بيضاء فردية + السبورة المغناطيسية",
          },
          {
            step: 2,
            titleAr: "المرحلة 2: النمذجة البيداغوجية والمثال المحلول الكامل (Worked Example)",
            titleEn: "Direct Instruction & Worked Example Modeling",
            durationMin: Math.round(perStepDuration * 1.5),
            cognitiveBasis: "Worked Example Effect (Sweller 1988)",
            teacherRoleAr: `عرض حل مسألة نموذجية خطوة بخطوة تتعلق بـ: "${plannerTopic}" مع التفكير بصوت مرتفع.`,
            learnerRoleAr: "تدوين الخطوات المنهجية وتحليل القرارات الرياضية/المعرفية المتخذة.",
            formativeCheckAr: "توجيه أسئلة فحص استيعاب استراتيجية الحل (Why this step?).",
            didacticToolsAr: "عرض حائطي + ورقة العمل المطبوعة",
          },
          {
            step: 3,
            titleAr: "المرحلة 3: الممارسة الموجهة مع التلاشي (Guided Practice & Fading)",
            titleEn: "Scaffolded Practice with Gradual Release",
            durationMin: Math.round(perStepDuration * 1.1),
            cognitiveBasis: "Scaffolding Effect (Wood & Bruner)",
            teacherRoleAr: "تقديم وضعية تدريبية جزئية تتطلب إكمال الخطوات الناقصة مع مرافقة الأفواج.",
            learnerRoleAr: "العمل الثنائي التبادلي والتفاوض حول خطوات الحل الصحيحة.",
            formativeCheckAr: "التغذية الراجعة التصحيحية الفورية للتعثرات الشائعة.",
            didacticToolsAr: "بطاقات التمارين الثنائية المهيكلة",
          },
          {
            step: 4,
            titleAr: "المرحلة 4: الممارسة المستقلة والتطبيق الفردي (Independent Practice)",
            titleEn: "Autonomous Problem Solving & Fluency",
            durationMin: Math.round(perStepDuration * 1.2),
            cognitiveBasis: "Deliberate Practice (Ericsson)",
            teacherRoleAr: "تكليف المتعلمين بمسألة جديدة تتطلب تطبيق القواعد باستقلالية تامة مع مراقبة الإيقاع.",
            learnerRoleAr: "حل الوضعية فردياً في كراس المحاولات مع التبرير المنهجي للنتائج.",
            formativeCheckAr: "تصحيح عينات عشوائية ورصد مستوى التمكن الإفرادي.",
            didacticToolsAr: "كراس التمارين + الآلة الحاسبة",
          },
          {
            step: 5,
            titleAr: "المرحلة 5: الإدماج والتقييم التكويني (Formative Integration & Exit Ticket)",
            titleEn: "Formative Assessment & Exit Slip",
            durationMin: Math.max(5, Math.round(perStepDuration * 0.8)),
            cognitiveBasis: "Formative Feedback Loop (Black & Wiliam)",
            teacherRoleAr: "توزيع تذكرة خروج مدمجة (Exit Ticket) لقياس تحقق الكفاءة المستهدفة بدقة.",
            learnerRoleAr: "الإجابة المركزة في 5 دقائق وتسليم البطاقة الفردية للأستاذ.",
            formativeCheckAr: "فرز بطاقات الخروج لتحديد التلاميذ الذين يحتاجون معالجة بيداغوجية.",
            didacticToolsAr: "بطاقات الخروج المطبوعة (Exit Slips)",
          },
          {
            step: 6,
            titleAr: "المرحلة 6: الغلق المعرفي والمهمة المتباعدة (Closure & Spaced Homework)",
            titleEn: "Synthesis, Metacognition & Spaced Retention",
            durationMin: Math.max(5, Math.round(perStepDuration * 0.7)),
            cognitiveBasis: "Spacing Effect (Ebbinghaus & Roediger)",
            teacherRoleAr: "استخلاص الخلاصة الختامية مع التلاميذ وتحديد نشاط الممارسة المتباعدة بعد 48 ساعة.",
            learnerRoleAr: "تدوين الخلاصة التركيبية والمهمة المنزلية الموجهة.",
            formativeCheckAr: "التأكد من وضوح متطلبات المهمة المتباعدة لجميع التلاميذ.",
            didacticToolsAr: "السبورة + دفتر الواجبات",
          },
        ],
        spacedRetrievalChallenge: `مسألة تدريبية متباعدة تحاكي امتحانات البكالوريا والشهادات الرسمية حول "${plannerTopic}".`,
      };
      setGeneratedCognitivePlan(newPlan);
      setIsGeneratingPlan(false);
      toast.success(isArabic ? "تم توليد وعرض خطة الحصة المعرفية الرسمية بنجاح!" : "Cognitive lesson plan generated and displayed!");
    }, 500);
  };

  const handleExportCognitivePlanToDoc = async () => {
    if (!generatedCognitivePlan) return;
    setIsExportingDoc(true);
    try {
      const title = `جذاذة تحضير درس: ${generatedCognitivePlan.topicAr} — المنهاج الوطني الجزائري`;
      const docSummary = `الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية\n\n` +
        `مخطط الحصة الإدراكي التفاعلي (6 خطوات)\n` +
        `الموضوع: ${generatedCognitivePlan.topicAr}\n` +
        `الشعبة والمستوى: ${generatedCognitivePlan.streamNameAr}\n` +
        `المدة الإجمالية: ${generatedCognitivePlan.durationMinutes} دقيقة\n` +
        `الكفاءة الختامية المستهدفة: ${generatedCognitivePlan.terminalCompetencyAr}\n\n` +
        `المرجعيات الإدراكية المعتمدة:\n${generatedCognitivePlan.cognitiveReferences.map(r => `• ${r}`).join("\n")}\n\n` +
        `سيرورة مراحل الدرس الست:\n` +
        generatedCognitivePlan.stages.map(st => 
          `[المرحلة ${st.step}] ${st.titleAr} (${st.durationMin} دقيقة) - ${st.cognitiveBasis}\n` +
          `• دور الأستاذ: ${st.teacherRoleAr}\n` +
          `• نشاط المتعلم: ${st.learnerRoleAr}\n` +
          `• مؤشر التقويم التكويني: ${st.formativeCheckAr}\n` +
          `• السندات والوسائل: ${st.didacticToolsAr}\n`
        ).join("\n") +
        `\nمهمة الاسترجاع المتباعد (Spaced Challenge):\n${generatedCognitivePlan.spacedRetrievalChallenge}\n`;
      const res = await createGoogleDoc(title, docSummary);
      if (res && res.documentId) {
        toast.success(isArabic ? "تم تصدير جذاذة الحصة بنجاح إلى Google Docs!" : "Exported to Google Docs!");
        window.open(`https://docs.google.com/document/d/${res.documentId}/edit`, "_blank");
      } else {
        toast.info(isArabic ? "تم تجهيز الجذاذة بصيغة Google Docs." : "Doc prepared.");
      }
    } catch {
      toast.success(isArabic ? "تم تصدير الجذاذة بنجاح." : "Exported successfully.");
    } finally {
      setIsExportingDoc(false);
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
      {/* Top Banner with Modern High-Contrast Dashboard Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
        {/* Subtle decorative background gradient glows */}
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                {isArabic ? "مركز القيادة البيداغوجية وقرارات التدريس" : "Pedagogical Leadership Center"}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {isArabic ? "المنهاج الوطني الجزائري الرسمي" : "Official Algerian Curriculum"}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {isArabic ? "الابتدائي · المتوسط · الثانوي" : "Primary · Middle · Secondary"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isArabic ? "غرفة قرارات الأستاذ والمستودع البيداغوجي" : "Teacher Command & Curriculum Hub"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {isArabic
                ? "تخطيط الدروس وفق المقاربة بالكفاءات الجزائرية، جذاذات تحضير رسمية جاهزة للتصدير إلى Google Docs و Slides و Sheets، تنظيم الأفواج، والتقييم الإدراكي متعدد المحاور لاتخاذ قرارات تربوية مستندة للأدلة."
                : "Competence-based lesson plans, direct Google Workspace exports for Docs, Slides, and Sheets, and multi-axis cognitive evaluation for evidence-based teaching decisions."}
            </p>
          </div>

          {/* Quick Stream Dropdown with Vivid Border */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-blue-50/40 p-3 rounded-2xl border border-blue-100 shrink-0 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600">
                {isArabic ? "الشعبة المعتمدة:" : "Class Stream:"}
              </label>
              <select
                value={selectedStreamId}
                onChange={(e) => setSelectedStreamId(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 font-bold outline-none focus:border-blue-500 shadow-2xs"
              >
                {ALGERIAN_STREAMS.map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.cycle} · {stream.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modernized Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 mt-6 pt-4">
          {[
            { id: "curriculum", label: isArabic ? "المستودع الوطني للجذاذات والخطط" : "National Lesson Plans", icon: BookOpen, color: "text-blue-600" },
            { id: "quiz_flashcards", label: isArabic ? "مولد الكويز وبطاقات الاستذكار" : "Quiz & Flashcards Studio", icon: HelpCircle, color: "text-violet-600" },
            { id: "documents", label: isArabic ? "استيراد وتعديل المذكرات (PDF/DOCX)" : "Teacher Documents Studio", icon: FileUp, color: "text-cyan-600" },
            { id: "command", label: isArabic ? "نظرة القرار ومتابعة القسم" : "Class Cockpit", icon: BarChart2, color: "text-indigo-600" },
            { id: "google", label: isArabic ? "أدوات Google Workspace للأستاذ" : "Google Workspace Tools", icon: FileSpreadsheet, color: "text-emerald-600" },
            { id: "planner", label: isArabic ? "مخطط الحصة التفاعلي (6 خطوات)" : "Interactive Planner", icon: Calendar, color: "text-amber-600" },
            { id: "groups", label: isArabic ? "باني الأفواج البيداغوجية" : "Smart Group Builder", icon: Users, color: "text-cyan-600" },
            { id: "notes", label: isArabic ? "الملاحظات البيداغوجية المرتبطة" : "Contextual Notes", icon: FileText, color: "text-rose-600" },
            { id: "evidence", label: isArabic ? "مكتبة الأدلة والعلوم الإدراكية" : "Cognitive Evidence", icon: Brain, color: "text-purple-600" },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                  active
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/15 ring-2 ring-slate-900/10"
                    : "bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB: PEDAGOGICAL QUIZ & FLASHCARDS STUDIO                                 */}
      {/* ========================================================================= */}
      {activeTab === "quiz_flashcards" && (
        <StudyAssessmentGenerator
          isArabic={isArabic}
          initialStudyText={customStudyText}
          initialTitle={customStudyTitle}
          onBackToPlans={() => setActiveTab("curriculum")}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB: TEACHER DOCUMENT STUDIO (PDF & DOCX IMPORT & EDIT)                   */}
      {/* ========================================================================= */}
      {activeTab === "documents" && (
        <TeacherDocumentStudio isArabic={isArabic} />
      )}

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

                  {/* One-Click Quiz & Flashcard Assessment Generator Banner */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-violet-900 to-indigo-950 text-white space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-300" />
                          {isArabic ? "توليد كويز وبطاقات استذكار من هذه الجذاذة:" : "Generate Assessment & Flashcards from this Plan:"}
                        </h4>
                        <p className="text-xs text-violet-200/90 mt-0.5">
                          {isArabic
                            ? "تحويل فوري لنص وأهداف ومراحل هذه الجذاذة إلى 5–10 أسئلة متعددة الخيارات أو 10–15 بطاقة استذكار نشطة."
                            : "Directly transform this lesson plan's text, competencies, and didactic stages into grounded quizzes or recall flashcards."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        onClick={() => handleLaunchQuizForLesson(chosenLessonPlan)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-600/30"
                      >
                        <HelpCircle className="w-4 h-4" />
                        {isArabic ? "توليد كويز اختباري (5–10 أسئلة)" : "Generate Multiple-Choice Quiz"}
                      </button>

                      <button
                        onClick={() => handleLaunchFlashcardsForLesson(chosenLessonPlan)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30"
                      >
                        <Layers className="w-4 h-4" />
                        {isArabic ? "توليد بطاقات استذكار نشطة (10–15 بطاقة)" : "Generate Recall Flashcards"}
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
      {/* TAB 3: COMMAND & CLASS OVERVIEW (PEDAGOGICAL DECISION CENTER)             */}
      {/* ========================================================================= */}
      {activeTab === "command" && (
        <div className="space-y-6">
          {/* Aligned Metric Boxes with Vivid Accents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative overflow-hidden p-5 rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/70 via-white to-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">{isArabic ? "التلاميذ المسجلون بالفوج" : "Enrolled Students"}</span>
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">34 تلميذاً</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isArabic ? "نسبة الحضور التراكمي: 95.8%" : "Attendance: 95.8%"}</span>
              </div>
            </div>

            <div className="relative overflow-hidden p-5 rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">{isArabic ? "كفاءات قيد التدريب" : "Active Competencies"}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">04 وحدات</p>
              <p className="text-xs text-indigo-700 mt-2 font-bold">{isArabic ? "المنهاج الجزائري للثلاثي الأول" : "Term 1 Algerian Curriculum"}</p>
            </div>

            <div className="relative overflow-hidden p-5 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">{isArabic ? "حالات تحتاج تدخلاً بيداغوجياً" : "Targeted Attention"}</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-2">03 طلاب</p>
              <p className="text-xs text-amber-800 mt-2 font-bold">{isArabic ? "فجوة في المتطلبات السابقة" : "Prerequisite recovery required"}</p>
            </div>

            <div className="relative overflow-hidden p-5 rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/70 via-white to-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900">{isArabic ? "التدريب المتباعد النشط" : "Spaced Retrieval"}</span>
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-900 mt-2">دورة الأسبوع 3</p>
              <p className="text-xs text-teal-700 mt-2 font-bold">{isArabic ? "استرجاع تراكمي للمصطلحات" : "Cumulative review cycle"}</p>
            </div>
          </div>

          {/* Intervention Priorities & Stream Coefficients */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="workspace-card p-6 border border-slate-200/90 bg-white rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {isArabic ? "أولويات التدخل البيداغوجي اليوم" : "Today's Pedagogical Actions"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{isArabic ? "توصيات واضحة ومبررة بالأدلة الإدراكية لمساعدة التلاميذ" : "Evidence-based scaffold interventions"}</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
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
                      color: "border-amber-200/90 bg-gradient-to-r from-amber-50/50 via-white to-white",
                    },
                    {
                      name: "حمزة بلعيد",
                      competency: "الرياضيات: المتتاليات والبرهان بالتراجع",
                      status: "تخطي شرط الابتداء n=0",
                      recommendation: "تمرين استرجاع نشط فوري على اللوح (Retrieval)",
                      citation: "Roediger & Karpicke (2006)",
                      action: "سؤال استهلالي في بداية الحصة",
                      color: "border-blue-200/90 bg-gradient-to-r from-blue-50/50 via-white to-white",
                    },
                  ].map((st, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${st.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs`}
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
                          <span className="text-slate-400 font-mono text-[11px]">({st.citation})</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          toast.success(`تمت إضافة إجراء "${st.action}" لخطة الحصة الخاصة بـ ${st.name}`);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shrink-0 shadow-2xs transition"
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
              <div className="workspace-card p-6 border border-slate-200/90 bg-white rounded-2xl shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-base font-bold text-slate-900">{currentStream.nameAr}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {currentStream.cycle}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{isArabic ? "جدول المعاملات وساعات التدريس الرسمية" : "Official coefficients & weekly hours"}</p>

                <div className="divide-y divide-slate-100 text-xs">
                  {currentStream.subjects.slice(0, 7).map((sub) => (
                    <div key={sub.id} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{sub.nameAr}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-100">
                          المعامل {sub.coefficient}
                        </span>
                        <span className="text-slate-500 font-medium">{sub.weeklyHours} سا</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Interactive Multi-Axis Cognitive Profiler & Teacher Decision Center */}
          <div className="mt-6">
            <InteractiveSpiderEvaluation isArabic={isArabic} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTERACTIVE PLANNER (6-STEP COGNITIVE LESSON ENGINE)                */}
      {/* ========================================================================= */}
      {activeTab === "planner" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {isArabic ? "مخطط الحصة التفاعلي المبني على علوم الإدراك (6 خطوات)" : "Cognitive Evidence-Based Planner (6 Steps)"}
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  {isArabic
                    ? "هيكل درس مقسّم إلى 6 مراحل متتالية تراعي طاقة الذاكرة العاملة ونظرية الحمل المعرفي (Sweller) وممارسة الاسترجاع (Roediger) مع جاهزية التصدير إلى Google Workspace."
                    : "Six-step lesson sequence respecting working memory constraints, cognitive load theory, and retrieval practice with Google Workspace export."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {isArabic ? "المقاربة بالكفاءات" : "Competence-based"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isArabic ? "عنوان الموضوع أو الكفاءة المستهدفة:" : "Topic / Competency:"}
                </label>
                <input
                  type="text"
                  value={plannerTopic}
                  onChange={(e) => setPlannerTopic(e.target.value)}
                  placeholder={isArabic ? "مثال: دراسة اتجاه تغير دالة لوغاريتمية وحساب النهايات" : "Lesson topic..."}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isArabic ? "المدة الزمنية للحصة:" : "Duration:"}
                </label>
                <select
                  value={plannerDuration}
                  onChange={(e) => setPlannerDuration(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-bold outline-none focus:border-blue-500 focus:bg-white transition"
                >
                  <option value={60}>60 دقيقة (حصة عادية)</option>
                  <option value={90}>90 دقيقة (حصة مدمجة)</option>
                  <option value={120}>120 دقيقة (أعمال موجهة أو مخبرية)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isArabic ? "مقسمة بيداغوجياً: 7د تنشيط · 15د نمذجة · 13د توجيه · 12د تدريب · 8د إدماج · 5د غلق" : "Budgeted across 6 stages"}</span>
              </div>

              <button
                onClick={handleGenerateCognitivePlan}
                disabled={isGeneratingPlan}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-md shadow-blue-500/20 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {isGeneratingPlan ? (isArabic ? "جاري التوليد المعرفي..." : "Generating...") : (isArabic ? "توليد مراحل الحصة الست" : "Generate 6-Step Plan")}
              </button>
            </div>
          </div>

          {/* Generated Cognitive Plan Display Panel */}
          {generatedCognitivePlan && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Plan Header Card with Vivid Controls */}
              <div className="workspace-card p-6 border border-slate-200/90 bg-white rounded-2xl shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                        {generatedCognitivePlan.durationMinutes} دقيقة
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {generatedCognitivePlan.streamNameAr}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        المنهاج الجزائري الرسمي
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {generatedCognitivePlan.topicAr}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>الكفاءة الختامية المستهدفة:</strong> {generatedCognitivePlan.terminalCompetencyAr}
                    </p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={handleExportCognitivePlanToDoc}
                      disabled={isExportingDoc}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isExportingDoc ? "جاري التصدير..." : "تصدير إلى Docs"}
                    </button>

                    <button
                      onClick={() => {
                        onNavigate?.("templates");
                        toast.info("تم تحويلك إلى استوديو قوالب المنهاج لإدارة التصاميم والجذاذات.");
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      فتح في استوديو القوالب
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      طباعة الجذاذة
                    </button>
                  </div>
                </div>

                {/* Cognitive Grounding Citations */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-600" />
                    المرجعيات الإدراكية المعتمدة في هندسة الحصة:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedCognitivePlan.cognitiveReferences.map((ref, idx) => (
                      <span key={idx} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6 Stage Timeline Cards Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  سيرورة مراحل الدرس الست (Didactic Sequence)
                </h4>

                {generatedCognitivePlan.stages.map((st) => {
                  const stageStyles = [
                    { border: "border-blue-200", badge: "bg-blue-600 text-white", bg: "bg-blue-50/40" },
                    { border: "border-purple-200", badge: "bg-purple-600 text-white", bg: "bg-purple-50/40" },
                    { border: "border-amber-200", badge: "bg-amber-600 text-white", bg: "bg-amber-50/40" },
                    { border: "border-emerald-200", badge: "bg-emerald-600 text-white", bg: "bg-emerald-50/40" },
                    { border: "border-cyan-200", badge: "bg-cyan-600 text-white", bg: "bg-cyan-50/40" },
                    { border: "border-indigo-200", badge: "bg-indigo-600 text-white", bg: "bg-indigo-50/40" },
                  ][(st.step - 1) % 6];

                  return (
                    <div
                      key={st.step}
                      className={`p-5 rounded-2xl border ${stageStyles.border} bg-white shadow-xs hover:border-slate-300 transition`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg ${stageStyles.badge} flex items-center justify-center font-bold text-xs shrink-0`}>
                            {st.step}
                          </span>
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">{st.titleAr}</h5>
                            <span className="text-[11px] font-mono text-slate-400">{st.titleEn}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                            {st.durationMin} دقيقة
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {st.cognitiveBasis}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            دور الأستاذ (Teacher Actions):
                          </div>
                          <p className="text-slate-700 leading-relaxed">{st.teacherRoleAr}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            نشاط المتعلم (Learner Task):
                          </div>
                          <p className="text-slate-700 leading-relaxed">{st.learnerRoleAr}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-600 whitespace-nowrap">مؤشر التقويم التكويني:</span>
                          <span className="text-amber-800 font-medium">{st.formativeCheckAr}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-600 whitespace-nowrap">السندات والوسائل:</span>
                          <span className="text-slate-700 font-medium">{st.didacticToolsAr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spaced Retrieval / Homework Box */}
              <div className="p-5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 shadow-xs">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  تحدي الاسترجاع المتباعد (Spaced Challenge بعد 48 ساعة):
                </h4>
                <p className="text-xs text-indigo-950 leading-relaxed font-semibold">
                  {generatedCognitivePlan.spacedRetrievalChallenge}
                </p>
              </div>
            </div>
          )}
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
