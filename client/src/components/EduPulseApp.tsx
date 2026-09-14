/**
 * EduPulse design reminder: exact supplied cinematic video, Instrument Serif,
 * Inter body font, deep midnight navy and thin liquid-glass signature. This
 * component extends that system into an Arabic-first local education product.
 */
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Binary,
  Brain,
  BrainCircuit,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CirclePlus,
  ClipboardCheck,
  Copy,
  Database,
  Download,
  FileText,
  Globe,
  GraduationCap,
  MessageCircleQuestion,
  PackageOpen,
  Palette,
  Phone,
  LayoutDashboard,
  LibraryBig,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  ReceiptText,
  Radar,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UserRoundPlus,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { KnowledgeAdministration, PublicKnowledgeAgent } from "@/components/KnowledgePanels";
import { ParentPolicyChat } from "@/components/ParentPolicyChat";
import { SchoolBrandPanel, readSchoolBrand } from "@/components/SchoolBrandPanel";
import { AccountPortal } from "@/components/AccountPortal";
import { ALGERIA_EDUCATION_STAGES } from "@shared/educationStages";
import { EducatorCRMPanel } from "./EducatorCRMPanel";
import { VividDashboard } from "./VividDashboard";
import { PostHeroModuleStrip } from "./PostHeroModuleStrip";
import AboutSection from "./AboutSection";
import ZohoEducationLanding from "./ZohoEducationLanding";
import { StudentInformationPanel } from "./StudentInformationPanel";
import { GradebookPanel } from "./GradebookPanel";
import { StudentPortalPanel } from "@/components/StudentPortalPanel";
import { GuardianPortalPanel } from "@/components/GuardianPortalPanel";
import { WhatsAppDesktopPanel } from "@/components/WhatsAppDesktopPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LocalSearchOverlay } from "@/components/LocalSearchOverlay";
import { escapeReceiptHtml, formatReceiptContent } from "@/lib/receiptFormatting";
import { isDesktopRuntime, saveDesktopBackup } from "@/lib/desktopRuntime";
import { loadDesktopWorkspace, saveDesktopWorkspace } from "@/lib/desktopRecords";
import { buildWeeklyProgressMessage } from "@/lib/weeklyProgress";
import { GoogleWorkspaceHub } from "./GoogleWorkspaceHub";
import { StudentSupportEvaluationPanel } from "./StudentSupportEvaluationPanel";
import { InstitutionTeamPanel } from "./InstitutionTeamPanel";
import AiConsolePanel from "./creator/AiConsolePanel";
import CreatorStudioPanel from "./creator/CreatorStudioPanel";
import { ProfessorWorkspace } from "./ProfessorWorkspace";
import { StudentIntelligencePanel } from "./StudentIntelligencePanel";
import { ResearchStudioPanel } from "./ResearchStudioPanel";
import { StudivexaHub } from "./studivexa/StudivexaHub";
import { BookAndDocumentDownloader } from "./academic/BookAndDocumentDownloader";
import { CollegeScorecardGuidance } from "./academic/CollegeScorecardGuidance";
import { CurriculumTemplateStudio } from "./academic/CurriculumTemplateStudio";
import { WolframStemSolver } from "./academic/WolframStemSolver";
import { PersonalityProfiler } from "./academic/PersonalityProfiler";
import { OsfResearchGateway } from "./academic/OsfResearchGateway";
import { CambridgeEnglishStudio } from "./academic/CambridgeEnglishStudio";
import { PhoneVerificationModal } from "./auth/PhoneVerificationModal";
import { AlgerianOfficialRegistrationForm, type AlgerianStudentRegistrationData } from "./academic/AlgerianOfficialRegistrationForm";

type Screen = "landing" | "access" | "workspace";
type Role = "admin" | "finance_admin" | "registrar" | "teacher" | "counsellor" | "student" | "guardian";
type Language = "ar" | "en";
type Subject = { id: string; name: string; nameAr: string; group: string };
type Student = { id: string; name: string; nameAr: string; grade: string; guardian: string; phone: string; level: string; attendance: number; subjects: string[]; status: "Active" | "New" | "Review"; guardianConsent?: boolean; phoneVerified?: boolean; whatsappOptOut?: boolean };
type Payment = { id: string; studentId: string; learner: string; amount: number; method: string; paidAt: string; state: "Paid" | "Balance due" };
type CefrAssessment = { id: string; studentId: string; level: string; speaking: number; listening: number; reading: number; writing: number; note: string; date: string };
type GuardianMessage = { id: string; studentId: string; subject: string; body: string; createdAt: string; copied: boolean };
type WhatsAppDelivery = { id: string; studentId: string; guardianPhone: string; status: "sent" | "failed"; createdAt: string; error?: string };
type LocalData = { students: Student[]; payments: Payment[]; assessments: CefrAssessment[]; messages: GuardianMessage[]; whatsappDeliveries: WhatsAppDelivery[] };

const DB_NAME = "edupulse-expanded-local";
const STORE_NAME = "education-workspace";
const DATA_KEY = "main";
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return <svg aria-label="EduPulse" role="img" viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="42" height="42" rx="13" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.55)"/><path d="M14 29c4-8 8-12 12-12 3 0 5 2 8 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M14 34c5-6 9-9 13-9 3 0 5 1 7 4" stroke="#B6F2E4" strokeWidth="2.5" strokeLinecap="round"/><circle cx="15" cy="16" r="2.5" fill="#F9D58A"/></svg>;
}
const ADMISSIONS_IMAGE = "/manus-storage/edupulse-admissions-desk_4d301878.jpg";
const LEARNING_IMAGE = "/manus-storage/edupulse-learning-room_8022d35a.jpg";

const SUBJECTS: Subject[] = [
  { id: "arabic", name: "Arabic Language", nameAr: "اللغة العربية", group: "Languages" },
  { id: "english", name: "English Language", nameAr: "اللغة الإنجليزية", group: "Languages" },
  { id: "french", name: "French Language", nameAr: "اللغة الفرنسية", group: "Languages" },
  { id: "amazigh", name: "Amazigh Language", nameAr: "اللغة الأمازيغية", group: "Languages" },
  { id: "mathematics", name: "Mathematics", nameAr: "الرياضيات", group: "STEM" },
  { id: "physics", name: "Physics", nameAr: "الفيزياء", group: "STEM" },
  { id: "chemistry", name: "Chemistry", nameAr: "الكيمياء", group: "STEM" },
  { id: "biology", name: "Biology & Natural Sciences", nameAr: "العلوم الطبيعية والأحياء", group: "STEM" },
  { id: "computer", name: "Computer Science", nameAr: "الإعلام الآلي", group: "STEM" },
  { id: "technology", name: "Technology & Engineering", nameAr: "التكنولوجيا والهندسة", group: "STEM" },
  { id: "history", name: "History", nameAr: "التاريخ", group: "Humanities" },
  { id: "geography", name: "Geography", nameAr: "الجغرافيا", group: "Humanities" },
  { id: "philosophy", name: "Philosophy", nameAr: "الفلسفة", group: "Humanities" },
  { id: "civics", name: "Civics", nameAr: "التربية المدنية", group: "Humanities" },
  { id: "islamic", name: "Islamic Education", nameAr: "التربية الإسلامية", group: "Humanities" },
  { id: "economics", name: "Economics & Management", nameAr: "الاقتصاد والتسيير", group: "Humanities" },
  { id: "art", name: "Visual Arts", nameAr: "التربية التشكيلية", group: "Enrichment" },
  { id: "music", name: "Music", nameAr: "التربية الموسيقية", group: "Enrichment" },
  { id: "pe", name: "Physical Education", nameAr: "التربية البدنية والرياضية", group: "Enrichment" },
  { id: "quran", name: "Quranic Studies", nameAr: "الدراسات القرآنية", group: "Enrichment" },
];

const initialData: LocalData = {
  students: [
    { id: "s-001", name: "Amal Benyahia", nameAr: "أمل بن يحيى", grade: "secondary", guardian: "Nadia Benyahia", phone: "+213 555 014 100", level: "B2", attendance: 94, subjects: ["arabic", "english", "french", "mathematics", "physics", "history"], status: "Active", guardianConsent: true, phoneVerified: true, whatsappOptOut: false },
    { id: "s-002", name: "Youssef Rahmani", nameAr: "يوسف الرحماني", grade: "middle", guardian: "Khaled Rahmani", phone: "+213 555 014 101", level: "B1", attendance: 88, subjects: ["arabic", "english", "mathematics", "biology", "computer"], status: "Active", guardianConsent: true, phoneVerified: true, whatsappOptOut: false },
    { id: "s-003", name: "Rania Cherif", nameAr: "رانيا شريف", grade: "primary", guardian: "Hana Cherif", phone: "+213 555 014 102", level: "A2", attendance: 76, subjects: ["arabic", "english", "french", "mathematics", "art"], status: "Review", guardianConsent: false, phoneVerified: false, whatsappOptOut: false },
  ],
  payments: [
    { id: "p-001", studentId: "s-001", learner: "أمل بن يحيى", amount: 18000, method: "Cash", paidAt: "2026-08-20", state: "Paid" },
    { id: "p-002", studentId: "s-003", learner: "رانيا شريف", amount: 6000, method: "Bank transfer", paidAt: "2026-08-12", state: "Balance due" },
  ],
  assessments: [
    { id: "c-001", studentId: "s-001", level: "B2", speaking: 84, listening: 88, reading: 91, writing: 79, note: "Ready for academic writing focus and presentation practice.", date: "2026-08-18" },
    { id: "c-002", studentId: "s-002", level: "B1", speaking: 72, listening: 76, reading: 74, writing: 68, note: "Continue structured writing and vocabulary expansion.", date: "2026-08-16" },
  ],
  messages: [],
  whatsappDeliveries: [],
};

const roleInfo: Record<Role, { title: string; arabic: string; summary: string; icon: typeof ShieldCheck; accent: string }> = {
  admin: { title: "Administrator", arabic: "مدير المؤسسة", summary: "Registration, fees, records, roles, and institution health.", icon: ShieldCheck, accent: "text-amber-100" },
  teacher: { title: "Teacher", arabic: "المعلم", summary: "Cohorts, subjects, attendance, progress, and guardian drafts.", icon: GraduationCap, accent: "text-sky-100" },
  student: { title: "Student", arabic: "الطالب", summary: "A clear view of approved subjects, progress, reports, and messages.", icon: UserRoundCheck, accent: "text-emerald-100" },
  guardian: { title: "Guardian", arabic: "ولي الأمر", summary: "Linked learner progress, attendance, reports, and approved communication.", icon: UsersRound, accent: "text-violet-100" },
  finance_admin: { title: "Finance administrator", arabic: "مسؤول المالية", summary: "Invoices, payments, refunds, exports, and commerce reporting.", icon: WalletCards, accent: "text-amber-100" },
  registrar: { title: "Registrar", arabic: "مسجل المؤسسة", summary: "Learner registration, records, and education-stage data.", icon: UserRoundPlus, accent: "text-cyan-100" },
  counsellor: { title: "Counsellor", arabic: "المستشار", summary: "Authorized learning-support reviews, follow-up, and care notes.", icon: BrainCircuit, accent: "text-rose-100" },
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadData(): Promise<LocalData> {
  if (isDesktopRuntime()) return { ...initialData, ...(await loadDesktopWorkspace<Partial<LocalData>>() ?? {}) };
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(DATA_KEY);
    request.onsuccess = () => resolve({ ...initialData, ...(request.result ?? {}) });
    request.onerror = () => reject(request.error);
  });
}

async function persistData(data: LocalData) {
  if (isDesktopRuntime()) { await saveDesktopWorkspace(data); return; }
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(data, DATA_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

function subjectName(id: string, language: Language) {
  const subject = SUBJECTS.find((item) => item.id === id);
  return language === "ar" ? subject?.nameAr ?? id : subject?.name ?? id;
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof BarChart3 }) {
  return <article className="surface-panel rounded-2xl p-5"><div className="mb-10 flex items-center justify-between"><span className="text-sm text-white/60">{label}</span><Icon className="h-4 w-4 text-white/40" /></div><p className="text-display text-5xl">{value}</p><p className="mt-3 text-xs text-white/50">{detail}</p></article>;
}

function SectionHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: ReactNode; copy?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/45">{eyebrow}</p><h2 className="text-display text-4xl leading-none sm:text-5xl">{title}</h2>{copy && <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">{copy}</p>}</div>{action}</div>;
}

function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "alert" | "blue" }) {
  const classes = { neutral: "border-white/15 bg-white/6 text-white/70", good: "border-emerald-200/25 bg-emerald-200/10 text-emerald-100", alert: "border-amber-200/25 bg-amber-200/10 text-amber-100", blue: "border-sky-200/25 bg-sky-200/10 text-sky-100" };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${classes[tone]}`}>{children}</span>;
}

type HexBadgeProps = { number: string; title: string; copy: string; icon: typeof Database };
function HexBadge({ number, title, copy, icon: Icon }: HexBadgeProps) {
  const hex = "polygon(25% 3%, 75% 3%, 98% 50%, 75% 97%, 25% 97%, 2% 50%)";
  return <article className="group relative flex min-h-[205px] items-center justify-center px-9 py-10 text-center transition duration-200 hover:-translate-y-1.5" style={{ clipPath: hex, background: "linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0.06) 42%, rgba(0,18,30,0.55))", filter: "drop-shadow(12px 16px 18px rgba(0,0,0,0.22))" }}>
    <div className="absolute inset-[2px] flex items-center justify-center overflow-hidden px-9 py-10" style={{ clipPath: hex, background: "linear-gradient(145deg, rgba(15,83,101,0.96), rgba(0,35,52,0.98))", boxShadow: "inset 8px 8px 18px rgba(255,255,255,0.08), inset -10px -12px 22px rgba(0,0,0,0.22)" }}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-amber-100/20" />
      <div className="relative"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-amber-100 shadow-[4px_4px_10px_rgba(0,0,0,0.22),inset_2px_2px_6px_rgba(255,255,255,0.12)]"><Icon className="h-4 w-4" /></div><p className="mt-3 text-[10px] font-semibold tracking-[0.22em] text-amber-100/70">{number}</p><h3 className="text-display mt-1 text-2xl leading-tight text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-white/65">{copy}</p></div>
    </div>
  </article>;
}

function SisPillar({ icon: Icon, title, copy }: { icon: typeof Database; title: string; copy: string }) {
  return <article className="surface-panel rounded-2xl p-5"><Icon className="h-5 w-5 text-amber-100" /><h3 className="text-display mt-8 text-2xl text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{copy}</p></article>;
}

function buildReceiptMarkup(payment: Payment, student: Student | undefined, brand: ReturnType<typeof readSchoolBrand>) {
  const receipt = formatReceiptContent({
    schoolName: brand.name,
    receiptId: payment.id,
    studentName: student?.nameAr ?? payment.learner,
    guardianName: student?.guardian ?? "—",
    amount: payment.amount,
    method: payment.method,
    paidAt: payment.paidAt,
    logoDataUrl: brand.logoDataUrl,
  });
  const safeLogo = receipt.logoDataUrl && (/^data:image\/(png|jpeg|webp);base64,/i.test(receipt.logoDataUrl) || receipt.logoDataUrl.startsWith("/manus-storage/")) ? `<img src="${escapeReceiptHtml(receipt.logoDataUrl)}" alt="شعار المؤسسة" style="max-width:132px;max-height:72px;object-fit:contain" />` : "";
  const englishLabels: Record<string, string> = { "اسم الطالب": "Student", "ولي الأمر": "Guardian", "طريقة الدفع": "Payment method", "الحالة": "Status" };
  const rows = receipt.rows.map(([label, value]) => `<tr><td class="label"><span>${escapeReceiptHtml(label)}</span><small style="display:block;margin-top:3px;direction:ltr;text-align:right;color:#8a9ba0;font-size:11px">${englishLabels[label] ?? ""}</small></td><td>${escapeReceiptHtml(value)}</td></tr>`).join("");
  return `<main dir="rtl" lang="ar" style="box-sizing:border-box;width:100%;min-height:100%;padding:48px;background:#ffffff;color:#00364A;font-family:Arial,'Tahoma',sans-serif;text-align:right"><section style="display:flex;direction:rtl;justify-content:space-between;align-items:flex-start;gap:32px;border-bottom:2px solid #00364A;padding-bottom:24px"><div><div style="font:42px Georgia,serif;letter-spacing:-1px">${escapeReceiptHtml(receipt.schoolName)}</div><div style="font-size:13px;line-height:1.8;color:#58727c">سجل تعليمي محلي · PAYMENT RECEIPT · إيصال دفع</div>${safeLogo ? `<div style="margin-top:16px">${safeLogo}</div>` : ""}</div><div style="font-size:13px;line-height:2;color:#4a5e65;text-align:left;direction:rtl">رقم الإيصال / Receipt: ${escapeReceiptHtml(receipt.receiptNumber)}<br>تاريخ الدفع / Paid on: ${escapeReceiptHtml(receipt.paidAt)}<br>نوع العملية / Method: ${escapeReceiptHtml(receipt.rows[2]?.[1] ?? payment.method)}</div></section><div style="font:38px Georgia,serif;margin:36px 0;direction:rtl">${escapeReceiptHtml(receipt.amountLabel)}</div><table style="width:100%;border-collapse:collapse;direction:rtl;font-size:15px"><tbody>${rows}</tbody></table><p style="margin-top:40px;padding-top:20px;border-top:1px solid #e5edf0;font-size:12px;line-height:1.9;color:#60747c">تم إنشاء هذا الإيصال من مساحة EduPulse المحلية. / Generated locally by EduPulse. احتفظ بنسخة للرجوع إليها.</p></main>`;
}

export default function EduPulseApp() {
  const { user: authUser, loading: authLoading, logout: authLogout } = useAuth();
  const desktopRuntime = isDesktopRuntime();
  const membershipsQuery = trpc.auth.myMemberships.useQuery(undefined, { enabled: Boolean(authUser) && !desktopRuntime, retry: false });
  const [screen, setScreen] = useState<Screen>("landing");
  const [initialAuthTab, setInitialAuthTab] = useState<"login" | "register" | "magic-link" | "portals">("login");
  const [language, setLanguage] = useState<Language>("ar");
  const [role, setRole] = useState<Role>("admin");
  const [pendingRole, setPendingRole] = useState<Role>("admin");
  const [activeView, setActiveView] = useState("overview");
  const [data, setData] = useState<LocalData>(initialData);
  const [loading, setLoading] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [registration, setRegistration] = useState({ nameAr: "", name: "", guardian: "", phone: "", grade: "primary", subjects: ["arabic", "english", "mathematics"] });
  const [paymentForm, setPaymentForm] = useState({ studentId: "s-001", amount: "", method: "Cash" });
  const [message, setMessage] = useState("ولي الأمر الكريم، نشارككم ملخص تقدم الطالب هذا الأسبوع. الحضور جيد، ونوصي بمراجعة مهام القراءة قبل الحصة القادمة.");

  const isArabic = language === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const accountRole = useMemo<Role>(() => {
    const membershipRole = membershipsQuery.data?.[0]?.membership.role;
    if (membershipRole === "guardian") return "guardian";
    if (membershipRole === "student") return "student";
    if (membershipRole === "teacher") return "teacher";
    if (membershipRole === "finance_admin") return "finance_admin";
    if (membershipRole === "registrar") return "registrar";
    if (membershipRole === "counsellor") return "counsellor";
    if (membershipRole === "admin" || membershipRole === "owner") return "admin";
    return authUser?.role === "admin" ? "admin" : pendingRole;
  }, [authUser?.role, membershipsQuery.data, pendingRole]);
  useEffect(() => {
    if (authUser && (desktopRuntime || membershipsQuery.isSuccess)) { setRole(accountRole); setActiveView("overview"); }
  }, [accountRole, authUser, desktopRuntime, membershipsQuery.isSuccess]);
  const serverLearnersQuery = trpc.records.learners.useQuery(undefined, { enabled: Boolean(authUser) && !desktopRuntime && (["admin", "registrar", "teacher", "counsellor"].includes(accountRole)), retry: false });
  const serverPaymentsQuery = trpc.records.payments.useQuery(undefined, { enabled: Boolean(authUser) && !desktopRuntime && (["admin", "finance_admin"].includes(accountRole)), retry: false });
  const createLearnerMutation = trpc.records.createLearner.useMutation();
  const recordPaymentMutation = trpc.records.recordPayment.useMutation();
  const currentStudent = data.students[0] ?? { id: "", name: "", nameAr: "لا يوجد طالب مسجل بعد", grade: "—", guardian: "—", phone: "—", level: "—", attendance: 0, subjects: [], status: "New" as const };
  const learnerRecordInput = useMemo(() => ({ learnerId: currentStudent.id }), [currentStudent.id]);
  const serverAttendanceQuery = trpc.records.attendance.useQuery(learnerRecordInput, { enabled: Boolean(authUser) && !desktopRuntime && (["admin", "registrar", "teacher", "counsellor"].includes(accountRole)) && currentStudent.id.startsWith("learner_"), retry: false });
  const serverCefrQuery = trpc.records.cefr.useQuery(learnerRecordInput, { enabled: Boolean(authUser) && !desktopRuntime && (["admin", "registrar", "teacher", "counsellor"].includes(accountRole)) && currentStudent.id.startsWith("learner_"), retry: false });
  const selectedAssessment = data.assessments.find((assessment) => assessment.studentId === currentStudent.id) ?? data.assessments[0];
  const activeStudents = data.students.filter((student) => student.status === "Active").length;
  const balanceDue = data.payments.filter((payment) => payment.state === "Balance due").reduce((sum, payment) => sum + payment.amount, 0);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return [];
    const learners = data.students.map(student => {
      const subjects = student.subjects.map(id => `${subjectName(id, "ar")} ${subjectName(id, "en")}`).join(" ");
      const haystack = `${student.nameAr} ${student.name} ${student.guardian} ${student.phone} ${student.grade} ${student.level} ${subjects}`.toLocaleLowerCase();
      return { student, found: haystack.includes(query) };
    }).filter(item => item.found).map(item => ({ type: "student" as const, id: item.student.id, title: item.student.nameAr, meta: `${item.student.grade} · ${item.student.guardian} · CEFR ${item.student.level}`, destination: role === "student" ? "subjects" : "learners" }));
    const receipts = data.payments.filter(payment => `${payment.id} ${payment.learner} ${payment.method} ${payment.amount}`.toLocaleLowerCase().includes(query)).map(payment => ({ type: "payment" as const, id: payment.id, title: payment.learner, meta: `${payment.amount.toLocaleString("ar-DZ")} د.ج · ${payment.paidAt}`, destination: "payments" }));
    return [...learners, ...receipts].slice(0, 8);
  }, [data.payments, data.students, role, searchQuery]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  useEffect(() => {
    if (!authUser || desktopRuntime || !serverLearnersQuery.isSuccess) return;
    const serverStudents: Student[] = serverLearnersQuery.data.map((learner) => ({ id: learner.id, name: learner.name, nameAr: learner.nameAr, grade: learner.grade, guardian: "—", phone: learner.phone ?? "—", level: "—", attendance: 0, subjects: [], status: learner.status === "active" ? "Active" : learner.status === "archived" ? "Review" : "New" }));
    setData(current => ({ ...current, students: serverStudents }));
  }, [authUser, desktopRuntime, serverLearnersQuery.data, serverLearnersQuery.isSuccess]);

  useEffect(() => {
    if (!authUser || desktopRuntime || !serverAttendanceQuery.isSuccess) return;
    const records = serverAttendanceQuery.data;
    const attendance = records.length ? Math.round((records.filter(record => record.status === "present" || record.status === "late").length / records.length) * 100) : 0;
    setData(current => ({ ...current, students: current.students.map(student => student.id === currentStudent.id ? { ...student, attendance } : student) }));
  }, [authUser, currentStudent.id, desktopRuntime, serverAttendanceQuery.data, serverAttendanceQuery.isSuccess]);

  useEffect(() => {
    if (!authUser || desktopRuntime || !serverCefrQuery.isSuccess) return;
    const assessments: CefrAssessment[] = serverCefrQuery.data.map(assessment => ({ id: assessment.id, studentId: assessment.learnerId, level: assessment.level, speaking: assessment.speaking, listening: assessment.listening, reading: assessment.reading, writing: assessment.writing, note: assessment.note ?? "", date: new Date(assessment.assessedAt).toISOString().slice(0, 10) }));
    setData(current => ({ ...current, assessments }));
  }, [authUser, desktopRuntime, serverCefrQuery.data, serverCefrQuery.isSuccess]);

  useEffect(() => {
    if (!authUser || desktopRuntime || !serverPaymentsQuery.isSuccess) return;
    const serverPayments: Payment[] = serverPaymentsQuery.data.map((payment) => ({ id: payment.id, studentId: payment.learnerId, learner: data.students.find(student => student.id === payment.learnerId)?.nameAr ?? "—", amount: payment.amountMinor, method: payment.method, paidAt: new Date(payment.paidAt).toISOString().slice(0, 10), state: payment.status === "paid" ? "Paid" : "Balance due" }));
    setData(current => ({ ...current, payments: serverPayments }));
  }, [authUser, data.students, desktopRuntime, serverPaymentsQuery.data, serverPaymentsQuery.isSuccess]);

  useEffect(() => {
    if (data.students.length && !data.students.some(student => student.id === paymentForm.studentId)) setPaymentForm(current => ({ ...current, studentId: data.students[0].id }));
  }, [data.students, paymentForm.studentId]);

  useEffect(() => {
    loadData().then(setData).catch(() => toast.error("تعذر فتح السجل المحلي.")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (screen !== "workspace") return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen]);

  useEffect(() => {
    if (screen !== "workspace") return;
    const trigger = Array.from(document.querySelectorAll<HTMLDivElement>("header div")).find(element => element.textContent?.includes("بحث في السجل المحلي"));
    if (!trigger) return;
    const open = () => setSearchOpen(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
    };
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-label", "بحث في السجل المحلي");
    trigger.style.cursor = "pointer";
    trigger.addEventListener("click", open);
    trigger.addEventListener("keydown", onKey);
    return () => { trigger.removeEventListener("click", open); trigger.removeEventListener("keydown", onKey); };
  }, [screen]);

  const updateData = async (next: LocalData) => {
    setData(next);
    try { await persistData(next); } catch { toast.error("تعذر حفظ التغيير محليًا."); }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const enterWorkspace = (nextRole: Role = role) => {
    setPendingRole(nextRole);
    if (!authUser) { setScreen("access"); return; }
    const safeRole = accountRole === "guardian" ? "guardian" : accountRole === "student" ? "student" : accountRole === "teacher" ? "teacher" : nextRole === "student" ? "student" : accountRole;
    setRole(safeRole);
    setScreen("workspace");
    setActiveView("overview");
  };

  const openKnowledgeAdministration = () => {
    setPendingRole("admin");
    if (!authUser) { setScreen("access"); return; }
    if (accountRole !== "admin") { toast.error("تحتاج إلى صلاحية مدير المؤسسة لإدارة المصادر."); return; }
    setRole("admin");
    setActiveView("knowledge");
    setScreen("workspace");
  };

  const toggleSubject = (subject: string) => setRegistration((current) => ({ ...current, subjects: current.subjects.includes(subject) ? current.subjects.filter((item) => item !== subject) : [...current.subjects, subject] }));

  const submitRegistration = async (event: FormEvent) => {
    event.preventDefault();
    if (!registration.nameAr.trim() || !registration.guardian.trim() || !registration.phone.trim()) return toast.error("يرجى إدخال اسم الطالب وولي الأمر والهاتف.");
    if (authUser && !desktopRuntime && (accountRole === "admin" || accountRole === "registrar")) {
      const created = await createLearnerMutation.mutateAsync({ name: registration.name || registration.nameAr, nameAr: registration.nameAr, grade: registration.grade, phone: registration.phone, status: "new" });
      const serverStudent: Student = { id: created.id, name: created.name, nameAr: created.nameAr, grade: created.grade, guardian: registration.guardian, phone: created.phone ?? registration.phone, level: "A1", attendance: 0, subjects: registration.subjects, status: "New" };
      setData(current => ({ ...current, students: [serverStudent, ...current.students] }));
      await serverLearnersQuery.refetch();
    } else {
      const newStudent: Student = { id: `s-${Date.now()}`, name: registration.name || registration.nameAr, nameAr: registration.nameAr, grade: registration.grade, guardian: registration.guardian, phone: registration.phone, level: "A1", attendance: 0, subjects: registration.subjects, status: "New" };
      await updateData({ ...data, students: [newStudent, ...data.students] });
    }
    setRegistration({ nameAr: "", name: "", guardian: "", phone: "", grade: "primary", subjects: ["arabic", "english", "mathematics"] });
    setRegistrationOpen(false);
    toast.success(authUser && !desktopRuntime && (accountRole === "admin" || accountRole === "registrar") ? "تم تسجيل الطالب في قاعدة المؤسسة." : "تم تسجيل الطالب في السجل المحلي.");
  };

  const handleOfficialRegistrationSuccess = async (studentData: AlgerianStudentRegistrationData) => {
    const fullNameAr = `${studentData.firstNameAr} ${studentData.familyNameAr}`.trim();
    const fullNameFr = `${studentData.firstNameFr} ${studentData.familyNameFr}`.trim();
    const newStudent: Student = {
      id: studentData.nationalStudentId || `s-${Date.now()}`,
      name: fullNameFr || fullNameAr,
      nameAr: fullNameAr,
      grade: studentData.grade,
      guardian: studentData.guardianNameAr,
      phone: studentData.guardianPhone,
      level: "A1",
      attendance: 100,
      subjects: ["arabic", "english", "mathematics"],
      status: "New",
      phoneVerified: true,
      guardianConsent: true,
    };
    if (authUser && !desktopRuntime && (accountRole === "admin" || accountRole === "registrar")) {
      try {
        await createLearnerMutation.mutateAsync({
          name: newStudent.name,
          nameAr: newStudent.nameAr,
          grade: newStudent.grade,
          phone: newStudent.phone,
          status: "new",
        });
        await serverLearnersQuery.refetch();
      } catch (e) {
        console.warn("Learner server registration fallback:", e);
      }
    }
    await updateData({ ...data, students: [newStudent, ...data.students] });
    setRegistrationOpen(false);
  };

  const printArabicReceipt = (payment: Payment) => {
    const student = data.students.find((item) => item.id === payment.studentId);
    const receiptWindow = window.open("", "edupulse-receipt", "width=760,height=920");
    if (!receiptWindow) return toast.error("اسمح بالنوافذ المنبثقة لطباعة الإيصال.");
    const brand = readSchoolBrand();
    receiptWindow.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>إيصال ${escapeReceiptHtml(brand.name)}</title><style>*{box-sizing:border-box}body{margin:0;background:#eef3f4}.sheet{max-width:760px;margin:42px auto;border:1px solid #d8e4e8;padding:36px;background:#fff}td{padding:14px 0;border-bottom:1px solid #e5edf0}.label{color:#60747c;width:36%}@media print{body{background:#fff}.sheet{border:none;margin:0;max-width:none}}</style></head><body>${buildReceiptMarkup(payment, student, brand)}<script>window.onload=()=>window.print()</script></body></html>`);
    receiptWindow.document.close();
  };

  const downloadPdfReceipt = async (payment: Payment) => {
    const student = data.students.find((item) => item.id === payment.studentId);
    const brand = readSchoolBrand();
    const renderTarget = document.createElement("div");
    renderTarget.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;min-height:1123px;background:#fff;z-index:-1";
    renderTarget.innerHTML = buildReceiptMarkup(payment, student, brand);
    document.body.appendChild(renderTarget);
    try {
      await document.fonts?.ready;
      const canvas = await html2canvas(renderTarget, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false });
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imageHeight = canvas.height * pageWidth / canvas.width;
      doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, Math.min(pageHeight, imageHeight), undefined, "FAST");
      doc.save(`edupulse-receipt-${payment.id}.pdf`);
      toast.success("تم تنزيل إيصال PDF عربي منسق.");
    } catch {
      toast.error("تعذر إنشاء PDF الآن. استخدم الطباعة ثم اختر حفظ بصيغة PDF.");
    } finally {
      renderTarget.remove();
    }
  };

  const savePayment = async (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) return toast.error("أدخل مبلغًا صحيحًا.");
    const student = data.students.find((item) => item.id === paymentForm.studentId);
    if (!student) return toast.error("اختر طالبًا.");
    if (authUser && !desktopRuntime && (accountRole === "admin" || accountRole === "finance_admin")) {
      await recordPaymentMutation.mutateAsync({ learnerId: student.id, amountMinor: amount, currency: "DZD", method: paymentForm.method, status: "paid", paidAt: new Date() });
      toast.success("تم تسجيل الدفعة في قاعدة المؤسسة.");
    } else {
      const payment: Payment = { id: `p-${Date.now()}`, studentId: student.id, learner: student.nameAr, amount, method: paymentForm.method, paidAt: new Date().toISOString().slice(0, 10), state: "Paid" };
      await updateData({ ...data, payments: [payment, ...data.payments] });
      toast.success("تم تسجيل الدفعة محليًا.");
    }
    setPaymentForm({ studentId: student.id, amount: "", method: "Cash" }); setPaymentOpen(false);
  };

  const saveGuardianMessage = async (body = message) => {
    const record: GuardianMessage = { id: `m-${Date.now()}`, studentId: currentStudent.id, subject: "ملخص التقدم الأسبوعي", body, createdAt: new Date().toISOString(), copied: false };
    await updateData({ ...data, messages: [record, ...data.messages] });
    try { await navigator.clipboard.writeText(body); toast.success("تم حفظ الرسالة ونسخها للمشاركة مع ولي الأمر."); } catch { toast.success("تم حفظ مسودة الرسالة محليًا."); }
  };

  const recordWhatsAppDelivery = async (delivery: Omit<WhatsAppDelivery, "id" | "studentId">) => {
    const record: WhatsAppDelivery = { ...delivery, id: `wa-${Date.now()}`, studentId: currentStudent.id };
    await updateData({ ...data, whatsappDeliveries: [record, ...(data.whatsappDeliveries ?? [])] });
  };

  const printProgressReport = () => {
    const assessment = selectedAssessment;
    const report = window.open("", "edupulse-progress", "width=780,height=950");
    if (!report) return toast.error("اسمح بالنوافذ المنبثقة لطباعة التقرير.");
    const skills = [["التحدث", assessment.speaking], ["الاستماع", assessment.listening], ["القراءة", assessment.reading], ["الكتابة", assessment.writing]];
    report.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير التقدم</title><style>body{font-family:Arial,sans-serif;margin:0;color:#00364A;background:#fff}.sheet{margin:42px;border:1px solid #d8e4e8;padding:36px}.brand{font:40px Georgia,serif}.meta{color:#60747c;font-size:13px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #00364A;padding-bottom:22px}.level{font:46px Georgia,serif;margin:28px 0}.skill{display:flex;gap:14px;align-items:center;margin:18px 0}.bar{height:8px;background:#e4edef;flex:1;border-radius:9px}.fill{height:8px;background:#00364A;border-radius:9px}.note{margin-top:28px;background:#f5f8f8;padding:20px;line-height:1.9}.footer{margin-top:28px;font-size:12px;color:#60747c}@media print{.sheet{border:none;margin:0}}</style></head><body><main class="sheet"><div class="head"><div><div class="brand">EduPulse</div><div class="meta">تقرير تقدم الطالب</div></div><div class="meta">${new Date().toLocaleDateString("ar-DZ")}<br>المعلم: فريق EduPulse</div></div><h1>${currentStudent.nameAr}</h1><div class="meta">${currentStudent.grade} · حضور ${currentStudent.attendance}%</div><div class="level">CEFR ${assessment.level}</div>${skills.map(([label,value]) => `<div class="skill"><div style="width:90px">${label}</div><div class="bar"><div class="fill" style="width:${value}%"></div></div><strong>${value}%</strong></div>`).join("")}<div class="note"><strong>ملاحظة المعلم:</strong><br>${assessment.note}</div><p class="footer">هذا التقرير ملخص تقدم معتمد للمشاركة مع الطالب وولي الأمر.</p></main><script>window.onload=()=>window.print()</script></body></html>`);
    report.document.close();
  };

  const downloadBackup = async () => {
    const payload = { format: "edupulse-local-export", exportedAt: new Date().toISOString(), data };
    const filename = `edupulse-local-${new Date().toISOString().slice(0, 10)}.json`;
    if (await saveDesktopBackup(filename, payload)) { toast.success("تم حفظ النسخة الاحتياطية في جهازك."); return; }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `edupulse-local-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); toast.success("تم تصدير السجل المحلي.");
  };

  const navItems = [
    { id: "overview", label: isArabic ? "نظرة عامة" : "Overview", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
    { id: "studivexa", label: isArabic ? "المساعد الدراسي الذكي" : "Smart AI Study Partner", icon: Brain, roles: ["admin", "student", "guardian"] },
    { id: "cambridge_lexicon", label: isArabic ? "القاموس المتقدم والصوتيات IPA" : "Advanced Lexicon & IPA Phonetics", icon: BookOpen, roles: ["admin", "student", "counsellor"] },
    { id: "wolfram_stem", label: isArabic ? "المساعد الرياضي والحسابي المتقدم" : "Advanced STEM & Math Solver", icon: Binary, roles: ["admin", "teacher", "student"] },
    { id: "student_intel", label: isArabic ? "ذكاء الطالب والبكالوريا" : "Student Intel & BAC Prep", icon: Sparkles, roles: ["admin", "student", "guardian"] },
    { id: "book_downloader", label: isArabic ? "المكتبة الرقمية والمراجع الأكاديمية" : "Digital Academic Library", icon: Download, roles: ["admin", "teacher", "student", "counsellor"] },
    { id: "scorecard_guidance", label: isArabic ? "التوجيه الجامعي واستكشاف التخصصات" : "University Guidance & Scorecard", icon: GraduationCap, roles: ["admin", "teacher", "student", "counsellor"] },
    { id: "professor", label: isArabic ? "مركز قرار الأستاذ" : "Professor Decision Center", icon: Brain, roles: ["admin", "teacher", "counsellor"] },
    { id: "research_studio", label: isArabic ? "أستوديو البحث العلمي وMCP" : "Research Studio & MCP", icon: Search, roles: ["admin", "teacher", "counsellor"] },
    { id: "template_studio", label: isArabic ? "استوديو المذكرات والشهادات البيداغوجية" : "Curriculum & Certificate Studio", icon: Palette, roles: ["admin", "teacher", "counsellor"] },
    { id: "personality_profiler", label: isArabic ? "الملف النفسي والنمط الإدراكي للتلميذ" : "Student Cognitive & Personality Profile", icon: Sparkles, roles: ["admin", "teacher", "counsellor"] },
    { id: "osf_gateway", label: isArabic ? "بوابة الأبحاث والمسودات الأكاديمية" : "Scholarly Research Gateway", icon: Database, roles: ["admin", "teacher", "counsellor"] },
    { id: "registration", label: isArabic ? "تسجيل التلميذ (الرقمنة)" : "Official Registration", icon: UserRoundPlus, roles: ["admin", "registrar"] },
    { id: "learners", label: isArabic ? "الطلاب" : "Learners", icon: UsersRound, roles: ["admin", "registrar", "teacher", "counsellor"] },
    { id: "subjects", label: isArabic ? "المواد والمنهاج" : "Subjects", icon: LibraryBig, roles: ["admin", "teacher", "student"] },
    { id: "attendance", label: isArabic ? "الحضور والغياب" : "Attendance", icon: ClipboardCheck, roles: ["admin", "registrar", "teacher", "counsellor"] },
    { id: "cefr", label: isArabic ? "تقييم الكفاءات CEFR" : "CEFR Assessment", icon: BarChart3, roles: ["admin", "teacher", "student"] },
    { id: "guardians", label: isArabic ? "التواصل مع الأولياء" : "Guardian Comms", icon: MessageCircle, roles: ["admin", "teacher", "counsellor"] },
    { id: "payments", label: isArabic ? "المدفوعات والإيصالات" : "Payments", icon: WalletCards, roles: ["admin", "finance_admin"] },
    { id: "google_workspace", label: isArabic ? "بيئة Google الموحدة" : "Google Workspace", icon: Globe, roles: ["admin", "teacher", "student", "guardian", "registrar", "finance_admin", "counsellor"] },
    { id: "creator", label: isArabic ? "استوديو المبدع" : "Creator Studio", icon: Sparkles, roles: ["admin", "teacher", "counsellor"] },
    { id: "ai-console", label: isArabic ? "وحدة الذكاء والمصادر" : "AI Console", icon: Radar, roles: ["admin", "teacher", "counsellor"] },
    { id: "reports", label: isArabic ? "تقارير التقدم" : "Progress Reports", icon: FileText, roles: ["admin", "teacher", "student"] },
    { id: "support-evaluation", label: isArabic ? "تقييم الدعم التعليمي" : "Support Evaluation", icon: BrainCircuit, roles: ["admin", "teacher", "counsellor"] },
    { id: "search", label: isArabic ? "بحث في السجل" : "Search", icon: Search, roles: ["admin", "teacher", "student"] },
    { id: "knowledge", label: isArabic ? "مصادر المؤسسة" : "Institution Knowledge", icon: BookOpen, roles: ["admin"] },
    { id: "team", label: isArabic ? "فريق المؤسسة" : "Team", icon: ShieldCheck, roles: ["admin"] },
    { id: "ask", label: isArabic ? "اسأل المؤسسة" : "Ask", icon: MessageCircleQuestion, roles: ["admin", "teacher", "student"] },
    { id: "crm", label: isArabic ? "نظام المعلم" : "Teacher CRM", icon: ClipboardCheck, roles: ["admin", "teacher", "counsellor"] },
    { id: "portal", label: role === "guardian" ? (isArabic ? "بوابة ولي الأمر" : "Guardian Portal") : (isArabic ? "بوابة التلميذ" : "Student Portal"), icon: UserRoundCheck, roles: ["student", "guardian"] },
  ];

  const landingNav = [
    ["admissions-pipeline", isArabic ? "مسار القبول" : "Admissions"],
    ["student-360", isArabic ? "سجل 360°" : "Student 360"],
    ["omnichannel-comms", isArabic ? "التواصل" : "Comms"],
    ["curriculum-engine", isArabic ? "الشعب الجزائرية" : "Curriculum"],
    ["workflow-automation", isArabic ? "الأتمتة" : "Workflows"],
    ["stakeholder-portals", isArabic ? "البوابات" : "Portals"],
    ["academic-intelligence", isArabic ? "المختبر الإدراكي" : "Intelligence"],
    ["data-sovereignty", isArabic ? "السيادة والخصوصية" : "Sovereignty"],
  ];

  if (screen === "landing") {
    return <main className="bg-[hsl(201_100%_13%)] text-white" dir={direction}>
      <section className="relative min-h-screen overflow-hidden" id="top">
        {/* Cinematic Background Video - Clearly Visible */}
        <video 
          className="absolute inset-0 z-0 h-full w-full object-cover brightness-[0.92] contrast-[1.04]" 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/manus-storage/edupulse-cinematic-school-fallback_a69e1a92.jpg"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        
        {/* Clear Cinematic Scrim - Video remains fully visible and bright */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/25 via-transparent to-[#001724]/90 pointer-events-none" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8">
          <header className="flex items-center justify-between rounded-full border border-white/25 bg-[#001724]/75 px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md sm:px-6">
            <button onClick={() => scrollTo("top")} className="relative z-10 flex items-center gap-2 text-left sm:gap-3">
              <LogoMark className="h-8 w-8" />
              <span className="text-display text-2xl font-bold leading-none tracking-tight sm:text-3xl">EduPulse<sup className="ml-0.5 text-xs align-top text-emerald-300">•</sup></span>
            </button>
            <nav className="hidden items-center gap-2 lg:flex">
              {landingNav.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15 hover:text-white"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="relative z-10 flex items-center gap-2.5">
              <button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20 hover:text-white sm:block">
                {isArabic ? "EN" : "العربية"}
              </button>
              <button onClick={() => { setInitialAuthTab("login"); setScreen("access"); }} className="rounded-full bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-emerald-300 hover:scale-105 active:scale-95 sm:px-6 sm:text-sm">
                {isArabic ? "دخول المساحة" : "Open workspace"}
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center px-2 pb-28 pt-20 text-center sm:px-6">
            <div className="animate-fade-rise mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300 backdrop-blur-md shadow-lg">
              <span>{isArabic ? "إدارة تعليمية جزائرية مستقلة" : "Independent Algerian Education OS"}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isArabic ? "البيض · وهران · الجزائر" : "El-Bayadh · Oran · Algiers"}</span>
            </div>

            {/* Direct Hero Typography rendered cleanly on the video without any bounding square */}
            <div className="max-w-3xl">
              <h1 className="animate-fade-rise text-display text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                {isArabic ? (
                  <>كل طالب جزائري.<br /><span className="text-emerald-300 drop-shadow-[0_2px_16px_rgba(16,185,129,0.5)]">سجل إدراكي موحد.</span></>
                ) : (
                  <>Every learner.<br /><span className="text-emerald-300">One clear record.</span></>
                )}
              </h1>
              <p className="animate-fade-rise-delay mt-3 max-w-xl mx-auto text-xs sm:text-sm md:text-base font-normal leading-relaxed text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {isArabic ? "EduPulse يجمع التسجيل، معاملات البكالوريا الرسمية، الحضور، التقدم، تواصل الأولياء، والإيصالات في مساحة تعليمية سيادية، عربية أولاً، ومصممة للإنسان." : "EduPulse brings admissions, official BAC coefficients, attendance, spaced retrieval, guardian comms, and receipts into one sovereign education workspace."}
              </p>
            </div>

            <div className="animate-fade-rise-delay-2 mt-6 flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => { setInitialAuthTab("login"); setScreen("access"); }} 
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-400 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(52,211,153,0.3)] transition duration-200 hover:scale-102 hover:bg-emerald-300 active:scale-98"
              >
                {isArabic ? "اختيار دورك ودخول المساحة" : "Choose your role & enter"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              <button 
                onClick={() => scrollTo("admissions-pipeline")} 
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-200 hover:scale-102 hover:bg-white hover:text-slate-950 active:scale-98"
              >
                {isArabic ? "استكشاف المنصة والشعب" : "Explore the platform"}
              </button>
            </div>
          </div>
          <footer className="flex flex-col gap-3 sm:flex-row items-center justify-between border-t border-white/15 pt-4 text-xs text-white/70">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <LockKeyhole className="h-3.5 w-3.5" />
                {isArabic ? "مساحة المؤسسة الموثقة" : "Authenticated Workspace"}
              </span>
              <span>·</span>
              <span>{isArabic ? "البيض (32) · وهران · الجزائر" : "El-Bayadh (32) · Oran · Algiers"}</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <span>{isArabic ? "تطوير: نور محمد عبد الصمد" : "Developed by Nour Mohammed Abdessamed"}</span>
              <span>·</span>
              <span>{isArabic ? "العربية أولاً" : "Arabic-first"}</span>
            </div>
          </footer>
        </div>
      </section>

      <PostHeroModuleStrip isArabic={isArabic} onSelect={(view) => {
        if (["overview", "registration", "payments", "commerce", "learners", "attendance", "cefr", "guardians", "subjects", "crm", "reports", "portal", "ask", "professor", "student_intel", "research_studio"].includes(view)) {
          enterWorkspace(view === "portal" ? (role === "guardian" ? "guardian" : "student") : role);
          setActiveView(view);
        } else {
          scrollTo("admissions-pipeline");
        }
      }} />
      <AboutSection isArabic={isArabic} />
      <ZohoEducationLanding
        isArabic={isArabic}
        onEnterWorkspace={(targetRole?: string) => {
          if (targetRole && ["admin", "teacher", "student", "guardian", "inspector"].includes(targetRole)) {
            enterWorkspace(targetRole as Role);
          } else {
            setScreen("access");
          }
        }}
        onNavigateToView={(viewId: string) => {
          enterWorkspace(viewId === "portal" ? "student" : (role === "student" || role === "guardian" ? "admin" : role));
          setActiveView(viewId);
        }}
      />
    </main>;
  }

  if (screen === "access") {
    if (authLoading) return <main className="relative flex min-h-screen items-center justify-center bg-[hsl(201_100%_13%)] text-white"><Loader2 className="h-6 w-6 animate-spin" /></main>;
    if (!authUser) return <main className="relative min-h-screen overflow-hidden bg-[hsl(201_100%_13%)] text-white" dir={direction}><video className="absolute inset-0 z-0 h-full w-full object-cover opacity-40" autoPlay loop muted playsInline><source src={VIDEO_URL} type="video/mp4" /></video><div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-8"><AccountPortal language={language} initialTab={initialAuthTab} onBack={() => setScreen("landing")} onLanguageChange={setLanguage} onAuthenticated={(targetRole) => { const chosen = (targetRole as Role) || accountRole; setRole(chosen); setScreen("workspace"); setActiveView(chosen === "guardian" || chosen === "student" ? "portal" : "overview"); }} /></div></main>;
    return <main className="relative min-h-screen overflow-hidden bg-[hsl(201_100%_13%)] text-white" dir={direction}><video className="absolute inset-0 z-0 h-full w-full object-cover opacity-40" autoPlay loop muted playsInline><source src={VIDEO_URL} type="video/mp4" /></video><div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-6 sm:px-8"><header className="flex items-center justify-between"><button onClick={() => setScreen("landing")} className="flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" />{isArabic ? "العودة للمنصة" : "Back to platform"}</button><button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="text-xs text-white/60">{isArabic ? "EN" : "العربية"}</button></header><div className="flex flex-1 items-center justify-center py-16"><div className="surface-panel w-full max-w-xl rounded-[2rem] p-8 text-center"><LogoMark className="mx-auto h-12 w-12" /><p className="text-display mt-6 text-5xl">{isArabic ? "أهلاً بك مجدداً." : "Welcome back."}</p><p className="mt-4 text-sm leading-7 text-white/55">{authUser.name || authUser.email} · {roleInfo[accountRole].arabic}</p><button onClick={() => enterWorkspace(accountRole)} className="liquid-glass mt-8 rounded-xl px-7 py-3.5 text-sm">{isArabic ? "فتح لوحة العمل" : "Open workspace"}<ArrowUpRight className="ml-2 inline h-4 w-4" /></button><button onClick={() => authLogout()} className="mt-5 block w-full text-xs text-white/45 transition hover:text-white">{isArabic ? "تسجيل الخروج" : "Sign out"}</button></div></div></div></main>;
  }

  const visibleNav = navItems.filter((item) => item.roles.includes(role));
  const navigate = (id: string) => { const destination = navItems.find(item => item.id === id); if (!destination || !destination.roles.includes(role)) { toast.error(isArabic ? "لا تملك صلاحية فتح هذه الوحدة." : "You do not have permission to open this module."); return; } if (id === "search") { setSearchOpen(true); setMobileMenu(false); return; } setActiveView(id); setMobileMenu(false); };
  const dashboardTitle = ({
    overview: "صباح واضح.",
    studivexa: "المساعد الدراسي الذكي والتحضير للدروس والامتحانات.",
    cambridge_lexicon: "القاموس المتقدم والصوتيات الدولية IPA.",
    wolfram_stem: "المساعد الرياضي والحسابي المتقدم والمعادلات العلمية.",
    student_intel: "ذكاء الطالب والتحضير للبكالوريا.",
    book_downloader: "المكتبة الرقمية والمراجع الأكاديمية وأرشيف المعرفة.",
    scorecard_guidance: "التوجيه الجامعي واستكشاف التخصصات الأكاديمية.",
    professor: "مركز قرار الأستاذ والمنهاج الجزائري.",
    research_studio: "أستوديو البحث العلمي وتكاملات MCP.",
    template_studio: "استوديو المذكرات والشهادات البيداغوجية الرسمية.",
    personality_profiler: "الملف النفسي والنمط الإدراكي للتلميذ.",
    osf_gateway: "بوابة الأبحاث والمسودات الأكاديمية المفتوحة.",
    registration: "تسجيل طالب جديد.",
    learners: "سجل الطلاب.",
    subjects: "مكتبة المواد الدراسية.",
    attendance: "حضور اليوم.",
    cefr: "تقدم اللغة الإنجليزية.",
    guardians: "تواصل إنساني واضح.",
    payments: "مدفوعات وإيصالات.",
    google_workspace: "بيئة Google الموحدة — Sheets, Calendar, Docs, Tasks, Keep, Slides.",
    creator: "استوديو المبدع.",
    "ai-console": "الذكاء والبيانات العامة.",
    reports: "تقارير التقدم.",
    knowledge: "دليل المؤسسة.",
    team: "فريق المؤسسة.",
    ask: "اسأل المؤسسة.",
    crm: "نظام المعلم.",
    portal: "بوابة الطالب."
  } as Record<string, string>)[activeView] ?? "EduPulse";

  const renderView = () => {
    if (activeView === "studivexa") return <StudivexaHub isArabic={isArabic} />;
    if (activeView === "cambridge_lexicon") return <CambridgeEnglishStudio isArabic={isArabic} />;
    if (activeView === "wolfram_stem") return <WolframStemSolver isArabic={isArabic} userRole={role} />;
    if (activeView === "student_intel") return <StudentIntelligencePanel isArabic={isArabic} />;
    if (activeView === "book_downloader") return <BookAndDocumentDownloader isArabic={isArabic} />;
    if (activeView === "scorecard_guidance") return <CollegeScorecardGuidance isArabic={isArabic} />;
    if (activeView === "professor") return <ProfessorWorkspace isArabic={isArabic} onNavigate={(view) => setActiveView(view)} />;
    if (activeView === "research_studio") return <ResearchStudioPanel isArabic={isArabic} />;
    if (activeView === "template_studio") return <CurriculumTemplateStudio isArabic={isArabic} />;
    if (activeView === "personality_profiler") return <PersonalityProfiler isArabic={isArabic} />;
    if (activeView === "osf_gateway") return <OsfResearchGateway isArabic={isArabic} />;
    if (activeView === "team") return <><SectionHeader eyebrow="Institution administration" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">فريق بصلاحيات واضحة.</em></>} copy="أنشئ دعوات المستخدمين، وراجع حالة كل عضوية، واحتفظ بحدود المؤسسة واضحة." /><InstitutionTeamPanel isArabic={isArabic} institutionId={membershipsQuery.data?.[0]?.institution.id} /></>;
    if (activeView === "crm") return <EducatorCRMPanel isArabic={isArabic} desktopRuntime={desktopRuntime} />;
    if (activeView === "creator") return <><SectionHeader eyebrow="Creator Studio" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">من الرسم البياني إلى الخطة — بروتوكول جزائري.</em></>} copy="استوديوك الخاص: أنشئ الأفواج، حلّل الرسم البياني، أنشئ الخطط والاختبارات — كلها مستندة إلى البرنامج الرسمي." /><CreatorStudioPanel /></>;
    if (activeView === "ai-console") return <><SectionHeader eyebrow="AI console · free public data" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">بيانات عامة موثّقة، بلا بيانات طلاب.</em></>} copy="المساعد هنا يستدعي مصادر عامة مجانية (طقس، أسواق، أبحاث تربوية، مكتبة) ويجيب مع توثيق المصدر؛ لا يرسل أي سجل طالب، ولا يخترع جوابًا عند تعذر المصدر." /><AiConsolePanel /></>;
    if (activeView === "portal") return role === "guardian" ? <GuardianPortalPanel isArabic={isArabic} /> : <StudentPortalPanel isArabic={isArabic} />;
    if (activeView === "support-evaluation") return <><SectionHeader eyebrow="Evidence-based teacher support" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">فهم التقدم قبل اتخاذ القرار.</em></>} copy="يعرض هذا التقييم إشارات تعليمية قابلة للمراجعة، ولا يشخّص حالة نفسية أو طبية." /><StudentSupportEvaluationPanel isArabic={isArabic} /></>;
    if (activeView === "google_workspace") return <GoogleWorkspaceHub isArabic={isArabic} students={data.students} payments={data.payments} />;
    if (activeView === "overview") return <VividDashboard role={role} roleLabel={roleInfo[role].arabic} dateLabel={new Date().toLocaleDateString("ar-DZ", { weekday: "long", day: "numeric", month: "long" })} activeStudents={activeStudents} balanceDue={balanceDue} students={data.students} currentStudent={{ nameAr: currentStudent.nameAr, grade: currentStudent.grade, level: currentStudent.level, attendance: currentStudent.attendance, subjects: currentStudent.subjects.map(subject => subjectName(subject, "ar")) }} onNavigate={navigate} onRegister={() => setRegistrationOpen(true)} />;

    if (activeView === "registration") return <><SectionHeader eyebrow="Official Algerian Registration" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">استمارة التسجيل الرسمية وفق المنظومة التربوية الجزائرية.</em></>} copy="نموذج رسمي متكامل يشمل رقم التعريف المدرسي الوطني (NIE)، الهوية باللاتينية والعربية، الطور والشعبة، ولي الأمر، الملف الصحي والوثائق الرسمية للطباعة والحفظ." action={<button onClick={() => setRegistrationOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm">فتح الاستمارة الرسمية</button>} /><AlgerianOfficialRegistrationForm isArabic={isArabic} onSuccess={handleOfficialRegistrationSuccess} /></>;

    if (activeView === "learners") return <StudentInformationPanel students={data.students} onAdd={() => setRegistrationOpen(true)} isArabic={isArabic} />;

    if (activeView === "subjects") return <><SectionHeader eyebrow="Configurable subject catalogue" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">مكتبة كاملة، وليست قائمة جامدة.</em></>} copy="هذه قائمة أساس قابلة للتوسع بحسب منهج المدرسة والبلد والمرحلة. تظهر للطالب المواد المعتمدة له فقط." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{SUBJECTS.map((subject) => <article key={subject.id} className="surface-panel rounded-2xl p-5"><p className="text-display text-2xl">{subject.nameAr}</p><p className="mt-1 text-xs text-white/45">{subject.name}</p><div className="mt-8 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.13em] text-white/40">{subject.group}</span><BookOpen className="h-4 w-4 text-white/40" /></div></article>)}</div></>;

    if (activeView === "attendance") return <><SectionHeader eyebrow="Teacher workflow" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">تسجيل سريع داخل المساحة المحلية.</em></>} copy="يمكن للمعلم تحديث الحالة فورًا. في إصدار سطح المكتب سيُسجل كل تعديل مع هوية المستخدم ووقته." /><div className="surface-panel overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><div><p className="text-display text-3xl">English B2 · السبت</p><p className="mt-1 text-xs text-white/45">09:00–11:00 · القاعة 102</p></div><StatusPill tone="good">اليوم</StatusPill></div><div className="divide-y divide-white/8">{data.students.map((student) => <div key={student.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{student.nameAr}</p><p className="mt-1 text-xs text-white/45">{student.grade} · حضور تراكمي {student.attendance || "—"}%</p></div><div className="flex flex-wrap gap-2">{[["حاضر", "good"], ["متأخر", "blue"], ["بعذر", "neutral"], ["غائب", "alert"]].map(([label, tone]) => <button key={label} onClick={() => toast.success(`تم تسجيل الحالة: ${label}`)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/40 hover:text-white">{label}</button>)}</div></div>)}</div></div></>;

    if (activeView === "cefr") return <GradebookPanel students={data.students} assessments={data.assessments} isArabic={isArabic} />;

    if (activeView === "guardians") return <><WhatsAppDesktopPanel key={currentStudent.id} isArabic={isArabic} studentName={currentStudent.nameAr} guardianPhone={currentStudent.phone} initialMessage={buildWeeklyProgressMessage({ studentName: currentStudent.nameAr, grade: currentStudent.grade, attendance: currentStudent.attendance, level: selectedAssessment.level, speaking: selectedAssessment.speaking, listening: selectedAssessment.listening, reading: selectedAssessment.reading, writing: selectedAssessment.writing, note: selectedAssessment.note })} guardianConsent={Boolean(currentStudent.guardianConsent)} phoneVerified={Boolean(currentStudent.phoneVerified)} whatsappOptOut={Boolean(currentStudent.whatsappOptOut)} onSaveDraft={saveGuardianMessage} onDeliveryRecorded={recordWhatsAppDelivery} /><SectionHeader eyebrow="Human-approved communication" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">رسالة واضحة قبل أن تغادر المساحة.</em></>} copy="لا تُرسل EduPulse الرسائل تلقائياً. يصوغ المعلم المسودة ويراجعها ثم ينسخها أو يشاركها عبر قناة المؤسسة المعتمدة." /><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><article className="surface-panel rounded-2xl p-6"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">مسودة لولي الأمر</p><p className="mt-1 text-xs text-white/45">{currentStudent.nameAr} · {currentStudent.guardian}</p></div><MessageCircle className="h-5 w-5 text-white/45" /></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-6 min-h-44 w-full rounded-2xl bg-white/90 p-4 text-sm leading-7 text-[#0a3b52] outline-none focus:ring-4 focus:ring-cyan-100" /><div className="mt-4 flex flex-wrap justify-between gap-3"><span className="text-xs text-white/45">مراجعة بشرية مطلوبة قبل المشاركة.</span><button onClick={() => saveGuardianMessage()} className="liquid-glass rounded-full px-5 py-3 text-sm"><Copy className="ml-2 inline h-4 w-4" />حفظ ونسخ المسودة</button></div></article><article className="surface-panel rounded-2xl p-6"><p className="text-display text-3xl">سجل الرسائل</p><p className="mt-2 text-sm text-white/55">كل مسودة محفوظة ضمن سجل الطالب المحلي.</p><div className="mt-7 space-y-3">{data.messages.length ? data.messages.map((item) => <div key={item.id} className="rounded-xl border border-white/10 p-4"><p className="text-sm">{item.subject}</p><p className="mt-2 line-clamp-3 text-xs leading-5 text-white/50">{item.body}</p></div>) : <div className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-white/45">لا توجد رسائل محفوظة بعد.</div>}</div></article></div></>;

    if (activeView === "payments") return <><SectionHeader eyebrow="Local payment ledger" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">دفعة موثقة. إيصال قابل للطباعة.</em></>} copy="سجل الدفعات في هذه التجربة محلي. يمكنك تنزيل نسخة PDF أو فتح إيصال عربي جاهز للطباعة والحفظ كـ PDF." action={<button onClick={() => setPaymentOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm"><CirclePlus className="ml-2 inline h-4 w-4" />تسجيل دفعة</button>} /><div className="mb-7"><SchoolBrandPanel /></div><section className="grid gap-4 md:grid-cols-3"><Metric label="إجمالي المدفوع" value={`${data.payments.filter((payment) => payment.state === "Paid").reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("ar-DZ")} د.ج`} detail="ضمن السجل الحالي" icon={WalletCards} /><Metric label="رصيد مستحق" value={`${balanceDue.toLocaleString("ar-DZ")} د.ج`} detail="يتطلب متابعة بشرية" icon={Bell} /><Metric label="إيصالات" value={data.payments.filter((payment) => payment.state === "Paid").length} detail="قابلة للطباعة أو التنزيل" icon={ReceiptText} /></section><div className="surface-panel mt-7 overflow-hidden rounded-2xl"><div className="divide-y divide-white/8">{data.payments.map((payment) => <div key={payment.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{payment.learner}</p><p className="mt-1 text-xs text-white/45">{payment.paidAt} · {payment.method}</p></div><div className="flex items-center gap-3"><div className="text-left"><p className="text-display text-2xl">{payment.amount.toLocaleString("ar-DZ")} د.ج</p><div className="mt-1"><StatusPill tone={payment.state === "Paid" ? "good" : "alert"}>{payment.state === "Paid" ? "مدفوع" : "مستحق"}</StatusPill></div></div>{payment.state === "Paid" && <div className="flex gap-2"><button onClick={() => downloadPdfReceipt(payment)} className="rounded-full border border-white/15 p-2.5 text-white/65 hover:text-white" title="Download PDF"><Download className="h-4 w-4" /></button><button onClick={() => printArabicReceipt(payment)} className="rounded-full border border-white/15 p-2.5 text-white/65 hover:text-white" title="Print Arabic receipt"><ReceiptText className="h-4 w-4" /></button></div>}</div></div>)}</div></div></>;

    if (activeView === "reports") return <><SectionHeader eyebrow="Approved progress report" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">جهّز نسخة واضحة للطالب وولي الأمر.</em></>} copy="يمكن للمعلم أو المدير طباعة تقرير التقدم بعد مراجعة الدليل. لا ينشئ النظام نتيجة أكاديمية تلقائية." action={<button onClick={printProgressReport} className="liquid-glass rounded-full px-5 py-3 text-sm"><FileText className="ml-2 inline h-4 w-4" />طباعة / حفظ PDF</button>} /><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><article className="surface-panel rounded-2xl p-6"><p className="text-display text-4xl">{currentStudent.nameAr}</p><p className="mt-2 text-sm text-white/55">{currentStudent.grade} · {currentStudent.guardian}</p><div className="my-8 border-t border-white/10" /><p className="text-xs uppercase tracking-[0.15em] text-white/45">الحضور</p><p className="text-display mt-3 text-5xl">{currentStudent.attendance}%</p><p className="mt-5 text-xs text-white/45">مواد مسجلة</p><div className="mt-3 flex flex-wrap gap-2">{currentStudent.subjects.slice(0, 6).map((id) => <StatusPill key={id}>{subjectName(id, "ar")}</StatusPill>)}</div></article><article className="surface-panel rounded-2xl p-6"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">تقدم اللغة الإنجليزية</p><p className="mt-1 text-xs text-white/45">تقييم معتمد في {selectedAssessment.date}</p></div><p className="text-display text-5xl">{selectedAssessment.level}</p></div><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["التحدث", selectedAssessment.speaking], ["الاستماع", selectedAssessment.listening], ["القراءة", selectedAssessment.reading], ["الكتابة", selectedAssessment.writing]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 p-4"><p className="text-xs text-white/45">{label}</p><p className="text-display mt-4 text-3xl">{value}%</p></div>)}</div><div className="mt-5 rounded-xl bg-white/5 p-5 text-sm leading-7 text-white/70">{selectedAssessment.note}</div></article></div></>;

    if (activeView === "knowledge") return <KnowledgeAdministration isAuthorized={accountRole === "admin"} />;
    if (activeView === "ask") return <PublicKnowledgeAgent />;

    return null;
  };

  if (searchOpen) return <LocalSearchOverlay query={searchQuery} results={searchResults} onQueryChange={setSearchQuery} onClose={() => setSearchOpen(false)} onSelect={(destination) => { navigate(destination); setSearchOpen(false); setSearchQuery(""); }} />;

  return <main className="min-h-screen bg-[hsl(201_100%_13%)] text-white" dir={direction}><div className="mx-auto flex min-h-screen max-w-[1600px]"><aside className={`fixed inset-y-0 z-40 w-72 border-l border-white/10 bg-[#00364A] px-5 py-6 transition-transform lg:static lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "translate-x-full"} ${direction === "ltr" ? "right-auto left-0 lg:border-r lg:border-l-0" : "right-0"}`}><button onClick={() => setScreen("landing")} className="mb-12 flex items-center gap-3 text-right"><LogoMark className="h-9 w-9" /><span className="text-display text-3xl">EduPulse<sup className="text-xs align-top">•</sup></span></button><div className="mb-7 flex items-center justify-between"><div><p className="text-xs text-white/45">الدور الحالي</p><p className="mt-1 text-sm">{roleInfo[role].arabic}</p></div><button onClick={() => setScreen("access")} className="rounded-full p-2 text-white/55 hover:bg-white/7 hover:text-white" title="Change role"><ChevronRight className="h-4 w-4" /></button></div><nav className="space-y-1">{visibleNav.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${activeView === item.id ? "bg-white text-[#00364A]" : "text-white/55 hover:bg-white/6 hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav><div className="mt-auto absolute inset-x-5 bottom-6 surface-panel rounded-2xl p-4"><div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-200" />{desktopRuntime ? "تطبيق سطح المكتب" : "سجل محلي"}</div><p className="mt-2 text-xs leading-5 text-white/55">{desktopRuntime ? "تُحفظ النسخ الاحتياطية في موقع تختاره على جهازك." : "واجهة دور محلي للتجربة. تصدير ونسخ احتياطي جاهزان للمراجعة."}</p><button onClick={downloadBackup} className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3 text-xs text-white/75 hover:text-white">تصدير السجل <Download className="h-3.5 w-3.5" /></button></div></aside>{mobileMenu && <button onClick={() => setMobileMenu(false)} className="fixed inset-0 z-30 bg-black/55 lg:hidden" aria-label="Close navigation" />}<section className="workspace-scope min-w-0 flex-1 px-5 py-5 lg:px-8 lg:py-7"><header className="mb-10 flex items-center justify-between gap-4"><div className="flex items-center gap-3 lg:hidden"><button onClick={() => setMobileMenu(true)} className="liquid-glass rounded-full p-2.5"><Menu className="h-4 w-4" /></button><LogoMark className="h-8 w-8" /></div><div className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/45 md:flex"><Search className="h-4 w-4" />بحث في السجل المحلي <span className="mr-auto rounded border border-white/10 px-1.5 py-0.5 text-[10px]">⌘ K</span></div>          <div className="mr-auto flex items-center gap-2">
            <button
              onClick={() => setPhoneModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 hover:bg-white/10 hover:text-white transition"
              title={isArabic ? "التحقق برقم الهاتف" : "Phone Verification"}
            >
              <Phone className="h-3.5 w-3.5 text-blue-300" />
              <span className="hidden md:inline">{isArabic ? "التحقق بالهاتف" : "Phone Verification"}</span>
            </button>
            <button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="rounded-full px-3 py-2 text-xs text-white/60 hover:text-white">{isArabic ? "EN" : "العربية"}</button>
            <button onClick={() => toast.info("التنبيهات ستظهر عند تفعيل قائمة المهام في نسخة سطح المكتب.")} className="relative rounded-full p-2.5 text-white/70 hover:bg-white/6 hover:text-white"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-200" /></button>
            <button onClick={() => { setScreen("landing"); toast.info("تم إنهاء جلسة الدور المحلي."); }} className="rounded-full p-2.5 text-white/60 hover:bg-white/6 hover:text-white" title="Logout"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>
        {loading ? <div className="flex min-h-[60vh] items-center justify-center text-white/60"><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> <span className="mr-3">فتح السجل المحلي</span></div> : renderView()}
      </section>
    </div>
    {registrationOpen && <Modal title="استمارة تسجيل تلميذ جديد (الرقمنة)" onClose={() => setRegistrationOpen(false)}><AlgerianOfficialRegistrationForm isArabic={isArabic} compact onSuccess={handleOfficialRegistrationSuccess} onCancel={() => setRegistrationOpen(false)} /></Modal>}
    {paymentOpen && <Modal title="تسجيل دفعة" onClose={() => setPaymentOpen(false)}><form onSubmit={savePayment} className="space-y-5"><label className="block text-xs text-white/50">الطالب<select value={paymentForm.studentId} onChange={(event) => setPaymentForm({ ...paymentForm, studentId: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm">{data.students.map((student) => <option key={student.id} value={student.id}>{student.nameAr}</option>)}</select></label><label className="block text-xs text-white/50">المبلغ (د.ج)<input value={paymentForm.amount} inputMode="numeric" onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm" placeholder="مثال: 6000" /></label><label className="block text-xs text-white/50">طريقة الدفع<select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm"><option>Cash</option><option>Bank transfer</option><option>Cheque</option></select></label><button className="liquid-glass w-full rounded-full px-5 py-3 text-sm">حفظ الدفعة وإنشاء إيصال</button></form></Modal>}
    <PhoneVerificationModal isOpen={phoneModalOpen} onClose={() => setPhoneModalOpen(false)} isArabic={isArabic} />
  </main>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#002334]/85 p-4" role="dialog" aria-modal="true"><section className="surface-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"><header className="mb-6 flex items-start justify-between"><div><p className="text-display text-4xl">{title}</p><p className="mt-1 text-sm text-white/50">يُحفظ في السجل المحلي لهذه التجربة.</p></div><button onClick={onClose} className="rounded-full p-2 text-white/55 hover:bg-white/7 hover:text-white"><X className="h-4 w-4" /></button></header>{children}</section></div>;
}

function RegistrationPanel({ registration, setRegistration, toggleSubject, submitRegistration, compact = false }: { registration: { nameAr: string; name: string; guardian: string; phone: string; grade: string; subjects: string[] }; setRegistration: React.Dispatch<React.SetStateAction<{ nameAr: string; name: string; guardian: string; phone: string; grade: string; subjects: string[] }>>; toggleSubject: (subject: string) => void; submitRegistration: (event: FormEvent) => void; compact?: boolean }) {
  return <form onSubmit={submitRegistration} className={compact ? "space-y-5" : "surface-panel rounded-2xl p-6"}><div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs text-white/50">اسم الطالب بالعربية *<input value={registration.nameAr} onChange={(event) => setRegistration({ ...registration, nameAr: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm focus:border-white/35" placeholder="مثال: سارة عبد الرحمن" /></label><label className="block text-xs text-white/50">الاسم باللاتينية<input value={registration.name} onChange={(event) => setRegistration({ ...registration, name: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm focus:border-white/35" placeholder="Optional" /></label><label className="block text-xs text-white/50">ولي الأمر *<input value={registration.guardian} onChange={(event) => setRegistration({ ...registration, guardian: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm focus:border-white/35" placeholder="الاسم الكامل" /></label><label className="block text-xs text-white/50">هاتف ولي الأمر *<input value={registration.phone} onChange={(event) => setRegistration({ ...registration, phone: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm focus:border-white/35" placeholder="+213 ..." /></label><label className="block text-xs text-white/50">الصف الدراسي<select value={registration.grade} onChange={(event) => setRegistration({ ...registration, grade: event.target.value })} className="mt-2 w-full control-light px-4 py-3 text-sm">{ALGERIA_EDUCATION_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.ar} · {stage.en}</option>)}</select></label><div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm text-white/55"><span className="text-xs">اللغة الافتراضية</span><p className="mt-2">العربية · RTL</p></div></div><div className="mt-7"><div className="flex items-center justify-between"><p className="text-sm">المواد الدراسية</p><span className="text-xs text-white/45">{registration.subjects.length} مواد مختارة</span></div><div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{SUBJECTS.map((subject) => <button type="button" key={subject.id} onClick={() => toggleSubject(subject.id)} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-right text-sm transition ${registration.subjects.includes(subject.id) ? "border-white bg-white text-[#00364A]" : "border-white/12 bg-white/[0.025] text-white/70 hover:border-white/35"}`}><span>{subject.nameAr}</span>{registration.subjects.includes(subject.id) && <Check className="h-4 w-4" />}</button>)}</div></div><button className="liquid-glass mt-7 w-full rounded-full px-5 py-3 text-sm">حفظ تسجيل الطالب</button></form>;
}
