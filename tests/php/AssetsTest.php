<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Vite;

beforeEach(function () {
    $this->dir = public_path('vendor/file-chips');
    File::ensureDirectoryExists($this->dir);
});

afterEach(function () {
    File::deleteDirectory(public_path('vendor/file-chips'));
});

it('adds the published file time as a version, so upgrades bust the browser cache', function () {
    File::put($this->dir.'/file-chips.min.css', 'a{}');
    File::put($this->dir.'/file-chips.min.js', '1');
    touch($this->dir.'/file-chips.min.css', 1_700_000_000);
    touch($this->dir.'/file-chips.min.js', 1_700_000_001);

    expect(Blade::render('@fileChipsStyles'))->toBe('<link rel="stylesheet" href="'.asset('vendor/file-chips/file-chips.min.css').'?v=1700000000">')
        ->and(Blade::render('@fileChipsScripts'))->toBe('<script src="'.asset('vendor/file-chips/file-chips.min.js').'?v=1700000001" defer></script>');
});

it('leaves the version out before the assets are published', function () {
    expect(Blade::render('@fileChipsStyles'))->toBe('<link rel="stylesheet" href="'.asset('vendor/file-chips/file-chips.min.css').'">');
});

it('adds the CSP nonce to the script tag', function () {
    Vite::useCspNonce('n0nc3');

    expect(Blade::render('@fileChipsScripts'))->toContain('<script nonce="n0nc3" src="');
});
