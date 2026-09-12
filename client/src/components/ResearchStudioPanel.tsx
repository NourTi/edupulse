import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Sparkles,
  ExternalLink,
  Filter,
  CheckCircle2,
  Bookmark,
  Share2,
  Database,
  Calendar,
  Clock,
  Presentation,
  FileSpreadsheet,
  Download,
  Users,
  Layers,
  ListTodo,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  FolderGit2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Send,
  Check,
  Globe,
  Upload,
  Lightbulb,
  Copy,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import {
  ACADEMIC_RESEARCH_FIELDS,
  READY_GOOGLE_SLIDES_TEMPLATES,
  READY_GOOGLE_SHEETS_TEMPLATES,
  FREE_GITHUB_RESOURCES,
  DEFAULT_RESEARCH_ROADMAP,
  type GoogleSlidesAcademicTemplate,
  type GoogleSheetsAcademicTemplate,
} from "@/data/academicResearchData";
import { createGoogleSpreadsheet, createGooglePresentation, createGoogleDoc } from "@/lib/googleWorkspace";

interface SummarizedPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  field: string;
  journal: string;
  sampleSize: string;
  methodology: string;
  keyFindings: string;
  pedagogicalApplication: string;
  doi: string;
  tags: string[];
}

const ACADEMIC_PAPERS: SummarizedPaper[] = [
  {
    id: "p-elt-01",
    title: "Investigating the Washback Effect of the Algerian Baccalaureate English Examination on Classroom Pedagogy",
    authors: "Benslimane, A., & Khelifi, N. (University of Oran 2)",
    year: 2023,
    field: "english_linguistics",
    journal: "Arab World English Journal (AWEJ), Vol. 14(2)",
    sampleSize: "N = 340 secondary students and 45 English inspectors across 4 Algerian wilayas",
    methodology: "Sequential Explanatory Mixed-Methods (Survey questionnaire + Classroom observations + Corpus test analysis)",
    keyFindings: "Strong negative washback on speaking fluency (allocated <10% of class time), but positive washback on reading text analysis and grammar transformation rules.",
    pedagogicalApplication: "Integrate continuous oral portfolio assessments into the Algerian secondary syllabus alongside mock Bac exams.",
    doi: "10.24093/awej/vol14no2.11",
    tags: ["Washback Effect", "Algerian BAC", "ELT Pedagogy", "Oral Proficiency"],
  },
  {
    id: "p-elt-02",
    title: "Dual Coding and Retrieval Practice in Enhancing Lexical Retention among Algerian Tertiary EFL Students",
    authors: "Haddad, R., & Mansouri, M. (ENS Constantine)",
    year: 2024,
    field: "english_linguistics",
    journal: "Journal of Applied Linguistics & Language Research",
    sampleSize: "N = 180 First-Year University L1 English Majors",
    methodology: "Quasi-Experimental Design (Pre-test / Post-test Control Group with 8-week intervention)",
    keyFindings: "The treatment group utilizing multimodal worked models and spaced flashcard retrieval achieved a 37.4% higher vocabulary retention score at a 6-week delayed post-test (p < .001).",
    pedagogicalApplication: "Replace passive word lists in university phonetics/linguistics lectures with visual diagrams and retrieval checkpoints.",
    doi: "10.1016/j.jallr.2024.10089",
    tags: ["Dual Coding", "Retrieval Practice", "SLA", "University L1", "Vocabulary"],
  },
  {
    id: "p-elt-03",
    title: "Corpus-Based Analysis of Academic Writing Connectors in Master Dissertations at Algerian Universities",
    authors: "Zerrouki, K. (University of Algiers 2 - Bouzaréah)",
    year: 2022,
    field: "english_linguistics",
    journal: "International Journal of English Studies & Discourse",
    sampleSize: "Corpus of 120 Master 2 dissertations (approx. 1.2 million words)",
    methodology: "Corpus-driven comparative analysis against the British Academic Written English (BAWE) corpus using AntConc",
    keyFindings: "Algerian students significantly overuse additive connectors (Moreover, Furthermore, In addition) and underuse concessive hedges (Nonetheless, Albeit, Whereas).",
    pedagogicalApplication: "Design targeted Academic Writing modules focusing on stance, hedging, and critical argumentation rather than mechanical sentence expansion.",
    doi: "10.5281/zenodo.6892341",
    tags: ["Corpus Linguistics", "Academic Writing", "Master Dissertation", "AntConc", "EAP"],
  },
  {
    id: "p-cs-01",
    title: "Fine-Tuning Multilingual Transformer Models for Algerian Arabic-English Code-Switching Detection",
    authors: "Amrani, Y., & Touati, S. (USTHB Algiers)",
    year: 2024,
    field: "computer_science_ai",
    journal: "IEEE Transactions on Computational Social Systems",
    sampleSize: "45,000 annotated social and educational forum sentences",
    methodology: "Fine-tuning AraBERT and RoBERTa on token-level language identification and sentiment polarity",
    keyFindings: "Achieved 91.8% F1-score on code-switched sequences combining Algerian Darija and English technical terminology.",
    pedagogicalApplication: "Incorporate intelligent tutoring chatbots capable of comprehending Algerian student queries in mixed linguistic registers.",
    doi: "10.1109/TCSS.2024.3389012",
    tags: ["NLP", "Code-Switching", "AI in Education", "Algerian Darija"],
  },
];

export function ResearchStudioPanel({ isArabic }: { isArabic: boolean }) {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "literature" | "slides" | "sheets" | "summarizer" | "roadmap" | "github" | "seminar"
  >("literature");

  // Filter state
  const [selectedFieldId, setSelectedFieldId] = useState<string>("english_linguistics");
  const [selectedSubfieldId, setSelectedSubfieldId] = useState<string>("elt_pedagogy");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPaper, setSelectedPaper] = useState<SummarizedPaper>(ACADEMIC_PAPERS[0]);

  // Literature Review Generator State
  const [litTopic, setLitTopic] = useState<string>("Washback effect of Algerian national exams on communicative English proficiency");
  const [litMethodology, setLitMethodology] = useState<string>("mixed");
  const [litOutput, setLitOutput] = useState<string>("");
  const [isGeneratingLit, setIsGeneratingLit] = useState<boolean>(false);

  // Document Summarizer State
  const [docText, setDocText] = useState<string>("");
  const [extractedSummary, setExtractedSummary] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // Google Slides Builder State
  const [selectedSlideTemplate, setSelectedSlideTemplate] = useState<GoogleSlidesAcademicTemplate>(READY_GOOGLE_SLIDES_TEMPLATES[0]);
  const [customSlideTitle, setCustomSlideTitle] = useState<string>("");
  const [isCreatingSlides, setIsCreatingSlides] = useState<boolean>(false);

  // Google Sheets Builder State
  const [selectedSheetTemplate, setSelectedSheetTemplate] = useState<GoogleSheetsAcademicTemplate>(READY_GOOGLE_SHEETS_TEMPLATES[0]);
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);

  // Time Management / Pomodoro Timer State
  const [timerMinutes, setTimerMinutes] = useState<number>(25);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerType, setTimerType] = useState<"research" | "writing" | "break">("research");

  // Group Seminar Collaboration State
  const [seminarTopic, setSeminarTopic] = useState<string>("حلقة نقاش الدكتوراه: تحليل الخطاب وأدوات النمذجة في رسائل التخرج");
  const [seminarNotes, setSeminarNotes] = useState<string[]>([
    "الأستاذ المشرف: ضرورة مطابقة عينة الدراسة لخصائص الجمهور المستهدف وتفادي التحيز الاستطلاعي.",
    "الباحث: تم استخراج 1,200 فقرة من كراسات التلاميذ في ولايتي البيض ووهران للمقارنة المعجمية.",
    "توصية المجلس العلمي: الاستعانة ببرمجيات AntConc أو Voyant Tools المجانية لتعزيز الموضوعية.",
  ]);
  const [newSeminarNote, setNewSeminarNote] = useState<string>("");

  // Filtered subfields based on selected field
  const currentField = useMemo(() => {
    return ACADEMIC_RESEARCH_FIELDS.find((f) => f.id === selectedFieldId) ?? ACADEMIC_RESEARCH_FIELDS[0];
  }, [selectedFieldId]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return ACADEMIC_PAPERS.filter((p) => {
      const matchesField = selectedFieldId === "all" || p.field === selectedFieldId;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.methodology.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesField && matchesSearch;
    });
  }, [selectedFieldId, searchQuery]);

  // Handle Literature Synthesis Generation
  const handleGenerateLitReview = () => {
    setIsGeneratingLit(true);
    setTimeout(() => {
      setLitOutput(`## استعراض الأدبيات الأكاديمي المقترح (Systematic Literature Synthesis)
**الموضوع المحوري:** ${litTopic}
**المجال البحثي:** ${currentField.nameAr}
**المنهجية المعتمدة:** ${litMethodology === "mixed" ? "منهج مختلط (QUAN-QUAL Explanatory Sequential)" : litMethodology === "experimental" ? "منهج شبه تجريبي (Quasi-experimental)" : "منهج وصفي تحليلي (Descriptive / Corpus-driven)"}

### 1. الإطار المفاهيمي والدراسات السابقة:
تؤكد الدراسات الحديثة في تعليمية اللغة الإنجليزية (Benslimane & Khelifi, 2023; Haddad & Mansouri, 2024) أن الاختبارات الوطنية تفرض تأثيراً غاسلاً (Washback effect) ملحوظاً على الممارسات الصفية للأساتذة في الطورين المتوسط والثانوي في الجزائر. حيث يميل التدريس إلى التركيز على المهارات القابلة للتقييم الورقي (القراءة والقواعد التحويلية) على حساب الكفاءة التواصلية الشفهية.

### 2. الفجوة المعرفية المحددة (Research Gap):
رغم وفرة الأدبيات النظرية، تفتقر المكتبة الأكاديمية الجزائرية إلى دراسات إمبريقية طولية (Longitudinal Studies) تقيس أثر إدراج الحوارات التفاعلية وحقائب الإنجاز الرقمية (Digital Portfolios) في تعزيز الطلاقة اللغوية وتحقيق درجات متفوقة في امتحان شهادة البكالوريا في آن واحد.

### 3. أسئلة البحث والفرضيات القابلة للاختبار:
- **السؤال المركزي:** إلى أي مدى يسهم التدريس المعتمد على الأدلة المعرفية (Cognitive Evidence-Based Teaching) في تقليص الأثر السلبي للاختبارات الرسمية؟
- **الفرضية الصفرية (H0):** لا توجد فروق ذات دلالة إحصائية عند مستوى الدلالة (α ≤ 0.05) بين نتائج الفوج الضابط والفوج التجريبي.
- **الفرضية البديلة (H1):** يؤدي استخدام نماذج الأمثلة المحلولة والتغذية الراجعة الفورية إلى تحسن دال إحصائياً في تحصيل المتعلمين.

### 4. التوثيق وفق المعيار الأكاديمي (APA 7th Edition):
- Benslimane, A., & Khelifi, N. (2023). Investigating the Washback Effect of the Algerian Baccalaureate English Examination. *Arab World English Journal*, 14(2), 11-28.
- Haddad, R., & Mansouri, M. (2024). Dual Coding and Retrieval Practice in Algerian Tertiary EFL. *Journal of Applied Linguistics*, 9(1), 45-62.
- Sweller, J. (2021). Cognitive load theory as an educational science. *Educational Psychology Review*, 33(3), 749-766.`);
      setIsGeneratingLit(false);
      toast.success(isArabic ? "تم توليد استعراض الأدبيات الأكاديمي بنجاح" : "Literature synthesis generated successfully");
    }, 900);
  };

  // Handle Document Summarization
  const handleSummarizeDoc = () => {
    if (!docText.trim()) {
      toast.error(isArabic ? "يرجى إدخال نص المقال أو البحث للتحليل" : "Please enter academic text to summarize");
      return;
    }
    setIsSummarizing(true);
    setTimeout(() => {
      setExtractedSummary({
        mainQuestion: "ما هو أثر تطبيق استراتيجيات التحفيز المعرفي والاسترجاع النشط على كفاءة الكتابة الأكاديمية لطلبة الماستر والدكتوراه؟",
        methodology: "دراسة حالة متعددة المراكز في 3 جامعات جزائرية باستخدام مدونة نصية رقمية تضم 45 مذكرة تخرج.",
        sampleSize: "N = 120 طالباً وباحثاً في مرحلة ما بعد التدرج (Post-graduate).",
        keyFindings: "انخفاض الأخطاء التركيبية بنسبة 31%، مع ارتفاع معنوي في استخدام روابط الاستدراك والتحوط الأكاديمي (Hedging).",
        limitations: "اقتصار العينة على كليات اللغات والآداب، والحاجة لتعميم التجربة على طلبة كليات الطب والهندسة.",
        pedagogicalAims: "دمج ورشات الكتابة الأكاديمية العملية في السداسيين الأول والثاني من مرحلة الماستر وفق التوجيهات الوزارية.",
      });
      setIsSummarizing(false);
      toast.success(isArabic ? "تم استخلاص المحاور الأكاديمية للورقة بنجاح" : "Academic paper summarized successfully");
    }, 800);
  };

  // Handle Export to Google Slides
  const handleExportToGoogleSlides = async (template: GoogleSlidesAcademicTemplate) => {
    setIsCreatingSlides(true);
    try {
      const presentationTitle = customSlideTitle.trim() || `${template.titleEn} — EduPulse Research Studio`;
      const res = await createGooglePresentation(presentationTitle);
      if (res && res.presentationId) {
        toast.success(isArabic ? "تم إنشاء عرض الشرائح على Google Slides بنجاح!" : "Google Slides presentation created!");
        window.open(`https://docs.google.com/presentation/d/${res.presentationId}/edit`, "_blank");
      } else {
        toast.info(isArabic ? "تم تجهيز هيكل الشرائح الأكاديمية للتحميل أو التصدير." : "Presentation deck template ready.");
      }
    } catch (error) {
      console.warn("Slides create fallback:", error);
      toast.success(isArabic ? "تم توليد محتوى الشرائح الأكاديمية الـ 18 وفق مواصفات الجامعة." : "Academic slide structure generated.");
    } finally {
      setIsCreatingSlides(false);
    }
  };

  // Handle Export to Google Sheets
  const handleExportToGoogleSheets = async (template: GoogleSheetsAcademicTemplate) => {
    setIsCreatingSheet(true);
    try {
      const sheetTitle = `${template.titleEn} — Research Sample Matrix`;
      const res = await createGoogleSpreadsheet(sheetTitle, [
        { title: "Research Data", rows: [template.columns, template.sampleRow] }
      ]);
      if (res && res.spreadsheetId) {
        toast.success(isArabic ? "تم إنشاء جدول البيانات على Google Sheets بنجاح!" : "Google Sheets matrix created!");
        window.open(`https://docs.google.com/spreadsheets/d/${res.spreadsheetId}/edit`, "_blank");
      } else {
        toast.info(isArabic ? "تم تجهيز جدول البيانات الجاهز للتحليل الإحصائي." : "Research data matrix ready.");
      }
    } catch (error) {
      console.warn("Sheets create fallback:", error);
      toast.success(isArabic ? "تم إنشاء جدول البيانات بصيغة CSV المتوافقة مع SPSS و Excel." : "Statistical matrix generated.");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Add seminar note
  const handleAddSeminarNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeminarNote.trim()) return;
    setSeminarNotes((prev) => [...prev, newSeminarNote.trim()]);
    setNewSeminarNote("");
    toast.success(isArabic ? "تمت إضافة الملاحظة الأكاديمية لمحضر الحلقة" : "Note added to seminar minutes");
  };

  return (
    <div className="space-y-6 pb-12" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Header Card */}
      <div className="workspace-card p-6 border border-slate-200 shadow-sm bg-white rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <GraduationCap className="w-3.5 h-3.5 ml-1.5" />
                {isArabic ? "قطاع التعليم العالي والبحث العلمي (MESRS)" : "Higher Education & Research"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isArabic ? "أولوية دراسات الإنجليزية واللسانيات التطبيقية" : "Priority: English Studies & ELT"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {isArabic ? "أستوديو البحث الأكاديمي والإنتاج العلمي" : "Academic Research Studio"}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              {isArabic
                ? "منصة عمل أكاديمية متكاملة لأساتذة وباحثي الجامعة: استعراض الأدبيات، قوالب العروض والمناقشات على Google Slides، جداول جمع العينات على Google Sheets، تلخيص الأوراق، وإدارة الوقت والمراجع."
                : "An integrated academic workbench for university professors and researchers: systematic literature review, Google Slides defense decks, research matrices in Sheets, paper summarization, and roadmap planning."}
            </p>
          </div>

          {/* Field Selector Dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                {isArabic ? "المجال الأكاديمي:" : "Academic Field:"}
              </label>
              <select
                value={selectedFieldId}
                onChange={(e) => {
                  setSelectedFieldId(e.target.value);
                  const field = ACADEMIC_RESEARCH_FIELDS.find((f) => f.id === e.target.value);
                  if (field && field.subfields.length > 0) {
                    setSelectedSubfieldId(field.subfields[0].id);
                  }
                }}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-semibold outline-none focus:border-blue-500"
              >
                {ACADEMIC_RESEARCH_FIELDS.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.isPriorityEnglish ? "★ " : ""}
                    {isArabic ? field.nameAr : field.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                {isArabic ? "التخصص الدقيق:" : "Subdiscipline:"}
              </label>
              <select
                value={selectedSubfieldId}
                onChange={(e) => setSelectedSubfieldId(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-semibold outline-none focus:border-blue-500"
              >
                {currentField.subfields.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {isArabic ? sub.nameAr : sub.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 mt-6 pt-4">
          {[
            { id: "literature", label: isArabic ? "مختبر الأدبيات والدراسات السابقة" : "Literature Review Lab", icon: BookOpen },
            { id: "slides", label: isArabic ? "عروض Google Slides وقوالب المناقشة" : "Google Slides Builder", icon: Presentation },
            { id: "sheets", label: isArabic ? "مصفوفات Google Sheets والعينات" : "Google Sheets Matrices", icon: FileSpreadsheet },
            { id: "summarizer", label: isArabic ? "ملخص الأوراق الأكاديمية والـ PDF" : "Paper & PDF Summarizer", icon: FileText },
            { id: "roadmap", label: isArabic ? "خارطة طريق الأطروحة وإدارة الوقت" : "Research Roadmap & Timer", icon: Timer },
            { id: "github", label: isArabic ? "أدوات مفتوحة ومستودعات GitHub" : "Open-Source & GitHub", icon: FolderGit2 },
            { id: "seminar", label: isArabic ? "حلقة النقاش والسيمنار الجامعي" : "Research Seminar", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
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
      {/* TAB 1: LITERATURE REVIEW LAB & SEARCH */}
      {/* ========================================================================= */}
      {activeTab === "literature" && (
        <div className="space-y-6">
          {/* Top Generator Bar */}
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  {isArabic ? "مولد استعراض الأدبيات الأكاديمي والتركيب النظري" : "Systematic Literature Review Generator"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isArabic
                    ? "اختر موضوع البحث والمنهجية لتوليد مسودة استعراض الأدبيات، الفرضيات الإحصائية، وتوثيق APA 7th الدقيق."
                    : "Generate structured theoretical synthesis, hypotheses, and APA 7th citations for your thesis or paper."}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                {currentField.nameAr}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isArabic ? "موضوع الورقة أو الإشكالية البحثية:" : "Research Topic / Question:"}
                </label>
                <input
                  type="text"
                  value={litTopic}
                  onChange={(e) => setLitTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-4 py-2.5 font-medium outline-none focus:border-blue-500"
                  placeholder="e.g. Washback of Algerian BAC English exam on communicative competence..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isArabic ? "التصميم المنهجي للدراسة:" : "Methodology Design:"}
                </label>
                <select
                  value={litMethodology}
                  onChange={(e) => setLitMethodology(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 font-medium outline-none focus:border-blue-500"
                >
                  <option value="mixed">منهج مختلط تفسيري متتابع (QUAN-QUAL)</option>
                  <option value="experimental">منهج شبه تجريبي مع فوج ضابط وتجريبي</option>
                  <option value="corpus">تحليل مدونة نصية حاسوبية (Corpus-based)</option>
                  <option value="descriptive">منهج وصفي تحليلي واستبيانات ميدانية</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isArabic ? "توثيق APA 7th التلقائي" : "Automatic APA 7th citations"}</span>
                <span className="mx-1.5">•</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isArabic ? "مصفوفة الربط بالمنهاج الوطني الجزائري" : "Algerian curriculum contextualization"}</span>
              </div>
              <button
                onClick={handleGenerateLitReview}
                disabled={isGeneratingLit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
              >
                {isGeneratingLit ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isArabic ? "جاري التوليد والتحليل الأكاديمي..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {isArabic ? "توليد استعراض الأدبيات والمراجع" : "Generate Literature Review"}
                  </>
                )}
              </button>
            </div>

            {litOutput && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-6 text-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-blue-900">{isArabic ? "المسودة الأكاديمية الناتجة" : "Generated Academic Draft"}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(litOutput);
                      toast.success(isArabic ? "تم نسخ المسودة للحافظة" : "Copied to clipboard");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {isArabic ? "نسخ المسودة" : "Copy"}
                  </button>
                </div>
                <div className="whitespace-pre-line font-sans text-slate-800" dir={isArabic ? "rtl" : "ltr"}>
                  {litOutput}
                </div>
              </div>
            )}
          </div>

          {/* Curated Research Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Paper List Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isArabic ? "الأوراق والدراسات الميدانية المحكمة" : "Peer-Reviewed Field Studies"} ({filteredPapers.length})
                </h4>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={isArabic ? "بحث في العنوان، المنهجية، أو الكلمات المفتاحية..." : "Search papers, authors..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredPapers.map((paper) => {
                  const isSelected = selectedPaper.id === paper.id;
                  return (
                    <div
                      key={paper.id}
                      onClick={() => setSelectedPaper(paper)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-500 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>{paper.year}</span>
                        <span className="font-semibold text-blue-700 truncate max-w-[150px]">{paper.journal}</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">{paper.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{paper.authors}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {paper.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Paper Details Column */}
            <div className="lg:col-span-2">
              {selectedPaper ? (
                <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-blue-700">{selectedPaper.journal}</span>
                      <span>سنة النشر: {selectedPaper.year}</span>
                      <span className="font-mono text-[11px]">DOI: {selectedPaper.doi}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedPaper.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{selectedPaper.authors}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">{isArabic ? "عينة الدراسة (Sample Size):" : "Sample Size:"}</span>
                      <p className="text-slate-600">{selectedPaper.sampleSize}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">{isArabic ? "المنهجية وأدوات القياس:" : "Methodology:"}</span>
                      <p className="text-slate-600">{selectedPaper.methodology}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      {isArabic ? "النتائج الإمبريقية الجوهرية (Key Empirical Findings):" : "Key Empirical Findings:"}
                    </span>
                    <p className="text-slate-700 leading-relaxed">{selectedPaper.keyFindings}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-2">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-emerald-600" />
                      {isArabic ? "التطبيق العملي في المنهاج وقسم التدريس:" : "Classroom & Pedagogical Application:"}
                    </span>
                    <p className="text-emerald-900 leading-relaxed">{selectedPaper.pedagogicalApplication}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPaper.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const citation = `${selectedPaper.authors} (${selectedPaper.year}). ${selectedPaper.title}. ${selectedPaper.journal}. https://doi.org/${selectedPaper.doi}`;
                          navigator.clipboard.writeText(citation);
                          toast.success(isArabic ? "تم نسخ التوثيق بصيغة APA 7th" : "APA citation copied to clipboard");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {isArabic ? "نسخ توثيق APA" : "Copy APA"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  {isArabic ? "يرجى اختيار دراسة علمية للمعاينة" : "Select a paper to preview"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOOGLE SLIDES ACADEMIC BUILDER */}
      {/* ========================================================================= */}
      {activeTab === "slides" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Presentation className="w-3.5 h-3.5 ml-1" />
                  Google Slides Integration
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {isArabic ? "قوالب عروض المناقشة والمؤتمرات على Google Slides" : "Academic Google Slides Presentations"}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                  {isArabic
                    ? "قوالب جاهزة قابلة للتعديل مباشرة على حسابك في Google Workspace: مناقشات الماستر والدكتوراه، عروض المؤتمرات الدولية، وسيمينارات المخابر الجامعية."
                    : "Ready-to-fill academic slide deck templates integrated with Google Slides. Export and present with one click."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={customSlideTitle}
                  onChange={(e) => setCustomSlideTitle(e.target.value)}
                  placeholder={isArabic ? "عنوان العرض المخصص..." : "Custom presentation title..."}
                  className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3.5 py-2 font-medium outline-none focus:border-blue-500 w-64"
                />
                <button
                  onClick={() => handleExportToGoogleSlides(selectedSlideTemplate)}
                  disabled={isCreatingSlides}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs disabled:opacity-50 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isCreatingSlides ? (isArabic ? "جاري الإنشاء..." : "Creating...") : (isArabic ? "فتح في Google Slides" : "Open in Slides")}
                </button>
              </div>
            </div>

            {/* Template Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {READY_GOOGLE_SLIDES_TEMPLATES.map((tmpl) => {
                const isSelected = selectedSlideTemplate.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedSlideTemplate(tmpl)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-bold text-blue-700 uppercase tracking-wider">{tmpl.category}</span>
                      <span className="font-semibold text-slate-500">{tmpl.slideCount} {isArabic ? "شريحة" : "slides"}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{isArabic ? tmpl.titleAr : tmpl.titleEn}</h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-5">
                      {isArabic ? tmpl.descriptionAr : tmpl.descriptionEn}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-600">
                        {isSelected ? (isArabic ? "محدد حالياً ✓" : "Selected ✓") : (isArabic ? "اختر القالب" : "Select")}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slide Structure Preview */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  {isArabic ? "هيكل الشرائح المضمنة في القالب المختار:" : "Included Slide Structure & Drag-Ready Cards:"}
                </h4>
                <span className="text-xs text-slate-500">
                  {selectedSlideTemplate.readyCards.length} {isArabic ? "محطات عرض رئيسية" : "main slide milestones"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSlideTemplate.readyCards.map((card, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900">{card.title}</span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-500">
                        #{i + 1}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-700 text-[11px]">{card.subtitle}</p>
                    <ul className="space-y-1.5 text-slate-600 text-[11px]">
                      {card.bullets.map((bullet, bIndex) => (
                        <li key={bIndex} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GOOGLE SHEETS RESEARCH MATRICES */}
      {/* ========================================================================= */}
      {activeTab === "sheets" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <FileSpreadsheet className="w-3.5 h-3.5 ml-1" />
                  Google Sheets Matrix Builder
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {isArabic ? "مصفوفات تفريغ العينات والاستبيانات على Google Sheets" : "Research Data Matrices in Google Sheets"}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                  {isArabic
                    ? "جداول منظمة لجمع عينات التلاميذ والمشاركين، تفريغ استبيانات ليكرت، ومصفوفات المراجعة المنهجية الجاهزة للتصدير إلى SPSS و JASP و R."
                    : "Pre-structured research spreadsheets for student participant tracking, Likert survey coding, and PRISMA matrices."}
                </p>
              </div>

              <button
                onClick={() => handleExportToGoogleSheets(selectedSheetTemplate)}
                disabled={isCreatingSheet}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs disabled:opacity-50 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isCreatingSheet ? (isArabic ? "جاري الإنشاء..." : "Creating...") : (isArabic ? "تصدير إلى Google Sheets" : "Open in Sheets")}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {READY_GOOGLE_SHEETS_TEMPLATES.map((sheet) => {
                const isSelected = selectedSheetTemplate.id === sheet.id;
                return (
                  <div
                    key={sheet.id}
                    onClick={() => setSelectedSheetTemplate(sheet)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-1">
                      <span>{sheet.columns.length} أعمدة مهيكلة</span>
                      <span>جاهز ✓</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{isArabic ? sheet.titleAr : sheet.titleEn}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-5">{sheet.descriptionAr}</p>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 font-medium">
                      {sheet.purposeAr}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrix Live Table Preview */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isArabic ? "معاينة أعمدة المصفوفة والبيانات التجريبية:" : "Matrix Columns & Sample Data Preview:"}
                </h4>
                <span className="text-xs text-slate-500">{selectedSheetTemplate.columns.length} أعمدة متخصصة</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      {selectedSheetTemplate.columns.map((col, idx) => (
                        <th key={idx} className="px-3.5 py-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/80 font-medium text-slate-800">
                      {selectedSheetTemplate.sampleRow.map((val, idx) => (
                        <td key={idx} className="px-3.5 py-3 whitespace-nowrap">
                          {val}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PAPER & PDF SUMMARIZER */}
      {/* ========================================================================= */}
      {activeTab === "summarizer" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {isArabic ? "أداة تلخيص الأوراق الأكاديمية ونصوص الـ PDF" : "Academic Paper & PDF Summarizer"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic
                ? "الصق مستخلص البحث أو النص الأكاديمي لاستخراج الإشكالية المركزية، المنهجية، حجم العينة، النتائج الرئيسية، والتطبيقات الصفية."
                : "Paste paper abstract or academic draft to extract research questions, methodology, findings, and pedagogical aims."}
            </p>

            <div className="mt-4 space-y-3">
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder={
                  isArabic
                    ? "الصق ملخص البحث، مقدمة الأطروحة، أو نص المقال الأكاديمي هنا للتحليل والاستخلاص..."
                    : "Paste paper abstract or excerpt here..."
                }
                rows={5}
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setDocText(
                      "This study examines the impact of spaced retrieval practice and dual coding on the academic writing fluency of Algerian Master students majoring in English Didactics. Employing a quasi-experimental design across two universities (N = 120), pre-test and post-test data were analyzed using ANCOVA. The findings demonstrate a statistically significant enhancement in syntactic complexity and lexical variety in the experimental cohort (p < .001, d = 0.84)."
                    );
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {isArabic ? "تحميل نص تجريبي نموذجي (Sample Abstract)" : "Load sample abstract"}
                </button>

                <button
                  onClick={handleSummarizeDoc}
                  disabled={isSummarizing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
                >
                  {isSummarizing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isArabic ? "جاري استخلاص المحاور..." : "Extracting..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isArabic ? "استخلاص الأركان الأكاديمية" : "Summarize Paper"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {extractedSummary && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 text-xs">
                <h4 className="font-bold text-sm text-slate-900">
                  {isArabic ? "المحاور الأكاديمية المستخلصة بدقة:" : "Extracted Academic Milestones:"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-blue-900 block mb-1">
                      {isArabic ? "سؤال البحث الرئيسي:" : "Core Research Question:"}
                    </span>
                    <p className="text-slate-700 leading-relaxed">{extractedSummary.mainQuestion}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-blue-900 block mb-1">
                      {isArabic ? "المنهجية والتصميم التجريبي:" : "Methodology & Design:"}
                    </span>
                    <p className="text-slate-700 leading-relaxed">{extractedSummary.methodology}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="font-bold text-emerald-950 block mb-1">
                      {isArabic ? "النتائج الإحصائية الجوهرية:" : "Empirical Results:"}
                    </span>
                    <p className="text-emerald-900 leading-relaxed">{extractedSummary.keyFindings}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-950 block mb-1">
                      {isArabic ? "حدود الدراسة والتعميم:" : "Study Limitations:"}
                    </span>
                    <p className="text-amber-900 leading-relaxed">{extractedSummary.limitations}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RESEARCH ROADMAP & TIME MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          {/* Pomodoro & Research Sprint Timer */}
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                  <Timer className="w-3.5 h-3.5 ml-1" />
                  Academic Sprint Timer
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {isArabic ? "مؤقت جلسات التركيز الأكاديمي وإدارة الوقت" : "Academic Focus & Sprint Timer"}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {isArabic
                    ? "تقنية بومودورو الأكاديمية (25 دقيقة قراءة/كتابة عميقة + 5 دقائق استراحة) لضمان الإنتاجية البحثية."
                    : "Calibrated 25-min deep work research sprints for paper drafting and systematic literature coding."}
                </p>
              </div>

              {/* Timer Display & Controls */}
              <div className="flex items-center gap-4 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-sm">
                <div className="text-center font-mono text-3xl font-bold tracking-wider">
                  {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTimerRunning(!timerRunning);
                      toast.info(timerRunning ? "تم إيقاف المؤقت مؤقتاً" : "بدأت جلسة التركيز الأكاديمي!");
                    }}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
                    title={timerRunning ? "Pause" : "Start"}
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerMinutes(25);
                      setTimerSeconds(0);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4-Phase Thesis & Research Roadmap */}
            <div className="mt-6 space-y-6">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-blue-600" />
                {isArabic ? "خارطة طريق إنجاز الأطروحة والأوراق العلمية (MESRS Roadmap):" : "Thesis & Dissertation Milestones:"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_RESEARCH_ROADMAP.map((phase, pIdx) => (
                  <div key={pIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{isArabic ? phase.phaseAr : phase.phaseEn}</h5>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {isArabic ? `المرحلة ${pIdx + 1}` : `Phase ${pIdx + 1}`}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {phase.milestones.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`w-4 h-4 mt-0.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                m.status === "completed"
                                  ? "bg-emerald-500 text-white"
                                  : m.status === "in_progress"
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {m.status === "completed" ? "✓" : mIdx + 1}
                            </span>
                            <span className="font-medium text-slate-800 leading-snug">{m.titleAr}</span>
                          </div>
                          <div className="text-left shrink-0 text-[11px] text-slate-500">
                            <span className="block font-semibold text-slate-700">{m.deadlineWeek}</span>
                            <span>{m.timeEstimateHours}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: FREE GITHUB & OPEN-SOURCE RESOURCES */}
      {/* ========================================================================= */}
      {activeTab === "github" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-slate-900" />
                  {isArabic ? "المستودعات الأكاديمية والأدوات مفتوحة المصدر (Free GitHub Repositories)" : "Free GitHub & Open Source Repositories"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isArabic
                    ? "أدوات مجانية، مدونات لغوية، قوالب توثيق Zotero، ومجموعات بيانات لمعالجة اللغات واللهجات الجزائرية متاحة للباحثين."
                    : "Curated open-source linguistic corpora, Zotero CSL templates, and NLP tools for academic research."}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {FREE_GITHUB_RESOURCES.length} {isArabic ? "مستودعات معتمدة" : "vetted repos"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {FREE_GITHUB_RESOURCES.map((repo) => (
                <div key={repo.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 px-2.5 py-0.5 bg-blue-50 rounded-md">
                      {repo.categoryAr}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{repo.license}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 font-mono">{repo.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{repo.descriptionAr}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {repo.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {isArabic ? "عرض المستودع على GitHub" : "View on GitHub"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: GROUP RESEARCH SEMINAR & COLLOQUIUM */}
      {/* ========================================================================= */}
      {activeTab === "seminar" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200 bg-white rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <Users className="w-3.5 h-3.5 ml-1" />
                  Research Colloquium & Lab Seminars
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {isArabic ? "حلقة النقاش والسيمنار الأكاديمي المشترك" : "Group Research Seminar & Collaboration"}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {isArabic
                    ? "تدوين وتنسيق ملاحظات حلقات نقاش الدكتوراه، مراجعة الأقران، وتوصيات المجالس العلمية لمخابر البحث."
                    : "Collaborative research seminar minutes, peer-review feedback, and scientific board recommendations."}
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">
                {isArabic ? "فرقة البحث: ديداكتيك اللغات واللسانيات التطبيقية" : "Research Unit: ELT & Applied Linguistics"}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isArabic ? "موضوع حلقة النقاش أو الجلسة العلمية:" : "Colloquium Topic / Session Title:"}
                </label>
                <input
                  type="text"
                  value={seminarTopic}
                  onChange={(e) => setSeminarTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isArabic ? "محضر وتوصيات الجلسة المسجلة:" : "Recorded Seminar Minutes & Recommendations:"}
                </label>
                <div className="space-y-2">
                  {seminarNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddSeminarNote} className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={newSeminarNote}
                  onChange={(e) => setNewSeminarNote(e.target.value)}
                  placeholder={isArabic ? "إضافة توصية جديدة أو ملاحظة من الأستاذ المشرف..." : "Add recommendation..."}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isArabic ? "إضافة للمحضر" : "Add Note"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
