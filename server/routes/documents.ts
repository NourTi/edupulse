import { Router } from 'express';
import axios from 'axios';

const router = Router();

const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read|presentation)\//i;

router.post('/import-document', async (req, res) => {
    const { url } = req.body;

    if (!url || !SCRIBD_REGEX.test(url)) {
        return res.status(400).json({ error: 'Invalid or missing Scribd URL' });
    }

    try {
        const targetHost = 'scribd.vpdfs.com';
        
        // 1. Extract the unique numeric identifier of the document
        const numericMatch = url.match(/\/(?:doc|document|book|read|presentation)\/(\d+)/i);
        if (!numericMatch) {
            return res.status(400).json({ error: 'Could not extract valid document ID from URL' });
        }
        const documentId = numericMatch[1];

        // 2. Build explicit application headers to spoof a native AJAX connection
        const apiHeaders = {
            'Host': targetHost,
            'Origin': `https://${targetHost}`,
            'Referer': `https://${targetHost}/document/${documentId}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest'
        };

        // 3. TARGET THE DOWNSTREAM PROCESSING ENGINE DIRECTLY
        // We construct the form payload that their client-side application utilizes
        const postData = `id=${documentId}&url=${encodeURIComponent(url)}&type=pdf`;

        console.log(`[API Proxy] Submitting direct payload to download engine for ID: ${documentId}`);
        
        const apiResponse = await axios.post(`https://${targetHost}/api/download`, postData, {
            timeout: 30000,
            headers: apiHeaders,
            validateStatus: (status) => status < 500
        });

        let binaryDownloadUrl = `https://${targetHost}/download/${documentId}`;

        // If their API responds with a JSON object containing the direct secure link, extract it
        if (apiResponse.data && typeof apiResponse.data === 'object' && apiResponse.data.url) {
            binaryDownloadUrl = apiResponse.data.url;
            console.log(`[API Proxy] Extracted explicit stream target from JSON: ${binaryDownloadUrl}`);
        }

        // 4. ESTABLISH THE BINARY PIPE FROM THE RESOLVED SOURCE
        console.log(`[API Proxy] Executing streaming transfer from: ${binaryDownloadUrl}`);
        const fileStreamResponse = await axios.get(binaryDownloadUrl, {
            responseType: 'stream',
            timeout: 60000,
            headers: {
                'Host': targetHost,
                'User-Agent': apiHeaders['User-Agent'],
                'Referer': apiHeaders['Referer'],
                'Accept': 'application/pdf,application/octet-stream,*/*'
            }
        });

        // Set attachment directives to trigger an automated file download window for the user
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="document-${documentId}.pdf"`);

        // Stream raw byte chunks smoothly through Render to the client
        fileStreamResponse.data.pipe(res);

        fileStreamResponse.data.on('error', (streamError: any) => {
            console.error('[API Stream Error] Network dropped mid-transfer:', streamError.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Download stream broken during transmission.' });
            }
        });

    } catch (error: any) {
        console.error('[API Proxy Error] Execution exception occurred:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal backend proxy pipeline failed.' });
        }
    }
});

export default router;
