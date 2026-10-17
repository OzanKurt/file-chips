<?php

declare(strict_types=1);

namespace OzanKurt\FileChips;

use DateTimeInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Everything the component needs to render one file, independent of where
 * the file is stored.
 */
final readonly class FileChip
{
    private const array CATEGORIES = [
        'pdf' => ['pdf'],
        'image' => ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'avif', 'heic'],
        'document' => ['doc', 'docx', 'odt', 'rtf', 'txt', 'md'],
        'spreadsheet' => ['xls', 'xlsx', 'ods', 'csv'],
        'presentation' => ['ppt', 'pptx', 'odp'],
        'archive' => ['zip', 'rar', '7z', 'tar', 'gz'],
        'audio' => ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
        'video' => ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        'code' => ['json', 'xml', 'yml', 'yaml', 'html', 'js', 'css', 'php', 'py', 'rb', 'go', 'ts'],
        'email' => ['eml', 'msg', 'mbox'],
    ];

    // Image formats browsers can show in <img>; others get no thumbnail.
    private const array PREVIEWABLE_IMAGES = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'avif'];

    private const array SAFE_SCHEMES = ['http', 'https', 'blob'];

    private const array MIME_PREFIXES = [
        'application/pdf' => 'pdf',
        'image/' => 'image',
        'audio/' => 'audio',
        'video/' => 'video',
    ];

    public function __construct(
        public string $id,
        public string $name,
        public string $extension = '',
        public ?string $mimeType = null,
        public ?string $size = null,
        public ?int $sizeBytes = null,
        public ?string $thumbUrl = null,
        public ?string $viewUrl = null,
        public ?string $downloadUrl = null,
        public ?string $excerpt = null,
        public bool $isImage = false,
        public ?DateTimeInterface $createdAt = null,
    ) {}

    /**
     * @param  array<string, mixed>  $data  Keys: id, name (required); extension, mime_type, size (bytes or a
     *                                      preformatted string), thumb_url, view_url, download_url, excerpt,
     *                                      is_image, created_at
     */
    public static function fromArray(array $data): self
    {
        foreach (['id', 'name'] as $required) {
            if (! isset($data[$required]) || ! is_scalar($data[$required]) || (string) $data[$required] === '') {
                throw new InvalidArgumentException("A file chip needs a non-empty scalar '{$required}'.");
            }
        }

        $name = (string) $data['name'];
        $extension = strtolower((string) ($data['extension'] ?? pathinfo($name, PATHINFO_EXTENSION)));
        $mime = isset($data['mime_type']) ? (string) $data['mime_type'] : null;
        $size = $data['size'] ?? null;
        $bytes = is_int($size) || is_float($size) || (is_string($size) && is_numeric($size)) ? (int) $size : null;
        $viewUrl = self::safeUrl($data['view_url'] ?? null);

        return new self(
            id: (string) $data['id'],
            name: $name,
            extension: $extension,
            mimeType: $mime,
            size: $bytes !== null ? self::formatSize($bytes) : ($size === null ? null : (string) $size),
            sizeBytes: $bytes,
            thumbUrl: self::safeUrl($data['thumb_url'] ?? null, allowDataImage: true),
            viewUrl: $viewUrl,
            downloadUrl: array_key_exists('download_url', $data) ? self::safeUrl($data['download_url']) : $viewUrl,
            excerpt: isset($data['excerpt']) && $data['excerpt'] !== '' ? (string) $data['excerpt'] : null,
            isImage: (bool) ($data['is_image'] ?? self::categoryOf($extension, $mime) === 'image'),
            createdAt: self::date($data['created_at'] ?? null),
        );
    }

    /**
     * Value for a Content-Disposition header that downloads the file under
     * its own name, with an ASCII fallback and an RFC 6266 UTF-8 name.
     */
    public static function contentDisposition(string $name): string
    {
        $fallback = str_replace(['"', '\\'], ["'", ''], Str::ascii($name));
        $fallback = preg_replace('/[^\x20-\x7E]/', '', $fallback) ?: 'download';

        return 'attachment; filename="'.$fallback.'"; filename*=UTF-8\'\''.rawurlencode($name);
    }

    /**
     * Build a chip from a Spatie Media Library model. S3 disks get temporary
     * URLs; other disks get their regular URLs.
     */
    public static function fromMedia(Media $media): self
    {
        $config = config('file-chips');
        $name = $media->file_name;
        $extension = strtolower($media->extension ?: pathinfo($name, PATHINFO_EXTENSION));

        // media.mime_type is nullable in Media Library's own migration.
        $rawMime = $media->getAttributeValue('mime_type');
        $mime = is_string($rawMime) && $rawMime !== '' ? $rawMime : null;

        $isImage = self::categoryOf($extension, $mime) === 'image';
        $previewable = in_array($extension, self::PREVIEWABLE_IMAGES, true);
        $conversion = $config['thumb_conversion'];
        $hasThumb = $conversion !== null && $media->hasGeneratedConversion($conversion);

        if (str_contains($media->getDiskDriverName(), 's3')) {
            $expires = now()->addMinutes($config['temporary_url_minutes']);
            $thumbUrl = $hasThumb ? $media->getTemporaryUrl($expires, $conversion) : ($previewable ? $media->getTemporaryUrl($expires) : null);
            $viewUrl = $media->getTemporaryUrl($expires);
            $downloadUrl = $media->getTemporaryUrl(
                now()->addMinutes($config['download_url_minutes']),
                '',
                ['ResponseContentDisposition' => self::contentDisposition($name)],
            );
        } else {
            $thumbUrl = $hasThumb ? $media->getUrl($conversion) : ($previewable ? $media->getUrl() : null);
            $viewUrl = $media->getUrl();
            $downloadUrl = $viewUrl;
        }

        $summary = $config['summary_property'] === null ? null : $media->getCustomProperty($config['summary_property']);
        $excerpt = is_string($summary) && $summary !== '' ? Str::limit($summary, $config['summary_limit']) : null;

        return new self(
            id: (string) $media->getKey(),
            name: $name,
            extension: $extension,
            mimeType: $mime,
            size: self::formatSize((int) $media->size),
            sizeBytes: (int) $media->size,
            thumbUrl: $thumbUrl,
            viewUrl: $viewUrl,
            downloadUrl: $downloadUrl,
            excerpt: $excerpt,
            isImage: $isImage,
            createdAt: $media->created_at,
        );
    }

    /**
     * One of: pdf, image, document, spreadsheet, presentation, archive, audio, video, code, email, file.
     */
    public function category(): string
    {
        return self::categoryOf($this->extension, $this->mimeType);
    }

    public static function formatSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $power = $bytes > 0 ? min((int) floor(log($bytes, 1024)), count($units) - 1) : 0;
        $value = number_format($bytes / (1024 ** $power), 2, '.', '');

        // 1048575 bytes would otherwise print as "1024 KB".
        if ((float) $value >= 1024 && $power < count($units) - 1) {
            $value = number_format($bytes / (1024 ** ++$power), 2, '.', '');
        }

        return rtrim(rtrim($value, '0'), '.').' '.$units[$power];
    }

    /**
     * Keep relative URLs and http(s)/blob URLs; drop javascript:, data: and
     * other schemes that could run script when clicked. data:image/* is
     * allowed for thumbnails, which only ever go into <img src>.
     */
    private static function safeUrl(mixed $url, bool $allowDataImage = false): ?string
    {
        if (! is_string($url) || trim($url) === '') {
            return null;
        }

        $url = trim($url);
        // Browsers ignore whitespace and control characters inside a scheme ("java\tscript:").
        $normalised = strtolower((string) preg_replace('/[\x00-\x20]/', '', $url));

        if (! preg_match('/^([a-z][a-z0-9+.-]*):/', $normalised, $match)) {
            return $url;
        }

        if (in_array($match[1], self::SAFE_SCHEMES, true)) {
            return $url;
        }

        return $allowDataImage && str_starts_with($normalised, 'data:image/') ? $url : null;
    }

    private static function date(mixed $value): ?DateTimeInterface
    {
        if ($value instanceof DateTimeInterface) {
            return $value;
        }

        if ($value === null || $value === '') {
            return null;
        }

        try {
            return Carbon::parse((string) $value);
        } catch (\Throwable $e) {
            throw new InvalidArgumentException("A file chip's 'created_at' could not be parsed as a date.", 0, $e);
        }
    }

    private static function categoryOf(string $extension, ?string $mime): string
    {
        foreach (self::CATEGORIES as $category => $extensions) {
            if (in_array($extension, $extensions, true)) {
                return $category;
            }
        }

        foreach (self::MIME_PREFIXES as $prefix => $category) {
            if ($mime !== null && str_starts_with($mime, $prefix)) {
                return $category;
            }
        }

        return 'file';
    }
}
