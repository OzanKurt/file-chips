<?php

declare(strict_types=1);

namespace OzanKurt\FileChips\Tests;

use Orchestra\Testbench\TestCase as Orchestra;
use OzanKurt\FileChips\FileChipsServiceProvider;
use Spatie\MediaLibrary\MediaLibraryServiceProvider;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [MediaLibraryServiceProvider::class, FileChipsServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('filesystems.disks.public', [
            'driver' => 'local',
            'root' => sys_get_temp_dir().'/file-chips-tests',
            'url' => 'https://example.test/storage',
            'visibility' => 'public',
        ]);
        $app['config']->set('media-library.disk_name', 'public');
        // Fresh compiled views per run: Blade bakes constructor parameters into compiled components.
        $app['config']->set('view.compiled', sys_get_temp_dir().'/file-chips-views-'.getmypid());
    }
}
