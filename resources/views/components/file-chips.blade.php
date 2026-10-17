@if (count($chips))
<div {{ $attributes->class('fc-chips') }} data-file-chips>
    @if ($input !== null)
        <div data-file-chips-bucket hidden></div>
    @endif

    @foreach ($chips as $index => $chip)
        @php($popover = $popoverId($index))
        @php($iconClass = $icon($chip))

        <button type="button" class="fc-chip" data-file-chip="{{ $popover }}"
                aria-controls="{{ $popover }}" aria-expanded="false" title="{{ $chip->name }}">
            @if ($iconClass)
                <i class="fc-chip__icon {{ $iconClass }}" aria-hidden="true"></i>
            @else
                <span class="fc-chip__ext">{{ $chip->extension ?: 'file' }}</span>
            @endif
            <span class="fc-chip__name">{{ $chip->name }}</span>
        </button>

        <div id="{{ $popover }}" class="fc-popover" data-file-chip-popover hidden>
            <div class="fc-popover__head">
                <div class="fc-thumb">
                    @if ($chip->thumbUrl)
                        <img src="{{ $chip->thumbUrl }}" alt="" loading="lazy">
                    @elseif ($iconClass)
                        <i class="fc-chip__icon {{ $iconClass }}" aria-hidden="true"></i>
                    @else
                        <span class="fc-chip__ext">{{ $chip->extension ?: 'file' }}</span>
                    @endif
                </div>
                <div class="fc-popover__info">
                    <div class="fc-popover__title" title="{{ $chip->name }}">{{ $chip->name }}</div>
                    <div class="fc-popover__meta">
                        @if ($chip->extension)
                            <span>{{ strtoupper($chip->extension) }}</span>
                        @endif
                        @if ($chip->size)
                            <span>{{ $chip->size }}</span>
                        @endif
                        @if ($chip->createdAt)
                            <span>{{ __('file-chips::messages.added', ['date' => $chip->createdAt->format(config('file-chips.date_format'))]) }}</span>
                        @endif
                    </div>
                </div>
            </div>

            @if ($chip->excerpt)
                <div class="fc-popover__excerpt">{{ $chip->excerpt }}</div>
            @endif

            <div class="fc-popover__actions">
                @if ($chip->viewUrl)
                    <a href="{{ $chip->viewUrl }}" target="_blank" rel="noopener" class="fc-btn fc-btn--primary">{{ __('file-chips::messages.view') }}</a>
                @endif
                @if ($chip->downloadUrl)
                    <a href="{{ $chip->downloadUrl }}" target="_blank" rel="noopener" class="fc-btn fc-btn--outline" download>{{ __('file-chips::messages.download') }}</a>
                @endif
                @if ($input !== null)
                    <button type="button" class="fc-btn fc-btn--danger" data-file-chip-remove
                            data-file-chip-id="{{ $chip->id }}" data-file-chip-input="{{ $input }}"
                            data-label-marked="{{ __('file-chips::messages.marked') }}"
                            data-label-unmarked="{{ __('file-chips::messages.remove') }}"
                            aria-pressed="false">
                        <span data-file-chip-remove-label>{{ __('file-chips::messages.remove') }}</span>
                    </button>
                @endif
            </div>
        </div>
    @endforeach
</div>
@endif
