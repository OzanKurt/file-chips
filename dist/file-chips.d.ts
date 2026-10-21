// Type declarations for @ozankurt/file-chips.

export interface InitOptions {
    /** Handle chips inside this element only. Default: the whole document. */
    root?: Document | Element;
}

/** Detail of the bubbling `file-chips:change` event dispatched on a chip. */
export interface FileChipChangeDetail {
    id: string;
    input: string;
    marked: boolean;
}

/**
 * Start handling chips inside `root`. A root that is already handled, itself
 * or through an ancestor, is a no-op. Returns a function that stops handling it.
 */
export declare function init(options?: InitOptions): () => void;
export declare function close(): void;
export declare function getOpen(): HTMLElement | null;
export declare function position(chip: HTMLElement, popover: HTMLElement): void;

declare const FileChips: {
    init: typeof init;
    /** Open a chip's popover; returns the popover, or null when it has none. */
    open(chip: HTMLElement): HTMLElement | null;
    close: typeof close;
    getOpen: typeof getOpen;
    position: typeof position;
};

export default FileChips;

declare global {
    interface HTMLElementEventMap {
        'file-chips:change': CustomEvent<FileChipChangeDetail>;
    }

    interface DocumentEventMap {
        'file-chips:change': CustomEvent<FileChipChangeDetail>;
    }
}
