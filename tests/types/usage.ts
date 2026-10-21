// Compiled by `npm run typecheck` (tsc --noEmit); never run.
import FileChips, { type FileChipChangeDetail } from '@ozankurt/file-chips';

const stop: () => void = FileChips.init({ root: document.body });
stop();

const chip = document.querySelector<HTMLElement>('[data-file-chip]')!;
const popover: HTMLElement | null = FileChips.open(chip);
void popover;
FileChips.close();

document.addEventListener('file-chips:change', (event) => {
    const detail: FileChipChangeDetail = event.detail;
    const marked: boolean = detail.marked;
    void marked;
});

// @ts-expect-error root must be an element or the document
FileChips.init({ root: '#form' });
