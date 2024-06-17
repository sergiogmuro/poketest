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

    async function loadSeries() {
        console.log('LOADING SERIES')
        const url = `${baseURL}/serie-ash`;
        const doc = await fetchHTML(url);
        const seriesElements = doc.querySelectorAll('.real-table tbody tr a');

        content.innerHTML = '<h1>Series de Pokémon</h1><div class="series"></div>';
        const seriesDiv = content.querySelector('.series');

        const seriesMap = {};
        seriesElements.forEach(series => {
            const seriesName = series.innerText;
            const seriesLink = series.href;

            if (seriesMap[seriesLink]) {
                seriesMap[seriesLink].push(seriesName);
            } else {
                seriesMap[seriesLink] = [seriesName];
            }
        });

        for (const [seriesLink, seriesNames] of Object.entries(seriesMap)) {
            const a = document.createElement('a');
            const serieName = seriesNames.join(' - ');
            a.innerText = serieName;
            a.href = '?temp=' + seriesLink + '&name=' + serieName;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                // loadEpisodes(seriesLink);
                updateURL(seriesLink);
            });
            seriesDiv.appendChild(a);
            seriesDiv.appendChild(document.createElement('br'));
        }
    }

    async function loadEpisodes(seriesURL) {
        console.log('LOADING EPISODES')
        const doc = await fetchHTML(seriesURL);
        const episodeElements = doc.querySelectorAll('.real-table tbody tr a');  // Ajusta el selector según la estructura del HTML de la página

        content.innerHTML = '<h1>Episodios</h1><div class="episodes"></div>';
        const episodesDiv = content.querySelector('.episodes');

        const episodeMap = {};
        episodeElements.forEach(episode => {
            const episodeName = episode.innerText;
            const episodeLink = episode.href;

            if (episodeMap[episodeLink]) {
                episodeMap[episodeLink].push(episodeName);
            } else {
                episodeMap[episodeLink] = [episodeName];
            }
        });

        for (const [episodesLink, episodesNames] of Object.entries(episodeMap)) {
            const a = document.createElement('a');
            const episodeName = episodesNames.join(' - ');
            a.innerText = episodeName;
            a.href = '?temp=' + episodesLink + '&name=' + episodeName;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                updateURL(episodesLink);
            });
            episodesDiv.appendChild(a);
            episodesDiv.appendChild(document.createElement('br'));
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
        videoElement.load();
        videoElement.play();
    }

    function playEpisodeVideo(episodeURL) {
        console.log('PLAYING EPISODE')
        const seasonAndEpisode = extractSeasonAndEpisode(episodeURL);
        if (seasonAndEpisode) {
            const videoUrl = buildVideoUrl(seasonAndEpisode.season, seasonAndEpisode.episode);
            console.log(`Reproduciendo video desde: ${videoUrl}`);
            setupVideoPlayer(videoUrl);
        } else {
            console.error('No se pudo extraer la temporada y episodio de la URL.');
        }
    }


    // Handle URL hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            if (hash.includes('temporada-') && hash.includes('episodio-')) {
                playEpisodeVideo(hash);
            } else {
                loadEpisodes(hash);
            }
        } else {
            loadSeries();
        }
    });

    // Initial load
    if (window.location.hash) {
        if (window.location.hash.includes('temporada-') && window.location.hash.includes('episodio-')) {
            playEpisodeVideo(window.location.hash.substring(1));
        } else {
            loadEpisodes(window.location.hash.substring(1));
        }
    } else {
        loadSeries();
    }
});
