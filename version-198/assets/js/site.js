(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var dots = selectAll("[data-hero-dot]", slider);
        var previous = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilter() {
        var forms = selectAll("[data-filter-form]");
        forms.forEach(function (form) {
            var input = form.querySelector("[data-filter-input]");
            var category = form.querySelector("[data-filter-category]");
            var year = form.querySelector("[data-filter-year]");
            var region = form.querySelector("[data-filter-region]");
            var clear = form.querySelector("[data-filter-clear]");
            var cards = selectAll("[data-movie-card]");
            var empty = document.querySelector("[data-filter-empty]");

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function matches(card) {
                var query = normalize(input && input.value);
                var selectedCategory = normalize(category && category.value);
                var selectedYear = normalize(year && year.value);
                var selectedRegion = normalize(region && region.value);
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }
                if (selectedCategory && normalize(card.getAttribute("data-category")) !== selectedCategory) {
                    return false;
                }
                if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
                    return false;
                }
                if (selectedRegion && normalize(card.getAttribute("data-region")) !== selectedRegion) {
                    return false;
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            var parameters = new URLSearchParams(window.location.search);
            if (input && parameters.get("q")) {
                input.value = parameters.get("q");
            }

            form.addEventListener("submit", function (event) {
                if (form.hasAttribute("data-filter-local")) {
                    event.preventDefault();
                    apply();
                }
            });
            [input, category, year, region].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });
            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function setupHeroSearch() {
        var form = document.querySelector("[data-hero-search]");
        if (!form) {
            return;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var query = input ? input.value.trim() : "";
            var target = form.getAttribute("action") || "search.html";
            if (query) {
                window.location.href = target + "?q=" + encodeURIComponent(query);
            } else {
                window.location.href = target;
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilter();
        setupHeroSearch();
    });
}());
