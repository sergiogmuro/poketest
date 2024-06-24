"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
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
  var errorPopup = document.getElementById('error-popup');
  var errorDetails = document.getElementById('error-details');
  errorDetails.innerText = error;
  errorPopup.style.display = 'block';
}

// Captura de errores globales
window.onerror = function (message, source, lineno, colno, error) {
  var errorMessage = "Error: ".concat(message, "\nSource: ").concat(source, "\nLine: ").concat(lineno, ", Column: ").concat(colno, "\nStack Trace: ").concat(error ? error.stack : 'N/A');
  showErrorPopup(errorMessage);
  return false; // Prevent the default browser error handler
};
var REWIND_FASTWARD_TIME_SECONDS = 15;
var CONTAINER_SESSIONS_LIST_ID = '#sessions-list';
var CONTAINER_EPISODES_LIST_ID = '#episodes-list';
var BASE_URL = 'https://pokemon-project.com';
var LATIN_URL = '/episodios/latino';
var BASE_LATIN_URL_LIST = BASE_URL + LATIN_URL;
var SERIE_URL = '/serie-ash';
var BASE_LATIN_URL_VIDEO = BASE_URL + '/descargas/epis';
var titleName = '';
var videoUrl = null;
var isInVideo = false;
var nextLink = null;
document.addEventListener('DOMContentLoaded', function () {
  var content = document.getElementById('content');
  var nextEpisodeBtn = document.getElementById('next-episode');
  function fetchHTML(_x) {
    return _fetchHTML.apply(this, arguments);
  }
  function _fetchHTML() {
    _fetchHTML = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(url) {
      var _response, text, parser;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            showLoading();
            _context.next = 4;
            return fetch(url);
          case 4:
            _response = _context.sent;
            if (_response.ok) {
              _context.next = 8;
              break;
            }
            hideLoading();
            throw new Error("HTTP error! status: ".concat(_response.status));
          case 8:
            _context.next = 10;
            return _response.text();
          case 10:
            text = _context.sent;
            parser = new DOMParser();
            hideLoading();
            return _context.abrupt("return", parser.parseFromString(text, 'text/html'));
          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](0);
            hideLoading();
            showErrorPopup("Failed to fetch: ".concat(url, "\nError: ").concat(_context.t0.message));
            throw new Error("Fetch error! status: ".concat(response.message));
          case 21:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 16]]);
    }));
    return _fetchHTML.apply(this, arguments);
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
    var lastUpdateTime = localStorage.getItem("".concat(cacheKey, "_cacheUpdateTime"));
    if (lastUpdateTime) {
      var currentTime = getCurrentTime();
      var timeElapsed = currentTime - parseInt(lastUpdateTime);
      var oneHourInMillis = 60 * 60 * 1000 * 12; // 12 horas en milisegundos
      return timeElapsed < oneHourInMillis;
    }
    return false;
  }
  function loadData(_x2, _x3, _x4, _x5) {
    return _loadData.apply(this, arguments);
  }
  function _loadData() {
    _loadData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(cacheKey, url, containerClass, title) {
      var containerDiv, cachedData, doc, elements, dataMap;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            showLoading();
            content.querySelector('#lists').style.display = 'flex';
            containerDiv = content.querySelector("".concat(containerClass));
            if (!isCacheValid(cacheKey)) {
              _context2.next = 8;
              break;
            }
            cachedData = JSON.parse(localStorage.getItem("cached_".concat(cacheKey, "_").concat(url)));
            if (!cachedData) {
              _context2.next = 8;
              break;
            }
            displayData(cachedData, containerDiv, title);
            return _context2.abrupt("return");
          case 8:
            url = BASE_LATIN_URL_LIST + SERIE_URL + url;
            console.log('URL TO LOAD DATA ' + url);
            _context2.next = 12;
            return fetchHTML(url);
          case 12:
            doc = _context2.sent;
            elements = doc.querySelectorAll('.real-table tbody tr a');
            dataMap = {};
            elements.forEach(function (item) {
              var itemName = item.innerText;
              var itemLink = item.href;
              if (dataMap[itemLink]) {
                dataMap[itemLink].push(itemName);
              } else {
                dataMap[itemLink] = [itemName];
              }
            });
            localStorage.setItem("".concat(cacheKey, "_cacheUpdateTime"), getCurrentTime());
            localStorage.setItem("cached_".concat(cacheKey, "_").concat(url), JSON.stringify(dataMap));
            displayData(dataMap, containerDiv, title);
          case 19:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return _loadData.apply(this, arguments);
  }
  function getVideoCacheKey(videoUrl) {
    // console.log(videoUrl)
    return "pokemon-video-time-".concat(videoUrl);
  }
  function displayData(dataMap, containerDiv, title) {
    hideLoading();
    content.querySelector("#title").innerText = title;
    containerDiv.innerHTML = '';
    var index = 0;
    for (var _i = 0, _Object$entries = Object.entries(dataMap); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        itemLink = _Object$entries$_i[0],
        itemNames = _Object$entries$_i[1];
      index = index + 1;
      var progress = null;
      var total = null;
      var seasonAndEpisode = extractSeasonAndEpisode(itemLink);
      var season = seasonAndEpisode.season;
      var episode = seasonAndEpisode.episode;
      if ("#".concat(containerDiv.id) === CONTAINER_EPISODES_LIST_ID) {
        var _videoUrl = null;
        if (season && episode) {
          _videoUrl = buildVideoUrl(season, episode);
        }
        var videoKey = getVideoCacheKey(_videoUrl);
        var savedTime = localStorage.getItem(videoKey);
        if (savedTime) {
          var savedProgress = JSON.parse(savedTime);
          progress = savedProgress.c;
          total = savedProgress.t;
        }
      }
      var a = document.createElement('a');
      var itemNamesTrimmed = itemNames.map(function (name) {
        return name.trim();
      });
      var itemName = itemNamesTrimmed.join(' ');
      itemName = "".concat(index, ". ").concat(itemName);
      var newId = "t".concat(season);
      var newUrl = '?season=' + season;
      if (episode) {
        newUrl += '&episode=' + episode;
        newId += "-e".concat(episode);
      }
      a.innerText = itemName;
      a.id = newId;
      a.href = newUrl;
      var divProgress = document.createElement('div');
      divProgress.className = 'list-progress';
      a.appendChild(divProgress);
      if (progress) {
        var percentage = parseFloat(progress) / total * 100;
        divProgress.style.background = "linear-gradient(to right, #f05656 ".concat(percentage, "%, transparent ").concat(percentage, "%)");
      }
      containerDiv.appendChild(a);
    }
    console.log("LOAD LIST FOR " + title);
  }
  function extractSeason(url) {
    var regex = /temporada-(\d+)/;
    var match = url.match(regex);
    if (match) {
      return parseInt(match[1]);
    }
    return null;
  }
  function extractEpisode(url) {
    var regex = /episodio-(\d+)/;
    var match = url.match(regex);
    if (match) {
      return parseInt(match[1]);
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
    return "".concat(BASE_LATIN_URL_VIDEO).concat(SERIE_URL, "/t").concat(season.toString().padStart(2, '0'), "/t").concat(season.toString().padStart(2, '0'), "_e").concat(episode.toString().padStart(2, '0'), ".es-la.mp4");
  }
  function setupVideoPlayer(url) {
    isInVideo = true;
    setVideoUrl(url);
    content.querySelector('#lists').style.display = 'none';
    var videoContainer = content.querySelector('#video-container');
    var videoElement = videoContainer.querySelector('#pokemon-video');
    videoElement.style.height = '100vh';
    videoElement.addEventListener('waiting', showLoading);
    videoElement.addEventListener('playing', hideLoading);
    videoContainer.appendChild(videoElement);
    videoElement.autoplay = true;
    videoElement.src = url;
    // videoElement.requestFullscreen()

    videoFunctions(videoElement);
    hideCursor();
    console.log("SET TITLE  " + titleName);
    content.querySelector("#title").innerText = titleName;
  }
  function videoFunctions(videoElement) {
    var customVideoPlayer = document.getElementById('video');
    var playPauseButton = document.getElementById('play-pause');
    var rewindButton = document.getElementById('rewind');
    var fastForwardButton = document.getElementById('fast-forward');
    var exitFullscreenButton = document.getElementById('exit-fullscreen');
    var progressBar = document.getElementById('progress-bar');
    var controls = document.getElementById('controls');
    var progressTime = document.getElementById('progress-time');
    var totalDuration = document.getElementById('duration-total');
    function restartFadeOutAnimation() {
      showCursor();
      controls.classList.remove('fade-out-element');
      document.getElementById('title').classList.remove('fade-out-element');
      void controls.offsetWidth; // Truco para reiniciar la animación
      controls.classList.add('fade-out-element');
      document.getElementById('title').classList.add('fade-out-element');
      controls.addEventListener('animationend', function () {
        hideCursor();
      });
    }
    document.body.classList.add('video');
    restartFadeOutAnimation();
    customVideoPlayer.classList.remove('hidden');
    if (videoElement) {
      var videoKey = getVideoCacheKey(videoUrl);
      var savedTime = localStorage.getItem(videoKey);
      if (savedTime) {
        videoElement.currentTime = parseFloat(JSON.parse(savedTime).c) - 3;
      }
      videoElement.addEventListener('timeupdate', function () {
        var currentTime = videoElement.currentTime;
        var duration = videoElement.duration;
        if (isFinite(currentTime) && isFinite(duration) && duration > 0) {
          progressBar.value = currentTime / duration * 100;
          localStorage.setItem(videoKey, "{\"c\": \"".concat(videoElement.currentTime, "\", \"t\": \"").concat(videoElement.duration, "\"}"));
          updateVideoTime();

          // Mostrar el botón "Siguiente episodio" cuando falten 20 segundos
          var timeRemaining = videoElement.duration - videoElement.currentTime;
          if (timeRemaining <= 60 && !document.getElementById('next-episode-btn')) {
            showNextEpisodeButton();
          } else {
            hideNextEpisodeButton();
          }
          if (timeRemaining < 1) {
            exitPlayer();
          }
        }
      });
    }
    function updateVideoTime() {
      progressTime.innerHTML = formatTime(videoElement.currentTime);
      totalDuration.innerHTML = formatTime(videoElement.duration);
    }
    function formatTime(seconds) {
      var minutes = Math.floor(seconds / 60);
      var remainingSeconds = Math.floor(seconds % 60);
      return "".concat(minutes.toString().padStart(2, '0'), ":").concat(remainingSeconds.toString().padStart(2, '0'));
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
      var urlParams = new URLSearchParams(window.location.search);
      window.location.href = '?season=' + urlParams.get('season');
    }
    function playPauseVideo() {
      var allowPause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (videoElement.paused || !allowPause) {
        videoElement.play();
        playPauseButton.innerText = 'Pause';
      } else {
        videoElement.pause();
        playPauseButton.innerText = 'Play';
      }
      restartFadeOutAnimation();
    }
    function rewindVideo() {
      videoElement.currentTime -= REWIND_FASTWARD_TIME_SECONDS;
      restartFadeOutAnimation();
    }
    function forwardVideo() {
      videoElement.currentTime += REWIND_FASTWARD_TIME_SECONDS;
      restartFadeOutAnimation();
    }
    progressBar.addEventListener('input', function () {
      videoElement.currentTime = progressBar.value / 100 * videoElement.duration;
    });
    playPauseButton.addEventListener('click', function () {
      playPauseVideo();
    });
    rewindButton.addEventListener('click', function () {
      rewindVideo();
    });
    fastForwardButton.addEventListener('click', function () {
      forwardVideo();
    });
    exitFullscreenButton.addEventListener('click', function () {
      exitPlayer();
    });
    document.addEventListener('keydown', function (event) {
      if (!isInVideo) return false;
      console.log('keydown');
      restartFadeOutAnimation();
      var keyActions = {
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

    document.addEventListener('mousemove', function () {
      restartFadeOutAnimation();
    });
    var simulateClick = function simulateClick(e) {
      if (e.target.id === 'video-container' || e.target.id === 'pokemon-video') {
        playPauseVideo();
      }
    };
    document.addEventListener('click', simulateClick);
    document.dispatchEvent(new MouseEvent('click'));
    videoElement.addEventListener('canplaythrough', function () {
      document.dispatchEvent(new KeyboardEvent('Enter'));
      playPauseVideo(false);
    });
  }
  function playEpisodeVideo(season, episode) {
    content.querySelector("#title").innerText = titleName;
    console.log('PLAYING EPISODE');
    if (season && episode) {
      nextLink = getNextEpisodeLink(season, episode);
      console.log("next episode", nextLink);
      var _videoUrl2 = buildVideoUrl(season, episode);
      console.log("Reproduciendo video desde: ".concat(_videoUrl2));
      var currentElement = document.getElementById("t".concat(season, "-e").concat(episode));
      setTitleName(currentElement.innerText.trim());
      setupVideoPlayer(_videoUrl2);
    } else {
      console.error('No se pudo extraer la temporada y episodio de la URL.');
    }
  }
  function showNextEpisodeButton() {
    if (nextLink) {
      nextEpisodeBtn.classList.remove('hidden');
      nextEpisodeBtn.addEventListener('click', function () {
        window.location.href = nextLink;
      });
      nextEpisodeBtn.addEventListener('animationend', function () {
        window.location.href = nextLink;
      });
      document.addEventListener('click', function () {
        nextEpisodeBtn.remove();
      });
    }
  }
  function hideNextEpisodeButton() {
    nextEpisodeBtn.classList.add('hidden');
  }
  function getNextEpisodeLink(season, episode) {
    var allLinks = Array.from(document.querySelectorAll("".concat(CONTAINER_EPISODES_LIST_ID, " a")));
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
    var urlParams = new URLSearchParams(window.location.search);
    var season = urlParams.get('season');
    var episode = urlParams.get('episode');

    // LOADING SERIES LIST
    loadData('series', "", CONTAINER_SESSIONS_LIST_ID, 'TEMPORADAS').then(function () {
      if (season) {
        console.log(document.querySelector("#t".concat(season)));
        document.querySelector("#t".concat(season)).classList.add('selected');
        var hash = "/temporada-".concat(season);
        console.log("SEASON HASH " + hash);
        // LOADING EPISODES LIST
        loadData('episodes', hash, CONTAINER_EPISODES_LIST_ID, 'EPISODIOS').then(function () {
          if (episode) {
            var _hash = "/temporada-".concat(season, "/episodio-").concat(episode);
            console.log("PLAYING HASH " + _hash);
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