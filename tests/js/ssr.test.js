// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('import without DOM', () => {
    it('does not throw', async () => {
        const module = await import('../../js/index.js');

        expect(Object.keys(module.default)).toEqual(['init', 'open', 'close', 'getOpen', 'position']);
    });
});
