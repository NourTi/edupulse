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
        // 1. EXTRACT DOCUMENT IDENTIFIER NUMBERS:
        // Extracting numbers from paths like /document/123456789/Title
        const numericMatch = url.match(/\/(?:doc|document|book|read)\/(\d+)/i);
        if (!numericMatch) {
            return res.status(400).json({ error: 'Could not extract valid document ID from link' });
        }
        const documentId = numericMatch[1];

        // 2. CONSTRUCT DIRECT THIRD-PARTY API FETCH PATH:
        // Targeting the direct processing endpoints used by downsampling layers
        const targetHost = '://vdownloaders.com';
        const fallbackStreamUrl = `https://${targetHost}/download/${documentId}`;

        const proxyHeaders = {
            'Host': targetHost,
            'Referer': `https://${targetHost}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'X-Requested-With': 'XMLHttpRequest'
        };

        // 3. HANDSHAKE VIA AXIOS STREAM FOR THE FILE CONTENT
        const finalAssetStream = await axios.get(fallbackStreamUrl, {
            responseType: 'stream',
            timeout: 60000,
            headers: proxyHeaders,
            validateStatus: (status) => status < 400
        });

        // 4. EMIT FILE DOWNLOAD ATTACHMENT DIRECTIVES
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="scribd-${documentId}.pdf"`);

        // Pipe binary stream chunks down to user client
        finalAssetStream.data.pipe(res);

        finalAssetStream.data.on('error', (streamError: any) => {
            console.error('Buffer routing break detected:', streamError.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream context connection timed out.' });
            }
        });

    } catch (error: any) {
        console.error('Proxy routing exception occurred:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to stream source asset.' });
        }
    }
});

export default router;
