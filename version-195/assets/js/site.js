(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll("[data-global-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                var target = "search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                location.href = target;
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function render(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }

        function move(step) {
            render(current + step);
        }

        function start() {
            timer = setInterval(function () {
                move(1);
            }, 5200);
        }

        function reset() {
            if (timer) {
                clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                reset();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                reset();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                render(index);
                reset();
            });
        });
        render(0);
        start();
    }

    function setupLocalSearch() {
        var input = document.querySelector("[data-local-search]");
        var sortSelect = document.querySelector("[data-sort-select]");
        var list = document.querySelector("[data-filter-list]");
        var empty = document.querySelector("[data-empty-state]");
        if (!input || !list) {
            return;
        }
        var params = new URLSearchParams(location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }
        var items = Array.prototype.slice.call(list.querySelectorAll("[data-search-item]"));

        function normalize(value) {
            return String(value || "").toLowerCase();
        }

        function apply() {
            var term = normalize(input.value.trim());
            var visible = 0;
            items.forEach(function (item) {
                var haystack = normalize(item.getAttribute("data-search-text"));
                var matched = !term || haystack.indexOf(term) !== -1;
                item.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        function sortItems() {
            if (!sortSelect) {
                return;
            }
            var mode = sortSelect.value;
            var sorted = items.slice().sort(function (a, b) {
                if (mode === "title") {
                    return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "zh-Hans-CN");
                }
                if (mode === "heat") {
                    return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
                }
                return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            });
            sorted.forEach(function (item) {
                list.appendChild(item);
            });
            items = sorted;
            apply();
        }

        input.addEventListener("input", apply);
        if (sortSelect) {
            sortSelect.addEventListener("change", sortItems);
            sortItems();
        }
        apply();
    }

    function setupPlayer() {
        var video = document.querySelector("[data-player]");
        if (!video) {
            return;
        }
        var overlay = document.querySelector("[data-play-overlay]");
        var stream = video.getAttribute("data-stream");
        var started = false;
        var hls = null;

        function attach() {
            if (!stream || started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                play();
            }
        });
        document.addEventListener("visibilitychange", function () {
            if (document.hidden && hls && typeof hls.stopLoad === "function") {
                hls.stopLoad();
            }
            if (!document.hidden && hls && typeof hls.startLoad === "function") {
                hls.startLoad();
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupGlobalSearch();
        setupHero();
        setupLocalSearch();
        setupPlayer();
    });
})();
