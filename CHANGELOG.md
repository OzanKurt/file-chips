# Changelog

## 1.1.0

- `@fileChipsStyles` and `@fileChipsScripts` add the published file's modification time as `?v=`, and the script tag carries the Vite CSP nonce.
- TypeScript declarations (`dist/file-chips.d.ts`), including the `file-chips:change` event.
- CI tests Laravel 11, 12 and 13.

## 1.0.0

- Initial release: framework-free file chips with a preview popover and mark-for-removal (`@ozankurt/file-chips` on npm), and a Laravel `<x-file-chips>` Blade component with optional Spatie Media Library support (`ozankurt/laravel-file-chips`).
