import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import FileChips from '../../js/index.js';
import { chip, chipMarkup, key, mount, mousedown, popover } from './fixtures.js';

describe('popover', () => {
    let destroy;

    beforeEach(() => {
        mount(chipMarkup() + chipMarkup({ id: '13', popover: 'pop-13' }));
        destroy = FileChips.init();
    });

    afterEach(() => destroy());

    it('opens the chip popover on click and keeps it next to the chip', () => {
        const parent = popover().parentElement;
        chip().click();

        expect(popover().hidden).toBe(false);
        expect(popover().parentElement).toBe(parent);
        expect(chip().getAttribute('aria-expanded')).toBe('true');
        expect(FileChips.getOpen()).toBe(popover());
    });

    it('closes when the same chip is clicked again', () => {
        chip().click();
        chip().click();

        expect(popover().hidden).toBe(true);
        expect(chip().getAttribute('aria-expanded')).toBe('false');
        expect(FileChips.getOpen()).toBeNull();
    });

    it('switches to another chip popover', () => {
        chip().click();
        chip('pop-13').click();

        expect(popover().hidden).toBe(true);
        expect(popover('pop-13').hidden).toBe(false);
    });

    it('closes on outside mousedown but not inside the popover', () => {
        chip().click();

        mousedown(popover());
        expect(popover().hidden).toBe(false);

        mousedown(document.body);
        expect(popover().hidden).toBe(true);
    });

    it('closes on Escape', () => {
        chip().click();
        key('Escape');

        expect(popover().hidden).toBe(true);
    });

    it('returns focus to the chip when Escape closes a focused popover', () => {
        chip().click();
        popover().querySelector('button').focus();
        key('Escape');

        expect(document.activeElement).toBe(chip());
    });

    it('has no dialog role, it is a disclosure', () => {
        chip().click();

        expect(popover().getAttribute('role')).toBeNull();
    });

    it('stops listening after destroy', () => {
        destroy();
        chip().click();

        expect(popover().hidden).toBe(true);
        destroy = () => {};
    });

    it('does not double-bind when init runs twice', () => {
        const second = FileChips.init();
        chip().click();

        expect(popover().hidden).toBe(false);
        second();
    });
});

describe('positioning', () => {
    const rect = (top, left, height = 20) => ({ top, left, bottom: top + height, right: left + 100, width: 100, height });

    beforeEach(() => {
        mount(chipMarkup());
        Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
        Object.defineProperty(popover(), 'offsetWidth', { value: 300, configurable: true });
        Object.defineProperty(popover(), 'offsetHeight', { value: 200, configurable: true });
    });

    it('places the popover 8px below the chip', () => {
        chip().getBoundingClientRect = () => rect(100, 50);
        FileChips.position(chip(), popover());

        expect(popover().style.top).toBe('128px');
        expect(popover().style.left).toBe('50px');
    });

    it('flips above when there is no room below', () => {
        chip().getBoundingClientRect = () => rect(700, 50);
        FileChips.position(chip(), popover());

        expect(popover().style.top).toBe('492px');
    });

    it('compensates when a transformed ancestor moves the fixed origin', () => {
        chip().getBoundingClientRect = () => rect(100, 50);
        popover().getBoundingClientRect = () => (popover().style.top === '0px' ? { top: 50, left: 30 } : { top: 0, left: 0 });
        FileChips.position(chip(), popover());

        expect(popover().style.top).toBe('78px');
        expect(popover().style.left).toBe('20px');
    });

    it('shifts left to stay inside the viewport', () => {
        chip().getBoundingClientRect = () => rect(100, 900);
        FileChips.position(chip(), popover());

        expect(popover().style.left).toBe('692px');
    });
});
