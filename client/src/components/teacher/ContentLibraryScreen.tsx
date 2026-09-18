import React, { useState, useEffect } from "react";
import {
  FolderArchive,
  Search,
  BookOpen,
  HelpCircle,
  ClipboardCheck,
  Layers,
  Lightbulb,
  FileCheck2,
  Trash2,
  Eye,
  Download,
  Printer,
  Copy,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ExportHubBar } from "./ExportHubBar";
import { exportToWordDocument, exportToPrintablePdf, copyMarkdownToClipboard } from "@/lib/documentExport";

interface LibraryItem {
  id: string;
  type: string;
  title: string;
  subject: string;
  gradeLevel?: string;
  topic?: string;
  content: string;
  rawJson?: any;
  language: string;
  mode: string;
  createdAt: string;
}

interface ContentLibraryScreenProps {
  isArabic?: boolean;
}

const TYPE_CONFIG: Record<
  string,
  { labelAr: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  lesson_notes: {
    labelAr: "مذكرات الدروس",
    labelEn: "Lesson Notes",
    icon: BookOpen,
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
  },
  quiz: {
    labelAr: "أسئلة QCM",
    labelEn: "QCM Quizzes",
    icon: HelpCircle,
    color: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  },
  rubric: {
    labelAr: "سلالم التقييم",
    labelEn: "Rubrics",
    icon: ClipboardCheck,
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
  },
  support_sheets: {
    labelAr: "أوراق الدعم (3 مستويات)",
    labelEn: "Support Sheets",
    icon: Layers,
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  },
  summary_flashcards: {
    labelAr: "ملخص وبطاقات",
    labelEn: "Summary & Flashcards",
    icon: Lightbulb,
    color: "bg-purple-500/20 text-purple-300 border-purple-400/30",
  },
  homework: {
    labelAr: "واجبات منزلية",
    labelEn: "Homework Sheets",
    icon: FileCheck2,
    color: "bg-pink-500/20 text-pink-300 border-pink-400/30",
  },
};

export function ContentLibraryScreen({ isArabic = true }: ContentLibraryScreenProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url =
        selectedType && selectedType !== "all"
          ? `/api/teacher-generators/library?type=${selectedType}`
          : "/api/teacher-generators/library";
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to load library:", err);
      toast.error(isArabic ? "تعذر تحميل محتويات المكتبة" : "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isArabic ? "هل أنت متأكد من حذف هذا المستند من مكتبتك؟" : "Delete this document?")) {
      return;
    }
    try {
      const res = await fetch(`/api/teacher-generators/library/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        toast.success(isArabic ? "تم حذف المستند بنجاح" : "Document deleted");
      }
    } catch (err) {
      toast.error(isArabic ? "تعذر حذف المستند" : "Failed to delete");
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q) ||
      item.topic?.toLowerCase().includes(q) ||
      item.gradeLevel?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f283d] via-[#1a365d] to-[#0f172a] p-6 text-white shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200 border border-cyan-400/30">
              <FolderArchive className="h-3.5 w-3.5" />
              <span>{isArabic ? "المستودع الرقمي للأستاذ" : "Teacher Content Repository"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
              {isArabic ? "مكتبة المحتوى التعليمي المحفوظ" : "Content Library & Memory"}
            </h1>
            <p className="mt-1 text-sm text-cyan-100/75">
              {isArabic
                ? "تصفح، ابحث، وصدر كافة مذكراتك واختباراتك وأوراق عملك المولدة مع تصدير فوري إلى Word و PDF."
                : "Search, review, and export all your generated lesson notes, quizzes, rubrics, and support sheets."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchItems}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition"
              title={isArabic ? "تحديث القائمة" : "Refresh"}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{isArabic ? "تحديث المكتبة" : "Refresh"}</span>
            </button>
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 text-center">
              <span className="text-xl font-bold text-cyan-300">{filteredItems.length}</span>
              <span className="text-[10px] text-white/60 block">{isArabic ? "وثيقة محفوظة" : "Documents"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? "بحث بالعنوان، المادة، أو الطور..." : "Search by topic, subject..."}
            className="w-full rounded-xl border border-white/15 bg-white/10 pr-9 pl-4 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedType === "all"
                ? "bg-cyan-500 text-white shadow-sm"
                : "bg-white/5 text-white/60 hover:bg-white/15 hover:text-white"
            }`}
          >
            {isArabic ? "الكل" : "All"}
          </button>
          {Object.entries(TYPE_CONFIG).map(([typeKey, cfg]) => {
            const isSel = selectedType === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedType(typeKey)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  isSel
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "bg-white/5 text-white/60 hover:bg-white/15 hover:text-white"
                }`}
              >
                {isArabic ? cfg.labelAr : cfg.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Library Cards */}
      {loading ? (
        <div className="py-12 text-center text-white/50 text-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
          <span>{isArabic ? "جاري استرجاع مستندات المكتبة..." : "Loading saved documents..."}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <FolderArchive className="h-10 w-10 mx-auto mb-3 text-white/30" />
          <h3 className="text-base font-semibold text-white">
            {isArabic ? "لا توجد مستندات بعد" : "No documents found"}
          </h3>
          <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
            {isArabic
              ? "استخدم أي من المولدات الستة لإنشاء مذكرات، اختبارات، أو أوراق دعم وسيتم حفظها هنا تلقائياً."
              : "Generate lesson notes, quizzes, or support sheets and they will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const typeInfo = TYPE_CONFIG[item.type] || {
              labelAr: item.type,
              labelEn: item.type,
              icon: BookOpen,
              color: "bg-white/10 text-white border-white/20",
            };
            const Icon = typeInfo.icon;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.06] shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${typeInfo.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{isArabic ? typeInfo.labelAr : typeInfo.labelEn}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-rose-400 hover:bg-rose-500/20 transition"
                      title={isArabic ? "حذف المستند" : "Delete"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-cyan-300 transition">
                    {item.title}
                  </h3>

                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-cyan-300">
                      {item.subject}
                    </span>
                    {item.gradeLevel && (
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-200">
                        {item.gradeLevel}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-white/50 line-clamp-3 leading-relaxed">
                    {item.content.slice(0, 180)}...
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString(isArabic ? "ar-DZ" : "en-US")}
                  </span>
                  <span className="text-cyan-300 group-hover:underline">
                    {isArabic ? "عرض وتصدير ←" : "View & Export →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Item Full Preview Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5 bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-cyan-500/20 p-2 text-cyan-300 border border-cyan-400/30">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{selectedItem.title}</h3>
                  <p className="text-xs text-white/50">
                    {selectedItem.subject} &bull; {selectedItem.gradeLevel || "عام"} &bull;{" "}
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Export Bar */}
            <div className="p-4 border-b border-white/10 bg-white/[0.01]">
              <ExportHubBar
                title={selectedItem.title}
                content={selectedItem.content}
                meta={{ subject: selectedItem.subject, grade: selectedItem.gradeLevel }}
                isArabic={isArabic}
                isSaved={true}
              />
            </div>

            {/* Modal Body with scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 text-xs sm:text-sm leading-relaxed text-white/90 whitespace-pre-wrap font-sans">
              {selectedItem.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
