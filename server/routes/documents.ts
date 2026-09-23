import { Router } from 'express';
import fs from 'fs';
import { createDownloadJob, getJobStatus } from '../services/queue';

const router = Router();
const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read)\//i;

/**
 * Endpoint 1: Triggers asynchronous background parsing tasks
 */
router.post('/import-document', async (req, res) => {
    const { url } = req.body;

    if (!url || !SCRIBD_REGEX.test(url)) {
        return res.status(400).json({ error: 'Invalid or missing Scribd URL parameter.' });
    }

    try {
        // Enqueue tracking context record into TiDB
        const jobId = await createDownloadJob(url);
        
        // Return success instantly so your frontend can start displaying a loading spinner
        return res.status(202).json({ success: true, jobId, status: 'pending' });
    } catch (error: any) {
        console.error('[Route Error] Failed to submit tracking task:', error.message);
        return res.status(500).json({ error: 'Could not schedule download transaction.' });
    }
});

/**
 * Endpoint 2: Status Polling & Dynamic File Delivery Channel
 */
router.get('/import-status/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await getJobStatus(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Target tracking record not found.' });
        }

        // Handle active processing states
        if (job.status === 'pending' || job.status === 'processing') {
            return res.status(200).json({ status: job.status });
        }

        if (job.status === 'failed') {
            return res.status(500).json({ status: 'failed', error: job.errorMessage });
        }

        // Handle completed processing execution: Stream local file target
        if (job.status === 'completed' && job.filePath) {
            if (!fs.existsSync(job.filePath)) {
                return res.status(410).json({ error: 'Target document cache has expired.' });
            }

            // Expose native attachment metadata overrides to user browser window
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="research-document.pdf"');

            const fileStream = fs.createReadStream(job.filePath);
            fileStream.pipe(res);

            // Housekeeping: Garbage collect local space upon transmission closeout
            fileStream.on('end', () => {
                fs.unlink(job.filePath!, (unlinkErr) => {
                    if (unlinkErr) console.error('[Clean Error] Failed to purge storage:', unlinkErr);
                });
            });
            return;
        }

    } catch (error: any) {
        console.error('[Status Route Error] Failed execution matrix:', error.message);
        return res.status(500).json({ error: 'Internal pipeline validation failed.' });
    }
});

export default router;
