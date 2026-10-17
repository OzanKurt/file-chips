/**
 * Mark-for-removal: toggles a hidden input carrying the file id so the
 * server can delete the file when the form is saved.
 */

const DEFAULT_MARKED = 'Marked';
const DEFAULT_UNMARKED = 'Remove on save';

/**
 * The element hidden inputs go into: the [data-file-chips-bucket] of the
 * chip's [data-file-chips] container, otherwise the chip's form.
 */
const targetFor = (chip) => chip.closest('[data-file-chips]')?.querySelector('[data-file-chips-bucket]') ?? chip.closest('form');

// Compare in JS instead of building a CSS selector, so ids and input
// names containing quotes or brackets cannot break the lookup.
const findInput = (target, name, id) => [...target.querySelectorAll('input[type="hidden"]')]
    .find((input) => input.name === name && input.value === id) ?? null;

const render = (chip, button, marked) => {
    chip.classList.toggle('fc-chip--marked', marked);
    button.classList.toggle('fc-btn--active', marked);
    button.setAttribute('aria-pressed', String(marked));

    const label = button.querySelector('[data-file-chip-remove-label]') ?? button;
    label.textContent = marked
        ? (button.dataset.labelMarked ?? DEFAULT_MARKED)
        : (button.dataset.labelUnmarked ?? DEFAULT_UNMARKED);
};

const buttonIn = (popover) => popover.querySelector('[data-file-chip-remove]');

/**
 * Reflect the current mark state of a chip in its popover button.
 */
const sync = (chip, popover) => {
    const button = buttonIn(popover);
    const target = targetFor(chip);
    if (!button || !target) {
        return;
    }

    render(chip, button, findInput(target, button.dataset.fileChipInput, button.dataset.fileChipId) !== null);
};

/**
 * Toggle the mark of the chip whose popover holds this button.
 */
const toggle = (chip, button) => {
    const target = targetFor(chip);
    if (!target) {
        console.warn('[FileChips] No [data-file-chips-bucket] or <form> found for this chip; cannot mark it for removal.');
        return;
    }

    const name = button.dataset.fileChipInput;
    const id = button.dataset.fileChipId;
    const existing = findInput(target, name, id);

    if (existing) {
        existing.remove();
    } else {
        const input = chip.ownerDocument.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = id;
        target.appendChild(input);
    }

    const marked = !existing;
    render(chip, button, marked);
    chip.dispatchEvent(new CustomEvent('file-chips:change', { bubbles: true, detail: { id, input: name, marked } }));
};

export { sync, toggle };
