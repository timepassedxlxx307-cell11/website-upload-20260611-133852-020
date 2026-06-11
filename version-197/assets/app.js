(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '☰';
            }
        });
    }

    function initHero() {
        var root = document.querySelector('.hero-carousel');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        function next() {
            show(current + 1);
        }
        function prev() {
            show(current - 1);
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(next, 5000);
        }
        var nextButton = root.querySelector('.hero-control.next');
        var prevButton = root.querySelector('.hero-control.prev');
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                next();
                restart();
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                prev();
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        restart();
    }

    function initLocalFilter() {
        var input = document.querySelector('.local-filter');
        var scope = document.querySelector('.filter-scope');
        if (!input || !scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var active = 'all';
        function apply() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var byText = !query || haystack.indexOf(query) !== -1;
                var byTag = active === 'all' || haystack.indexOf(active.toLowerCase()) !== -1;
                card.style.display = byText && byTag ? '' : 'none';
            });
        }
        input.addEventListener('input', apply);
        Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (button) {
            button.addEventListener('click', function () {
                active = button.getAttribute('data-filter') || 'all';
                Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    }

    function cardHtml(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card grid">' +
            '<a class="poster-link" href="' + item.file + '" aria-label="' + escapeHtml(item.title) + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
            '</a>' +
            '<div class="movie-info">' +
            '<div class="meta-row"><span class="category-chip">' + escapeHtml(item.category) + '</span><span class="rating">★ ' + escapeHtml(item.rating) + '</span></div>' +
            '<h2><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h2>' +
            '<p>' + escapeHtml(item.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function initSearchPage() {
        var holder = document.getElementById('searchResults');
        var input = document.getElementById('searchInput');
        var title = document.getElementById('searchResultTitle');
        if (!holder || !input || typeof SEARCH_ITEMS === 'undefined') {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        input.value = q;
        function render(query) {
            var keyword = query.trim().toLowerCase();
            var results = SEARCH_ITEMS.filter(function (item) {
                var text = [item.title, item.oneLine, item.genre, item.region, item.year, item.category, (item.tags || []).join(' ')].join(' ').toLowerCase();
                return !keyword || text.indexOf(keyword) !== -1;
            }).slice(0, 120);
            holder.innerHTML = results.map(cardHtml).join('');
            title.textContent = keyword ? '搜索结果：' + query : '热门内容';
        }
        render(q);
        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var start = document.querySelector('.player-start');
        var shell = document.querySelector('.player-shell');
        if (!video || !source) {
            return;
        }
        var hlsInstance = null;
        function showMessage(text) {
            if (!shell) {
                return;
            }
            var old = shell.querySelector('.player-message');
            if (old) {
                old.remove();
            }
            var message = document.createElement('div');
            message.className = 'player-message';
            message.textContent = text;
            shell.appendChild(message);
        }
        function attach() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('播放暂时不可用');
                    }
                });
            } else {
                showMessage('播放暂时不可用');
            }
        }
        function play() {
            if (start) {
                start.classList.add('hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (start) {
                        start.classList.remove('hidden');
                    }
                });
            }
        }
        attach();
        if (start) {
            start.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            if (start) {
                start.classList.add('hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (start && !video.ended) {
                start.classList.remove('hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initLocalFilter();
        initSearchPage();
    });
})();
