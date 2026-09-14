/**
 * Direct Document & Research Paper Downloader Engine
 * Routes Digital Document Library, Internet Archive, and Open Access research papers
 * directly through the EduPulse platform.
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
  sourceType: "academic_repository" | "internet_archive" | "academic_doi" | "arxiv" | "europe_pmc" | "open_library";
  filename: string;
  message?: string;
}

/**
 * Resolve Internet Archive (archive.org) documents and books
 */
async function resolveArchiveOrgUrl(urlOrId: string): Promise<ResolvedDocument | null> {
  const match = urlOrId.match(/archive\.org\/(?:details|download)\/([^\/\?#]+)(?:\/([^\/\?#]+))?/i) ||
    urlOrId.match(/^([a-zA-Z0-9_\-\.]{5,80})$/);

  const identifier = match?.[1]?.replace(/\/$/, "");
  if (!identifier) return null;

  try {
    const metaRes = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "EduPulse/1.0 (Academic Library Resolver)" }
    });

    if (metaRes.ok) {
      const data = await metaRes.json();
      const metadata = data.metadata || {};
      const title = metadata.title || identifier;
      const author = metadata.creator || metadata.author || "Internet Archive";
      const files: any[] = Array.isArray(data.files) ? data.files : [];

      // Find best PDF or readable file
      const pdfFile = files.find(f => f.name?.toLowerCase().endsWith(".pdf") && !f.name?.includes("_thumb")) ||
        files.find(f => f.name?.toLowerCase().endsWith(".epub")) ||
        files.find(f => f.name?.toLowerCase().endsWith(".djvu")) ||
        files[0];

      if (pdfFile) {
        const fileExt = pdfFile.name?.toLowerCase().endsWith(".epub") ? "epub" : "pdf";
        const downloadUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(pdfFile.name)}`;
        const cleanFilename = `${title.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "").trim() || identifier}.${fileExt}`;

        return {
          success: true,
          title,
          author,
          format: fileExt as any,
          downloadUrl,
          proxyDownloadUrl: `/api/academic/file-proxy?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(cleanFilename)}`,
          sourceType: "internet_archive",
          filename: cleanFilename,
        };
      }
    }
  } catch (err: any) {
    console.warn("[ArchiveOrgResolver] Error resolving archive identifier:", err.message);
  }

  return null;
}

/**
 * Resolve Digital Document Library URL (via document resolvers)
 */
async function resolveDigitalDocumentUrl(documentUrl: string): Promise<ResolvedDocument | null> {
  // Extract document ID if applicable
  const idMatch = documentUrl.match(/(?:document|doc|book)\/(\d+)(?:\/([^\/\?#]+))?/i);
  const docId = idMatch?.[1];
  let rawTitle = idMatch?.[2] ? decodeURIComponent(idMatch[2]).replace(/[-_]/g, " ") : "Document";

  if (!docId && !documentUrl.includes("document") && !documentUrl.includes("doc")) return null;

  const cleanFilename = `${rawTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "").trim() || "document"}.pdf`;

  // 1. Try resolving via document download backend
  try {
    const form = new URLSearchParams();
    form.append("url", documentUrl);

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
          sourceType: "academic_repository",
          filename: cleanFilename,
        };
      }
    }
  } catch (err: any) {
    console.warn("[DigitalDocResolver] Direct check failed:", err.message);
  }

  // 2. Fallback: Generate direct document viewer & converter proxy
  if (docId) {
    const viewerEmbedPdf = `https://www.scribd.com/embeds/${docId}/content?start_page=1&view_mode=scroll`;
    return {
      success: true,
      title: rawTitle,
      format: "pdf",
      downloadUrl: viewerEmbedPdf,
      proxyDownloadUrl: `/api/academic/file-proxy?docId=${docId}&title=${encodeURIComponent(rawTitle)}&filename=${encodeURIComponent(cleanFilename)}`,
      sourceType: "academic_repository",
      filename: cleanFilename,
    };
  }

  return null;
}

/**
 * Resolve DOI or Academic Paper PDF across OpenAlex, Unpaywall, Semantic Scholar, and arXiv
 */
async function resolveAcademicPaper(identifier: string): Promise<ResolvedDocument | null> {
  const clean = identifier.trim();

  // 1. ArXiv URL or ID
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

  // 2. DOI Extraction
  const doiMatch = clean.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/i);
  const doi = doiMatch ? doiMatch[0] : (clean.startsWith("10.") ? clean : null);

  if (doi) {
    // Try OpenAlex first
    try {
      const res = await fetch(`https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}?api_key=5AenEs3ejVCO5pppuooMes`, {
        headers: { Accept: "application/json", "User-Agent": "EduPulse/1.0" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const pdfUrl = data.best_oa_location?.pdf_url || data.primary_location?.pdf_url || data.open_access?.oa_url;
        const title = data.title || `Research Paper (${doi})`;
        const filename = `${title.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "").slice(0, 50).trim() || "research_paper"}.pdf`;

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
      console.warn("[AcademicPaperResolver] OpenAlex DOI error:", err.message);
    }

    // Try Unpaywall
    try {
      const unpaywallRes = await fetch(`https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=research@edupulse.edu.dz`, {
        signal: AbortSignal.timeout(6000),
        headers: { Accept: "application/json" }
      });
      if (unpaywallRes.ok) {
        const upData = await unpaywallRes.json();
        const oaUrl = upData.best_oa_location?.url_for_pdf || upData.best_oa_location?.url;
        if (oaUrl) {
          const title = upData.title || `Paper ${doi}`;
          const filename = `${title.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "").slice(0, 50).trim() || "paper"}.pdf`;
          return {
            success: true,
            title,
            author: upData.z_authors?.[0]?.family || "Academic Researcher",
            format: "pdf",
            downloadUrl: oaUrl,
            proxyDownloadUrl: `/api/academic/file-proxy?url=${encodeURIComponent(oaUrl)}&filename=${encodeURIComponent(filename)}`,
            sourceType: "academic_doi",
            filename,
          };
        }
      }
    } catch (err: any) {
      console.warn("[AcademicPaperResolver] Unpaywall error:", err.message);
    }

    // Direct DOI landing/fallback link
    const doiUrl = `https://doi.org/${doi}`;
    return {
      success: true,
      title: `Academic Publication (DOI: ${doi})`,
      format: "pdf",
      downloadUrl: doiUrl,
      proxyDownloadUrl: `/api/academic/file-proxy?url=${encodeURIComponent(doiUrl)}&filename=${encodeURIComponent(`paper_${doi.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`)}`,
      sourceType: "academic_doi",
      filename: `paper_${doi.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    };
  }

  // 3. Search by Paper Title if clean string is long enough
  if (clean.length > 5 && !clean.startsWith("http")) {
    try {
      const searchRes = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(clean)}&per-page=3&api_key=5AenEs3ejVCO5pppuooMes`, {
        signal: AbortSignal.timeout(6000),
        headers: { Accept: "application/json", "User-Agent": "EduPulse/1.0" },
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const first = (searchData.results || [])[0];
        if (first) {
          const pdfUrl = first.best_oa_location?.pdf_url || first.primary_location?.pdf_url || first.open_access?.oa_url;
          const title = first.title || clean;
          const filename = `${title.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, "").slice(0, 50).trim() || "paper"}.pdf`;

          return {
            success: true,
            title,
            author: first.authorships?.[0]?.author?.display_name,
            format: "pdf",
            downloadUrl: pdfUrl || first.doi || first.id,
            proxyDownloadUrl: pdfUrl
              ? `/api/academic/file-proxy?url=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(filename)}`
              : (first.doi || first.id),
            sourceType: "academic_doi",
            filename,
          };
        }
      }
    } catch (err: any) {
      console.warn("[AcademicPaperResolver] Title search error:", err.message);
    }
  }

  return null;
}

/**
 * Universal Resolver
 */
export async function resolveDocument(input: string): Promise<ResolvedDocument> {
  const trimmed = input.trim();

  // 1. Internet Archive (archive.org)
  if (trimmed.includes("archive.org")) {
    const archiveDoc = await resolveArchiveOrgUrl(trimmed);
    if (archiveDoc) return archiveDoc;
  }

  // 2. Digital Document Library
  if (trimmed.includes("scribd.com") || trimmed.includes("/document/") || trimmed.includes("/doc/")) {
    const digitalDoc = await resolveDigitalDocumentUrl(trimmed);
    if (digitalDoc) return digitalDoc;
  }

  // 3. Academic DOI, arXiv, or Title search
  const academic = await resolveAcademicPaper(trimmed);
  if (academic) return academic;

  // 4. Check Internet Archive by item identifier
  const archiveItem = await resolveArchiveOrgUrl(trimmed);
  if (archiveItem) return archiveItem;

  // 5. Direct PDF link
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
    sourceType: "academic_repository",
    filename: "document.pdf",
    message: "تعذر العثور على رابط تحميل مباشر لهذا المستند أو المعرف. يرجى التحقق من صحة الرابط أو المعرف الأكاديمي.",
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
        // If upstream rejected proxy stream, redirect user directly to the target URL
        res.redirect(targetUrl);
        return;
      }

      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/pdf");

      if (upstream.body) {
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
      console.error("[FileProxy] Upstream streaming error, redirecting directly:", err.message);
      res.redirect(targetUrl);
      return;
    }
  }

  if (docId) {
    res.redirect(`https://www.scribd.com/embeds/${docId}/content?start_page=1&view_mode=scroll`);
    return;
  }

  res.status(400).json({ error: "Missing url or docId parameter" });
}
