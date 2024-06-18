function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// Ocultar el loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showCursor() {
    document.body.style.cursor = 'inherit';
}

function hideCursor() {
    document.body.style.cursor = 'none';
}

let titleName = '';
let videoUrl = null;
let isInVideo = false;

document.addEventListener('DOMContentLoaded', function () {
    const content = document.getElementById('content');
    const baseURL = 'https://pokemon-project.com/episodios/latino';

    async function fetchHTML(url) {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(text, 'text/html');
    }

    function setName(name) {
        titleName = name;
    }

    function setVideoUrl(url) {
        videoUrl = url;
    }

    function updateURL(hash) {
        window.location.hash = hash;
    }

    function getCurrentTime() {
        return new Date().getTime();
    }


    function handleItemClick(e) {
        if (!Element.prototype.closest) {
            console.error('El navegador no es compatible con el método closest.');
            return;
        }

        const clickedElement = e.target;
        const container = clickedElement.closest('div'); // Buscar el contenedor más cercano que sea un <div>

        const elements = container.querySelectorAll('a, button');

        elements.forEach(element => {
            if (element === clickedElement) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
    }

    function isCacheValid(cacheKey) {
        const lastUpdateTime = localStorage.getItem(`${cacheKey}_cacheUpdateTime`);
        if (lastUpdateTime) {
            const currentTime = getCurrentTime();
            const timeElapsed = currentTime - parseInt(lastUpdateTime);
            const oneHourInMillis = 60 * 60 * 1000 * 12; // 12 horas en milisegundos
            return timeElapsed < oneHourInMillis;
        }
        return false;
    }

    async function loadData(cacheKey, url, displayFunction, containerClass, title, styles) {
        showLoading();

        content.querySelector('#lists').style.display = 'flex';
        const containerDiv = content.querySelector(`${containerClass}`);
        containerDiv.innerHTML = '';
        // content.querySelector(`#video-container`).innerHTML = '';

        if (isCacheValid(cacheKey)) {
            const cachedData = JSON.parse(localStorage.getItem(`cached_${cacheKey}_${url}`));
            if (cachedData) {
                displayFunction(cachedData, containerDiv, title, styles);
                return;
            }
        }

        const doc = await fetchHTML(url);
        const elements = doc.querySelectorAll('.real-table tbody tr a');

        const dataMap = {};
        elements.forEach(item => {
            const itemName = item.innerText;
            const itemLink = item.href;

            if (dataMap[itemLink]) {
                dataMap[itemLink].push(itemName);
            } else {
                dataMap[itemLink] = [itemName];
            }
        });

        localStorage.setItem(`${cacheKey}_cacheUpdateTime`, getCurrentTime());
        localStorage.setItem(`cached_${cacheKey}_${url}`, JSON.stringify(dataMap));

        displayFunction(dataMap, containerDiv, title, styles);
    }

    function displayData(dataMap, containerDiv, title, styles) {
        hideLoading();

        content.querySelector(`#title`).innerText = title + ' - ' + titleName;
        // content.innerHTML = `<h1>${title}</h1><div class="${containerClass} ${styles}"></div>`;

        let index = 0;
        for (const [itemLink, itemNames] of Object.entries(dataMap)) {
            index = index + 1;

            const seasonAndEpisode = extractSeasonAndEpisode(itemLink);
            let videoUrl = null;
            if (seasonAndEpisode) {
                videoUrl = buildVideoUrl(seasonAndEpisode.season, seasonAndEpisode.episode);
            }
            const videoKey = `pokemon-video-time-${videoUrl}`;

            const savedTime = localStorage.getItem(videoKey);
            let progress = null;
            let total = null;
            if (savedTime) {
                const savedProgress = JSON.parse(savedTime);
                progress = savedProgress.c;
                total = savedProgress.t;
            }

            const a = document.createElement('a');
            const itemNamesTrimmed = itemNames.map(name => name.trim());

            let itemName = itemNamesTrimmed.join(' ');
            itemName = `${index}. ${itemName}`;

            a.innerText = itemName;
            a.href = '#';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                setName(itemName)
                updateURL(itemLink);
                handleItemClick(a)
            });

            if (progress) {
                const percentage = (parseFloat(progress) / total) * 100;
                a.style.border = `1px solid #0056b3`;
                a.style.color = `black`;
                a.style.background = `linear-gradient(to right, #0056b3 ${percentage}%, transparent ${percentage}%)`;
            }

            containerDiv.appendChild(a);
        }
    }

    function extractSeasonAndEpisode(url) {
        const regex = /temporada-(\d+)\/episodio-(\d+)/;
        const match = url.match(regex);
        if (match) {
            return {
                season: match[1],
                episode: match[2]
            };
        }
        return null;
    }

    function buildVideoUrl(season, episode) {
        const seasonStr = season.padStart(2, '0');
        const episodeStr = episode.padStart(2, '0');
        return `https://pokemon-project.com/descargas/epis/serie-ash/t${seasonStr}/t${seasonStr}_e${episodeStr}.es-la.mp4`;
    }

    function setupVideoPlayer(url) {
        isInVideo = true;
        setVideoUrl(url)

        content.querySelector('#lists').style.display = 'none';
        const videoContainer = content.querySelector('#video-container');

        const videoElement = videoContainer.querySelector('#pokemon-video');
        console.log(videoElement);
        // const videoElement = document.createElement('video');
        // videoElement.id = 'pokemon-video';
        // videoElement.controls = false;
        // videoElement.textContent = titleName;
        videoElement.style.height = '100vh';

        videoFunctions(videoElement)

        videoContainer.appendChild(videoElement);

        videoElement.src = url;
        // videoElement.requestFullscreen()
        videoElement.load();
        videoElement.play();

        hideCursor()
    }

    function videoFunctions(videoElement) {
        const customVideoPlayer = document.getElementById('video');
        const playPauseButton = document.getElementById('play-pause');
        const rewindButton = document.getElementById('rewind');
        const fastForwardButton = document.getElementById('fast-forward');
        const exitFullscreenButton = document.getElementById('exit-fullscreen');
        const progressBar = document.getElementById('progress-bar');
        const controls = document.getElementById('controls');

        function restartFadeOutAnimation() {
            controls.classList.remove('fade-out-element');
            document.getElementById('title').classList.remove('fade-out-element');
            void controls.offsetWidth; // Truco para reiniciar la animación
            controls.classList.add('fade-out-element');
            document.getElementById('title').classList.add('fade-out-element');
        }

        document.body.classList.add('video');
        restartFadeOutAnimation()

        customVideoPlayer.classList.remove('hidden');

        if (videoElement) {
            const videoKey = `pokemon-video-time-${videoUrl}`;

            const savedTime = localStorage.getItem(videoKey);
            if (savedTime) {
                videoElement.currentTime = parseFloat(JSON.parse(savedTime).c) - 3;
            }

            videoElement.addEventListener('timeupdate', function () {
                progressBar.value = (videoElement.currentTime / videoElement.duration) * 100;
                localStorage.setItem(videoKey, `{"c": "${videoElement.currentTime}", "t": "${videoElement.duration}"}`);
            });
        }

        progressBar.addEventListener('input', function () {
            videoElement.currentTime = (progressBar.value / 100) * videoElement.duration;
        });


        playPauseButton.addEventListener('click', () => {
            if (videoElement.paused) {
                videoElement.play();
                playPauseButton.innerText = 'Pause';
            } else {
                videoElement.pause();
                playPauseButton.innerText = 'Play';
            }
            restartFadeOutAnimation()
        });

        rewindButton.addEventListener('click', () => {
            videoElement.currentTime -= 10;
            restartFadeOutAnimation()
        });

        fastForwardButton.addEventListener('click', () => {
            videoElement.currentTime += 10;
            restartFadeOutAnimation()
        });

        exitFullscreenButton.addEventListener('click', () => {
            customVideoPlayer.classList.add('hidden');
            document.getElementById('title').classList.remove('fade-out-element');
            document.body.classList.remove('video');
            window.history.back();
            videoElement.pause();
            restartFadeOutAnimation()
        });

        // const fullscreenButton = document.getElementById('fullscreen');
        //
        // fullscreenButton.addEventListener('click', () => {
        //     if (videoElement.requestFullscreen) {
        //         videoElement.requestFullscreen();
        //     } else if (videoElement.mozRequestFullScreen) { /* Firefox */
        //         videoElement.mozRequestFullScreen();
        //     } else if (videoElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        //         videoElement.webkitRequestFullscreen();
        //     } else if (videoElement.msRequestFullscreen) { /* IE/Edge */
        //         videoElement.msRequestFullscreen();
        //     }
        //     restartFadeOutAnimation()
        // });

        document.addEventListener('keydown', (event) => {
            if(!isInVideo) return false;

            restartFadeOutAnimation()

            const key = event.key;

            if (key === 'ArrowLeft') {
                videoElement.currentTime -= 5;
            } else if (key === 'ArrowRight') {
                videoElement.currentTime += 5;
            } else if (key === ' ') {
                event.preventDefault();
                if (videoElement.paused) {
                    videoElement.play();
                    playPauseButton.innerText = 'Pause';
                } else {
                    videoElement.pause();
                    playPauseButton.innerText = 'Play';
                }
            } else if (key === 'Escape') {
                showCursor();

                customVideoPlayer.classList.add('hidden');
                document.getElementById('title').classList.remove('fade-out-element');
                window.history.back();
                document.body.classList.remove('video');
                videoElement.pause();
            }

            if (document.activeElement === videoElement || document.activeElement === progressBar) {
                switch (event.key) {
                    case ' ':
                    case 'Enter':
                        if (videoElement.paused) {
                            videoElement.play();
                        } else {
                            videoElement.pause();
                        }
                        break;
                    case 'ArrowRight':
                        videoElement.currentTime += 10; // Adelanta 5 segundos
                        break;
                    case 'ArrowLeft':
                        videoElement.currentTime -= 10; // Retrocede 5 segundos
                        break;
                    case 'Escape':
                    case 'Backspace':
                        showCursor();
                        document.getElementById('title').classList.remove('fade-out-element');
                        document.body.classList.remove('video');
                        window.history.back();
                        break;
                }
            }
        });

        videoElement.addEventListener('click', function () {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        });
    }

    function playEpisodeVideo(episodeURL) {
        content.querySelector(`#title`).innerText = titleName;

        console.log('PLAYING EPISODE');
        const seasonAndEpisode = extractSeasonAndEpisode(episodeURL);
        if (seasonAndEpisode) {
            const videoUrl = buildVideoUrl(seasonAndEpisode.season, seasonAndEpisode.episode);
            console.log(`Reproduciendo video desde: ${videoUrl}`);
            setupVideoPlayer(videoUrl);
        } else {
            console.error('No se pudo extraer la temporada y episodio de la URL.');
        }
    }

    window.addEventListener('hashchange', () => {
        isInVideo = false;
        const hash = window.location.hash.substring(1);
        if (hash) {
            if (hash.includes('temporada-') && hash.includes('episodio-')) {
                playEpisodeVideo(hash);
            } else {
                loadData('episodes', hash, displayData, '#episodes-list', 'EPISODIOS', 'right');
            }
        }
        document.getElementById('title').classList.remove('fade-out-element');
    });

    // Initial load
    if (window.location.hash) {
        if (window.location.hash.includes('temporada-') && window.location.hash.includes('episodio-')) {
            playEpisodeVideo(window.location.hash.substring(1));
        } else {
            loadData('episodes', window.location.hash.substring(1), displayData, '#episodes-list', 'EPISODIOS', 'right');
        }
    }

    showCursor();

    document.getElementById('title').classList.remove('fade-out-element');
    document.body.classList.remove('video');
    loadData('series', `${baseURL}/serie-ash`, displayData, '#sessions-list', 'TEMPORADAS');
});
