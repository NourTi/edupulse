import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';

const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read)\//i;

export function ScribdImporter() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!SCRIBD_REGEX.test(trimmed)) {
      alert('Please paste a valid Scribd document URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/import-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Import failed');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setUrl('');
    } catch (err) {
      console.error(err);
      alert('Download failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Paste Scribd book/document URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleImport} disabled={loading || !url.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Paste a Scribd link. We’ll securely fetch the PDF for you, without
        exposing any third‑party site to your students.
      </p>
    </div>
  );
}
