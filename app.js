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

const REWIND_FASTWARD_TIME_SECONDS = 15;
const CONTAINER_SESSIONS_LIST_ID = '#sessions-list';
const CONTAINER_EPISODES_LIST_ID = '#episodes-list';
const BASE_URL = 'https://pokemon-project.com';
const LATIN_URL = '/episodios/latino';
const BASE_LATIN_URL_LIST = BASE_URL + '/episodios/latino';
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

    function updateURL(season, episode) {
        const url = new URL(window.location);
        const searchParams = new URLSearchParams(url.search);
        searchParams.set('season', season);
        searchParams.set('episode', episode);
        url.search = searchParams.toString();
        window.history.pushState({}, '', url);
    }


    function getCurrentTime() {
        return new Date().getTime();
    }


    function handleItemClick(e) {
        if (!Element.prototype.closest) {
            console.error('El navegador no es compatible con el método closest.');
            return;
        }


        const clickedElement = e;
        const seasonAndEpisode = extractSeasonAndEpisode(clickedElement.getAttribute('href'));
        console.log(seasonAndEpisode)
        if (seasonAndEpisode) {
            e.preventDefault();
            const {season, episode} = seasonAndEpisode;
            setName(clickedElement.innerText.trim());
            // updateURL(season, episode);
        }
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

    async function loadData(cacheKey, url, containerClass, title, styles) {
        showLoading();

        content.querySelector('#lists').style.display = 'flex';
        const containerDiv = content.querySelector(`${containerClass}`);
        // content.querySelector(`#video-container`).innerHTML = '';

        if (isCacheValid(cacheKey)) {
            const cachedData = JSON.parse(localStorage.getItem(`cached_${cacheKey}_${url}`));
            if (cachedData) {
                displayData(cachedData, containerDiv, title, styles);
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

        displayData(dataMap, containerDiv, title, styles);
    }

    function getVideoCacheKey(videoUrl) {
        // console.log(videoUrl)
        return `pokemon-video-time-${videoUrl}`;
    }

    function displayData(dataMap, containerDiv, title, styles) {
        hideLoading();

        content.querySelector(`#title`).innerText = title + ' - ' + titleName;
        // content.innerHTML = `<h1>${title}</h1><div class="${containerClass} ${styles}"></div>`;
        containerDiv.innerHTML = '';

        let index = 0;
        for (const [itemLink, itemNames] of Object.entries(dataMap)) {
            index = index + 1;

            let progress = null;
            let total = null;

            if (`#${containerDiv.id}` === CONTAINER_EPISODES_LIST_ID) {
                const seasonAndEpisode = extractSeasonAndEpisode(itemLink);
                let videoUrl = null;
                if (seasonAndEpisode) {
                    videoUrl = buildVideoUrl(seasonAndEpisode.season, seasonAndEpisode.episode);
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

            const seasonAndEpisode = extractSeasonAndEpisode(itemLink);
            // console.log(seasonAndEpisode, itemLink.replace(BASE_LATIN_URL_LIST + SERIE_URL, ''))

            let newUrl = '?season=' + seasonAndEpisode.season
            if (seasonAndEpisode.episode) {
                newUrl += '&episode=' + seasonAndEpisode.episode
            }

            a.innerText = itemName;
            a.href = newUrl;
            // a.addEventListener('click', (e) => {
            //     e.preventDefault();
            //     setName(itemName)
            //     // updateURL(itemLink);
            //     // handleItemClick(a)
            //     window.location.href = newUrl
            // });

            if (progress) {
                const percentage = (parseFloat(progress) / total) * 100;
                a.style.border = `1px solid #0056b3`;
                a.style.color = `black`;
                a.style.background = `linear-gradient(to right, #0056b3 ${percentage}%, transparent ${percentage}%)`;
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
        return `${BASE_LATIN_URL_VIDEO}${SERIE_URL}/t${'0'.padEnd(2, season)}/t${'0'.padEnd(2, season)}_e${'0'.padEnd(2, episode)}.es-la.mp4`;
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

        const simulateClick = () => {
            videoElement.play();
            document.removeEventListener('click', simulateClick);
        };
        document.addEventListener('click', simulateClick);

        document.dispatchEvent(new MouseEvent('click'));

        videoElement.addEventListener('canplaythrough', function () {
            document.dispatchEvent(new KeyboardEvent('Enter'));

            videoElement.play();
        });

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
        const progressTime = document.getElementById('progress-time');
        const totalDuration = document.getElementById('duration-total');

        function restartFadeOutAnimation() {
            showCursor();

            controls.classList.remove('fade-out-element');
            document.getElementById('title').classList.remove('fade-out-element');
            void controls.offsetWidth; // Truco para reiniciar la animación
            controls.classList.add('fade-out-element');
            document.getElementById('title').classList.add('fade-out-element');

            setTimeout(hideCursor, 5000);
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
            const customVideoPlayer = document.getElementById('video');
            const titleElement = document.getElementById('title');

            videoElement.pause();

            showCursor();
            restartFadeOutAnimation();

            customVideoPlayer.classList.add('hidden');
            titleElement.classList.remove('fade-out-element');
            document.body.classList.remove('video');
           // window.history.back();
            const urlParams = new URLSearchParams(window.location.search);
            window.location.href = '?season=' + urlParams.get('season');
        }

        function playPauseVideo() {
            if (videoElement.paused) {
                videoElement.play();
                playPauseButton.innerText = 'Pause';
            } else {
                videoElement.pause();
                playPauseButton.innerText = 'Play';
            }
            restartFadeOutAnimation()
        }

        progressBar.addEventListener('input', function () {
            videoElement.currentTime = (progressBar.value / 100) * videoElement.duration;
        });

        playPauseButton.addEventListener('click', () => {
            playPauseVideo()
        });

        rewindButton.addEventListener('click', () => {
            videoElement.currentTime -= REWIND_FASTWARD_TIME_SECONDS;
            restartFadeOutAnimation()
        });

        fastForwardButton.addEventListener('click', () => {
            videoElement.currentTime += REWIND_FASTWARD_TIME_SECONDS;
            restartFadeOutAnimation()
        });

        exitFullscreenButton.addEventListener('click', () => {
            exitPlayer();
        });

        document.addEventListener('keydown', (event) => {
            if (!isInVideo) return false;

            console.log('keydown')
            restartFadeOutAnimation();

            const keyActions = {
                'ArrowLeft': () => videoElement.currentTime -= REWIND_FASTWARD_TIME_SECONDS,
                'ArrowRight': () => videoElement.currentTime += REWIND_FASTWARD_TIME_SECONDS,
                ' ': () => {
                    event.preventDefault();
                    playPauseVideo()
                },
                'Escape': exitPlayer,
                'Backspace': exitPlayer,
                'Enter': () => {
                    if (videoElement.paused) {
                        videoElement.play();
                    } else {
                        videoElement.pause();
                    }
                }
            };

            if (keyActions[event.key]) {
                keyActions[event.key]();
            }
        });

        videoElement.addEventListener('click', () => {
            playPauseVideo()
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

        // LOADING SERIES LIST
        loadData('series', ``, CONTAINER_SESSIONS_LIST_ID, 'TEMPORADAS');

        const urlParams = new URLSearchParams(window.location.search);
        const season = urlParams.get('season');
        const episode = urlParams.get('episode');
        if (season) {
            const hash = `/temporada-${season}`;
            console.log("SEASON HASH " + hash)
            // LOADING EPISODES LIST
            loadData('episodes', hash, CONTAINER_EPISODES_LIST_ID, 'EPISODIOS', 'right').then(function () {
                if (episode) {
                    const hash = `/temporada-${season}/episodio-${episode}`;
                    console.log("PLAYING HASH " + hash)
                    // PLAYING VIDEO
                    playEpisodeVideo(season, episode);
                }
            });
        }
    }

    window.addEventListener('popstate', handleURLChange);

// Initial Loading
    handleURLChange();

    //
    // function handleHashChange() {
    //     isInVideo = false;
    //     showCursor();
    //
    //     document.getElementById('title').classList.remove('fade-out-element');
    //     document.getElementById('next-episode').classList.add('hidden')
    //     document.body.classList.remove('video');
    //
    //     // LOADING SERIES LIST
    //     loadData('series', `${baseURL}/serie-ash`, CONTAINER_SESSIONS_LIST_ID, 'TEMPORADAS');
    //
    //     const hash = window.location.hash.substring(1);
    //     if (hash) {
    //         if (hash.includes('temporada-')) {
    //             // LOADING EPISODES LIST
    //             loadData('episodes', hash, CONTAINER_EPISODES_LIST_ID, 'EPISODIOS', 'right');
    //             console.log('DATA SESSION')
    //             if (hash.includes('episodio-')) {
    //                 // PLAYING VIDEO
    //                 console.log('DATA vide')
    //                 playEpisodeVideo(hash);
    //             }
    //         }
    //     }
    // }
    //
    // window.addEventListener('hashchange', handleHashChange);
    //
    // // Initial Loading
    // handleHashChange();
});
