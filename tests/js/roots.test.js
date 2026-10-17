import { afterEach, describe, expect, it } from 'vitest';
import FileChips from '../../js/index.js';
import { chipMarkup, hiddenInputs, key } from './fixtures.js';

const twoGroups = () => {
    document.body.innerHTML = `
        <form id="a"><div data-file-chips id="root-a"><div data-file-chips-bucket hidden></div>${chipMarkup({ id: '1', popover: 'pop-1' })}</div></form>
        <form id="b"><div data-file-chips id="root-b"><div data-file-chips-bucket hidden></div>${chipMarkup({ id: '2', popover: 'pop-2' })}</div></form>`;
};

const chipOf = (n) => document.querySelector(`[data-file-chip="pop-${n}"]`);
const pop = (n) => document.getElementById(`pop-${n}`);

describe('multiple roots', () => {
    let stops = [];

    afterEach(() => {
        stops.forEach((stop) => stop());
        stops = [];
    });

    it('marks once with two separate roots', () => {
        twoGroups();
        stops.push(FileChips.init({ root: document.getElementById('root-a') }));
        stops.push(FileChips.init({ root: document.getElementById('root-b') }));

        chipOf(1).click();
        pop(1).querySelector('[data-file-chip-remove]').click();

        expect(hiddenInputs(document.getElementById('a'))).toEqual([['delete_ids[]', '1']]);
    });

    it('opens with overlapping roots', () => {
        twoGroups();
        stops.push(FileChips.init());
        stops.push(FileChips.init({ root: document.getElementById('root-a') }));

        chipOf(1).click();

        expect(pop(1).hidden).toBe(false);
    });

    it('keeps other roots working after one is destroyed', () => {
        twoGroups();
        const stopA = FileChips.init({ root: document.getElementById('root-a') });
        stops.push(FileChips.init({ root: document.getElementById('root-b') }));
        stopA();

        chipOf(2).click();
        key('Escape');

        expect(pop(2).hidden).toBe(true);
    });

    it('ignores chips outside every root', () => {
        twoGroups();
        stops.push(FileChips.init({ root: document.getElementById('root-a') }));

        chipOf(2).click();

        expect(pop(2).hidden).toBe(true);
    });

    it('destroying a root closes only its own popover', () => {
        twoGroups();
        const stopA = FileChips.init({ root: document.getElementById('root-a') });
        stops.push(FileChips.init({ root: document.getElementById('root-b') }));

        chipOf(2).click();
        stopA();

        expect(pop(2).hidden).toBe(false);
    });
});
