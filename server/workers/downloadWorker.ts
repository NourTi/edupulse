import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { db } from '../config/database';

export async function processWorkerTask(jobId: string): Promise<void> {
    // 1. Mark status as processing in TiDB
    await db.execute('UPDATE document_jobs SET status = ? WHERE id = ?', ['processing', jobId]);

    const [rows]: any = await db.execute('SELECT scribd_url FROM document_jobs WHERE id = ?', [jobId]);
    if (!rows || rows.length === 0) return;
    const scribdUrl = rows.scribd_url;

    try {
        // 2. EXTRACT THE ORIGINAL SCRIBD ASSET NUMBER
        // Example: https://scribd.com -> 123456789
        const docIdMatch = scribdUrl.match(/\/(?:doc|document|book|read|presentation)\/(\d+)/i);
        if (!docIdMatch) {
            throw new Error('Failed to extract a valid numerical document ID sequence.');
        }
        const docId = docIdMatch[1];

        // 3. TARGET THE DOWNSTREAM BINARY STREAM ENDPOINT DIRECTLY
        // Bypassing html layout shells by reaching straight into the direct content source
        const directFileEndpoint = `https://vpdfs.com{docId}`;
        
        console.log(`[System Worker] Initializing direct binary pipe from endpoint: ${directFileEndpoint}`);

        const fileResponse = await axios.get(directFileEndpoint, {
            timeout: 50000,
            responseType: 'stream',
            headers: {
                'Host': 'scribd.vpdfs.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,application/octet-stream,*/*',
                'Referer': 'https://vpdfs.com'
            }
        });

        // 4. PERSIST THE INBOUND BUFFER TO THE LOCAL STORAGE DISK
        const storageDirectory = path.join('/tmp', 'edupulse_docs');
        if (!fs.existsSync(storageDirectory)) {
            fs.mkdirSync(storageDirectory, { recursive: true });
        }

        const localAbsoluteFilePath = path.join(storageDirectory, `doc_${jobId}.pdf`);
        const writeStream = fs.createWriteStream(localAbsoluteFilePath);

        fileResponse.data.pipe(writeStream);

        // Wait completely for the stream buffer to flush onto Render's physical directory
        await new Promise<void>((resolve, reject) => {
            writeStream.on('finish', () => resolve());
            writeStream.on('error', (err) => reject(err));
        });

        console.log(`[System Worker] Job ${jobId} successfully synchronized onto local storage.`);

        // 5. Finalize database state configuration inside TiDB
        await db.execute(
            'UPDATE document_jobs SET status = ?, file_path = ? WHERE id = ?',
            ['completed', localAbsoluteFilePath, jobId]
        );

    } catch (err: any) {
        console.error(`[System Worker Failure] Error processing job ${jobId}:`, err.message);
        await db.execute(
            'UPDATE document_jobs SET status = ?, error_message = ? WHERE id = ?',
            ['failed', err.message, jobId]
        );
    }
}
