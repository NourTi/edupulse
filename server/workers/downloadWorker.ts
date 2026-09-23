import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { db } from '../config/database';

export async function processWorkerTask(jobId: string): Promise<void> {
    // 1. Advance database state to 'processing'
    await db.execute('UPDATE document_jobs SET status = ? WHERE id = ?', ['processing', jobId]);

    // Fetch the URL tied to this jobId
    const [rows]: any = await db.execute('SELECT scribd_url FROM document_jobs WHERE id = ?', [jobId]);
    if (!rows || rows.length === 0) return;
    const scribdUrl = rows[0].scribd_url;

    try {
        const targetHost = '://vpdfs.com';
        const urlObj = new URL(scribdUrl);
        const directMirrorUrl = `https://${targetHost}${urlObj.pathname}${urlObj.search}`;

        const browserHeaders = {
            'Host': targetHost,
            'Referer': `https://${targetHost}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        };

        // --- STEP 1: PARSE INTERMEDIARY SOURCE CODE ---
        const pageHtml = await axios.get(directMirrorUrl, {
            timeout: 20000,
            headers: browserHeaders,
            responseType: 'text'
        });

        // Scan the structure for the genuine generated link path
        const match = pageHtml.data.match(/href=["'](\/download\/[^"']+)["']/i);
        let dynamicDownloadUrl = directMirrorUrl;

        if (match && match[1]) {
            dynamicDownloadUrl = match[1].startsWith('http') ? match[1] : `https://${targetHost}${match[1]}`;
        }

        // --- STEP 2: DOWNLOAD BINARY STREAM INTO WORKER ATOMIC CACHE ---
        const fileResponse = await axios.get(dynamicDownloadUrl, {
            timeout: 45000,
            headers: browserHeaders,
            responseType: 'stream'
        });

        // Build a temporary target path inside Render's ephemeral storage partition
        const storageDirectory = path.join('/tmp', 'edupulse_docs');
        if (!fs.existsSync(storageDirectory)) {
            fs.mkdirSync(storageDirectory, { recursive: true });
        }

        const localFileName = `doc_${jobId}.pdf`;
        const localAbsoluteFilePath = path.join(storageDirectory, localFileName);
        const writeStream = fs.createWriteStream(localAbsoluteFilePath);

        // Pipe the inbound web stream onto Render's disk allocation
        fileResponse.data.pipe(writeStream);

        // Wait for disk synchronization to finalize completely
        await new Promise<void>((resolve, reject) => {
            writeStream.on('finish', () => resolve());
            writeStream.on('error', (err) => reject(err));
        });

        // 2. Mark task as 'completed' inside TiDB
        await db.execute(
            'UPDATE document_jobs SET status = ?, file_path = ? WHERE id = ?',
            ['completed', localAbsoluteFilePath, jobId]
        );

    } catch (err: any) {
        console.error(`[Worker Failure] Critical breakdown executing job ${jobId}:`, err.message);
        // 3. Flag task failure state inside TiDB cleanly
        await db.execute(
            'UPDATE document_jobs SET status = ?, error_message = ? WHERE id = ?',
            ['failed', err.message, jobId]
        );
    }
}
