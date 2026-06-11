(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var scope = form.closest('main') || document;
    var list = scope.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-search-item]'));
    function applyFilter() {
      var value = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = item.getAttribute('data-search-text') || item.textContent.toLowerCase();
        item.classList.toggle('is-hidden', Boolean(value && text.indexOf(value) === -1));
      });
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    input.addEventListener('input', applyFilter);
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    if (!video || !button || !streamUrl) {
      return;
    }
    var hlsInstance = null;
    var ready = false;
    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function begin() {
      attach();
      button.classList.add('is-hidden');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }
    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
