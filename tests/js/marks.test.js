import { afterEach, describe, expect, it, vi } from 'vitest';
import FileChips from '../../js/index.js';
import { chip, chipMarkup, hiddenInputs, mount, removeButton } from './fixtures.js';

describe('mark for removal', () => {
    let destroy = () => {};

    afterEach(() => destroy());

    const start = (markup = chipMarkup(), options) => {
        mount(markup, options);
        destroy = FileChips.init();
        chip().click();
    };

    it('marks: adds a hidden input to the bucket and updates chip and button', () => {
        start();
        const events = [];
        document.addEventListener('file-chips:change', (e) => events.push(e.detail), { once: true });

        removeButton().click();

        const bucket = document.querySelector('[data-file-chips-bucket]');
        expect(hiddenInputs(bucket)).toEqual([['delete_ids[]', '12']]);
        expect(chip().classList.contains('fc-chip--marked')).toBe(true);
        expect(removeButton().getAttribute('aria-pressed')).toBe('true');
        expect(removeButton().textContent.trim()).toBe('Marked');
        expect(events).toEqual([{ id: '12', input: 'delete_ids[]', marked: true }]);
    });

    it('unmarks on second click', () => {
        start();
        removeButton().click();
        removeButton().click();

        expect(hiddenInputs()).toEqual([]);
        expect(chip().classList.contains('fc-chip--marked')).toBe(false);
        expect(removeButton().getAttribute('aria-pressed')).toBe('false');
        expect(removeButton().textContent.trim()).toBe('Remove on save');
    });

    it('falls back to the closest form when there is no bucket', () => {
        start(chipMarkup(), { bucket: false });
        removeButton().click();

        expect(hiddenInputs(document.getElementById('f'))).toEqual([['delete_ids[]', '12']]);
    });

    it('warns and does nothing without a bucket or form', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        start(chipMarkup(), { bucket: false, form: false });
        removeButton().click();

        expect(hiddenInputs()).toEqual([]);
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });

    it('shows marked state when reopened', () => {
        start();
        removeButton().click();
        chip().click();
        chip().click();

        expect(removeButton().getAttribute('aria-pressed')).toBe('true');
        expect(chip().classList.contains('fc-chip--marked')).toBe(true);
    });

    it('handles ids with quotes without breaking lookup', () => {
        start(chipMarkup({ id: 'a"b' }));
        removeButton().click();
        expect(hiddenInputs()).toEqual([['delete_ids[]', 'a"b']]);

        removeButton().click();
        expect(hiddenInputs()).toEqual([]);
    });
});
