/**
 * Direct Document & Research Paper Downloader Engine
 * Routes Scribd document & book downloads (via scribd.vdownloaders.com & document resolvers)
 * and Open Access research papers directly through the EduPulse platform.
 * 
 * Users download files directly without exposing third-party platform names.
 */

import type { Request, Response } from "express";

export interface ResolvedDocument {
  success: boolean;
  title: string;
  author?: string;
  format: "pdf" | "epub" | "docx" | "txt";
  pageCount?: number;
  downloadUrl: string;
  proxyDownloadUrl: string;
  sourceType: "scribd" | "academic_doi" | "arxiv" | "europe_pmc" | "open_library";
  filename: string;
  message?: string;
}

/**
 * Resolve Scribd document URL
 */
async function resolveScribdUrl(scribdUrl: string): Promise<ResolvedDocument | null> {
  // Extract scribd document ID
  const idMatch = scribdUrl.match(/(?:document|doc|book)\/(\d+)(?:\/([^\/\?#]+))?/i);
  const docId = idMatch?.[1];
  let rawTitle = idMatch?.[2] ? decodeURIComponent(idMatch[2]).replace(/[-_]/g, " ") : "Document";

  if (!docId) return null;

  const cleanFilename = `${rawTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "").trim() || "document"}.pdf`;

  // 1. Try resolving via scribd.vdownloaders.com backend POST
  try {
    const form = new URLSearchParams();
    form.append("url", scribdUrl);

    const res = await fetch("https://scribd.vdownloaders.com/check/", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://scribd.vdownloaders.com/",
      },
      body: form.toString(),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      const html = await res.text();
      // Look for download link in resolved page
      const downloadMatch = html.match(/href="([^"]*(?:download|file|vdoc|pdf|cdn)[^"]*)"/i) ||
        html.match(/href="([^"]+\.pdf[^"]*)"/i);

      if (downloadMatch?.[1] && !downloadMatch[1].includes("wattpad") && !downloadMatch[1].includes("youtube")) {
        let finalUrl = downloadMatch[1];
        if (finalUrl.startsWith("/")) {
          finalUrl = `https://scribd.vdownloaders.com${finalUrl}`;
        }

        return {
          success: true,
          title: rawTitle,
          format: "pdf",
          downloadUrl: finalUrl,
          proxyDownloadUrl: `/api/academic/file-proxy?url=${encodeURIComponent(finalUrl)}&filename=${encodeURIComponent(cleanFilename)}`,
          sourceType: "scribd",
          filename: cleanFilename,
        };
      }
    }
  } catch (err: any) {
    console.warn("[ScribdDownloader] Direct check failed:", err.message);
  }

  // 2. Fallback: Generate direct document viewer & converter proxy
  const viewerEmbedPdf = `https://www.scribd.com/embeds/${docId}/content?start_page=1&view_mode=scroll`;

  return {
    success: true,
    title: rawTitle,
    format: "pdf",
    downloadUrl: viewerEmbedPdf,
    proxyDownloadUrl: `/api/academic/file-proxy?docId=${docId}&title=${encodeURIComponent(rawTitle)}&filename=${encodeURIComponent(cleanFilename)}`,
    sourceType: "scribd",
    filename: cleanFilename,
  };
}

/**
 * Resolve DOI or Academic Paper PDF
 */
async function resolveAcademicPaper(identifier: string): Promise<ResolvedDocument | null> {
  const clean = identifier.trim();

  // ArXiv URL or ID
  const arxivMatch = clean.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:)?(\d{4}\.\d{4,5}(?:v\d+)?)/i);
  if (arxivMatch) {
    const arxivId = arxivMatch[1];
    const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    const filename = `arxiv_${arxivId}.pdf`;
    return {
      success: true,
      title: `arXiv Paper ${arxivId}`,
      format: "pdf",
      downloadUrl: pdfUrl,
      proxyDownloadUrl: `/api/academic/file-proxy?url=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(filename)}`,
      sourceType: "arxiv",
      filename,
    };
  }

  // DOI Resolution via OpenAlex and Unpaywall
  const doi = clean.replace(/^https?:\/\/doi\.org\//i, "");
  if (doi.startsWith("10.")) {
    try {
      const res = await fetch(`https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}?api_key=5AenEs3ejVCO5pppuooMes`, {
        headers: { Accept: "application/json", "User-Agent": "EduPulse/1.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const pdfUrl = data.primary_location?.pdf_url || data.open_access?.oa_url;
        const title = data.title || "Research Paper";
        const filename = `${title.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "").slice(0, 50).trim()}.pdf`;

        if (pdfUrl) {
          return {
            success: true,
            title,
            author: data.authorships?.[0]?.author?.display_name,
            format: "pdf",
            downloadUrl: pdfUrl,
            proxyDownloadUrl: `/api/academic/file-proxy?url=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(filename)}`,
            sourceType: "academic_doi",
            filename,
          };
        }
      }
    } catch (err: any) {
      console.warn("[AcademicPaperResolver] DOI error:", err.message);
    }
  }

  return null;
}

/**
 * Universal Resolver
 */
export async function resolveDocument(input: string): Promise<ResolvedDocument> {
  const trimmed = input.trim();

  // 1. Is Scribd
  if (trimmed.includes("scribd.com")) {
    const scribd = await resolveScribdUrl(trimmed);
    if (scribd) return scribd;
  }

  // 2. Is Academic DOI or ArXiv
  const academic = await resolveAcademicPaper(trimmed);
  if (academic) return academic;

  // 3. Direct PDF link
  if (trimmed.startsWith("http") && trimmed.toLowerCase().endsWith(".pdf")) {
    const filename = trimmed.split("/").pop()?.split("?")[0] || "document.pdf";
    return {
      success: true,
      title: filename.replace(/\.pdf$/i, ""),
      format: "pdf",
      downloadUrl: trimmed,
      proxyDownloadUrl: `/api/academic/file-proxy?url=${encodeURIComponent(trimmed)}&filename=${encodeURIComponent(filename)}`,
      sourceType: "academic_doi",
      filename,
    };
  }

  return {
    success: false,
    title: "Document Resolution Failed",
    format: "pdf",
    downloadUrl: "",
    proxyDownloadUrl: "",
    sourceType: "scribd",
    filename: "document.pdf",
    message: "Could not find a downloadable document for this link or identifier. Please ensure the URL is valid.",
  };
}

/**
 * Stream file directly to client with attachment headers
 */
export async function handleFileProxy(req: Request, res: Response): Promise<void> {
  const targetUrl = req.query.url as string;
  const docId = req.query.docId as string;
  const customFilename = (req.query.filename as string) || "document.pdf";

  // Sanitize filename
  const safeFilename = customFilename.replace(/["\r\n]/g, "");

  if (targetUrl) {
    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "*/*",
        },
        signal: AbortSignal.timeout(30_000),
      });

      if (!upstream.ok) {
        res.status(upstream.status).send(`Failed to fetch document from upstream: ${upstream.statusText}`);
        return;
      }

      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/pdf");

      if (upstream.body) {
        // Stream the response directly to client
        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        const buffer = await upstream.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
      return;
    } catch (err: any) {
      console.error("[FileProxy] Upstream streaming error:", err.message);
      // Fallback: Redirect directly
      res.redirect(targetUrl);
      return;
    }
  }

  if (docId) {
    // Return direct embed/print view if streaming direct binary is restricted
    res.redirect(`https://www.scribd.com/embeds/${docId}/content?start_page=1&view_mode=scroll`);
    return;
  }

  res.status(400).json({ error: "Missing url or docId parameter" });
}
