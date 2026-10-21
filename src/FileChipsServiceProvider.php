<?php

declare(strict_types=1);

namespace OzanKurt\FileChips;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use OzanKurt\FileChips\View\Components\FileChips;

class FileChipsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/file-chips.php', 'file-chips');
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'file-chips');
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'file-chips');

        Blade::component('file-chips', FileChips::class);

        Blade::directive('fileChipsStyles', fn (): string => '<?php echo \OzanKurt\FileChips\Assets::styles(); ?>');
        Blade::directive('fileChipsScripts', fn (): string => '<?php echo \OzanKurt\FileChips\Assets::scripts(); ?>');

        if ($this->app->runningInConsole()) {
            $this->publishes([__DIR__.'/../dist' => public_path('vendor/file-chips')], ['file-chips', 'file-chips-assets', 'laravel-assets']);
            $this->publishes([__DIR__.'/../config/file-chips.php' => config_path('file-chips.php')], ['file-chips', 'file-chips-config']);
            $this->publishes([__DIR__.'/../resources/views' => resource_path('views/vendor/file-chips')], 'file-chips-views');
            $this->publishes([__DIR__.'/../lang' => $this->app->langPath('vendor/file-chips')], 'file-chips-lang');
        }
    }
}
