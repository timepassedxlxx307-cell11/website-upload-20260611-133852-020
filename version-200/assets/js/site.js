(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupListFilters() {
        var inputs = document.querySelectorAll('[data-list-search]');
        inputs.forEach(function (input) {
            var container = document.querySelector('[data-filter-list]');
            var empty = document.querySelector('[data-empty-state]');
            if (!container) {
                return;
            }
            var items = Array.prototype.slice.call(container.querySelectorAll('[data-search]'));
            var activeFilter = 'all';
            var buttons = document.querySelectorAll('[data-filter-button]');

            function applyFilter() {
                var keyword = normalize(input.value);
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute('data-search'));
                    var filterMatch = activeFilter === 'all' || haystack.indexOf(activeFilter) !== -1;
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                    var shouldShow = filterMatch && keywordMatch;
                    item.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (current) {
                        current.classList.remove('active');
                    });
                    button.classList.add('active');
                    activeFilter = normalize(button.getAttribute('data-filter-button'));
                    applyFilter();
                });
            });

            input.addEventListener('input', applyFilter);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupListFilters();
    });
})();
