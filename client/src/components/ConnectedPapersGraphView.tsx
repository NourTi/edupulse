import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Sparkles,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Share2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Info,
  Layers,
  ArrowRight,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Network,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import * as d3 from "d3";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface AcademicPaperNode {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  citationCount: number;
  venue?: string;
  doi?: string;
  pdfUrl?: string | null;
  abstract?: string;
  isSeed: boolean;
  cluster: number;
  similarity: number;
  degree: number;
  // D3 simulation coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface AcademicPaperEdge {
  id: string;
  source: string | AcademicPaperNode;
  target: string | AcademicPaperNode;
  weight: number;
  type: "citation" | "reference" | "co-citation" | "similarity";
}

const TRY_EXAMPLES = [
  {
    type: "Paper DOI",
    icon: "doi",
    value: "10.1038/nature14539",
    label: "Deep Learning (LeCun, Bengio, Hinton)",
  },
  {
    type: "arXiv Paper URL",
    icon: "arxiv",
    value: "https://arxiv.org/abs/1706.03762",
    label: "Attention Is All You Need (Vaswani et al.)",
  },
  {
    type: "Paper Title",
    icon: "title",
    value: "Dual Coding and Retrieval Practice in Enhancing Lexical Retention",
    label: "Dual Coding and Retrieval Practice",
  },
  {
    type: "Semantic Scholar",
    icon: "s2",
    value: "https://www.semanticscholar.org/paper/204e3073870fae3d05bcbc2f6a8e263c9b72e776",
    label: "BERT: Pre-training of Deep Bidirectional Transformers",
  },
  {
    type: "PubMed Paper URL",
    icon: "pubmed",
    value: "https://pubmed.ncbi.nlm.nih.gov/26040892/",
    label: "Deep Learning in Biomedicine",
  },
];

const CLUSTER_COLORS = [
  "#2563EB", // Blue (Seed)
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
];

export function ConnectedPapersGraphView({ isArabic }: { isArabic: boolean }) {
  const [searchInput, setSearchInput] = useState("");
  const [activeIdentifier, setActiveIdentifier] = useState("10.1038/nature14539");
  const [selectedNode, setSelectedNode] = useState<AcademicPaperNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedEngine, setSelectedEngine] = useState<"all" | "openalex" | "semanticscholar" | "crossref" | "europepmc">("all");
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [minCitationsFilter, setMinCitationsFilter] = useState(0);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Direct document resolver mutation
  const resolveDocMutation = trpc.academic.resolveDocument.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.downloadUrl) {
        toast.success(isArabic ? "تم تجهيز المستند للتحميل المباشر" : "Document ready for direct download");
        window.open(data.proxyDownloadUrl || data.downloadUrl, "_blank");
      } else {
        toast.error(data.message || (isArabic ? "تعذر استخراج المستند" : "Could not resolve document"));
      }
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  // Query connected papers graph from server
  const graphQuery = trpc.academic.connectedGraph.useQuery(
    { identifier: activeIdentifier },
    {
      enabled: Boolean(activeIdentifier),
      staleTime: 10 * 60 * 1000,
    }
  );

  const graphData = graphQuery.data;

  // Filter nodes based on citation filter
  const filteredNodes = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.filter((n: any) => n.isSeed || n.citationCount >= minCitationsFilter);
  }, [graphData, minCitationsFilter]);

  // Filter edges corresponding to visible nodes
  const filteredEdges = useMemo(() => {
    if (!graphData) return [];
    const validNodeIds = new Set(filteredNodes.map((n: any) => n.id));
    return graphData.edges.filter((e: any) => {
      const sourceId = typeof e.source === "object" ? (e.source as any).id : e.source;
      const targetId = typeof e.target === "object" ? (e.target as any).id : e.target;
      return validNodeIds.has(sourceId) && validNodeIds.has(targetId);
    });
  }, [graphData, filteredNodes]);

  // Node positions state managed by D3 simulation
  const [simulatedNodes, setSimulatedNodes] = useState<AcademicPaperNode[]>([]);
  const [simulatedEdges, setSimulatedEdges] = useState<any[]>([]);

  // Initialize D3 Force Simulation
  useEffect(() => {
    if (!filteredNodes.length) return;

    const width = 800;
    const height = 550;

    // Clone data for D3 mutation
    const nodes: AcademicPaperNode[] = filteredNodes.map((d: any) => ({
      ...d,
      x: d.isSeed ? width / 2 : width / 2 + (Math.random() - 0.5) * 300,
      y: d.isSeed ? height / 2 : height / 2 + (Math.random() - 0.5) * 300,
    }));

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const links: any[] = [];
    for (const e of filteredEdges) {
      const sourceId = typeof e.source === "object" ? (e.source as any).id : e.source;
      const targetId = typeof e.target === "object" ? (e.target as any).id : e.target;
      const s = nodeMap.get(sourceId);
      const t = nodeMap.get(targetId);
      if (s && t) {
        links.push({
          id: e.id,
          source: s,
          target: t,
          weight: e.weight,
          type: e.type,
        });
      }
    }

    const simulation = d3
      .forceSimulation<AcademicPaperNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<AcademicPaperNode, any>(links)
          .id((d: any) => d.id)
          .distance((d: any) => 100 - (d.weight || 0.5) * 40)
      )
      .force("charge", d3.forceManyBody().strength(-240))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.85))
      .force(
        "collision",
        d3.forceCollide().radius((d: any) => (d.isSeed ? 36 : Math.min(28, 16 + Math.log10(d.citationCount + 1) * 3)))
      );

    simulation.on("tick", () => {
      setSimulatedNodes([...nodes]);
      setSimulatedEdges([...links]);
    });

    simulation.alpha(1).restart();

    // Select seed node by default
    const seed = nodes.find((n) => n.isSeed) || nodes[0];
    if (seed) setSelectedNode(seed);

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredEdges]);

  // Handle building new graph
  const handleBuildGraph = (overrideQuery?: string) => {
    const target = overrideQuery || searchInput.trim();
    if (!target) {
      toast.error(isArabic ? "يرجى كتابة عنوان أو DOI أو رابط البحث" : "Please enter a paper title, DOI or URL");
      return;
    }
    setActiveIdentifier(target);
    setSearchInput(target);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== "svg" && (e.target as HTMLElement).id !== "graph-canvas-bg") return;
    setIsDraggingPan(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPan) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDraggingPan(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.4, prev + delta)));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Copy citation text
  const handleCopyCitation = (node: AcademicPaperNode) => {
    const authorsStr = node.authors.slice(0, 3).join(", ") + (node.authors.length > 3 ? " et al." : "");
    const apa = `${authorsStr} (${node.year || "n.d."}). ${node.title}. ${node.venue || "Academic Publication"}.${node.doi ? ` https://doi.org/${node.doi}` : ""}`;
    navigator.clipboard.writeText(apa);
    setCopiedCitation(true);
    toast.success(isArabic ? "تم نسخ التوثيق بصيغة APA" : "Citation copied in APA format");
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  // Direct download handler
  const handleDirectDownload = (node: AcademicPaperNode) => {
    if (node.pdfUrl) {
      window.open(node.pdfUrl, "_blank");
      toast.success(isArabic ? "بدء تحميل ملف PDF المباشر..." : "Starting direct PDF download...");
      return;
    }

    if (node.doi) {
      resolveDocMutation.mutate({ urlOrIdentifier: node.doi });
      return;
    }

    resolveDocMutation.mutate({ urlOrIdentifier: node.title });
  };

  return (
    <div
      ref={containerRef}
      className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto" : ""}`}
    >
      {/* ── 1. Hero Header & Search Section (Visual match for graph.PNG) ── */}
      <div className="text-center max-w-3xl mx-auto pt-4 pb-2 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isArabic ? "استكشف الأبحاث المتصلة في رسم بياني تفاعلي" : "Explore connected papers in a visual graph"}
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-300">
          {isArabic
            ? "للبدء، أدخل معرّف البحث (DOI أو العنوان أو رابط arXiv أو Semantic Scholar)"
            : "To start, enter a paper identifier"}
        </p>

        {/* Search Pill Input */}
        <div className="relative max-w-2xl mx-auto mt-6">
          <div className="flex items-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden pl-5 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBuildGraph()}
              placeholder={
                isArabic
                  ? "ابحث بالكلمات المفتاحية أو العنوان أو DOI أو معرّف البحث..."
                  : "Search by keywords, paper title, DOI or another identifier"
              }
              className="w-full bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            />
            <button
              onClick={() => handleBuildGraph()}
              disabled={graphQuery.isLoading}
              className="bg-[#0b5394] hover:bg-[#083c6c] text-white font-medium text-sm sm:text-base px-6 py-2.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {graphQuery.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isArabic ? "جارٍ البناء..." : "Building..."}</span>
                </>
              ) : (
                <>
                  <Network className="w-4 h-4" />
                  <span>{isArabic ? "بناء الرسم البياني" : "Build a graph"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── 2. "You can try:" quick chips (Exact visual match from graph.PNG) ── */}
        <div className="pt-4">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
            {isArabic ? "يمكنك تجربة أحد النماذج التالية:" : "You can try:"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {TRY_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchInput(ex.value);
                  handleBuildGraph(ex.value);
                }}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center"
                title={ex.label}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-xs">
                  {ex.icon === "doi" && (
                    <span className="text-[11px] font-bold tracking-tighter bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full px-1.5 py-0.5">
                      doi
                    </span>
                  )}
                  {ex.icon === "arxiv" && <span className="font-serif font-bold text-base">X</span>}
                  {ex.icon === "title" && <FileText className="w-4 h-4" />}
                  {ex.icon === "s2" && <BookOpen className="w-4 h-4" />}
                  {ex.icon === "pubmed" && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">PM</span>
                  )}
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                  {ex.type}
                </span>
                <span className="text-[10px] text-slate-400 max-w-[100px] truncate">{ex.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. Academic Engine Selector & Indicators ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500">{isArabic ? "محركات البحث المعتمدة:" : "Search Engines:"}</span>
          <button
            onClick={() => setSelectedEngine("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedEngine === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🌐 {isArabic ? "جميع المصادر المترابطة" : "All Connected Engines"}
          </button>
          <button
            onClick={() => setSelectedEngine("openalex")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedEngine === "openalex"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            📚 OpenAlex (Key Activated)
          </button>
          <button
            onClick={() => setSelectedEngine("semanticscholar")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedEngine === "semanticscholar"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🔬 Semantic Scholar
          </button>
          <button
            onClick={() => setSelectedEngine("crossref")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedEngine === "crossref"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🏛️ CrossRef (Polite Pool)
          </button>
          <button
            onClick={() => setSelectedEngine("europepmc")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedEngine === "europepmc"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            🧬 Europe PMC (Open Access)
          </button>
        </div>
      </div>

      {/* ── 4. Visual Graph Area & Detail Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
        {/* Left / Center: Interactive SVG Force Graph Canvas */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {isArabic ? "الشبكة التفاعلية للأوراق المترابطة" : "Interactive Citation Network"}
              </span>
              {graphData && (
                <span className="text-xs text-slate-400">
                  ({graphData.metrics.totalPapers} {isArabic ? "ورقة" : "papers"}, {graphData.metrics.totalConnections}{" "}
                  {isArabic ? "اتصال" : "connections"})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleZoom(0.2)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(-0.2)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowNodeLabels(!showNodeLabels)}
                className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                  showNodeLabels
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-200 dark:border-blue-800"
                    : "border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
              >
                {isArabic ? "العناوين" : "Labels"}
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div
            className="relative h-[480px] sm:h-[560px] w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Background grid pattern */}
            <svg
              id="graph-canvas-bg"
              ref={svgRef}
              className="w-full h-full"
              viewBox="0 0 800 550"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/40" strokeWidth="0.75" />
                </pattern>
                {/* Glow filter for seed paper */}
                <filter id="seed-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Transform group for Pan and Zoom */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoomLevel})`}>
                {/* Edges */}
                {simulatedEdges.map((edge, idx) => {
                  const x1 = edge.source?.x ?? 400;
                  const y1 = edge.source?.y ?? 275;
                  const x2 = edge.target?.x ?? 400;
                  const y2 = edge.target?.y ?? 275;
                  const isHighlighted =
                    selectedNode && (edge.source?.id === selectedNode.id || edge.target?.id === selectedNode.id);

                  return (
                    <line
                      key={edge.id || idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isHighlighted ? "#3B82F6" : "currentColor"}
                      strokeWidth={isHighlighted ? 2.2 : Math.max(1, (edge.weight || 0.5) * 1.8)}
                      strokeOpacity={isHighlighted ? 0.9 : 0.25}
                      strokeDasharray={edge.type === "co-citation" ? "4,4" : undefined}
                      className="text-slate-400 dark:text-slate-600 transition-all"
                    />
                  );
                })}

                {/* Nodes */}
                {simulatedNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const radius = node.isSeed
                    ? 28
                    : Math.min(22, Math.max(12, 10 + Math.log10(node.citationCount + 1) * 2.8));
                  const nodeColor = node.isSeed ? "#2563EB" : CLUSTER_COLORS[node.cluster % CLUSTER_COLORS.length];

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x || 400}, ${node.y || 275})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Seed pulse outer ring */}
                      {node.isSeed && (
                        <circle
                          r={radius + 12}
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2"
                          strokeOpacity="0.4"
                          className="animate-ping"
                        />
                      )}

                      {/* Selected halo */}
                      {isSelected && (
                        <circle
                          r={radius + 7}
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="3"
                          strokeOpacity="0.8"
                        />
                      )}

                      {/* Core Node Circle */}
                      <circle
                        r={radius}
                        fill={nodeColor}
                        filter={node.isSeed ? "url(#seed-glow)" : undefined}
                        className="transition-transform group-hover:scale-110 duration-150"
                        stroke="#ffffff"
                        strokeWidth={node.isSeed ? "3" : "1.8"}
                      />

                      {/* Inner Year or Seed Text */}
                      <text
                        textAnchor="middle"
                        dy=".35em"
                        fontSize={node.isSeed ? "11" : "9"}
                        fontWeight="bold"
                        fill="#ffffff"
                        pointerEvents="none"
                      >
                        {node.isSeed ? "SEED" : node.year || "•"}
                      </text>

                      {/* Node Label */}
                      {showNodeLabels && (
                        <text
                          textAnchor="middle"
                          y={radius + 14}
                          fontSize="9.5"
                          fontWeight={isSelected || node.isSeed ? "bold" : "normal"}
                          className="fill-slate-700 dark:fill-slate-200 pointer-events-none transition-colors"
                        >
                          {node.title.length > 28 ? `${node.title.slice(0, 26)}…` : node.title}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Floating Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {isArabic ? "الورقة المركزية المرجعية" : "Seed Paper (Focus)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400">
                  {isArabic ? "حجم الدائرة = عدد الاستشهادات" : "Node size = Citation count"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Rich Paper Detail Inspector */}
        <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-6 pt-4 lg:pt-0">
          {selectedNode ? (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[580px] pr-1">
              {/* Badge & Seed status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {selectedNode.isSeed ? (
                    <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      ★ {isArabic ? "الورقة المركزية" : "Seed Paper"}
                    </span>
                  ) : (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      {isArabic ? "ورقة متصلة" : "Connected Paper"}
                    </span>
                  )}
                  {selectedNode.pdfUrl && (
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                      PDF متاح
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {selectedNode.year || "n.d."}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {selectedNode.title}
              </h3>

              {/* Authors & Venue */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedNode.authors.join(", ")}
                </p>
                {selectedNode.venue && (
                  <p className="italic text-slate-500">{selectedNode.venue}</p>
                )}
                {selectedNode.doi && (
                  <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate">
                    DOI: {selectedNode.doi}
                  </p>
                )}
              </div>

              {/* Citations metric bar */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <span className="text-xs text-slate-400 block">{isArabic ? "الاستشهادات" : "Citations"}</span>
                  <span className="text-base font-bold text-slate-800 dark:text-white font-mono">
                    {selectedNode.citationCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{isArabic ? "درجة التشابه" : "Similarity"}</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {Math.round(selectedNode.similarity * 100)}%
                  </span>
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  {isArabic ? "ملخص البحث (Abstract)" : "Abstract"}
                </h4>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                  {selectedNode.abstract || (
                    <span className="italic text-slate-400">
                      {isArabic ? "الملخص متاح عبر الرابط الأكاديمي المباشر." : "Abstract available via direct academic link."}
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleDirectDownload(selectedNode)}
                  disabled={resolveDocMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {resolveDocMutation.isPending
                      ? isArabic
                        ? "جارٍ استخراج المستند..."
                        : "Resolving Document..."
                      : isArabic
                      ? "تحميل البحث / المستند مباشرة (PDF)"
                      : "Direct Download Document (PDF)"}
                  </span>
                </button>

                {!selectedNode.isSeed && (
                  <button
                    onClick={() => handleBuildGraph(selectedNode.doi || selectedNode.title)}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      {isArabic
                        ? "إعادة بناء الرسم البياني حول هذا البحث"
                        : "Re-build graph around this paper"}
                    </span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyCitation(selectedNode)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isArabic ? "نسخ APA" : "Copy APA"}</span>
                  </button>

                  {selectedNode.doi && (
                    <a
                      href={`https://doi.org/${selectedNode.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>DOI</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full p-6 text-slate-400 space-y-2">
              <Network className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">
                {isArabic ? "انقر فوق أي ورقة بحثية في الرسم البياني لمعاينتها" : "Click on any paper in the graph to inspect"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
