import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink } from 'lucide-react';

const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read)\//i;

export function DocumentImporter() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const handleImport = async () => {
  if (!SCRIBD_REGEX.test(url)) return alert('Paste a valid Scribd URL');

  setLoading(true);
  setFallbackUrl(null);

  try {
    const res = await fetch('/api/import-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    // If backend returns JSON (fallback / error)
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();

      if (data.fallback && data.externalUrl) {
        setFallbackUrl(data.externalUrl);
        return;
      }

      throw new Error(data.error || 'Download failed');
    }

    // Otherwise, treat it as a file (PDF or binary)
    if (!res.ok) throw new Error('Failed');

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    setUrl('');
  } catch (err) {
    console.error(err);
    alert('Download failed');
  } finally {
    setLoading(false);
  }
};
      const data = await res.json();
      
      if (data.fallback) {
        setFallbackUrl(data.externalUrl);
        setLoading(false);
        return;
      }
      
      if (!res.ok) throw new Error('Failed');
      
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'document.pdf';
      link.click();
      setUrl('');
      
    } catch {
      alert('Download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex gap-2">
        <Input
          placeholder="Paste Scribd book/document URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleImport} disabled={loading || !url}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
      </div>
      
      {fallbackUrl && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 mb-2">Auto-download blocked. Click below:</p>
          <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
            Download manually <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
