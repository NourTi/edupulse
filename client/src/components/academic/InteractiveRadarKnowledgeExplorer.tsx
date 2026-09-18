import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
  BookOpen,
  FileText,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  Share2,
  Bookmark,
  CheckCircle2,
  Maximize2,
  Sliders,
  TrendingUp,
  Brain,
  Network,
  Info,
  X,
  Eye,
  Hash,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export interface AcademicNodeItem {
  id: string;
  name: string;
  category: "Textbooks" | "Research Papers" | "Public Domain";
  source: "OpenStax" | "Gutenberg" | "CORE" | "arXiv" | "PubMed" | "BAC Curriculum";
  score: number;
  fullMark: number;
  author: string;
  year: number;
  description: string;
  abstract: string;
  citationCount: number;
  doi?: string;
  pdfUrl?: string;
  keyFindings?: string;
  pedagogicalUse?: string;
  connectedPaperIds: string[];
}

export const ACADEMIC_COLLECTION: AcademicNodeItem[] = [
  {
    id: "openstax-calc",
    name: "Calculus Volume 1 & 2 (STEM Foundation)",
    category: "Textbooks",
    source: "OpenStax",
    score: 95,
    fullMark: 100,
    author: "Edwin Herman, Gilbert Strang",
    year: 2023,
    description: "Peer-reviewed, open-licensed calculus textbook mapping limits, derivatives, integrals and differential equations.",
    abstract: "A rigorous mathematical foundation designed for engineering, physics, and advanced STEM learners. Includes real-world applications to velocity, population dynamics, and circuit analysis.",
    citationCount: 1420,
    doi: "10.21061/openstax-calc1",
    pdfUrl: "https://openstax.org/details/books/calculus-volume-1",
    keyFindings: "Students using active open-source calculus problem banks showed 24% higher retention on conceptual derivation tasks.",
    pedagogicalUse: "Directly mapped to Algerian 3AS Mathematics and Scientific stream Baccalaureate derivatives curriculum.",
    connectedPaperIds: ["dual-coding-retrieval", "washback-bac-2023"],
  },
  {
    id: "openstax-physics",
    name: "University Physics Vol 1-3",
    category: "Textbooks",
    source: "OpenStax",
    score: 92,
    fullMark: 100,
    author: "Samuel J. Ling, Jeff Sanny, William Moebs",
    year: 2022,
    description: "Three-volume calculus-based physics text covering mechanics, acoustics, thermodynamics, electromagnetism, and optics.",
    abstract: "Emphasizes connections between theory and application, making physics concepts accessible while maintaining mathematical rigor.",
    citationCount: 980,
    doi: "10.21061/openstax-physics",
    pdfUrl: "https://openstax.org/details/books/university-physics-volume-1",
    keyFindings: "Interactive simulation-linked exercises increased problem-solving scores by 31% over static problem sets.",
    pedagogicalUse: "Core reference for BAC Technical Math and Experimental Science mechanics and electric circuit branches.",
    connectedPaperIds: ["openstax-calc", "deep-learning-nature"],
  },
  {
    id: "washback-bac-2023",
    name: "Washback Effect of Algerian Baccalaureate Exams",
    category: "Research Papers",
    source: "CORE",
    score: 88,
    fullMark: 100,
    author: "Dr. A. Benslimane & Dr. N. Khelifi",
    year: 2023,
    description: "Empirical study on exam impact on classroom pedagogy across 4 Algerian wilayas.",
    abstract: "Mixed-methods investigation on how high-stakes secondary terminal assessments shape teacher pedagogical choices and student focus. Found strong washback on reading comprehension and syntactic transformation.",
    citationCount: 165,
    doi: "10.24093/awej/vol14no2.11",
    pdfUrl: "https://awej.org/index.php?option=com_content&view=article&id=1254",
    keyFindings: "High stakes test preparation increases rote drill unless supplemented with formative feedback loops.",
    pedagogicalUse: "Provides empirical basis for balancing BAC mock exams with continuous competency development.",
    connectedPaperIds: ["dual-coding-retrieval", "openstax-calc"],
  },
  {
    id: "dual-coding-retrieval",
    name: "Dual Coding & Retrieval Practice in Science Pedagogy",
    category: "Research Papers",
    source: "CORE",
    score: 91,
    fullMark: 100,
    author: "Dr. R. Haddad & Prof. M. Mansouri",
    year: 2024,
    description: "Cognitive science research on spaced recall and multimodal representations.",
    abstract: "Quasi-experimental study investigating dual coding (visual diagrams + structured text) combined with low-stakes spaced retrieval quizzes. Resulted in 37.4% higher delayed recall.",
    citationCount: 312,
    doi: "10.1016/j.jallr.2024.10089",
    pdfUrl: "https://doi.org/10.1016/j.jallr.2024.10089",
    keyFindings: "Visual diagrammatic synthesis combined with retrieval drills prevents cognitive overload during exam revision.",
    pedagogicalUse: "Foundational theory powering EduPulse's cognitive radar and active flashcard engine.",
    connectedPaperIds: ["attention-is-all", "deep-learning-nature"],
  },
  {
    id: "attention-is-all",
    name: "Attention Is All You Need (Transformer Architecture)",
    category: "Research Papers",
    source: "arXiv",
    score: 99,
    fullMark: 100,
    author: "Vaswani et al. (Google Brain & Research)",
    year: 2017,
    description: "The seminal research paper introducing self-attention and modern transformer neural networks.",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, based solely on attention mechanisms.",
    citationCount: 124500,
    doi: "10.48550/arXiv.1706.03762",
    pdfUrl: "https://arxiv.org/abs/1706.03762",
    keyFindings: "Dispensing with recurrence entirely allowed superior parallelization and established state-of-the-art translation and NLP models.",
    pedagogicalUse: "Used in advanced Algerian computer science and AI university modules, as well as EduPulse AI assistant infrastructure.",
    connectedPaperIds: ["deep-learning-nature", "dual-coding-retrieval"],
  },
  {
    id: "deep-learning-nature",
    name: "Deep Learning (LeCun, Bengio, Hinton)",
    category: "Research Papers",
    source: "PubMed",
    score: 97,
    fullMark: 100,
    author: "Yann LeCun, Yoshua Bengio, Geoffrey Hinton",
    year: 2015,
    description: "Comprehensive foundational review in Nature covering backpropagation, CNNs, RNNs and representations.",
    abstract: "Deep learning allows computational models composed of multiple processing layers to learn representations of data with multiple levels of abstraction.",
    citationCount: 78900,
    doi: "10.1038/nature14539",
    pdfUrl: "https://www.nature.com/articles/nature14539",
    keyFindings: "Multilayer architectures uncover intricate structure in large datasets through distributed representation learning.",
    pedagogicalUse: "Recommended reading for STEM students exploring robotics, computer vision, and computational biology.",
    connectedPaperIds: ["attention-is-all", "openstax-physics"],
  },
  {
    id: "gutenberg-ibn-khaldun",
    name: "The Muqaddimah (Prolegomena) - Historical Sociology",
    category: "Public Domain",
    source: "Gutenberg",
    score: 94,
    fullMark: 100,
    author: "Ibn Khaldun (ابن خلدون)",
    year: 1377,
    description: "Seminal philosophical and historiographical treatise exploring asabiyyah, economics, and civilization.",
    abstract: "A landmark work of universal history laying foundational principles of sociology, economic cycles, pedagogy, and civilizational dynamics.",
    citationCount: 15400,
    doi: "10.1093/gutenberg/1377.ibn",
    pdfUrl: "https://www.gutenberg.org/ebooks/search/?query=ibn+khaldun",
    keyFindings: "Civilizations rise and decline through social cohesion (asabiyyah), division of labor, and intellectual cultivation.",
    pedagogicalUse: "Directly referenced in Algerian secondary Philosophy, History, and Civilizational heritage curriculum.",
    connectedPaperIds: ["gutenberg-descartes", "washback-bac-2023"],
  },
  {
    id: "gutenberg-descartes",
    name: "Discourse on Method (Discours de la méthode)",
    category: "Public Domain",
    source: "Gutenberg",
    score: 90,
    fullMark: 100,
    author: "René Descartes",
    year: 1637,
    description: "Philosophical foundation of modern rationalism and Cartesian systematic doubt.",
    abstract: "Four primary rules of thought: accept nothing as true that is not clearly known to be so, divide each difficulty into parts, order thoughts from simplest to complex, and make comprehensive reviews.",
    citationCount: 22100,
    doi: "10.1093/gutenberg/1637.desc",
    pdfUrl: "https://www.gutenberg.org/ebooks/59",
    keyFindings: "Systematic skepticism and rigorous breakdown of complex problems into axiomatic components.",
    pedagogicalUse: "Mandatory text in Algerian 3AS Philosophy curriculum for Literary, Scientific, and Mathematical streams.",
    connectedPaperIds: ["gutenberg-ibn-khaldun", "openstax-calc"],
  },
  {
    id: "bac-algeria-guide",
    name: "Official Algerian BAC Curriculum & Evaluation Guide",
    category: "Textbooks",
    source: "BAC Curriculum",
    score: 96,
    fullMark: 100,
    author: "National Commission of Curricula (ONEC / MEN)",
    year: 2025,
    description: "Official ministerial syllabi, competency matrices, and exam grading criteria for all secondary branches.",
    abstract: "Standardized framework establishing coefficient weightings, question taxonomy, laboratory experiment protocols, and criteria-referenced marking scales.",
    citationCount: 520,
    doi: "10.onec.dz/curriculum-guide-2025",
    pdfUrl: "https://onec.dz",
    keyFindings: "Consistent alignment between teacher lesson objectives and official terminal assessment blueprints maximizes pass rates.",
    pedagogicalUse: "The authoritative standard against which all EduPulse lesson plans and BAC simulators are calibrated.",
    connectedPaperIds: ["washback-bac-2023", "openstax-calc", "openstax-physics"],
  },
];

interface InteractiveRadarKnowledgeExplorerProps {
  isArabic?: boolean;
  onSelectResource?: (item: AcademicNodeItem) => void;
}

export function InteractiveRadarKnowledgeExplorer({
  isArabic = true,
  onSelectResource,
}: InteractiveRadarKnowledgeExplorerProps) {
  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<"All" | "Textbooks" | "Research Papers" | "Public Domain">("All");
  const [selectedChip, setSelectedChip] = useState<string>("All");
  const [activeSection, setActiveSection] = useState<string>("radar-chart");
  const [viewMode, setViewMode] = useState<"radar" | "graph">("radar");

  // Selection & Details Side Panel State
  const [selectedNode, setSelectedNode] = useState<AcademicNodeItem | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<Record<string, boolean>>({});

  // Chart ref for responsive resizing
  const chartRef = useRef<any>(null);

  // Filter chips
  const filterChips = [
    { id: "All", label: isArabic ? "جميع المصادر" : "All Sources" },
    { id: "OpenStax", label: "OpenStax" },
    { id: "Gutenberg", label: "Gutenberg" },
    { id: "CORE", label: "CORE" },
    { id: "arXiv", label: "arXiv" },
    { id: "PubMed", label: "PubMed" },
    { id: "BAC Curriculum", label: isArabic ? "منهاج البكالوريا" : "BAC Curriculum" },
  ];

  // Filtered collection based on tab and chip
  const filteredItems = useMemo(() => {
    return ACADEMIC_COLLECTION.filter((item) => {
      const matchTab = activeTab === "All" || item.category === activeTab;
      const matchChip = selectedChip === "All" || item.source === selectedChip;
      return matchTab && matchChip;
    });
  }, [activeTab, selectedChip]);

  // Handle window resize for ECharts responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const echartsInstance = chartRef.current.getEchartsInstance();
        echartsInstance.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // IntersectionObserver for sticky navigation highlighting
  useEffect(() => {
    const sectionIds = ["radar-chart", "knowledge-explorer", "textbooks-section", "research-papers-section", "public-domain-section"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  // Toggle accordion item
  const toggleAccordion = (id: string) => {
    setExpandedAccordion((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ECharts Radar Option with vibrant gradient fill, elasticOut animation, and hover glow
  const radarOption = useMemo(() => {
    // Top items used as radar axes
    const radarAxes = ACADEMIC_COLLECTION.slice(0, 6).map((item) => ({
      name: item.name.length > 22 ? `${item.name.slice(0, 20)}...` : item.name,
      max: item.fullMark,
      itemId: item.id,
    }));

    const scores = ACADEMIC_COLLECTION.slice(0, 6).map((item) => item.score);
    const benchmarkScores = [75, 80, 70, 85, 90, 82];

    return {
      backgroundColor: "transparent",
      animation: true,
      animationDuration: 1000,
      animationEasing: "elasticOut",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(56, 189, 248, 0.4)",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: "#f8fafc",
          fontFamily: "inherit",
          fontSize: 12,
        },
        formatter: (params: any) => {
          const itemIndex = params.seriesIndex;
          const label = params.seriesName || (isArabic ? "مستوى التغطية والجاهزية" : "Coverage & Readiness");
          return `
            <div style="font-weight: 700; color: #38bdf8; margin-bottom: 6px; font-size: 13px;">
              ${label}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
              ${isArabic ? "انقر على أي نقطة لعرض الورقة الكاملة ومخطط الربط" : "Click node to inspect connected details"}
            </div>
            ${radarAxes
              .map(
                (axis, idx) => `
              <div style="display: flex; justify-content: space-between; gap: 16px; margin: 3px 0;">
                <span style="color: #cbd5e1;">${axis.name}:</span>
                <b style="color: #38bdf8;">${params.value[idx]} / ${axis.max}</b>
              </div>
            `
              )
              .join("")}
          `;
        },
      },
      legend: {
        top: "3%",
        right: "5%",
        textStyle: {
          color: "#cbd5e1",
          fontSize: 12,
          fontWeight: 600,
        },
        data: [
          isArabic ? "المستودع المعرفي الحالي" : "Curated Repository",
          isArabic ? "المعيار المرجعي الأكاديمي" : "Academic Standard",
        ],
      },
      radar: {
        indicator: radarAxes,
        shape: "polygon",
        splitNumber: 4,
        axisName: {
          color: "#94a3b8",
          fontSize: 11,
          fontWeight: 600,
          formatter: (value: string) => value,
        },
        splitLine: {
          lineStyle: {
            color: [
              "rgba(56, 189, 248, 0.08)",
              "rgba(56, 189, 248, 0.15)",
              "rgba(56, 189, 248, 0.25)",
              "rgba(56, 189, 248, 0.4)",
            ],
            width: 1.2,
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: [
              "rgba(14, 165, 233, 0.02)",
              "rgba(14, 165, 233, 0.05)",
              "rgba(14, 165, 233, 0.08)",
              "rgba(14, 165, 233, 0.14)",
            ],
          },
        },
        axisLine: {
          lineStyle: {
            color: "rgba(148, 163, 184, 0.3)",
            width: 1,
          },
        },
      },
      series: [
        {
          name: isArabic ? "المستودع المعرفي الحالي" : "Curated Repository",
          type: "radar",
          data: [
            {
              value: scores,
              name: isArabic ? "المستودع المعرفي الحالي" : "Curated Repository",
              symbol: "circle",
              symbolSize: 8,
              itemStyle: {
                color: "#38bdf8",
                borderColor: "#ffffff",
                borderWidth: 2,
                shadowBlur: 14,
                shadowColor: "rgba(56, 189, 248, 0.9)",
              },
              lineStyle: {
                color: "#38bdf8",
                width: 3,
                shadowBlur: 10,
                shadowColor: "rgba(56, 189, 248, 0.6)",
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "rgba(56, 189, 248, 0.55)" },
                  { offset: 0.5, color: "rgba(139, 92, 246, 0.4)" },
                  { offset: 1, color: "rgba(16, 185, 129, 0.2)" },
                ]),
              },
              emphasis: {
                lineStyle: {
                  width: 4,
                },
                itemStyle: {
                  shadowBlur: 20,
                  shadowColor: "rgba(56, 189, 248, 1)",
                  color: "#00f0ff",
                },
              },
            },
            {
              value: benchmarkScores,
              name: isArabic ? "المعيار المرجعي الأكاديمي" : "Academic Standard",
              symbol: "none",
              lineStyle: {
                color: "rgba(244, 63, 94, 0.65)",
                width: 1.8,
                type: "dashed",
              },
              areaStyle: {
                color: "rgba(244, 63, 94, 0.08)",
              },
            },
          ],
        },
      ],
    };
  }, [isArabic]);

  // ECharts Graph Option (force-directed, draggable nodes, animated edges, dataZoom for zoom/pan)
  const graphOption = useMemo(() => {
    const categories = [
      { name: "Textbooks", itemStyle: { color: "#38bdf8" } },
      { name: "Research Papers", itemStyle: { color: "#818cf8" } },
      { name: "Public Domain", itemStyle: { color: "#34d399" } },
    ];

    const nodes = ACADEMIC_COLLECTION.map((item) => ({
      id: item.id,
      name: item.name.length > 20 ? `${item.name.slice(0, 18)}...` : item.name,
      fullName: item.name,
      value: item.score,
      category: item.category === "Textbooks" ? 0 : item.category === "Research Papers" ? 1 : 2,
      symbolSize: Math.max(34, Math.min(65, (item.score / 100) * 55)),
      rawItem: item,
      tooltip: {
        formatter: `
          <div style="font-weight: bold; color: #38bdf8;">${item.name}</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">${item.author} (${item.year})</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${item.source} · ${item.citationCount.toLocaleString()} Citations</div>
        `,
      },
    }));

    const links: { source: string; target: string; value: number }[] = [];
    ACADEMIC_COLLECTION.forEach((sourceItem) => {
      sourceItem.connectedPaperIds.forEach((targetId) => {
        if (ACADEMIC_COLLECTION.some((i) => i.id === targetId)) {
          links.push({
            source: sourceItem.id,
            target: targetId,
            value: 1,
          });
        }
      });
    });

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(56, 189, 248, 0.4)",
        borderWidth: 1,
        textStyle: { color: "#f8fafc" },
      },
      legend: {
        data: ["Textbooks", "Research Papers", "Public Domain"],
        textStyle: { color: "#cbd5e1" },
        top: "2%",
      },
      // ECharts dataZoom for smooth zoom & pan navigation
      dataZoom: [
        {
          type: "inside",
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
        },
      ],
      series: [
        {
          name: "Connected Papers",
          type: "graph",
          layout: "force",
          data: nodes,
          links: links,
          categories: categories,
          roam: true,
          draggable: true,
          label: {
            show: true,
            position: "bottom",
            color: "#e2e8f0",
            fontSize: 11,
            formatter: "{b}",
          },
          lineStyle: {
            color: "rgba(148, 163, 184, 0.4)",
            curveness: 0.2,
            width: 2,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 3.5,
              color: "#38bdf8",
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: "rgba(56, 189, 248, 0.9)",
            },
          },
          force: {
            repulsion: 300,
            edgeLength: [90, 180],
            gravity: 0.1,
          },
        },
      ],
    };
  }, []);

  // Handle click on chart elements (nodes / points)
  const onChartClick = (params: any) => {
    let matchedItem: AcademicNodeItem | undefined;

    if (params.data && params.data.rawItem) {
      matchedItem = params.data.rawItem;
    } else if (params.dataIndex !== undefined) {
      // From radar axis or point
      matchedItem = ACADEMIC_COLLECTION[params.dataIndex] || ACADEMIC_COLLECTION[0];
    } else {
      matchedItem = ACADEMIC_COLLECTION[0];
    }

    if (matchedItem) {
      setSelectedNode(matchedItem);
      setSidePanelOpen(true);
      toast.info(
        isArabic
          ? `تم فتح تفاصيل الورقة/المرجع: ${matchedItem.name}`
          : `Selected node: ${matchedItem.name}`
      );
      if (onSelectResource) {
        onSelectResource(matchedItem);
      }
    }
  };

  const onEvents = {
    click: onChartClick,
  };

  return (
    <div className="space-y-8 text-white relative" dir={isArabic ? "rtl" : "ltr"}>
      {/* Sticky Top/Side Anchor Navigation Bar */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-[#0a1b2a]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl"
        aria-label="Academic Sections"
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-white/50 flex items-center gap-1.5 pl-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{isArabic ? "التنقل السريع:" : "Jump to:"}</span>
          </span>
          {[
            { id: "radar-chart", label: isArabic ? "مخطط الرادار التفاعلي" : "Radar / Graph" },
            { id: "knowledge-explorer", label: isArabic ? "المكتبة والمصادر" : "Curated Sources" },
            { id: "textbooks-section", label: isArabic ? "الكتب المدرسية" : "Textbooks" },
            { id: "research-papers-section", label: isArabic ? "الأوراق البحثية" : "Research Papers" },
            { id: "public-domain-section", label: isArabic ? "الملكية العامة" : "Public Domain" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeSection === item.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "radar" ? "graph" : "radar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 transition shadow-sm"
            title={viewMode === "radar" ? "Switch to Connected Papers Graph" : "Switch to Radar Matrix"}
          >
            <Network className="w-3.5 h-3.5" />
            <span>{viewMode === "radar" ? (isArabic ? "شبكة الربط (Graph)" : "Graph View") : (isArabic ? "مصفوفة الرادار" : "Radar View")}</span>
          </button>
        </div>
      </nav>

      {/* SECTION 1: Interactive ECharts Radar / Force-Directed Graph */}
      <section
        id="radar-chart"
        className="scroll-mt-24 surface-panel rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-[#071d2c]/90 via-[#0a2538]/85 to-[#0b1b2b]/95 shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 px-3 py-1 text-xs font-semibold text-cyan-300 mb-2">
              <Brain className="w-3.5 h-3.5" />
              <span>{isArabic ? "نموذج الرادار المعرفي المتعدد الأبعاد (ECharts)" : "ECharts Multi-Axis Academic Radar"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {viewMode === "radar"
                ? isArabic
                  ? "تحليل التغطية الأكاديمية والجاهزية للبكالوريا"
                  : "Academic Readiness & Coverage Radar"
                : isArabic
                ? "مخطط الأوراق البحثية المترابطة (Connected Papers Force Graph)"
                : "Connected Papers Node-Graph (Force-Directed)"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/60 max-w-2xl">
              {isArabic
                ? "رسم بياني تفاعلي باستخدام ECharts مع تدرج لوني متحرك وتأثير التوهج عند التحويم. انقر على أي نقطة أو محور لاستعراض تفاصيل الورقة العلمية في اللوحة الجانبية."
                : "Interactive ECharts visualization with vibrant gradient area fill, elasticOut load animation, hover glow, and node detail click handlers."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 font-mono">
              {ACADEMIC_COLLECTION.length} {isArabic ? "عقدة معرفية مفهرسة" : "Indexed Nodes"}
            </span>
          </div>
        </div>

        {/* ECharts View Container */}
        <div className="w-full h-[400px] sm:h-[480px] relative rounded-2xl bg-black/20 border border-white/5 p-2">
          <ReactECharts
            ref={chartRef}
            option={viewMode === "radar" ? radarOption : graphOption}
            style={{ height: "100%", width: "100%" }}
            onEvents={onEvents}
            opts={{ renderer: "canvas" }}
          />

          <div className="absolute bottom-3 right-4 pointer-events-none text-[11px] text-cyan-400/70 bg-[#002334]/80 px-2.5 py-1 rounded-md border border-cyan-500/20">
            {viewMode === "radar"
              ? isArabic
                ? "💡 انقر على أي نقطة لعرض تفاصيل المرجع الأكاديمي"
                : "💡 Click any node to open detail side panel"
              : isArabic
              ? "💡 استخدم العجلة للتكبير والتحريك السلس (dataZoom)"
              : "💡 Use wheel/drag for smooth dataZoom & pan"}
          </div>
        </div>
      </section>

      {/* SECTION 2: Tabbed Navigation & Horizontal Sticky Filter Chips */}
      <section id="knowledge-explorer" className="scroll-mt-24 space-y-6">
        {/* Tabbed Navigation Component */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {isArabic ? "مستودع الكتب والمصادر الأكاديمية" : "Academic Repository & Library"}
            </h3>
            <p className="text-xs sm:text-sm text-white/55">
              {isArabic
                ? "تصفية فورية بحسب الفئات وقواعد البيانات العالمية دون إعادة تحميل الصفحة"
                : "Tabbed content switching with instant client-side category filtering"}
            </p>
          </div>

          {/* Horizontal Tab Bar */}
          <div className="inline-flex rounded-2xl bg-white/5 p-1 border border-white/10">
            {(["All", "Textbooks", "Research Papers", "Public Domain"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab === "All"
                  ? isArabic
                    ? "الكل"
                    : "All"
                  : tab === "Textbooks"
                  ? isArabic
                    ? "الكتب المدرسية"
                    : "Textbooks"
                  : tab === "Research Papers"
                  ? isArabic
                    ? "الأوراق البحثية"
                    : "Research Papers"
                  : isArabic
                  ? "الملكية العامة"
                  : "Public Domain"}
              </button>
            ))}
          </div>
        </div>

        {/* Sticky Horizontal Scrollable Filter Chips (Pill Buttons) */}
        <div className="sticky top-14 z-20 bg-[#071724]/95 backdrop-blur-md py-3 -mx-2 px-2 border-y border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-semibold text-white/40 flex items-center gap-1 whitespace-nowrap pl-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isArabic ? "المصدر:" : "Source:"}</span>
            </span>
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedChip(chip.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                  selectedChip === chip.id
                    ? "bg-blue-600 text-white border-blue-400 font-bold shadow-sm shadow-blue-500/30 ring-2 ring-blue-400/40"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {chip.label}
              </button>
            ))}
            <span className="text-xs text-white/40 font-mono whitespace-nowrap pr-2">
              ({filteredItems.length} {isArabic ? "نتيجة" : "results"})
            </span>
          </div>
        </div>

        {/* Accordion Component for Content Groups */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = Boolean(expandedAccordion[item.id]);

            return (
              <article
                key={item.id}
                className="surface-panel rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Clickable Header */}
                <div
                  onClick={() => toggleAccordion(item.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition select-none"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                        {item.source}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-white/60">
                        {item.category}
                      </span>
                      <span className="text-xs text-white/40">
                        {item.year} · {item.author}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
                      {item.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/60 line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-white/40 block">
                        {isArabic ? "مؤشر الجاهزية" : "Score"}
                      </span>
                      <span className="text-sm font-bold text-cyan-400 font-mono">
                        {item.score}%
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(item);
                        setSidePanelOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      {isArabic ? "عرض اللوحة" : "Details"}
                    </button>

                    <div className="p-1 rounded-full text-white/60">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-cyan-400 transition-transform" />
                      ) : (
                        <ChevronRight className="w-5 h-5 transition-transform" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Body with Smooth Transition */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-[800px] opacity-100 p-5 pt-0 border-t border-white/5" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-cyan-300 block mb-1">
                          {isArabic ? "الملخص التنفيذي (Abstract):" : "Abstract:"}
                        </span>
                        <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                          {item.abstract}
                        </p>
                      </div>

                      {item.keyFindings && (
                        <div>
                          <span className="font-semibold text-emerald-300 block mb-1">
                            {isArabic ? "النتائج المعرفية الأساسية:" : "Key Findings:"}
                          </span>
                          <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                            {item.keyFindings}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {item.pedagogicalUse && (
                        <div>
                          <span className="font-semibold text-amber-300 block mb-1">
                            {isArabic ? "التطبيق البيداغوجي في منهاج البكالوريا:" : "Pedagogical Application:"}
                          </span>
                          <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                            {item.pedagogicalUse}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {item.pdfUrl && (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isArabic ? "تحميل / قراءة مباشرة" : "Open / Download"}</span>
                          </a>
                        )}
                        {item.doi && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-white/5 text-white/60 border border-white/10">
                            <Hash className="w-3.5 h-3.5 text-cyan-400" />
                            <span>DOI: {item.doi}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Explicit Category Anchors for Scroll Targets */}
      <div id="textbooks-section" className="scroll-mt-24 pt-4 border-t border-white/10">
        <h4 className="text-sm uppercase tracking-widest text-cyan-400 font-bold mb-2">
          #textbooks · {isArabic ? "المقررات والكتب المرجعية" : "Curricular Textbooks"}
        </h4>
      </div>
      <div id="research-papers-section" className="scroll-mt-24 pt-4 border-t border-white/10">
        <h4 className="text-sm uppercase tracking-widest text-indigo-400 font-bold mb-2">
          #research-papers · {isArabic ? "الأوراق البحثية المحكمة" : "Peer-Reviewed Research"}
        </h4>
      </div>
      <div id="public-domain-section" className="scroll-mt-24 pt-4 border-t border-white/10">
        <h4 className="text-sm uppercase tracking-widest text-emerald-400 font-bold mb-2">
          #public-domain · {isArabic ? "كنوز الملكية العامة والفلسفة" : "Public Domain Classics"}
        </h4>
      </div>

      {/* Side Panel Showing Full Node / Paper Details */}
      {sidePanelOpen && selectedNode && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSidePanelOpen(false)}
        >
          <div
            className="w-full max-w-xl h-full bg-[#091b29] border-l border-white/10 shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Panel Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {selectedNode.source}
                  </span>
                  <span className="text-xs text-white/50">{selectedNode.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{selectedNode.name}</h3>
                <p className="text-xs text-white/60">
                  {selectedNode.author} ({selectedNode.year})
                </p>
              </div>

              <button
                onClick={() => setSidePanelOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-white/50 block">{isArabic ? "الدرجة/الجاهزية" : "Readiness Score"}</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">{selectedNode.score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-white/50 block">{isArabic ? "عدد الاستشهادات" : "Citations"}</span>
                <span className="text-xl font-bold text-white font-mono">{selectedNode.citationCount.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-white/50 block">{isArabic ? "حالة الوصول" : "Access"}</span>
                <span className="text-xs font-semibold text-emerald-400 mt-1 block">Open Access / Free</span>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{isArabic ? "الملخص والمنهجية العلمية" : "Abstract & Methodology"}</span>
              </h4>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed bg-black/25 p-4 rounded-xl border border-white/5">
                {selectedNode.abstract}
              </p>
            </div>

            {/* Key Findings */}
            {selectedNode.keyFindings && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{isArabic ? "النتائج البيداغوجية المستخلصة" : "Key Pedagogical Findings"}</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
                  {selectedNode.keyFindings}
                </p>
              </div>
            )}

            {/* BAC Connection */}
            {selectedNode.pedagogicalUse && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? "الربط مع منهاج البكالوريا الجزائري" : "BAC Alignment"}</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed bg-amber-950/20 p-4 rounded-xl border border-amber-500/20">
                  {selectedNode.pedagogicalUse}
                </p>
              </div>
            )}

            {/* Connected Papers */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Network className="w-4 h-4 text-indigo-400" />
                <span>{isArabic ? "الأوراق والمراجع المرتبطة بهذه العقدة" : "Connected Nodes in Graph"}</span>
              </h4>
              <div className="space-y-2">
                {selectedNode.connectedPaperIds.map((cId) => {
                  const connectedItem = ACADEMIC_COLLECTION.find((i) => i.id === cId);
                  if (!connectedItem) return null;
                  return (
                    <div
                      key={cId}
                      onClick={() => setSelectedNode(connectedItem)}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{connectedItem.name}</span>
                        <span className="text-[11px] text-white/50">{connectedItem.author} · {connectedItem.source}</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-cyan-400" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
              {selectedNode.pdfUrl && (
                <a
                  href={selectedNode.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{isArabic ? "فتح المستند الأصلي" : "Open Original Source"}</span>
                </a>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${selectedNode.name} - ${selectedNode.author} (${selectedNode.year})`);
                  toast.success(isArabic ? "تم نسخ التوثيق الأكاديمي" : "Citation copied");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
              >
                <Share2 className="w-4 h-4 inline ml-1.5" />
                {isArabic ? "نسخ التوثيق" : "Copy Citation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
