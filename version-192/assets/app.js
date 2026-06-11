(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(next);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });

        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var filterList = document.querySelector('[data-card-list]');

    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

        filterInput.addEventListener('input', function () {
            var keyword = filterInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
                card.hidden = keyword && haystack.indexOf(keyword) === -1;
            });
        });
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var searchInput = searchPage.querySelector('[data-search-input]');
        var resultBox = searchPage.querySelector('[data-search-results]');
        var counter = searchPage.querySelector('[data-search-count]');
        var form = searchPage.querySelector('form');
        var database = [];

        function getQueryFromUrl() {
            var params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        }

        function cardTemplate(item) {
            var tags = item.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-meta="' + escapeHtml(item.meta) + '">' +
                '<a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">' +
                '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="poster-shine"></span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
                '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderResults(keyword) {
            var normalized = keyword.trim().toLowerCase();
            var matches = database;

            if (normalized) {
                matches = database.filter(function (item) {
                    return item.searchText.indexOf(normalized) !== -1;
                });
            } else {
                matches = database.slice(0, 24);
            }

            resultBox.innerHTML = matches.slice(0, 80).map(cardTemplate).join('');

            if (counter) {
                counter.textContent = normalized ? '找到 ' + matches.length + ' 部匹配影片' : '显示近期推荐影片';
            }
        }

        fetch('assets/search-index.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (items) {
                database = items.map(function (item) {
                    item.searchText = [
                        item.title,
                        item.year,
                        item.region,
                        item.genre,
                        item.oneLine,
                        item.tags.join(' ')
                    ].join(' ').toLowerCase();
                    return item;
                });

                var query = getQueryFromUrl();

                if (query && searchInput) {
                    searchInput.value = query;
                }

                renderResults(query);
            })
            .catch(function () {
                if (counter) {
                    counter.textContent = '搜索暂时不可用';
                }
            });

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                renderResults(searchInput ? searchInput.value : '');
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                renderResults(searchInput.value);
            });
        }
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('[data-video]');
        var trigger = player.querySelector('[data-play-trigger]');
        var state = player.querySelector('[data-player-state]');
        var initialized = false;
        var hlsInstance = null;

        function setState(message) {
            if (state) {
                state.textContent = message || '';
            }
        }

        function hideTrigger() {
            if (trigger) {
                trigger.classList.add('hidden');
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }

            var pending = video.play();

            if (pending && typeof pending.catch === 'function') {
                pending.catch(function () {
                    setState('点击画面继续播放');
                });
            }
        }

        function initializePlayer() {
            if (!video || initialized) {
                playVideo();
                return;
            }

            var streamUrl = video.getAttribute('data-stream');

            if (!streamUrl) {
                setState('视频暂时无法播放');
                return;
            }

            initialized = true;
            setState('正在载入影片');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    hideTrigger();
                    setState('');
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setState('视频暂时无法播放，请稍后再试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    hideTrigger();
                    setState('');
                    playVideo();
                }, { once: true });
                video.addEventListener('error', function () {
                    setState('视频暂时无法播放，请稍后再试');
                });
            } else {
                setState('当前设备暂不支持播放');
            }
        }

        if (trigger) {
            trigger.addEventListener('click', initializePlayer);
        }

        if (video) {
            video.addEventListener('play', hideTrigger);
            video.addEventListener('click', function () {
                if (!initialized) {
                    initializePlayer();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
