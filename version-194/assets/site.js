document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let active = 0;
    let timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        const selected = slideIndex === active;
        slide.classList.toggle("is-active", selected);
        slide.setAttribute("aria-hidden", selected ? "false" : "true");
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(active + 1);
        startTimer();
      });
    }

    startTimer();
  }

  const filterScopes = document.querySelectorAll("[data-filter-scope]");

  filterScopes.forEach(function (scope) {
    const form = scope.querySelector("[data-filter-form]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const emptyMessage = scope.querySelector("[data-empty-message]");

    if (!form || cards.length === 0) {
      return;
    }

    function applyFilters() {
      const keyword = (form.elements.keyword ? form.elements.keyword.value : "").trim().toLowerCase();
      const type = form.elements.type ? form.elements.type.value : "";
      const year = form.elements.year ? form.elements.year.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = (card.getAttribute("data-search") || "").toLowerCase();
        const cardType = card.getAttribute("data-type") || "";
        const cardYear = card.getAttribute("data-year") || "";
        const matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!type || cardType === type) && (!year || cardYear === year);

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.hidden = visible !== 0;
      }
    }

    form.addEventListener("input", applyFilters);
    form.addEventListener("change", applyFilters);
  });
});
