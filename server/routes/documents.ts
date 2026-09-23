import { Router } from 'express';
import axios from 'axios';

const router = Router();

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
        const directDownloadMirrorUrl = `https://${targetHost}${documentPath}`;

        const commonHeaders = {
            'Host': targetHost,
            'Referer': `https://${targetHost}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        };

        // 1. Fetch the plain page source text instead of an unmanaged data stream
        const htmlResponse = await axios.get(directDownloadMirrorUrl, {
            timeout: 30000,
            headers: commonHeaders,
            responseType: 'text' // Read the exact HTML code strings
        });

        const htmlContent = htmlResponse.data;

        // 2. PARSE STRATEGY: Locate the hidden backend query URL within the page source code.
        // We look for typical patterns like download forms, window.location updates, or direct file buffers.
        let finalAssetUrl = '';

        // Match common patterns where the real download processing file link or parameter is declared
        const urlDownloadMatch = htmlContent.match(/href=["'](https:\/\/scribd\.vdownloaders\.com\/download\/[^"']+)["']/i) ||
                                 htmlContent.match(/id=["']download-btn["'][^>]*href=["']([^"']+)["']/i) ||
                                 htmlContent.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);

        if (urlDownloadMatch && urlDownloadMatch[1]) {
            finalAssetUrl = urlDownloadMatch[1];
            console.log('Target proxy isolated hidden extraction link:', finalAssetUrl);
        } else {
            // Fallback: If no nested path asset match is found within the markup text,
            // attempt a direct download call to their standard download processor pipeline
            const docIdMatch = documentPath.match(/\/(doc|document)\/(\d+)/);
            if (docIdMatch && docIdMatch[2]) {
                finalAssetUrl = `https://${targetHost}/download/${docIdMatch[2]}`;
            } else {
                finalAssetUrl = directDownloadMirrorUrl;
            }
        }

        // 3. Request the binary document file stream directly from the isolated endpoint location
        const fileStreamResponse = await axios.get(finalAssetUrl, {
            responseType: 'stream',
            timeout: 60000,
            headers: {
                ...commonHeaders,
                'Accept': 'application/pdf,application/octet-stream,video/*;q=0.8,image/*;q=0.5,*/*;q=0.1'
            }
        });

        // 4. Enforce clear client-side attachment headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');

        // 5. Transfer the stream payload out to the user's browser device
        fileStreamResponse.data.pipe(res);

        fileStreamResponse.data.on('error', (streamError: any) => {
            console.error('Core proxy routing stream transport error:', streamError.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream payload transfer was interrupted.' });
            }
        });

    } catch (error: any) {
        console.error('Proxy routing execution failure:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal backend proxy framework failure.' });
        }
    }
});

export default router;
