import React, { useState, useMemo } from "react";
import { trpc } from "../../lib/trpc";
import {
  BookOpen,
  Volume2,
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Play,
  Share2,
  GraduationCap,
  Layers,
  FileText,
  Languages,
  BadgeAlert,
  ArrowRight,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface CambridgeEntry {
  headword: string;
  part_of_speech: string;
  cefr_level: string;
  uk_ipa: string;
  us_ipa: string;
  uk_audio_url: string;
  us_audio_url: string;
  guideword?: string;
  definitions: string[];
  example_sentences: string[];
  url: string;
  arabicTranslation?: string;
}

const QUICK_TOPICS = [
  { id: "all", labelAr: "الكل (مستودع Apify)", labelEn: "All Scraped Words", word: "" },
  { id: "curriculum", labelAr: "المناهج والبيداغوجيا", labelEn: "Curriculum & Pedagogy", word: "curriculum" },
  { id: "phonetics", labelAr: "علم الصوتيات والنطق", labelEn: "Phonetics & IPA", word: "phonetics" },
  { id: "education", labelAr: "التربية والتعليم", labelEn: "Education", word: "education" },
  { id: "assessment", labelAr: "التقييم والاختبارات", labelEn: "Assessment", word: "assessment" },
  { id: "pronunciation", labelAr: "مخارج الحروف", labelEn: "Pronunciation", word: "pronunciation" },
  { id: "scholarship", labelAr: "المنح والرصانة العلمية", labelEn: "Scholarship", word: "scholarship" },
  { id: "bank", labelAr: "بيانات سياقية متقدمة", labelEn: "Bank (Polysemy)", word: "bank" }
];

export function CambridgeEnglishStudio({ isArabic = true }: { isArabic?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<CambridgeEntry | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newWordsInput, setNewWordsInput] = useState("");
  const [showActorModal, setShowActorModal] = useState(false);

  // Queries
  const searchQueryHook = trpc.cambridge.search.useQuery(
    { query: debouncedQuery },
    { staleTime: 60_000 }
  );

  const curatedBankQuery = trpc.cambridge.curatedBank.useQuery(undefined, {
    staleTime: 120_000,
  });

  const syncDatasetMutation = trpc.cambridge.syncDataset.useMutation({
    onSuccess: (data) => {
      toast.success(
        isArabic
          ? `تم تحديث قاعدة بيانات كامبريدج بنجاح (${data.count} مدخلة مسجلة)`
          : `Cambridge dataset refreshed (${data.count} entries loaded)`
      );
      searchQueryHook.refetch();
      curatedBankQuery.refetch();
    },
    onError: () => {
      toast.error(isArabic ? "تعذر الاتصال بـ Apify Dataset" : "Failed to sync Apify dataset");
    }
  });

  const triggerScraperMutation = trpc.cambridge.triggerScraper.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          isArabic
            ? "تم إطلاق كاشط كامبريدج على سحابة Apify بنجاح! سيتم سحب النتائج فور انتهائها."
            : "Apify Cambridge scraper started! Results will sync into the lexicon."
        );
        setShowActorModal(false);
        setNewWordsInput("");
      } else {
        toast.error(data.message || "Apify run failed");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to trigger scraper");
    }
  });

  // Handle Search Input Debounce with useEffect
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleInstantSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDebouncedQuery(searchQuery.trim());
  };

  // Web Speech Synthesis Fallback Helper (Works 100% reliably in all modern browsers)
  const speakWithSynthesis = (word: string, accent: "uk" | "us") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = accent === "uk" ? "en-GB" : "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingAudio(null);
      utterance.onerror = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAudio(null);
      toast.info(isArabic ? "الصوت غير مدعوم في متصفحك" : "Speech not supported in browser");
    }
  };

  // Play Audio Helper with automatic failover
  const playAudio = (rawUrl: string, id: string, wordText?: string, accent: "uk" | "us" = "uk") => {
    const word = wordText || selectedWord?.headword || activeWord?.headword || "";
    setPlayingAudio(id);

    const fallback = () => {
      if (word) {
        speakWithSynthesis(word, accent);
      } else {
        setPlayingAudio(null);
        toast.error(isArabic ? "تعذر تشغيل الصوت" : "Could not play sound");
      }
    };

    if (!rawUrl || rawUrl.trim() === "") {
      fallback();
      return;
    }

    const normalizedUrl = rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl;

    try {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = normalizedUrl;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.onended = () => setPlayingAudio(null);
          })
          .catch((err) => {
            console.warn("Audio tag error or hotlink protection, falling back to speech synthesis:", err);
            fallback();
          });
      }
      audio.onerror = () => {
        fallback();
      };
    } catch {
      fallback();
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(isArabic ? "تم النسخ إلى الحافظة بنجاح" : "Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Active items list
  const entries: CambridgeEntry[] = useMemo(() => {
    if (debouncedQuery.trim() && searchQueryHook.data?.entries) {
      return searchQueryHook.data.entries;
    }
    return curatedBankQuery.data || [];
  }, [debouncedQuery, searchQueryHook.data, curatedBankQuery.data]);

  const activeWord = selectedWord || entries[0] || null;

  // CEFR Badge Color helper
  const getCefrColor = (level: string) => {
    const l = (level || "").toUpperCase();
    if (l === "A1" || l === "A2") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (l === "B1" || l === "B2") return "bg-blue-50 text-blue-700 border-blue-200";
    if (l === "C1" || l === "C2") return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wider text-blue-200 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isArabic ? "تكامل رسمي مع كاشط قاموس كامبريدج الصوتي" : "Cambridge Dictionary & IPA Scraper (Apify)"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isArabic ? "منصة الصوتيات وقاموس كامبريدج لأساتذة اللغة الإنجليزية" : "Cambridge IPA & Lexicon for English Educators"}
            </h1>
            <p className="text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              {isArabic
                ? "بحث فوري عن الكلمات، الرموز الصوتية العالمية (IPA)، مستويات الإطار الأوروبي المشترك (CEFR A1-C2)، وتسجيلات النطق الصوتي البريطاني والأمريكي مع شواهد حية لتحضير الدروس والامتحانات."
                : "Real-time vocabulary definitions, International Phonetic Alphabet (IPA) transcriptions, official CEFR levels, and authentic UK/US audio clips for ESL lesson preparation."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => syncDatasetMutation.mutate()}
              disabled={syncDatasetMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition shadow-sm"
              title={isArabic ? "مزامنة سحابة Apify" : "Sync Apify Dataset"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncDatasetMutation.isPending ? "animate-spin" : ""}`} />
              <span>{isArabic ? "مزامنة النتائج من Apify" : "Sync Dataset"}</span>
            </button>

            <button
              onClick={() => setShowActorModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-md hover:shadow-blue-600/30"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isArabic ? "كشط قائمة كلمات جديدة" : "Scrape Word List"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Bar & Quick Categories */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <form onSubmit={handleInstantSearch} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isArabic
                  ? "ابحث عن أي كلمة بالإنجليزية واضغط Enter (مثال: curriculum, phonetics, assessment, pedagogy)..."
                  : "Search any English word and hit Enter (e.g., curriculum, phonetics, assessment, pedagogy)..."
              }
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm shrink-0 flex items-center gap-2"
          >
            {searchQueryHook.isFetching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isArabic ? "بحث في القاموس" : "Search"}</span>
          </button>
        </form>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-semibold shrink-0">
            {isArabic ? "مفردات المنهاج المقترحة:" : "Suggested Words:"}
          </span>
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => {
                setSearchQuery(topic.word);
                setDebouncedQuery(topic.word);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition ${
                searchQuery === topic.word
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isArabic ? topic.labelAr : topic.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Word View & Word List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Vocabulary List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>{isArabic ? "مفردات كاشط كامبريدج" : "Vocabulary Bank"}</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {entries.length} {isArabic ? "كلمة" : "words"}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                {isArabic ? "لا توجد نتائج مطابقة لبحثك" : "No matching words found"}
              </div>
            ) : (
              entries.map((entry, idx) => {
                const isSelected = activeWord?.headword === entry.headword && activeWord?.part_of_speech === entry.part_of_speech;
                return (
                  <button
                    key={`${entry.headword}-${entry.part_of_speech}-${idx}`}
                    onClick={() => setSelectedWord(entry)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-300 shadow-xs text-blue-950"
                        : "bg-slate-50/50 hover:bg-slate-100/80 border-slate-200/60 text-slate-800"
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 capitalize truncate">
                          {entry.headword}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600 font-mono">
                          {entry.part_of_speech}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {entry.uk_ipa ? `/${entry.uk_ipa}/` : entry.us_ipa ? `/${entry.us_ipa}/` : "—"}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {entry.cefr_level && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCefrColor(entry.cefr_level)}`}>
                          {entry.cefr_level}
                        </span>
                      )}
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Cambridge Word Card */}
        <div className="lg:col-span-2 space-y-6">
          {activeWord ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Word Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-950 capitalize tracking-tight">
                      {activeWord.headword}
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      {activeWord.part_of_speech}
                    </span>
                    {activeWord.cefr_level && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getCefrColor(activeWord.cefr_level)}`}>
                        CEFR {activeWord.cefr_level}
                      </span>
                    )}
                  </div>

                  {activeWord.guideword && (
                    <div className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
                      [{activeWord.guideword}]
                    </div>
                  )}

                  {activeWord.arabicTranslation && (
                    <p className="text-sm font-semibold text-slate-600 pt-1">
                      {activeWord.arabicTranslation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeWord.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
                  >
                    <span>{isArabic ? "قاموس كامبريدج الرسمي" : "Cambridge.org"}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <button
                    onClick={() => {
                      const text = `${activeWord.headword} (${activeWord.part_of_speech}) [${activeWord.cefr_level || "B1"}]\nUK IPA: /${activeWord.uk_ipa}/\nUS IPA: /${activeWord.us_ipa}/\nDefinition: ${activeWord.definitions[0] || ""}`;
                      copyToClipboard(text, "full-card");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
                  >
                    {copiedField === "full-card" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{isArabic ? "نسخ البطاقة" : "Copy Card"}</span>
                  </button>
                </div>
              </div>

              {/* Phonetics & Audio Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* UK British English */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🇬🇧</span>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">UK (British RP)</span>
                    </div>
                    <div className="font-mono text-base font-bold text-blue-950 flex items-center gap-2">
                      <span>/{activeWord.uk_ipa || "—"}/</span>
                      {activeWord.uk_ipa && (
                        <button
                          onClick={() => copyToClipboard(`/${activeWord.uk_ipa}/`, "uk-ipa")}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title="Copy IPA"
                        >
                          {copiedField === "uk-ipa" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => playAudio(activeWord.uk_audio_url, `uk-${activeWord.headword}`, activeWord.headword, "uk")}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition shadow-xs ${
                      playingAudio === `uk-${activeWord.headword}`
                        ? "bg-blue-600 text-white animate-pulse ring-2 ring-blue-400"
                        : "bg-white text-blue-700 border border-slate-200 hover:bg-blue-50"
                    }`}
                    title={isArabic ? "استماع للنطق البريطاني (تسجيل وصوتي ذكي)" : "Play UK Audio (Authentic + Voice Fallback)"}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* US American English */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🇺🇸</span>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">US (American)</span>
                    </div>
                    <div className="font-mono text-base font-bold text-blue-950 flex items-center gap-2">
                      <span>/{activeWord.us_ipa || "—"}/</span>
                      {activeWord.us_ipa && (
                        <button
                          onClick={() => copyToClipboard(`/${activeWord.us_ipa}/`, "us-ipa")}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title="Copy IPA"
                        >
                          {copiedField === "us-ipa" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => playAudio(activeWord.us_audio_url, `us-${activeWord.headword}`, activeWord.headword, "us")}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition shadow-xs ${
                      playingAudio === `us-${activeWord.headword}`
                        ? "bg-blue-600 text-white animate-pulse ring-2 ring-blue-400"
                        : "bg-white text-blue-700 border border-slate-200 hover:bg-blue-50"
                    }`}
                    title={isArabic ? "استماع للنطق الأمريكي (تسجيل وصوتي ذكي)" : "Play US Audio (Authentic + Voice Fallback)"}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Definitions Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isArabic ? "التعريفات المعجمية الرسمية (Definitions)" : "Official Definitions"}</span>
                </h4>

                <div className="space-y-2.5">
                  {activeWord.definitions.map((def, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-200/60 flex items-start gap-3"
                    >
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        {def}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Context Examples */}
              {activeWord.example_sentences && activeWord.example_sentences.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isArabic ? "شواهد وأمثلة سياقية موثقة (Examples in Context)" : "Authentic Context Sentences"}</span>
                  </h4>

                  <div className="space-y-2">
                    {activeWord.example_sentences.map((sentence, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-blue-50/40 border border-blue-100/70 text-sm text-slate-700 font-serif italic"
                      >
                        "{sentence}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pedagogical IPA Key Guide for Educators */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-amber-400" />
                    {isArabic ? "دليل الرموز الصوتية IPA لأساتذة الإنجليزية" : "IPA Phonetic Transcription Notes"}
                  </span>
                  <span className="text-[10px] text-slate-400">Cambridge English Standard</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1 text-slate-300">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">/iː/ sheep vs /ɪ/ ship</div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">/θ/ think vs /ð/ this</div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">/ʃ/ shoe vs /tʃ/ chair</div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">/æ/ cat vs /ʌ/ cup</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium">
                {isArabic ? "اختر كلمة من القائمة أو ابحث في المحرك لعرض البطاقة الصوتية" : "Select a word or search above to view IPA and Cambridge details"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trigger Apify Scraper Modal */}
      {showActorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Apify Cloud Scraper Integration</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isArabic ? "كشط مفردات جديدة من قاموس كامبريدج" : "Scrape New Words with Apify Actor"}
                </h3>
              </div>
              <button
                onClick={() => setShowActorModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic
                  ? "أدخل الكلمات المراد كشطها (مفصولة بفواصل أو مسافات):"
                  : "Enter words to scrape (separated by commas or spaces):"}
              </label>
              <textarea
                value={newWordsInput}
                onChange={(e) => setNewWordsInput(e.target.value)}
                placeholder="syntax, morphology, syllabus, cognition, bilingual"
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-500 leading-normal">
                {isArabic
                  ? "يتم إرسال الطلب مباشرة إلى ممثل Apify: jungle_synthesizer/cambridge-dictionary-definition-ipa-scraper بالتوكن المعتمد."
                  : "Will launch Apify actor (jungle_synthesizer/cambridge-dictionary-definition-ipa-scraper) with configured token."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowActorModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                disabled={!newWordsInput.trim() || triggerScraperMutation.isPending}
                onClick={() => {
                  const words = newWordsInput
                    .split(/[\n,;]+/)
                    .map((w) => w.trim().toLowerCase())
                    .filter(Boolean);
                  if (words.length === 0) {
                    toast.error(isArabic ? "يرجى إدخال كلمة واحدة على الأقل" : "Please enter at least one word");
                    return;
                  }
                  triggerScraperMutation.mutate({ startWords: words });
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 flex items-center gap-2"
              >
                {triggerScraperMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isArabic ? "جارٍ إطلاق الكاشط..." : "Starting..."}</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>{isArabic ? "بدء عملية الكشط" : "Run Apify Scraper"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
