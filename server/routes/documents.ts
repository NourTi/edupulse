import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Validation check to ensure only genuine Scribd links are processed
const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read|presentation)\//i;

router.post('/import-document', async (req, res) => {
    const { url } = req.body;

    if (!url || !SCRIBD_REGEX.test(url)) {
        return res.status(400).json({ error: 'Invalid or missing Scribd URL' });
    }

    try {
        const targetHost = 'scribd.vpdfs.com';
        
        // 1. EXTRACT DOCUMENT PATH MAPPING:
        // Converts 'https://scribd.com' to '/doc/12345/Title'
        const urlObj = new URL(url);
        const documentPath = urlObj.pathname + urlObj.search;

        // 2. CONSTRUCT DIRECT MIRROR LINK:
        // Points natively to 'https://vpdfs.com'
        const directMirrorUrl = `https://${targetHost}${documentPath}`;

        const browserHeaders = {
            'Host': targetHost,
            'Referer': `https://${targetHost}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        };

        // --- PASS 1: FETCH LANDING PAGE HTML ---
        console.log(`[Proxy] Handshaking with mirror endpoint: ${directMirrorUrl}`);
        const landingPageResponse = await axios.get(directMirrorUrl, {
            timeout: 25000,
            headers: browserHeaders,
            responseType: 'text' // Extract the raw webpage markup source text string
        });

        const htmlMarkup = landingPageResponse.data;
        let extractionUrl = '';

        // --- REGEX EXTRACTION ENGINE ---
        // Dynamically looks for HTML elements containing direct file download paths
        const fileRouteMatch = htmlMarkup.match(/href=["'](\/download\/[^"']+)["']/i) || 
                               htmlMarkup.match(/href=["'](https?:\/\/scribd\.vpdfs\.com\/download\/[^"']+)["']/i);

        if (fileRouteMatch && fileRouteMatch[1]) {
            const rawPath = fileRouteMatch[1];
            // Normalize path string whether it's absolute or relative
            extractionUrl = rawPath.startsWith('http') ? rawPath : `https://${targetHost}${rawPath}`;
            console.log(`[Proxy] Successfully extracted dynamic download path: ${extractionUrl}`);
        } else {
            // Fallback: If no direct download button route is found in the HTML strings,
            // fall back to the mirror entry URL to keep the streaming connection active
            extractionUrl = directMirrorUrl;
            console.warn('[Proxy] Regex did not find a explicit download route. Falling back to base mirror.');
        }

        // --- PASS 2: STREAMING BINARY TRANSMISSION ---
        console.log(`[Proxy] Commencing binary stream transmission from source...`);
        const documentStreamResponse = await axios.get(extractionUrl, {
            responseType: 'stream',
            timeout: 60000, // Allow up to 60 seconds for heavy documents
            headers: {
                ...browserHeaders,
                'Accept': 'application/pdf,application/octet-stream,*/*'
            }
        });

        // Configure the browser to treat incoming bytes as a forced PDF file save action
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="downloaded-document.pdf"');

        // Pipe the live chunk buffer data cleanly through Render's network card straight to the client
        documentStreamResponse.data.pipe(res);

        // Catch streaming drops gracefully mid-flight to isolate and protect the main Express daemon process
        documentStreamResponse.data.on('error', (streamError: any) => {
            console.error('[Stream Error] Connection dropped during data relay:', streamError.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Data stream was interrupted mid-transmission' });
            }
        });

    } catch (error: any) {
        console.error('[Proxy Error] Exception encountered within pipeline:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal backend proxy pipeline failed.' });
        }
    }
});

export default router;
