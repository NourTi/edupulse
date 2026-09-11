import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  CreditCard,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Laptop,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

type Props = {
  isArabic: boolean;
  onEnterWorkspace: (role?: string) => void;
  onNavigateToView: (viewId: string) => void;
};

// ----------------------------------------------------
// 1. MOCK DATA FOR ADMISSIONS PIPELINE KANBAN (Zoho style)
// ----------------------------------------------------
type PipelineStudent = {
  id: string;
  name: string;
  stream: string;
  wilaya: string;
  source: string;
  bemScore: string;
  missingDoc?: string;
  phone: string;
  stage: "inquiry" | "review" | "interview" | "enrolled";
};

const INITIAL_PIPELINE: PipelineStudent[] = [
  {
    id: "lead-elbayadh",
    name: "نور الدين بلقاسم / Noureddine Belkacem",
    stream: "3AS - رياضيات",
    wilaya: "البيض (32) · ثانوية محمد بلخير",
    source: "تسجيل مؤسسة رسمي",
    bemScore: "18.45",
    phone: "0661 32 45 88",
    stage: "enrolled",
  },
  {
    id: "lead-1",
    name: "أمينة بلقاسم / Amina Belkacem",
    stream: "3AS - علوم تجريبية",
    wilaya: "الجزائر (16)",
    source: "استمارة الويب",
    bemScore: "16.40",
    phone: "0550 12 34 56",
    stage: "inquiry",
  },
  {
    id: "lead-2",
    name: "يوسف منصوري / Youcef Mansouri",
    stream: "2AS - تقني رياضي (هندسة ميكانيكية)",
    wilaya: "البليدة (09)",
    source: "واتساب المدرسة",
    bemScore: "15.10",
    missingDoc: "كشف نقاط الفصل الثالث",
    phone: "0661 78 90 12",
    stage: "inquiry",
  },
  {
    id: "lead-3",
    name: "مريم شاحط / Meriem Chahed",
    stream: "3AS - رياضيات",
    wilaya: "قسنطينة (25)",
    source: "زيارة مباشرة",
    bemScore: "17.85",
    phone: "0770 45 67 89",
    stage: "review",
  },
  {
    id: "lead-4",
    name: "وليد قدور / Walid Kaddour",
    stream: "3AS - تسيير واقتصاد",
    wilaya: "وهران (31)",
    source: "تحويل مؤسسة",
    bemScore: "14.20",
    missingDoc: "شهادة الانتقال",
    phone: "0540 22 33 44",
    stage: "review",
  },
  {
    id: "lead-5",
    name: "سارة بوزيان / Sarah Bouziane",
    stream: "3AS - لغات أجنبية (إسبانية)",
    wilaya: "سطيف (19)",
    source: "استمارة الويب",
    bemScore: "15.60",
    phone: "0672 99 88 77",
    stage: "interview",
  },
  {
    id: "lead-6",
    name: "أمل بن يحيى / Amal Benyahia",
    stream: "3AS - علوم تجريبية",
    wilaya: "الجزائر (16)",
    source: "تسجيل مؤكد",
    bemScore: "17.20",
    phone: "0555 11 22 33",
    stage: "enrolled",
  },
];

// ----------------------------------------------------
// 2. ALGERIAN CURRICULUM STREAMS (Zoho style matrix)
// Verified against official Ministry of National Education coefficients
// ----------------------------------------------------
type StreamCourse = {
  subjectAr: string;
  subjectEn: string;
  coeff: number;
  hours: number;
  examHours: string;
};

const STREAM_DETAILS: Record<
  string,
  {
    titleAr: string;
    titleEn: string;
    tag: string;
    totalCoeff: number;
    weeklyHours: number;
    courses: StreamCourse[];
  }
> = {
  "3as-sci": {
    titleAr: "3 ع ت — علوم تجريبية",
    titleEn: "3AS Experimental Sciences",
    tag: "الفرع العلمي الأكثر طلباً في الجزائر (المعامل الأساسي: علوم 6، رياضيات 5، فيزياء 5)",
    totalCoeff: 30,
    weeklyHours: 31,
    courses: [
      { subjectAr: "علوم الطبيعة والحياة", subjectEn: "Natural & Life Sciences", coeff: 6, hours: 6, examHours: "4h30" },
      { subjectAr: "الرياضيات", subjectEn: "Mathematics", coeff: 5, hours: 5, examHours: "3h30" },
      { subjectAr: "العلوم الفيزيائية", subjectEn: "Physical Sciences", coeff: 5, hours: 5, examHours: "3h30" },
      { subjectAr: "اللغة العربية وآدابها", subjectEn: "Arabic Literature", coeff: 3, hours: 3, examHours: "2h30" },
      { subjectAr: "الفلسفة", subjectEn: "Philosophy", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "اللغة الفرنسية", subjectEn: "French Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "اللغة الإنجليزية", subjectEn: "English Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "التاريخ والجغرافيا", subjectEn: "History & Geography", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "العلوم الإسلامية", subjectEn: "Islamic Studies", coeff: 2, hours: 1, examHours: "2h00" },
      { subjectAr: "التربية البدنية والرياضية", subjectEn: "Physical Education", coeff: 1, hours: 2, examHours: "1h00" },
    ],
  },
  "3as-math": {
    titleAr: "3 ر — رياضيات",
    titleEn: "3AS Mathematics",
    tag: "نخبة الشعب العلمية والتقنية (الرياضيات معامل 7، الفيزياء معامل 6)",
    totalCoeff: 29,
    weeklyHours: 32,
    courses: [
      { subjectAr: "الرياضيات", subjectEn: "Advanced Mathematics", coeff: 7, hours: 7, examHours: "4h30" },
      { subjectAr: "العلوم الفيزيائية", subjectEn: "Physical Sciences", coeff: 6, hours: 6, examHours: "4h00" },
      { subjectAr: "علوم الطبيعة والحياة", subjectEn: "Natural Sciences", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "اللغة العربية وآدابها", subjectEn: "Arabic Literature", coeff: 3, hours: 3, examHours: "2h30" },
      { subjectAr: "الفلسفة", subjectEn: "Philosophy", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "اللغة الفرنسية", subjectEn: "French Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "اللغة الإنجليزية", subjectEn: "English Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "التاريخ والجغرافيا", subjectEn: "History & Geography", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "العلوم الإسلامية", subjectEn: "Islamic Studies", coeff: 2, hours: 1, examHours: "2h00" },
      { subjectAr: "التربية البدنية والرياضية", subjectEn: "Physical Education", coeff: 1, hours: 2, examHours: "1h00" },
    ],
  },
  "3as-tm": {
    titleAr: "3 ت ر — تقني رياضي",
    titleEn: "3AS Technical Mathematics",
    tag: "4 فروع: هندسة ميكانيكية، مدنية، كهربائية، طرائق (التكنولوجيا 6، الرياضيات 6، الفيزياء 6)",
    totalCoeff: 32,
    weeklyHours: 33,
    courses: [
      { subjectAr: "التكنولوجيا (الهندسة التخصصية)", subjectEn: "Specialized Engineering", coeff: 6, hours: 6, examHours: "4h00" },
      { subjectAr: "الرياضيات", subjectEn: "Mathematics", coeff: 6, hours: 6, examHours: "4h00" },
      { subjectAr: "العلوم الفيزيائية", subjectEn: "Physical Sciences", coeff: 6, hours: 6, examHours: "4h00" },
      { subjectAr: "اللغة العربية وآدابها", subjectEn: "Arabic Literature", coeff: 3, hours: 3, examHours: "2h30" },
      { subjectAr: "الفلسفة", subjectEn: "Philosophy", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "التاريخ والجغرافيا", subjectEn: "History & Geography", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "اللغة الفرنسية", subjectEn: "French Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "اللغة الإنجليزية", subjectEn: "English Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "العلوم الإسلامية", subjectEn: "Islamic Studies", coeff: 2, hours: 1, examHours: "2h00" },
      { subjectAr: "التربية البدنية والرياضية", subjectEn: "Physical Education", coeff: 1, hours: 2, examHours: "1h00" },
    ],
  },
  "3as-ge": {
    titleAr: "3 ت ق — تسيير واقتصاد",
    titleEn: "3AS Management & Economics",
    tag: "المحاسبة والتسيير المالي (معامل 6)، الاقتصاد والمناجمنت (معامل 5)",
    totalCoeff: 33,
    weeklyHours: 31,
    courses: [
      { subjectAr: "التسيير المحاسبي والمالي", subjectEn: "Accounting & Financial Management", coeff: 6, hours: 6, examHours: "4h00" },
      { subjectAr: "الاقتصاد والمناجمنت", subjectEn: "Economics & Management", coeff: 5, hours: 4, examHours: "3h30" },
      { subjectAr: "التاريخ والجغرافيا", subjectEn: "History & Geography", coeff: 4, hours: 4, examHours: "3h30" },
      { subjectAr: "الرياضيات", subjectEn: "Applied Mathematics", coeff: 4, hours: 4, examHours: "3h30" },
      { subjectAr: "اللغة العربية وآدابها", subjectEn: "Arabic Literature", coeff: 3, hours: 3, examHours: "2h30" },
      { subjectAr: "القانون", subjectEn: "Law", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "الفلسفة", subjectEn: "Philosophy", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "اللغة الفرنسية", subjectEn: "French Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "اللغة الإنجليزية", subjectEn: "English Language", coeff: 2, hours: 3, examHours: "2h30" },
      { subjectAr: "العلوم الإسلامية", subjectEn: "Islamic Studies", coeff: 2, hours: 1, examHours: "2h00" },
      { subjectAr: "التربية البدنية والرياضية", subjectEn: "Physical Education", coeff: 1, hours: 2, examHours: "1h00" },
    ],
  },
  "3as-lp": {
    titleAr: "3 آ ف — آداب وفلسفة",
    titleEn: "3AS Literature & Philosophy",
    tag: "الفلسفة (معامل 6)، الأدب العربي (معامل 6)، التاريخ والجغرافيا (معامل 4)",
    totalCoeff: 27,
    weeklyHours: 29,
    courses: [
      { subjectAr: "الفلسفة", subjectEn: "Philosophy", coeff: 6, hours: 6, examHours: "4h30" },
      { subjectAr: "اللغة العربية وآدابها", subjectEn: "Arabic Literature", coeff: 6, hours: 6, examHours: "4h00" },
      { subjectAr: "التاريخ والجغرافيا", subjectEn: "History & Geography", coeff: 4, hours: 4, examHours: "3h30" },
      { subjectAr: "اللغة الفرنسية", subjectEn: "French Language", coeff: 3, hours: 3, examHours: "2h30" },
      { subjectAr: "اللغة الإنجليزية", subjectEn: "English Language", coeff: 3, hours: 3, examHours: "2h30" },
      { subjectAr: "العلوم الإسلامية", subjectEn: "Islamic Studies", coeff: 2, hours: 2, examHours: "2h00" },
      { subjectAr: "الرياضيات", subjectEn: "Mathematics", coeff: 2, hours: 2, examHours: "2h00" },
      { subjectAr: "التربية البدنية والرياضية", subjectEn: "Physical Education", coeff: 1, hours: 2, examHours: "1h00" },
    ],
  },
  "3as-le": {
    titleAr: "3 ل أ — لغات أجنبية",
    titleEn: "3AS Foreign Languages",
    tag: "اللغة الأجنبية الثالثة (معامل 5)، الفرنسية (5)، الإنجليزية (5)، العربية (5)",
    totalCoeff: 29,
    weeklyHours: 30,
    courses: [
      { subjectAr: "اللغة الأجنبية الثالثة (إسبانية/ألمانية/إيطالية)", subjectEn: "Third Foreign Language", coeff: 5, hours: 5, examHours: "3h30" },
      { subjectAr: "اللغة العربية وآدابها", subjectEn: "Arabic Literature", coeff: 5, hours: 5, examHours: "3h30" },
      { subjectAr: "اللغة الفرنسية", subjectEn: "French Language", coeff: 5, hours: 5, examHours: "3h30" },
      { subjectAr: "اللغة الإنجليزية", subjectEn: "English Language", coeff: 5, hours: 5, examHours: "3h30" },
      { subjectAr: "التاريخ والجغرافيا", subjectEn: "History & Geography", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "الفلسفة", subjectEn: "Philosophy", coeff: 2, hours: 2, examHours: "2h30" },
      { subjectAr: "العلوم الإسلامية", subjectEn: "Islamic Studies", coeff: 2, hours: 1, examHours: "2h00" },
      { subjectAr: "الرياضيات", subjectEn: "Mathematics", coeff: 2, hours: 2, examHours: "2h00" },
      { subjectAr: "التربية البدنية والرياضية", subjectEn: "Physical Education", coeff: 1, hours: 2, examHours: "1h00" },
    ],
  },
};

export function ZohoEducationLanding({ isArabic, onEnterWorkspace, onNavigateToView }: Props) {
  // Kanban interactive state
  const [pipeline, setPipeline] = useState<PipelineStudent[]>(INITIAL_PIPELINE);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedStreamKey, setSelectedStreamKey] = useState<string>("3as-sci");

  // 360 view tab
  const [student360Tab, setStudent360Tab] = useState<"grades" | "attendance" | "guardian" | "notes">("grades");

  // Omnichannel message preview
  const [activeChannel, setActiveChannel] = useState<"whatsapp" | "sms" | "portal" | "email">("whatsapp");
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

  // Workflow automation interactive demo
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState<number>(0);

  // Role portal mockup state
  const [activePortalRole, setActivePortalRole] = useState<"director" | "professor" | "student" | "guardian">("professor");

  const runWorkflowDemo = () => {
    setWorkflowRunning(true);
    setWorkflowProgress(1);
    setTimeout(() => setWorkflowProgress(2), 700);
    setTimeout(() => setWorkflowProgress(3), 1400);
    setTimeout(() => setWorkflowProgress(4), 2100);
    setTimeout(() => {
      setWorkflowRunning(false);
      setWorkflowProgress(4);
    }, 2800);
  };

  const filteredPipeline = pipeline.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.stream.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.wilaya.includes(searchFilter)
  );

  const activeStream = STREAM_DETAILS[selectedStreamKey] || STREAM_DETAILS["3as-sci"];

  return (
    <div className="bg-slate-50 text-slate-900 font-body selection:bg-blue-100 selection:text-blue-900">
      {/* ---------------------------------------------------- */}
      {/* SECTION 1: ZOHO ADMISSIONS & LEAD LIFECYCLE (KANBAN) */}
      {/* ---------------------------------------------------- */}
      <section id="pipeline" className="border-t border-slate-200 bg-white px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-4">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{isArabic ? "مسار القبول والتوجيه المدرسي المؤتمت" : "Admissions & Enrollment CRM"}</span>
                <span className="text-slate-300">·</span>
                <span>Zoho Education Pipeline</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
                {isArabic ? (
                  <>
                    من أول استفسار إلى المقعد الدراسي،
                    <br />
                    <span className="text-blue-600">خط أنابيب قبول ذكي بلا أوراق ضائعة.</span>
                  </>
                ) : (
                  <>
                    From initial inquiry to enrolled student,
                    <br />
                    <span className="text-blue-600">a seamless, paperless admissions pipeline.</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
                {isArabic
                  ? "اجمع طلبات التسجيل من استمارات الويب، رسائل واتساب، أو الزيارات الحضورية. وجّه الطلاب تلقائياً للشعب الجزائرية الست، وتابع الوثائق الناقصة مع الأولياء خطوة بخطوة."
                  : "Capture inquiries from web forms, WhatsApp, or walk-ins. Automatically route applicants into the 6 Algerian secondary streams, verify credentials, and close enrollments faster."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToView("registration")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
              >
                <Plus className="h-4 w-4" />
                {isArabic ? "تجربة تسجيل طالب" : "Add New Applicant"}
              </button>
            </div>
          </div>

          {/* Kanban Interactive Mockup */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Mockup Window Chrome */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-semibold text-slate-500">
                  EduPulse Admissions CRM · الموسم الدراسي 2026 / 2027
                </span>
              </div>

              {/* Filter bar */}
              <div className="flex items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isArabic ? "بحث باسم الطالب، الشعبة، أو الولاية..." : "Filter applicants..."}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {filteredPipeline.length} {isArabic ? "طلب نشط" : "applicants"}
                </span>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Column 1: Inquiries */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-extrabold text-slate-800">
                      {isArabic ? "استفسارات جديدة" : "New Inquiries"}
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    {filteredPipeline.filter((s) => s.stage === "inquiry").length}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {filteredPipeline
                    .filter((s) => s.stage === "inquiry")
                    .map((applicant) => (
                      <div
                        key={applicant.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition hover:border-blue-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{applicant.name}</h4>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                            {applicant.wilaya}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-blue-700">{applicant.stream}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>BEM: {applicant.bemScore}/20</span>
                          <span className="text-slate-400">{applicant.source}</span>
                        </div>
                        {applicant.missingDoc && (
                          <div className="mt-2 rounded bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-800 border border-amber-200 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="truncate">{applicant.missingDoc}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 2: Document Review */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-extrabold text-slate-800">
                      {isArabic ? "تدقيق الوثائق والتوجيه" : "Document Review"}
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {filteredPipeline.filter((s) => s.stage === "review").length}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {filteredPipeline
                    .filter((s) => s.stage === "review")
                    .map((applicant) => (
                      <div
                        key={applicant.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition hover:border-amber-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{applicant.name}</h4>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                            {applicant.wilaya}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-amber-700">{applicant.stream}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>BEM: {applicant.bemScore}/20</span>
                          <span className="text-slate-400">{applicant.phone}</span>
                        </div>
                        {applicant.missingDoc && (
                          <div className="mt-2 rounded bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-700 border border-rose-200 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span className="truncate">{applicant.missingDoc}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 3: Assessment / Interview */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-extrabold text-slate-800">
                      {isArabic ? "المقابلة واختبار التموضع" : "Assessment & Test"}
                    </span>
                  </div>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                    {filteredPipeline.filter((s) => s.stage === "interview").length}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {filteredPipeline
                    .filter((s) => s.stage === "interview")
                    .map((applicant) => (
                      <div
                        key={applicant.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition hover:border-purple-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{applicant.name}</h4>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                            {applicant.wilaya}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-purple-700">{applicant.stream}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>BEM: {applicant.bemScore}/20</span>
                          <span className="text-emerald-600 font-semibold">اختبار لغات: جاهز</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 4: Enrolled */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-extrabold text-slate-800">
                      {isArabic ? "مقبول ومسجل رسمياً" : "Enrolled & Active"}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {filteredPipeline.filter((s) => s.stage === "enrolled").length + 23}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {filteredPipeline
                    .filter((s) => s.stage === "enrolled")
                    .map((applicant) => (
                      <div
                        key={applicant.id}
                        className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3 shadow-xs transition hover:border-emerald-400 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{applicant.name}</h4>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                            فوج 3AS-SC-01
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-emerald-800">{applicant.stream}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="text-emerald-600 font-bold">رسوم: مسددة</span>
                          <span className="text-slate-400">رقم الطالب: #0842</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {isArabic
                  ? "تكامل مباشر مع المعاملات الرسمية للبكالوريا وتوجيه شعب 1AS و 2AS و 3AS"
                  : "Direct integration with Algerian Baccalaureate streams and coefficients"}
              </span>
              <button
                onClick={() => onNavigateToView("registration")}
                className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                {isArabic ? "فتح وحدة التسجيل الكاملة" : "Open Full Registration Module"}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: 360-DEGREE STUDENT VIEW (CRM CONTACT RECORD) */}
      {/* ---------------------------------------------------- */}
      <section id="sis" className="border-t border-slate-200 bg-slate-50 px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-4">
              <Users className="h-3.5 w-3.5" />
              <span>{isArabic ? "رؤية 360 درجة لبيانات المتعلم" : "360-Degree Learner View"}</span>
              <span className="text-slate-300">·</span>
              <span>Unified Student Record</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
              {isArabic ? (
                <>
                  ملف موحد لكل طالب،
                  <br />
                  <span className="text-indigo-600">يجمع الدرجات، الحضور، وتواصل الأولياء في شاشة واحدة.</span>
                </>
              ) : (
                <>
                  A single source of truth for every learner,
                  <br />
                  <span className="text-indigo-600">combining marks, attendance, and guardian engagement.</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              {isArabic
                ? "توقف عن التشتت بين جداول Excel ومجموعات واتساب وسجلات الورق. يمنحك EduPulse سجلاً تفاعلياً شاملاً لكل تلميذ: كشف نقاط بمعاملات البكالوريا الرسمية، نسبة الحضور، وسجل تواصل فوري مع الولي."
                : "Consolidate academic performance with official Algerian coefficients, real-time attendance, guardian SMS logs, and psycho-pedagogical observations into one crystal-clear record."}
            </p>
          </div>

          {/* 360 Student Mockup Card */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header of Student Record */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-2xl font-black text-white shadow-sm shrink-0">
                    أب
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl font-extrabold text-slate-900">أمل بن يحيى / Amal Benyahia</h3>
                      <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        متمدرس نشط · فئة A
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                      <span>رقم التسجيل: <strong className="font-mono text-slate-700">ALG-2026-3AS-0842</strong></span>
                      <span className="text-slate-300">·</span>
                      <span>الشعبة: <strong className="text-slate-800">3AS علوم تجريبية (فوج 02)</strong></span>
                      <span className="text-slate-300">·</span>
                      <span>المؤسسة والولاية: <strong className="text-indigo-600 font-bold">ثانوية محمد بلخير — ولاية البيض (32)</strong></span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                    <Award className="h-3.5 w-3.5" />
                    <span>مترشحة بكالوريا دورة 2026</span>
                  </span>
                </div>
              </div>

              {/* 4 Quick Stat Badges with ample width and perfect alignment */}
              <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4 w-full">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-3.5 text-center flex flex-col justify-between items-center transition hover:border-indigo-200 shadow-2xs">
                  <span className="text-xs font-bold text-indigo-900/70 mb-1.5">معدل البكالوريا المتوقع</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-indigo-700 tracking-tight">16.85</span>
                    <span className="text-xs font-bold text-indigo-400">/ 20</span>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-indigo-600/80">تقدير: جيد جداً</span>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3.5 text-center flex flex-col justify-between items-center transition hover:border-emerald-200 shadow-2xs">
                  <span className="text-xs font-bold text-emerald-900/70 mb-1.5">نسبة الحضور الرسمية</span>
                  <span className="text-2xl font-black text-emerald-700 tracking-tight">98.2%</span>
                  <span className="mt-1 text-[10px] font-semibold text-emerald-600/80">انضباط ممتاز (غياب مبرر وحيد)</span>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-center flex flex-col justify-between items-center transition hover:border-blue-200 shadow-2xs">
                  <span className="text-xs font-bold text-blue-900/70 mb-1.5">الوضعية المالية للمتمدرس</span>
                  <div className="my-0.5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-xs">
                      مسددة بالكامل (100%)
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-blue-600/80">إيصال رقم #MB-0842</span>
                </div>

                <div className="rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3.5 text-center flex flex-col justify-between items-center transition hover:border-purple-200 shadow-2xs">
                  <span className="text-xs font-bold text-purple-900/70 mb-1.5">جاهزية التذكر المتباعد</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-purple-700 tracking-tight">92%</span>
                    <span className="text-xs font-bold text-purple-400">مؤشر الإتقان</span>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-purple-600/80">خوارزمية FSRS المدمجة</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs inside 360 view */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
              {[
                { id: "grades", labelAr: "كشف النقاط والمنهاج الرسمي", labelEn: "Marks & Algerian Curriculum", icon: Award },
                { id: "attendance", labelAr: "سجل الحضور والغيابات", labelEn: "Attendance & Punctuality", icon: Calendar },
                { id: "guardian", labelAr: "بيانات وتواصل الولي", labelEn: "Guardian Omnichannel Log", icon: MessageCircle },
                { id: "notes", labelAr: "الملاحظات البيداغوجية والعلوم المعرفية", labelEn: "Pedagogical Notes", icon: Brain },
              ].map(({ id, labelAr, labelEn, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setStudent360Tab(id as any)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    student360Tab === id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{isArabic ? labelAr : labelEn}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="mt-6">
              {student360Tab === "grades" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                        <th className="pb-3 pr-2">المادة الدراسية</th>
                        <th className="pb-3 px-3 text-center">المعامل الرسمي</th>
                        <th className="pb-3 px-3 text-center">التقويم المستمر</th>
                        <th className="pb-3 px-3 text-center">فرض الفصل الأول</th>
                        <th className="pb-3 px-3 text-center">اختبار الفصل الأول</th>
                        <th className="pb-3 px-3 text-center">المعدل المرجح</th>
                        <th className="pb-3 pl-2 text-center">التقدير الأكاديمي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 pr-2 font-bold text-slate-900">علوم الطبيعة والحياة</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-700">6</td>
                        <td className="py-3 px-3 text-center text-slate-700">17.5 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">16.0 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">17.0 / 20</td>
                        <td className="py-3 px-3 text-center font-black text-slate-900">16.80</td>
                        <td className="py-3 pl-2 text-center"><span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ممتاز (Très Bien)</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-2 font-bold text-slate-900">الرياضيات</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-700">5</td>
                        <td className="py-3 px-3 text-center text-slate-700">18.0 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">16.5 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">17.5 / 20</td>
                        <td className="py-3 px-3 text-center font-black text-slate-900">17.30</td>
                        <td className="py-3 pl-2 text-center"><span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ممتاز (Très Bien)</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-2 font-bold text-slate-900">العلوم الفيزيائية</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-700">5</td>
                        <td className="py-3 px-3 text-center text-slate-700">16.0 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">15.5 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">16.5 / 20</td>
                        <td className="py-3 px-3 text-center font-black text-slate-900">16.10</td>
                        <td className="py-3 pl-2 text-center"><span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">جيد جداً (Bien)</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-2 font-bold text-slate-900">اللغة العربية وآدابها</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-700">3</td>
                        <td className="py-3 px-3 text-center text-slate-700">15.0 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">14.0 / 20</td>
                        <td className="py-3 px-3 text-center text-slate-700">15.5 / 20</td>
                        <td className="py-3 px-3 text-center font-black text-slate-900">15.00</td>
                        <td className="py-3 pl-2 text-center"><span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">جيد (Bien)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {student360Tab === "guardian" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold text-slate-800">بيانات ولي الأمر المعتمد</h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">اسم الولي:</span>
                        <span className="font-bold text-slate-900">كريم بن يحيى (الأب)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">رقم الهاتف:</span>
                        <span className="font-bold text-slate-900">0550 12 34 56</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">البريد الإلكتروني:</span>
                        <span className="font-bold text-slate-900">k.benyahia@email.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">تفضيل الإشعارات:</span>
                        <span className="font-bold text-emerald-700">واتساب فوري + SMS</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold text-slate-800">آخر إشعارات مرسلة للولي</h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="rounded bg-white p-2 border border-slate-200/60">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>واتساب · أمس 14:20</span>
                          <span className="text-emerald-600 font-bold">تم الاستلام والقراءة</span>
                        </div>
                        <p className="mt-1 text-slate-700">إشعار نتائج الفرض الأول لمادة العلوم (17/20) ورابط بطاقة التقويم.</p>
                      </div>
                      <div className="rounded bg-white p-2 border border-slate-200/60">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>SMS · 02 سبتمبر</span>
                          <span className="text-emerald-600 font-bold">تم التسليم</span>
                        </div>
                        <p className="mt-1 text-slate-700">تأكيد سداد القسط المدرسي الأول مع إيصال رقم #2026-REC-0842.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {student360Tab === "attendance" && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">سجل الحضور للفصل الدراسي الأول</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">نسبة الحضور: 98.2%</span>
                  </div>
                  <p className="mt-2 text-slate-500">إجمالي الحصص: 180 حصة · الغيابات: 03 حصص (مبررة بشهادة طبية) · التأخرات: 00</p>
                </div>
              )}

              {student360Tab === "notes" && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Brain className="h-4 w-4 text-indigo-600" />
                    <span>ملاحظة أستاذ مادة العلوم (وفق بروتوكول Roediger & Karpicke 2006)</span>
                  </div>
                  <p className="mt-2 text-slate-700 leading-relaxed">
                    "تستجيب الطالبة بشكل ممتاز لاختبارات الاسترجاع السريع (Retrieval Practice) في بداية كل حصة. أظهرت قدرة عالية على نمذجة آليات تركيب البروتين بدون العودة للدفتر. يُنصح بمتابعة تدريبها على المسائل التركيبية من النمط الثالث في البكالوريا."
                  </p>
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">آخر تحديث للسجل: اليوم 11:45 من قبل أستاذ المادة</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToView("learners")}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {isArabic ? "فتح سجل الطلاب الكامل" : "View All Students"}
                </button>
                <button
                  onClick={() => onNavigateToView("student_intel")}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-sm"
                >
                  {isArabic ? "مخطط البكالوريا ومحاكي المعدل" : "BAC Simulator"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 3: OMNICHANNEL COMMUNICATION (WHATSAPP, SMS) */}
      {/* ---------------------------------------------------- */}
      <section id="guardians" className="border-t border-slate-200 bg-white px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-4">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{isArabic ? "تواصل متعدد القنوات مع الأولياء" : "Omnichannel Parent Engagement"}</span>
                <span className="text-slate-300">·</span>
                <span>WhatsApp, SMS & Portal</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
                {isArabic ? (
                  <>
                    تواصل مع الأولياء
                    <br />
                    <span className="text-emerald-600">على التطبيق الذي يفتحونه كل دقيقة: واتساب.</span>
                  </>
                ) : (
                  <>
                    Reach guardians
                    <br />
                    <span className="text-emerald-600">where they actually respond: WhatsApp & SMS.</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {isArabic
                  ? "ودّع الرسائل الورقية التي تضيع في محافظ الطلاب. أرسل إشعارات الغياب الفورية، استدعاءات امتحانات البكالوريا التجريبية، وإيصالات السداد مباشرة لهواتف الأولياء مع تأكيد القراءة والاستلام."
                  : "No more lost paper notices. Dispatch instant absence alerts, BAC mock exam convocations, report cards, and digital receipts directly to parents' smartphones via official WhatsApp & SMS."}
              </p>

              {/* Template selector pills */}
              <div className="mt-8 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isArabic ? "جرّب قوالب الإشعارات المدرسية الجاهزة:" : "Try Official School Notification Templates:"}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 0, title: "تنبيه غياب فوري (08:15 صباحاً)", tag: "غياب" },
                    { id: 1, title: "استدعاء اختبار البكالوريا التجريبي", tag: "امتحانات" },
                    { id: 2, title: "إشعار سداد القسط المدرسي مع إيصال رقمي", tag: "مالية" },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-right text-xs font-bold transition ${
                        selectedTemplate === tpl.id
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span>{tpl.title}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-semibold">
                        {tpl.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => onNavigateToView("guardians")}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isArabic ? "فتح وحدة التواصل الكاملة" : "Open Communication Hub"}
                </button>
              </div>
            </div>

            {/* Smartphone Interactive Mockup (WhatsApp) */}
            <div className="relative mx-auto w-full max-w-[380px]">
              <div className="overflow-hidden rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 shadow-2xl">
                {/* Phone Speaker & Camera Notch */}
                <div className="relative h-6 bg-slate-800 flex items-center justify-center">
                  <div className="h-2 w-16 rounded-full bg-slate-700" />
                </div>

                {/* WhatsApp App Header */}
                <div className="bg-[#075E54] px-4 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-extrabold text-[#075E54]">
                      MB
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight flex items-center gap-1">
                        ثانوية محمد بلخير — البيض
                        <CheckCircle2 className="h-3 w-3 text-emerald-300 inline" />
                      </h4>
                      <p className="text-[10px] text-emerald-100/80">حساب موثق · Mohammed Belkheir Secondary School (البيض 32)</p>
                    </div>
                  </div>
                  <Phone className="h-4 w-4 text-emerald-100" />
                </div>

                {/* WhatsApp Chat Background & Bubbles */}
                <div className="h-[380px] overflow-y-auto bg-[#E5DDD5] p-3.5 space-y-3 font-body text-xs">
                  {/* System date pill */}
                  <div className="text-center">
                    <span className="rounded-md bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-slate-500 shadow-xs">
                      اليوم · ثانوية محمد بلخير البيض
                    </span>
                  </div>

                  {/* Dynamic Template Message */}
                  {selectedTemplate === 0 && (
                    <div className="ml-auto max-w-[85%] rounded-lg bg-[#DCF8C6] p-3 text-slate-900 shadow-xs text-right">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 mb-1">
                        <Bell className="h-3 w-3" />
                        <span>إشعار غياب فوري — ثانوية محمد بلخير البيض</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        السيد(ة) الولي المحترم،
                        <br />
                        نعلمكم بأن التلميذة <strong>أمل بن يحيى</strong> (3AS علوم تجريبية - فوج 02) بثانوية محمد بلخير البيض تغيبت اليوم عن حصة <strong>العلوم الطبيعية (08:00 - 10:00)</strong>.
                      </p>
                      <div className="mt-2 rounded bg-white/70 p-2 text-[10px] text-slate-600">
                        يرجى تبرير الغياب أو التواصل مع مستشار التوجيه بثانوية محمد بلخير البيض.
                      </div>
                      <div className="mt-1 flex justify-end items-center gap-1 text-[9px] text-slate-400">
                        <span>08:15</span>
                        <CheckCircle2 className="h-3 w-3 text-blue-500" />
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 1 && (
                    <div className="ml-auto max-w-[85%] rounded-lg bg-[#DCF8C6] p-3 text-slate-900 shadow-xs text-right">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 mb-1">
                        <FileCheck className="h-3 w-3" />
                        <span>استدعاء اختبار البكالوريا التجريبي — ثانوية محمد بلخير</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        السيد(ة) الولي المحترم،
                        <br />
                        تم إصدار جدول اختبارات البكالوريا التجريبية للتلميذة <strong>أمل</strong> بثانوية محمد بلخير — ولاية البيض. تبدأ الاختبارات يوم الأحد 18 ماي الساعة 08:00 في القاعة رقم 04.
                      </p>
                      <div className="mt-2 rounded bg-white/70 p-2 text-[10px] text-slate-600 font-semibold flex items-center justify-between">
                        <span>جدول البكالوريا التجريبي الرسمي PDF</span>
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="mt-1 flex justify-end items-center gap-1 text-[9px] text-slate-400">
                        <span>10:30</span>
                        <CheckCircle2 className="h-3 w-3 text-blue-500" />
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 2 && (
                    <div className="ml-auto max-w-[85%] rounded-lg bg-[#DCF8C6] p-3 text-slate-900 shadow-xs text-right">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-1">
                        <CreditCard className="h-3 w-3" />
                        <span>إيصال سداد — ثانوية محمد بلخير البيض</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        نشكركم على تسديد مستحقات التسجيل والكتب المدرسية بمبلغ <strong>28,000 دج</strong> بثانوية محمد بلخير البيض.
                      </p>
                      <div className="mt-2 rounded bg-white/70 p-2 text-[10px] text-slate-700">
                        رقم الإيصال: <strong>#MB-ELBAYADH-2026-0842</strong>
                        <br />
                        حالة الحساب: <strong>مسدد بالكامل ومطابق</strong>
                      </div>
                      <div className="mt-1 flex justify-end items-center gap-1 text-[9px] text-slate-400">
                        <span>أمس 16:45</span>
                        <CheckCircle2 className="h-3 w-3 text-blue-500" />
                      </div>
                    </div>
                  )}

                  {/* Parent Reply Bubble */}
                  <div className="mr-auto max-w-[80%] rounded-lg bg-white p-3 text-slate-900 shadow-xs text-right">
                    <p className="text-xs leading-relaxed">
                      "شكراً جزيلاً، تم الاطلاع ومتابعة الأمر فوراً."
                    </p>
                    <div className="mt-1 flex justify-start text-[9px] text-slate-400">
                      <span>08:22</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Input Footer */}
                <div className="bg-slate-100 p-2 flex items-center gap-2 border-t border-slate-200">
                  <div className="flex-1 rounded-full bg-white px-3 py-1.5 text-xs text-slate-400 text-right">
                    كتابة رد فوري...
                  </div>
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#075E54] text-white">
                    <Send className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 4: ALGERIAN CURRICULUM & STREAMS DIRECTORY */}
      {/* ---------------------------------------------------- */}
      <section id="curriculum" className="border-t border-slate-200 bg-slate-50 px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-700 mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{isArabic ? "المنهاج الرسمي لوزارة التربية الوطنية" : "Algerian Ministry of Education Programs"}</span>
              <span className="text-slate-300">·</span>
              <span>Baccalaureate Streams Matrix</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
              {isArabic ? (
                <>
                  معاملات وحصص رسمية ومحسوبة،
                  <br />
                  <span className="text-teal-600">مهيأة لجميع شعب التعليم الثانوي الجزائري.</span>
                </>
              ) : (
                <>
                  Official coefficients & weekly allocations,
                  <br />
                  <span className="text-teal-600">calibrated for all Algerian secondary school streams.</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              {isArabic
                ? "لا داعي لإعادة إدخال المعاملات وساعات الحصص يدوياً. يحتوي EduPulse على المصفوفة الرسمية لجميع شعب البكالوريا: علوم تجريبية، رياضيات، تقني رياضي، تسيير واقتصاد، آداب وفلسفة، ولغات أجنبية."
                : "Zero manual setup required. Pre-loaded with official ministerial coefficients, weekly class hours, and exam durations across all secondary branches and common cores."}
            </p>
          </div>

          {/* Stream Selector Buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-2">
            {Object.entries(STREAM_DETAILS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setSelectedStreamKey(key)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-xs ${
                  selectedStreamKey === key
                    ? "bg-teal-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50"
                }`}
              >
                <span>{isArabic ? item.titleAr : item.titleEn}</span>
              </button>
            ))}
          </div>

          {/* Course Matrix Table Card */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isArabic ? activeStream.titleAr : activeStream.titleEn}
                </h3>
                <p className="text-xs text-slate-500">{activeStream.tag}</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <span className="rounded-lg bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1">
                  مجموع المعاملات: {activeStream.totalCoeff}
                </span>
                <span className="rounded-lg bg-slate-100 text-slate-800 px-2.5 py-1">
                  الساعات الأسبوعية: {activeStream.weeklyHours} س
                </span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                    <th className="pb-3 pr-2">المادة</th>
                    <th className="pb-3 px-3">الاسم بالإنجليزية</th>
                    <th className="pb-3 px-3 text-center">المعامل الرسمي</th>
                    <th className="pb-3 px-3 text-center">الحجم الأسبوعي</th>
                    <th className="pb-3 px-3 text-center">مدة امتحان البكالوريا</th>
                    <th className="pb-3 pl-2 text-center">وزن المادة من المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeStream.courses.map((c, i) => {
                    const weightPct = Math.round((c.coeff / activeStream.totalCoeff) * 100);
                    return (
                      <tr key={i} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 pr-2 font-bold text-slate-900">{c.subjectAr}</td>
                        <td className="py-3 px-3 text-slate-500">{c.subjectEn}</td>
                        <td className="py-3 px-3 text-center font-black text-teal-700">{c.coeff}</td>
                        <td className="py-3 px-3 text-center text-slate-700">{c.hours} ساعات</td>
                        <td className="py-3 px-3 text-center text-slate-600">{c.examHours}</td>
                        <td className="py-3 pl-2 text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-bold text-slate-800">{weightPct}%</span>
                            <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-teal-600 rounded-full" style={{ width: `${weightPct}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>* مطابق لمنشورات المفتشية العامة للبيداغوجيا بوزارة التربية الوطنية الجزائرية</span>
              <button
                onClick={() => onNavigateToView("subjects")}
                className="font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                {isArabic ? "فتح مكتبة المواد والمنهاج" : "Open Curriculum Library"}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 5: VISUAL WORKFLOW BLUEPRINTS & AUTOMATION */}
      {/* ---------------------------------------------------- */}
      <section id="automation" className="border-t border-slate-200 bg-white px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-bold text-violet-700 mb-4">
                <Cpu className="h-3.5 w-3.5" />
                <span>{isArabic ? "مخططات سير العمل الذكية" : "Visual Workflow Blueprints"}</span>
                <span className="text-slate-300">·</span>
                <span>Automated School Operations</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
                {isArabic ? (
                  <>
                    أتمتة ذكية توفر 15 ساعة
                    <br />
                    <span className="text-violet-600">من الروتين الإداري أسبوعياً.</span>
                  </>
                ) : (
                  <>
                    Automate repetitive tasks,
                    <br />
                    <span className="text-violet-600">saving 15+ hours of administrative time weekly.</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {isArabic
                  ? "ابنِ قواعد تشغيل مخصصة دون كتابة كود برمجى: عند تسجيل تلميذ جديد، يتم التحقق تلقائياً من معدل الشهادة، تعيين الفوج المناسب، إرسال جدول الحصص للأولياء عبر واتساب، وتنبيه الأستاذ المنسق."
                  : "Design visual standard operating procedures without code: auto-route admissions, dispatch immediate WhatsApp notifications, alert teachers to attendance gaps, and trigger remedial workflows."}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={runWorkflowDemo}
                  disabled={workflowRunning}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {workflowRunning
                    ? (isArabic ? "جاري تنفيذ الأتمتة..." : "Running Automation...")
                    : (isArabic ? "تشغيل تجربة الأتمتة الحية" : "Test Live Blueprint")}
                </button>
              </div>
            </div>

            {/* Workflow Diagram Interactive Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-xs font-extrabold text-slate-800">
                  مخطط: تسجيل طالب جديد وتوجيهه لشعبة البكالوريا
                </span>
                <span className="rounded bg-violet-100 text-violet-800 px-2 py-0.5 text-[10px] font-bold">
                  Blueprint نشط
                </span>
              </div>

              {/* Connected Nodes */}
              <div className="mt-6 space-y-4">
                {/* Node 1: Trigger */}
                <div
                  className={`rounded-xl border p-3.5 transition ${
                    workflowProgress >= 1
                      ? "border-emerald-500 bg-white shadow-xs"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        1
                      </span>
                      <span className="text-xs font-bold text-slate-900">المُشغّل: استلام استمارة تسجيل عبر الإنترنت</span>
                    </div>
                    {workflowProgress >= 1 && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 mr-8">
                    طالب جديد: أمل بن يحيى · رغبة التوجيه: شعبة علوم تجريبية
                  </p>
                </div>

                {/* Node 2: Condition */}
                <div
                  className={`rounded-xl border p-3.5 transition ${
                    workflowProgress >= 2
                      ? "border-emerald-500 bg-white shadow-xs"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        2
                      </span>
                      <span className="text-xs font-bold text-slate-900">الشرط: معدل شهادة BEM &gt;= 14.00</span>
                    </div>
                    {workflowProgress >= 2 && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 mr-8">
                    معدل الطالبة: 17.20 / 20 · الشرط محقق بنجاح ✓
                  </p>
                </div>

                {/* Node 3: Action 1 */}
                <div
                  className={`rounded-xl border p-3.5 transition ${
                    workflowProgress >= 3
                      ? "border-emerald-500 bg-white shadow-xs"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                        3
                      </span>
                      <span className="text-xs font-bold text-slate-900">الإجراء: إنشاء رقم الطالب وتعيين الفوج 3AS-SC-02</span>
                    </div>
                    {workflowProgress >= 3 && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 mr-8">
                    توليد ملف الطالب الشامل في قاعدة البيانات المحلية
                  </p>
                </div>

                {/* Node 4: Action 2 */}
                <div
                  className={`rounded-xl border p-3.5 transition ${
                    workflowProgress >= 4
                      ? "border-emerald-500 bg-white shadow-xs"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        4
                      </span>
                      <span className="text-xs font-bold text-slate-900">الإجراء: إرسال بطاقة الترحيب والجدول عبر واتساب للأولياء</span>
                    </div>
                    {workflowProgress >= 4 && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 mr-8">
                    تم إرسال الرسالة إلى: 0550 12 34 56 (تم التسليم بنجاح)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 6: ROLE-BASED SELF-SERVICE PORTALS */}
      {/* ---------------------------------------------------- */}
      <section id="roles" className="border-t border-slate-200 bg-slate-50 px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isArabic ? "بوابات رقمية مخصصة لكل دور" : "Dedicated Role-Based Portals"}</span>
              <span className="text-slate-300">·</span>
              <span>Granular Access Boundaries</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
              {isArabic ? (
                <>
                  لكل دور صلاحياته،
                  <br />
                  <span className="text-rose-600">بوابات آمنة للمدير، الأستاذ، الطالب، وولي الأمر.</span>
                </>
              ) : (
                <>
                  Granular permissions for every stakeholder,
                  <br />
                  <span className="text-rose-600">safe portals for principals, teachers, students, and guardians.</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              {isArabic
                ? "لا يرى الطالب الدفاتر المالية للمدرسة، ولا يحتاج الأستاذ لتغيير إعدادات الخادم. يوفر EduPulse مساحات عمل مستقلة تماماً تلبي احتياجات كل مستخدم دون فوضى أو تسريب للبيانات."
                : "Students don't see the tuition ledger, and teachers aren't distracted by system settings. Clean, isolated portals designed for each specific responsibility."}
            </p>
          </div>

          {/* 4 Portal Switchers */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: "professor", titleAr: "مركز قرار الأستاذ", titleEn: "Professor Cockpit", desc: "تخطيط الحصص، تقييم الفهم، وبناء الأفواج" },
              { id: "student", titleAr: "بوابة الطالب الذاتية", titleEn: "Student Portal", desc: "المراجعة المتباعدة، جدول الحصص، ومحاكي البكالوريا" },
              { id: "guardian", titleAr: "بوابة ولي الأمر", titleEn: "Guardian Portal", desc: "متابعة الحضور المباشر، الإيصالات، وتواصل الأساتذة" },
              { id: "director", titleAr: "لوحة مدير المؤسسة", titleEn: "Principal & Admin Hub", desc: "إحصائيات القبول، المالية، وتقارير الوزارة" },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setActivePortalRole(role.id as any)}
                className={`rounded-xl p-4 text-right transition border ${
                  activePortalRole === role.id
                    ? "border-rose-500 bg-white shadow-sm ring-2 ring-rose-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="block text-xs font-bold text-slate-900">{role.titleAr}</span>
                <span className="mt-1 block text-[10px] text-slate-500">{role.desc}</span>
              </button>
            ))}
          </div>

          {/* Portal Live Preview */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {activePortalRole === "professor" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      معاينة: مركز قرار الأستاذ (Professor Cockpit)
                    </span>
                  </div>
                  <button
                    onClick={() => onEnterWorkspace("teacher")}
                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
                  >
                    دخول مساحة الأستاذ
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">مخطط الحصة سداسي المراحل</span>
                    <p className="mt-1 text-slate-500">استرجاع أولي (5د) · نمذجة صريحة (15د) · أمثلة محلولة (15د) · تذكرة خروج (10د)</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">باني الأفواج الذكي</span>
                    <p className="mt-1 text-slate-500">توزيع الطلاب وفق مهارات BEM وتفادي تكتل صعوبات التعلم في فوج واحد</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">توصيات العلوم المعرفية</span>
                    <p className="mt-1 text-slate-500">اقتراحات مستندة إلى أبحاث Sweller و Roediger لتخفيف العبء الذهني</p>
                  </div>
                </div>
              </div>
            )}

            {activePortalRole === "student" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      معاينة: بوابة الطالب ومحاكي البكالوريا
                    </span>
                  </div>
                  <button
                    onClick={() => onEnterWorkspace("student")}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    دخول مساحة الطالب
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">طابور التذكر المتباعد اليومي</span>
                    <p className="mt-1 text-slate-500">8 بطاقات مراجعة مجدولة اليوم في الفيزياء والعلوم وفق خوارزمية SM-2</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">محاكي معدل البكالوريا</span>
                    <p className="mt-1 text-slate-500">تعديل علامات المواد ورؤية تأثيرها المباشر على معدل النجاح والملاحظة</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">شجرة الكفاءات والمفاهيم الخاطئة</span>
                    <p className="mt-1 text-slate-500">متابعة إتقان مفاهيم المنهاج الجزائري وتشخيص الثغرات المعرفية</p>
                  </div>
                </div>
              </div>
            )}

            {activePortalRole === "guardian" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-rose-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      معاينة: بوابة ولي الأمر (Guardian Portal)
                    </span>
                  </div>
                  <button
                    onClick={() => onEnterWorkspace("guardian")}
                    className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
                  >
                    دخول مساحة الولي
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">متابعة الحضور المباشر</span>
                    <p className="mt-1 text-slate-500">إشعار فوري عند دخول المؤسسة أو تسجيل أي غياب مع إمكانية التبرير</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">كشوف النقاط والإيصالات</span>
                    <p className="mt-1 text-slate-500">تحميل مباشر لكشف النقاط الفصلي وإيصالات الدفع الرسمية بصيغة PDF</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">ملاحظات الأساتذة التربوية</span>
                    <p className="mt-1 text-slate-500">اطلاع دائم على تقييم المعلمين لتقدم التلميذ وتوصيات التحسين</p>
                  </div>
                </div>
              </div>
            )}

            {activePortalRole === "director" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-blue-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      معاينة: لوحة مدير المؤسسة والإدارة العامة
                    </span>
                  </div>
                  <button
                    onClick={() => onEnterWorkspace("admin")}
                    className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                  >
                    دخول مساحة الإدارة
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">إدارة مسار القبول والتسجيل</span>
                    <p className="mt-1 text-slate-500">متابعة أعداد المسجلين في كل شعبة وإدارة الطاقة الاستيعابية للأفواج</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">المالية والأقساط المدرسية</span>
                    <p className="mt-1 text-slate-500">دفتر مقبوضات دقيق، تتبع المتأخرات، وإصدار الإيصالات الرسمية بضغطة زر</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-800">تصدير القوائم الرسمية</span>
                    <p className="mt-1 text-slate-500">تصدير قوائم الطلاب والمعلمين وفق معايير مديريات التربية الوطنية</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 7: ZIA-STYLE EDUCATIONAL INTELLIGENCE & RESEARCH */}
      {/* ---------------------------------------------------- */}
      <section id="assistant" className="border-t border-slate-200 bg-white px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isArabic ? "ذكاء أكاديمي مؤسس على الأبحاث" : "Evidence-Grounded Intelligence"}</span>
                <span className="text-slate-300">·</span>
                <span>Zia & Cognitive Science</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
                {isArabic ? (
                  <>
                    قرارات تعليمية قائمة على الأدلة،
                    <br />
                    <span className="text-amber-600">لا تخمينات ولا نظريات تعليمية بائدة.</span>
                  </>
                ) : (
                  <>
                    Evidence-informed pedagogy,
                    <br />
                    <span className="text-amber-600">grounded in peer-reviewed cognitive science.</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {isArabic
                  ? "استبدل خرافات 'أنماط التعلم' بأبحاث الذاكرة والاسترجاع المعزز. يحلل EduPulse صعوبات الطلاب ويقترح على الأستاذ تدابير عملية مستندة إلى دراسات محكمة في علوم الإدراك (Roediger & Karpicke 2006 · Sweller 1988)."
                  : "Ditch debunked learning styles myths. EduPulse equips educators with actionable intervention cues grounded in cognitive load theory, retrieval practice, and spaced recall research."}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>ممارسة الاسترجاع (Retrieval Practice):</strong> أسئلة تنشيط قصيرة في بداية الحصة تثبت المفاهيم 3 أضعاف القراءة السلبية.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>نظرية العبء الذهني (Sweller):</strong> أمثلة محلولة متدرجة (Faded Worked Examples) لحل المسائل الفيزيائية المعقدة.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>تكاملات MCP العلمية:</strong> ربط مع LobbyVoices و OpenScience للوصول الفوري للأوراق البحثية التربوية.
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => onNavigateToView("research_studio")}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700"
                >
                  <Search className="h-4 w-4" />
                  {isArabic ? "فتح أستوديو البحث وMCP" : "Open Research & MCP Studio"}
                </button>
              </div>
            </div>

            {/* Cognitive Science Mockup Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-xs font-extrabold text-slate-800">
                  نظام التنبيه البيداغوجي المبكر (Zia Early Warning)
                </span>
                <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                  تحديث مباشر
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-amber-900">تنبيه عبء ذهني زائد في مادة الفيزياء</h4>
                  </div>
                  <p className="mt-1.5 text-xs text-amber-800/90 leading-relaxed">
                    أظهر اختبار الفصل الأخير انخفاضاً بنسبة 28% في حل التمارين غير المألوفة لوحدة 'الظواهر الكهربائية'.
                  </p>
                  <div className="mt-2.5 rounded bg-white p-2.5 border border-amber-200 text-xs text-slate-700">
                    <span className="font-bold text-amber-900">الإجراء الموصى به علمياً:</span>
                    <p className="mt-1 text-[11px] text-slate-600">
                      تطبيق استراتيجية الأمثلة المحلولة تدريجياً (Faded Worked Examples) وفقاً لبحث Sweller (1988) لتفكيك المسألة قبل إعطاء تمرين مفتوح.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-emerald-900">معدل الاحتفاظ في مادة علوم الطبيعة: 91%</h4>
                  </div>
                  <p className="mt-1 text-xs text-emerald-800/90">
                    أثبتت المراجعة المتباعدة المجدولة نجاحها في تثبيت مصطلحات علم المناعة لدى 86% من طلاب الفوج.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 8: DATA SOVEREIGNTY & LOCAL-FIRST TRUST */}
      {/* ---------------------------------------------------- */}
      <section id="local" className="border-t border-slate-200 bg-slate-50 px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 mb-4">
              <Lock className="h-3.5 w-3.5" />
              <span>{isArabic ? "أمان المؤسسة وسيادة البيانات" : "Data Sovereignty & Local-First Privacy"}</span>
              <span className="text-slate-300">·</span>
              <span>No Vendor Lock-In</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl font-display leading-[1.15]">
              {isArabic ? (
                <>
                  بيانات مؤسستك ملك لك،
                  <br />
                  <span className="text-slate-800">تعمل بدون إنترنت، مشفرة، وقابلة للتصدير فوراً.</span>
                </>
              ) : (
                <>
                  Your school data belongs to you,
                  <br />
                  <span className="text-slate-800">offline-ready, encrypted, and instantly exportable.</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              {isArabic
                ? "صُمم EduPulse ليعمل بكفاءة حتى عند انقطاع شبكة الإنترنت. بيانات طلابك، سجلات الحضور، والإيصالات المالية مخزنة محلياً ويمكن تصديرها بضغطة زر إلى Excel أو PDF دون أي قفل تجاري."
                : "Built with a local-first architecture that functions even when school internet drops. All records remain in your custody with zero lock-in and one-click JSON/Excel/PDF export."}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Laptop className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{isArabic ? "محلي أولاً (Local-First)" : "Local-First Architecture"}</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isArabic
                  ? "تسجيل الحضور والدرجات فوري بدون انتظار تحميل الصفحات، مع مزامنة ذكية عند عودة الاتصال."
                  : "Zero loading spinners. Attendance marking and grade entries happen with sub-millisecond local speed."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{isArabic ? "تصدير فوري بدون قفل" : "Instant Open Export"}</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isArabic
                  ? "صدّر قوائم الطلاب، كشوف النقاط، والتقارير المالية بصيغ Excel الرسمية المتوافقة مع الإدارة الجزائرية."
                  : "Export student rolls, grade sheets, and tuition journals in Algerian administrative Excel formats anytime."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-50 text-purple-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{isArabic ? "عزل بيانات المؤسسة" : "Tenant Isolation"}</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isArabic
                  ? "فصل أمني كامل بين صلاحيات المعلم، التلميذ، وولي الأمر لضمان سرية السجلات الحساسة."
                  : "Role-based cryptographic boundaries ensure no unauthorized access across students, teachers, and admins."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 9: ZOHO-STYLE CALL TO ACTION BANNER */}
      {/* ---------------------------------------------------- */}
      <section className="border-t border-slate-200 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 px-6 py-20 text-white sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold text-blue-200 backdrop-blur-sm mb-6">
            <span>{isArabic ? "جاهز للانطلاق بالموسم الدراسي الجديد" : "Ready for the 2026/2027 Academic Year"}</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl font-display leading-[1.15]">
            {isArabic ? (
              <>
                ارتقِ بإدارة مؤسستك التعليمية اليوم
                <br />
                <span className="text-blue-300">مع نظام التشغيل الأكثر تطوراً في الجزائر.</span>
              </>
            ) : (
              <>
                Upgrade your school management today
                <br />
                <span className="text-blue-300">with Algeria’s most advanced education OS.</span>
              </>
            )}
          </h2>
          <p className="mt-5 text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {isArabic
              ? "انضم إلى بيئة EduPulse المتكاملة. ابدأ بتجربة الأدوار، إدارة الأفواج، ومحاكي البكالوريا بنقرة واحدة."
              : "Launch your institutional workspace. Experience role-based cockpits, official curriculum planning, and BAC preparation tools."}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onEnterWorkspace("admin")}
              className="rounded-xl bg-white px-8 py-4 text-sm font-extrabold text-blue-900 shadow-lg transition hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isArabic ? "الدخول لمساحة المؤسسة الآن" : "Launch Institution Workspace"}
              <ArrowUpRight className="inline h-4 w-4 mr-1" />
            </button>
            <button
              onClick={() => onEnterWorkspace("teacher")}
              className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {isArabic ? "تجربة مركز قرار الأستاذ" : "Open Professor Cockpit"}
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 10: ZOHO-STYLE CORPORATE FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-slate-900 px-6 py-16 text-slate-400 text-xs sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Column 1: Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-white font-display text-xl font-bold">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white font-black text-sm">
                  EP
                </span>
                <span>EduPulse Algeria</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400 max-w-sm">
                نظام التشغيل المدرسي المتكامل للمؤسسات التعليمية الجزائرية. مبني وفق مناهج وزارة التربية الوطنية، علوم الإدراك، وجسور البحث العلمي المفتوح.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-slate-300 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-md px-2 py-0.5">
                  البيض (32) · ثانوية محمد بلخير
                </span>
                <span>·</span>
                <span className="text-slate-400">وهران (31)</span>
                <span>·</span>
                <span className="text-slate-400">الجزائر (16)</span>
                <span>·</span>
                <span className="text-amber-300 font-semibold">تطوير: نور محمد عبد الصمد · Developed by Nour Mohammed Abdessamed</span>
              </div>
            </div>

            {/* Column 2: Modules */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">الوحدات الأساسية</h4>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigateToView("registration")} className="hover:text-white transition">مسار القبول والتسجيل</button></li>
                <li><button onClick={() => onNavigateToView("professor")} className="hover:text-white transition">مركز قرار الأستاذ</button></li>
                <li><button onClick={() => onNavigateToView("student_intel")} className="hover:text-white transition">ذكاء الطالب والبكالوريا</button></li>
                <li><button onClick={() => onNavigateToView("attendance")} className="hover:text-white transition">الجدولة والحضور</button></li>
                <li><button onClick={() => onNavigateToView("payments")} className="hover:text-white transition">المالية والأقساط</button></li>
              </ul>
            </div>

            {/* Column 3: Algerian Streams */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">الشعب الرسمية</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-white transition">علوم تجريبية (3AS)</span></li>
                <li><span className="hover:text-white transition">رياضيات (3AS)</span></li>
                <li><span className="hover:text-white transition">تقني رياضي (4 فروع)</span></li>
                <li><span className="hover:text-white transition">تسيير واقتصاد</span></li>
                <li><span className="hover:text-white transition">آداب وفلسفة ولغات</span></li>
              </ul>
            </div>

            {/* Column 4: Trust & Research */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">الأدلة والمصادر</h4>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigateToView("research_studio")} className="hover:text-white transition">أستوديو أبحاث MCP</button></li>
                <li><span className="hover:text-white transition">ممارسة الاسترجاع (2006)</span></li>
                <li><span className="hover:text-white transition">نظرية العبء الذهني (1988)</span></li>
                <li><span className="hover:text-white transition">سيادة البيانات المحلية</span></li>
                <li><span className="hover:text-white transition">شروط الخصوصية والأمان</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-8 text-[11px] text-slate-400">
            <p>© 2026 EduPulse Algeria · ثانوية محمد بلخير — ولاية البيض (32) · تطوير: <strong>نور محمد عبد الصمد (Nour Mohammed Abdessamed)</strong>.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-emerald-400 font-medium">البيض · وهران · الجزائر</span>
              <span>·</span>
              <span>العربية أولاً · English Ready</span>
              <span>·</span>
              <span>سيادة تعليمية ورقمنة وطنية</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ZohoEducationLanding;

