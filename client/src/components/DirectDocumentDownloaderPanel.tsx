import { useState } from "react";
import {
  Download,
  FileText,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  FolderDown,
  ShieldCheck,
  Search,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DownloadHistoryItem {
  id: string;
  title: string;
  url: string;
  downloadUrl: string;
  date: string;
  sourceType: string;
}

export function DirectDocumentDownloaderPanel({ isArabic }: { isArabic: boolean }) {
  const [inputUrl, setInputUrl] = useState("");
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("edupulse_academic_downloads");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [resolvedResult, setResolvedResult] = useState<any | null>(null);

  const resolveMutation = trpc.academic.resolveDocument.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.downloadUrl) {
        setResolvedResult(data);
        toast.success(isArabic ? "تم استخراج ملف التحميل بنجاح!" : "Document ready for download!");

        // Add to history
        const newItem: DownloadHistoryItem = {
          id: `dl_${Date.now()}`,
          title: data.title || "Academic Document",
          url: inputUrl,
          downloadUrl: data.proxyDownloadUrl || data.downloadUrl,
          date: new Date().toLocaleDateString(isArabic ? "ar-DZ" : "en-US"),
          sourceType: data.sourceType,
        };

        const updatedHistory = [newItem, ...downloadHistory.slice(0, 9)];
        setDownloadHistory(updatedHistory);
        try {
          localStorage.setItem("edupulse_academic_downloads", JSON.stringify(updatedHistory));
        } catch {}
      } else {
        toast.error(data.message || (isArabic ? "تعذر استخراج المستند من هذا الرابط" : "Failed to resolve document"));
      }
    },
    onError: (err: any) => {
      toast.error(err.message || (isArabic ? "حدث خطأ أثناء معالجة الرابط" : "Error resolving document"));
    },
  });

  const handleResolveAndDownload = (overrideUrl?: string) => {
    const target = overrideUrl || inputUrl.trim();
    if (!target) {
      toast.error(isArabic ? "يرجى إدخال رابط المستند أولاً" : "Please enter a document URL first");
      return;
    }
    setResolvedResult(null);
    resolveMutation.mutate({ urlOrIdentifier: target });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-blue-900/40">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isArabic ? "تكامل التحميل الأكاديمي المباشر" : "Direct Academic Downloader"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isArabic ? "محمّل الكتب والمستندات والأبحاث الأكاديمية" : "Direct Research & Document Downloader"}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {isArabic
              ? "ألصق أي رابط لمستند أو كتاب مدفوع، أو معرّف DOI، أو رابط ورقة بحثية. يقوم النظام تلقائيًا بفك القيود وتوليد رابط تحميل مباشر بصيغة PDF على خادمنا دون تحويلك لأي طرف خارجي."
              : "Paste any document link, book URL, DOI, or research paper. Our engine resolves the direct PDF download stream immediately without routing you to third-party sites."}
          </p>

          {/* Input Box */}
          <div className="pt-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 focus-within:border-blue-400 transition-all">
              <div className="flex items-center flex-1 px-3">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResolveAndDownload()}
                  placeholder={
                    isArabic
                      ? "ألصق رابط المستند أو رابط أرشيف الإنترنت أو معرف DOI أو ورقة ArXiv..."
                      : "Paste document URL, Internet Archive link, DOI, or arXiv paper..."
                  }
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-400 outline-none"
                />
              </div>

              <button
                onClick={() => handleResolveAndDownload()}
                disabled={resolveMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm sm:text-base px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm disabled:opacity-50"
              >
                {resolveMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isArabic ? "جارٍ الاستخراج..." : "Resolving..."}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isArabic ? "تحميل المستند الآن" : "Download Document"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-300">
            <span className="text-slate-400">{isArabic ? "جرّب روابط سريعة:" : "Quick try:"}</span>
            <button
              onClick={() => {
                const u = "https://archive.org/details/algeria_bac_chemistry";
                setInputUrl(u);
                handleResolveAndDownload(u);
              }}
              className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors border border-white/10"
            >
              🏛️ {isArabic ? "أرشيف الوثائق التعليمية" : "Educational Archive"}
            </button>
            <button
              onClick={() => {
                const u = "10.1038/nature14539";
                setInputUrl(u);
                handleResolveAndDownload(u);
              }}
              className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors border border-white/10"
            >
              🔬 Nature DOI (Deep Learning)
            </button>
            <button
              onClick={() => {
                const u = "https://arxiv.org/abs/1706.03762";
                setInputUrl(u);
                handleResolveAndDownload(u);
              }}
              className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors border border-white/10"
            >
              ⚡ arXiv (Transformers Paper)
            </button>
          </div>
        </div>
      </div>

      {/* Resolved Result Card */}
      {resolvedResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>{isArabic ? "المستند جاهز للتحميل المباشر بنجاح" : "Document successfully ready"}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {resolvedResult.title}
            </h3>
            {resolvedResult.author && (
              <p className="text-xs text-slate-500">
                {isArabic ? "المؤلف:" : "Author:"} {resolvedResult.author}
              </p>
            )}
            <p className="text-xs text-slate-400 font-mono">
              {isArabic ? "اسم الملف المحفوظ:" : "Filename:"} {resolvedResult.filename}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={resolvedResult.proxyDownloadUrl || resolvedResult.downloadUrl}
              download={resolvedResult.filename}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isArabic ? "تحميل ملف PDF الآن" : "Download PDF Now"}</span>
            </a>

            {resolvedResult.downloadUrl && (
              <a
                href={resolvedResult.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isArabic ? "فتح في نافذة جديدة" : "Open in New Tab"}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Download History Table */}
      {downloadHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isArabic ? "سجل التحميلات الأخيرة" : "Recent Downloads"}
              </h3>
            </div>
            <button
              onClick={() => {
                setDownloadHistory([]);
                localStorage.removeItem("edupulse_academic_downloads");
              }}
              className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
            >
              {isArabic ? "مسح السجل" : "Clear history"}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {downloadHistory.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate font-mono">
                    {item.date} • {item.sourceType}
                  </p>
                </div>

                <a
                  href={item.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 p-2 rounded-lg text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                  title="Re-download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
