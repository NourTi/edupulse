/**
 * EduPulse design reminder: exact supplied cinematic video, Instrument Serif,
 * Inter body font, deep midnight navy and thin liquid-glass signature. This
 * component extends that system into an Arabic-first local education product.
 */
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
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
  LayoutDashboard,
  LibraryBig,
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

type Screen = "landing" | "access" | "workspace";
type Role = "admin" | "teacher" | "student";
type Language = "ar" | "en";
type Subject = { id: string; name: string; nameAr: string; group: string };
type Student = { id: string; name: string; nameAr: string; grade: string; guardian: string; phone: string; level: string; attendance: number; subjects: string[]; status: "Active" | "New" | "Review" };
type Payment = { id: string; studentId: string; learner: string; amount: number; method: string; paidAt: string; state: "Paid" | "Balance due" };
type CefrAssessment = { id: string; studentId: string; level: string; speaking: number; listening: number; reading: number; writing: number; note: string; date: string };
type GuardianMessage = { id: string; studentId: string; subject: string; body: string; createdAt: string; copied: boolean };
type LocalData = { students: Student[]; payments: Payment[]; assessments: CefrAssessment[]; messages: GuardianMessage[] };

const DB_NAME = "edupulse-expanded-local";
const STORE_NAME = "education-workspace";
const DATA_KEY = "main";
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const MARK_URL = "/manus-storage/edupulse-mark_2dba4aaa.png";
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
    { id: "s-001", name: "Amal Benyahia", nameAr: "أمل بن يحيى", grade: "Year 10", guardian: "Nadia Benyahia", phone: "+213 555 014 100", level: "B2", attendance: 94, subjects: ["arabic", "english", "french", "mathematics", "physics", "history"], status: "Active" },
    { id: "s-002", name: "Youssef Rahmani", nameAr: "يوسف الرحماني", grade: "Year 8", guardian: "Khaled Rahmani", phone: "+213 555 014 101", level: "B1", attendance: 88, subjects: ["arabic", "english", "mathematics", "biology", "computer"], status: "Active" },
    { id: "s-003", name: "Rania Cherif", nameAr: "رانيا شريف", grade: "Year 7", guardian: "Hana Cherif", phone: "+213 555 014 102", level: "A2", attendance: 76, subjects: ["arabic", "english", "french", "mathematics", "art"], status: "Review" },
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
};

const roleInfo: Record<Role, { title: string; arabic: string; summary: string; icon: typeof ShieldCheck; accent: string }> = {
  admin: { title: "Administrator", arabic: "مدير المؤسسة", summary: "Registration, fees, records, roles, and institution health.", icon: ShieldCheck, accent: "text-amber-100" },
  teacher: { title: "Teacher", arabic: "المعلم", summary: "Cohorts, subjects, attendance, progress, and guardian drafts.", icon: GraduationCap, accent: "text-sky-100" },
  student: { title: "Student", arabic: "الطالب", summary: "A clear view of approved subjects, progress, reports, and messages.", icon: UserRoundCheck, accent: "text-emerald-100" },
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
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(DATA_KEY);
    request.onsuccess = () => resolve({ ...initialData, ...(request.result ?? {}) });
    request.onerror = () => reject(request.error);
  });
}

async function persistData(data: LocalData) {
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

export default function EduPulseApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [language, setLanguage] = useState<Language>("ar");
  const [role, setRole] = useState<Role>("admin");
  const [activeView, setActiveView] = useState("overview");
  const [data, setData] = useState<LocalData>(initialData);
  const [loading, setLoading] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [registration, setRegistration] = useState({ nameAr: "", name: "", guardian: "", phone: "", grade: "Year 7", subjects: ["arabic", "english", "mathematics"] });
  const [paymentForm, setPaymentForm] = useState({ studentId: "s-001", amount: "", method: "Cash" });
  const [message, setMessage] = useState("ولي الأمر الكريم، نشارككم ملخص تقدم الطالب هذا الأسبوع. الحضور جيد، ونوصي بمراجعة مهام القراءة قبل الحصة القادمة.");

  const isArabic = language === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const currentStudent = data.students[0];
  const selectedAssessment = data.assessments.find((assessment) => assessment.studentId === currentStudent.id) ?? data.assessments[0];
  const activeStudents = data.students.filter((student) => student.status === "Active").length;
  const balanceDue = data.payments.filter((payment) => payment.state === "Balance due").reduce((sum, payment) => sum + payment.amount, 0);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  useEffect(() => {
    loadData().then(setData).catch(() => toast.error("تعذر فتح السجل المحلي.")).finally(() => setLoading(false));
  }, []);

  const updateData = async (next: LocalData) => {
    setData(next);
    try { await persistData(next); } catch { toast.error("تعذر حفظ التغيير محليًا."); }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const enterWorkspace = (nextRole: Role = role) => { setRole(nextRole); setScreen("workspace"); setActiveView("overview"); };

  const toggleSubject = (subject: string) => setRegistration((current) => ({ ...current, subjects: current.subjects.includes(subject) ? current.subjects.filter((item) => item !== subject) : [...current.subjects, subject] }));

  const submitRegistration = async (event: FormEvent) => {
    event.preventDefault();
    if (!registration.nameAr.trim() || !registration.guardian.trim() || !registration.phone.trim()) return toast.error("يرجى إدخال اسم الطالب وولي الأمر والهاتف.");
    const newStudent: Student = { id: `s-${Date.now()}`, name: registration.name || registration.nameAr, nameAr: registration.nameAr, grade: registration.grade, guardian: registration.guardian, phone: registration.phone, level: "A1", attendance: 0, subjects: registration.subjects, status: "New" };
    await updateData({ ...data, students: [newStudent, ...data.students] });
    setRegistration({ nameAr: "", name: "", guardian: "", phone: "", grade: "Year 7", subjects: ["arabic", "english", "mathematics"] });
    setRegistrationOpen(false);
    toast.success("تم تسجيل الطالب في السجل المحلي.");
  };

  const printArabicReceipt = (payment: Payment) => {
    const student = data.students.find((item) => item.id === payment.studentId);
    const receiptWindow = window.open("", "edupulse-receipt", "width=760,height=920");
    if (!receiptWindow) return toast.error("اسمح بالنوافذ المنبثقة لطباعة الإيصال.");
    receiptWindow.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>إيصال EduPulse</title><style>body{font-family:Arial,sans-serif;margin:0;color:#00364A;background:#fff}.sheet{margin:42px;border:1px solid #d8e4e8;padding:36px}.top{display:flex;justify-content:space-between;align-items:start;border-bottom:2px solid #00364A;padding-bottom:24px}.brand{font:42px Georgia,serif}.mark{font-size:13px;letter-spacing:2px;color:#58727c}.meta{font-size:13px;line-height:1.9;color:#4a5e65}.amount{font:38px Georgia,serif;margin:36px 0}.table{width:100%;border-collapse:collapse}.table td{padding:14px 0;border-bottom:1px solid #e5edf0}.label{color:#60747c;width:36%}.footer{margin-top:34px;padding-top:20px;border-top:1px solid #e5edf0;font-size:12px;color:#60747c}@media print{.sheet{border:none;margin:0}}</style></head><body><main class="sheet"><section class="top"><div><div class="brand">EduPulse</div><div class="mark">سجل تعليمي محلي</div></div><div class="meta">إيصال رقم: ${payment.id.slice(-6).toUpperCase()}<br>تاريخ الدفع: ${payment.paidAt}<br>طريقة الدفع: ${payment.method}</div></section><div class="amount">${payment.amount.toLocaleString("ar-DZ")} د.ج</div><table class="table"><tr><td class="label">اسم الطالب</td><td>${student?.nameAr ?? payment.learner}</td></tr><tr><td class="label">ولي الأمر</td><td>${student?.guardian ?? "—"}</td></tr><tr><td class="label">الحالة</td><td>مدفوع</td></tr></table><p class="footer">تم إنشاء هذا الإيصال من مساحة EduPulse المحلية. احتفظ بنسخة للرجوع إليها.</p></main><script>window.onload=()=>window.print()</script></body></html>`);
    receiptWindow.document.close();
  };

  const downloadPdfReceipt = (payment: Payment) => {
    const student = data.students.find((item) => item.id === payment.studentId);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFillColor(0, 54, 74); doc.rect(0, 0, 595, 116, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("times", "normal"); doc.setFontSize(32); doc.text("EduPulse", 48, 66);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text("LOCAL EDUCATION RECORD", 50, 88);
    doc.setTextColor(0, 54, 74); doc.setFontSize(13); doc.text("PAYMENT RECEIPT", 48, 162);
    doc.setFont("times", "normal"); doc.setFontSize(30); doc.text(`${payment.amount.toLocaleString("en-US")} DZD`, 48, 212);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); const rows = [["Receipt", payment.id.slice(-6).toUpperCase()], ["Student", student?.name ?? payment.learner], ["Guardian", student?.guardian ?? "—"], ["Paid on", payment.paidAt], ["Method", payment.method], ["Status", "PAID"]]; rows.forEach(([label, value], index) => { const y = 264 + index * 43; doc.setDrawColor(220, 230, 234); doc.line(48, y + 15, 547, y + 15); doc.setTextColor(92, 113, 120); doc.text(label, 48, y); doc.setTextColor(0, 54, 74); doc.text(value, 210, y); }); doc.setTextColor(92, 113, 120); doc.setFontSize(9); doc.text("Generated locally by EduPulse", 48, 548); doc.save(`edupulse-receipt-${payment.id}.pdf`);
    toast.success("تم تنزيل نسخة PDF من الإيصال.");
  };

  const savePayment = async (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) return toast.error("أدخل مبلغًا صحيحًا.");
    const student = data.students.find((item) => item.id === paymentForm.studentId);
    if (!student) return toast.error("اختر طالبًا.");
    const payment: Payment = { id: `p-${Date.now()}`, studentId: student.id, learner: student.nameAr, amount, method: paymentForm.method, paidAt: new Date().toISOString().slice(0, 10), state: "Paid" };
    await updateData({ ...data, payments: [payment, ...data.payments] });
    setPaymentForm({ studentId: student.id, amount: "", method: "Cash" }); setPaymentOpen(false); toast.success("تم تسجيل الدفعة محليًا.");
  };

  const saveGuardianMessage = async () => {
    const record: GuardianMessage = { id: `m-${Date.now()}`, studentId: currentStudent.id, subject: "ملخص التقدم الأسبوعي", body: message, createdAt: new Date().toISOString(), copied: false };
    await updateData({ ...data, messages: [record, ...data.messages] });
    try { await navigator.clipboard.writeText(message); toast.success("تم حفظ الرسالة ونسخها للمشاركة مع ولي الأمر."); } catch { toast.success("تم حفظ مسودة الرسالة محليًا."); }
  };

  const printProgressReport = () => {
    const assessment = selectedAssessment;
    const report = window.open("", "edupulse-progress", "width=780,height=950");
    if (!report) return toast.error("اسمح بالنوافذ المنبثقة لطباعة التقرير.");
    const skills = [["التحدث", assessment.speaking], ["الاستماع", assessment.listening], ["القراءة", assessment.reading], ["الكتابة", assessment.writing]];
    report.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير التقدم</title><style>body{font-family:Arial,sans-serif;margin:0;color:#00364A;background:#fff}.sheet{margin:42px;border:1px solid #d8e4e8;padding:36px}.brand{font:40px Georgia,serif}.meta{color:#60747c;font-size:13px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #00364A;padding-bottom:22px}.level{font:46px Georgia,serif;margin:28px 0}.skill{display:flex;gap:14px;align-items:center;margin:18px 0}.bar{height:8px;background:#e4edef;flex:1;border-radius:9px}.fill{height:8px;background:#00364A;border-radius:9px}.note{margin-top:28px;background:#f5f8f8;padding:20px;line-height:1.9}.footer{margin-top:28px;font-size:12px;color:#60747c}@media print{.sheet{border:none;margin:0}}</style></head><body><main class="sheet"><div class="head"><div><div class="brand">EduPulse</div><div class="meta">تقرير تقدم الطالب</div></div><div class="meta">${new Date().toLocaleDateString("ar-DZ")}<br>المعلم: فريق EduPulse</div></div><h1>${currentStudent.nameAr}</h1><div class="meta">${currentStudent.grade} · حضور ${currentStudent.attendance}%</div><div class="level">CEFR ${assessment.level}</div>${skills.map(([label,value]) => `<div class="skill"><div style="width:90px">${label}</div><div class="bar"><div class="fill" style="width:${value}%"></div></div><strong>${value}%</strong></div>`).join("")}<div class="note"><strong>ملاحظة المعلم:</strong><br>${assessment.note}</div><p class="footer">هذا التقرير ملخص تقدم معتمد للمشاركة مع الطالب وولي الأمر.</p></main><script>window.onload=()=>window.print()</script></body></html>`);
    report.document.close();
  };

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify({ format: "edupulse-local-export", exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
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
    { id: "reports", label: "تقارير التقدم", icon: FileText, roles: ["admin", "teacher", "student"] },
    { id: "knowledge", label: "مصادر المؤسسة", icon: BookOpen, roles: ["admin"] },
    { id: "ask", label: "اسأل المؤسسة", icon: MessageCircleQuestion, roles: ["admin", "teacher", "student"] },
  ];

  const landingNav = [
    ["platform", "المنصة"], ["roles", "الأدوار"], ["subjects", "المواد"], ["progress", "التقدم"], ["local", "محلي وآمن"],
  ];

  if (screen === "landing") {
    return <main className="bg-[hsl(201_100%_13%)] text-white" dir={direction}>
      <section className="relative min-h-screen overflow-hidden" id="top">
        <video className="absolute inset-0 z-0 h-full w-full object-cover" autoPlay loop muted playsInline poster="/manus-storage/edupulse-cinematic-school-fallback_a69e1a92.jpg"><source src={VIDEO_URL} type="video/mp4" /></video>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8">
          <header className="liquid-glass flex items-center justify-between rounded-full px-5 py-3 sm:px-6"><button onClick={() => scrollTo("top")} className="relative z-10 flex items-center gap-2 text-left sm:gap-3"><img src={MARK_URL} alt="" className="h-8 w-8 object-contain" /><span className="text-display text-2xl leading-none tracking-tight sm:text-3xl">EduPulse<sup className="ml-0.5 text-xs align-top">•</sup></span></button><nav className="hidden items-center gap-6 lg:flex">{landingNav.map(([id, label]) => <button key={id} onClick={() => scrollTo(id)} className="nav-link relative z-10 text-sm">{label}</button>)}</nav><div className="relative z-10 flex items-center gap-2"><button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="hidden rounded-full px-3 py-2 text-xs text-white/70 hover:text-white sm:block">{isArabic ? "EN" : "العربية"}</button><button onClick={() => setScreen("access")} className="liquid-glass rounded-full px-4 py-2.5 text-sm transition hover:scale-[1.03] active:scale-[0.97] sm:px-6">{isArabic ? "دخول المساحة" : "Open workspace"}</button></div></header>
          <div className="flex flex-1 flex-col items-center justify-center px-2 pb-32 pt-28 text-center sm:px-6"><div className="animate-fade-rise mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-white/60"><span>{isArabic ? "إدارة تعليمية محلية" : "Local-first education management"}</span><span className="h-px w-9 bg-white/30" /><span className="tracking-[0.14em]">{isArabic ? "طلاب · أولياء · تقدم" : "Learners · Guardians · Progress"}</span></div><h1 className="animate-fade-rise text-display max-w-6xl text-5xl leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl">{isArabic ? <>كل طالب.<br />سجل واضح واحد.</> : <>Every learner.<br />One clear record.</>}</h1><p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-[hsl(240_4%_66%)] sm:text-lg">{isArabic ? "EduPulse يجمع التسجيل، المواد، الحضور، التقدم، التواصل، والإيصالات في مساحة تعليمية محلية، عربية أولاً، ومصممة للإنسان." : "EduPulse brings registration, subjects, attendance, progress, communication, and receipts into one local education workspace."}</p><div className="animate-fade-rise-delay-2 mt-10 flex flex-wrap justify-center gap-3"><button onClick={() => setScreen("access")} className="liquid-glass rounded-full px-8 py-4 text-sm transition hover:scale-[1.03]">{isArabic ? "اختيار دورك" : "Choose your role"}<ArrowUpRight className="ml-2 inline h-4 w-4" /></button><button onClick={() => scrollTo("platform")} className="rounded-full border border-white/20 px-7 py-4 text-sm text-white/80 transition hover:border-white/45 hover:text-white">{isArabic ? "استكشاف المنصة" : "Explore the platform"}</button></div></div>
          <footer className="flex items-center justify-between text-xs text-white/55"><span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5" />{isArabic ? "مساحة محلية · لا حساب سحابي" : "Local workspace · no cloud account"}</span><span>{isArabic ? "العربية أولاً · English ready" : "Arabic-first · English ready"}</span></footer>
        </div>
      </section>

      <section id="platform" className="border-t border-white/10 bg-[#00364A] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "مساحة التشغيل" : "Operating workspace"} title={isArabic ? <>ليست لوحة جميلة فقط.<br /><em className="not-italic text-white/55">إنها يوم المدرسة في موضعه.</em></> : <>Not a pretty dashboard.<br /><em className="not-italic text-white/55">A school day, in its place.</em></>} copy={isArabic ? "بُنيت المنصة حول ما يحدث فعلاً: تسجيل طالب، اختيار المواد، متابعة الحضور، توثيق التقدم، وإبقاء ولي الأمر على علم بما يهم." : "The system follows the real school day: register, assign subjects, track attendance, document progress, and keep guardians informed."} /><div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]"><div className="surface-panel overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-3"><img src={MARK_URL} alt="" className="h-7 w-7" /><span className="text-display text-2xl">EduPulse</span></div><span className="text-xs text-white/45">{isArabic ? "سجل محلي نشط" : "Local record active"}</span></div><div className="grid min-h-[360px] grid-cols-[150px_1fr]"><div className="border-r border-white/10 p-3"><p className="mb-4 text-[10px] uppercase tracking-[0.14em] text-white/35">{isArabic ? "المساحة" : "Workspace"}</p>{["نظرة عامة", "تسجيل", "الطلاب", "المواد", "الحضور", "التقارير"].map((item, index) => <div key={item} className={`mb-1 rounded-lg px-3 py-2 text-xs ${index === 0 ? "bg-white text-[#00364A]" : "text-white/55"}`}>{item}</div>)}</div><div className="p-5"><p className="text-display text-4xl">{isArabic ? "صباح واضح." : "A clear morning."}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["طلاب نشطون", activeStudents], ["حضور اليوم", "92%"], ["متابعات", "04"]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 p-3"><p className="text-[10px] text-white/45">{label}</p><p className="mt-4 text-display text-3xl">{value}</p></div>)}</div><div className="mt-4 rounded-xl border border-white/10 p-4"><div className="flex items-center justify-between"><span className="text-sm">{isArabic ? "أمل بن يحيى" : "Amal Benyahia"}</span><StatusPill tone="good">B2</StatusPill></div><div className="mt-4 h-1.5 rounded-full bg-white/10"><div className="h-full w-[88%] rounded-full bg-white/80" /></div></div></div></div></div><div className="grid gap-6"><article className="surface-panel rounded-2xl p-6"><Database className="h-5 w-5 text-white/55" /><p className="text-display mt-8 text-3xl">{isArabic ? "البيانات ملكك." : "Your data is yours."}</p><p className="mt-3 text-sm leading-6 text-white/55">{isArabic ? "سجل محلي قابل للتصدير، وخطة واضحة لتغليفه كتطبيق سطح مكتب مشفّر." : "A local exportable record, with a clear path to an encrypted desktop database."}</p></article><article className="relative overflow-hidden rounded-2xl border border-white/10"><img src={ADMISSIONS_IMAGE} alt="Education admissions desk" className="h-52 w-full object-cover opacity-70" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-display text-3xl">{isArabic ? "التسجيل، بسياق." : "Admissions, with context."}</p></div></article></div></div></div></section>

      <section id="roles" className="px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "صلاحيات واضحة" : "Clear access"} title={isArabic ? <>كل دور يرى ما<br /><em className="not-italic text-white/55">يحتاجه فقط.</em></> : <>Every role sees<br /><em className="not-italic text-white/55">only what it needs.</em></>} copy={isArabic ? "لا ينبغي أن يرى الطالب الدفتر المالي، ولا يحتاج المعلم إلى تغيير إعدادات المؤسسة. EduPulse يبدأ بهذه الحدود." : "Students should not see the ledger, and teachers should not change institution settings. EduPulse begins with those boundaries."} /><div className="grid gap-5 md:grid-cols-3">{(Object.keys(roleInfo) as Role[]).map((item) => { const info = roleInfo[item]; const Icon = info.icon; return <article key={item} className="surface-panel group rounded-2xl p-6 transition hover:-translate-y-1"><Icon className={`h-5 w-5 ${info.accent}`} /><p className="text-display mt-12 text-4xl">{info.arabic}</p><p className="mt-1 text-sm text-white/45">{info.title}</p><p className="mt-5 min-h-12 text-sm leading-6 text-white/60">{info.summary}</p><button onClick={() => enterWorkspace(item)} className="mt-8 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">{isArabic ? "فتح هذه التجربة" : "Open this view"}<ChevronLeft className="h-4 w-4" /></button></article>; })}</div></div></section>

      <section id="subjects" className="border-y border-white/10 bg-[#002b3c] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "مكتبة المواد" : "Subject library"} title={isArabic ? <>من اللغة العربية إلى<br /><em className="not-italic text-white/55">الفيزياء والفنون.</em></> : <>From languages to<br /><em className="not-italic text-white/55">physics and the arts.</em></>} copy={isArabic ? "مكتبة مواد قابلة للتخصيص للمدرسة، تشمل المواد الأساسية، العلمية، الإنسانية، والإثرائية. لا توجد قائمة عالمية واحدة لكل مدرسة، ولذلك يمكن إضافة موادكم الخاصة." : "A customizable catalogue covering core, science, humanities, and enrichment subjects. No global list fits every school, so your institution can add its own."} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{SUBJECTS.map((subject) => <div key={subject.id} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4"><p className="text-sm">{isArabic ? subject.nameAr : subject.name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/40">{subject.group}</p></div>)}</div></div></section>

      <section id="progress" className="px-6 py-24 sm:px-8"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><SectionHeader eyebrow={isArabic ? "تقدم مفهوم" : "Progress with meaning"} title={isArabic ? <>التقييم ليس رقمًا فقط.<br /><em className="not-italic text-white/55">إنه دليل للمحادثة القادمة.</em></> : <>Assessment is more than a score.<br /><em className="not-italic text-white/55">It is evidence for the next conversation.</em></>} copy={isArabic ? "تتبّع CEFR مع مهارات التحدث والاستماع والقراءة والكتابة، ثم أنشئ تقرير تقدم قابل للمشاركة مع ولي الأمر بعد مراجعة المعلم." : "Track CEFR speaking, listening, reading, and writing, then prepare a progress report for guardian review after the teacher approves it."} action={<button onClick={() => enterWorkspace("teacher")} className="liquid-glass rounded-full px-5 py-3 text-sm">{isArabic ? "عرض التقييم" : "View assessment"}</button>} /></div><article className="relative overflow-hidden rounded-2xl border border-white/10"><img src={LEARNING_IMAGE} alt="Quiet learning room" className="h-[420px] w-full object-cover opacity-55" /><div className="absolute inset-0 flex items-end p-6"><div className="surface-panel w-full rounded-2xl p-5"><div className="flex items-start justify-between"><div><p className="text-display text-4xl">CEFR B2</p><p className="mt-1 text-xs text-white/50">{isArabic ? "أمل بن يحيى · مراجعة أغسطس" : "Amal Benyahia · August review"}</p></div><StatusPill tone="good">{isArabic ? "معتمد" : "Approved"}</StatusPill></div><div className="mt-6 grid grid-cols-4 gap-3">{[["التحدث", 84], ["الاستماع", 88], ["القراءة", 91], ["الكتابة", 79]].map(([label, value]) => <div key={String(label)}><p className="text-[10px] text-white/45">{label}</p><p className="mt-1 text-display text-2xl">{value}%</p><div className="mt-2 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-white" style={{ width: `${value}%` }} /></div></div>)}</div></div></div></article></div></section>

      <section id="local" className="border-t border-white/10 bg-[#00364A] px-6 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow={isArabic ? "خصوصية عملية" : "Practical privacy"} title={isArabic ? <>كل اتصال مع ولي الأمر.<br /><em className="not-italic text-white/55">كل إيصال. كل تقرير.</em></> : <>Every guardian message.<br /><em className="not-italic text-white/55">Every receipt. Every report.</em></>} copy={isArabic ? "المراسلات ومسودات التقارير والإيصالات جزء من سجل واضح يمكن تصديره. لا ترسل المنصة شيئًا تلقائيًا ولا تستخدم ذكاءً اصطناعيًا لاتخاذ قرارات أكاديمية عالية الأثر." : "Messages, report drafts, and receipts belong to a clear exportable record. Nothing is sent automatically, and no AI makes high-stakes academic decisions."} /><div className="grid gap-5 md:grid-cols-3">{[[LockKeyhole, "محلي أولاً", "التجربة الحالية تحفظ البيانات في المتصفح، مع انتقال مخطط له إلى SQLite المشفّر على سطح المكتب."], [MessageCircle, "موافقة بشرية", "الرسالة تُصاغ وتُراجع وتُنسخ قبل مشاركتها مع ولي الأمر."], [Download, "قابل للنقل", "صدّر السجل المحلي والوثائق من دون حبس بياناتك داخل منصة مغلقة."]].map(([Icon, title, description]) => { const IconComponent = Icon as typeof LockKeyhole; return <article key={String(title)} className="surface-panel rounded-2xl p-6"><IconComponent className="h-5 w-5 text-white/55" /><p className="text-display mt-9 text-3xl">{title as string}</p><p className="mt-3 text-sm leading-6 text-white/55">{description as string}</p></article>; })}</div><div className="liquid-glass mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl p-6 sm:flex-row sm:items-center"><div><p className="text-display text-3xl">{isArabic ? "ابدأ بسجل واحد واضح." : "Begin with one clear record."}</p><p className="mt-1 text-sm text-white/55">{isArabic ? "اختر الدور المناسب لتجربة الواجهة." : "Choose a role to experience the product."}</p></div><button onClick={() => setScreen("access")} className="rounded-full bg-white px-6 py-3 text-sm text-[#00364A] transition hover:scale-[1.03]">{isArabic ? "دخول EduPulse" : "Enter EduPulse"}</button></div></div></section>
      <footer className="px-6 py-9 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs text-white/45 sm:flex-row"><span>EduPulse · {isArabic ? "نظام تعليم محلي أولاً" : "Local-first education system"}</span><div className="flex gap-5"><button onClick={() => scrollTo("top")}>{isArabic ? "إلى الأعلى" : "Back to top"}</button><button onClick={() => setScreen("access")}>{isArabic ? "الدخول" : "Enter workspace"}</button></div></div></footer>
    </main>;
  }

  if (screen === "access") {
    return <main className="relative min-h-screen overflow-hidden bg-[hsl(201_100%_13%)] text-white" dir={direction}><video className="absolute inset-0 z-0 h-full w-full object-cover opacity-40" autoPlay loop muted playsInline><source src={VIDEO_URL} type="video/mp4" /></video><div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-8"><header className="flex items-center justify-between"><button onClick={() => setScreen("landing")} className="flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" />{isArabic ? "العودة للمنصة" : "Back to platform"}</button><button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="text-xs text-white/60">{isArabic ? "EN" : "العربية"}</button></header><div className="flex flex-1 items-center justify-center py-16"><div className="w-full max-w-4xl"><div className="mb-9 text-center"><img src={MARK_URL} alt="" className="mx-auto h-12 w-12" /><p className="text-display mt-5 text-5xl">{isArabic ? "اختر مساحة عملك." : "Choose your workspace."}</p><p className="mt-3 text-sm text-white/55">{isArabic ? "نظام دور محلي للعرض. ستصبح الصلاحيات الحقيقية محمية في نسخة سطح المكتب والخادم المحلي." : "A local role session for this prototype. Full protection belongs in the desktop and local-server release."}</p></div><div className="grid gap-5 md:grid-cols-3">{(Object.keys(roleInfo) as Role[]).map((item) => { const info = roleInfo[item]; const Icon = info.icon; return <button key={item} onClick={() => enterWorkspace(item)} className="surface-panel group rounded-2xl p-6 text-right transition hover:-translate-y-1 hover:border-white/30"><Icon className={`h-6 w-6 ${info.accent}`} /><p className="text-display mt-12 text-4xl">{info.arabic}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/40">{info.title}</p><p className="mt-5 min-h-14 text-sm leading-6 text-white/55">{info.summary}</p><span className="mt-9 inline-flex items-center gap-2 text-sm text-white/80">{isArabic ? "فتح العرض" : "Open view"}<ArrowUpRight className="h-4 w-4" /></span></button>; })}</div></div></div></div></main>;
  }

  const visibleNav = navItems.filter((item) => item.roles.includes(role));
  const navigate = (id: string) => { setActiveView(id); setMobileMenu(false); };
  const dashboardTitle = ({ overview: "صباح واضح.", registration: "تسجيل طالب جديد.", learners: "سجل الطلاب.", subjects: "مكتبة المواد الدراسية.", attendance: "حضور اليوم.", cefr: "تقدم اللغة الإنجليزية.", guardians: "تواصل إنساني واضح.", payments: "مدفوعات وإيصالات.", reports: "تقارير التقدم.", knowledge: "دليل المؤسسة.", ask: "اسأل المؤسسة." } as Record<string, string>)[activeView] ?? "EduPulse";

  const renderView = () => {
    if (activeView === "overview") return <><SectionHeader eyebrow={`${roleInfo[role].arabic} · ${new Date().toLocaleDateString("ar-DZ", { weekday: "long", day: "numeric", month: "long" })}`} title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">{role === "student" ? "خطوتك التالية ظاهرة." : "كل ما يحتاج انتباهك ظاهر."}</em></>} action={role === "admin" ? <button onClick={() => setRegistrationOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm"><CirclePlus className="ml-2 inline h-4 w-4" />تسجيل طالب</button> : undefined} /><section className="grid gap-4 md:grid-cols-3"><Metric label={role === "student" ? "الحضور" : "طلاب نشطون"} value={role === "student" ? `${currentStudent.attendance}%` : activeStudents} detail={role === "student" ? "ضمن السجل المعتمد" : "داخل هذا السجل المحلي"} icon={UsersRound} /><Metric label={role === "student" ? "مستوى اللغة" : "حضور اليوم"} value={role === "student" ? `CEFR ${currentStudent.level}` : "92%"} detail={role === "student" ? "آخر تقييم معتمد" : "عبر الأفواج المسجلة"} icon={BarChart3} /><Metric label={role === "student" ? "المواد" : "متابعات"} value={role === "student" ? currentStudent.subjects.length : 4} detail={role === "student" ? "مواد ضمن الخطة" : "تحتاج مراجعة بشرية"} icon={ClipboardCheck} /></section><section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><div className="surface-panel overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><div><p className="text-display text-3xl">{role === "student" ? "خطة التعلم" : "الطلاب في المتابعة"}</p><p className="mt-1 text-xs text-white/45">{role === "student" ? "مواد، حضور، وتقدم معتمد" : "سجل موحّد للطالب وولي الأمر والتقدم"}</p></div><button onClick={() => navigate(role === "student" ? "subjects" : "learners")} className="text-xs text-white/60 hover:text-white">عرض الكل</button></div>{role === "student" ? <div className="p-5"><div className="flex items-start justify-between"><div><p className="font-medium">{currentStudent.nameAr}</p><p className="mt-1 text-xs text-white/45">{currentStudent.grade} · CEFR {currentStudent.level}</p></div><StatusPill tone="good">حضور {currentStudent.attendance}%</StatusPill></div><div className="mt-7 grid gap-2 sm:grid-cols-2">{currentStudent.subjects.map((id) => <div key={id} className="rounded-xl border border-white/10 px-4 py-3 text-sm">{subjectName(id, "ar")}</div>)}</div></div> : <div className="divide-y divide-white/8">{data.students.map((student) => <div key={student.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium">{student.nameAr}</p><p className="mt-1 text-xs text-white/45">{student.grade} · {student.guardian}</p></div><div className="text-left"><StatusPill tone={student.status === "Review" ? "alert" : student.status === "New" ? "blue" : "good"}>{student.status === "Review" ? "مراجعة" : student.status === "New" ? "جديد" : "نشط"}</StatusPill><p className="mt-2 text-xs text-white/45">حضور {student.attendance || "—"}%</p></div></div>)}</div>}</div><div className="space-y-6"><article className="surface-panel rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">الخطوة التالية</p><p className="mt-1 text-xs text-white/45">لا إرسال تلقائي، فقط متابعة واضحة</p></div><CalendarDays className="h-4 w-4 text-white/45" /></div><div className="mt-5 space-y-2">{["تأكيد موعد تقييم يوسف", "مراجعة تقرير أمل", "إرسال مسودة تقدم لولي أمر رانيا"].map((task, index) => <button key={task} onClick={() => toast.success("تم تسجيل المتابعة داخل مساحة العمل.")} className="flex w-full items-start gap-3 rounded-xl p-3 text-right hover:bg-white/6"><span className="mt-1 h-3.5 w-3.5 rounded-full border border-white/40" /><span><span className="block text-sm">{task}</span><span className="mt-1 block text-xs text-white/45">{index === 0 ? "اليوم" : "هذا الأسبوع"}</span></span></button>)}</div></article><article className="relative overflow-hidden rounded-2xl border border-white/10"><img src={ADMISSIONS_IMAGE} alt="Admissions materials" className="h-40 w-full object-cover opacity-65" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-display text-3xl">من التسجيل إلى التقدم.</p></div></article></div></section></>;

    if (activeView === "registration") return <><SectionHeader eyebrow="Arabic-first registration" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">ابدأ بالمعلومات التي تحتاجها فقط.</em></>} copy="يتضمن النموذج الطالب وولي الأمر والصف والمواد. يمكن إضافة الحقول الخاصة بالمؤسسة في نسخة قاعدة البيانات المحلية المشفرة." action={<button onClick={() => setRegistrationOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm">فتح النموذج</button>} /><RegistrationPanel registration={registration} setRegistration={setRegistration} toggleSubject={toggleSubject} submitRegistration={submitRegistration} /></>;

    if (activeView === "learners") return <><SectionHeader eyebrow="Learner records" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">الهوية، الولي، المواد، والحضور.</em></>} action={<button onClick={() => setRegistrationOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm">إضافة طالب</button>} /><div className="surface-panel overflow-hidden rounded-2xl"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-right text-sm"><thead className="border-b border-white/10 text-xs text-white/40"><tr><th className="px-5 py-4 font-medium">الطالب</th><th className="px-4 py-4 font-medium">ولي الأمر</th><th className="px-4 py-4 font-medium">الصف</th><th className="px-4 py-4 font-medium">CEFR</th><th className="px-4 py-4 font-medium">الحضور</th><th className="px-5 py-4 font-medium">المواد</th></tr></thead><tbody>{data.students.map((student) => <tr key={student.id} className="border-b border-white/8 hover:bg-white/[0.035]"><td className="px-5 py-4"><p className="font-medium">{student.nameAr}</p><p className="mt-1 text-xs text-white/45">{student.phone}</p></td><td className="px-4 py-4 text-white/65">{student.guardian}</td><td className="px-4 py-4">{student.grade}</td><td className="px-4 py-4"><StatusPill tone="blue">{student.level}</StatusPill></td><td className="px-4 py-4">{student.attendance || "—"}%</td><td className="px-5 py-4 text-white/60">{student.subjects.length} مواد</td></tr>)}</tbody></table></div></div></>;

    if (activeView === "subjects") return <><SectionHeader eyebrow="Configurable subject catalogue" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">مكتبة كاملة، وليست قائمة جامدة.</em></>} copy="هذه قائمة أساس قابلة للتوسع بحسب منهج المدرسة والبلد والمرحلة. تظهر للطالب المواد المعتمدة له فقط." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{SUBJECTS.map((subject) => <article key={subject.id} className="surface-panel rounded-2xl p-5"><p className="text-display text-2xl">{subject.nameAr}</p><p className="mt-1 text-xs text-white/45">{subject.name}</p><div className="mt-8 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.13em] text-white/40">{subject.group}</span><BookOpen className="h-4 w-4 text-white/40" /></div></article>)}</div></>;

    if (activeView === "attendance") return <><SectionHeader eyebrow="Teacher workflow" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">تسجيل سريع داخل المساحة المحلية.</em></>} copy="يمكن للمعلم تحديث الحالة فورًا. في إصدار سطح المكتب سيُسجل كل تعديل مع هوية المستخدم ووقته." /><div className="surface-panel overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><div><p className="text-display text-3xl">English B2 · السبت</p><p className="mt-1 text-xs text-white/45">09:00–11:00 · القاعة 102</p></div><StatusPill tone="good">اليوم</StatusPill></div><div className="divide-y divide-white/8">{data.students.map((student) => <div key={student.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{student.nameAr}</p><p className="mt-1 text-xs text-white/45">{student.grade} · حضور تراكمي {student.attendance || "—"}%</p></div><div className="flex flex-wrap gap-2">{[["حاضر", "good"], ["متأخر", "blue"], ["بعذر", "neutral"], ["غائب", "alert"]].map(([label, tone]) => <button key={label} onClick={() => toast.success(`تم تسجيل الحالة: ${label}`)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/40 hover:text-white">{label}</button>)}</div></div>)}</div></div></>;

    if (activeView === "cefr") return <><SectionHeader eyebrow="Evidence-based language progress" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">أربع مهارات. مستوى واضح. ملاحظة إنسانية.</em></>} copy="تتبّع CEFR للغة الإنجليزية لا يستبدل تقييم المعلم. يجمع الدرجات وملاحظة الدليل قبل مشاركة تقرير التقدم." action={role !== "student" ? <button onClick={() => toast.info("سيُضاف نموذج تسجيل تقييم كامل في قاعدة البيانات المحلية في المرحلة التالية.")} className="liquid-glass rounded-full px-5 py-3 text-sm">تسجيل تقييم</button> : undefined} /><div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]"><article className="surface-panel rounded-2xl p-6"><p className="text-xs uppercase tracking-[0.15em] text-white/45">آخر مستوى معتمد</p><p className="text-display mt-6 text-7xl">{selectedAssessment.level}</p><p className="mt-2 text-sm text-white/55">{currentStudent.nameAr} · {currentStudent.grade}</p><div className="mt-9 rounded-xl border border-white/10 p-4"><p className="text-xs text-white/45">ملاحظة المعلم</p><p className="mt-3 text-sm leading-6 text-white/75">{selectedAssessment.note}</p></div></article><article className="surface-panel rounded-2xl p-6"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">تفصيل المهارات</p><p className="mt-1 text-xs text-white/45">آخر مراجعة · {selectedAssessment.date}</p></div><StatusPill tone="good">معتمد</StatusPill></div><div className="mt-8 space-y-6">{[["التحدث", selectedAssessment.speaking], ["الاستماع", selectedAssessment.listening], ["القراءة", selectedAssessment.reading], ["الكتابة", selectedAssessment.writing]].map(([label, score]) => <div key={String(label)}><div className="flex justify-between text-sm"><span>{label}</span><span className="text-white/55">{score}%</span></div><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-white" style={{ width: `${score}%` }} /></div></div>)}</div></article></div></>;

    if (activeView === "guardians") return <><SectionHeader eyebrow="Human-approved communication" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">رسالة واضحة قبل أن تغادر المساحة.</em></>} copy="لا تُرسل EduPulse الرسائل تلقائياً. يصوغ المعلم المسودة ويراجعها ثم ينسخها أو يشاركها عبر قناة المؤسسة المعتمدة." /><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><article className="surface-panel rounded-2xl p-6"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">مسودة لولي الأمر</p><p className="mt-1 text-xs text-white/45">{currentStudent.nameAr} · {currentStudent.guardian}</p></div><MessageCircle className="h-5 w-5 text-white/45" /></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-6 min-h-44 w-full rounded-xl border border-white/12 bg-white/5 p-4 text-sm leading-7 text-white outline-none focus:border-white/35" /><div className="mt-4 flex flex-wrap justify-between gap-3"><span className="text-xs text-white/45">مراجعة بشرية مطلوبة قبل المشاركة.</span><button onClick={saveGuardianMessage} className="liquid-glass rounded-full px-5 py-3 text-sm"><Copy className="ml-2 inline h-4 w-4" />حفظ ونسخ المسودة</button></div></article><article className="surface-panel rounded-2xl p-6"><p className="text-display text-3xl">سجل الرسائل</p><p className="mt-2 text-sm text-white/55">كل مسودة محفوظة ضمن سجل الطالب المحلي.</p><div className="mt-7 space-y-3">{data.messages.length ? data.messages.map((item) => <div key={item.id} className="rounded-xl border border-white/10 p-4"><p className="text-sm">{item.subject}</p><p className="mt-2 line-clamp-3 text-xs leading-5 text-white/50">{item.body}</p></div>) : <div className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-white/45">لا توجد رسائل محفوظة بعد.</div>}</div></article></div></>;

    if (activeView === "payments") return <><SectionHeader eyebrow="Local payment ledger" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">دفعة موثقة. إيصال قابل للطباعة.</em></>} copy="سجل الدفعات في هذه التجربة محلي. يمكنك تنزيل نسخة PDF أو فتح إيصال عربي جاهز للطباعة والحفظ كـ PDF." action={<button onClick={() => setPaymentOpen(true)} className="liquid-glass rounded-full px-5 py-3 text-sm"><CirclePlus className="ml-2 inline h-4 w-4" />تسجيل دفعة</button>} /><section className="grid gap-4 md:grid-cols-3"><Metric label="إجمالي المدفوع" value={`${data.payments.filter((payment) => payment.state === "Paid").reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("ar-DZ")} د.ج`} detail="ضمن السجل الحالي" icon={WalletCards} /><Metric label="رصيد مستحق" value={`${balanceDue.toLocaleString("ar-DZ")} د.ج`} detail="يتطلب متابعة بشرية" icon={Bell} /><Metric label="إيصالات" value={data.payments.filter((payment) => payment.state === "Paid").length} detail="قابلة للطباعة أو التنزيل" icon={ReceiptText} /></section><div className="surface-panel mt-7 overflow-hidden rounded-2xl"><div className="divide-y divide-white/8">{data.payments.map((payment) => <div key={payment.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{payment.learner}</p><p className="mt-1 text-xs text-white/45">{payment.paidAt} · {payment.method}</p></div><div className="flex items-center gap-3"><div className="text-left"><p className="text-display text-2xl">{payment.amount.toLocaleString("ar-DZ")} د.ج</p><div className="mt-1"><StatusPill tone={payment.state === "Paid" ? "good" : "alert"}>{payment.state === "Paid" ? "مدفوع" : "مستحق"}</StatusPill></div></div>{payment.state === "Paid" && <div className="flex gap-2"><button onClick={() => downloadPdfReceipt(payment)} className="rounded-full border border-white/15 p-2.5 text-white/65 hover:text-white" title="Download PDF"><Download className="h-4 w-4" /></button><button onClick={() => printArabicReceipt(payment)} className="rounded-full border border-white/15 p-2.5 text-white/65 hover:text-white" title="Print Arabic receipt"><ReceiptText className="h-4 w-4" /></button></div>}</div></div>)}</div></div></>;

    if (activeView === "reports") return <><SectionHeader eyebrow="Approved progress report" title={<>{dashboardTitle}<br /><em className="not-italic text-white/55">جهّز نسخة واضحة للطالب وولي الأمر.</em></>} copy="يمكن للمعلم أو المدير طباعة تقرير التقدم بعد مراجعة الدليل. لا ينشئ النظام نتيجة أكاديمية تلقائية." action={<button onClick={printProgressReport} className="liquid-glass rounded-full px-5 py-3 text-sm"><FileText className="ml-2 inline h-4 w-4" />طباعة / حفظ PDF</button>} /><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><article className="surface-panel rounded-2xl p-6"><p className="text-display text-4xl">{currentStudent.nameAr}</p><p className="mt-2 text-sm text-white/55">{currentStudent.grade} · {currentStudent.guardian}</p><div className="my-8 border-t border-white/10" /><p className="text-xs uppercase tracking-[0.15em] text-white/45">الحضور</p><p className="text-display mt-3 text-5xl">{currentStudent.attendance}%</p><p className="mt-5 text-xs text-white/45">مواد مسجلة</p><div className="mt-3 flex flex-wrap gap-2">{currentStudent.subjects.slice(0, 6).map((id) => <StatusPill key={id}>{subjectName(id, "ar")}</StatusPill>)}</div></article><article className="surface-panel rounded-2xl p-6"><div className="flex items-center justify-between"><div><p className="text-display text-3xl">تقدم اللغة الإنجليزية</p><p className="mt-1 text-xs text-white/45">تقييم معتمد في {selectedAssessment.date}</p></div><p className="text-display text-5xl">{selectedAssessment.level}</p></div><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["التحدث", selectedAssessment.speaking], ["الاستماع", selectedAssessment.listening], ["القراءة", selectedAssessment.reading], ["الكتابة", selectedAssessment.writing]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/10 p-4"><p className="text-xs text-white/45">{label}</p><p className="text-display mt-4 text-3xl">{value}%</p></div>)}</div><div className="mt-5 rounded-xl bg-white/5 p-5 text-sm leading-7 text-white/70">{selectedAssessment.note}</div></article></div></>;

    if (activeView === "knowledge") return <KnowledgeAdministration />;
    if (activeView === "ask") return <PublicKnowledgeAgent />;

    return null;
  };

  return <main className="min-h-screen bg-[hsl(201_100%_13%)] text-white" dir={direction}><div className="mx-auto flex min-h-screen max-w-[1600px]"><aside className={`fixed inset-y-0 z-40 w-72 border-l border-white/10 bg-[#00364A] px-5 py-6 transition-transform lg:static lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "translate-x-full"} ${direction === "ltr" ? "right-auto left-0 lg:border-r lg:border-l-0" : "right-0"}`}><button onClick={() => setScreen("landing")} className="mb-12 flex items-center gap-3 text-right"><img src={MARK_URL} alt="" className="h-9 w-9 object-contain" /><span className="text-display text-3xl">EduPulse<sup className="text-xs align-top">•</sup></span></button><div className="mb-7 flex items-center justify-between"><div><p className="text-xs text-white/45">الدور الحالي</p><p className="mt-1 text-sm">{roleInfo[role].arabic}</p></div><button onClick={() => setScreen("access")} className="rounded-full p-2 text-white/55 hover:bg-white/7 hover:text-white" title="Change role"><ChevronRight className="h-4 w-4" /></button></div><nav className="space-y-1">{visibleNav.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${activeView === item.id ? "bg-white text-[#00364A]" : "text-white/55 hover:bg-white/6 hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav><div className="mt-auto absolute inset-x-5 bottom-6 surface-panel rounded-2xl p-4"><div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-200" />سجل محلي</div><p className="mt-2 text-xs leading-5 text-white/55">واجهة دور محلي للتجربة. تصدير ونسخ احتياطي جاهزان للمراجعة.</p><button onClick={downloadBackup} className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3 text-xs text-white/75 hover:text-white">تصدير السجل <Download className="h-3.5 w-3.5" /></button></div></aside>{mobileMenu && <button onClick={() => setMobileMenu(false)} className="fixed inset-0 z-30 bg-black/55 lg:hidden" aria-label="Close navigation" />}<section className="min-w-0 flex-1 px-5 py-5 lg:px-8 lg:py-7"><header className="mb-10 flex items-center justify-between gap-4"><div className="flex items-center gap-3 lg:hidden"><button onClick={() => setMobileMenu(true)} className="liquid-glass rounded-full p-2.5"><Menu className="h-4 w-4" /></button><img src={MARK_URL} alt="" className="h-8 w-8" /></div><div className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/45 md:flex"><Search className="h-4 w-4" />بحث في السجل المحلي <span className="mr-auto rounded border border-white/10 px-1.5 py-0.5 text-[10px]">⌘ K</span></div><div className="mr-auto flex items-center gap-2"><button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="rounded-full px-3 py-2 text-xs text-white/60 hover:text-white">{isArabic ? "EN" : "العربية"}</button><button onClick={() => toast.info("التنبيهات ستظهر عند تفعيل قائمة المهام في نسخة سطح المكتب.")} className="relative rounded-full p-2.5 text-white/70 hover:bg-white/6 hover:text-white"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-200" /></button><button onClick={() => { setScreen("landing"); toast.info("تم إنهاء جلسة الدور المحلي."); }} className="rounded-full p-2.5 text-white/60 hover:bg-white/6 hover:text-white" title="Logout"><LogOut className="h-5 w-5" /></button></div></header>{loading ? <div className="flex min-h-[60vh] items-center justify-center text-white/60"><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> <span className="mr-3">فتح السجل المحلي</span></div> : renderView()}</section></div>{registrationOpen && <Modal title="تسجيل طالب جديد" onClose={() => setRegistrationOpen(false)}><RegistrationPanel registration={registration} setRegistration={setRegistration} toggleSubject={toggleSubject} submitRegistration={submitRegistration} compact /></Modal>}{paymentOpen && <Modal title="تسجيل دفعة" onClose={() => setPaymentOpen(false)}><form onSubmit={savePayment} className="space-y-5"><label className="block text-xs text-white/50">الطالب<select value={paymentForm.studentId} onChange={(event) => setPaymentForm({ ...paymentForm, studentId: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none">{data.students.map((student) => <option key={student.id} value={student.id}>{student.nameAr}</option>)}</select></label><label className="block text-xs text-white/50">المبلغ (د.ج)<input value={paymentForm.amount} inputMode="numeric" onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none" placeholder="مثال: 6000" /></label><label className="block text-xs text-white/50">طريقة الدفع<select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none"><option>Cash</option><option>Bank transfer</option><option>Cheque</option></select></label><button className="liquid-glass w-full rounded-full px-5 py-3 text-sm">حفظ الدفعة وإنشاء إيصال</button></form></Modal>}</main>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#002334]/85 p-4" role="dialog" aria-modal="true"><section className="surface-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"><header className="mb-6 flex items-start justify-between"><div><p className="text-display text-4xl">{title}</p><p className="mt-1 text-sm text-white/50">يُحفظ في السجل المحلي لهذه التجربة.</p></div><button onClick={onClose} className="rounded-full p-2 text-white/55 hover:bg-white/7 hover:text-white"><X className="h-4 w-4" /></button></header>{children}</section></div>;
}

function RegistrationPanel({ registration, setRegistration, toggleSubject, submitRegistration, compact = false }: { registration: { nameAr: string; name: string; guardian: string; phone: string; grade: string; subjects: string[] }; setRegistration: React.Dispatch<React.SetStateAction<{ nameAr: string; name: string; guardian: string; phone: string; grade: string; subjects: string[] }>>; toggleSubject: (subject: string) => void; submitRegistration: (event: FormEvent) => void; compact?: boolean }) {
  return <form onSubmit={submitRegistration} className={compact ? "space-y-5" : "surface-panel rounded-2xl p-6"}><div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs text-white/50">اسم الطالب بالعربية *<input value={registration.nameAr} onChange={(event) => setRegistration({ ...registration, nameAr: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="مثال: سارة عبد الرحمن" /></label><label className="block text-xs text-white/50">الاسم باللاتينية<input value={registration.name} onChange={(event) => setRegistration({ ...registration, name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="Optional" /></label><label className="block text-xs text-white/50">ولي الأمر *<input value={registration.guardian} onChange={(event) => setRegistration({ ...registration, guardian: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="الاسم الكامل" /></label><label className="block text-xs text-white/50">هاتف ولي الأمر *<input value={registration.phone} onChange={(event) => setRegistration({ ...registration, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/35" placeholder="+213 ..." /></label><label className="block text-xs text-white/50">الصف الدراسي<select value={registration.grade} onChange={(event) => setRegistration({ ...registration, grade: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none">{["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"].map((grade) => <option key={grade}>{grade}</option>)}</select></label><div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm text-white/55"><span className="text-xs">اللغة الافتراضية</span><p className="mt-2">العربية · RTL</p></div></div><div className="mt-7"><div className="flex items-center justify-between"><p className="text-sm">المواد الدراسية</p><span className="text-xs text-white/45">{registration.subjects.length} مواد مختارة</span></div><div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{SUBJECTS.map((subject) => <button type="button" key={subject.id} onClick={() => toggleSubject(subject.id)} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-right text-sm transition ${registration.subjects.includes(subject.id) ? "border-white bg-white text-[#00364A]" : "border-white/12 bg-white/[0.025] text-white/70 hover:border-white/35"}`}><span>{subject.nameAr}</span>{registration.subjects.includes(subject.id) && <Check className="h-4 w-4" />}</button>)}</div></div><button className="liquid-glass mt-7 w-full rounded-full px-5 py-3 text-sm">حفظ تسجيل الطالب</button></form>;
}
