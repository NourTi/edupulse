import React, { useState } from "react";
import {
  Download,
  Search,
  BookOpen,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Eye,
  Filter,
  ArrowDownToLine,
  Globe,
  Database,
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";

interface BookAndDocumentDownloaderProps {
  isArabic?: boolean;
}

export function BookAndDocumentDownloader({ isArabic = true }: BookAndDocumentDownloaderProps) {
  const [activeTab, setActiveTab] = useState<"direct_resolver" | "archive_org">("direct_resolver");

  // Direct Document Downloader State
  const [documentInput, setDocumentInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolvedDoc, setResolvedDoc] = useState<any>(null);

  // Archive.org State
  const [archiveQuery, setArchiveQuery] = useState("الجزائر تاريخ التربية والعلوم");
  const [archiveMediaType, setArchiveMediaType] = useState("texts");
  const [selectedArchiveItem, setSelectedArchiveItem] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const resolveDocMutation = trpc.academic.resolveDocument.useMutation();
  const archiveSearchQuery = trpc.integrations.archiveOrgSearch.useQuery(
    { query: archiveQuery, mediatype: archiveMediaType, limit: 12 },
    { enabled: activeTab === "archive_org" }
  );

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentInput.trim()) return;

    setResolving(true);
    setResolvedDoc(null);

    try {
      const result = await resolveDocMutation.mutateAsync({
        urlOrIdentifier: documentInput.trim(),
      });

      if (result.success) {
        setResolvedDoc(result);
        toast.success(isArabic ? "تم استخراج وتحضير رابط التحميل المباشر بنجاح!" : "Document resolved successfully!");
      } else {
        toast.error(result.message || (isArabic ? "تعذر استخراج هذا المستند." : "Could not resolve document."));
      }
    } catch (err: any) {
      toast.error(err.message || (isArabic ? "حدث خطأ أثناء معالجة الرابط." : "Resolution error."));
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 p-6 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <Database className="h-3.5 w-3.5" />
              <span>{isArabic ? "بوابة تنزيل الكتب والمراجع العلمية السيادية" : "Sovereign Academic Library & Direct Downloader"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {isArabic ? "محرك تنزيل الكتب والأوراق البحثية" : "Book & Research Paper Downloader"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {isArabic
                ? "تنزيل مباشر للكتب والأوراق الأكاديمية والوثائق، وتصفح مكتبة Archive.org بدون وسطاء أو إعلانات."
                : "Direct book & paper downloads via private streaming proxy with integrated Archive.org metadata API."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("direct_resolver")}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
                activeTab === "direct_resolver"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {isArabic ? "التنزيل المباشر (Direct Downloader)" : "Direct Downloader"}
            </button>
            <button
              onClick={() => setActiveTab("archive_org")}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
                activeTab === "archive_org"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {isArabic ? "مكتبة Archive.org العالمية" : "Archive.org API Library"}
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Direct Sovereign Downloader */}
      {activeTab === "direct_resolver" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              {isArabic ? "أدخل رابط الكتاب أو الورقة البحثية" : "Enter Document, Book or DOI Link"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {isArabic
                ? "يدعم روابط المستودعات والمكتبات الرقمية، أرشيف الإنترنت (Internet Archive)، أوراق ArXiv، معرفات DOI الأكاديمية، والملفات المباشرة."
                : "Supports digital library documents, Internet Archive, arXiv papers, academic DOIs, and direct repositories."}
            </p>

            <form onSubmit={handleResolve} className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                value={documentInput}
                onChange={(e) => setDocumentInput(e.target.value)}
                placeholder={
                  isArabic
                    ? "الصق رابط المستند أو معرف الأرشيف أو DOI (مثال: archive.org/details/... أو 10.1038/...)"
                    : "Paste document URL, archive.org ID, arXiv or DOI (e.g., 10.1038/..., 2301.07041)..."
                }
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={resolving || !documentInput.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
              >
                {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                <span>{resolving ? (isArabic ? "جاري الاستخراج..." : "Resolving...") : isArabic ? "تحضير التنزيل" : "Download"}</span>
              </button>
            </form>

            {/* Quick Sample Links */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{isArabic ? "روابط سريعة للتجربة:" : "Quick samples:"}</span>
              {[
                { label: isArabic ? "دليل الكيمياء للبكالوريا" : "Chemistry BAC Guide", url: "https://archive.org/details/algeria_bac_chemistry" },
                { label: "arXiv Physics (Quantum Waves)", url: "2301.07041" },
                { label: "Nature Science DOI", url: "10.1038/nature12373" },
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDocumentInput(sample.url);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolved Document Card */}
          {resolvedDoc && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-600 p-3 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        {isArabic ? "جاهز للتنزيل المباشر" : "Ready to Download"}
                      </span>
                      <span className="text-xs text-slate-500 uppercase font-semibold">{resolvedDoc.format}</span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{resolvedDoc.title}</h3>
                    {resolvedDoc.author && <p className="text-xs text-slate-600">{resolvedDoc.author}</p>}
                    <p className="mt-1 text-xs text-slate-500 font-mono">{resolvedDoc.filename}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={resolvedDoc.proxyDownloadUrl}
                    download={resolvedDoc.filename}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isArabic ? "تنزيل الملف المباشر (PDF)" : "Download File (PDF)"}</span>
                  </a>

                  {resolvedDoc.downloadUrl && (
                    <a
                      href={resolvedDoc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{isArabic ? "عرض المصدر" : "View"}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Archive.org Integration */}
      {activeTab === "archive_org" && (
        <div className="space-y-6">
          {/* Search Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={archiveQuery}
                  onChange={(e) => setArchiveQuery(e.target.value)}
                  placeholder={isArabic ? "ابحث في ملايين الكتب والوثائق التاريخية والمخطوطات..." : "Search Internet Archive books & items..."}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={archiveMediaType}
                onChange={(e) => setArchiveMediaType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700"
              >
                <option value="texts">{isArabic ? "كتب ومخطوطات (Texts)" : "Books (Texts)"}</option>
                <option value="audio">{isArabic ? "تسجيلات صوتية ومحاضرات" : "Audio Recordings"}</option>
                <option value="data">{isArabic ? "مجموعات بيانات" : "Data Collections"}</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {archiveSearchQuery.isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="mr-3 text-sm text-slate-600">{isArabic ? "جاري البحث في Archive.org..." : "Searching Archive.org..."}</span>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(archiveSearchQuery.data || []).map((item) => (
                <div
                  key={item.identifier}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-blue-600">{item.mediatype}</span>
                      {item.year && <span>{item.year}</span>}
                    </div>

                    <h3 className="font-bold text-slate-900 line-clamp-2 text-sm md:text-base leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">{item.creator || (isArabic ? "مؤلف غير محدد" : "Unknown Author")}</p>
                    <p className="mt-2 line-clamp-3 text-xs text-slate-600 leading-relaxed">
                      {item.description || (isArabic ? "لا يوجد وصف تفصيلي متوفر لهذا العنصر." : "No description available.")}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedArchiveItem(item);
                        setPreviewOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{isArabic ? "معاينة وقراءة" : "Preview"}</span>
                    </button>

                    <a
                      href={item.directPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{isArabic ? "تنزيل PDF" : "Download"}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reader / Embed Modal */}
      {previewOpen && selectedArchiveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative flex flex-col h-[85vh] w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base">{selectedArchiveItem.title}</h3>
                <p className="text-xs text-slate-500">{selectedArchiveItem.creator}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedArchiveItem.directPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  <Download className="inline h-3.5 w-3.5 ml-1" />
                  {isArabic ? "تنزيل" : "Download"}
                </a>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100">
              <iframe
                src={selectedArchiveItem.embedUrl}
                title={selectedArchiveItem.title}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
