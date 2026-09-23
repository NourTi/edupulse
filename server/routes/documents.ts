import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Validation regex ensuring only genuine Scribd document URLs are submitted
const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read)\//i;

router.post('/import-document', async (req, res) => {
    const { url } = req.body;

    // Fast-fail if the payload is missing or invalid
    if (!url || !SCRIBD_REGEX.test(url)) {
        return res.status(400).json({ error: 'Invalid or missing Scribd URL' });
    }

    try {
        const targetHost = 'scribd.vdownloaders.com';
        
        // 1. EXTRACT PATH MAPPING:
        // Convert 'https://scribd.com' to '/doc/12345/Title'
        const urlObj = new URL(url);
        const documentPath = urlObj.pathname + urlObj.search;

        // 2. CONSTRUCT DIRECT TARGET DOMAIN LINK:
        // This maps the request cleanly to 'https://vdownloaders.com'
        const directDownloadMirrorUrl = `https://${targetHost}${documentPath}`;

        // 3. RETRIEVE FILE CHUNKS VIA AXIOS RESPONSE STREAM
        const targetResponse = await axios.get(directDownloadMirrorUrl, {
            responseType: 'stream',
            timeout: 60000, // 60 seconds max timeout
            headers: {
                'Host': targetHost,
                'Referer': `https://${targetHost}/`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,application/octet-stream,text/html,*/*'
            }
        });

        // 4. PREPARE THE OUTBOUND CLIENT DOWNLOAD HEADERS
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');

        // 5. PIPE THE INCOMING DATA DIRECTLY TO THE CLIENT BROWSER
        targetResponse.data.pipe(res);

        // 6. PREVENT CRASHES IF CONNECTION DROP OCCURS DURING STREAMING
        targetResponse.data.on('error', (streamError: any) => {
            console.error('Data stream interrupted:', streamError.message);
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
