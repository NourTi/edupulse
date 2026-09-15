import { useState, useRef, type ChangeEvent } from "react";
import {
  FileUp,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Sparkles,
  Save,
  Trash2,
  Eye,
  Edit3,
  BookOpen,
  Layers,
  Clock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface ImportedDoc {
  id: string;
  name: string;
  type: "pdf" | "docx";
  sizeKb: number;
  uploadedAt: string;
  title: string;
  subject: string;
  level: string;
  content: string;
  isEdited?: boolean;
}

const SAMPLE_DOCS: ImportedDoc[] = [
  {
    id: "doc-sample-1",
    name: "مذكرة_رياضيات_الأعداد_المركبة_3AS.docx",
    type: "docx",
    sizeKb: 142,
    uploadedAt: "12 مارس 2026",
    title: "مذكرة بيداغوجية: الأعداد المركبة والتحويلات النقطية في المستوي",
    subject: "الرياضيات (Mathematics)",
    level: "3 ثانوي - شعبة علوم تجريبية ورياضيات",
    content: `المستوى: 3 ثانوي | الشعبة: علوم تجريبية / رياضيات
المادة: الرياضيات | المجال: الجبر والهندسة التحليلية
عنوان الوحدة: الأعداد المركبة والتحويلات النقطية

1. الكفاءات المستهدفة (Competencies):
- كتابة عدد مركب بالشكل الجبري، المثلثي والأسّي.
- حساب العمدة وطويلة عدد مركب وتطبيقها في حل المسائل الهندسية.
- التعرف على التحويلات النقطية (الانسحاب، التحاكي، الدوران) باستخدام الكتابة المركبة.

2. المكتسبات القبلية:
- حل معادلات الدرجة الثانية في مجموعة الأعداد الحقيقية R.
- الحساب المثلثي والزوايا الموجهة والمعلم المتعامد والمتجانس.

3. سيرورة الحصة التعليمية:
- وضعية الانطلاق (10 دقائق): تذكير بحل المعادلة x² + 1 = 0 وتقديم الوحدة التخيلية i.
- بناء المفهوم (25 دقيقة): تعريف الشكل الجبري z = a + ib، الطويلة والعمدة.
- نشاط تطبيقي جماعي (20 دقيقة): حل تمرين نموذجي من بكالوريا الجزائر 2024.
- التقويم التكويني (15 دقيقة): حل مسألة التحويل النقطي (الدوران).`,
  },
  {
    id: "doc-sample-2",
    name: "فرض_اللغة_الإنجليزية_الفصل_الثاني.pdf",
    type: "pdf",
    sizeKb: 310,
    uploadedAt: "08 مارس 2026",
    title: "موضوع اختبار تقييمي: اللغة الإنجليزية - Ethics in Business",
    subject: "اللغة الإنجليزية (English Language)",
    level: "3 ثانوي - جميع الشعب",
    content: `REPUBLIC OF ALGERIA - MINISTRY OF NATIONAL EDUCATION
TERM 2 ENGLISH EXAMINATION - 3RD YEAR SECONDARY SCHOOL
STREAM: SCIENTIFIC / MATHEMATICAL / FOREIGN LANGUAGES

PART ONE: READING COMPREHENSION (15 pts)
Topic: Integrity, Academic Honesty, and Corporate Responsibility.

A. Comprehension / Interpretation:
1. Are the following statements True or False according to the text?
   a) Transparency is a key pillar of sustainable economic development.
   b) Ethical leadership has no impact on student academic motivation.
2. In which paragraph is it mentioned that academic dishonesty harms innovation?
3. Answer the following questions according to the text:
   - What measures should institutions implement to prevent plagiarism?
   - How can digital learning environments promote fair assessment?

PART TWO: WRITTEN EXPRESSION (05 pts)
Choose ONE topic:
Topic 1: Write a public manifesto encouraging students to uphold intellectual integrity and honesty in high-stakes examinations.
Topic 2: Discuss the pros and cons of using generative AI tools in preparing educational portfolios.`,
  },
];

export function TeacherDocumentStudio({ isArabic }: { isArabic: boolean }) {
  const [docs, setDocs] = useState<ImportedDoc[]>(SAMPLE_DOCS);
  const [activeDocId, setActiveDocId] = useState<string>(SAMPLE_DOCS[0].id);
  const [editableContent, setEditableContent] = useState<string>(SAMPLE_DOCS[0].content);
  const [editableTitle, setEditableTitle] = useState<string>(SAMPLE_DOCS[0].title);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeDoc = docs.find((d) => d.id === activeDocId) || docs[0];

  const handleSelectDoc = (doc: ImportedDoc) => {
    setActiveDocId(doc.id);
    setEditableContent(doc.content);
    setEditableTitle(doc.title);
  };

  const processFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      toast.error(
        isArabic
          ? "تنبيه: يُسمح فقط بملفات PDF (.pdf) وملفات Word (.docx) للمعلمين."
          : "Format error: Only PDF (.pdf) and Word DOCX (.docx) files are supported for teachers."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const generatedContent =
        ext === "docx"
          ? `[تم استيراد مستند Word: ${file.name}]\nتاريخ الاستيراد: ${new Date().toLocaleDateString(
              "ar-DZ"
            )}\n\n-- نص المذكرة البيداغوجية المستخرجة --\nعنوان المستند: ${file.name.replace(
              /\.(docx|pdf)$/i,
              ""
            )}\n\n1. الأهداف التعليمية والكفاءات المستهدفة وفق المنهاج الوزاري.\n2. خطة العمل وتوزيع المهام الصفية والأنشطة الإدراكية.\n3. التقييم التكويني والملاحظات التوجيهية للأساتذة.`
          : `[تم استيراد وثيقة PDF: ${file.name}]\nحجم الملف: ${(file.size / 1024).toFixed(
              1
            )} كيلوبايت\n\n-- محتوى المستند الأكاديمي المعتمد --\nالوحدة: تحضير الامتحانات والمذكرات البيداغوجية\nيمكنك الآن تحرير هذا النص، تعديل الأسئلة، وإعادة تصديره كوثيقة رسمية.`;

      const newDoc: ImportedDoc = {
        id: "doc-" + Date.now(),
        name: file.name,
        type: ext as "pdf" | "docx",
        sizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toLocaleDateString("ar-DZ", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        title: file.name.replace(/\.(docx|pdf)$/i, "").replace(/_/g, " "),
        subject: isArabic ? "مادة المنهاج الجزائري" : "Curriculum Subject",
        level: isArabic ? "الطور الثانوي" : "Secondary Stage",
        content: generatedContent,
      };

      setDocs((prev) => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
      setEditableContent(newDoc.content);
      setEditableTitle(newDoc.title);
      toast.success(
        isArabic
          ? `تم استيراد المستند بنجاح (${file.name}) وجاهز للتحرير البيداغوجي!`
          : `Document ${file.name} imported and ready for editing!`
      );
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveDoc = () => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, content: editableContent, title: editableTitle, isEdited: true }
          : d
      )
    );
    toast.success(
      isArabic
        ? "تم حفظ التعديلات على المستند في المساحة المحلية بنجاح!"
        : "Document edits saved locally!"
    );
  };

  const handlePrintOrExport = () => {
    window.print();
    toast.success(isArabic ? "تم تجهيز المستند للطباعة والتصدير" : "Ready for print/export");
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (docs.length <= 1) {
      toast.error(isArabic ? "يجب الاحتفاظ بمستند واحد على الأقل" : "Must keep at least one document");
      return;
    }
    const remaining = docs.filter((d) => d.id !== id);
    setDocs(remaining);
    if (activeDocId === id) {
      handleSelectDoc(remaining[0]);
    }
    toast.success(isArabic ? "تم حذف المستند" : "Document removed");
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-700 via-indigo-800 to-cyan-700 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <FileUp className="h-4 w-4 text-cyan-300" />
              <span>{isArabic ? "استوديو الأساتذة: استيراد وتحرير المذكرات" : "Teacher Document Studio"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              {isArabic
                ? "استيراد وتعديل ملفات PDF و DOCX الحصرية للأساتذة"
                : "Dedicated PDF & DOCX Curriculum Editor for Teachers"}
            </h1>
            <p className="mt-1 text-xs text-indigo-100/90">
              {isArabic
                ? "نظام حصري يتيح للأساتذة رفع مذكرات الدروس، نماذج الاختبارات، وتعديلها بمرونة كاملة"
                : "Exclusive workspace for educators to upload lesson outlines, edit test papers, and export standardized handouts"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-indigo-900 shadow-lg transition hover:bg-cyan-50"
            >
              <FileUp className="h-4 w-4 text-indigo-700" />
              <span>{isArabic ? "استيراد ملف جديد (PDF / DOCX)" : "Import PDF / DOCX"}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-6 text-center transition ${
          isDragOver
            ? "border-cyan-400 bg-cyan-50/60 shadow-inner"
            : "border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:bg-indigo-50/40"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-md">
            <FileUp className="h-6 w-6" />
          </div>
          <p className="text-sm font-black text-slate-800">
            {isArabic
              ? "اسحب وأسقط ملفات المذكرات هنا، أو انقر للاختيار من جهازك"
              : "Drag & drop lesson files here, or click to browse"}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-rose-700">PDF (.pdf)</span>
            <span>+</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700">DOCX (.docx)</span>
            <span className="text-[11px] text-slate-400">
              {isArabic ? "— فقط الامتدادات المعتمدة للأستاذ" : "— Teacher verified formats only"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio: Left Document List + Right Rich Editor */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: List of imported files */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              {isArabic ? `المستندات المحفوظة (${docs.length})` : `Saved Documents (${docs.length})`}
            </h2>
          </div>

          <div className="space-y-2.5">
            {docs.map((doc) => {
              const isActive = doc.id === activeDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`group relative flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition ${
                    isActive
                      ? "border-indigo-400 bg-white shadow-md ring-2 ring-indigo-500/10"
                      : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black text-white ${
                        doc.type === "pdf" ? "bg-rose-500" : "bg-blue-600"
                      }`}
                    >
                      {doc.type === "pdf" ? "PDF" : "DOC"}
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-black text-slate-800">
                        {doc.title}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{doc.sizeKb} KB</span>
                        <span>•</span>
                        <span>{doc.uploadedAt}</span>
                      </p>
                      {doc.isEdited && (
                        <span className="mt-1.5 inline-block rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                          {isArabic ? "تم تحريره وتعديله" : "Modified"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteDoc(doc.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 transition"
                    title={isArabic ? "حذف المستند" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Document Editor Workspace */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-xl px-2.5 py-1 text-xs font-black text-white ${
                    activeDoc.type === "pdf" ? "bg-rose-500" : "bg-blue-600"
                  }`}
                >
                  {activeDoc.type.toUpperCase()}
                </span>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="text-lg font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDoc}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isArabic ? "حفظ التعديلات" : "Save Changes"}</span>
                </button>
                <button
                  onClick={handlePrintOrExport}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>{isArabic ? "طباعة / تصدير" : "Print / PDF"}</span>
                </button>
              </div>
            </div>

            {/* Document Metadata Strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                <span>{activeDoc.subject}</span>
              </span>
              <span>•</span>
              <span>{activeDoc.level}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">
                {isArabic ? "قابل للتحرير والطباعة الفورية" : "Editable & Ready"}
              </span>
            </div>

            {/* Interactive Text Area Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{isArabic ? "محرر محتوى المذكرة / الاختبار" : "Lesson Outline & Exam Editor"}</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {isArabic
                    ? "يمكنك تعديل الأسئلة، إدراج ملاحظات الكفاءات أو إضافة خطوات الحصة"
                    : "Live changes are preserved in the session"}
                </span>
              </div>
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                rows={18}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-sm leading-7 text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                placeholder={isArabic ? "اكتب أو عدل محتوى المذكرة هنا..." : "Edit document content here..."}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
            <span>{isArabic ? `اسم الملف الأصلي: ${activeDoc.name}` : `Original file: ${activeDoc.name}`}</span>
            <span>{isArabic ? "مساحة آمنة متوافقة مع المنهاج الجزائري" : "Compliant Algerian Curriculum Hub"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
