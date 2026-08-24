import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePlus,
  ClipboardCheck,
  Database,
  Download,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";

/**
 * EduPulse design reminder: this page applies the supplied fullscreen cinematic
 * video, Instrument Serif/Inter pairing, liquid glass, deep-navy palette, and
 * restrained fade-rise motion to a local-first education management workspace.
 */

type Learner = {
  id: string;
  name: string;
  programme: string;
  level: string;
  guardian: string;
  status: "Active" | "Placement" | "Follow-up";
  attendance: number;
};

type Task = {
  id: string;
  title: string;
  detail: string;
  due: string;
  complete: boolean;
  category: "Admissions" | "Teaching" | "Supervision";
};

type Admission = {
  id: string;
  name: string;
  programme: string;
  stage: "New" | "Assessment" | "Trial" | "Offer";
  nextAction: string;
};

type Cohort = {
  id: string;
  name: string;
  programme: string;
  educator: string;
  schedule: string;
  enrolled: number;
  capacity: number;
};

type AttendanceEntry = {
  learnerId: string;
  cohortId: string;
  status: "Present" | "Late" | "Excused" | "Absent";
};

type Milestone = {
  id: string;
  learner: string;
  title: string;
  due: string;
  status: "Due today" | "This week" | "Review";
};

type Payment = {
  id: string;
  learner: string;
  label: string;
  amount: string;
  state: "Paid" | "Balance due";
};

type LocalWorkspace = {
  learners: Learner[];
  tasks: Task[];
  admissions: Admission[];
  cohorts: Cohort[];
  attendance: AttendanceEntry[];
  milestones: Milestone[];
  payments: Payment[];
};

const DB_NAME = "edupulse-local-workspace";
const STORE_NAME = "workspace";
const DATA_KEY = "edupulse-main";
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const MARK_URL = "/manus-storage/edupulse-mark_2dba4aaa.png";
const ADMISSIONS_IMAGE = "/manus-storage/edupulse-admissions-desk_4d301878.jpg";
const LEARNING_IMAGE = "/manus-storage/edupulse-learning-room_8022d35a.jpg";

const initialWorkspace: LocalWorkspace = {
  learners: [
    { id: "l-001", name: "Amal Benyahia", programme: "Academic English", level: "B2", guardian: "Nadia Benyahia", status: "Active", attendance: 94 },
    { id: "l-002", name: "Youssef Rahmani", programme: "IELTS Foundation", level: "B1", guardian: "Khaled Rahmani", status: "Placement", attendance: 0 },
    { id: "l-003", name: "Rania Cherif", programme: "General English", level: "A2", guardian: "Hana Cherif", status: "Follow-up", attendance: 76 },
  ],
  tasks: [
    { id: "t-001", title: "Confirm Youssef’s placement time", detail: "Admissions · Guardian requested Saturday", due: "Today", complete: false, category: "Admissions" },
    { id: "t-002", title: "Review Chapter 2 outline", detail: "Supervision · M. Bouzid", due: "Today", complete: false, category: "Supervision" },
    { id: "t-003", title: "Prepare B2 attendance note", detail: "Teaching · Saturday morning cohort", due: "Tomorrow", complete: false, category: "Teaching" },
  ],
  admissions: [
    { id: "a-001", name: "Meriem Saidi", programme: "IELTS Foundation", stage: "New", nextAction: "Call before 16:00" },
    { id: "a-002", name: "Youssef Rahmani", programme: "IELTS Foundation", stage: "Assessment", nextAction: "Placement on Saturday" },
    { id: "a-003", name: "Amina Haddad", programme: "Academic English", stage: "Trial", nextAction: "Review trial note" },
    { id: "a-004", name: "Sofia Haroun", programme: "General English", stage: "Offer", nextAction: "Await guardian confirmation" },
  ],
  cohorts: [
    { id: "c-001", name: "B2 Saturday Morning", programme: "Academic English", educator: "Dr. A. Benali", schedule: "Sat · 09:00–11:00", enrolled: 18, capacity: 20 },
    { id: "c-002", name: "IELTS Evening 01", programme: "IELTS Foundation", educator: "M. Belkacem", schedule: "Tue · 17:30–19:30", enrolled: 14, capacity: 16 },
  ],
  attendance: [
    { learnerId: "l-001", cohortId: "c-001", status: "Present" },
    { learnerId: "l-003", cohortId: "c-001", status: "Late" },
  ],
  milestones: [
    { id: "m-001", learner: "M. Bouzid", title: "Chapter 2 outline", due: "Today", status: "Due today" },
    { id: "m-002", learner: "S. Khelifi", title: "Ethics application revisions", due: "Thursday", status: "This week" },
    { id: "m-003", learner: "I. Fares", title: "Literature review comments", due: "Submitted", status: "Review" },
  ],
  payments: [
    { id: "p-001", learner: "Amal Benyahia", label: "Academic English · Term 2", amount: "18,000 DZD", state: "Paid" },
    { id: "p-002", learner: "Rania Cherif", label: "General English · Installment 2", amount: "6,000 DZD", state: "Balance due" },
  ],
};

function openLocalDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readWorkspace(): Promise<LocalWorkspace> {
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(DATA_KEY);
    request.onsuccess = () => resolve(request.result ?? initialWorkspace);
    request.onerror = () => reject(request.error);
  });
}

async function saveWorkspace(data: LocalWorkspace) {
  const db = await openLocalDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(data, DATA_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

const copy = {
  en: {
    home: "Today",
    learners: "Learner records",
    cohorts: "Cohort board",
    supervision: "Supervision ledger",
    backups: "Local backup",
    open: "Open local records",
    titleStart: "Every learner.",
    titleMuted: "One clear record.",
    titleEnd: "",
    intro: "EduPulse keeps the learner history, follow-ups, and teaching commitments that need your attention in one private local workspace.",
  },
  ar: {
    home: "اليوم",
    learners: "سجلات الطلاب",
    cohorts: "لوحة الأفواج",
    supervision: "سجل الإشراف",
    backups: "نسخة محلية",
    open: "فتح السجلات المحلية",
    titleStart: "كل طالب.",
    titleMuted: "سجل واضح واحد.",
    titleEnd: "",
    intro: "يجمع EduPulse سجل الطالب والمهام والمتابعات التي تحتاج اهتمامك في مساحة عمل خاصة ومحلية واحدة.",
  },
};

function StatusDot({ status }: { status: Learner["status"] }) {
  const color = status === "Active" ? "bg-emerald-300" : status === "Placement" ? "bg-amber-200" : "bg-rose-300";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} aria-hidden="true" />;
}

function MiniBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10" aria-label={`${value}% attendance`}>
      <div className="h-full rounded-full bg-white/80" style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">{children}</p>;
}

function StagePill({ stage }: { stage: Admission["stage"] }) {
  const styles: Record<Admission["stage"], string> = {
    New: "border-white/15 bg-white/6 text-white/70",
    Assessment: "border-amber-200/25 bg-amber-200/10 text-amber-100",
    Trial: "border-sky-200/25 bg-sky-200/10 text-sky-100",
    Offer: "border-emerald-200/25 bg-emerald-200/10 text-emerald-100",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${styles[stage]}`}>{stage}</span>;
}

export default function Home() {
  const [screen, setScreen] = useState<"welcome" | "workspace">("welcome");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [activeSection, setActiveSection] = useState("Today");
  const [workspace, setWorkspace] = useState<LocalWorkspace>(initialWorkspace);
  const [isLoading, setIsLoading] = useState(true);
  const [isLearnerFormOpen, setLearnerFormOpen] = useState(false);
  const [newLearner, setNewLearner] = useState({ name: "", programme: "General English", level: "A1", guardian: "" });

  const text = copy[language];
  const direction = language === "ar" ? "rtl" : "ltr";
  const todayLabel = useMemo(() => new Intl.DateTimeFormat(language === "ar" ? "ar-DZ" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date()), [language]);
  const openTasks = workspace.tasks.filter((task) => !task.complete);
  const followUps = workspace.learners.filter((learner) => learner.status === "Follow-up").length;

  useEffect(() => {
    let mounted = true;
    readWorkspace()
      .then(async (stored) => {
        if (!stored || !stored.learners) {
          await saveWorkspace(initialWorkspace);
          return initialWorkspace;
        }
        return {
          ...initialWorkspace,
          ...stored,
          admissions: stored.admissions ?? initialWorkspace.admissions,
          cohorts: stored.cohorts ?? initialWorkspace.cohorts,
          attendance: stored.attendance ?? initialWorkspace.attendance,
          milestones: stored.milestones ?? initialWorkspace.milestones,
          payments: stored.payments ?? initialWorkspace.payments,
        };
      })
      .then((data) => mounted && setWorkspace(data))
      .catch(() => mounted && toast.error("Local workspace could not be opened."))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  const updateWorkspace = async (next: LocalWorkspace) => {
    setWorkspace(next);
    try {
      await saveWorkspace(next);
    } catch {
      toast.error("The change could not be saved locally.");
    }
  };

  const toggleTask = async (taskId: string) => {
    const next = {
      ...workspace,
      tasks: workspace.tasks.map((task) => task.id === taskId ? { ...task, complete: !task.complete } : task),
    };
    await updateWorkspace(next);
    toast.success("Task updated in the local workspace.");
  };

  const addLearner = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newLearner.name.trim()) return toast.error("Enter the learner’s name first.");
    const next: LocalWorkspace = {
      ...workspace,
      learners: [{ id: `l-${Date.now()}`, name: newLearner.name.trim(), programme: newLearner.programme, level: newLearner.level, guardian: newLearner.guardian || "Not added", status: "Placement", attendance: 0 }, ...workspace.learners],
    };
    await updateWorkspace(next);
    setNewLearner({ name: "", programme: "General English", level: "A1", guardian: "" });
    setLearnerFormOpen(false);
    toast.success("Learner saved to this device.");
  };

  const advanceAdmission = async (admissionId: string) => {
    const stages: Admission["stage"][] = ["New", "Assessment", "Trial", "Offer"];
    const next = {
      ...workspace,
      admissions: workspace.admissions.map((admission) => {
        if (admission.id !== admissionId) return admission;
        const nextStage = stages[Math.min(stages.indexOf(admission.stage) + 1, stages.length - 1)];
        return { ...admission, stage: nextStage, nextAction: nextStage === "Offer" ? "Prepare offer" : `Move to ${nextStage.toLowerCase()}` };
      }),
    };
    await updateWorkspace(next);
    toast.success("Admission pipeline updated locally.");
  };

  const markAttendance = async (learnerId: string, cohortId: string, status: AttendanceEntry["status"]) => {
    const existing = workspace.attendance.find((entry) => entry.learnerId === learnerId && entry.cohortId === cohortId);
    const next = {
      ...workspace,
      attendance: existing
        ? workspace.attendance.map((entry) => entry.learnerId === learnerId && entry.cohortId === cohortId ? { ...entry, status } : entry)
        : [...workspace.attendance, { learnerId, cohortId, status }],
    };
    await updateWorkspace(next);
    toast.success(`${status} saved locally.`);
  };

  const exportBackup = () => {
    const payload = { format: "edupulse-local-export", exportedAt: new Date().toISOString(), data: workspace };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `edupulse-local-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Local backup exported.");
  };

  if (screen === "welcome") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[hsl(201_100%_13%)] text-white" dir={direction}>
        <video className="absolute inset-0 z-0 h-full w-full object-cover" autoPlay loop muted playsInline poster="/manus-storage/edupulse-cinematic-school-fallback_a69e1a92.jpg">
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8">
          <header className="liquid-glass flex items-center justify-between rounded-full px-5 py-3 sm:px-6" aria-label="EduPulse navigation">
            <button onClick={() => setScreen("welcome")} className="relative z-10 flex min-w-0 items-center gap-2 text-left text-white sm:gap-3" aria-label="EduPulse home">
              <img src={MARK_URL} alt="" className="h-8 w-8 object-contain" />
              <span className="text-display text-2xl leading-none tracking-tight sm:text-3xl">EduPulse<sup className="ml-0.5 text-xs align-top">•</sup></span>
            </button>
            <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
              {[text.home, text.learners, text.cohorts, text.supervision, text.backups].map((item, index) => (
                <button key={item} onClick={() => index === 0 ? setScreen("welcome") : setScreen("workspace")} data-active={index === 0} className="nav-link relative z-10 text-sm">{item}</button>
              ))}
            </nav>
            <div className="relative z-10 flex items-center gap-2">
              <button onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="relative z-10 hidden rounded-full px-3 py-2 text-xs text-white/70 transition hover:text-white sm:block" aria-label="Switch language">{language === "en" ? "العربية" : "EN"}</button>
              <button onClick={() => setScreen("workspace")} className="liquid-glass relative z-10 rounded-full px-4 py-2.5 text-sm text-white transition duration-200 hover:scale-[1.03] active:scale-[0.97] sm:px-6"><span className="sm:hidden">{language === "en" ? "Open" : "فتح"}</span><span className="hidden sm:inline">{text.open}</span></button>
            </div>
          </header>

          <section className="flex flex-1 flex-col items-center justify-center px-2 pb-40 pt-32 text-center sm:px-6" aria-labelledby="welcome-title">
            <div className="animate-fade-rise mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-white/60"><span>Local-first education management</span><span className="h-px w-9 bg-white/30" /><span className="tracking-[0.14em]">Records 003 · Tasks 003</span></div>
            <h1 id="welcome-title" className="animate-fade-rise text-display max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl">
              {text.titleStart}<br />{text.titleMuted}
            </h1>
            <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-[hsl(240_4%_66%)] sm:text-lg">{text.intro}</p>
            <button onClick={() => setScreen("workspace")} className="liquid-glass animate-fade-rise-delay-2 mt-12 rounded-full px-10 py-5 text-base text-white transition duration-200 hover:scale-[1.03] active:scale-[0.97] sm:px-14">{text.open}<ArrowUpRight className="ml-2 inline h-4 w-4" /></button>
          </section>
          <footer className="flex items-center justify-between text-xs text-white/55">
            <span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5" /> Browser-local prototype · no cloud account</span>
            <span>Index ready · English / العربية</span>
          </footer>
        </div>
      </main>
    );
  }

  const menuItems = [
    { label: "Today", icon: LayoutDashboard }, { label: "Admissions", icon: UserRoundPlus }, { label: "Learners", icon: UsersRound }, { label: "Cohorts", icon: BookOpen }, { label: "Attendance", icon: ClipboardCheck }, { label: "Supervision", icon: GraduationCap }, { label: "Payments", icon: WalletCards }, { label: "Backups", icon: Database },
  ];

  return (
    <main className="min-h-screen bg-[hsl(201_100%_13%)] text-white" dir={direction}>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[272px] shrink-0 flex-col border-r border-white/10 px-5 py-6 lg:flex">
          <button onClick={() => setScreen("welcome")} className="mb-12 flex items-center gap-3 text-left"><img src={MARK_URL} alt="" className="h-9 w-9 object-contain" /><span className="text-display text-3xl">EduPulse<sup className="text-xs align-top">•</sup></span></button>
          <div className="mb-7 flex items-center justify-between px-2"><span className="text-xs uppercase tracking-[0.18em] text-white/45">Workspace</span><button className="text-white/55 transition hover:text-white" onClick={() => toast.info("Workspace switcher is part of the local multi-school release.")}><MoreHorizontal className="h-4 w-4" /></button></div>
          <nav className="space-y-1" aria-label="Workspace navigation">
            {menuItems.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => { setActiveSection(label); if (label === "Backups") exportBackup(); }} data-active={activeSection === label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${activeSection === label ? "bg-white text-[#00364A]" : "text-white/55 hover:bg-white/6 hover:text-white"}`}><Icon className="h-4 w-4" />{label}</button>
            ))}
          </nav>
          <div className="mt-auto surface-panel rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-200" />Local workspace</div>
            <p className="mt-2 text-xs leading-5 text-white/55">Records are stored in this browser’s local database for this prototype.</p>
            <button onClick={exportBackup} className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3 text-xs text-white/75 hover:text-white">Export backup <Download className="h-3.5 w-3.5" /></button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7">
          <header className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden"><button onClick={() => setScreen("welcome")} className="liquid-glass rounded-full p-2.5"><PanelLeftClose className="h-4 w-4" /></button><img src={MARK_URL} alt="" className="h-8 w-8" /></div>
            <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/45 md:flex"><Search className="h-4 w-4" />Search this workspace <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[10px]">⌘ K</span></div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="rounded-full px-3 py-2 text-xs text-white/60 hover:text-white">{language === "en" ? "العربية" : "EN"}</button>
              <button onClick={() => toast.info("Notifications will be included in the local task queue.")} className="relative rounded-full p-2.5 text-white/70 hover:bg-white/6 hover:text-white"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-200" /></button>
              <button onClick={() => setLearnerFormOpen(true)} className="liquid-glass hidden rounded-full px-5 py-2.5 text-sm transition hover:scale-[1.03] active:scale-[0.97] sm:block"><CirclePlus className="mr-2 inline h-4 w-4" />New learner</button>
            </div>
          </header>

          {isLoading ? <div className="flex min-h-[60vh] items-center justify-center text-white/60"><Loader2 className="mr-3 h-5 w-5 animate-spin" />Opening local workspace</div> : <>
            <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">{todayLabel}</p><h1 className="text-display text-5xl leading-none sm:text-6xl">A clear day for <em className="not-italic text-white/55">every learner.</em></h1></div>
              <button onClick={() => setLearnerFormOpen(true)} className="liquid-glass inline-flex w-fit rounded-full px-5 py-3 text-sm sm:hidden"><CirclePlus className="mr-2 h-4 w-4" />New learner</button>
            </div>

            {activeSection === "Admissions" && <section className="mb-10 grid gap-4 lg:grid-cols-4">{(["New", "Assessment", "Trial", "Offer"] as const).map((stage) => <div key={stage} className="surface-panel min-h-72 rounded-2xl p-4"><div className="mb-5 flex items-center justify-between"><StagePill stage={stage} /><span className="text-xs text-white/40">{workspace.admissions.filter((admission) => admission.stage === stage).length}</span></div><div className="space-y-3">{workspace.admissions.filter((admission) => admission.stage === stage).map((admission) => <article key={admission.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><p className="font-medium">{admission.name}</p><p className="mt-1 text-xs text-white/45">{admission.programme}</p><div className="mt-5 flex items-center justify-between gap-2"><span className="text-[11px] text-white/55">{admission.nextAction}</span>{stage !== "Offer" && <button onClick={() => advanceAdmission(admission.id)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label={`Advance ${admission.name}`}><ChevronRight className="h-4 w-4" /></button>}</div></article>)}</div></div>)}</section>}

            {activeSection === "Learners" && <section className="surface-panel mb-10 overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><div><p className="text-display text-3xl">Learner records</p><p className="mt-1 text-xs text-white/45">Identity, guardian, programme, and attendance context</p></div><button onClick={() => setLearnerFormOpen(true)} className="liquid-glass rounded-full px-4 py-2 text-xs">Add learner</button></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.13em] text-white/40"><tr><th className="px-5 py-4 font-medium">Learner</th><th className="px-4 py-4 font-medium">Guardian</th><th className="px-4 py-4 font-medium">Programme</th><th className="px-4 py-4 font-medium">Level</th><th className="px-4 py-4 font-medium">Attendance</th></tr></thead><tbody>{workspace.learners.map((learner) => <tr key={learner.id} className="border-t border-white/8 hover:bg-white/[0.035]"><td className="px-5 py-4 font-medium">{learner.name}</td><td className="px-4 py-4 text-white/60">{learner.guardian}</td><td className="px-4 py-4">{learner.programme}</td><td className="px-4 py-4 text-white/60">{learner.level}</td><td className="px-4 py-4"><div className="flex items-center gap-3"><MiniBar value={learner.attendance} /><span className="text-xs text-white/55">{learner.attendance || "—"}{learner.attendance ? "%" : ""}</span></div></td></tr>)}</tbody></table></div></section>}

            {activeSection === "Cohorts" && <section className="mb-10 grid gap-5 md:grid-cols-2">{workspace.cohorts.map((cohort) => <article key={cohort.id} className="surface-panel rounded-2xl p-5"><div className="flex items-start justify-between"><div><p className="text-display text-3xl">{cohort.name}</p><p className="mt-1 text-sm text-white/50">{cohort.programme}</p></div><BookOpen className="h-5 w-5 text-white/40" /></div><div className="my-7 border-t border-white/10" /><dl className="grid grid-cols-2 gap-y-5 text-sm"><div><dt className="text-xs text-white/45">Educator</dt><dd className="mt-1">{cohort.educator}</dd></div><div><dt className="text-xs text-white/45">Schedule</dt><dd className="mt-1">{cohort.schedule}</dd></div><div><dt className="text-xs text-white/45">Capacity</dt><dd className="mt-1">{cohort.enrolled} / {cohort.capacity}</dd></div><div><dt className="text-xs text-white/45">Available</dt><dd className="mt-1">{cohort.capacity - cohort.enrolled} seats</dd></div></dl></article>)}</section>}

            {activeSection === "Attendance" && <section className="surface-panel mb-10 overflow-hidden rounded-2xl"><div className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center"><div><p className="text-display text-3xl">B2 Saturday Morning</p><p className="mt-1 text-xs text-white/45">Marking persists in this browser’s local database immediately.</p></div><span className="text-xs text-white/50">Today · 09:00–11:00</span></div><div className="divide-y divide-white/8">{workspace.learners.slice(0, 3).map((learner) => { const entry = workspace.attendance.find((item) => item.learnerId === learner.id && item.cohortId === "c-001"); return <div key={learner.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"><div className="min-w-48"><p className="font-medium">{learner.name}</p><p className="mt-1 text-xs text-white/45">{learner.programme} · {learner.level}</p></div><div className="flex flex-wrap gap-2">{(["Present", "Late", "Excused", "Absent"] as const).map((status) => <button key={status} onClick={() => markAttendance(learner.id, "c-001", status)} className={`rounded-full border px-3 py-1.5 text-xs transition ${entry?.status === status ? "border-white bg-white text-[#00364A]" : "border-white/14 text-white/60 hover:border-white/40 hover:text-white"}`}>{status}</button>)}</div></div>})}</div></section>}

            {activeSection === "Supervision" && <section className="surface-panel mb-10 overflow-hidden rounded-2xl"><div className="border-b border-white/10 px-5 py-5"><p className="text-display text-3xl">Academic milestones</p><p className="mt-1 text-xs text-white/45">PhD and postgraduate work stays visible without becoming a student-record system.</p></div><div className="divide-y divide-white/8">{workspace.milestones.map((milestone) => <div key={milestone.id} className="flex items-center justify-between gap-5 px-5 py-5"><div><p className="font-medium">{milestone.title}</p><p className="mt-1 text-xs text-white/45">{milestone.learner}</p></div><div className="text-right"><span className={`text-xs ${milestone.status === "Due today" ? "text-amber-100" : "text-white/60"}`}>{milestone.due}</span><p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/35">{milestone.status}</p></div></div>)}</div></section>}

            {activeSection === "Payments" && <section className="surface-panel mb-10 overflow-hidden rounded-2xl"><div className="border-b border-white/10 px-5 py-5"><p className="text-display text-3xl">Local ledger</p><p className="mt-1 text-xs text-white/45">Payment entries and receipts are planned for the encrypted desktop database release.</p></div><div className="divide-y divide-white/8">{workspace.payments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-5 px-5 py-5"><div><p className="font-medium">{payment.learner}</p><p className="mt-1 text-xs text-white/45">{payment.label}</p></div><div className="text-right"><p className="text-display text-2xl">{payment.amount}</p><p className={`mt-1 text-[10px] uppercase tracking-[0.13em] ${payment.state === "Paid" ? "text-emerald-100" : "text-amber-100"}`}>{payment.state}</p></div></div>)}</div></section>}

            {activeSection === "Backups" && <section className="surface-panel mb-10 rounded-2xl p-6"><div className="grid gap-8 md:grid-cols-[1fr_auto]"><div><SectionEyebrow>Data portability</SectionEyebrow><p className="text-display text-4xl">Your records should never be trapped.</p><p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Export the current browser-local workspace as JSON. In the desktop release, this becomes an encrypted SQLite snapshot plus attachments and integrity checks.</p></div><div className="flex items-end"><button onClick={exportBackup} className="liquid-glass rounded-full px-6 py-3 text-sm"><Download className="mr-2 inline h-4 w-4" />Export local backup</button></div></div></section>}

            <section className="mb-10 grid gap-4 md:grid-cols-3" aria-label="Workspace overview">
              <div className="surface-panel rounded-2xl p-5"><div className="mb-10 flex items-center justify-between"><span className="text-sm text-white/60">Open follow-ups</span><ChevronRight className="h-4 w-4 text-white/40" /></div><p className="text-display text-5xl">{openTasks.length}</p><p className="mt-3 text-xs text-white/50">Across admissions, teaching, and supervision</p></div>
              <div className="surface-panel rounded-2xl p-5"><div className="mb-10 flex items-center justify-between"><span className="text-sm text-white/60">Active learners</span><UsersRound className="h-4 w-4 text-white/40" /></div><p className="text-display text-5xl">{workspace.learners.filter((learner) => learner.status === "Active").length}</p><p className="mt-3 text-xs text-white/50">In the local workspace today</p></div>
              <div className="surface-panel rounded-2xl p-5"><div className="mb-10 flex items-center justify-between"><span className="text-sm text-white/60">Needs review</span><Sparkles className="h-4 w-4 text-white/40" /></div><p className="text-display text-5xl">{followUps}</p><p className="mt-3 text-xs text-white/50">Attendance or guardian follow-up due</p></div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
              <div className="surface-panel overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><div><p className="text-display text-3xl">Learners in view</p><p className="mt-1 text-xs text-white/45">Local records · stored on this device</p></div><button onClick={() => setActiveSection("Learners")} className="text-xs text-white/60 hover:text-white">View all</button></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.13em] text-white/40"><tr><th className="px-5 py-4 font-medium">Learner</th><th className="px-4 py-4 font-medium">Programme</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">Attendance</th><th className="px-5 py-4" /></tr></thead><tbody>{workspace.learners.map((learner) => <tr key={learner.id} className="border-t border-white/8 transition hover:bg-white/[0.035]"><td className="px-5 py-4"><p className="font-medium text-white">{learner.name}</p><p className="mt-1 text-xs text-white/45">{learner.guardian}</p></td><td className="px-4 py-4"><p>{learner.programme}</p><p className="mt-1 text-xs text-white/45">{learner.level}</p></td><td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-xs text-white/70"><StatusDot status={learner.status} />{learner.status}</span></td><td className="px-4 py-4"><div className="flex items-center gap-2"><MiniBar value={learner.attendance} /><span className="text-xs text-white/55">{learner.attendance || "—"}{learner.attendance ? "%" : ""}</span></div></td><td className="px-5 py-4"><button onClick={() => toast.info(`${learner.name} profile is ready for the next workflow.`)} className="rounded-full p-1.5 text-white/45 hover:bg-white/8 hover:text-white"><ChevronRight className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
              </div>
              <div className="space-y-6">
                <div className="surface-panel rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div><p className="text-display text-3xl">Next actions</p><p className="mt-1 text-xs text-white/45">Human follow-up, never automatic sending</p></div><CalendarDays className="h-4 w-4 text-white/45" /></div><div className="space-y-1">{workspace.tasks.map((task) => <button key={task.id} onClick={() => toggleTask(task.id)} className={`group flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-white/6 ${task.complete ? "opacity-45" : ""}`}><span className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full border ${task.complete ? "border-emerald-200 bg-emerald-200 text-[#00364A]" : "border-white/35"}`}>{task.complete && <Check className="h-3 w-3" />}</span><span className="min-w-0 flex-1"><span className={`block text-sm ${task.complete ? "line-through" : ""}`}>{task.title}</span><span className="mt-1 block text-xs text-white/45">{task.detail}</span></span><span className="text-[10px] uppercase tracking-[0.12em] text-white/40">{task.due}</span></button>)}</div></div>
                <div className="relative overflow-hidden rounded-2xl border border-white/10"><img src={ADMISSIONS_IMAGE} alt="Admission materials on a desk" className="h-44 w-full object-cover opacity-75" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4"><div className="text-display text-2xl">Admissions, with context.</div><button onClick={() => setActiveSection("Admissions")} className="liquid-glass rounded-full p-2.5"><ArrowUpRight className="h-4 w-4" /></button></div></div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="surface-panel rounded-2xl p-5"><div className="flex items-start justify-between"><div><p className="text-display text-3xl">Your local record</p><p className="mt-2 max-w-sm text-sm leading-6 text-white/55">This first build stores learner and task data in browser-local IndexedDB. The desktop release will keep the same local-first behaviour through encrypted SQLite.</p></div><Database className="h-5 w-5 text-white/40" /></div><button onClick={exportBackup} className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"><Download className="h-4 w-4" />Export this workspace</button></div><div className="relative overflow-hidden rounded-2xl border border-white/10"><img src={LEARNING_IMAGE} alt="Calm learning room" className="h-52 w-full object-cover opacity-80" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-display text-3xl">Teaching should leave room to think.</p></div></div></section>
          </>}
        </section>
      </div>

      {isLearnerFormOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#002334]/80 p-4" role="dialog" aria-modal="true" aria-labelledby="new-learner-title"><form onSubmit={addLearner} className="surface-panel w-full max-w-md rounded-2xl p-6 shadow-2xl"><div className="mb-6 flex items-start justify-between"><div><p id="new-learner-title" className="text-display text-4xl">New learner</p><p className="mt-1 text-sm text-white/50">Saved only to this local workspace.</p></div><button type="button" onClick={() => setLearnerFormOpen(false)} className="rounded-full p-2 text-white/50 hover:bg-white/8 hover:text-white"><X className="h-4 w-4" /></button></div><label className="mb-4 block text-xs uppercase tracking-[0.12em] text-white/45">Learner name<input autoFocus value={newLearner.name} onChange={(event) => setNewLearner({ ...newLearner, name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/6 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/35" placeholder="Full name" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs uppercase tracking-[0.12em] text-white/45">Programme<select value={newLearner.programme} onChange={(event) => setNewLearner({ ...newLearner, programme: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none"><option>General English</option><option>Academic English</option><option>IELTS Foundation</option></select></label><label className="block text-xs uppercase tracking-[0.12em] text-white/45">Current level<select value={newLearner.level} onChange={(event) => setNewLearner({ ...newLearner, level: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-[#00364A] px-3 py-3 text-sm text-white outline-none"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label></div><label className="mt-4 block text-xs uppercase tracking-[0.12em] text-white/45">Guardian / contact<input value={newLearner.guardian} onChange={(event) => setNewLearner({ ...newLearner, guardian: event.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-white/6 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/35" placeholder="Optional" /></label><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setLearnerFormOpen(false)} className="rounded-full px-4 py-2.5 text-sm text-white/60 hover:text-white">Cancel</button><button type="submit" className="liquid-glass rounded-full px-5 py-2.5 text-sm">Save learner</button></div></form></div>}
    </main>
  );
}
