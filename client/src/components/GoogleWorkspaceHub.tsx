import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Calendar,
  FileText,
  CheckSquare,
  Presentation,
  StickyNote,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Share2,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  initGoogleAuth,
  getGoogleAccessToken,
  createGoogleSpreadsheet,
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  createGoogleDoc,
  listGoogleTasks,
  createGoogleTask,
  toggleGoogleTaskStatus,
  deleteGoogleTask,
  createGooglePresentation,
  addSlidesToPresentation,
  createGoogleForm,
  buildGoogleWorkspaceEmbedUrl,
  type GoogleCalendarEventItem,
  type GoogleTaskItem,
  type GoogleFormResult,
} from "@/lib/googleWorkspace";
import {
  listGoogleWorkspaceRecords,
  saveGoogleWorkspaceRecord,
  removeGoogleWorkspaceRecord,
  type GoogleWorkspaceFileRecord,
} from "@/lib/googleWorkspaceStorage";
import { GoogleWorkspaceEmbedViewer } from "./academic/GoogleWorkspaceEmbedViewer";
import { type User } from "firebase/auth";

interface Props {
  isArabic: boolean;
  students?: any[];
  payments?: any[];
}

export function GoogleWorkspaceHub({ isArabic, students = [], payments = [] }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sheets" | "slides" | "forms" | "calendar" | "docs" | "tasks" | "keep">("sheets");

  // Active embedded workspace file to display directly inside platform
  const [activeEmbeddedFile, setActiveEmbeddedFile] = useState<GoogleWorkspaceFileRecord | null>(null);
  const [savedWorkspaceFiles, setSavedWorkspaceFiles] = useState<GoogleWorkspaceFileRecord[]>([]);

  // Forms state
  const [exportedForms, setExportedForms] = useState<
    { title: string; url: string; date: string; fileId?: string; embedUrl?: string }[]
  >([]);
  const [customFormTitle, setCustomFormTitle] = useState("");
  const [customFormDesc, setCustomFormDesc] = useState("");

  // Confirmation Modal state for destructive actions
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: async () => {},
  });

  // Sheets state
  const [exportedSheets, setExportedSheets] = useState<
    { title: string; url: string; date: string }[]
  >([]);
  const [customSheetTitle, setCustomSheetTitle] = useState("");

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEventItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEventTime, setNewEventTime] = useState("09:00");
  const [newEventLocation, setNewEventLocation] = useState("ثانوية مفدي زكريا - القاعة الكبرى");

  // Docs state
  const [exportedDocs, setExportedDocs] = useState<
    { title: string; url: string; date: string }[]
  >([]);
  const [customDocTitle, setCustomDocTitle] = useState("");
  const [customDocContent, setCustomDocContent] = useState("");

  // Tasks state
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");

  // Slides state
  const [exportedSlides, setExportedSlides] = useState<
    { title: string; url: string; date: string }[]
  >([]);
  const [customSlideTitle, setCustomSlideTitle] = useState("");

  // Keep & Memos state
  const [memos, setMemos] = useState<
    { id: string; title: string; content: string; tag: string; date: string }[]
  >([
    {
      id: "memo-1",
      title: "توجيهات تصحيح اختبار مادة الرياضيات",
      content: "مراعاة سلم التنقيط الوزاري للأسئلة التركيبية الخاصة بالدوال العددية والمتتاليات لشعبة علوم تجريبية.",
      tag: "بكالوريا",
      date: "2026-09-10",
    },
    {
      id: "memo-2",
      title: "لقاء أولياء تلاميذ السنة الثالثة ثانوي",
      content: "تحضير تقارير التقييم الإدراكي الفردي ومناقشة الدعم البيداغوجي الموجه.",
      tag: "إدارة وتواصل",
      date: "2026-09-08",
    },
  ]);
  const [newMemoTitle, setNewMemoTitle] = useState("");
  const [newMemoContent, setNewMemoContent] = useState("");
  const [newMemoTag, setNewMemoTag] = useState("تربوي");

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (token) {
      fetchCalendar();
      fetchTasks();
    }
  }, [token]);

  // Sync and load saved Google Workspace files from Firestore / storage
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const records = await listGoogleWorkspaceRecords();
        setSavedWorkspaceFiles(records);
      } catch (e) {
        console.warn("Could not list workspace records:", e);
      }
    };
    loadFiles();

    const handleSync = () => {
      loadFiles();
    };
    window.addEventListener("edupulse:google_file_saved", handleSync);
    window.addEventListener("edupulse:google_file_deleted", handleSync);
    return () => {
      window.removeEventListener("edupulse:google_file_saved", handleSync);
      window.removeEventListener("edupulse:google_file_deleted", handleSync);
    };
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithGoogleWorkspace();
      setUser(res.user);
      setToken(res.accessToken);
      toast.success(
        isArabic ? `تم الاتصال بحساب جوجل: ${res.user.email}` : `Connected to Google: ${res.user.email}`
      );
    } catch (err: any) {
      toast.error(
        err.message || (isArabic ? "تعذر تسجيل الدخول بحساب جوجل" : "Failed to sign in with Google")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setConfirmModal({
      isOpen: true,
      title: isArabic ? "قطع الاتصال بحساب جوجل" : "Disconnect Google Account",
      description: isArabic
        ? "هل أنت متأكد من رغبتك في تسجيل الخروج من حساب جوجل في هذه الجلسة؟"
        : "Are you sure you want to sign out of your Google session?",
      onConfirm: async () => {
        await signOutGoogleWorkspace();
        setUser(null);
        setToken(null);
        toast.info(isArabic ? "تم قطع الاتصال بحساب جوجل." : "Disconnected from Google.");
      },
    });
  };

  // Google Sheets actions
  const exportStudentsToGoogleSheets = async () => {
    if (!token) {
      toast.error(isArabic ? "يرجى تسجيل الدخول بحساب جوجل أولاً." : "Please connect Google account first.");
      return;
    }
    setLoading(true);
    try {
      const headers = [
        isArabic ? "المعرف" : "ID",
        isArabic ? "الاسم الكامل (عربي)" : "Name (Arabic)",
        isArabic ? "الاسم باللاتينية" : "Latin Name",
        isArabic ? "المستوى الدراسي" : "Grade Level",
        isArabic ? "ولي الأمر" : "Guardian",
        isArabic ? "الهاتف" : "Phone",
        isArabic ? "نسبة الحضور (%)" : "Attendance (%)",
        isArabic ? "الحالة" : "Status",
      ];

      const rows = students.length
        ? students.map((s) => [
            s.id,
            s.nameAr || s.name,
            s.name || "",
            s.grade,
            s.guardian,
            s.phone,
            s.attendance || 100,
            s.status,
          ])
        : [
            ["s-001", "أمل بن يحيى", "Amal Benyahia", "3AS - علوم تجريبية", "نادية بن يحيى", "+213 555 014 100", 94, "نشط"],
            ["s-002", "يوسف الرحماني", "Youssef Rahmani", "2AS - رياضيات", "خالد الرحماني", "+213 555 014 101", 88, "نشط"],
            ["s-003", "رانيا شريف", "Rania Cherif", "1AS - جذع مشترك علوم", "هناء شريف", "+213 555 014 102", 76, "مراجعة"],
          ];

      const res = await createGoogleSpreadsheet(
        isArabic ? "سجل طلاب EduPulse - الجزائر 2026" : "EduPulse Student Roster - Algeria 2026",
        [{ title: isArabic ? "قائمة الطلاب" : "Students", rows: [headers, ...rows] }],
        {
          linkedRecord: { type: "student", id: "all-students-2026", name: isArabic ? "سجل طلاب الجزائر 2026" : "Student Roster 2026" },
          userEmail: user?.email || undefined,
        }
      );

      const record: GoogleWorkspaceFileRecord = {
        id: `gwf-${res.spreadsheetId}`,
        fileId: res.spreadsheetId,
        type: "sheets",
        title: res.title,
        embedUrl: res.embedUrl,
        directUrl: res.spreadsheetUrl,
        linkedRecordType: "student",
        linkedRecordId: "all-students-2026",
        linkedRecordName: isArabic ? "سجل طلاب الجزائر 2026" : "Student Roster 2026",
        userEmail: user?.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExportedSheets((prev) => [
        { title: res.title, url: res.spreadsheetUrl, date: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      setActiveEmbeddedFile(record);
      toast.success(
        isArabic ? "تم إنشاء جدول البيانات في Google Sheets وعرضه في مساحة العمل بنجاح!" : "Google Sheet created and opened in workspace!"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to export to Google Sheets");
    } finally {
      setLoading(false);
    }
  };

  const exportBacMatrixToGoogleSheets = async () => {
    if (!token) {
      toast.error(isArabic ? "يرجى تسجيل الدخول بحساب جوجل أولاً." : "Please connect Google account first.");
      return;
    }
    setLoading(true);
    try {
      const headers = [
        isArabic ? "الشعبة الرسمية" : "Official Stream",
        isArabic ? "المادة" : "Subject",
        isArabic ? "المعامل الرسمي" : "Official Coefficient",
        isArabic ? "طبيعة الاختبار" : "Exam Type",
        isArabic ? "المدة (ساعات)" : "Duration (Hrs)",
      ];

      const rows = [
        ["شعبة علوم تجريبية", "علوم الطبيعة والحياة", 6, "كتابي", "4.5"],
        ["شعبة علوم تجريبية", "الفيزياء والكيمياء", 5, "كتابي", "3.5"],
        ["شعبة علوم تجريبية", "الرياضيات", 5, "كتابي", "3.5"],
        ["شعبة علوم تجريبية", "اللغة العربية وآدابها", 3, "كتابي", "2.5"],
        ["شعبة علوم تجريبية", "الفلسفة", 2, "كتابي", "2.0"],
        ["شعبة رياضيات", "الرياضيات", 7, "كتابي", "4.5"],
        ["شعبة رياضيات", "الفيزياء", 6, "كتابي", "4.0"],
        ["شعبة تقني رياضي", "التكنولوجيا (الهندسة)", 7, "كتابي", "4.0"],
        ["شعبة تسيير واقتصاد", "الاقتصاد والمناجمنت", 5, "كتابي", "3.5"],
      ];

      const res = await createGoogleSpreadsheet(
        isArabic ? "مصفوفة معاملات البكالوريا الجزائرية الرسمية" : "Algerian Official BAC Coefficients Matrix",
        [{ title: isArabic ? "المعاملات الرسمية" : "Coefficients", rows: [headers, ...rows] }],
        {
          linkedRecord: { type: "workspaceItem", id: "bac-coefficients-matrix", name: isArabic ? "مصفوفة معاملات البكالوريا" : "BAC Coefficients Matrix" },
          userEmail: user?.email || undefined,
        }
      );

      const record: GoogleWorkspaceFileRecord = {
        id: `gwf-${res.spreadsheetId}`,
        fileId: res.spreadsheetId,
        type: "sheets",
        title: res.title,
        embedUrl: res.embedUrl,
        directUrl: res.spreadsheetUrl,
        linkedRecordType: "workspaceItem",
        linkedRecordId: "bac-coefficients-matrix",
        linkedRecordName: isArabic ? "مصفوفة معاملات البكالوريا" : "BAC Coefficients Matrix",
        userEmail: user?.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExportedSheets((prev) => [
        { title: res.title, url: res.spreadsheetUrl, date: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      setActiveEmbeddedFile(record);
      toast.success(isArabic ? "تم تصدير مصفوفة البكالوريا وعرضها في مساحة العمل!" : "Exported BAC matrix to Sheets and opened in workspace!");
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  // Google Calendar actions
  const fetchCalendar = async () => {
    if (!token) return;
    setCalendarLoading(true);
    try {
      const items = await listGoogleCalendarEvents(20);
      setCalendarEvents(items);
    } catch (err: any) {
      console.warn("Calendar fetch notice:", err.message);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newEventTitle.trim()) {
      toast.error(isArabic ? "يرجى كتابة عنوان الفعالية" : "Event title required");
      return;
    }

    setLoading(true);
    try {
      const startDateTime = `${newEventDate}T${newEventTime}:00+01:00`;
      const endHour = parseInt(newEventTime.split(":")[0], 10) + 1;
      const endDateTime = `${newEventDate}T${String(endHour).padStart(2, "0")}:${newEventTime.split(":")[1]}:00+01:00`;

      const created = await createGoogleCalendarEvent({
        summary: newEventTitle.trim(),
        description: isArabic
          ? "مجدول عبر منصة EduPulse Algeria لإدارة المؤسسات التعليمية."
          : "Scheduled via EduPulse Algeria Education OS.",
        location: newEventLocation,
        startDateTime,
        endDateTime,
      });

      setCalendarEvents((prev) => [created, ...prev]);
      setNewEventTitle("");
      toast.success(isArabic ? "تم إضافة الموعد إلى Google Calendar بنجاح!" : "Event added to Google Calendar!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, summary: string) => {
    setConfirmModal({
      isOpen: true,
      title: isArabic ? "حذف الموعد من تقويم جوجل" : "Delete Calendar Event",
      description: isArabic
        ? `هل أنت متأكد من حذف الفعالية "${summary}" من Google Calendar؟ لن يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to permanently delete "${summary}" from Google Calendar?`,
      onConfirm: async () => {
        await deleteGoogleCalendarEvent(eventId);
        setCalendarEvents((prev) => prev.filter((ev) => ev.id !== eventId));
        toast.success(isArabic ? "تم حذف الموعد من التقويم." : "Event removed from Calendar.");
      },
    });
  };

  // Google Docs actions
  const exportBulletinDoc = async () => {
    if (!token) {
      toast.error(isArabic ? "يرجى تسجيل الدخول بحساب جوجل أولاً." : "Please connect Google account first.");
      return;
    }
    setLoading(true);
    try {
      const content = isArabic
        ? `الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية\nمؤسسة EduPulse التعليمية المستقلة\n\n` +
          `وثيقة التقرير البيداغوجي والإدراكي الفصلي\n` +
          `الموسم الدراسي: 2026 / 2027\n\n` +
          `1. التوجيهات العامة:\n` +
          `• اعتماد الاسترجاع المتباعد (Spaced Retrieval) في مراجعة مواد الحفظ.\n` +
          `• تفعيل محاكي البكالوريا وفق الشبكة المعيارية للديوان الوطني للامتحانات والمسابقات (ONEC).\n` +
          `• إرسال إشعارات الحضور الدورية إلى أولياء الأمور عبر القنوات المعتمدة.\n\n` +
          `2. إحصائيات الأفواج:\n` +
          `• نسبة الحضور الإجمالية: 94.2%\n` +
          `• عدد الطلاب النشطين المسجلين: ${students.length || 3}\n` +
          `• تاريخ التقرير: ${new Date().toLocaleDateString("ar-DZ")}\n`
        : `People's Democratic Republic of Algeria\nMinistry of National Education\nEduPulse Independent Education Workspace\n\n` +
          `Official Pedagogical and Cognitive Term Report\n` +
          `Academic Year: 2026 / 2027\n\n` +
          `General Directives:\n` +
          `• Implement spaced retrieval in revision sessions.\n` +
          `• Run mock BAC exams according to official ONEC criteria.\n` +
          `• Automated guardian attendance notifications active.\n`;

      const title = isArabic
        ? "التقرير البيداغوجي الفصلي - EduPulse 2026"
        : "EduPulse Pedagogical Term Report 2026";
      const doc = await createGoogleDoc(title, content);

      setExportedDocs((prev) => [
        { title: doc.title, url: doc.documentUrl, date: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      toast.success(isArabic ? "تم إنشاء مستند Google Docs بنجاح!" : "Google Doc created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create Google Doc");
    } finally {
      setLoading(false);
    }
  };

  // Google Tasks actions
  const fetchTasks = async () => {
    if (!token) return;
    setTasksLoading(true);
    try {
      const items = await listGoogleTasks("@default");
      setTasks(items);
    } catch (err: any) {
      console.warn("Tasks fetch notice:", err.message);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newTaskTitle.trim()) {
      toast.error(isArabic ? "يرجى كتابة عنوان المهمة" : "Task title required");
      return;
    }

    setLoading(true);
    try {
      const created = await createGoogleTask("@default", {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
      setNewTaskNotes("");
      toast.success(isArabic ? "تم إضافة المهمة إلى Google Tasks!" : "Task added to Google Tasks!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (!token) return;
    const isCompleted = currentStatus === "completed";
    try {
      const updated = await toggleGoogleTaskStatus("@default", taskId, !isCompleted);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast.info(
        !isCompleted
          ? isArabic
            ? "اكتملت المهمة في Google Tasks!"
            : "Task marked completed in Google Tasks!"
          : isArabic
          ? "أعيد فتح المهمة."
          : "Task re-opened."
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: isArabic ? "حذف المهمة من Google Tasks" : "Delete Google Task",
      description: isArabic
        ? `هل تريد بالتأكيد حذف مهمة "${title}" من Google Tasks؟`
        : `Are you sure you want to delete task "${title}" from Google Tasks?`,
      onConfirm: async () => {
        await deleteGoogleTask("@default", taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.success(isArabic ? "تم حذف المهمة." : "Task deleted.");
      },
    });
  };

  // Google Slides actions
  const exportBacSlides = async () => {
    if (!token) {
      toast.error(isArabic ? "يرجى تسجيل الدخول بحساب جوجل أولاً." : "Please connect Google account first.");
      return;
    }
    setLoading(true);
    try {
      const title = isArabic
        ? "عرض إرشادات البكالوريا 2026 - EduPulse"
        : "BAC 2026 Preparation Guide - EduPulse";
      const presentation = await createGooglePresentation(title, {
        linkedRecord: { type: "workspaceItem", id: "bac-masterclass-deck", name: title },
        userEmail: user?.email || undefined,
      });

      const slides = [
        {
          title: isArabic ? "استراتيجية التفوق في البكالوريا الجزائرية 2026" : "BAC 2026 Excellence Strategy",
          bullets: [
            isArabic ? "فهم معاملات المواد حسب الشعبة الرسمية (علوم، رياضيات، تقني رياضي، تسيير، آداب)" : "Understand official coefficient weightings by stream",
            isArabic ? "تطبيق الاسترجاع المتباعد والخرائط الذهنية" : "Apply spaced retrieval and active recall cycles",
            isArabic ? "حل مواضيع السنوات السابقة في التوقيت الرسمي" : "Simulate real exam timing with past national papers",
          ],
        },
        {
          title: isArabic ? "إدارة الوقت والصحة الذهنية للمترشح" : "Time Management and Cognitive Health",
          bullets: [
            isArabic ? "تقسيم جلسات المراجعة إلى فترات 45 دقيقة مع فترات راحة محددة" : "45-minute focus intervals with deliberate rest blocks",
            isArabic ? "مراجعة المواد الأساسية في الصباح الباكر حيث يكون الاستيعاب في قمته" : "Study major STEM & language concepts during peak cognitive alertness",
            isArabic ? "التنسيق المستمر مع الأساتذة عبر منصة EduPulse" : "Seamless communication with teachers through EduPulse",
          ],
        },
      ];

      await addSlidesToPresentation(presentation.presentationId, slides);

      const record: GoogleWorkspaceFileRecord = {
        id: `gwf-${presentation.presentationId}`,
        fileId: presentation.presentationId,
        type: "slides",
        title: presentation.title,
        embedUrl: presentation.embedUrl,
        directUrl: presentation.presentationUrl,
        linkedRecordType: "workspaceItem",
        linkedRecordId: "bac-masterclass-deck",
        linkedRecordName: title,
        userEmail: user?.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExportedSlides((prev) => [
        { title: presentation.title, url: presentation.presentationUrl, date: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      setActiveEmbeddedFile(record);
      toast.success(isArabic ? "تم إنشاء العرض في Google Slides وعرضه في مساحة العمل بنجاح!" : "Google Slides presentation created and opened in workspace!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create presentation");
    } finally {
      setLoading(false);
    }
  };

  // Google Forms actions
  const exportBacOrientationForm = async () => {
    if (!token) {
      toast.error(isArabic ? "يرجى تسجيل الدخول بحساب جوجل أولاً." : "Please connect Google account first.");
      return;
    }
    setLoading(true);
    try {
      const title = isArabic
        ? "استبيان توجيه البكالوريا وتقييم الميول الأكاديمية - EduPulse"
        : "BAC Orientation & Academic Aptitude Survey - EduPulse";
      const desc = isArabic
        ? "استمارة توجيه التلاميذ نحو الشعبة والفرع الجامعي المناسب وفق المعايير الوزارية الجزائرية."
        : "Student orientation survey for Algerian secondary streams and university specialties.";
      const items = [
        {
          title: isArabic ? "الشعبة الحالية أو المرغوبة في البكالوريا:" : "Target BAC Stream:",
          type: "CHOICE" as const,
          choiceOptions: [
            "علوم تجريبية (Sciences)",
            "رياضيات (Mathématiques)",
            "تقني رياضي (Technique Mathématiques)",
            "تسيير واقتصاد (Gestion et Économie)",
            "آداب وفلسفة (Lettres et Philosophie)",
            "لغات أجنبية (Langues Étrangères)",
          ],
        },
        {
          title: isArabic ? "ما هي المادة ذات أعلى معامل في شعبتك تشعر فيها بأعلى ثقة؟" : "Highest coefficient subject with greatest confidence?",
          type: "CHOICE" as const,
          choiceOptions: [
            "علوم الطبيعة والحياة",
            "الرياضيات",
            "الفيزياء والكيمياء",
            "الفلسفة",
            "التكنولوجيا (الهندسة)",
            "الاقتصاد والمناجمنت",
          ],
        },
        {
          title: isArabic ? "ما هو التخصص الجامعي أو المدرسة العليا المستهدفة؟" : "Target university specialization / Grande École?",
          type: "TEXT" as const,
        },
      ];

      const res = await createGoogleForm(title, desc, items, {
        linkedRecord: { type: "workspaceItem", id: "bac-orientation-survey", name: title },
        userEmail: user?.email || undefined,
      });

      const record: GoogleWorkspaceFileRecord = {
        id: `gwf-${res.formId}`,
        fileId: res.formId,
        type: "forms",
        title: res.title,
        embedUrl: res.embedUrl,
        directUrl: res.editUrl || res.publishedUrl,
        linkedRecordType: "workspaceItem",
        linkedRecordId: "bac-orientation-survey",
        linkedRecordName: title,
        userEmail: user?.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExportedForms((prev) => [
        {
          title: res.title,
          url: res.editUrl || res.publishedUrl,
          date: new Date().toLocaleTimeString(),
          fileId: res.formId,
          embedUrl: res.embedUrl,
        },
        ...prev,
      ]);
      setActiveEmbeddedFile(record);
      toast.success(
        isArabic ? "تم إنشاء نموذج Google Forms وفتحه في مساحة العمل بنجاح!" : "Google Form created and opened in workspace!"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to create Google Form");
    } finally {
      setLoading(false);
    }
  };

  const exportDiagnosticQuizForm = async () => {
    if (!token) {
      toast.error(isArabic ? "يرجى تسجيل الدخول بحساب جوجل أولاً." : "Please connect Google account first.");
      return;
    }
    setLoading(true);
    try {
      const title = isArabic
        ? "اختبار تشخيصي وتقويم تكويني - EduPulse 2026"
        : "Diagnostic Formative Assessment - EduPulse 2026";
      const desc = isArabic
        ? "تقييم الكفاءات القبلية واسترجاع المفاهيم الأساسية وفق دليل منهاج وزارة التربية الوطنية."
        : "Diagnostic checkpoint assessing prerequisite competencies for secondary curriculum.";
      const items = [
        {
          title: isArabic ? "السؤال 1: ما هو المبدأ الأساسي في الاسترجاع المتباعد (Spaced Retrieval)؟" : "Question 1: Core principle of spaced retrieval?",
          type: "CHOICE" as const,
          choiceOptions: [
            "تكرار المراجعة على فترات زمنية متباعدة ومتزايدة لترسيخ الذاكرة طويلة المدى",
            "المراجعة المكثفة ليلة الامتحان فقط",
            "القراءة الصامتة لملخصات الدرس دون اختبار الذات",
          ],
        },
        {
          title: isArabic ? "السؤال 2: ما هو معامل مادة علوم الطبيعة والحياة في شعبة العلوم التجريبية (بكالوريا)؟" : "Question 2: Biology coefficient in experimental sciences stream?",
          type: "CHOICE" as const,
          choiceOptions: ["6", "5", "7", "3"],
        },
        {
          title: isArabic ? "السؤال 3: اذكر أهم خطوة منهجية في صياغة الفرضية العلمية:" : "Question 3: Methodological step in scientific hypothesis formulation:",
          type: "TEXT" as const,
        },
      ];

      const res = await createGoogleForm(title, desc, items, {
        linkedRecord: { type: "workspaceItem", id: "diagnostic-quiz-2026", name: title },
        userEmail: user?.email || undefined,
      });

      const record: GoogleWorkspaceFileRecord = {
        id: `gwf-${res.formId}`,
        fileId: res.formId,
        type: "forms",
        title: res.title,
        embedUrl: res.embedUrl,
        directUrl: res.editUrl || res.publishedUrl,
        linkedRecordType: "workspaceItem",
        linkedRecordId: "diagnostic-quiz-2026",
        linkedRecordName: title,
        userEmail: user?.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExportedForms((prev) => [
        {
          title: res.title,
          url: res.editUrl || res.publishedUrl,
          date: new Date().toLocaleTimeString(),
          fileId: res.formId,
          embedUrl: res.embedUrl,
        },
        ...prev,
      ]);
      setActiveEmbeddedFile(record);
      toast.success(
        isArabic ? "تم إنشاء اختبار Google Forms وفتحه في مساحة العمل بنجاح!" : "Diagnostic Form created and opened in workspace!"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to create Google Form");
    } finally {
      setLoading(false);
    }
  };

  // Keep memo actions
  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoTitle.trim() || !newMemoContent.trim()) {
      toast.error(isArabic ? "يرجى ملء العنوان والنص" : "Title and content required");
      return;
    }
    const memo = {
      id: `memo-${Date.now()}`,
      title: newMemoTitle.trim(),
      content: newMemoContent.trim(),
      tag: newMemoTag,
      date: new Date().toISOString().split("T")[0],
    };
    setMemos([memo, ...memos]);
    setNewMemoTitle("");
    setNewMemoContent("");
    toast.success(isArabic ? "تم حفظ المذكرة بنجاح!" : "Memo saved successfully!");
  };

  const handleSyncMemoToGoogleTasks = async (memo: { title: string; content: string }) => {
    if (!token) {
      toast.error(isArabic ? "يرجى ربط حساب جوجل أولاً." : "Please connect Google account first.");
      return;
    }
    try {
      await createGoogleTask("@default", {
        title: `[مذكرة] ${memo.title}`,
        notes: memo.content,
      });
      toast.success(isArabic ? "تمت مزامنة المذكرة مع Google Tasks!" : "Synced memo to Google Tasks!");
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync memo");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <header className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#002638] via-[#00364A] to-[#014760] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isArabic ? "بيئة جوجل التعليمية الموحدة" : "Google Workspace Cloud Hub"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold font-display sm:text-3xl">
              {isArabic ? "تكامل خدمات Google Workspace" : "Google Workspace Integration"}
            </h1>
            <p className="mt-1 text-xs text-white/70 max-w-2xl sm:text-sm">
              {isArabic
                ? "مزامنة جداول البيانات (Sheets)، تقويم الامتحانات (Calendar)، المستندات الرسمية (Docs)، قوائم المهام (Tasks)، الملاحظات (Keep)، والعروض التقديمية (Slides) في مساحة موحدة."
                : "Synchronize Sheets, Calendar, Docs, Tasks, Keep memos, and Slides presentations directly into your EduPulse institutional environment."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {token && user ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5">
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-200">{user.displayName || "Google User"}</p>
                  <p className="text-[11px] text-white/60">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-rose-500/80"
                  title="Sign out from Google"
                >
                  {isArabic ? "خروج" : "Sign out"}
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="gsi-material-button inline-flex items-center gap-3 rounded-full border border-white/30 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 shadow-md transition hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="gsi-material-button-icon h-4 w-4">
                    <svg viewBox="0 0 48 48" className="h-4 w-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </div>
                  <span>{loading ? (isArabic ? "جارِ الاتصال..." : "Connecting...") : (isArabic ? "تسجيل الدخول بحساب Google" : "Sign in with Google")}</span>
                </button>
                <p className="mt-1 text-center text-[10px] text-white/50">
                  {isArabic ? "يطلب صلاحية القراءة والتعديل على خدماتك بموافقتك." : "Requests permissions with your approval."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            { id: "sheets", icon: FileSpreadsheet, ar: "Google Sheets", en: "Google Sheets" },
            { id: "slides", icon: Presentation, ar: "Google Slides", en: "Google Slides" },
            { id: "forms", icon: CheckSquare, ar: "Google Forms واستبيانات", en: "Google Forms" },
            { id: "calendar", icon: Calendar, ar: "Google Calendar", en: "Google Calendar" },
            { id: "docs", icon: FileText, ar: "Google Docs", en: "Google Docs" },
            { id: "tasks", icon: CheckSquare, ar: "Google Tasks", en: "Google Tasks" },
            { id: "keep", icon: StickyNote, ar: "Google Keep ومذكرات", en: "Keep & Memos" },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-blue-600" : "text-white/60"}`} />
                <span>{isArabic ? tab.ar : tab.en}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Embedded Workspace File Viewer */}
      {activeEmbeddedFile && (
        <div className="mb-6">
          <GoogleWorkspaceEmbedViewer
            file={activeEmbeddedFile}
            onClose={() => setActiveEmbeddedFile(null)}
            isInline={true}
          />
        </div>
      )}

      {/* TAB 1: GOOGLE SHEETS */}
      {activeTab === "sheets" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display">
                    {isArabic ? "تصدير جداول البيانات الذكية" : "Smart Spreadsheet Exports"}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {isArabic
                      ? "تصدير فوري بنقرة واحدة إلى حساب Google Drive الخاص بك بصيغة جداول Google الأصلية."
                      : "Instant one-click exports directly to your Google Drive in native Google Sheets format."}
                  </p>
                </div>
                <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={exportStudentsToGoogleSheets}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-emerald-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-emerald-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "تصدير سجل الطلاب والحضور" : "Export Student Roster"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "أسماء الطلاب، الولايات، الشعب، معلومات الأولياء، ونسب الحضور."
                      : "Complete cohort roster with Algerian wilayas, streams, and attendance."}
                  </p>
                </button>

                <button
                  onClick={exportBacMatrixToGoogleSheets}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-emerald-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-emerald-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "تصدير مصفوفة البكالوريا والمعاملات" : "Export BAC Coefficients Matrix"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "المعاملات الرسمية للشعب الست (علوم، رياضيات، تقني، تسيير، آداب، لغات)."
                      : "Official Ministry coefficients for all 6 secondary education streams."}
                  </p>
                </button>
              </div>
            </div>

            {/* Exported Sheets History */}
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white">
                {isArabic ? "جداول البيانات التي تم إنشاؤها مؤخراً" : "Recent Google Sheets"}
              </h3>
              {exportedSheets.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-white/50">
                  {isArabic
                    ? "لم يتم تصدير أي جدول بعد. اضغط على أزرار التصدير أعلاه لإنشاء جدول في حساب جوجل الخاص بك."
                    : "No sheets exported yet. Click an export button above to generate a sheet."}
                </div>
              ) : (
                <div className="mt-3 divide-y divide-white/10">
                  {exportedSheets.map((sh, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-bold text-white">{sh.title}</p>
                        <p className="text-[10px] text-white/40">{sh.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const found = savedWorkspaceFiles.find((f) => f.directUrl === sh.url || f.title === sh.title);
                            if (found) {
                              setActiveEmbeddedFile(found);
                            } else {
                              const match = sh.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                              const fileId = match ? match[1] : "";
                              setActiveEmbeddedFile({
                                id: `gwf-${fileId || Date.now()}`,
                                fileId: fileId || "unknown",
                                type: "sheets",
                                title: sh.title,
                                embedUrl: buildGoogleWorkspaceEmbedUrl("sheets", fileId),
                                directUrl: sh.url,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              });
                            }
                            toast.info(isArabic ? "جاري عرض جدول البيانات في مساحة العمل..." : "Loading sheet inside workspace...");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-500/30 font-bold"
                        >
                          <Sparkles className="h-3 w-3 text-emerald-300" />
                          <span>{isArabic ? "فتح في مساحة العمل" : "Open in Workspace"}</span>
                        </button>
                        <a
                          href={sh.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <span>{isArabic ? "فتح في Google" : "Google Drive"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="surface-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-200">
                <FolderOpen className="h-4 w-4" />
                <span>{isArabic ? "مزايا التكامل مع Google Sheets" : "Google Sheets Benefits"}</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-white/70">
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{isArabic ? "تخزين سيادي داخل حسابك الشخصي دون وسيط" : "Sovereign storage in your own Google Drive"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{isArabic ? "مشاركة التقارير مع المفتشين وأولياء الأمور بروابط فورية" : "Share reports with inspectors & guardians instantly"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{isArabic ? "تطبيق المعادلات والرسوم البيانية المتقدمة تلقائياً" : "Automatic formulas and graphing tools in the cloud"}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: GOOGLE CALENDAR */}
      {activeTab === "calendar" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display">
                    {isArabic ? "تقويم المؤسسة والامتحانات الرسمية" : "Institutional & Exam Calendar"}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {isArabic
                      ? "مزامنة مواعيد الفروض، البكالوريا التجريبية، ولقاءات الأساتذة مباشرة مع Google Calendar."
                      : "Sync term exams, mock BAC simulations, and parent-teacher conferences directly with Google Calendar."}
                  </p>
                </div>
                <button
                  onClick={fetchCalendar}
                  disabled={calendarLoading || !token}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white"
                  title="Refresh calendar"
                >
                  <RefreshCw className={`h-4 w-4 ${calendarLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Event List */}
              <div className="mt-5 space-y-2.5">
                {calendarEvents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-white/50">
                    {token
                      ? isArabic
                        ? "لا توجد مواعيد قادمة مجدولة في التقويم الرئيسي، أو اضغط زر التحديث."
                        : "No upcoming events found on primary calendar."
                      : isArabic
                      ? "يرجى تسجيل الدخول بحساب Google لعرض الأحداث."
                      : "Connect Google account to view upcoming events."}
                  </div>
                ) : (
                  calendarEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 transition hover:bg-white/8"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{ev.summary}</p>
                        <div className="flex items-center gap-3 text-[11px] text-white/50">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-sky-300" />
                            {ev.start.dateTime
                              ? new Date(ev.start.dateTime).toLocaleString("ar-DZ")
                              : ev.start.date}
                          </span>
                          {ev.location && <span>· {ev.location}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:text-white"
                            title="Open in Google Calendar"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteEvent(ev.id, ev.summary)}
                          className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-1.5 text-rose-300 transition hover:bg-rose-500/20"
                          title="Delete from Google Calendar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>{isArabic ? "جدولة حدث جديد في Google Calendar" : "Schedule New Event"}</span>
              </h3>
              <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "عنوان الفعالية أو الامتحان *" : "Event Title *"}
                  </label>
                  <input
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder={isArabic ? "مثال: امتحان بكالوريا تجريبي - علوم" : "e.g. Mock BAC Exam"}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      {isArabic ? "التاريخ" : "Date"}
                    </label>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full control-light px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      {isArabic ? "التوقيت" : "Time"}
                    </label>
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full control-light px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "الموقع أو القاعة" : "Location / Room"}
                  </label>
                  <input
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder={isArabic ? "المدرج الرئيسي" : "Main Hall"}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="liquid-glass w-full rounded-xl py-2.5 text-xs font-bold mt-2"
                >
                  {loading ? (isArabic ? "جارِ الإضافة..." : "Scheduling...") : (isArabic ? "إضافة إلى Google Calendar" : "Add to Calendar")}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 3: GOOGLE DOCS */}
      {activeTab === "docs" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display">
                    {isArabic ? "إنشاء وتصدير مستندات Google Docs" : "Google Docs Official Reports"}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {isArabic
                      ? "توليد النشرات الرسمية، شهادات التقدير، وتقارير التقييم البيداغوجي مباشرة في مستندات Google Docs."
                      : "Generate bulletins, student evaluation certificates, and pedagogical review documents directly in Docs."}
                  </p>
                </div>
                <FileText className="h-6 w-6 text-blue-400" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={exportBulletinDoc}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-blue-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-blue-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "توليد التقرير البيداغوجي الفصلي" : "Generate Pedagogical Term Report"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "يتضمن ترويسة الجمهورية الجزائرية، نسب الحضور، وتوصيات علوم الإدراك."
                      : "Includes official national education header, attendance metrics, and recommendations."}
                  </p>
                </button>

                <button
                  onClick={async () => {
                    if (!token) {
                      toast.error(isArabic ? "يرجى ربط حساب جوجل أولاً." : "Connect Google account first.");
                      return;
                    }
                    setLoading(true);
                    try {
                      const doc = await createGoogleDoc(
                        isArabic ? "ميثاق التلميذ وولي الأمر 2026" : "Student & Guardian Charter 2026",
                        isArabic
                          ? "ميثاق الانضباط وحضور الدروس - EduPulse الجزائر\n\n1. الالتزام بالحضور الدائم في الحصص النظرية والتطبيقية.\n2. إبلاغ الإدارة عن أي غياب مبرر خلال 24 ساعة.\n3. احترام الزملاء والأساتذة داخل الحرم التربوي.\n\nتوقيع ولي الأمر: _____________\nتوقيع المدير: _____________"
                          : "EduPulse Student Conduct & Attendance Charter 2026."
                      );
                      setExportedDocs((prev) => [
                        { title: doc.title, url: doc.documentUrl, date: new Date().toLocaleTimeString() },
                        ...prev,
                      ]);
                      toast.success(isArabic ? "تم إنشاء ميثاق التلميذ في Google Docs!" : "Charter created in Docs!");
                    } catch (err: any) {
                      toast.error(err.message || "Failed to create Doc");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-blue-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-blue-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "توليد ميثاق التلميذ وولي الأمر" : "Generate Student Charter Doc"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "وثيقة التعهد المدرسي وقواعد الانضباط الجاهزة للطباعة والتوقيع."
                      : "Official school conduct pledge ready for printing and signatures."}
                  </p>
                </button>
              </div>
            </div>

            {/* Exported Docs */}
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white">
                {isArabic ? "المستندات المنشأة مؤخراً" : "Recent Google Docs"}
              </h3>
              {exportedDocs.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-white/50">
                  {isArabic
                    ? "لم يتم توليد أي مستند بعد. اضغط على أزرار التوليد أعلاه للبدء."
                    : "No documents generated yet."}
                </div>
              ) : (
                <div className="mt-3 divide-y divide-white/10">
                  {exportedDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-bold text-white">{doc.title}</p>
                        <p className="text-[10px] text-white/40">{doc.date}</p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200 transition hover:bg-blue-500/20"
                      >
                        <span>{isArabic ? "فتح في Docs" : "Open in Docs"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-400" />
                <span>{isArabic ? "إنشاء مستند جديد مخصص" : "Create Custom Doc"}</span>
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!token) return;
                  if (!customDocTitle.trim()) {
                    toast.error(isArabic ? "عنوان المستند مطلوب" : "Title required");
                    return;
                  }
                  setLoading(true);
                  try {
                    const doc = await createGoogleDoc(customDocTitle.trim(), customDocContent.trim());
                    setExportedDocs((prev) => [
                      { title: doc.title, url: doc.documentUrl, date: new Date().toLocaleTimeString() },
                      ...prev,
                    ]);
                    setCustomDocTitle("");
                    setCustomDocContent("");
                    toast.success(isArabic ? "تم إنشاء المستند في Google Docs!" : "Doc created!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to create Doc");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "عنوان المستند *" : "Document Title *"}
                  </label>
                  <input
                    value={customDocTitle}
                    onChange={(e) => setCustomDocTitle(e.target.value)}
                    placeholder={isArabic ? "تقرير اجتماع مجلس الأساتذة" : "Faculty Meeting Minutes"}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "النص الأولي" : "Initial Content"}
                  </label>
                  <textarea
                    rows={4}
                    value={customDocContent}
                    onChange={(e) => setCustomDocContent(e.target.value)}
                    placeholder={isArabic ? "اكتب المحتوى هنا..." : "Type text here..."}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="liquid-glass w-full rounded-xl py-2.5 text-xs font-bold"
                >
                  {isArabic ? "إنشاء في Google Docs" : "Create in Google Docs"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 4: GOOGLE TASKS */}
      {activeTab === "tasks" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display">
                    {isArabic ? "المهام الإدارية والبيداغوجية" : "Google Tasks Sync"}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {isArabic
                      ? "مزامنة المهام والواجبات الإدارية مع تطبيق Google Tasks على هاتفك وحاسوبك."
                      : "Direct task list synchronization with Google Tasks mobile and web apps."}
                  </p>
                </div>
                <button
                  onClick={fetchTasks}
                  disabled={tasksLoading || !token}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white"
                  title="Refresh tasks"
                >
                  <RefreshCw className={`h-4 w-4 ${tasksLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="mt-5 space-y-2">
                {tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-white/50">
                    {token
                      ? isArabic
                        ? "لا توجد مهام في القائمة الرئيسية. أضف مهمة جديدة من النموذج الجانبي."
                        : "No tasks found in @default list."
                      : isArabic
                      ? "يرجى تسجيل الدخول بحساب جوجل لعرض المهام."
                      : "Connect Google account to view tasks."}
                  </div>
                ) : (
                  tasks.map((t) => {
                    const isCompleted = t.status === "completed";
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/8"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleTask(t.id, t.status)}
                            className={`grid h-5 w-5 place-items-center rounded-md border transition ${
                              isCompleted
                                ? "border-emerald-400 bg-emerald-500 text-slate-950"
                                : "border-white/30 hover:border-white"
                            }`}
                          >
                            {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <p
                              className={`text-xs font-semibold ${
                                isCompleted ? "line-through text-white/40" : "text-white"
                              }`}
                            >
                              {t.title}
                            </p>
                            {t.notes && <p className="text-[11px] text-white/50 mt-0.5">{t.notes}</p>}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(t.id, t.title)}
                          className="rounded-lg p-1.5 text-white/40 transition hover:bg-rose-500/20 hover:text-rose-300"
                          title="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>{isArabic ? "إضافة مهمة إلى Google Tasks" : "Add Task to Google"}</span>
              </h3>
              <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "عنوان المهمة *" : "Task Title *"}
                  </label>
                  <input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder={isArabic ? "مثال: مراجعة بطاقات تصحيح الفلسفة" : "e.g. Review exam papers"}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "تفاصيل أو ملاحظات إضافية" : "Notes"}
                  </label>
                  <textarea
                    rows={3}
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    placeholder={isArabic ? "تاريخ الاستحقاق أو ملاحظات الأستاذ..." : "Due date notes..."}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="liquid-glass w-full rounded-xl py-2.5 text-xs font-bold"
                >
                  {isArabic ? "حفظ في Google Tasks" : "Save to Google Tasks"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 5: GOOGLE SLIDES */}
      {activeTab === "slides" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display">
                    {isArabic ? "العروض التقديمية في Google Slides" : "Google Slides Presentations"}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {isArabic
                      ? "توليد عروض الشرائح التقديمية الخاصة بجلسات التوجيه المدرسي، مراجعة البكالوريا، واجتماعات الأولياء."
                      : "Generate orientation decks, BAC exam masterclasses, and parent assembly slides directly in Google Slides."}
                  </p>
                </div>
                <Presentation className="h-6 w-6 text-amber-400" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={exportBacSlides}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-amber-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-amber-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "توليد عرض توجيه البكالوريا 2026" : "Generate BAC 2026 Masterclass Deck"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "عرض شرائح متكامل يتضمن استراتيجيات التفوق، إدارة الوقت، ونظام معاملات الشعب."
                      : "Structured slides covering stream coefficients, time allocation, and exam strategies."}
                  </p>
                </button>

                <button
                  onClick={async () => {
                    if (!token) {
                      toast.error(isArabic ? "يرجى ربط حساب جوجل أولاً." : "Connect Google account first.");
                      return;
                    }
                    setLoading(true);
                    try {
                      const pres = await createGooglePresentation(
                        isArabic ? "عرض الدخول المدرسي الجديد - EduPulse" : "Back to School Orientation - EduPulse"
                      );
                      await addSlidesToPresentation(pres.presentationId, [
                        {
                          title: isArabic ? "مرحباً بكم في الموسم الدراسي 2026 / 2027" : "Welcome to the 2026/2027 School Year",
                          bullets: [
                            isArabic ? "نظام التشغيل المدرسي الجزائري الموحد EduPulse" : "Unified Algerian Education Workspace",
                            isArabic ? "متابعة الحضور والتقييم الإدراكي المستمر" : "Continuous cognitive attendance & formative tracking",
                            isArabic ? "تواصل مباشر مع الأولياء عبر بوابة الرسائل المعتمدة" : "Direct guardian portal and approved messaging",
                          ],
                        },
                      ]);

                      setExportedSlides((prev) => [
                        { title: pres.title, url: pres.presentationUrl, date: new Date().toLocaleTimeString() },
                        ...prev,
                      ]);
                      toast.success(isArabic ? "تم توليد عرض الدخول المدرسي في Slides!" : "Orientation deck created!");
                    } catch (err: any) {
                      toast.error(err.message || "Failed to create presentation");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-amber-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-amber-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "توليد عرض الدخول المدرسي والأولياء" : "Generate School Orientation Deck"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "عرض تعريفي لافتتاح الموسم الدراسي موجه للتلاميذ وأولياء الأمور."
                      : "Welcome assembly presentation for staff, students, and parents."}
                  </p>
                </button>
              </div>
            </div>

            {/* Exported Slides History */}
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white">
                {isArabic ? "العروض المنشأة مؤخراً" : "Recent Google Slides"}
              </h3>
              {exportedSlides.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-white/50">
                  {isArabic ? "لم يتم توليد أي عرض بعد." : "No slide decks generated yet."}
                </div>
              ) : (
                <div className="mt-3 divide-y divide-white/10">
                  {exportedSlides.map((sl, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-bold text-white">{sl.title}</p>
                        <p className="text-[10px] text-white/40">{sl.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const found = savedWorkspaceFiles.find((f) => f.directUrl === sl.url || f.title === sl.title);
                            if (found) {
                              setActiveEmbeddedFile(found);
                            } else {
                              const match = sl.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                              const fileId = match ? match[1] : "";
                              setActiveEmbeddedFile({
                                id: `gwf-${fileId || Date.now()}`,
                                fileId: fileId || "unknown",
                                type: "slides",
                                title: sl.title,
                                embedUrl: buildGoogleWorkspaceEmbedUrl("slides", fileId),
                                directUrl: sl.url,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              });
                            }
                            toast.info(isArabic ? "جاري عرض الشرائح في مساحة العمل..." : "Loading slides inside workspace...");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-500/30 font-bold"
                        >
                          <Sparkles className="h-3 w-3 text-amber-300" />
                          <span>{isArabic ? "فتح في مساحة العمل" : "Open in Workspace"}</span>
                        </button>
                        <a
                          href={sl.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <span>{isArabic ? "فتح في Google" : "Google Drive"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-amber-400" />
                <span>{isArabic ? "إنشاء عرض فارغ مخصص" : "Create Custom Presentation"}</span>
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!token) return;
                  if (!customSlideTitle.trim()) {
                    toast.error(isArabic ? "عنوان العرض مطلوب" : "Title required");
                    return;
                  }
                  setLoading(true);
                  try {
                    const pres = await createGooglePresentation(customSlideTitle.trim(), {
                      linkedRecord: { type: "workspaceItem", id: `custom-slide-${Date.now()}`, name: customSlideTitle.trim() },
                      userEmail: user?.email || undefined,
                    });
                    const record: GoogleWorkspaceFileRecord = {
                      id: `gwf-${pres.presentationId}`,
                      fileId: pres.presentationId,
                      type: "slides",
                      title: pres.title,
                      embedUrl: pres.embedUrl,
                      directUrl: pres.presentationUrl,
                      linkedRecordType: "workspaceItem",
                      linkedRecordId: `custom-slide-${Date.now()}`,
                      linkedRecordName: pres.title,
                      userEmail: user?.email || "",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setExportedSlides((prev) => [
                      { title: pres.title, url: pres.presentationUrl, date: new Date().toLocaleTimeString() },
                      ...prev,
                    ]);
                    setCustomSlideTitle("");
                    setActiveEmbeddedFile(record);
                    toast.success(isArabic ? "تم إنشاء العرض في Google Slides وعرضه في مساحة العمل!" : "Deck created and embedded!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to create presentation");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "عنوان العرض التقديمي *" : "Presentation Title *"}
                  </label>
                  <input
                    value={customSlideTitle}
                    onChange={(e) => setCustomSlideTitle(e.target.value)}
                    placeholder={isArabic ? "درس الهندسة الفضائية - بكالوريا" : "e.g. Space Geometry Lecture"}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="liquid-glass w-full rounded-xl py-2.5 text-xs font-bold"
                >
                  {isArabic ? "إنشاء في Google Slides" : "Create in Google Slides"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* TAB: GOOGLE FORMS */}
      {activeTab === "forms" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display">
                    {isArabic ? "استبيانات ونماذج Google Forms" : "Google Forms Assessments & Surveys"}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {isArabic
                      ? "إنشاء اختبارات تشخيصية واستبيانات توجيه أكاديمية في Google Forms وعرضها فورياً داخل مساحة العمل."
                      : "Create diagnostic assessments and student orientation surveys in Google Forms with instant embedded preview."}
                  </p>
                </div>
                <CheckSquare className="h-6 w-6 text-purple-400" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={exportBacOrientationForm}
                  disabled={loading || !token}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-purple-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-purple-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "توليد استبيان توجيه البكالوريا 2026" : "Generate BAC Orientation Survey"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "نموذج وزاري لتحديد الميول والرغبات والشعب والتخصصات الجامعية المستهدفة."
                      : "Official orientation survey assessing stream fit and university ambitions."}
                  </p>
                </button>

                <button
                  onClick={exportDiagnosticQuizForm}
                  disabled={loading || !token}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10 hover:border-purple-400/40 group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-purple-300">
                    <Download className="h-3.5 w-3.5" />
                    {isArabic ? "توليد اختبار تشخيصي وتقويم تكويني" : "Generate Diagnostic Assessment"}
                  </span>
                  <p className="mt-1 text-[11px] text-white/60">
                    {isArabic
                      ? "تقييم الكفاءات القبلية واسترجاع المفاهيم الأساسية لمنهاج التعليم الثانوي."
                      : "Formative checkpoint evaluating prerequisite competencies and recall."}
                  </p>
                </button>
              </div>
            </div>

            {/* Exported Forms History */}
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white">
                {isArabic ? "النماذج المنشأة مؤخراً" : "Recent Google Forms"}
              </h3>
              {exportedForms.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-white/50">
                  {isArabic ? "لم يتم إنشاء أي استبيان أو نموذج بعد." : "No Google Forms generated yet."}
                </div>
              ) : (
                <div className="mt-3 divide-y divide-white/10">
                  {exportedForms.map((fm, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-bold text-white">{fm.title}</p>
                        <p className="text-[10px] text-white/40">{fm.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const found = savedWorkspaceFiles.find((f) => f.directUrl === fm.url || f.title === fm.title || f.fileId === fm.fileId);
                            if (found) {
                              setActiveEmbeddedFile(found);
                            } else {
                              const match = fm.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                              const fileId = fm.fileId || (match ? match[1] : "");
                              setActiveEmbeddedFile({
                                id: `gwf-${fileId || Date.now()}`,
                                fileId: fileId || "unknown",
                                type: "forms",
                                title: fm.title,
                                embedUrl: fm.embedUrl || buildGoogleWorkspaceEmbedUrl("forms", fileId),
                                directUrl: fm.url,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              });
                            }
                            toast.info(isArabic ? "جاري عرض نموذج Google Forms في مساحة العمل..." : "Loading form inside workspace...");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-400/50 bg-purple-500/20 px-3 py-1.5 text-xs text-purple-200 transition hover:bg-purple-500/30 font-bold"
                        >
                          <Sparkles className="h-3 w-3 text-purple-300" />
                          <span>{isArabic ? "فتح في مساحة العمل" : "Open in Workspace"}</span>
                        </button>
                        <a
                          href={fm.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <span>{isArabic ? "فتح في Google" : "Google Forms"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-400" />
                <span>{isArabic ? "إنشاء استمارة / استبيان مخصص" : "Create Custom Google Form"}</span>
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!token) return;
                  if (!customFormTitle.trim()) {
                    toast.error(isArabic ? "عنوان الاستمارة مطلوب" : "Form title required");
                    return;
                  }
                  setLoading(true);
                  try {
                    const res = await createGoogleForm(
                      customFormTitle.trim(),
                      customFormDesc.trim() || undefined,
                      undefined,
                      {
                        linkedRecord: { type: "workspaceItem", id: `custom-form-${Date.now()}`, name: customFormTitle.trim() },
                        userEmail: user?.email || undefined,
                      }
                    );
                    const record: GoogleWorkspaceFileRecord = {
                      id: `gwf-${res.formId}`,
                      fileId: res.formId,
                      type: "forms",
                      title: res.title,
                      embedUrl: res.embedUrl,
                      directUrl: res.editUrl || res.publishedUrl,
                      linkedRecordType: "workspaceItem",
                      linkedRecordId: `custom-form-${Date.now()}`,
                      linkedRecordName: res.title,
                      userEmail: user?.email || "",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setExportedForms((prev) => [
                      {
                        title: res.title,
                        url: res.editUrl || res.publishedUrl,
                        date: new Date().toLocaleTimeString(),
                        fileId: res.formId,
                        embedUrl: res.embedUrl,
                      },
                      ...prev,
                    ]);
                    setCustomFormTitle("");
                    setCustomFormDesc("");
                    setActiveEmbeddedFile(record);
                    toast.success(isArabic ? "تم إنشاء النموذج وعرضه في مساحة العمل!" : "Google Form created and embedded!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to create Google Form");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "عنوان الاستمارة *" : "Form Title *"}
                  </label>
                  <input
                    value={customFormTitle}
                    onChange={(e) => setCustomFormTitle(e.target.value)}
                    placeholder={isArabic ? "استبيان رضا الأولياء عن التعليم الرقمي" : "e.g. Guardian Feedback Survey"}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "وصف الاستمارة أو التوجيهات" : "Description"}
                  </label>
                  <textarea
                    rows={3}
                    value={customFormDesc}
                    onChange={(e) => setCustomFormDesc(e.target.value)}
                    placeholder={isArabic ? "يرجى الإجابة بدقة على الأسئلة التالية لتطوير الخدمة..." : "Form instructions..."}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="liquid-glass w-full rounded-xl py-2.5 text-xs font-bold"
                >
                  {isArabic ? "إنشاء في Google Forms" : "Create in Google Forms"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 6: GOOGLE KEEP & MEMOS */}
      {activeTab === "keep" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display">
                    {isArabic ? "مذكرات المعلمين وملاحظات Keep السريعة" : "Keep Memos & Pedagogical Notes"}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {isArabic
                      ? "تسجيل الملاحظات الميدانية، توجيهات الأقسام، ومزامنتها بنقرة واحدة مع Google Tasks وGoogle Docs."
                      : "Capture pedagogical observations, class reminders, and sync them seamlessly to Google Tasks and Docs."}
                  </p>
                </div>
                <StickyNote className="h-6 w-6 text-amber-300" />
              </div>

              {/* Memos Grid */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {memos.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 transition hover:bg-amber-400/10"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          {m.tag}
                        </span>
                        <span className="text-[10px] text-white/40">{m.date}</span>
                      </div>
                      <h4 className="mt-2 text-xs font-bold text-white">{m.title}</h4>
                      <p className="mt-1.5 text-xs leading-5 text-white/70">{m.content}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                      <button
                        onClick={() => handleSyncMemoToGoogleTasks(m)}
                        className="inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200"
                      >
                        <Share2 className="h-3 w-3" />
                        <span>{isArabic ? "مزامنة كمهمة في Google" : "Sync to Google Tasks"}</span>
                      </button>
                      <button
                        onClick={() => setMemos(memos.filter((memo) => memo.id !== m.id))}
                        className="text-white/40 hover:text-rose-300"
                        title="Delete memo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-amber-300" />
                <span>{isArabic ? "كتابة مذكرة جديدة" : "New Pedagogical Memo"}</span>
              </h3>
              <form onSubmit={handleAddMemo} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "عنوان المذكرة *" : "Memo Title *"}
                  </label>
                  <input
                    value={newMemoTitle}
                    onChange={(e) => setNewMemoTitle(e.target.value)}
                    placeholder={isArabic ? "توجيهات حل تمرين الفيزياء" : "e.g. Physics Exercise Guidance"}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "التصنيف" : "Tag"}
                  </label>
                  <select
                    value={newMemoTag}
                    onChange={(e) => setNewMemoTag(e.target.value)}
                    className="w-full control-light px-3 py-2 text-xs"
                  >
                    <option value="تربوي">{isArabic ? "تربوي وبيداغوجي" : "Pedagogical"}</option>
                    <option value="بكالوريا">{isArabic ? "تحضير البكالوريا" : "BAC Prep"}</option>
                    <option value="إدارة وتواصل">{isArabic ? "إدارة وتواصل الأولياء" : "Admin & Guardians"}</option>
                    <option value="توجيه">{isArabic ? "توجيه مدرسي" : "Student Counseling"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">
                    {isArabic ? "نص الملاحظة *" : "Content *"}
                  </label>
                  <textarea
                    rows={4}
                    value={newMemoContent}
                    onChange={(e) => setNewMemoContent(e.target.value)}
                    placeholder={isArabic ? "اكتب الملاحظة السريعة..." : "Write memo text here..."}
                    className="w-full control-light px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="liquid-glass w-full rounded-xl py-2.5 text-xs font-bold"
                >
                  {isArabic ? "حفظ المذكرة" : "Save Memo"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* Confirmation Dialog (MANDATORY per SKILL.md for destructive operations) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#002638] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold">{confirmModal.title}</h3>
            </div>
            <p className="text-xs leading-relaxed text-white/80">{confirmModal.description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="rounded-xl border border-white/20 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={async () => {
                  await confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-600"
              >
                {isArabic ? "تأكيد الحذف" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
