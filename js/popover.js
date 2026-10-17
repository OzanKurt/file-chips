/**
 * Popover open/close state and viewport-aware positioning.
 *
 * Popovers stay in place in the DOM, next to their chip, so they inherit the
 * chip container's CSS variables, follow it in tab order, and disappear with
 * it when the page re-renders. They are position: fixed; position() corrects
 * for ancestors (transforms, filters) that move the fixed origin.
 */

const GAP = 8;
const EDGE = 8;

let openPopover = null;
let openChip = null;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const popoverFor = (chip) => chip.ownerDocument.getElementById(chip.dataset.fileChip);

/**
 * Place the popover below the chip, flip it above when there is no room,
 * and keep it inside the viewport.
 */
const position = (chip, popover) => {
    const rect = chip.getBoundingClientRect();
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;

    let top = rect.bottom + GAP;
    const left = clamp(rect.left, EDGE, Math.max(EDGE, window.innerWidth - width - EDGE));

    if (top + height > window.innerHeight) {
        const above = rect.top - height - GAP;
        if (above >= EDGE) {
            top = above;
        }
    }

    top = clamp(top, EDGE, window.innerHeight - height - EDGE);

    // Where does (0, 0) land? Non-zero when a transformed ancestor becomes
    // the containing block of this fixed element.
    popover.style.top = '0px';
    popover.style.left = '0px';
    const origin = popover.getBoundingClientRect();

    popover.style.top = `${Math.round(top - origin.top)}px`;
    popover.style.left = `${Math.round(left - origin.left)}px`;
};

/**
 * Close the open popover. With restoreFocus, focus that was inside the
 * popover goes back to its chip.
 */
const close = ({ restoreFocus = false } = {}) => {
    if (!openPopover) {
        return;
    }

    const popover = openPopover;
    const chip = openChip;
    const hadFocus = popover.contains(popover.ownerDocument.activeElement);

    popover.hidden = true;
    chip?.setAttribute('aria-expanded', 'false');
    openPopover = null;
    openChip = null;

    if (restoreFocus && hadFocus) {
        chip?.focus();
    }
};

/**
 * Open the popover that belongs to a chip. Returns the popover, or null when
 * the chip has none.
 */
const open = (chip) => {
    close();

    const popover = popoverFor(chip);
    if (!popover) {
        return null;
    }

    popover.hidden = false;
    chip.setAttribute('aria-expanded', 'true');
    openPopover = popover;
    openChip = chip;

    position(chip, popover);
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => openPopover === popover && position(chip, popover));
    }

    return popover;
};

const getOpen = () => openPopover;

const getOpenChip = () => openChip;

export { open, close, getOpen, getOpenChip, position, popoverFor };
