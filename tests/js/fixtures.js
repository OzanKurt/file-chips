export const chipMarkup = ({ id = '12', popover = 'pop-12', input = 'delete_ids[]' } = {}) => {
    const safeId = id.replace(/"/g, '&quot;');

    return `
    <button type="button" class="fc-chip" data-file-chip="${popover}">file-${safeId}.pdf</button>
    <div id="${popover}" class="fc-popover" data-file-chip-popover hidden>
        <button type="button" class="fc-btn" data-file-chip-remove
                data-file-chip-id="${safeId}" data-file-chip-input="${input}"
                data-label-marked="Marked" data-label-unmarked="Remove on save" aria-pressed="false">
            <span data-file-chip-remove-label>Remove on save</span>
        </button>
    </div>`;
};

export const mount = (inner, { bucket = true, form = true } = {}) => {
    const chips = `<div class="fc-chips" data-file-chips>${bucket ? '<div data-file-chips-bucket hidden></div>' : ''}${inner}</div>`;
    document.body.innerHTML = form ? `<form id="f">${chips}</form>` : chips;
};

export const chip = (popover = 'pop-12') => document.querySelector(`[data-file-chip="${popover}"]`);
export const popover = (id = 'pop-12') => document.getElementById(id);
export const removeButton = (id = 'pop-12') => popover(id).querySelector('[data-file-chip-remove]');
export const hiddenInputs = (root = document) => [...root.querySelectorAll('input[type="hidden"]')].map((i) => [i.name, i.value]);
export const mousedown = (el) => el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
export const key = (k) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
