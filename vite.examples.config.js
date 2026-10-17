import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Serves examples/ with the package aliased at its sources, so changes show on reload.
export default defineConfig({
    root: resolve(import.meta.dirname, 'examples'),
    resolve: {
        alias: {
            '@ozankurt/file-chips/style.css': resolve(import.meta.dirname, 'css/file-chips.css'),
            '@ozankurt/file-chips': resolve(import.meta.dirname, 'js/index.js'),
        },
    },
    server: { port: 5183, strictPort: true },
});
