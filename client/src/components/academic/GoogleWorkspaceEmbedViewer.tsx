import React, { useState } from "react";
import {
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  FileSpreadsheet,
  Presentation,
  CheckSquare,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { type GoogleWorkspaceFileRecord } from "../../lib/googleWorkspaceStorage";

interface GoogleWorkspaceEmbedViewerProps {
  file: GoogleWorkspaceFileRecord | null;
  onClose?: () => void;
  className?: string;
  isInline?: boolean;
}

export const GoogleWorkspaceEmbedViewer: React.FC<GoogleWorkspaceEmbedViewerProps> = ({
  file,
  onClose,
  className = "",
  isInline = false,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!file) {
    return null;
  }

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const getTypeMeta = (type: string) => {
    switch (type) {
      case "sheets":
        return {
          label: "جداول بيانات Google Sheets",
          badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          accentColor: "#059669",
        };
      case "slides":
        return {
          label: "عروض تقديمية Google Slides",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
          icon: <Presentation className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          accentColor: "#d97706",
        };
      case "forms":
        return {
          label: "نماذج واستبيانات Google Forms",
          badgeBg: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
          icon: <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          accentColor: "#7c3aed",
        };
      default:
        return {
          label: "مستندات Google Docs",
          badgeBg: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
          icon: <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          accentColor: "#2563eb",
        };
    }
  };

  const meta = getTypeMeta(file.type);

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col p-3 md:p-6"
    : isInline
    ? `w-full rounded-xl border border-border/80 bg-card overflow-hidden shadow-md flex flex-col ${className}`
    : `w-full rounded-xl border border-border/80 bg-card overflow-hidden shadow-xl flex flex-col ${className}`;

  return (
    <div id={`workspace-embed-${file.fileId}`} className={containerClasses} dir="rtl">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-background border border-border/60 shadow-xs">
            {meta.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                {meta.label}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded border border-border/40">
                ID: {file.fileId.slice(0, 12)}...
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground truncate max-w-md mt-0.5" title={file.title}>
              {file.title}
            </h4>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-border/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>صلاحية الكاتب (Writer) مفعلة</span>
          </div>

          <button
            onClick={handleRefresh}
            title="تحديث نافذة المعاينة"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
          </button>

          <a
            href={file.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="فتح في علامة تبويب جديدة على Google"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground bg-background hover:bg-muted rounded-md border border-border transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">فتح في Google</span>
          </a>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              title="إغلاق المعاينة"
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className={`relative w-full bg-slate-950/5 dark:bg-black/40 ${isFullscreen ? "flex-1 min-h-0" : "h-[600px] md:h-[680px]"}`}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">جاري تحميل مساحة العمل التفاعلية...</p>
              <p className="text-xs text-muted-foreground mt-0.5">يتم التحقق من الصلاحيات وتهيئة واجهة التعديل المباشرة</p>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={file.embedUrl}
          title={file.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; cross-origin-isolated"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>تم حفظ معرف الملف في قاعدة البيانات ومزامنته مع بيئة عمل EduPulse</span>
        </div>
        {file.linkedRecordName && (
          <span className="truncate max-w-xs font-mono text-[10px]">
            السجل المرتبط: {file.linkedRecordName}
          </span>
        )}
      </div>
    </div>
  );
};
