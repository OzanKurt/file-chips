import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chip, chipMarkup, mount, popover } from './fixtures.js';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const pkg = JSON.parse(read('package.json'));
const require = createRequire(resolve(root, 'package.json'));

describe('published package', () => {
    it('main entry exposes the API to CommonJS resolvers', () => {
        expect(Object.keys(require(`./${pkg.main}`))).toEqual(['init', 'open', 'close', 'getOpen', 'position']);
    });

    it('script build sets window.FileChips and starts on the document', () => {
        mount(chipMarkup());
        delete window.FileChips;

        window.eval(read('dist/file-chips.min.js'));
        chip().click();

        expect(typeof window.FileChips.init).toBe('function');
        expect(popover().hidden).toBe(false);
        window.FileChips.close();
    });

    it('ships the stylesheet in plain and minified form', () => {
        expect(read('dist/file-chips.css')).toContain('--fc-chip-bg');
        expect(read('dist/file-chips.min.css')).toContain('.fc-chip--marked');
    });
});
