(function() {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function() {
            var open = nav.classList.toggle('is-open');
            navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterYear = document.querySelector('[data-filter-year]');
    var filterType = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilters() {
        var keyword = normalize(filterInput ? filterInput.value : '');
        var year = filterYear ? filterYear.value : '';
        var type = filterType ? filterType.value : '';

        cards.forEach(function(card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category')
            ].join(' '));
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var matchType = !type || card.getAttribute('data-type') === type;
            card.classList.toggle('hide-card', !(matchKeyword && matchYear && matchType));
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilters);
    }

    if (filterYear) {
        filterYear.addEventListener('change', applyFilters);
    }

    if (filterType) {
        filterType.addEventListener('change', applyFilters);
    }

    function startPlayer(player) {
        if (!player || player.getAttribute('data-ready') === '1') {
            var existingVideo = player ? player.querySelector('video') : null;
            if (existingVideo) {
                existingVideo.play().catch(function() {});
            }
            return;
        }

        var video = player.querySelector('video');
        var stream = player.getAttribute('data-stream');

        if (!video || !stream) {
            return;
        }

        player.setAttribute('data-ready', '1');
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.play().catch(function() {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(function() {});
            });
            player.hlsInstance = hls;
            return;
        }

        video.src = stream;
        video.play().catch(function() {});
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function(player) {
        var button = player.querySelector('[data-play-button]');
        var video = player.querySelector('video');

        if (button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                startPlayer(player);
            });
        }

        if (video) {
            video.addEventListener('click', function() {
                if (player.getAttribute('data-ready') !== '1') {
                    startPlayer(player);
                }
            });
        }
    });
})();
