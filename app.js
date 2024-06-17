document.addEventListener('DOMContentLoaded', function () {
    const content = document.getElementById('content');
    const baseURL = 'https://pokemon-project.com/episodios/latino';

    async function fetchHTML(url) {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(text, 'text/html');
    }

    function updateURL(hash) {
        window.location.hash = hash;
    }

    function getCurrentTime() {
        return new Date().getTime();
    }

    function isCacheValid(cacheKey) {
        const lastUpdateTime = localStorage.getItem(`${cacheKey}_cacheUpdateTime`);
        if (lastUpdateTime) {
            const currentTime = getCurrentTime();
            const timeElapsed = currentTime - parseInt(lastUpdateTime);
            const oneHourInMillis = 60 * 60 * 1000; // 1 hora en milisegundos
            return timeElapsed < oneHourInMillis;
        }
        return false;
    }

    async function loadData(cacheKey, url, displayFunction, title, styles) {
        console.log(`LOADING ${cacheKey?.toUpperCase()}`);
        if (isCacheValid(cacheKey)) {
            const cachedData = JSON.parse(localStorage.getItem(`cached_${cacheKey}_${url}`));
            if (cachedData) {
                displayFunction(cachedData, title, title, styles);
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

        displayFunction(dataMap, title, title);
    }

    function displayData(dataMap, containerClass, title, styles) {
        content.innerHTML = `<h1>${title}</h1><div class="${containerClass} ${styles}"></div>`;
        const containerDiv = content.querySelector(`.${containerClass}`);

        let index = 0;
        for (const [itemLink, itemNames] of Object.entries(dataMap)) {
            index = index + 1;
            const a = document.createElement('a');
            const itemNamesTrimmed = itemNames.map(name => name.trim());
            const itemName = itemNamesTrimmed.join(' ');
            a.innerText = `${index}. ${itemName}`;
            a.href = '#';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                updateURL(itemLink);
            });
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
        content.innerHTML = '<h1>Video</h1><div class="video"></div>';
        const videoContainer = content.querySelector('.video');

        const videoElement = document.createElement('video');
        videoElement.id = 'pokemon-video';
        videoElement.controls = true;
        videoElement.style.width = '100%';

        videoContainer.appendChild(videoElement);

        videoElement.src = url;
        videoElement.requestFullscreen()
        videoElement.load();
        videoElement.play();
    }

    function playEpisodeVideo(episodeURL) {
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
        const hash = window.location.hash.substring(1);
        if (hash) {
            if (hash.includes('temporada-') && hash.includes('episodio-')) {
                playEpisodeVideo(hash);
            } else {
                loadData('episodes', hash, displayData, 'EPISODIOS', 'right');
            }
        } else {
            loadData('series', `${baseURL}/serie-ash`, displayData, 'TEMPORADAS');
        }
    });

    // Initial load
    if (window.location.hash) {
        if (window.location.hash.includes('temporada-') && window.location.hash.includes('episodio-')) {
            playEpisodeVideo(window.location.hash.substring(1));
        } else {
            loadData('episodes', window.location.hash.substring(1), displayData, 'EPISODIOS', 'right');
        }
    } else {
        loadData('series', `${baseURL}/serie-ash`, displayData, 'TEMPORADAS');
    }
});
