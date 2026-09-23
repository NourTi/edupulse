import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Validation regex ensuring only genuine Scribd document URLs are processed
const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read)\//i;

router.post('/import-document', async (req, res) => {
    const { url } = req.body;

    if (!url || !SCRIBD_REGEX.test(url)) {
        return res.status(400).json({ error: 'Invalid or missing Scribd URL' });
    }

    try {
        const targetHost = 'scribd.vdownloaders.com';
        const urlObj = new URL(url);
        const documentPath = urlObj.pathname + urlObj.search;
        
        // This targets the specific proxy destination (e.g., https://vdownloaders.com)
        const directDownloadMirrorUrl = `https://${targetHost}${documentPath}`;

        const commonHeaders = {
            'Host': targetHost,
            'Referer': `https://${targetHost}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        };

        // PASS 1: Fetch the processing web page HTML content text
        const initialResponse = await axios.get(directDownloadMirrorUrl, {
            timeout: 30000,
            headers: commonHeaders,
            responseType: 'text' // We need to read the raw HTML text
        });

        const htmlContent = initialResponse.data;
        let finalDownloadUrl = '';

        // Search the HTML text for common direct binary file patterns or redirect markers
        // Look for buttons, anchors, or script definitions pushing to an asset stream
        const downloadUrlMatch = htmlContent.match(/href=["'](https?:\/\/[^"']+\.(?:pdf|download|stream)[^"']*)["']/i) ||
                                 htmlContent.match(/id=["']download-btn["'][^>]*href=["']([^"']+)["']/i) ||
                                 htmlContent.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);

        if (downloadUrlMatch && downloadUrlMatch[1]) {
            finalDownloadUrl = downloadUrlMatch[1];
        } else {
            // Fallback: If no nested asset URL is explicitly extracted from the scripts,
            // check if the page itself contains a direct relative file source pathway
            const structuralMatch = htmlContent.match(/href=["'](\/download\/[^"']+)["']/i);
            if (structuralMatch && structuralMatch[1]) {
                finalDownloadUrl = `https://${targetHost}${structuralMatch[1]}`;
            }
        }

        // If the parser completely strikes out looking for a dynamic sub-url, 
        // fall back to the main mirror entry to maintain streaming continuity
        if (!finalDownloadUrl) {
            finalDownloadUrl = directDownloadMirrorUrl;
        }

        // PASS 2: Request the actual binary asset data stream from the resolved path
        const fileStreamResponse = await axios.get(finalDownloadUrl, {
            responseType: 'stream',
            timeout: 60000,
            headers: {
                ...commonHeaders,
                'Accept': 'application/pdf,application/octet-stream,video/*,image/*,*/*'
            }
        });

        // Force browser binary execution mechanics to push a clean PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');

        // Pipe the isolated file chunks straight to the browser
        fileStreamResponse.data.pipe(res);

        fileStreamResponse.data.on('error', (streamError: any) => {
            console.error('Data stream interrupted mid-transmission:', streamError.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream interrupted during transmission' });
            }
        });

    } catch (error: any) {
        console.error('Proxy routing exception occurred:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal backend proxy pipeline failed.' });
        }
    }
});

export default router;
