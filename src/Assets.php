<?php

declare(strict_types=1);

namespace OzanKurt\FileChips;

use Illuminate\Support\Facades\Vite;

/**
 * The tags printed by @fileChipsStyles and @fileChipsScripts. Each URL gets
 * the published file's modification time as ?v=, so republishing after an
 * upgrade busts the browser cache. The script tag carries the request's CSP
 * nonce when the app set one with Vite::useCspNonce().
 */
final class Assets
{
    public static function styles(): string
    {
        return '<link rel="stylesheet" href="'.e(self::url('file-chips.min.css')).'">';
    }

    public static function scripts(): string
    {
        $nonce = Vite::cspNonce();
        $nonceAttribute = $nonce === null ? '' : ' nonce="'.e($nonce).'"';

        return '<script'.$nonceAttribute.' src="'.e(self::url('file-chips.min.js')).'" defer></script>';
    }

    private static function url(string $file): string
    {
        $path = trim((string) config('file-chips.asset_path'), '/').'/'.$file;
        $published = public_path($path);
        $version = is_file($published) ? filemtime($published) : false;

        return asset($path).($version === false ? '' : '?v='.$version);
    }
}
