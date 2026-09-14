import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Download,
  ExternalLink,
  Copy,
  Check,
  Network,
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  RefreshCw,
  FileText,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AcademicSearchExplorerProps {
  isArabic: boolean;
  onSelectForGraph?: (identifier: string) => void;
}

export function AcademicSearchExplorerPanel({ isArabic, onSelectForGraph }: AcademicSearchExplorerProps) {
  const [queryInput, setQueryInput] = useState("artificial intelligence in higher education personalized learning");
  const [activeQuery, setActiveQuery] = useState("artificial intelligence in higher education personalized learning");
  const [source, setSource] = useState<"all" | "openalex" | "semanticscholar" | "crossref" | "europepmc" | "osf">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const searchQuery = trpc.academic.search.useQuery(
    {
      query: activeQuery,
      source: source === "osf" ? "all" : source,
      limit: 15,
    },
    {
      enabled: Boolean(activeQuery) && source !== "osf",
      staleTime: 5 * 60 * 1000,
    }
  );

  const osfQuery = trpc.integrations.osfShare.useQuery(
    {
      query: activeQuery,
      limit: 15,
    },
    {
      enabled: Boolean(activeQuery) && (source === "all" || source === "osf"),
      staleTime: 5 * 60 * 1000,
    }
  );

  const papers = useMemo(() => {
    if (source === "osf") {
      const osfItems = osfQuery.data || [];
      return osfItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        authors: item.contributors.length > 0 ? item.contributors : ["OSF Research Group"],
        year: item.datePublished ? parseInt(item.datePublished.slice(0, 4)) : null,
        citationCount: 0,
        venue: item.provider || "Open Science Framework (OSF)",
        doi: item.doi,
        source: "OSF",
        openAccess: true,
        landingPageUrl: item.url,
        pdfUrl: item.downloadUrl,
        abstract: item.description,
      }));
    }

    const basePapers = [...(searchQuery.data || [])];
    if (source === "all" && osfQuery.data && osfQuery.data.length > 0) {
      const osfMapped = osfQuery.data.slice(0, 3).map((item: any) => ({
        id: item.id,
        title: item.title,
        authors: item.contributors.length > 0 ? item.contributors : ["OSF Open Science"],
        year: item.datePublished ? parseInt(item.datePublished.slice(0, 4)) : null,
        citationCount: 0,
        venue: item.provider || "OSF Preprints",
        doi: item.doi,
        source: "OSF",
        openAccess: true,
        landingPageUrl: item.url,
        pdfUrl: item.downloadUrl,
        abstract: item.description,
      }));
      return [...basePapers, ...osfMapped];
    }

    return basePapers;
  }, [source, searchQuery.data, osfQuery.data]);

  const isLoading = source === "osf" ? osfQuery.isLoading : searchQuery.isLoading;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim()) return;
    setActiveQuery(queryInput.trim());
  };

  const handleDownload = (paper: any) => {
    if (paper.pdfUrl && paper.pdfUrl.endsWith(".pdf")) {
      triggerDownload(paper.pdfUrl, `${paper.title.slice(0, 45).replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "")}.pdf`);
      toast.success(isArabic ? "بدء تحميل ملف PDF..." : "Starting PDF download...");
      return;
    }

    setDownloadingId(paper.id);
    toast.info(isArabic ? "جارٍ استخراج وتجهيز المستند عبر مستودعات الوصول المفتوح..." : "Resolving open-access document...");
    resolveDocMutation.mutate({ urlOrIdentifier: paper.doi || paper.title });
  };

  const handleCopyCitation = (paper: any) => {
    const authors = paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "");
    const text = `${authors} (${paper.year || "n.d."}). ${paper.title}. ${paper.venue || "Academic Source"}.${paper.doi ? ` https://doi.org/${paper.doi}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedId(paper.id);
    toast.success(isArabic ? "تم نسخ التوثيق المرجعي" : "Citation copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {isArabic ? "محرك البحث الأكاديمي الموحد" : "Unified Academic Literature Search"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic
                ? "بحث متزامن عبر OpenAlex (مفتاح نشط)، Semantic Scholar، CrossRef (Polite Pool)، و Europe PMC"
                : "Multi-source indexing across OpenAlex, Semantic Scholar, CrossRef, and Europe PMC"}
            </p>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                isArabic
                  ? "ابحث عن أوراق علمية، رسائل ماجستير ودكتوراه، أو مفاهيم تربوية..."
                  : "Search academic literature, DOIs, theses, or learning sciences..."
              }
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isArabic ? "جارٍ البحث..." : "Searching..."}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{isArabic ? "بحث شامل" : "Search All"}</span>
              </>
            )}
          </button>
        </form>

        {/* Source Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500 mr-1">
            {isArabic ? "المصدر المختار:" : "Source Filter:"}
          </span>
          <button
            type="button"
            onClick={() => setSource("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              source === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🌐 {isArabic ? "الكل (مدمج وموحّد)" : "All Sources"}
          </button>
          <button
            type="button"
            onClick={() => setSource("osf")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              source === "osf"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🔬 {isArabic ? "بوابة OSF للعلوم المفتوحة" : "OSF Open Science"}
          </button>
          <button
            type="button"
            onClick={() => setSource("openalex")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              source === "openalex"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            📚 OpenAlex API
          </button>
          <button
            type="button"
            onClick={() => setSource("semanticscholar")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              source === "semanticscholar"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🔬 Semantic Scholar
          </button>
          <button
            type="button"
            onClick={() => setSource("crossref")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              source === "crossref"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🏛️ CrossRef (Polite)
          </button>
          <button
            type="button"
            onClick={() => setSource("europepmc")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              source === "europepmc"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🧬 Europe PMC
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {isArabic ? "جارٍ استرداد الأوراق العلمية والتحقق من الاستشهادات..." : "Fetching papers & citations across academic networks..."}
            </p>
          </div>
        )}

        {!isLoading && papers.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
            {isArabic ? "لم يتم العثور على أوراق تطابق هذا البحث. جرب كلمات مفتاحية أخرى أو معرّف DOI." : "No papers found for this search. Try different keywords or a DOI."}
          </div>
        )}

        {papers.map((paper: any) => (
          <div
            key={paper.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-3"
          >
            {/* Meta header */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  {paper.source}
                </span>
                {paper.openAccess && (
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                    Open Access
                  </span>
                )}
                {paper.citationCount > 0 && (
                  <span className="text-slate-500 font-mono">
                    ★ {paper.citationCount.toLocaleString()} {isArabic ? "استشهاد" : "citations"}
                  </span>
                )}
              </div>

              <span className="font-mono text-slate-400">{paper.year || "n.d."}</span>
            </div>

            {/* Title */}
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {paper.title}
            </h4>

            {/* Authors & Venue */}
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {paper.authors?.join(", ")}
              </p>
              {paper.venue && <p className="italic text-slate-500">{paper.venue}</p>}
            </div>

            {/* Abstract */}
            {paper.abstract && (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {paper.abstract}
              </p>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                {/* Build Graph Trigger */}
                {onSelectForGraph && (
                  <button
                    onClick={() => onSelectForGraph(paper.doi || paper.title)}
                    className="bg-[#0b5394] hover:bg-[#083c6c] text-white text-xs font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>{isArabic ? "بناء رسم بياني متصل" : "Build Graph"}</span>
                  </button>
                )}

                {/* Direct Download Button */}
                <button
                  onClick={() => handleDownload(paper)}
                  disabled={downloadingId === paper.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-60"
                >
                  {downloadingId === paper.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {downloadingId === paper.id
                      ? isArabic ? "جارٍ التجهيز..." : "Preparing..."
                      : isArabic ? "تحميل PDF المباشر" : "Download PDF"}
                  </span>
                </button>

                {/* External Link */}
                {paper.landingPageUrl && (
                  <a
                    href={paper.landingPageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isArabic ? "المصدر" : "Source"}</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => handleCopyCitation(paper)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
              >
                {copiedId === paper.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isArabic ? "نسخ الاقتباس" : "Cite"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
