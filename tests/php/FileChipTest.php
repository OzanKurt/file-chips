<?php

declare(strict_types=1);

use Illuminate\Support\Carbon;
use OzanKurt\FileChips\FileChip;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

function media(array $attributes = []): Media
{
    $media = new Media;
    $media->forceFill(array_merge([
        'id' => 7,
        'uuid' => 'b7f0c6a2-1111-4c1e-9d1e-000000000007',
        'model_type' => 'App\\Models\\Post',
        'model_id' => 1,
        'collection_name' => 'documents',
        'name' => 'report',
        'file_name' => 'report.pdf',
        'mime_type' => 'application/pdf',
        'disk' => 'public',
        'conversions_disk' => 'public',
        'size' => 2048,
        'manipulations' => [],
        'custom_properties' => ['summary' => 'Quarterly numbers'],
        'generated_conversions' => [],
        'responsive_images' => [],
        'created_at' => Carbon::parse('2026-10-01 09:30:00'),
    ], $attributes));
    $media->exists = true;

    return $media;
}

it('builds a chip from an array', function () {
    $chip = FileChip::fromArray([
        'id' => 3,
        'name' => 'photo.JPG',
        'size' => 1536,
        'view_url' => '/files/3',
    ]);

    expect($chip->id)->toBe('3')
        ->and($chip->name)->toBe('photo.JPG')
        ->and($chip->extension)->toBe('jpg')
        ->and($chip->size)->toBe('1.5 KB')
        ->and($chip->viewUrl)->toBe('/files/3')
        ->and($chip->downloadUrl)->toBe('/files/3')
        ->and($chip->isImage)->toBeTrue()
        ->and($chip->category())->toBe('image');
});

it('requires id and name in an array', function () {
    FileChip::fromArray(['name' => 'x.pdf']);
})->throws(InvalidArgumentException::class, 'id');

it('maps extensions and mime types to categories', function (string $name, ?string $mime, string $category) {
    expect(FileChip::fromArray(['id' => 1, 'name' => $name, 'mime_type' => $mime])->category())->toBe($category);
})->with([
    ['a.pdf', null, 'pdf'],
    ['a.bin', 'image/heic', 'image'],
    ['a.docx', null, 'document'],
    ['a.csv', null, 'spreadsheet'],
    ['a.pptx', null, 'presentation'],
    ['a.7z', null, 'archive'],
    ['a.m4a', null, 'audio'],
    ['a.mkv', null, 'video'],
    ['a.json', null, 'code'],
    ['a.eml', null, 'email'],
    ['a.xyz', null, 'file'],
]);

it('formats sizes', function (int $bytes, string $expected) {
    expect(FileChip::formatSize($bytes))->toBe($expected);
})->with([
    [0, '0 B'],
    [999, '999 B'],
    [1024, '1 KB'],
    [5 * 1024 * 1024, '5 MB'],
]);

it('builds a chip from a local Media Library model', function () {
    $chip = FileChip::fromMedia(media());

    expect($chip->id)->toBe('7')
        ->and($chip->name)->toBe('report.pdf')
        ->and($chip->extension)->toBe('pdf')
        ->and($chip->size)->toBe('2 KB')
        ->and($chip->viewUrl)->toBe('https://example.test/storage/7/report.pdf')
        ->and($chip->downloadUrl)->toBe('https://example.test/storage/7/report.pdf')
        ->and($chip->thumbUrl)->toBeNull()
        ->and($chip->excerpt)->toBe('Quarterly numbers')
        ->and($chip->createdAt?->format('Y-m-d H:i'))->toBe('2026-10-01 09:30');
});

it('uses the image itself as thumbnail when no thumb conversion exists', function () {
    $chip = FileChip::fromMedia(media(['file_name' => 'cat.png', 'mime_type' => 'image/png']));

    expect($chip->thumbUrl)->toBe('https://example.test/storage/7/cat.png')
        ->and($chip->isImage)->toBeTrue();
});

it('limits the excerpt and reads the configured summary property', function () {
    config(['file-chips.summary_property' => 'notes', 'file-chips.summary_limit' => 5]);

    $chip = FileChip::fromMedia(media(['custom_properties' => ['notes' => 'abcdefghij']]));

    expect($chip->excerpt)->toBe('abcde...');
});

it('drops unsafe URL schemes', function (string $url) {
    $chip = FileChip::fromArray(['id' => 1, 'name' => 'a.pdf', 'view_url' => $url, 'thumb_url' => $url]);

    expect($chip->viewUrl)->toBeNull()
        ->and($chip->downloadUrl)->toBeNull()
        ->and($chip->thumbUrl)->toBeNull();
})->with(['javascript:alert(1)', ' JavaScript:alert(1)', 'vbscript:x', 'data:text/html,<b>x</b>']);

it('keeps safe URLs', function (string $url) {
    expect(FileChip::fromArray(['id' => 1, 'name' => 'a.png', 'view_url' => $url])->viewUrl)->toBe($url);
})->with(['https://cdn.test/a.png', 'http://x.test/a', '/files/1', 'files/1', '?download=1', 'blob:https://x.test/uuid']);

it('allows data image URLs only as thumbnails', function () {
    $chip = FileChip::fromArray(['id' => 1, 'name' => 'a.png', 'view_url' => 'data:image/png;base64,AA', 'thumb_url' => 'data:image/png;base64,AA']);

    expect($chip->thumbUrl)->toBe('data:image/png;base64,AA')
        ->and($chip->viewUrl)->toBeNull();
});

it('formats numeric string sizes as bytes', function () {
    expect(FileChip::fromArray(['id' => 1, 'name' => 'a', 'size' => '2048'])->size)->toBe('2 KB')
        ->and(FileChip::fromArray(['id' => 1, 'name' => 'a', 'size' => '2 KB'])->size)->toBe('2 KB');
});

it('rejects non-scalar ids and names', function (array $data) {
    FileChip::fromArray($data);
})->with([
    [['id' => [1], 'name' => 'a']],
    [['id' => 1, 'name' => ['a']]],
])->throws(InvalidArgumentException::class);

it('rejects unparseable dates with InvalidArgumentException', function () {
    FileChip::fromArray(['id' => 1, 'name' => 'a', 'created_at' => 'not a date']);
})->throws(InvalidArgumentException::class, 'created_at');

it('rolls sizes over to the next unit', function () {
    expect(FileChip::formatSize(1048575))->toBe('1 MB');
});

it('does not use undisplayable image formats as thumbnails', function () {
    $chip = FileChip::fromMedia(media(['file_name' => 'photo.heic', 'mime_type' => 'image/heic']));

    expect($chip->thumbUrl)->toBeNull()
        ->and($chip->category())->toBe('image');
});

it('builds an RFC 6266 download header for non-ASCII names on S3', function () {
    expect(FileChip::contentDisposition('şirket "q".pdf'))
        ->toBe('attachment; filename="sirket \'q\'.pdf"; filename*=UTF-8\'\'%C5%9Firket%20%22q%22.pdf');
});
