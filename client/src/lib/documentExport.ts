import { toast } from "sonner";

/**
 * Cleanly exports Markdown or formatted text as a Word-compatible .doc file
 * with full UTF-8 encoding support for Arabic and French characters.
 */
export function exportToWordDocument(title: string, content: string, meta?: { subject?: string; grade?: string; author?: string }) {
  try {
    const cleanTitle = title.replace(/[\\/:*?"<>|]/g, "_");
    
    // Convert basic markdown to HTML for Word
    const htmlContent = markdownToSimpleHtml(content);

    const fullHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeXml(title)}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a202c;
      padding: 2cm;
    }
    h1 { font-size: 20pt; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-top: 0; }
    h2 { font-size: 15pt; color: #1e40af; margin-top: 18pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    h3 { font-size: 13pt; color: #0369a1; margin-top: 14pt; }
    p { margin: 8pt 0; }
    ul, ol { margin: 8pt 0; padding-left: 24pt; }
    li { margin: 4pt 0; }
    table { width: 100%; border-collapse: collapse; margin: 14pt 0; }
    th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; border: 1px solid #cbd5e1; padding: 8pt; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 7pt; vertical-align: top; }
    blockquote { border-left: 4px solid #3b82f6; margin: 12pt 0; padding: 6pt 14pt; background-color: #f8fafc; font-style: italic; }
    .header-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12pt; margin-bottom: 18pt; }
    .footer-stamp { margin-top: 30pt; font-size: 9pt; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 8pt; }
  </style>
</head>
<body dir="auto">
  <div class="header-box">
    <h1>${escapeXml(title)}</h1>
    <p><strong>المادة / Discipline :</strong> ${escapeXml(meta?.subject || "عام / Général")} &nbsp;|&nbsp; <strong>المستوى / Niveau :</strong> ${escapeXml(meta?.grade || "جميع المستويات")} &nbsp;|&nbsp; <strong>تاريخ الإصدار :</strong> ${new Date().toLocaleDateString("ar-DZ")}</p>
  </div>
  <div class="content-body">
    ${htmlContent}
  </div>
  <div class="footer-stamp">
    تم الإنشاء بواسطة EduPulse Teacher Content Studio &bull; وثيقة بيداغوجية رسمية معتمدة.
  </div>
</body>
</html>`;

    const blob = new Blob(["\ufeff", fullHtml], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cleanTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("تم تنزيل مستند Word بنجاح", {
      description: "المستند جاهز للفتح والتعديل في Microsoft Word.",
    });
  } catch (err) {
    console.error("Failed to export Word doc:", err);
    toast.error("تعذر تنزيل ملف Word");
  }
}

/**
 * Triggers a clean printable document window or browser print
 */
export function exportToPrintablePdf(title: string, content: string, meta?: { subject?: string; grade?: string }) {
  try {
    const html = markdownToSimpleHtml(content);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("يرجى السماح بالنوافذ المنبثقة لطباعة المستند كـ PDF");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html dir="auto">
<head>
  <meta charset="utf-8">
  <title>${escapeXml(title)}</title>
  <style>
    @media print {
      @page { margin: 1.5cm; size: A4 portrait; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Naskh Arabic', sans-serif;
      color: #0f172a;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    .print-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .btn-print {
      background: #0284c7;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    h1 { font-size: 22px; color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 6px; }
    h2 { font-size: 17px; color: #0c4a6e; margin-top: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    h3 { font-size: 15px; color: #0284c7; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; font-weight: bold; text-align: right; }
    td { border: 1px solid #cbd5e1; padding: 8px 10px; }
    ul, ol { padding-right: 24px; padding-left: 24px; }
    li { margin-bottom: 4px; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <div><strong>${escapeXml(title)}</strong> — جاهز للطباعة والحفظ كـ PDF</div>
    <button class="btn-print" onclick="window.print()">طباعة الآن / حفظ كـ PDF</button>
  </div>
  <div>
    <h1>${escapeXml(title)}</h1>
    <p>
      <span class="badge">${escapeXml(meta?.subject || "عام")}</span>
      <span class="badge">${escapeXml(meta?.grade || "جميع الأطوار")}</span>
      <span style="color:#64748b; font-size: 12px;">${new Date().toLocaleDateString("ar-DZ")}</span>
    </p>
  </div>
  <hr style="border:none; border-top:1px solid #e2e8f0; margin: 16px 0;">
  <div>
    ${html}
  </div>
  <script>
    setTimeout(() => { window.print(); }, 400);
  </script>
</body>
</html>`);
    printWindow.document.close();
  } catch (err) {
    console.error("Print error:", err);
    toast.error("تعذر فتح واجهة الطباعة");
  }
}

/**
 * Copies raw markdown or text to clipboard with instant toast feedback
 */
export async function copyMarkdownToClipboard(content: string, customMessage = "تم نسخ المحتوى بنجاح") {
  try {
    await navigator.clipboard.writeText(content);
    toast.success(customMessage, {
      description: "المحتوى الآن في الحافظة، يمكنك لصقه في أي محرر نصوص.",
    });
  } catch (err) {
    console.error("Clipboard copy error:", err);
    toast.error("تعذر نسخ المحتوى إلى الحافظة");
  }
}

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function markdownToSimpleHtml(md: string): string {
  if (!md) return "";
  let html = md;

  // Handle tables
  const lines = html.split("\n");
  let inTable = false;
  let tableBuffer: string[] = [];
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      inTable = true;
      tableBuffer.push(line);
    } else {
      if (inTable) {
        processedLines.push(convertTableRowsToHtml(tableBuffer));
        tableBuffer = [];
        inTable = false;
      }
      processedLines.push(line);
    }
  }
  if (inTable && tableBuffer.length > 0) {
    processedLines.push(convertTableRowsToHtml(tableBuffer));
  }

  html = processedLines.join("\n");

  // Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Lists
  html = html.replace(/^[-\*] (.*$)/gim, "<li>$1</li>");
  html = html.replace(/^\d+\. (.*$)/gim, "<li>$1</li>");

  // Paragraphs
  html = html
    .split("\n\n")
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<table") || trimmed.startsWith("<li")) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}

function convertTableRowsToHtml(rows: string[]): string {
  if (rows.length === 0) return "";
  let tableHtml = "<table>";

  rows.forEach((row, idx) => {
    // skip divider row like |---|---|
    if (row.replace(/[\s|:-]/g, "") === "") return;

    const cells = row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

    if (idx === 0) {
      tableHtml += "<thead><tr>";
      cells.forEach((cell) => {
        tableHtml += `<th>${cell}</th>`;
      });
      tableHtml += "</tr></thead><tbody>";
    } else {
      tableHtml += "<tr>";
      cells.forEach((cell) => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += "</tr>";
    }
  });

  tableHtml += "</tbody></table>";
  return tableHtml;
}
