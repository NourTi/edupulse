/**
 * Document Export Utility Framework
 * Handles standalone document export formatting properties.
 */
export const DOCUMENT_EXPORT_VERSION = "1.0.0";

export function formatDocumentName(jobId: string): string {
  return `scribd-document-${jobId}.pdf`;
}
