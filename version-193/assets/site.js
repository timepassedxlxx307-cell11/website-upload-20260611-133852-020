(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.classList.toggle('open', isOpen);
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('.hero-carousel');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]'));
    searchInputs.forEach(function (input) {
        var targetSelector = input.getAttribute('data-movie-search');
        var scope = targetSelector ? document.querySelector(targetSelector) : document;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row')) : [];

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                card.classList.toggle('hidden-by-search', keyword && text.indexOf(keyword) === -1);
            });
        });
    });

    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]'));
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var region = chip.getAttribute('data-filter-region');
            var scopeSelector = chip.getAttribute('data-filter-scope');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]')).forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });
            Array.prototype.slice.call(scope.querySelectorAll('.movie-card')).forEach(function (card) {
                var cardRegion = card.getAttribute('data-region') || '';
                card.classList.toggle('hidden-by-search', region !== '全部' && cardRegion.indexOf(region) === -1);
            });
        });
    });
}());

function initMoviePlayer(videoId, source) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
        return;
    }

    var stage = video.closest('.player-stage');
    var overlay = stage ? stage.querySelector('.play-overlay') : null;
    var hlsInstance = null;
    var prepared = false;

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                var manifestPromise = video.play();
                if (manifestPromise && typeof manifestPromise.catch === 'function') {
                    manifestPromise.catch(function () {});
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function play() {
        prepare();
        if (overlay) {
            overlay.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    });
}
