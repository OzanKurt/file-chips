<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use OzanKurt\FileChips\FileChip;

function render(string $template, array $data = []): string
{
    return Blade::render($template, $data);
}

$files = fn () => [
    ['id' => 1, 'name' => 'contract.pdf', 'size' => 2048, 'view_url' => '/v/1', 'download_url' => '/d/1'],
    FileChip::fromArray(['id' => 2, 'name' => 'scan.png', 'thumb_url' => '/t/2']),
];

it('renders a chip and popover per file following the JS contract', function () use ($files) {
    $html = render('<x-file-chips :files="$files" id-prefix="docs" />', ['files' => $files()]);

    expect($html)
        ->toContain('data-file-chips')
        ->toContain('data-file-chip="docs-0"')
        ->toContain('id="docs-0"')
        ->toContain('data-file-chip-popover')
        ->toContain('data-file-chip="docs-1"')
        ->not->toContain('role="dialog"')
        ->toContain('contract.pdf')
        ->toContain('href="/v/1"')
        ->toContain('href="/d/1"')
        ->toContain('src="/t/2"')
        ->toContain('aria-expanded="false"');
});

it('renders the remove button and bucket only when an input name is given', function () use ($files) {
    $without = render('<x-file-chips :files="$files" />', ['files' => $files()]);
    $with = render('<x-file-chips :files="$files" input="delete_ids[]" />', ['files' => $files()]);

    expect($without)->not->toContain('data-file-chip-remove')->not->toContain('data-file-chips-bucket')
        ->and($with)->toContain('data-file-chip-remove')
        ->toContain('data-file-chip-input="delete_ids[]"')
        ->toContain('data-file-chip-id="1"')
        ->toContain('data-file-chips-bucket')
        ->toContain('data-label-marked="Marked"')
        ->toContain('Remove on save');
});

it('escapes file names', function () {
    $html = render('<x-file-chips :files="$files" />', ['files' => [['id' => 1, 'name' => '<script>alert(1)</script>.pdf']]]);

    expect($html)->not->toContain('<script>alert(1)</script>')
        ->toContain('&lt;script&gt;');
});

it('uses configured icon classes instead of the extension badge', function () {
    config(['file-chips.icons' => ['pdf' => 'far fa-file-pdf']]);

    $html = render('<x-file-chips :files="$files" />', ['files' => [['id' => 1, 'name' => 'a.pdf'], ['id' => 2, 'name' => 'b.zip']]]);

    expect($html)->toContain('class="fc-chip__icon far fa-file-pdf"')
        ->toContain('<span class="fc-chip__ext">zip</span>');
});

it('renders nothing for an empty list', function () {
    expect(trim(render('<x-file-chips :files="[]" />')))->toBe('');
});

it('uses translated labels', function () {
    app('translator')->addLines(['messages.remove' => 'Beim Speichern entfernen'], 'de', 'file-chips');
    app()->setLocale('de');

    $html = render('<x-file-chips :files="$files" input="d[]" />', ['files' => [['id' => 1, 'name' => 'a.pdf']]]);

    expect($html)->toContain('Beim Speichern entfernen');
});

it('outputs asset tags from the directives', function () {
    expect(render('@fileChipsStyles'))->toContain('<link rel="stylesheet" href="'.asset('vendor/file-chips/file-chips.min.css'))
        ->and(render('@fileChipsScripts'))->toContain('<script src="'.asset('vendor/file-chips/file-chips.min.js'));
});

it('publishes the built assets', function () {
    $paths = \Illuminate\Support\ServiceProvider::pathsToPublish(\OzanKurt\FileChips\FileChipsServiceProvider::class, 'file-chips-assets');

    expect(array_values($paths))->toBe([public_path('vendor/file-chips')]);
});

it('gives every file its own popover id even when ids sanitise alike', function () {
    $html = render('<x-file-chips :files="$files" id-prefix="p" />', ['files' => [['id' => 'a.b', 'name' => 'x'], ['id' => 'a-b', 'name' => 'y']]]);

    expect($html)->toContain('id="p-0"')->toContain('id="p-1"');
});

it('derives the same default prefix for the same files', function () {
    $template = '<x-file-chips :files="$files" input="d[]" />';
    $files = [['id' => 1, 'name' => 'a.pdf']];

    preg_match('/data-file-chip="([^"]+)"/', render($template, ['files' => $files]), $first);
    preg_match('/data-file-chip="([^"]+)"/', render($template, ['files' => $files]), $second);

    expect($first[1])->toBe($second[1])->toStartWith('fc-');
});

it('passes an id attribute through to the wrapper', function () {
    expect(render('<x-file-chips :files="$files" id="attachments" />', ['files' => [['id' => 1, 'name' => 'a.pdf']]]))
        ->toContain('id="attachments"');
});
