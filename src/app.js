import 'regenerator-runtime/runtime';

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

function showErrorPopup(error) {
    const errorPopup = document.getElementById('error-popup');
    const errorDetails = document.getElementById('error-details');

    errorDetails.innerText = error;
    errorPopup.style.display = 'block';
}

// Captura de errores globales
window.onerror = function (message, source, lineno, colno, error) {
    const errorMessage = `Error: ${message}\nSource: ${source}\nLine: ${lineno}, Column: ${colno}\nStack Trace: ${error ? error.stack : 'N/A'}`;
    showErrorPopup(errorMessage);
    return false;  // Prevent the default browser error handler
};

const REWIND_FASTWARD_TIME_SECONDS = 15;
const CONTAINER_SESSIONS_LIST_ID = '#sessions-list';
const CONTAINER_EPISODES_LIST_ID = '#episodes-list';
const BASE_URL = 'https://pokemon-project.com';
const LATIN_URL = '/episodios/latino';
const BASE_LATIN_URL_LIST = BASE_URL + LATIN_URL;
const SERIE_URL = '/serie-ash';
const BASE_LATIN_URL_VIDEO = BASE_URL + '/descargas/epis';

let titleName = '';
let videoUrl = null;
let isInVideo = false;
let nextLink = null;

document.addEventListener('DOMContentLoaded', function () {
    const content = document.getElementById('content');
    const nextEpisodeBtn = document.getElementById('next-episode');

    async function fetchHTML(url) {
        try {
            showLoading();
            const response = await fetch(url);
            if (!response.ok) {
                hideLoading();
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            const parser = new DOMParser();
            hideLoading();
            return parser.parseFromString(text, 'text/html');
        } catch (error) {
            hideLoading();
            showErrorPopup(`Failed to fetch: ${url}\nError: ${error.message}`);
            throw new Error(`Fetch error! status: ${response.message}`);
        }
    }

    function setTitleName(name) {
        titleName = name;
    }

    function setVideoUrl(url) {
        videoUrl = url;
    }

    function getCurrentTime() {
        return new Date().getTime();
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

    async function loadData(cacheKey, url, containerClass, title) {
        showLoading();

        content.querySelector('#lists').style.display = 'flex';
        const containerDiv = content.querySelector(`${containerClass}`);

        if (isCacheValid(cacheKey)) {
            const cachedData = JSON.parse(localStorage.getItem(`cached_${cacheKey}_${url}`));
            if (cachedData) {
                displayData(cachedData, containerDiv, title);
                return;
            }
        }

        url = BASE_LATIN_URL_LIST + SERIE_URL + url
        console.log('URL TO LOAD DATA ' + url)

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

        displayData(dataMap, containerDiv, title);
    }

    function getVideoCacheKey(videoUrl) {
        // console.log(videoUrl)
        return `pokemon-video-time-${videoUrl}`;
    }

    function displayData(dataMap, containerDiv, title) {
        hideLoading();

        content.querySelector(`#title`).innerText = title;
        containerDiv.innerHTML = '';

        let index = 0;
        for (const [itemLink, itemNames] of Object.entries(dataMap)) {
            index = index + 1;

            let progress = null;
            let total = null;

            const seasonAndEpisode = extractSeasonAndEpisode(itemLink);
            const season = seasonAndEpisode.season;
            const episode = seasonAndEpisode.episode;

            if (`#${containerDiv.id}` === CONTAINER_EPISODES_LIST_ID) {
                let videoUrl = null;
                if (season && episode) {
                    videoUrl = buildVideoUrl(season, episode);
                }
                const videoKey = getVideoCacheKey(videoUrl);

                const savedTime = localStorage.getItem(videoKey);
                if (savedTime) {
                    const savedProgress = JSON.parse(savedTime);
                    progress = savedProgress.c;
                    total = savedProgress.t;
                }
            }

            const a = document.createElement('a');
            const itemNamesTrimmed = itemNames.map(name => name.trim());

            let itemName = itemNamesTrimmed.join(' ');
            itemName = `${index}. ${itemName}`;

            let newId = `t${season}`;
            let newUrl = '?season=' + season
            if (episode) {
                newUrl += '&episode=' + episode
                newId += `-e${episode}`
            }

            a.innerText = itemName;
            a.id = newId;
            a.href = newUrl;

            const divProgress = document.createElement('div');
            divProgress.className = 'list-progress';
            a.appendChild(divProgress);

            if (progress) {
                const percentage = (parseFloat(progress) / total) * 100;
                divProgress.style.background = `linear-gradient(to right, #f05656 ${percentage}%, transparent ${percentage}%)`;
            }

            containerDiv.appendChild(a);
        }

        console.log("LOAD LIST FOR " + title)
    }

    function extractSeason(url) {
        const regex = /temporada-(\d+)/;
        const match = url.match(regex);
        if (match) {
            return parseInt(match[1])
        }
        return null;
    }

    function extractEpisode(url) {
        const regex = /episodio-(\d+)/;
        const match = url.match(regex);
        if (match) {
            return parseInt(match[1])
        }
        return null;
    }

    function extractSeasonAndEpisode(url) {
        return {
            season: extractSeason(url),
            episode: extractEpisode(url)
        };
    }

    function buildVideoUrl(season, episode) {
        return `${BASE_LATIN_URL_VIDEO}${SERIE_URL}/t${season.toString().padStart(2, '0')}/t${season.toString().padStart(2, '0')}_e${episode.toString().padStart(2, '0')}.es-la.mp4`;
    }

    function setupVideoPlayer(url) {
        isInVideo = true;
        setVideoUrl(url)

        content.querySelector('#lists').style.display = 'none';
        const videoContainer = content.querySelector('#video-container');
        const videoElement = videoContainer.querySelector('#pokemon-video');

        videoElement.style.height = '100vh';

        videoElement.addEventListener('waiting', showLoading);
        videoElement.addEventListener('playing', hideLoading);

        videoContainer.appendChild(videoElement);

        videoElement.autoplay = true;
        videoElement.src = url;
        // videoElement.requestFullscreen()

        videoFunctions(videoElement)

        hideCursor()

        console.log("SET TITLE  " + titleName)
        content.querySelector(`#title`).innerText = titleName;
    }

    function videoFunctions(videoElement) {
        const customVideoPlayer = document.getElementById('video');
        const playPauseButton = document.getElementById('play-pause');
        const rewindButton = document.getElementById('rewind');
        const fastForwardButton = document.getElementById('fast-forward');
        const exitFullscreenButton = document.getElementById('exit-fullscreen');
        const progressBar = document.getElementById('progress-bar');
        const controls = document.getElementById('controls');
        const progressTime = document.getElementById('progress-time');
        const totalDuration = document.getElementById('duration-total');

        function restartFadeOutAnimation() {
            showCursor();

            controls.classList.remove('fade-out-element');
            document.getElementById('title').classList.remove('fade-out-element');
            void controls.offsetWidth; // Truco para reiniciar la animación
            controls.classList.add('fade-out-element');
            document.getElementById('title').classList.add('fade-out-element');

            controls.addEventListener('animationend', () => {
                hideCursor()
            });
        }

        document.body.classList.add('video');
        restartFadeOutAnimation()

        customVideoPlayer.classList.remove('hidden');

        if (videoElement) {
            const videoKey = getVideoCacheKey(videoUrl);

            const savedTime = localStorage.getItem(videoKey);
            if (savedTime) {
                videoElement.currentTime = parseFloat(JSON.parse(savedTime).c) - 3;
            }

            videoElement.addEventListener('timeupdate', function () {
                const currentTime = videoElement.currentTime;
                const duration = videoElement.duration;

                if (isFinite(currentTime) && isFinite(duration) && duration > 0) {
                    progressBar.value = (currentTime / duration) * 100;
                    localStorage.setItem(videoKey, `{"c": "${videoElement.currentTime}", "t": "${videoElement.duration}"}`);

                    updateVideoTime()

                    // Mostrar el botón "Siguiente episodio" cuando falten 20 segundos
                    const timeRemaining = videoElement.duration - videoElement.currentTime;
                    if (timeRemaining <= 60 && !document.getElementById('next-episode-btn')) {
                        showNextEpisodeButton();
                    } else {
                        hideNextEpisodeButton();
                    }

                    if (timeRemaining < 1) {
                        exitPlayer()
                    }
                }

            });
        }

        function updateVideoTime() {
            progressTime.innerHTML = formatTime(videoElement.currentTime);
            totalDuration.innerHTML = formatTime(videoElement.duration);
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        function exitPlayer() {
            // const customVideoPlayer = document.getElementById('video');
            // const titleElement = document.getElementById('title');
            //
            // videoElement.pause();
            //
            // showCursor();
            // restartFadeOutAnimation();
            //
            // customVideoPlayer.classList.add('hidden');
            // titleElement.classList.remove('fade-out-element');
            // document.body.classList.remove('video');
            // // window.history.back();
            const urlParams = new URLSearchParams(window.location.search);
            window.location.href = '?season=' + urlParams.get('season');
        }

        function playPauseVideo(allowPause = true) {
            if (videoElement.paused || !allowPause) {
                videoElement.play();
                playPauseButton.innerText = 'Pause';
            } else {
                videoElement.pause();
                playPauseButton.innerText = 'Play';
            }
            restartFadeOutAnimation()
        }

        function rewindVideo() {
            videoElement.currentTime -= REWIND_FASTWARD_TIME_SECONDS;
            restartFadeOutAnimation()
        }

        function forwardVideo() {
            videoElement.currentTime += REWIND_FASTWARD_TIME_SECONDS;
            restartFadeOutAnimation()
        }

        progressBar.addEventListener('input', function () {
            videoElement.currentTime = (progressBar.value / 100) * videoElement.duration;
        });

        playPauseButton.addEventListener('click', () => {
            playPauseVideo()
        });

        rewindButton.addEventListener('click', () => {
            rewindVideo()
        });

        fastForwardButton.addEventListener('click', () => {
            forwardVideo()
        });

        exitFullscreenButton.addEventListener('click', () => {
            exitPlayer();
        });

        document.addEventListener('keydown', (event) => {
            if (!isInVideo) return false;

            console.log('keydown')
            restartFadeOutAnimation();

            const keyActions = {
                'ArrowLeft': rewindVideo,
                'ArrowRight': forwardVideo,
                ' ': playPauseVideo,
                'Escape': exitPlayer,
                'Backspace': exitPlayer,
                'Enter': playPauseVideo
            };

            if (keyActions[event.key]) {
                keyActions[event.key]();
            }
        });

        // videoElement.addEventListener('click', () => {
        //     playPauseVideo()
        // });

        document.addEventListener('mousemove', () => {
            restartFadeOutAnimation()
        });

        const simulateClick = (e) => {
            if (e.target.id === 'video-container' || e.target.id === 'pokemon-video') {
                playPauseVideo()
            }
        };
        document.addEventListener('click', simulateClick);

        document.dispatchEvent(new MouseEvent('click'));

        videoElement.addEventListener('canplaythrough', function () {
            document.dispatchEvent(new KeyboardEvent('Enter'));

            playPauseVideo(false)
        });

    }

    function playEpisodeVideo(season, episode) {
        content.querySelector(`#title`).innerText = titleName;

        console.log('PLAYING EPISODE');
        if (season && episode) {
            nextLink = getNextEpisodeLink(season, episode);
            console.log("next episode", nextLink);
            const videoUrl = buildVideoUrl(season, episode);
            console.log(`Reproduciendo video desde: ${videoUrl}`);

            const currentElement = document.getElementById(`t${season}-e${episode}`)
            setTitleName(currentElement.innerText.trim());

            setupVideoPlayer(videoUrl);
        } else {
            console.error('No se pudo extraer la temporada y episodio de la URL.');
        }
    }

    function showNextEpisodeButton() {
        if (nextLink) {
            nextEpisodeBtn.classList.remove('hidden')

            nextEpisodeBtn.addEventListener('click', () => {
                window.location.href = nextLink;
            });

            nextEpisodeBtn.addEventListener('animationend', () => {
                window.location.href = nextLink;
            });

            document.addEventListener('click', () => {
                nextEpisodeBtn.remove();
            });
        }
    }

    function hideNextEpisodeButton() {
        nextEpisodeBtn.classList.add('hidden')
    }

    function getNextEpisodeLink(season, episode) {
        const allLinks = Array.from(document.querySelectorAll(`${CONTAINER_EPISODES_LIST_ID} a`));

        if (allLinks.length > episode) {
            return '?season=' + season + '&episode=' + ++episode;
        }

        return null;
    }

    function handleURLChange() {
        isInVideo = false;
        showCursor();

        document.getElementById('title').classList.remove('fade-out-element');
        document.getElementById('next-episode').classList.add('hidden');
        document.body.classList.remove('video');

        const urlParams = new URLSearchParams(window.location.search);
        const season = urlParams.get('season');
        const episode = urlParams.get('episode');

        // LOADING SERIES LIST
        loadData('series', ``, CONTAINER_SESSIONS_LIST_ID, 'TEMPORADAS').then(function () {
            if (season) {
                console.log(document.querySelector(`#t${season}`))
                document.querySelector(`#t${season}`).classList.add('selected')

                const hash = `/temporada-${season}`;
                console.log("SEASON HASH " + hash)
                // LOADING EPISODES LIST
                loadData('episodes', hash, CONTAINER_EPISODES_LIST_ID, 'EPISODIOS').then(function () {
                    if (episode) {
                        const hash = `/temporada-${season}/episodio-${episode}`;
                        console.log("PLAYING HASH " + hash)
                        // PLAYING VIDEO
                        playEpisodeVideo(season, episode);
                    }
                });

            }
        });

    }

    window.addEventListener('popstate', handleURLChange);

    // Initial Loading
    handleURLChange();
});
