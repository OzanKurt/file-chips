import FileChips from '@ozankurt/file-chips';
import '@ozankurt/file-chips/style.css';

const params = new URLSearchParams(location.search);
const scheme = params.get('scheme') ?? 'light';
const scene = params.get('scene') ?? 'popover';

document.documentElement.dataset.scheme = scheme;

// A receipt drawn on a canvas, so the page needs no image files and looks the same every run.
const receiptThumb = () => {
    const canvas = Object.assign(document.createElement('canvas'), { width: 160, height: 160 });
    const g = canvas.getContext('2d');
    g.fillStyle = '#eef0f3';
    g.fillRect(0, 0, 160, 160);
    g.fillStyle = '#ffffff';
    g.fillRect(40, 14, 80, 132);
    g.fillStyle = '#9aa3b2';
    [30, 44, 58, 72, 86, 100].forEach((y, i) => g.fillRect(50, y, i % 2 ? 40 : 60, 5));
    g.fillStyle = '#1b2330';
    g.fillRect(50, 118, 60, 8);

    return canvas.toDataURL('image/png');
};

const files = [
    { id: 41, name: 'hotel-invoice-rotterdam.pdf', ext: 'pdf', size: '214 KB', added: 'Added 16 Oct 2026 18:42', excerpt: 'Hotel New Harbour, 2 nights, breakfast included. VAT 9%.' },
    { id: 42, name: 'train-ticket-ns.png', ext: 'png', size: '1.2 MB', added: 'Added 14 Oct 2026 07:15', thumb: receiptThumb() },
    { id: 43, name: 'client-dinner-receipt.jpg', ext: 'jpg', size: '846 KB', added: 'Added 15 Oct 2026 22:03', thumb: receiptThumb(), excerpt: 'Dinner with two attendees from Halvorsen AS.' },
    { id: 44, name: 'taxi-receipts.zip', ext: 'zip', size: '3.4 MB', added: 'Added 16 Oct 2026 19:10' },
    { id: 45, name: 'mileage-log.xlsx', ext: 'xlsx', size: '38 KB', added: 'Added 16 Oct 2026 19:12' },
    { id: 46, name: 'visit-report.docx', ext: 'docx', size: '127 KB', added: 'Added 17 Oct 2026 09:30' },
];

const escape = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// The same markup <x-file-chips :files="..." input="delete_media_ids[]" id-prefix="claim" /> renders.
const markup = files.map((file, index) => {
    const id = `claim-${index}`;
    const thumb = file.thumb ? `<img src="${file.thumb}" alt="">` : `<span class="fc-chip__ext">${file.ext}</span>`;

    return `
        <button type="button" class="fc-chip" data-file-chip="${id}" aria-controls="${id}" aria-expanded="false" title="${escape(file.name)}">
            <span class="fc-chip__ext">${file.ext}</span>
            <span class="fc-chip__name">${escape(file.name)}</span>
        </button>
        <div id="${id}" class="fc-popover" data-file-chip-popover hidden>
            <div class="fc-popover__head">
                <div class="fc-thumb">${thumb}</div>
                <div class="fc-popover__info">
                    <div class="fc-popover__title">${escape(file.name)}</div>
                    <div class="fc-popover__meta"><span>${file.ext.toUpperCase()}</span><span>${file.size}</span><span>${file.added}</span></div>
                </div>
            </div>
            ${file.excerpt ? `<div class="fc-popover__excerpt">${escape(file.excerpt)}</div>` : ''}
            <div class="fc-popover__actions">
                <a href="#" class="fc-btn fc-btn--primary">View</a>
                <a href="#" class="fc-btn fc-btn--outline">Download</a>
                <button type="button" class="fc-btn fc-btn--danger" data-file-chip-remove data-file-chip-id="${file.id}"
                        data-file-chip-input="delete_media_ids[]" data-label-marked="Marked" data-label-unmarked="Remove on save" aria-pressed="false">
                    <span data-file-chip-remove-label>Remove on save</span>
                </button>
            </div>
        </div>`;
}).join('');

document.querySelector('[data-file-chips]').insertAdjacentHTML('beforeend', markup);
FileChips.init();

const chip = (index) => document.querySelector(`[data-file-chip="claim-${index}"]`);

const scenes = {
    popover: () => chip(2).click(),
    marked: () => {
        chip(3).click();
        document.querySelector('#claim-3 [data-file-chip-remove]').click();
        chip(0).click();
        document.querySelector('#claim-0 [data-file-chip-remove]').click();
    },
};

scenes[scene]();

document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.dataset.ready = 'true';
})));
