/**
 * The README's images, captured from examples/showcase.html.
 *
 * Run with `npm run screenshots`. Starts the examples server through Vite's
 * Node API, opens each scene with Playwright and writes PNGs into docs/images/,
 * clipped to the form. Fixed viewport, deviceScaleFactor 2, reduced motion and
 * animations disabled, and every wait is a condition.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'docs/images');
const VIEWPORT = { width: 1100, height: 900 };
const PAD = 16;

const SHOTS = [
    { file: 'popover-light.png', query: 'scheme=light&scene=popover', scheme: 'light' },
    { file: 'marked-light.png', query: 'scheme=light&scene=marked', scheme: 'light' },
    { file: 'popover-dark.png', query: 'scheme=dark&scene=popover', scheme: 'dark' },
];

const server = await createServer({ configFile: resolve(root, 'vite.examples.config.js'), logLevel: 'warn' });
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, '');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const page = await context.newPage();

mkdirSync(outDir, { recursive: true });

try {
    for (const shot of SHOTS) {
        await page.emulateMedia({ colorScheme: shot.scheme, reducedMotion: 'reduce' });
        await page.goto(`${base}/showcase.html?${shot.query}`, { waitUntil: 'load' });
        await page.locator('body[data-ready="true"]').waitFor();

        // The form plus the open popover, which may hang below it.
        const boxes = [await page.locator('form').boundingBox(), await page.locator('.fc-popover:not([hidden])').boundingBox()].filter(Boolean);
        const x = Math.min(...boxes.map((b) => b.x)) - PAD;
        const y = Math.min(...boxes.map((b) => b.y)) - PAD;
        const right = Math.max(...boxes.map((b) => b.x + b.width)) + PAD;
        const bottom = Math.max(...boxes.map((b) => b.y + b.height)) + PAD;

        const png = await page.screenshot({ clip: { x, y, width: right - x, height: bottom - y }, animations: 'disabled', caret: 'hide' });
        writeFileSync(resolve(outDir, shot.file), png);
        console.log(`${shot.file.padEnd(20)} ${(png.length / 1024).toFixed(1)} KB`);
    }
} finally {
    await browser.close();
    await server.close();
}
