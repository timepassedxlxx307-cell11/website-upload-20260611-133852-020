(function () {
    function setMessage(player, text) {
        var message = player.querySelector('[data-player-message]');
        if (!message) {
            return;
        }
        message.textContent = text || '';
        message.classList.toggle('show', Boolean(text));
    }

    function startPlayer(player) {
        if (player.dataset.started === 'true') {
            var currentVideo = player.querySelector('video');
            if (currentVideo && currentVideo.paused) {
                currentVideo.play().catch(function () {});
            }
            return;
        }

        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var source = video ? video.getAttribute('data-src') : '';
        if (!video || !source) {
            setMessage(player, '播放遇到问题，请稍后再试');
            return;
        }

        player.dataset.started = 'true';
        if (button) {
            button.classList.add('is-hidden');
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                setMessage(player, '播放遇到问题，请稍后再试');
            });
            player._hls = hls;
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            return;
        }

        setMessage(player, '播放遇到问题，请稍后再试');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(function (player) {
            var button = player.querySelector('[data-play]');
            var video = player.querySelector('video');
            if (button) {
                button.addEventListener('click', function () {
                    startPlayer(player);
                });
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (player.dataset.started !== 'true') {
                        startPlayer(player);
                    }
                });
            }
        });
    });
})();
