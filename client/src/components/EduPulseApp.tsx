/**
 * EduPulse design reminder: exact supplied cinematic video, Instrument Serif,
 * Inter body font, deep midnight navy and thin liquid-glass signature. This
 * component extends that system into an Arabic-first local education product.
 */
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
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
  GraduationCap,
  MessageCircleQuestion,
  PackageOpen,
  LayoutDashboard,
  LibraryBig,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  ReceiptText,
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
import { EducatorCRMPanel } from "./EducatorCRMPanel";
import { VividDashboard } from "./VividDashboard";
import { PostHeroModuleStrip } from "./PostHeroModuleStrip";
import AboutSection from "./AboutSection";
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
import MedusaCommercePanel from "./MedusaCommercePanel";
import { StudentSupportEvaluationPanel } from "./StudentSupportEvaluationPanel";

type Screen = "landing" | "access" | "workspace";
type Role = "admin" | "teacher" | "student" | "guardian";
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
    { id: "s-001", name: "Amal Benyahia", nameAr: "أمل بن يحيى", grade: "Year 10", guardian: "Nadia Benyahia", phone: "+213 555 014 100", level: "B2", attendance: 94, subjects: ["arabic", "english", "french", "mathematics", "physics", "history"], status: "Active", guardianConsent: true, phoneVerified: true, whatsappOptOut: false },
    { id: "s-002", name: "Youssef Rahmani", nameAr: "يوسف الرحماني", grade: "Year 8", guardian: "Khaled Rahmani", phone: "+213 555 014 101", level: "B1", attendance: 88, subjects: ["arabic", "english", "mathematics", "biology", "computer"], status: "Active", guardianConsent: true, phoneVerified: true, whatsappOptOut: false },
    { id: "s-003", name: "Rania Cherif", nameAr: "رانيا شريف", grade: "Year 7", guardian: "Hana Cherif", phone: "+213 555 014 102", level: "A2", attendance: 76, subjects: ["arabic", "english", "french", "mathematics", "art"], status: "Review", guardianConsent: false, phoneVerified: false, whatsappOptOut: false },
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
  const [language, setLanguage] = useState<Language>("ar");
  const [role, setRole] = useState<Role>("admin");
  const [pendingRole, setPendingRole] = useState<Role>("admin");
  const [activeView, setActiveView] = useState("overview");
  const [data, setData] = useState<LocalData>(initialData);
  const [loading, setLoading] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [registration, setRegistration] = useState({ nameAr: "", name: "", guardian: "", phone: "", grade: "Year 7", subjects: ["arabic", "english", "mathematics"] });
  const [paymentForm, setPaymentForm] = useState({ studentId: "s-001", amount: "", method: "Cash" });
  const [message, setMessage] = useState("ولي الأمر الكريم، نشارككم ملخص تقدم الطالب هذا الأسبوع. الحضور جيد، ونوصي بمراجعة مهام القراءة قبل الحصة القادمة.");

  const isArabic = language === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const accountRole = useMemo<Role>(() => {
    const membershipRole = membershipsQuery.data?.[0]?.membership.role;
    if (membershipRole === "guardian") return "guardian";
    if (membershipRole === "student") return "student";
    if (membershipRole === "teacher") return "teacher";
    if (membershipRole) return "admin";
    return authUser?.role === "admin" ? "admin" : pendingRole;
  }, [authUser?.role, membershipsQuery.data, pendingRole]);
  const serverLearnersQuery = trpc.records.learners.useQuery(undefined, { enabled: Boolean(authUser) && !desktopRuntime && (accountRole === "admin" || accountRole === "teacher"), retry: false });
  const serverPaymentsQuery = trpc.records.payments.useQuery(undefined, { enabled: Boolean(authUser) && !desktopRuntime && (accountRole === "admin"), retry: false });
  const createLearnerMutation = trpc.records.createLearner.useMutation();
  const recordPaymentMutation = trpc.records.recordPayment.useMutation();
  const currentStudent = data.students[0] ?? { id: "", name: "", nameAr: "لا يوجد طالب مسجل بعد", grade: "—", guardian: "—", phone: "—", level: "—", attendance: 0, subjects: [], status: "New" as const };
  const learnerRecordInput = useMemo(() => ({ learnerId: currentStudent.id }), [currentStudent.id]);
  const serverAttendanceQuery = trpc.records.attendance.useQuery(learnerRecordInput, { enabled: Boolean(authUser) && !desktopRuntime && (accountRole === "admin" || accountRole === "teacher") && currentStudent.id.startsWith("learner_"), retry: false });
  const serverCefrQuery = trpc.records.cefr.useQuery(learnerRecordInput, { enabled: Boolean(authUser) && !desktopRuntime && (accountRole === "admin" || accountRole === "teacher") && currentStudent.id.startsWith("learner_"), retry: false });
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
    if (authUser && !desktopRuntime && accountRole === "admin") {
      const created = await createLearnerMutation.mutateAsync({ name: registration.name || registration.nameAr, nameAr: registration.nameAr, grade: registration.grade, phone: registration.phone, status: "new" });
      const serverStudent: Student = { id: created.id, name: created.name, nameAr: created.nameAr, grade: created.grade, guardian: registration.guardian, phone: created.phone ?? registration.phone, level: "A1", attendance: 0, subjects: registration.subjects, status: "New" };
      setData(current => ({ ...current, students: [serverStudent, ...current.students] }));
      await serverLearnersQuery.refetch();
    } else {
      const newStudent: Student = { id: `s-${Date.now()}`, name: registration.name || registration.nameAr, nameAr: registration.nameAr, grade: registration.grade, guardian: registration.guardian, phone: registration.phone, level: "A1", attendance: 0, subjects: registration.subjects, status: "New" };
      await updateData({ ...data, students: [newStudent, ...data.students] });
    }
    setRegistration({ nameAr: "", name: "", guardian: "", phone: "", grade: "Year 7", subjects: ["arabic", "english", "mathematics"] });
    setRegistrationOpen(false);
    toast.success(authUser && !desktopRuntime && accountRole === "admin" ? "تم تسجيل الطالب في قاعدة المؤسسة." : "تم تسجيل الطالب في السجل المحلي.");
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
    if (authUser && !desktopRuntime && accountRole === "admin") {
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
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
    { id: "registration", label: "تسجيل الطالب", icon: UserRoundPlus, roles: ["admin"] },
    { id: "learners", label: "الطلاب", icon: UsersRound, roles: ["admin", "teacher"] },
    { id: "subjects", label: "المواد الدراسية", icon: LibraryBig, roles: ["admin", "teacher", "student"] },
    { id: "attendance", label: "الحضور", icon: ClipboardCheck, roles: ["admin", "teacher"] },
    { id: "cefr", label: "تقييم CEFR", icon: BarChart3, roles: ["admin", "teacher", "student"] },
    { id: "guardians", label: "التواصل مع الأولياء", icon: MessageCircle, roles: ["admin", "teacher"] },
    { id: "payments", label: "المدفوعات والإيصالات", icon: WalletCards, roles: ["admin"] },
    { id: "commerce", label: "التجارة والخدمات", icon:   PackageOpen,
 roles: ["admin"] },
    { id: "reports", label: "تقارير التقدم", icon: FileText, roles: ["admin", "teacher", "student"] },
    { id: "support-evaluation", label: "تقييم الدعم التعليمي", icon: BrainCircuit, roles: ["admin", "teacher"] },
    { id: "search", label: "بحث في السجل", icon: Search, roles: ["admin", "teacher", "student"] },
    { id: "knowledge", label: "مصادر المؤسسة", icon: BookOpen, roles: ["admin"] },
    { id: "ask", label: "اسأل المؤسسة", icon: MessageCircleQuestion, roles: ["admin", "teacher", "student"] },
    { id: "crm", label: "نظام المعلم", icon: ClipboardCheck, roles: ["admin", "teacher"] },
    { id: "portal", label: role === "guardian" ? "بوابة ولي الأمر" : "بوابة الطالب", icon: UserRoundCheck, roles: ["student", "guardian"] },
  ];

  const landingNav = [
    ["module-suite", isArabic ? "الوحدات" : "Modules"], ["about", isArabic ? "عن المنصة" : "About"], ["sis", "SIS"], ["levels", isArabic ? "مراحل التعليم" : "Stages"], ["platform", isArabic ? "المنصة" : "Platform"], ["roles", isArabic ? "الأدوار" : "Roles"], ["assistant", isArabic ? "المساعد" : "Assistant"], ["local", isArabic ? "محلي وآمن" : "Local & safe"],
  ];

  if (screen === "landing") {
    return <main className="bg-[hsl(201_100%_13%)] text-white" dir={direction}>
      <section className="relative min-h-screen overflow-hidden" id="top">
        <video className="absolute inset-0 z-0 h-full w-full object-cover" autoPlay loop muted playsInline poster="/manus-storage/edupulse-cinematic-school-fallback_a69e1a92.jpg"><source src={VIDEO_URL} type="video/mp4" /></video>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8">
          <header className="liquid-glass flex items-center justify-between rounded-full px-5 py-3 sm:px-6"><button onClick={() => scrollTo("top")} className="relative z-10 flex items-center gap-2 text-left sm:gap-3"><LogoMark className="h-8 w-8" /><span className="text-display text-2xl leading-none tracking-tight sm:text-3xl">EduPulse<sup className="ml-0.5 text-xs align-top">•</sup></span></button><nav className="hidden items-center gap-6 lg:flex">{landingNav.map(([id, label]) => <button key={id} onClick={() => scrollTo(id)} className="nav-link relative z-10 text-sm">{label}</button>)}</nav><div className="relative z-10 flex items-center gap-2"><button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="hidden rounded-full px-3 py-2 text-xs text-white/70 hover:text-white sm:block">{isArabic ? "EN" : "العربية"}</button><button onClick={() => setScreen("access")} className="liquid-glass rounded-full px-4 py-2.5 text-sm transition hover:scale-[1.03] active:scale-[0.97] sm:px-6">{isArabic ? "دخول المساحة" : "Open workspace"}</button></div></header>
          <div className="flex flex-1 flex-col items-center justify-center px-2 pb-32 pt-28 text-center sm:px-6"><div className="animate-fade-rise mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-white/60"><span>{isArabic ? "إدارة تعليمية محلية" : "Local-first education management"}</span><span className="h-px w-9 bg-white/30" /><span className="tracking-[0.14em]">{isArabic ? "طلاب · أولياء · تقدم" : "Learners · Guardians · Progress"}</span></div><h1 className="animate-fade-rise text-display max-w-6xl rounded-[2rem] bg-black/10 px-5 py-3 text-5xl font-semibold leading-[0.98] tracking-[-2.46px] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] sm:px-8 sm:text-7xl md:text-8xl" style={{ textShadow: "0 3px 22px rgba(0,0,0,0.9)" }}>{isArabic ? <>كل طالب.<br />سجل واضح واحد.</> : <>Every learner.<br />One clear record.</>}</h1><p className="animate-fade-rise-delay mt-8 max-w-2xl rounded-2xl bg-black/15 px-5 py-3 text-base font-medium leading-8 text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-lg">{isArabic ? "EduPulse يجمع التسجيل، المواد، الحضور، التقدم، التواصل، والإيصالات في مساحة تعليمية محلية، عربية أولاً، ومصممة للإنسان." : "EduPulse brings registration, subjects, attendance, progress, communication, and receipts into one local education workspace."}</p><div className="animate-fade-rise-delay-2 mt-10 flex flex-wrap justify-center gap-3"><button onClick={() => setScreen("access")} className="liquid-glass rounded-full px-8 py-4 text-sm transition hover:scale-[1.03]">{isArabic ? "اختيار دورك" : "Choose your role"}<ArrowUpRight className="ml-2 inline h-4 w-4" /></button><button onClick={() => scrollTo("platform")} className="rounded-full border border-white/20 px-7 py-4 text-sm text-white/80 transition hover:border-white/45 hover:text-white">{isArabic ? "استكشاف المنصة" : "Explore the platform"}</button></div></div>
          <footer className="flex items-center justify-between text-xs text-white/55"><span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5" />{isArabic ? "مساحة المؤسسة · دخول محمي بكلمة مرور" : "Institution workspace · password protected"}</span><span>{isArabic ? "العربية أولاً · English ready" : "Arabic-first · English ready"}</span></footer>
        </div>
      </section>

      <PostHeroModuleStrip isArabic={isArabic} onSelect={(view) => {
        if (["overview", "registration", "payments", "commerce", "learners", "attendance", "cefr", "guardians", "subjects", "crm", "reports", "portal", "ask"].includes(view)) {
          enterWorkspace(view === "portal" ? (role === "guardian" ? "guardian" : "student") : role);
          setActiveView(view);
        } else {
          scrollTo("platform");
        }
      }} />
      <AboutSection isArabic={isArabic} />
      <section id="sis" className="border-t border-white/10 bg-[#00364A] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"><div><SectionHeader eyebrow={isArabic ? "نظام معلومات الطلاب" : "Student Information System"} title={isArabic ? <>البنية التي تجمع<br /><em className="not-italic text-white/55">رحلة الطالب كاملة.</em></> : <>The system behind<br /><em className="not-italic text-white/55">the whole learner lifecycle.</em></>} /></div><div><p className="max-w-3xl text-base leading-8 text-white/75">{isArabic ? "نظام معلومات الطلاب (SIS) هو تطبيق برمجي يمثل جزءاً أساسياً من رقمنة المؤسسات التعليمية. وظيفته إدارة وتجميع بيانات الطالب طوال رحلته التعليمية: معلومات الطلاب وأولياء الأمور والمعلمين وعناصر المقررات، داخل قاعدة بيانات موحّدة، غالباً في بيئة سحابية. كما يربط أصحاب المصلحة ويحسّن التواصل ويثري عملية التعلم." : "A Student Information System (SIS) is a core software application in the digitization of educational organizations. It manages student-related data across the learner lifecycle, bringing student, parent, educator, and course information into one unified database while improving communication between stakeholders."}</p><p className="mt-5 max-w-3xl text-sm leading-7 text-white/50">{isArabic ? "EduPulse يطبّق هذه الفكرة بطبقة عربية أولاً، مع حدود واضحة بين البيانات المحلية على سطح المكتب والسجلات المؤسسية المتصلة عند الحاجة." : "EduPulse applies this model with an Arabic-first layer and a clear boundary between local desktop data and connected institution records."}</p></div></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SisPillar icon={UsersRound} title={isArabic ? "الأشخاص" : "People"} copy={isArabic ? "طلاب، أولياء أمور، معلمون، وإدارة ضمن أدوار واضحة." : "Students, guardians, educators, and administrators with clear roles."} /><SisPillar icon={BookOpen} title={isArabic ? "المقررات" : "Courses"} copy={isArabic ? "مواد ومجموعات وتقدم يمكن مراجعته." : "Subjects, cohorts, and progress that can be reviewed."} /><SisPillar icon={ClipboardCheck} title={isArabic ? "الرحلة" : "Lifecycle"} copy={isArabic ? "من التسجيل إلى التقارير والتواصل والمتابعة." : "From registration to reports, communication, and follow-up."} /><SisPillar icon={LockKeyhole} title={isArabic ? "الثقة" : "Trust"} copy={isArabic ? "عزل مؤسسي، بيانات قابلة للتصدير، وذكاء مؤسس على مصادر." : "Tenant isolation, exportable data, and grounded intelligence."} /></div></div></section>

      <section id="levels" className="border-t border-white/10 bg-[#002638] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "المسار الجزائري" : "Algerian pathway"} title={isArabic ? <>مراحل واضحة.<br /><em className="not-italic text-white/55">من التحضيري إلى الدكتوراه.</em></> : <>A clear pathway.<br /><em className="not-italic text-white/55">From preparatory to doctorate.</em></>} copy={isArabic ? "يعكس هذا المسار بنية التعليم في الجزائر، مع مدد الشهادات ونقاط الانتقال التي يعرفها الطالب وولي الأمر والمؤسسة." : "This pathway reflects Algeria’s education structure, including the durations and transition points shared by learners, guardians, and institutions."} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[
        { icon: UserRoundCheck, number: "01", title: isArabic ? "التعليم التحضيري" : "Preparatory", detail: isArabic ? "05–06 سنوات · غير إلزامي" : "Age 05–06 · non-compulsory", certificate: isArabic ? "تهيئة قبل الابتدائي" : "Preparation before primary" },
        { icon: BookOpen, number: "02", title: isArabic ? "التعليم الابتدائي" : "Primary", detail: isArabic ? "05 سنوات" : "5 years", certificate: isArabic ? "شهادة التعليم الابتدائي" : "Primary Education Certificate" },
        { icon: ClipboardCheck, number: "03", title: isArabic ? "التعليم المتوسط" : "Middle school", detail: isArabic ? "04 سنوات" : "4 years", certificate: isArabic ? "شهادة التعليم المتوسط · البيام" : "Middle Education Certificate · BEM" },
        { icon: GraduationCap, number: "04", title: isArabic ? "التعليم الثانوي" : "Secondary", detail: isArabic ? "03 سنوات" : "3 years", certificate: isArabic ? "شهادة البكالوريا في مختلف الشعب" : "Baccalaureate across streams" },
        { icon: LibraryBig, number: "05", title: isArabic ? "التعليم العالي · التدرج" : "Higher education · LMD", detail: isArabic ? "ليسانس 03 · ماستر 02 · ثم دكتوراه" : "Licence 3 · Master 2 · then Doctorate", certificate: isArabic ? "نظام ليسانس–ماستر–دكتوراه" : "Licence–Master–Doctorate system" },
      ].map(({ icon: Icon, number, title, detail, certificate }) => <article key={number} className="surface-panel group rounded-2xl p-5 transition duration-200 hover:-translate-y-1"><div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.18em] text-amber-100/70">{number}</span><Icon className="h-5 w-5 text-amber-100" /></div><h3 className="text-display mt-10 text-2xl text-white">{title}</h3><p className="mt-3 text-sm font-medium text-white/75">{detail}</p><p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/50">{certificate}</p></article>)}</div></div></section>

      <section id="assistant" className="border-t border-white/10 bg-[#001f2d] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "مساعد المؤسسة" : "Institution assistant"} title={isArabic ? <>اسأل قبل أن<br /><em className="not-italic text-white/55">تبدأ يومك.</em></> : <>Ask before the<br /><em className="not-italic text-white/55">school day begins.</em></>} copy={isArabic ? "مساعد مؤسس على مصادر تعتمدها الإدارة. إذا لم يجد الإجابة في قاعدة المعرفة، سيصرّح بذلك ولن يخمّن." : "A grounded assistant that answers from administrator-approved sources. If the answer is not in the knowledge base, it says so instead of guessing."} action={<div className="flex flex-wrap gap-3"><button onClick={() => setScreen("access")} className="liquid-glass rounded-full px-5 py-3 text-sm">{isArabic ? "فتح مساحة المؤسسة" : "Open workspace"}<ArrowUpRight className="ml-2 inline h-4 w-4" /></button><button onClick={openKnowledgeAdministration} className="rounded-full border border-amber-100/25 bg-amber-100/10 px-5 py-3 text-sm text-amber-50 transition hover:border-amber-100/50">{isArabic ? "إدارة المصادر" : "Manage sources"}<BookOpen className="ml-2 inline h-4 w-4" /></button></div>} /><div className="surface-panel rounded-2xl p-7 sm:p-10"><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-white/40">{isArabic ? "مساعد واحد، في المكان المناسب" : "One assistant, right where you need it"}</p><p className="text-display mt-4 text-3xl sm:text-4xl">{isArabic ? "اسأل من الزاوية." : "Ask from the corner."}</p><p className="mt-3 max-w-xl text-sm leading-7 text-white/55">{isArabic ? "افتح فقاعة مساعد EduPulse في أسفل الشاشة لطرح سؤال عن المنصة أو المعلومات العامة. تبقى المحادثة منفصلة عن سجلات المؤسسة الخاصة." : "Open the EduPulse assistant bubble at the bottom of the screen to ask about the platform or general information. The conversation stays separate from private school records."}</p></div><div className="shrink-0 rounded-2xl border border-cyan-100/15 bg-cyan-100/[0.06] px-5 py-4 text-sm text-cyan-50">{isArabic ? "مساعد الزوار متاح الآن" : "Visitor assistant is available"}</div></div></div><p className="mt-4 text-xs leading-6 text-white/40">{isArabic ? "حدود الخصوصية: هذه الواجهة تجيب عن السياسات والمعلومات العامة المعتمدة فقط، ولا تعرض درجات أو حضوراً أو رسوماً فردية. استيراد صفحات الويب يمر عبر بوابة المؤسسة ويحتاج مراجعة واعتماد المدير قبل أن يصبح مصدراً للإجابة." : "Privacy boundary: this surface answers approved policy and public-information questions only; it does not expose individual grades, attendance, or fees. Web source ingestion passes through the institution gateway and requires administrator review before retrieval."}</p></div></section>

      <section id="platform" className="border-t border-white/10 bg-[#00364A] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "مساحة التشغيل" : "Operating workspace"} title={isArabic ? <>ليست لوحة جميلة فقط.<br /><em className="not-italic text-white/55">إنها يوم المدرسة في موضعه.</em></> : <>Not a pretty dashboard.<br /><em className="not-italic text-white/55">A school day, in its place.</em></>} copy={isArabic ? "بُنيت المنصة حول ما يحدث فعلاً: تسجيل طالب، اختيار المواد، متابعة الحضور، توثيق التقدم، وإبقاء ولي الأمر على علم بما يهم." : "The system follows the real school day: register, assign subjects, track attendance, document progress, and keep guardians informed."} /><div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]"><div className="surface-panel overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-3"><LogoMark className="h-7 w-7" /><span className="text-display text-2xl">EduPulse</span></div><span className="text-xs text-white/45">{isArabic ? "سجل محلي نشط" : "Local record active"}</span></div><div className="grid min-h-[360px] grid-cols-[150px_1fr]"><div className="border-r border-white/10 p-3"><p className="mb-4 text-[10px] uppercase tracking-[0.14em] text-white/35">{isArabic ? "المساحة" : "Workspace"}</p>{["نظرة عامة", "تسجيل", "الطلاب", "المواد", "الحضور", "التقارير"].map((item, index) => <div key={item} className={`mb-1 rounded-lg px-3 py-2 text-xs ${index === 0 ? "bg-white text-[#00364A]" : "text-white/55"}`}>{item}</div>)}</div><div className="p-5"><p className="text-display text-4xl">{isArabic ? "صباح واضح." : "A clear morning."}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["طلاب نشطون", activeStudents], ["حضور اليوم", "92%"], ["متابعات", "04"]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 p-3"><p className="text-[10px] text-white/45">{label}</p><p className="mt-4 text-display text-3xl">{value}</p></div>)}</div><div className="mt-4 rounded-xl border border-white/10 p-4"><div className="flex items-center justify-between"><span className="text-sm">{isArabic ? "أمل بن يحيى" : "Amal Benyahia"}</span><StatusPill tone="good">B2</StatusPill></div><div className="mt-4 h-1.5 rounded-full bg-white/10"><div className="h-full w-[88%] rounded-full bg-white/80" /></div></div></div></div></div><div className="grid gap-6"><article className="surface-panel rounded-2xl p-6"><Database className="h-5 w-5 text-white/55" /><p className="text-display mt-8 text-3xl">{isArabic ? "البيانات ملكك." : "Your data is yours."}</p><p className="mt-3 text-sm leading-6 text-white/55">{isArabic ? "سجل محلي قابل للتصدير، وخطة واضحة لتغليفه كتطبيق سطح مكتب مشفّر." : "A local exportable record, with a clear path to an encrypted desktop database."}</p></article><article className="relative overflow-hidden rounded-2xl border border-white/10"><img src={ADMISSIONS_IMAGE} alt="Education admissions desk" className="h-52 w-full object-cover opacity-70" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-display text-3xl">{isArabic ? "التسجيل، بسياق." : "Admissions, with context."}</p></div></article></div></div></div></section>

      <section id="roles" className="px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "صلاحيات واضحة" : "Clear access"} title={isArabic ? <>كل دور يرى ما<br /><em className="not-italic text-white/55">يحتاجه فقط.</em></> : <>Every role sees<br /><em className="not-italic text-white/55">only what it needs.</em></>} copy={isArabic ? "لا ينبغي أن يرى الطالب الدفتر المالي، ولا يحتاج المعلم إلى تغيير إعدادات المؤسسة. EduPulse يبدأ بهذه الحدود." : "Students should not see the ledger, and teachers should not change institution settings. EduPulse begins with those boundaries."} /><div className="grid gap-5 md:grid-cols-3">{(Object.keys(roleInfo) as Role[]).map((item) => { const info = roleInfo[item]; const Icon = info.icon; return <article key={item} className="surface-panel group rounded-2xl p-6 transition hover:-translate-y-1"><Icon className={`h-5 w-5 ${info.accent}`} /><p className="text-display mt-12 text-4xl">{info.arabic}</p><p className="mt-1 text-sm text-white/45">{info.title}</p><p className="mt-5 min-h-12 text-sm leading-6 text-white/60">{info.summary}</p><button onClick={() => enterWorkspace(item)} className="mt-8 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">{isArabic ? "فتح هذه التجربة" : "Open this view"}<ChevronLeft className="h-4 w-4" /></button></article>; })}</div></div></section>

      <section id="subjects" className="border-y border-white/10 bg-[#002b3c] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "مكتبة المواد" : "Subject library"} title={isArabic ? <>من اللغة العربية إلى<br /><em className="not-italic text-white/55">الفيزياء والفنون.</em></> : <>From languages to<br /><em className="not-italic text-white/55">physics and the arts.</em></>} copy={isArabic ? "مكتبة مواد قابلة للتخصيص للمدرسة، تشمل المواد الأساسية، العلمية، الإنسانية، والإثرائية. لا توجد قائمة عالمية واحدة لكل مدرسة، ولذلك يمكن إضافة موادكم الخاصة." : "A customizable catalogue covering core, science, humanities, and enrichment subjects. No global list fits every school, so your institution can add its own."} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{SUBJECTS.map((subject) => <div key={subject.id} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4"><p className="text-sm">{isArabic ? subject.nameAr : subject.name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/40">{subject.group}</p></div>)}</div></div></section>

      <section id="progress" className="px-6 py-24 sm:px-8"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><SectionHeader eyebrow={isArabic ? "تقدم مفهوم" : "Progress with meaning"} title={isArabic ? <>التقييم ليس رقمًا فقط.<br /><em className="not-italic text-white/55">إنه دليل للمحادثة القادمة.</em></> : <>Assessment is more than a score.<br /><em className="not-italic text-white/55">It is evidence for the next conversation.</em></>} copy={isArabic ? "تتبّع CEFR مع مهارات التحدث والاستماع والقراءة والكتابة، ثم أنشئ تقرير تقدم قابل للمشاركة مع ولي الأمر بعد مراجعة المعلم." : "Track CEFR speaking, listening, reading, and writing, then prepare a progress report for guardian review after the teacher approves it."} action={<button onClick={() => enterWorkspace("teacher")} className="liquid-glass rounded-full px-5 py-3 text-sm">{isArabic ? "عرض التقييم" : "View assessment"}</button>} /></div><article className="relative overflow-hidden rounded-2xl border border-white/10"><img src={LEARNING_IMAGE} alt="Quiet learning room" className="h-[420px] w-full object-cover opacity-55" /><div className="absolute inset-0 flex items-end p-6"><div className="surface-panel w-full rounded-2xl p-5"><div className="flex items-start justify-between"><div><p className="text-display text-4xl">CEFR B2</p><p className="mt-1 text-xs text-white/50">{isArabic ? "أمل بن يحيى · مراجعة أغسطس" : "Amal Benyahia · August review"}</p></div><StatusPill tone="good">{isArabic ? "معتمد" : "Approved"}</StatusPill></div><div className="mt-6 grid grid-cols-4 gap-3">{[["التحدث", 84], ["الاستماع", 88], ["القراءة", 91], ["الكتابة", 79]].map(([label, value]) => <div key={String(label)}><p className="text-[10px] text-white/45">{label}</p><p className="mt-1 text-display text-2xl">{value}%</p><div className="mt-2 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-white" style={{ width: `${value}%` }} /></div></div>)}</div></div></div></article></div></section>

      <section id="local" className="border-t border-white/10 bg-[#00364A] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "خصوصية عملية" : "Practical privacy"} title={isArabic ? <>كل اتصال مع ولي الأمر.<br /><em className="not-italic text-white/55">كل إيصال. كل تقرير.</em></> : <>Every guardian message.<br /><em className="not-italic text-white/55">Every receipt. Every report.</em></>} copy={isArabic ? "المراسلات ومسودات التقارير والإيصالات جزء من سجل واضح يمكن تصديره. الوصول محمي بحساب المؤسسة، ولا ترسل المنصة شيئًا تلقائيًا ولا تستخدم ذكاءً اصطناعيًا لاتخاذ قرارات أكاديمية عالية الأثر." : "Messages, report drafts, and receipts belong to a clear exportable record. Access is protected by an institution account; nothing is sent automatically, and no AI makes high-stakes academic decisions."} /><div className="grid gap-5 md:grid-cols-3">{[[LockKeyhole, "محلي أولاً", "التجربة الحالية تحفظ البيانات في المتصفح، مع انتقال مخطط له إلى SQLite المشفّر على سطح المكتب."], [MessageCircle, "موافقة بشرية", "الرسالة تُصاغ وتُراجع وتُنسخ قبل مشاركتها مع ولي الأمر."], [Download, "قابل للنقل", "صدّر السجل المحلي والوثائق من دون حبس بياناتك داخل منصة مغلقة."]].map(([Icon, title, description]) => { const IconComponent = Icon as typeof LockKeyhole; return <article key={String(title)} className="surface-panel rounded-2xl p-6"><IconComponent className="h-5 w-5 text-white/55" /><p className="text-display mt-9 text-3xl">{title as string}</p><p className="mt-3 text-sm leading-6 text-white/55">{description as string}</p></article>; })}</div><div className="liquid-glass mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl p-6 sm:flex-row sm:items-center"><div><p className="text-display text-3xl">{isArabic ? "ابدأ بسجل واحد واضح." : "Begin with one clear record."}</p><p className="mt-1 text-sm text-white/55">{isArabic ? "اختر الدور المناسب لتجربة الواجهة." : "Choose a role to experience the product."}</p></div><button onClick={() => setScreen("access")} className="rounded-full bg-white px-6 py-3 text-sm text-[#00364A] transition hover:scale-[1.03]">{isArabic ? "دخول EduPulse" : "Enter EduPulse"}</button></div></div></section>
      <footer className="px-6 py-9 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs text-white/45 sm:flex-row"><span>EduPulse · {isArabic ? "نظام تعليم محلي أولاً" : "Local-first education system"}</span><div className="flex gap-5"><button onClick={() => scrollTo("top")}>{isArabic ? "إلى الأعلى" : "Back to top"}</button><button onClick={() => setScreen("access")}>{isArabic ? "الدخول" : "Enter workspace"}</button></div></div></footer>
    </main>;
  }

  if (screen === "access") {
    if (authLoading) return <main className="relative flex min-h-screen items-center justify-center bg-[hsl(201_100%_13%)] text-white"><Loader2 className="h-6 w-6 animate-spin" /></main>;
    if (!authUser) return <main className="relative min-h-screen overflow-hidden bg-[hsl(201_100%_13%)] text-white" dir={direction}><video className="absolute inset-0 z-0 h-full w-full object-cover opacity-40" autoPlay loop muted playsInline><source src={VIDEO_URL} type="video/mp4" /></video><div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-8"><AccountPortal language={language} onBack={() => setScreen("landing")} onLanguageChange={setLanguage} onAuthenticated={() => { setRole(accountRole); setScreen("workspace"); setActiveView("overview"); }} /></div></main>;
    return <main className="relative min-h-screen overflow-hidden bg-[hsl(201_100%_13%)] text-white" dir={direction}><video className="absolute inset-0 z-0 h-full w-full object-cover opacity-40" autoPlay loop muted playsInline><source src={VIDEO_URL} type="video/mp4" /></video><div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-6 sm:px-8"><header className="flex items-center justify-between"><button onClick={() => setScreen("landing")} className="flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" />{isArabic ? "العودة للمنصة" : "Back to platform"}</button><button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="text-xs text-white/60">{isArabic ? "EN" : "العربية"}</button></header><div className="flex flex-1 items-center justify-center py-16"><div className="surface-panel w-full max-w-xl rounded-[2rem] p-8 text-center"><LogoMark className="mx-auto h-12 w-12" /><p className="text-display mt-6 text-5xl">{isArabic ? "أهلاً بك مجدداً." : "Welcome back."}</p><p className="mt-4 text-sm leading-7 text-white/55">{authUser.name || authUser.email} · {roleInfo[accountRole].arabic}</p><button onClick={() => enterWorkspace(accountRole)} className="liquid-glass mt-8 rounded-xl px-7 py-3.5 text-sm">{isArabic ? "فتح لوحة العمل" : "Open workspace"}<ArrowUpRight className="ml-2 inline h-4 w-4" /></button><button onClick={() => authLogout()} className="mt-5 block w-full text-xs text-white/45 transition hover:text-white">{isArabic ? "تسجيل الخروج" : "Sign out"}</button></div></div></div></main>;
  }

  const visibleNav = navItems.filter((item) => item.roles.includes(role));
  const navigate = (id: string) => { if (id === "search") { setSearchOpen(true); setMobileMenu(false); return; } setActiveView(id); setMobileMenu(false); };
  const dashboardTitle = ({ overview: "صباح واضح.", registration: "تسجيل طالب جديد.", learners: "سجل الطلاب.", subjects: "مكتبة المواد الدراسية.", attendance: "حضور اليوم.", cefr: "تقدم اللغة الإنجليزية.", guardians: "تواصل إنساني واضح.", payments: "مدفوعات وإيصالات.", commerce: "التجارة والخدمات.", reports: "تقارير التقدم.", knowledge: "دليل المؤسسة.", ask: "اسأل المؤسسة.", crm: "نظام المعلم.", portal: "بوابة الطالب." } as Record<string, string>)[activeView] ?? "EduPulse";

  const renderView = () => {
    if (activeView === "crm") return <EducatorCRMPanel isArabic={isArabic} desktopRuntime={desktopRuntime} />;
    if (activeView === "portal") return role === "guardian" ? <GuardianPortalPanel isArabic={isArabic} /> : <StudentPortalPanel isArabic={isArabic} />;
    if (activeView === "support-evaluation") return <><SectionHeader eyebrow="Evidence-based teacher support" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">فهم التقدم قبل اتخاذ القرار.</em></>} copy="يعرض هذا التقييم إشارات تعليمية قابلة للمراجعة، ولا يشخّص حالة نفسية أو طبية." /><StudentSupportEvaluationPanel isArabic={isArabic} /></>;
    if (activeView === "commerce") return <><SectionHeader eyebrow="Medusa commerce boundary" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">خدمات مدفوعة، بحدود واضحة.</em></>} copy="Medusa يدير الكتالوج وحالة التجارة. EduPulse يحتفظ بالمؤسسة وسياق الطالب والصلاحيات." /><MedusaCommercePanel isArabic={isArabic} /></>;
    if (activeView === "overview") return <VividDashboard role={role} roleLabel={roleInfo[role].arabic} dateLabel={new Date().toLocaleDateString("ar-DZ", { weekday: "long", day: "numeric", month: "long" })} activeStudents={activeStudents} balanceDue={balanceDue} students={data.students} currentStudent={{ nameAr: currentStudent.nameAr, grade: currentStudent.grade, level: currentStudent.level, attendance: currentStudent.attendance, subjects: currentStudent.subjects.map(subject => subjectName(subject, "ar")) }} onNavigate={navigate} onRegister={() => setRegistrationOpen(true)} />;

    if (activeView === "registration") return <><SectionHeader eyebrow="Arabic-first registration" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">ابدأ بالمعلومات التي تحتاجها فقط.</em></>} copy="يتضمن النموذج الطالب وولي الأمر والصف والمواد. يمكن إضافة الحقول الخاصة بالمؤسسة في نسخة قاعدة البيانات المحلية المشفرة." action={<button onClick={() => setRegistrationOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm">فتح النموذج</button>} /><RegistrationPanel registration={registration} setRegistration={setRegistration} toggleSubject={toggleSubject} submitRegistration={submitRegistration} /></>;

    if (activeView === "learners") return <StudentInformationPanel students={data.students} onAdd={() => setRegistrationOpen(true)} isArabic={isArabic} />;

    if (activeView === "subjects") return <><SectionHeader eyebrow="Configurable subject catalogue" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">مكتبة كاملة، وليست قائمة جامدة.</em></>} copy="هذه قائمة أساس قابلة للتوسع بحسب منهج المدرسة والبلد والمرحلة. تظهر للطالب المواد المعتمدة له فقط." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{SUBJECTS.map((subject) => <article key={subject.id} className="surface-panel rounded-2xl p-5"><p className="text-display text-2xl">{subject.nameAr}</p><p className="mt-1 text-xs text-white/45">{subject.name}</p><div className="mt-8 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.13em] text-white/40">{subject.group}</span><BookOpen className="h-4 w-4 text-white/40" /></div></article>)}</div></>;

    if (activeView === "attendance") return <><SectionHeader eyebrow="Teacher workflow" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">تسجيل سريع داخل المساحة المحلية.</em></>} copy="يمكن للمعلم تحديث الحالة فورًا. في إصدار سطح المكتب سيُسجل كل تعديل مع هوية المستخدم ووقته." /><div className="surface-panel overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><div><p className="text-display text-3xl">English B2 · السبت</p><p className="mt-1 text-xs text-white/45">09:00–11:00 · القاعة 102</p></div><StatusPill tone="good">اليوم</StatusPill></div><div className="divide-y divide-white/8">{data.students.map((student) => <div key={student.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{student.nameAr}</p><p className="mt-1 text-xs text-white/45">{student.grade} · حضور تراكمي {student.attendance || "—"}%</p></div><div className="flex flex-wrap gap-2">{[["حاضر", "good"], ["متأخر", "blue"], ["بعذر", "neutral"], ["غائب", "alert"]].map(([label, tone]) => <button key={label} onClick={() => toast.success(`تم تسجيل الحالة: ${label}`)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/40 hover:text-white">{label}</button>)}</div></div>)}</div></div></>;

    if (activeView === "cefr") return <GradebookPanel students={data.students} assessments={data.assessments} isArabic={isArabic} />;

    if (activeView === "guardians") return <><WhatsAppDesktopPanel key={currentStudent.id} isArabic={isArabic} studentName={currentStudent.nameAr} guardianPhone={currentStudent.phone} initialMessage={buildWeeklyProgressMessage({ studentName: currentStudent.nameAr, grade: currentStudent.grade, attendance: currentStudent.attendance, level: selectedAssessment.level, speaking: selectedAssessment.speaking, listening: selectedAssessment.listening, reading: selectedAssessment.reading, writing: selectedAssessment.writing, note: selectedAssessment.note })} guardianConsent={Boolean(currentStudent.guardianConsent)} phoneVerified={Boolean(currentStudent.phoneVerified)} whatsappOptOut={Boolean(currentStudent.whatsappOptOut)} onSaveDraft={saveGuardianMessage} onDeliveryRecorded={recordWhatsAppDelivery} /><SectionHeader eyebrow="Human-approved communication" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">رسالة واضحة قبل أن تغادر المساحة.</em></>} copy="لا تُرسل EduPulse الرسائل تلقائياً. يصوغ المعلم المسودة ويراجعها ثم ينسخها أو يشاركها عبر قناة المؤسسة المعتمدة." /><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><article className="surface-panel rounded-2xl p-6"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">مسودة لولي الأمر</p><p className="mt-1 text-xs text-white/45">{currentStudent.nameAr} · {currentStudent.guardian}</p></div><MessageCircle className="h-5 w-5 text-white/45" /></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-6 min-h-44 w-full rounded-xl border border-white/12 bg-white/5 p-4 text-sm leading-7 text-white outline-none focus:border-white/35" /><div className="mt-4 flex flex-wrap justify-between gap-3"><span className="text-xs text-white/45">مراجعة بشرية مطلوبة قبل المشاركة.</span><button onClick={() => saveGuardianMessage()} className="liquid-glass rounded-full px-5 py-3 text-sm"><Copy className="ml-2 inline h-4 w-4" />حفظ ونسخ المسودة</button></div></article><article className="surface-panel rounded-2xl p-6"><p className="text-display text-3xl">سجل الرسائل</p><p className="mt-2 text-sm text-white/55">كل مسودة محفوظة ضمن سجل الطالب المحلي.</p><div className="mt-7 space-y-3">{data.messages.length ? data.messages.map((item) => <div key={item.id} className="rounded-xl border border-white/10 p-4"><p className="text-sm">{item.subject}</p><p className="mt-2 line-clamp-3 text-xs leading-5 text-white/50">{item.body}</p></div>) : <div className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-white/45">لا توجد رسائل محفوظة بعد.</div>}</div></article></div></>;

    if (activeView === "payments") return <><SectionHeader eyebrow="Local payment ledger" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">دفعة موثقة. إيصال قابل للطباعة.</em></>} copy="سجل الدفعات في هذه التجربة محلي. يمكنك تنزيل نسخة PDF أو فتح إيصال عربي جاهز للطباعة والحفظ كـ PDF." action={<button onClick={() => setPaymentOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm"><CirclePlus className="ml-2 inline h-4 w-4" />تسجيل دفعة</button>} /><div className="mb-7"><SchoolBrandPanel /></div><section className="grid gap-4 md:grid-cols-3"><Metric label="إجمالي المدفوع" value={`${data.payments.filter((payment) => payment.state === "Paid").reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("ar-DZ")} د.ج`} detail="ضمن السجل الحالي" icon={WalletCards} /><Metric label="رصيد مستحق" value={`${balanceDue.toLocaleString("ar-DZ")} د.ج`} detail="يتطلب متابعة بشرية" icon={Bell} /><Metric label="إيصالات" value={data.payments.filter((payment) => payment.state === "Paid").length} detail="قابلة للطباعة أو التنزيل" icon={ReceiptText} /></section><div className="surface-panel mt-7 overflow-hidden rounded-2xl"><div className="divide-y divide-white/8">{data.payments.map((payment) => <div key={payment.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{payment.learner}</p><p className="mt-1 text-xs text-white/45">{payment.paidAt} · {payment.method}</p></div><div className="flex items-center gap-3"><div className="text-left"><p className="text-display text-2xl">{payment.amount.toLocaleString("ar-DZ")} د.ج</p><div className="mt-1"><StatusPill tone={payment.state === "Paid" ? "good" : "alert"}>{payment.state === "Paid" ? "مدفوع" : "مستحق"}</StatusPill></div></div>{payment.state === "Paid" && <div className="flex gap-2"><button onClick={() => downloadPdfReceipt(payment)} className="rounded-full border border-white/15 p-2.5 text-white/65 hover:text-white" title="Download PDF"><Download className="h-4 w-4" /></button><button onClick={() => printArabicReceipt(payment)} className="rounded-full border border-white/15 p-2.5 text-white/65 hover:text-white" title="Print Arabic receipt"><ReceiptText className="h-4 w-4" /></button></div>}</div></div>)}</div></div></>;

    if (activeView === "reports") return <><SectionHeader eyebrow="Approved progress report" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">جهّز نسخة واضحة للطالب وولي الأمر.</em></>} copy="يمكن للمعلم أو المدير طباعة تقرير التقدم بعد مراجعة الدليل. لا ينشئ النظام نتيجة أكاديمية تلقائية." action={<button onClick={printProgressReport} className="liquid-glass rounded-full px-5 py-3 text-sm"><FileText className="ml-2 inline h-4 w-4" />طباعة / حفظ PDF</button>} /><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><article className="surface-panel rounded-2xl p-6"><p className="text-display text-4xl">{currentStudent.nameAr}</p><p className="mt-2 text-sm text-white/55">{currentStudent.grade} · {currentStudent.guardian}</p><div className="my-8 border-t border-white/10" /><p className="text-xs uppercase tracking-[0.15em] text-white/45">الحضور</p><p className="text-display mt-3 text-5xl">{currentStudent.attendance}%</p><p className="mt-5 text-xs text-white/45">مواد مسجلة</p><div className="mt-3 flex flex-wrap gap-2">{currentStudent.subjects.slice(0, 6).map((id) => <StatusPill key={id}>{subjectName(id, "ar")}</StatusPill>)}</div></article><article className="surface-panel rounded-2xl p-6"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">تقدم اللغة الإنجليزية</p><p className="mt-1 text-xs text-white/45">تقييم معتمد في {selectedAssessment.date}</p></div><p className="text-display text-5xl">{selectedAssessment.level}</p></div><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["التحدث", selectedAssessment.speaking], ["الاستماع", selectedAssessment.listening], ["القراءة", selectedAssessment.reading], ["الكتابة", selectedAssessment.writing]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 p-4"><p className="text-xs text-white/45">{label}</p><p className="text-display mt-4 text-3xl">{value}%</p></div>)}</div><div className="mt-5 rounded-xl bg-white/5 p-5 text-sm leading-7 text-white/70">{selectedAssessment.note}</div></article></div></>;

    if (activeView === "knowledge") return <KnowledgeAdministration />;
    if (activeView === "ask") return <PublicKnowledgeAgent />;

    return null;
  };

  if (searchOpen) return <LocalSearchOverlay query={searchQuery} results={searchResults} onQueryChange={setSearchQuery} onClose={() => setSearchOpen(false)} onSelect={(destination) => { navigate(destination); setSearchOpen(false); setSearchQuery(""); }} />;

  return <main className="min-h-screen bg-[hsl(201_100%_13%)] text-white" dir={direction}><div className="mx-auto flex min-h-screen max-w-[1600px]"><aside className={`fixed inset-y-0 z-40 w-72 border-l border-white/10 bg-[#00364A] px-5 py-6 transition-transform lg:static lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "translate-x-full"} ${direction === "ltr" ? "right-auto left-0 lg:border-r lg:border-l-0" : "right-0"}`}><button onClick={() => setScreen("landing")} className="mb-12 flex items-center gap-3 text-right"><LogoMark className="h-9 w-9" /><span className="text-display text-3xl">EduPulse<sup className="text-xs align-top">•</sup></span></button><div className="mb-7 flex items-center justify-between"><div><p className="text-xs text-white/45">الدور الحالي</p><p className="mt-1 text-sm">{roleInfo[role].arabic}</p></div><button onClick={() => setScreen("access")} className="rounded-full p-2 text-white/55 hover:bg-white/7 hover:text-white" title="Change role"><ChevronRight className="h-4 w-4" /></button></div><nav className="space-y-1">{visibleNav.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${activeView === item.id ? "bg-white text-[#00364A]" : "text-white/55 hover:bg-white/6 hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav><div className="mt-auto absolute inset-x-5 bottom-6 surface-panel rounded-2xl p-4"><div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-200" />{desktopRuntime ? "تطبيق سطح المكتب" : "سجل محلي"}</div><p className="mt-2 text-xs leading-5 text-white/55">{desktopRuntime ? "تُحفظ النسخ الاحتياطية في موقع تختاره على جهازك." : "واجهة دور محلي للتجربة. تصدير ونسخ احتياطي جاهزان للمراجعة."}</p><button onClick={downloadBackup} className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3 text-xs text-white/75 hover:text-white">تصدير السجل <Download className="h-3.5 w-3.5" /></button></div></aside>{mobileMenu && <button onClick={() => setMobileMenu(false)} className="fixed inset-0 z-30 bg-black/55 lg:hidden" aria-label="Close navigation" />}<section className="min-w-0 flex-1 px-5 py-5 lg:px-8 lg:py-7"><header className="mb-10 flex items-center justify-between gap-4"><div className="flex items-center gap-3 lg:hidden"><button onClick={() => setMobileMenu(true)} className="liquid-glass rounded-full p-2.5"><Menu className="h-4 w-4" /></button><LogoMark className="h-8 w-8" /></div><div className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/45 md:flex"><Search className="h-4 w-4" />بحث في السجل المحلي <span className="mr-auto rounded border border-white/10 px-1.5 py-0.5 text-[10px]">⌘ K</span></div><div className="mr-auto flex items-center gap-2"><button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="rounded-full px-3 py-2 text-xs text-white/60 hover:text-white">{isArabic ? "EN" : "العربية"}</button><button onClick={() => toast.info("التنبيهات ستظهر عند تفعيل قائمة المهام في نسخة سطح المكتب.")} className="relative rounded-full p-2.5 text-white/70 hover:bg-white/6 hover:text-white"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-200" /></button><button onClick={() => { setScreen("landing"); toast.info("تم إنهاء جلسة الدور المحلي."); }} className="rounded-full p-2.5 text-white/60 hover:bg-white/6 hover:text-white" title="Logout"><LogOut className="h-5 w-5" /></button></div></header>{loading ? <div className="flex min-h-[60vh] items-center justify-center text-white/60"><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> <span className="mr-3">فتح السجل المحلي</span></div> : renderView()}</section></div>{registrationOpen && <Modal title="تسجيل طالب جديد" onClose={() => setRegistrationOpen(false)}><RegistrationPanel registration={registration} setRegistration={setRegistration} toggleSubject={toggleSubject} submitRegistration={submitRegistration} compact /></Modal>}{paymentOpen && <Modal title="تسجيل دفعة" onClose={() => setPaymentOpen(false)}><form onSubmit={savePayment} className="space-y-5"><label className="block text-xs text-white/50">الطالب<select value={paymentForm.studentId} onChange={(event) => setPaymentForm({ ...paymentForm, studentId: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none">{data.students.map((student) => <option key={student.id} value={student.id}>{student.nameAr}</option>)}</select></label><label className="block text-xs text-white/50">المبلغ (د.ج)<input value={paymentForm.amount} inputMode="numeric" onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none" placeholder="مثال: 6000" /></label><label className="block text-xs text-white/50">طريقة الدفع<select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none"><option>Cash</option><option>Bank transfer</option><option>Cheque</option></select></label><button className="liquid-glass w-full rounded-full px-5 py-3 text-sm">حفظ الدفعة وإنشاء إيصال</button></form></Modal>}</main>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#002334]/85 p-4" role="dialog" aria-modal="true"><section className="surface-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"><header className="mb-6 flex items-start justify-between"><div><p className="text-display text-4xl">{title}</p><p className="mt-1 text-sm text-white/50">يُحفظ في السجل المحلي لهذه التجربة.</p></div><button onClick={onClose} className="rounded-full p-2 text-white/55 hover:bg-white/7 hover:text-white"><X className="h-4 w-4" /></button></header>{children}</section></div>;
}

function RegistrationPanel({ registration, setRegistration, toggleSubject, submitRegistration, compact = false }: { registration: { nameAr: string; name: string; guardian: string; phone: string; grade: string; subjects: string[] }; setRegistration: React.Dispatch<React.SetStateAction<{ nameAr: string; name: string; guardian: string; phone: string; grade: string; subjects: string[] }>>; toggleSubject: (subject: string) => void; submitRegistration: (event: FormEvent) => void; compact?: boolean }) {
  return <form onSubmit={submitRegistration} className={compact ? "space-y-5" : "surface-panel rounded-2xl p-6"}><div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs text-white/50">اسم الطالب بالعربية *<input value={registration.nameAr} onChange={(event) => setRegistration({ ...registration, nameAr: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="مثال: سارة عبد الرحمن" /></label><label className="block text-xs text-white/50">الاسم باللاتينية<input value={registration.name} onChange={(event) => setRegistration({ ...registration, name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="Optional" /></label><label className="block text-xs text-white/50">ولي الأمر *<input value={registration.guardian} onChange={(event) => setRegistration({ ...registration, guardian: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="الاسم الكامل" /></label><label className="block text-xs text-white/50">هاتف ولي الأمر *<input value={registration.phone} onChange={(event) => setRegistration({ ...registration, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="+213 ..." /></label><label className="block text-xs text-white/50">الصف الدراسي<select value={registration.grade} onChange={(event) => setRegistration({ ...registration, grade: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none">{["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"].map((grade) => <option key={grade}>{grade}</option>)}</select></label><div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm text-white/55"><span className="text-xs">اللغة الافتراضية</span><p className="mt-2">العربية · RTL</p></div></div><div className="mt-7"><div className="flex items-center justify-between"><p className="text-sm">المواد الدراسية</p><span className="text-xs text-white/45">{registration.subjects.length} مواد مختارة</span></div><div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{SUBJECTS.map((subject) => <button type="button" key={subject.id} onClick={() => toggleSubject(subject.id)} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-right text-sm transition ${registration.subjects.includes(subject.id) ? "border-white bg-white text-[#00364A]" : "border-white/12 bg-white/[0.025] text-white/70 hover:border-white/35"}`}><span>{subject.nameAr}</span>{registration.subjects.includes(subject.id) && <Check className="h-4 w-4" />}</button>)}</div></div><button className="liquid-glass mt-7 w-full rounded-full px-5 py-3 text-sm">حفظ تسجيل الطالب</button></form>;
}
