import { crypto } from 'crypto';
// Assuming you have a database pool exported. Replace with your actual TiDB client connection
import { db } from '../config/database'; 

export interface DownloadJob {
    id: string;
    scribdUrl: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    filePath?: string;
    errorMessage?: string;
}

/**
 * Initializes a new document download transaction inside TiDB
 */
export async function createDownloadJob(scribdUrl: string): Promise<string> {
    const jobId = crypto.randomUUID();
    
    await db.execute(
        'INSERT INTO document_jobs (id, scribd_url, status) VALUES (?, ?, ?)',
        [jobId, scribdUrl, 'pending']
    );

    // Fire-and-forget: Trigger the background worker process asynchronously
    // This allows Express to instantly respond to the frontend client
    processWorkerTask(jobId).catch(err => 
        console.error(`[Queue Trigger Error] Fatal breakdown for job ${jobId}:`, err)
    );

    return jobId;
}

/**
 * Polling checker to fetch current job matrix details from TiDB
 */
export async function getJobStatus(jobId: string): Promise<DownloadJob | null> {
    const [rows]: any = await db.execute('SELECT * FROM document_jobs WHERE id = ?', [jobId]);
    if (!rows || rows.length === 0) return null;
    
    const job = rows[0];
    return {
        id: job.id,
        scribdUrl: job.scribd_url,
        status: job.status,
        filePath: job.file_path,
        errorMessage: job.error_message
    };
}

// Background worker wrapper imported in the next step
import { processWorkerTask } from '../workers/downloadWorker';
