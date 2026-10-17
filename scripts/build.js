import { build } from 'esbuild';
import { copyFileSync, mkdirSync, statSync } from 'node:fs';

mkdirSync('dist/esm', { recursive: true });

const outputs = [
    // Script tag builds: set window.FileChips and auto-start
    { entryPoints: ['js/browser.js'], outfile: 'dist/file-chips.js', format: 'iife', platform: 'browser', sourcemap: 'linked' },
    { entryPoints: ['js/browser.js'], outfile: 'dist/file-chips.min.js', format: 'iife', platform: 'browser', minify: true, sourcemap: 'linked' },
    // Module builds: no side effects, call init() yourself
    { entryPoints: ['js/index.js'], outfile: 'dist/esm/file-chips.mjs', format: 'esm', platform: 'neutral', sourcemap: 'linked' },
    { entryPoints: ['js/index.js'], outfile: 'dist/file-chips.cjs', format: 'cjs', platform: 'node', footer: { js: 'module.exports = module.exports.default;' } },
    // Stylesheet
    { entryPoints: ['css/file-chips.css'], outfile: 'dist/file-chips.min.css', minify: true },
];

await Promise.all(outputs.map(({ entryPoints, ...options }) => build({ entryPoints, bundle: true, ...options })));
copyFileSync('css/file-chips.css', 'dist/file-chips.css');

for (const file of [...outputs.map((o) => o.outfile), 'dist/file-chips.css']) {
    console.log(`${file}  ${(statSync(file).size / 1024).toFixed(1)} KB`);
}
