import React from "react";
import { Download, Printer, Copy, Check, FileText } from "lucide-react";
import { exportToWordDocument, exportToPrintablePdf, copyMarkdownToClipboard } from "@/lib/documentExport";
import { toast } from "sonner";

interface ExportHubBarProps {
  title: string;
  content: string;
  meta?: {
    subject?: string;
    grade?: string;
    type?: string;
  };
  isArabic?: boolean;
  onSaveCustom?: () => void;
  isSaved?: boolean;
}

export function ExportHubBar({
  title,
  content,
  meta,
  isArabic = true,
  onSaveCustom,
  isSaved,
}: ExportHubBarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await copyMarkdownToClipboard(
      content,
      isArabic ? "تم نسخ نص المستند بنجاح" : "Document copied to clipboard"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs backdrop-blur-md">
      <div className="flex items-center gap-2 text-white/70">
        <FileText className="h-4 w-4 text-cyan-400" />
        <span className="font-medium text-white">
          {isArabic ? "مركز التصدير والمشاركة (Export Hub):" : "Export Hub:"}
        </span>
        <span className="hidden sm:inline text-white/40">
          {isArabic ? "خيارات التنزيل الفوري للملفات الرسمية" : "Instant export options"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => exportToWordDocument(title, content, meta)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-200 hover:bg-blue-500/25 transition shadow-sm"
          title={isArabic ? "تصدير بصيغة Word (.doc)" : "Export as Word document"}
        >
          <Download className="h-3.5 w-3.5 text-blue-400" />
          <span>Word (.doc)</span>
        </button>

        <button
          type="button"
          onClick={() => exportToPrintablePdf(title, content, meta)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/25 transition shadow-sm"
          title={isArabic ? "طباعة / تصدير PDF" : "Print or save as PDF"}
        >
          <Printer className="h-3.5 w-3.5 text-cyan-400" />
          <span>PDF / {isArabic ? "طباعة" : "Print"}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/15 hover:text-white transition"
          title={isArabic ? "نسخ نص Markdown" : "Copy Markdown"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">{isArabic ? "تم النسخ" : "Copied"}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-white/60" />
              <span>{isArabic ? "نسخ Markdown" : "Copy Markdown"}</span>
            </>
          )}
        </button>

        {onSaveCustom && (
          <button
            type="button"
            onClick={onSaveCustom}
            disabled={isSaved}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              isSaved
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 cursor-default"
                : "border-amber-400/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            <span>{isSaved ? (isArabic ? "محفوظ في المكتبة" : "Saved in Library") : (isArabic ? "حفظ في المكتبة" : "Save to Library")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
