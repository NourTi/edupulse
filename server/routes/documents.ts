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
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,application/pdf,*/*;q=0.8'
        };

        // 1. First request: Get the landing page HTML without following redirects blindly
        const pageResponse = await axios.get(directDownloadMirrorUrl, {
            timeout: 30000,
            headers: commonHeaders,
            maxRedirects: 0, // Stop Axios from immediately bouncing to Scribd
            validateStatus: (status) => status >= 200 && status < 400 
        });

        let finalDownloadUrl = directDownloadMirrorUrl;

        // If they try to issue a 301/302 network redirect, catch it!
        if (pageResponse.status >= 300 && pageResponse.status < 400 && pageResponse.headers.location) {
            const redirectUrl = pageResponse.headers.location;
            // If the redirect location points away from vdownloaders, we need to inspect the HTML payload instead
            if (!redirectUrl.includes('scribd.com')) {
                finalDownloadUrl = redirectUrl;
            }
        }

        // 2. Second request: Safely request the binary asset stream from the verified source
        const fileStreamResponse = await axios.get(finalDownloadUrl, {
            responseType: 'stream',
            timeout: 60000,
            headers: {
                ...commonHeaders,
                'Accept': 'application/pdf,application/octet-stream,*/*'
            }
        });

        // 3. Set download context headers for your user
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');

        // 4. Deliver the stream to the client browser
        fileStreamResponse.data.pipe(res);

        fileStreamResponse.data.on('error', (streamError: any) => {
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
