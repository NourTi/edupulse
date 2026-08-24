# EduPulse Knowledge Worker Contract

The current managed lightweight path ingests readable text and public webpages directly in the EduPulse server. It preserves the core records required by a future document-processing worker: `knowledgeSources`, `knowledgeChunks`, source visibility, source provenance, storage keys, and source IDs.

## Future Worker Inputs

The worker receives an approved source only after an authenticated administrator creates it. It must accept the following data:

```ts
type KnowledgeWorkerJob = {
  sourceId: string;
  sourceKind: "document" | "webpage";
  sourceUrl?: string;
  storageKey?: string;
  mimeType: string;
  visibility: "public" | "staff";
};
```

## Processing Adapters

| Source | Primary adapter | Output required by EduPulse |
|---|---|---|
| Public website | Crawl4AI | Clean text, canonical URL, title, and source sections |
| PDF, scan, or mixed-layout document | MinerU | OCR/layout-derived text, page or section references, and parser status |
| Text-heavy source | LightRAG | Chunk-ready text with contextual relationships where useful |
| Multimodal source | RAG-Anything | Chunk-ready text plus retained multimodal references when supported |

If an adapter fails, the worker must mark the source as `failed`, preserve the original file, and return a human-readable error. It must not publish partial or unreviewed content to the public knowledge base.

## Worker Output

The worker writes citation-ready chunks with their existing `sourceId`. Every chunk must retain a stable ordinal and optional page/section metadata in a future schema extension. The public agent continues to retrieve only chunks where the source is `ready` and its visibility is `public`.

## Non-Negotiable Safety Rules

The worker must never ingest private student records into public sources. The public agent does not answer questions about a learner's grades, attendance, finance, discipline, admissions decision, or contact details. This policy remains server-enforced even after a richer RAG engine is added.
