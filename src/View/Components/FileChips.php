<?php

declare(strict_types=1);

namespace OzanKurt\FileChips\View\Components;

use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use InvalidArgumentException;
use OzanKurt\FileChips\FileChip;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class FileChips extends Component
{
    /** @var list<FileChip> */
    public array $chips;

    public string $prefix;

    /**
     * @param  iterable<FileChip|Media|array<string, mixed>>  $files
     * @param  string|null  $input  Name of the hidden input that collects ids marked for removal;
     *                              null hides the remove button.
     * @param  string|null  $idPrefix  Prefix for popover element ids. Derived from the files and input when
     *                                 omitted, so re-renders keep the same ids; set it when two lists on
     *                                 one page show the same files.
     */
    public function __construct(
        iterable $files = [],
        public ?string $input = null,
        ?string $idPrefix = null,
    ) {
        $this->chips = array_values(array_map($this->toChip(...), [...$files]));
        $ids = array_map(fn (FileChip $chip): string => $chip->id, $this->chips);
        $this->prefix = $idPrefix ?? 'fc-'.substr(hash('xxh128', ($input ?? '')."\0".implode("\0", $ids)), 0, 10);
    }

    // By position, not by file id: ids that sanitise alike ("a.b", "a-b") must never share a popover.
    public function popoverId(int $index): string
    {
        return $this->prefix.'-'.$index;
    }

    public function icon(FileChip $chip): ?string
    {
        $icons = config('file-chips.icons');

        return is_array($icons) ? ($icons[$chip->category()] ?? $icons['file'] ?? null) : null;
    }

    public function render(): View
    {
        return view('file-chips::components.file-chips');
    }

    private function toChip(mixed $file): FileChip
    {
        return match (true) {
            $file instanceof FileChip => $file,
            is_array($file) => FileChip::fromArray($file),
            class_exists(Media::class) && $file instanceof Media => FileChip::fromMedia($file),
            default => throw new InvalidArgumentException('Files must be FileChip instances, arrays or Media Library models, got '.get_debug_type($file).'.'),
        };
    }
}
