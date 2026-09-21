import { Router } from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

puppeteer.use(StealthPlugin());
const router = Router();
const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read)\//i;

router.post('/import-document', async (req, res) => {
  const { url } = req.body;
  if (!SCRIBD_REGEX.test(url)) return res.status(400).json({ error: 'Invalid Scribd URL' });

  let browser;
  let downloadUrl: string | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // THIS IS WHERE IT GOES TO vdownloaders.com:
    await page.goto('https://scribd.vdownloaders.com/', { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('input[name="url"]', { timeout: 10000 });
    await page.type('input[name="url"]', url);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    await page.waitForFunction(
      () => document.body.innerText.includes('Succès') || document.querySelector('.download-section, .btn-download, a[href*="download"]'),
      { timeout: 20000 }
    );

    await setTimeout(3000);

    downloadUrl = await page.evaluate(() => {
      const selectors = ['a.btn-download[href]', '.download-section a[href]', 'a[download][href]', 'a[href*=".pdf"]', '.btn-primary[href]'];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el?.href) return el.href;
      }
      const links = Array.from(document.querySelectorAll('a'));
      const dl = links.find(a => a.textContent?.toLowerCase().includes('download'));
      return dl?.href || null;
    });

    if (!downloadUrl) throw new Error('Download link not found');

    await browser.close();
    browser = null;

    const file = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0', 'Accept': 'application/pdf,*/*' },
      maxContentLength: 50 * 1024 * 1024
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(Buffer.from(file.data));

  } catch (err) {
    if (browser) await browser.close();
    if (downloadUrl) {
      return res.status(200).json({ fallback: true, message: 'Auto-download blocked. Click below.', externalUrl: downloadUrl });
    }
    res.status(500).json({ error: 'Import failed' });
  }
});

export default router;
