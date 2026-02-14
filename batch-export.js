#!/usr/bin/env node
// Batch-export .montage files to JPGs using Playwright + Edge
// Usage: node batch-export.js ./input-dir/ ./output-dir/

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
};

async function main() {
    const [inputDir, outputDir] = process.argv.slice(2);
    if (!inputDir || !outputDir) {
        console.error('Usage: node batch-export.js <input-dir> <output-dir>');
        process.exit(1);
    }

    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.montage'));
    if (files.length === 0) {
        console.error('No .montage files found in', inputDir);
        process.exit(1);
    }

    fs.mkdirSync(outputDir, { recursive: true });

    // Start a local HTTP server to serve the montage app
    const appDir = __dirname;
    const server = http.createServer((req, res) => {
        const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
        const filePath = path.join(appDir, url);
        const ext = path.extname(filePath);
        try {
            const data = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
            res.end(data);
        } catch {
            res.writeHead(404);
            res.end('Not found');
        }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const appUrl = `http://127.0.0.1:${port}`;
    console.log(`Serving app on ${appUrl}`);

    const browser = await chromium.launch({ channel: 'msedge' });

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const baseName = path.basename(file, '.montage');
            console.log(`[${i + 1}/${files.length}] ${file}`);

            const page = await browser.newPage();
            await page.goto(appUrl, { waitUntil: 'networkidle' });

            // Load the .montage file
            const montageBytes = fs.readFileSync(path.join(inputDir, file));
            await page.evaluate(async (b64) => {
                const binary = atob(b64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                const blob = new Blob([bytes], { type: 'application/octet-stream' });
                const f = new File([blob], 'project.montage');
                await loadProject(f);
            }, montageBytes.toString('base64'));

            // Wait for progress modal to disappear (loading complete)
            await page.waitForFunction(() => !document.querySelector('.progress-modal'), { timeout: 60000 });

            // Mock showSaveFilePicker and export
            const dataUrl = await page.evaluate(async () => {
                let capturedBlob;
                window.showSaveFilePicker = async () => ({
                    createWritable: async () => ({
                        write: async (blob) => { capturedBlob = blob; },
                        close: async () => {},
                    }),
                });
                await exportCanvas();
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(capturedBlob);
                });
            });

            // Write the JPG
            const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
            const outPath = path.join(outputDir, `${baseName}.jpg`);
            fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
            console.log(`  → ${outPath}`);

            await page.close();
        }
    } finally {
        await browser.close();
        server.close();
    }

    console.log(`Done! Exported ${files.length} file(s).`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
