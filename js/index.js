/**
 * File Chips
 *
 * Compact file chips with a preview popover and mark-for-removal.
 * Markup contract (see README):
 *   [data-file-chips]             container
 *   [data-file-chips-bucket]      optional element that receives hidden inputs
 *   [data-file-chip="<id>"]       chip, points at its popover by id
 *   [data-file-chip-popover]      popover panel (starts hidden)
 *   [data-file-chip-remove]       toggle button with data-file-chip-id and data-file-chip-input
 */

import { close, getOpen, getOpenChip, open, position } from './popover.js';
import { sync, toggle } from './marks.js';

// One set of document listeners per document, shared by every root on it,
// so several roots never handle the same event twice.
const documents = new Map();

const handled = (doc, element) => [...(documents.get(doc)?.roots ?? [])].some((root) => root.contains(element));

const openWithState = (chip) => {
    const popover = open(chip);
    if (popover) {
        sync(chip, popover);
    }

    return popover;
};

const listenersFor = (doc) => ({
    click(event) {
        const target = event.target;

        const remove = target.closest?.('[data-file-chip-remove]');
        if (remove && getOpen()?.contains(remove)) {
            toggle(getOpenChip(), remove);
            return;
        }

        const chip = target.closest?.('[data-file-chip]');
        if (!chip || !handled(doc, chip)) {
            return;
        }

        event.preventDefault();

        if (getOpenChip() === chip) {
            close();
        } else {
            openWithState(chip);
        }
    },

    mousedown(event) {
        const popover = getOpen();
        if (popover && !popover.contains(event.target) && !event.target.closest?.('[data-file-chip]')) {
            close();
        }
    },

    keydown(event) {
        if (event.key === 'Escape' && getOpen()) {
            close({ restoreFocus: true });
        }
    },

    reposition() {
        const popover = getOpen();
        if (popover) {
            position(getOpenChip(), popover);
        }
    },
});

const listen = (doc, listeners, method) => {
    doc[method]('click', listeners.click);
    doc[method]('mousedown', listeners.mousedown);
    doc[method]('keydown', listeners.keydown);
    doc.defaultView?.[method]('resize', listeners.reposition);
    doc.defaultView?.[method]('scroll', listeners.reposition, true);
};

/**
 * Start handling chips inside `root` (default: the whole document). A root
 * that is already handled, itself or through an ancestor, is a no-op.
 * Returns a function that stops handling this root.
 */
const init = ({ root = document } = {}) => {
    const doc = root.ownerDocument ?? root;

    if (handled(doc, root)) {
        return () => {};
    }

    if (!documents.has(doc)) {
        const listeners = listenersFor(doc);
        documents.set(doc, { roots: new Set(), listeners });
        listen(doc, listeners, 'addEventListener');
    }

    const entry = documents.get(doc);
    entry.roots.add(root);

    return () => {
        if (!entry.roots.delete(root)) {
            return;
        }

        if (getOpenChip() && root.contains(getOpenChip())) {
            close();
        }

        if (entry.roots.size === 0) {
            listen(doc, entry.listeners, 'removeEventListener');
            documents.delete(doc);
        }
    };
};

const FileChips = {
    init,
    open: openWithState,
    close: () => close(),
    getOpen,
    position,
};

export { init, close, getOpen, position };
export default FileChips;
