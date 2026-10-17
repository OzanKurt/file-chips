<?php

declare(strict_types=1);

return [

    // Public path the built assets are published to (php artisan vendor:publish --tag=file-chips-assets).
    'asset_path' => 'vendor/file-chips',

    // Icon classes per file category, e.g. ['pdf' => 'far fa-file-pdf', 'file' => 'far fa-file'].
    // Categories: pdf, image, document, spreadsheet, presentation, archive, audio, video, code, email, file.
    // null shows a small extension badge instead, so no icon font is needed.
    'icons' => null,

    // Format for the "Added" date in the popover.
    'date_format' => 'd M Y H:i',

    // Spatie Media Library: conversion used as the thumbnail (null to skip), how long
    // temporary S3 URLs live, and which custom property holds the excerpt text.
    'thumb_conversion' => 'thumb',
    'temporary_url_minutes' => 30,
    'download_url_minutes' => 15,
    'summary_property' => 'summary',
    'summary_limit' => 160,

];
