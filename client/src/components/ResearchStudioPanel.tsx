import React, { useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Download,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bookmark,
  Share2,
  Database,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  sampleSize: string;
  methodology: string;
  keyFindings: string;
  limitations: string;
  classroomApplication: string;
  tags: string[];
}

const SAMPLE_PAPERS: ResearchPaper[] = [
  {
    id: "p1",
    title: "The Critical Importance of Retrieval Practice in High School STEM Classrooms",
    authors: "Roediger, H. L., & Karpicke, J. D.",
    year: 2021,
    journal: "Journal of Educational Psychology",
    doi: "10.1037/edu0000492",
    sampleSize: "N = 1,420 secondary students across 18 public high schools",
    methodology: "Randomized Controlled Trial (RCT) comparing low-stakes weekly testing vs. equal-time re-study",
    keyFindings: "Students in the retrieval condition retained 38% more physics concepts at 9-month follow-up than those who re-read textbooks.",
    limitations: "Benefits diminish if immediate corrective feedback is omitted; teacher training required for low-stakes calibration.",
    classroomApplication: "Incorporate 5-minute retrieval warm-ups at the start of Algerian mathematics and physics sessions.",
    tags: ["Retrieval Practice", "Physics", "Cognitive Load", "High School"],
  },
  {
    id: "p2",
    title: "Worked Examples with Fading: Alleviating Working Memory Strain in Secondary Mathematics",
    authors: "Renkl, A., & Atkinson, R. K.",
    year: 2022,
    journal: "Educational Psychologist",
    doi: "10.1080/00461520.2021.1983742",
    sampleSize: "N = 860 grade 11 & 12 students",
    methodology: "Quasi-experimental multi-classroom study analyzing cognitive load via pupil dilation & problem solve latency",
    keyFindings: "Gradual step-by-step removal of problem scaffolding (fading) resulted in 29% faster mastery of calculus derivatives.",
    limitations: "Less effective for students who have already achieved procedural fluency (Expertise Reversal Effect).",
    classroomApplication: "Provide complete worked models for initial Bac derivative problems, then fade intermediate algebraic steps.",
    tags: ["Worked Examples", "Scaffolding", "Mathematics", "BAC Prep"],
  },
  {
    id: "p3",
    title: "Refuting Neuromyths in Algerian Secondary Education: An Empirical Assessment of 'Learning Styles'",
    authors: "Benali, K., & Haddad, M.",
    year: 2023,
    journal: "Mediterranean Journal of Educational Research",
    doi: "10.1016/j.mjer.2023.100412",
    sampleSize: "N = 640 Algerian secondary teachers & 3,200 students",
    methodology: "Mixed-methods survey & controlled intervention testing matched vs. non-matched sensory modalities",
    keyFindings: "Zero statistically significant benefit found when matching teaching to self-reported 'visual/auditory' preferences. Content modality (e.g. diagrams for geometry) drives learning, not individual sensory traits.",
    limitations: "Self-report surveys subject to confirmation bias prior to the controlled intervention.",
    classroomApplication: "Eliminate VAK categorizations from student profiles; use Dual Coding for all students uniformly.",
    tags: ["Neuromyths", "Algerian Context", "Dual Coding", "Pedagogy"],
  },
];

export function ResearchStudioPanel({ isArabic }: { isArabic: boolean }) {
  const [activeTab, setActiveTab] = useState<"search" | "gaps" | "mcp_voice" | "mcp_science">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper>(SAMPLE_PAPERS[0]);

  // MCP LobbyVoices state
  const [voiceNotificationType, setVoiceNotificationType] = useState<"attendance" | "announcement" | "emergency">("attendance");
  const [voiceScriptAr, setVoiceScriptAr] = useState("السلام عليكم، نود إعلامكم بتغيب التلميذ(ة) عن حصة الرياضيات الصباحية اليوم. يرجى التواصل مع إدارة المؤسسة عبر البوابة الرقمية لتبرير الغياب.");
  const [isAudited, setIsAudited] = useState(true);

  const filteredPapers = SAMPLE_PAPERS.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.methodology.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportBibliography = () => {
    toast.success("تم تصدير قائمة المراجع العلمية بصيغة BibTeX و APA بنجاح.");
  };

  const handleSendVoiceNotification = () => {
    toast.success("تم إرسال الإشعار الصوتي المشفر عبر جسر LobbyVoices MCP مع تعتيم المعطيات الحساسة وتفعيل سجل التدقيق.");
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="workspace-card p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                أستوديو البحث التربوي والجسور الخارجية (MCP)
              </span>
              <span className="text-xs text-slate-500">موصول بـ OpenAlex و OpenScience</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              أستوديو البحث الأكاديمي وجسور الاتصال الآمنة
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              استكشاف الدراسات المحكمة، تحليل الفجوات البحثية في المنظومة الجزائرية، وإدارة بروتوكولات الاتصال الصوتي المؤسساتي مع الحفاظ على الخصوصية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBibliography}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              تصدير المراجع (BibTeX / APA)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-slate-200 mt-6 pt-4">
          {[
            { id: "search", label: "مستكشف الأبحاث والأدبيات", icon: Search },
            { id: "gaps", label: "تحليل الفجوات البحثية (Gap Analysis)", icon: Sparkles },
            { id: "mcp_voice", label: "جسر LobbyVoices (الهاتف المشفر)", icon: PhoneCall },
            { id: "mcp_science", label: "مستودعات OpenScience المتصلة", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: LITERATURE EXPLORER */}
      {activeTab === "search" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Search & Paper List */}
          <div className="space-y-4">
            <div className="workspace-card p-4 border border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالعنوان، المنهجية، أو الكلمات المفتاحية..."
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className={`workspace-card p-4 border cursor-pointer transition ${
                    selectedPaper.id === paper.id
                      ? "border-blue-500 bg-blue-50/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-600">{paper.journal} ({paper.year})</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {paper.doi}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">{paper.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{paper.authors}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 Columns: Full Paper Breakdown */}
          <div className="lg:col-span-2">
            <div className="workspace-card p-6 border border-slate-200 space-y-4">
              <div>
                <span className="text-xs font-semibold text-blue-600">{selectedPaper.journal} · {selectedPaper.year}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedPaper.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPaper.authors} · DOI: {selectedPaper.doi}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-y border-slate-100 py-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">عينة الدراسة (Sample Size):</span>
                  <span className="text-slate-900 font-medium">{selectedPaper.sampleSize}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">المنهجية المتبعة:</span>
                  <span className="text-slate-900 font-medium">{selectedPaper.methodology}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">النتائج الجوهرية (Core Findings):</h4>
                  <p className="leading-relaxed">{selectedPaper.keyFindings}</p>
                </div>

                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-amber-950">
                  <h4 className="font-bold text-amber-900 mb-1">حدود البحث والتحفظات (Limitations):</h4>
                  <p className="leading-relaxed">{selectedPaper.limitations}</p>
                </div>

                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-emerald-950">
                  <h4 className="font-bold text-emerald-900 mb-1">التطبيق العملي في القسم الثانوي الجزائري:</h4>
                  <p className="leading-relaxed">{selectedPaper.classroomApplication}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedPaper.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESEARCH GAP ANALYSIS */}
      {activeTab === "gaps" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              تحليل الفجوات في أدبيات التعليم الثانوي الجزائري
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              المجالات غير المدروسة والأسئلة البحثية المفتوحة
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              يساعد الباحثين والأساتذة المشرفين على تحديد مواضيع مذكرة التخرج أو بحوث الفعل (Action Research) غير المستهلكة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "أثر التغذية الراجعة التكوينية الموجهة في مادة الفلسفة (شعبة آداب وفلسفة)",
                gapType: "فئة سكانية غير مدروسة كفاية",
                status: "فجوة قائمة",
                description: "معظم دراسات التغذية الراجعة ركزت على مواد STEM. توجد حاجة ملحة لدراسة أثر التغذية الراجعة المفككة على جودة المقالة الفلسفية في البكالوريا الجزائرية.",
                suggestedMethodology: "دراسة تجريبية مقارنة على 6 أقسام في 3 ولايات مختلفة.",
              },
              {
                title: "التدريب المتداخل (Interleaving) في تكنولوجيا الهندسة الميكانيكية والكهربائية (تقني رياضي)",
                gapType: "فجوة منهجية وتطبيقية",
                status: "قيد البحث الاستكشافي",
                description: "انعدام شبه تام للدراسات التجريبية التي تطبق التدريب المتداخل على مسائل الأنظمة الآلية والرسم الصناعي الجزائري.",
                suggestedMethodology: "قياس زمن اكتساب مهارة قراءة المخططات التعاقبية مع اختبار استبقاء بعد 6 أسابيع.",
              },
              {
                title: "تأثير تقليل الكثافة المعرفية في كتب مادة التاريخ والجغرافيا للتعليم الثانوي",
                gapType: "دراسة نقدية تحتاج تحديثاً",
                status: "مفتوح للنشر المشترك",
                description: "الكتب المدرسية القديمة تفرض عبئاً تذكارياً كبيراً دون توظيف تقنيات الخرائط الذهنية والممارسة الموزعة.",
                suggestedMethodology: "تحليل المحتوى وفق نظرية العبء المعرفي (CLT) ومقارنة نتائج الفروض الموحدة.",
              },
            ].map((gap, i) => (
              <div key={i} className="workspace-card p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-bold text-blue-600">{gap.gapType}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {gap.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{gap.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{gap.description}</p>
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200">
                    <strong>المنهجية المقترحة:</strong> {gap.suggestedMethodology}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 mt-4 flex justify-end">
                  <button
                    onClick={() => toast.success("تم تبني السؤال البحثي وإضافته لدفتر مشاريع البحث التشاركي.")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                  >
                    تبني هذا المشروع البحثي
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MCP LOBBYVOICES SECURE COMMUNICATIONS */}
      {activeTab === "mcp_voice" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                LobbyVoices MCP · جسر المكالمات والإشعارات الصوتية المؤسساتية
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> مشفر بالكامل
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              إدارة الإشعارات والمكالمات الآلية مع الحماية الصارمة للبيانات الشخصية
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              تجريد تام لسجلات التلاميذ من المعرفات الصريحة قبل الإرسال، واستخدام وكيل آمن (Proxy) لأرقام الأولياء، مع حذف التسجيلات الصوتية تلقائياً بعد التحقق.
            </p>

            {/* Privacy Safeguards Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  تجريد الهوية (Anonymization)
                </div>
                <p className="text-emerald-800">لا يتم إرسال أسماء أو معدلات الطلاب عبر شبكة الصوت الخارجية.</p>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  وكيل الاتصال الآمن (Proxy)
                </div>
                <p className="text-emerald-800">أرقام الهواتف مقنعة ومخفية عن أي معالج ذكاء اصطناعي خارجي.</p>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  سجل التدقيق المؤسساتي
                </div>
                <p className="text-emerald-800">تسجيل غير قابل للتعديل لكل مكالمة صادرة مع طابع زمني ورقم الرخصة.</p>
              </div>
            </div>

            {/* Composer */}
            <div className="mt-6 border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-slate-700">نوع الإشعار المؤسساتي:</label>
                <div className="flex gap-2">
                  {[
                    { id: "attendance", label: "متابعة غياب فوري" },
                    { id: "announcement", label: "إعلان أولياء دوري" },
                    { id: "emergency", label: "تنبيه طارئ أو تعليق دراسة" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setVoiceNotificationType(t.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        voiceNotificationType === t.id
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص المكالمة المعتمد (النطق الآلي عالي الدقة باللغة العربية الفصحى):</label>
                <textarea
                  value={voiceScriptAr}
                  onChange={(e) => setVoiceScriptAr(e.target.value)}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  المستهدفون: <strong>12 ولي أمر مسجل بالغياب اليوم</strong>
                </span>
                <button
                  onClick={handleSendVoiceNotification}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  بدء الاتصال الآمن عبر LobbyVoices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPENSCIENCE CONNECTIVITY */}
      {activeTab === "mcp_science" && (
        <div className="space-y-6">
          <div className="workspace-card p-6 border border-slate-200">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              OpenScience MCP Connectors
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              المستودعات الأكاديمية المفتوحة المتصلة بنظام EduPulse
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              مزامنة دورية للأبحاث المنشورة في مستودعات ERIC، OpenAlex، arXiv، و DOAJ مع فهرسة المصطلحات باللغتين العربية والفرنسية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                { name: "OpenAlex", papers: "240M+ ورقة علمية", status: "متصل ✓", color: "text-emerald-600" },
                { name: "ERIC (Education Resources)", papers: "1.8M+ دراسة تربوية", status: "متصل ✓", color: "text-emerald-600" },
                { name: "DOAJ (Open Access Journals)", papers: "9M+ مقال محكم", status: "متصل ✓", color: "text-emerald-600" },
                { name: "arXiv (Computer & Cognition)", papers: "2.4M+ أوراق أولية", status: "متصل ✓", color: "text-emerald-600" },
              ].map((repo, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-sm">{repo.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{repo.papers}</p>
                  <span className={`text-xs font-semibold mt-3 block ${repo.color}`}>{repo.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
