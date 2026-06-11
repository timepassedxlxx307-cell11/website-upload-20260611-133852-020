(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function autoplay() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        autoplay();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        autoplay();
      });
    }

    show(0);
    autoplay();
  }

  function setupLocalFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));

    grids.forEach(function (grid) {
      var section = grid.closest('section') || document;
      var search = section.querySelector('[data-local-search]');
      var year = section.querySelector('[data-filter-year]');
      var type = section.querySelector('[data-filter-type]');
      var region = section.querySelector('[data-filter-region]');
      var sort = section.querySelector('[data-sort]');
      var count = section.querySelector('[data-result-count]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var selectedRegion = region ? region.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-region') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
            matched = false;
          }
          if (selectedType && card.getAttribute('data-type') !== selectedType) {
            matched = false;
          }
          if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (sort) {
          var sorted = cards.slice().sort(function (a, b) {
            var mode = sort.value;
            if (mode === 'views') {
              return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
            }
            if (mode === 'rating') {
              return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
            }
            if (mode === 'year') {
              return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            }
            return 0;
          });

          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (count) {
          count.textContent = visible + ' 部影片';
        }
      }

      [search, year, type, region, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function createSearchCard(movie) {
    return [
      '<article class="media-card" data-movie-card>',
      '  <a href="' + movie.page + '" class="media-card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <figure class="media-cover">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '      <span class="play-mark">▶</span>',
      '    </figure>',
      '    <div class="media-info">',
      '      <div class="media-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="media-score"><span>★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    var form = document.querySelector('[data-search-form]');

    if (!results || !input || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function runSearch() {
      var query = input.value.trim().toLowerCase();

      if (!query) {
        return;
      }

      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category]
          .join(' ')
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(createSearchCard).join('');
      if (title) {
        title.textContent = '“' + input.value.trim() + '”的搜索结果';
      }
      if (count) {
        count.textContent = '找到 ' + matched.length + ' 部相关影片';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        if (query) {
          history.replaceState(null, '', './search.html?q=' + encodeURIComponent(query));
        }
        runSearch();
      });
    }

    if (initialQuery) {
      runSearch();
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('[data-video]');
      var playButton = player.querySelector('[data-play]');
      var message = player.querySelector('[data-player-message]');
      var hlsInstance = null;

      if (!video || !playButton) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add('show');
      }

      function attachSource() {
        var src = video.getAttribute('data-src');

        if (!src) {
          showMessage('视频地址暂不可用');
          return Promise.reject(new Error('empty video source'));
        }

        if (video.dataset.ready === '1') {
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.dataset.ready = '1';
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.dataset.ready = '1';
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              showMessage('网络错误，正在重新加载视频');
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              showMessage('媒体错误，正在尝试恢复播放');
              hlsInstance.recoverMediaError();
            } else {
              showMessage('当前浏览器暂时无法播放该视频');
              hlsInstance.destroy();
            }
          });
          return Promise.resolve();
        }

        showMessage('当前浏览器不支持 HLS 播放');
        return Promise.reject(new Error('hls unsupported'));
      }

      function play() {
        attachSource().then(function () {
          playButton.classList.add('hidden');
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              showMessage('请再次点击播放按钮开始播放');
              playButton.classList.remove('hidden');
            });
          }
        }).catch(function () {
          playButton.classList.remove('hidden');
        });
      }

      playButton.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        playButton.classList.add('hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          playButton.classList.remove('hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHeroSlider();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
