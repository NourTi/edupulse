import React, { useState } from "react";
import {
  Globe,
  Search,
  BookOpen,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Database,
  Calendar,
  Users,
  CheckCircle2,
  Loader2,
  Download,
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";

interface OsfResearchGatewayProps {
  isArabic?: boolean;
}

export function OsfResearchGateway({ isArabic = true }: OsfResearchGatewayProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("artificial intelligence education machine learning");
  const [activeQuery, setActiveQuery] = useState("artificial intelligence education machine learning");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const triggerDownload = (url: string, filename?: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      if (filename) a.download = filename;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = url;
    }
  };

  const resolveDocMutation = trpc.academic.resolveDocument.useMutation({
    onSuccess: (data: any) => {
      setDownloadingId(null);
      if (data.success && (data.proxyDownloadUrl || data.downloadUrl)) {
        toast.success(isArabic ? "تم استخراج وتجهيز المستند وبدء التحميل المباشر" : "Document resolved, starting direct download");
        triggerDownload(data.proxyDownloadUrl || data.downloadUrl, data.filename);
      } else {
        toast.error(data.message || (isArabic ? "تعذر استخراج المستند الأكاديمي" : "Could not resolve paper document"));
      }
    },
    onError: (err: any) => {
      setDownloadingId(null);
      toast.error(err.message);
    },
  });

  const handleDownload = (item: any) => {
    if (item.downloadUrl && item.downloadUrl.endsWith(".pdf")) {
      triggerDownload(item.downloadUrl, `${item.title.slice(0, 45).replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "")}.pdf`);
      toast.success(isArabic ? "بدء تحميل ملف PDF..." : "Starting PDF download...");
      return;
    }

    setDownloadingId(item.id);
    toast.info(isArabic ? "جارٍ استخراج وتجهيز المستند عبر مستودعات الوصول المفتوح..." : "Resolving open-access document...");
    resolveDocMutation.mutate({ urlOrIdentifier: item.doi || item.url || item.title });
  };

  const osfQuery = trpc.integrations.osfShare.useQuery(
    { query: activeQuery, limit: 12 },
    { enabled: isEnabled && Boolean(activeQuery) }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveQuery(searchQuery.trim());
  };

  const sampleKeywords = [
    { label: "الذكاء الاصطناعي في التعليم", q: "artificial intelligence in education" },
    { label: "مناهج STEM والتعلم النشط", q: "STEM curriculum active learning" },
    { label: "الفيزياء التجريبية ومحاكاة النماذج", q: "experimental physics simulation" },
    { label: "التقييم التربوي وقياس الكفاءات", q: "pedagogical assessment competencies" },
  ];

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 p-6 text-white shadow-sm border border-cyan-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/30">
              <Database className="h-3.5 w-3.5" />
              <span>{isArabic ? "بوابة الأستاذ الباحث · شبكة OSF/SHARE المفتوحة" : "OSF / SHARE Open Research Dataset"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              {isArabic ? "مستودع الأبحاث والأنشطة العلمية المفتوحة" : "OSF Open Scholarly Activities Gateway"}
            </h1>
            <p className="mt-1 text-sm text-cyan-200/80 max-w-3xl">
              {isArabic
                ? "قاعدة بيانات ضخمة ومجانية ومفتوحة لجميع الأنشطة البحثية، الأطروحات، والأوراق الأكاديمية الصادرة عن مراكز الأبحاث العالمية وجامعات العالم."
                : "Free, open dataset connecting educators & professors to global scholarly activities, preprints, and research datasets."}
            </p>
          </div>

          {/* User Requested Toggle Button */}
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/15">
            <span className="text-xs font-semibold text-white">
              {isArabic ? "تفعيل بوابة OSF المفتوحة" : "OSF Gateway"}
            </span>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className="text-cyan-400 hover:text-cyan-300 transition"
              title="Toggle OSF Dataset"
            >
              {isEnabled ? (
                <ToggleRight className="h-7 w-7 text-cyan-400" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content when Enabled */}
      {isEnabled ? (
        <div className="space-y-6">
          {/* Search Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? "ابحث في مستودع OSF بالكلمات المفتاحية أو اسم الباحث..." : "Search OSF scholarly database..."}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <button
                type="submit"
                disabled={osfQuery.isFetching || !searchQuery.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-50 transition shadow-sm"
              >
                {osfQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>{osfQuery.isFetching ? (isArabic ? "جاري البحث..." : "Searching...") : isArabic ? "بحث في OSF" : "Search"}</span>
              </button>
            </form>

            {/* Quick Keyword Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{isArabic ? "مواضيع مقترحة:" : "Suggested topics:"}</span>
              {sampleKeywords.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item.q);
                    setActiveQuery(item.q);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {osfQuery.isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
              <span className="mr-3 text-sm text-slate-600">{isArabic ? "جاري استرجاع الأبحاث والبيانات من OSF/SHARE..." : "Fetching OSF scholarly records..."}</span>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(osfQuery.data || []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-cyan-600 uppercase text-[10px] bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100">
                        {item.type}
                      </span>
                      {item.datePublished && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3" />
                          <span>{item.datePublished.slice(0, 10)}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 line-clamp-2 text-sm md:text-base leading-snug">
                      {item.title}
                    </h3>

                    {item.contributors && item.contributors.length > 0 && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span>{item.contributors.join(", ")}</span>
                      </p>
                    )}

                    <p className="mt-2.5 line-clamp-3 text-xs text-slate-600 leading-relaxed">
                      {item.description || (isArabic ? "مستودع بحثي مفتوح يشمل بيانات أولية ومخرجات علمية كاملة." : "Open research dataset with verified scholarly methodology.")}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">{item.provider || "OSF Datasets"}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition disabled:opacity-50"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        <span>{downloadingId === item.id ? (isArabic ? "جارٍ التجهيز..." : "Preparing...") : (isArabic ? "تحميل PDF" : "Download PDF")}</span>
                      </button>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                        >
                          <span>{isArabic ? "المصدر" : "View"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Disabled State */
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ToggleLeft className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {isArabic ? "بوابة الأبحاث المفتوحة OSF متوقفة حالياً" : "OSF Research Gateway is Inactive"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            {isArabic
              ? "يمكنك تفعيل الزر في الأعلى في أي وقت للوصول المباشر إلى مستودع أبحاث OSF/SHARE."
              : "Toggle the switch in the header to search and browse open scholarly records."}
          </p>
          <button
            onClick={() => setIsEnabled(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isArabic ? "تفعيل البوابة الآن" : "Enable Gateway"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
