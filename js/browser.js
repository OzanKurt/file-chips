/**
 * Script-tag entry: exposes window.FileChips and starts it on the whole
 * document once the DOM is ready. Add data-manual to the <script> tag to
 * skip the automatic start and call FileChips.init() yourself.
 */

import FileChips from './index.js';

window.FileChips = FileChips;

const script = document.currentScript;

if (!script?.hasAttribute('data-manual')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => FileChips.init(), { once: true });
    } else {
        FileChips.init();
    }
}
