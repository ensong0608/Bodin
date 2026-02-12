(function () {
  const SESSION_KEY = 'anniversary_unlocked';
  const MUSIC_SESSION_KEY = 'music_player_state';
  let enableLyrics = false;
  const body = document.body;
  const page = body.dataset.page || 'home';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playlist = discoverPlaylist();

  const fallbackContent = {
    site: {
      brand: 'Bodin + You',
      eyebrow: "Valentine's Day 2026",
      homeTitle: 'Bodin, My Baby',
      homeIntro: "We've been together for almost 25 years now and you still annoy me a lot.",
      homeSummary: 'Almost 25 years in and we still have the same chaotic energy.',
      footerText: "Valentine's Day Love",
      anniversaryDateISO: '2026-02-14',
      anniversaryDateText: 'February 14, 2026',
      privacyNote: 'Privacy note: This is a lightweight gate for casual privacy, not true security.',
      passphrase: 'teacher',
      enableLyrics: false
    },
    timeline: {
      title: 'Us, Over Time',
      subtitle: 'Our version of romance: sarcastic, goofy, and serious when it counts.',
      events: [
        { label: 'First Message', text: 'You poked my ass and I pretended to be cool. You saw through it.' },
        { label: 'First Official Date', text: 'I was nervous. You were perfect.' },
        { label: 'Officially Us', text: 'It was already official from day one.' },
        { label: 'First Trip', text: 'We packed too much, laughed even more.' },
        { label: 'Today', text: 'Gray hair, less teeth, still hot and sexy.' }
      ]
    },
    gallery: {
      title: 'Photo Gallery',
      subtitle: 'A few of our favorite moments.',
      items: [
        { src: 'assets/images/memory-1.svg', alt: 'Placeholder memory one', caption: 'The beginning of trouble.' },
        { src: 'assets/images/memory-2.svg', alt: 'Placeholder memory two', caption: 'We clean up nice.' },
        { src: 'assets/images/memory-3.svg', alt: 'Placeholder memory three', caption: 'Still hand in hand.' }
      ]
    },
    letter: {
      title: 'A Letter to My Baby Bodin',
      greeting: 'Bodin my Baby,',
      paragraphs: [
        'Almost 25 years together... and somehow you are still my favorite person to argue with about absolutely nothing.',
        'You are my home. You are my comfort. You are my fire. You are my peace.',
        'I love you with intention.'
      ],
      closing: 'Forever yours,',
      signature: 'Papi'
    }
  };

  initNavigation();
  initLockButton();
  initSmoothAnchors();

  if (page !== 'home' && !isUnlocked()) {
    window.location.replace('index.html');
    return;
  }

  init();

  function isUnlocked() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function setUnlocked(value) {
    sessionStorage.setItem(SESSION_KEY, value ? 'true' : 'false');
  }

  function clearUnlocked() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function init() {
    const content = await loadContent();
    playlist = resolvePlaylist(content);
    enableLyrics = resolveLyricsEnabled(content);

    renderShared(content);
    try {
      initMusicPlayer();
    } catch (error) {
      console.warn('Music player init failed:', error);
    }

    if (page === 'home') {
      initGate(content.site.passphrase || '');
      renderHome(content);
      renderSongGallery();
    }

    if (page === 'timeline') {
      renderTimeline(content.timeline);
    }

    if (page === 'gallery') {
      renderGallery(content.gallery);
    }

    if (page === 'letter') {
      renderLetter(content.letter);
      initReadProgress();
    }

    initReveal();
    initParallax();
  }

  async function loadContent() {
    try {
      const response = await fetch('assets/data/content.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch content.json');
      return await response.json();
    } catch (error) {
      console.warn('Using fallback content:', error);
      return fallbackContent;
    }
  }

  function initNavigation() {
    const button = document.querySelector('.menu-toggle');
    const nav = document.getElementById('site-nav');
    if (!button || !nav) return;

    button.addEventListener('click', function () {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.dataset.open = String(!expanded);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        button.setAttribute('aria-expanded', 'false');
        nav.dataset.open = 'false';
      });
    });
  }

  function initLockButton() {
    const lockButton = document.getElementById('lockButton');
    if (!lockButton) return;

    lockButton.addEventListener('click', function () {
      clearUnlocked();
      if (page === 'home') {
        applyGateState(false);
      } else {
        window.location.replace('index.html');
      }
    });
  }

  function initGate(passphrase) {
    const form = document.getElementById('gateForm');
    const input = document.getElementById('passphraseInput');
    const error = document.getElementById('gateError');

    applyGateState(isUnlocked());

    if (!form || !input || !error) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const value = normalizePassphrase(input.value);
      const expected = normalizePassphrase(passphrase);

      if (!passphrase) {
        error.textContent = 'Passphrase is not configured yet in assets/data/content.json.';
        return;
      }

      if (value === expected) {
        setUnlocked(true);
        error.textContent = '';
        input.value = '';
        applyGateState(true);
        try {
          initMusicPlayer();
        } catch (error) {
          console.warn('Music player init failed:', error);
        }
        const target = document.querySelector('.js-home-title');
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      } else {
        error.textContent = 'Close, but not quite. Try your favorite inside joke.';
      }
    });
  }

  function normalizePassphrase(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyGateState(unlocked) {
    body.dataset.locked = unlocked ? 'false' : 'true';
    const gate = document.getElementById('gateScreen');
    const content = document.getElementById('homeContent');

    if (gate) {
      gate.setAttribute('aria-hidden', unlocked ? 'true' : 'false');
    }

    if (content) {
      content.setAttribute('aria-hidden', unlocked ? 'false' : 'true');
    }
  }

  function renderShared(content) {
    const site = content.site || {};

    setTextAll('.js-brand', site.brand);
    setTextAll('.js-eyebrow', site.eyebrow);
    setTextAll('.js-home-title', site.homeTitle);
    setTextAll('.js-home-intro', site.homeIntro);
    setTextAll('.js-home-summary', site.homeSummary);
    setTextAll('.js-footer-text', site.footerText);
    setTextAll('.js-privacy-note', site.privacyNote);

    document.querySelectorAll('.js-date').forEach(function (node) {
      if (site.anniversaryDateISO) node.setAttribute('datetime', site.anniversaryDateISO);
      if (site.anniversaryDateText) node.textContent = site.anniversaryDateText;
    });
  }

  function renderHome(content) {
    const timelineEvents = Array.isArray(content.timeline && content.timeline.events) ? content.timeline.events : [];
    const galleryItems = Array.isArray(content.gallery && content.gallery.items) ? content.gallery.items : [];
    const letterParagraphs = Array.isArray(content.letter && content.letter.paragraphs) ? content.letter.paragraphs : [];

    const highlights = [
      {
        title: timelineEvents[0] ? timelineEvents[0].label : 'Year we met',
        text: timelineEvents[0] ? timelineEvents[0].text : 'The day everything changed.'
      },
      {
        title: 'Funniest fight',
        text: 'Thermostat debates, blanket thefts, and dramatic eye-roll finals.'
      },
      {
        title: 'Favorite memory',
        text: timelineEvents[3] ? timelineEvents[3].text : 'We packed too much, laughed even more.'
      },
      {
        title: 'Still my baby',
        text: timelineEvents[timelineEvents.length - 1] ? timelineEvents[timelineEvents.length - 1].text : 'Still hot, still stubborn, still in love.'
      }
    ];

    const highlightsGrid = document.getElementById('highlightsGrid');
    if (highlightsGrid) {
      highlightsGrid.innerHTML = '';
      highlights.forEach(function (card) {
        const article = document.createElement('article');
        article.className = 'soft-card js-reveal';
        article.innerHTML = '<h3></h3><p></p>';
        article.querySelector('h3').textContent = card.title;
        article.querySelector('p').textContent = card.text;
        highlightsGrid.appendChild(article);
      });
    }

    const timelinePreview = document.getElementById('timelinePreview');
    if (timelinePreview) {
      timelinePreview.innerHTML = '';
      timelineEvents.slice(0, 3).forEach(function (event) {
        const li = document.createElement('li');
        li.className = 'mini-item';
        li.textContent = event.label + ': ' + event.text;
        timelinePreview.appendChild(li);
      });
    }

    const galleryPreview = document.getElementById('galleryPreview');
    if (galleryPreview) {
      galleryPreview.innerHTML = '';
      galleryItems.slice(0, 3).forEach(function (item) {
        const figure = document.createElement('figure');
        figure.className = 'soft-card preview-card js-reveal';
        const img = document.createElement('img');
        const cap = document.createElement('figcaption');
        img.src = item.src || 'assets/images/memory-1.svg';
        img.alt = item.alt || 'Gallery preview image';
        cap.textContent = item.caption || 'Memory';
        figure.appendChild(img);
        figure.appendChild(cap);
        galleryPreview.appendChild(figure);
      });
    }

    const letterExcerpt = document.getElementById('letterExcerpt');
    if (letterExcerpt && letterParagraphs.length) {
      letterExcerpt.textContent = letterParagraphs.slice(0, 2).join(' ');
    }
  }

  function renderSongGallery() {
    const section = document.getElementById('songGallerySection');
    const grid = document.getElementById('songGalleryGrid');
    const title = document.getElementById('songLyricsTitle');
    const status = document.getElementById('songLyricsStatus');
    const bodyNode = document.getElementById('songLyricsBody');
    if (!section || !grid || !title || !status || !bodyNode) return;

    if (!playlist.length) {
      status.textContent = 'No songs found in site.musicTracks.';
      section.hidden = false;
      return;
    }

    section.hidden = false;
    grid.innerHTML = '';

    const buttons = [];
    let loadToken = 0;

    playlist.forEach(function (track, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'song-track-button';
      button.textContent = track.title;
      button.addEventListener('click', function () {
        showLyrics(index);
      });
      grid.appendChild(button);
      buttons.push(button);
    });

    showLyrics(0);

    async function showLyrics(index) {
      const track = playlist[index];
      if (!track) return;
      loadToken += 1;
      const token = loadToken;

      buttons.forEach(function (button, idx) {
        button.classList.toggle('is-active', idx === index);
      });

      title.textContent = 'Lyrics: ' + track.title;
      status.textContent = 'Loading lyrics...';
      bodyNode.textContent = '';

      try {
        const text = await fetchLyricsTextWithFallback(track.lyrics);
        if (token !== loadToken) return;
        if (!text.trim()) {
          status.textContent = 'Lyrics file is empty.';
          return;
        }
        bodyNode.textContent = text;
        status.textContent = 'Lyrics loaded.';
      } catch (error) {
        if (token !== loadToken) return;
        status.textContent = 'Lyrics unavailable for this song.';
      }
    }
  }

  function renderTimeline(timeline) {
    if (!timeline) return;

    setTextAll('.js-timeline-title', timeline.title);
    setTextAll('.js-timeline-subtitle', timeline.subtitle);

    const list = document.getElementById('timelineList');
    if (!list || !Array.isArray(timeline.events)) return;

    const doodles = ['assets/illust/heart-doodle.svg', 'assets/illust/sparkle-doodle.svg', 'assets/illust/flower-doodle.svg'];

    list.innerHTML = '';
    timeline.events.forEach(function (event, index) {
      const li = document.createElement('li');
      li.className = 'timeline-card js-reveal';

      const marker = document.createElement('span');
      marker.className = 'timeline-marker';
      marker.textContent = event.label || 'Moment';

      const text = document.createElement('p');
      text.textContent = event.text || '';

      const icon = document.createElement('img');
      icon.className = 'tiny-doodle';
      icon.src = doodles[index % doodles.length];
      icon.alt = '';

      li.appendChild(marker);
      li.appendChild(text);
      li.appendChild(icon);
      list.appendChild(li);
    });
  }

  function renderGallery(gallery) {
    if (!gallery) return;

    setTextAll('.js-gallery-title', gallery.title);
    setTextAll('.js-gallery-subtitle', gallery.subtitle);

    const grid = document.getElementById('galleryGrid');
    const items = Array.isArray(gallery.items) ? gallery.items : [];
    if (!grid || !items.length) return;

    grid.innerHTML = '';
    items.forEach(function (item, index) {
      const figure = document.createElement('figure');
      figure.className = 'gallery-card js-reveal';

      const button = document.createElement('button');
      button.className = 'gallery-trigger';
      button.type = 'button';
      button.dataset.index = String(index);
      button.setAttribute('aria-label', 'Open image ' + (index + 1));

      const img = document.createElement('img');
      img.src = item.src || 'assets/images/memory-1.svg';
      img.alt = item.alt || 'Memory image';

      const cap = document.createElement('figcaption');
      cap.textContent = item.caption || 'Memory caption';

      button.appendChild(img);
      figure.appendChild(button);
      figure.appendChild(cap);
      grid.appendChild(figure);
    });

    initLightbox(items);
  }

  function initLightbox(items) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    const closeButton = document.getElementById('lightboxClose');
    const prevButton = document.getElementById('lightboxPrev');
    const nextButton = document.getElementById('lightboxNext');
    const triggers = Array.from(document.querySelectorAll('.gallery-trigger'));

    if (!lightbox || !image || !caption || !closeButton || !prevButton || !nextButton || !triggers.length) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let activeIndex = 0;
    let previousFocus = null;
    let touchStartX = 0;

    function update(index) {
      const safe = ((index % items.length) + items.length) % items.length;
      activeIndex = safe;
      const item = items[safe];
      image.src = item.src || 'assets/images/memory-1.svg';
      image.alt = item.alt || 'Memory image';
      caption.textContent = item.caption || 'Memory caption';
    }

    function open(index) {
      previousFocus = document.activeElement;
      update(index);
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    }

    function close() {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    }

    function trapFocus(event) {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(lightbox.querySelectorAll(focusableSelector)).filter(function (el) {
        return !el.hasAttribute('disabled');
      });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        open(Number(trigger.dataset.index || 0));
      });
    });

    closeButton.addEventListener('click', close);
    prevButton.addEventListener('click', function () { update(activeIndex - 1); });
    nextButton.addEventListener('click', function () { update(activeIndex + 1); });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) close();
    });

    image.addEventListener('touchstart', function (event) {
      if (!event.changedTouches[0]) return;
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    image.addEventListener('touchend', function (event) {
      if (!event.changedTouches[0]) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 40) return;
      if (deltaX > 0) {
        update(activeIndex - 1);
      } else {
        update(activeIndex + 1);
      }
    }, { passive: true });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key === 'ArrowLeft') {
        update(activeIndex - 1);
        return;
      }
      if (event.key === 'ArrowRight') {
        update(activeIndex + 1);
        return;
      }
      trapFocus(event);
    });
  }

  function renderLetter(letter) {
    if (!letter) return;

    const article = document.getElementById('letterContent');
    if (!article) return;

    article.innerHTML = '';

    const h1 = document.createElement('h1');
    h1.id = 'letter-title';
    h1.textContent = letter.title || 'A Letter';
    article.appendChild(h1);

    if (letter.greeting) {
      const greeting = document.createElement('p');
      greeting.textContent = letter.greeting;
      article.appendChild(greeting);
    }

    if (Array.isArray(letter.paragraphs)) {
      letter.paragraphs.forEach(function (paragraph) {
        const p = document.createElement('p');
        p.textContent = paragraph;
        article.appendChild(p);
      });
    }

    if (letter.closing) {
      const closing = document.createElement('p');
      closing.textContent = letter.closing;
      article.appendChild(closing);
    }

    if (letter.signature) {
      const signature = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = letter.signature;
      signature.appendChild(strong);
      article.appendChild(signature);
    }

    const flourish = document.createElement('img');
    flourish.src = 'assets/illust/flower-doodle.svg';
    flourish.alt = 'Decorative flourish near signature';
    flourish.className = 'signature-flourish js-float';
    article.appendChild(flourish);
  }

  function initReveal() {
    const items = Array.from(document.querySelectorAll('.js-reveal'));
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries, instance) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -4% 0px'
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initParallax() {
    if (prefersReducedMotion) return;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return;

    const items = Array.from(document.querySelectorAll('.js-parallax'));
    if (!items.length) return;

    let ticking = false;

    function update() {
      const viewportH = window.innerHeight || 1;
      items.forEach(function (item) {
        const rect = item.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const delta = (center - viewportH / 2) / viewportH;
        const shift = Math.max(-10, Math.min(10, delta * -8));
        item.style.setProperty('--parallax-y', shift.toFixed(2) + 'px');
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  function initSmoothAnchors() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  function initReadProgress() {
    const bar = document.getElementById('readProgressBar');
    if (!bar) return;

    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.max(0, Math.min(progress, 100)).toFixed(2) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initMusicPlayer() {
    if (document.getElementById('musicPlayer')) return;
    if (page === 'home' && !isUnlocked()) return;

    const wrapper = document.createElement('aside');
    wrapper.id = 'musicPlayer';
    wrapper.className = 'music-player';
    wrapper.setAttribute('aria-label', 'Site music player');

    const label = document.createElement('label');
    label.className = 'music-label';
    label.setAttribute('for', 'musicTrackSelect');
    label.textContent = 'Song';

    const select = document.createElement('select');
    select.id = 'musicTrackSelect';
    select.className = 'music-select';
    playlist.forEach(function (track, index) {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = track.title;
      select.appendChild(option);
    });

    const nowPlaying = document.createElement('p');
    nowPlaying.className = 'music-now-playing';
    nowPlaying.innerHTML = 'Now playing: <strong>None</strong>';

    const audio = document.createElement('audio');
    audio.id = 'siteAudio';
    audio.className = 'music-audio';
    audio.controls = true;
    audio.preload = 'metadata';
    audio.loop = false;

    const controlsRow = document.createElement('div');
    controlsRow.className = 'music-track-controls';

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'music-track-button';
    prevButton.textContent = 'Prev';

    const rewindButton = document.createElement('button');
    rewindButton.type = 'button';
    rewindButton.className = 'music-track-button';
    rewindButton.textContent = '-10s';

    const forwardButton = document.createElement('button');
    forwardButton.type = 'button';
    forwardButton.className = 'music-track-button';
    forwardButton.textContent = '+10s';

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'music-track-button';
    nextButton.textContent = 'Next';

    controlsRow.appendChild(prevButton);
    controlsRow.appendChild(rewindButton);
    controlsRow.appendChild(forwardButton);
    controlsRow.appendChild(nextButton);

    const lyricsToggle = document.createElement('button');
    lyricsToggle.type = 'button';
    lyricsToggle.className = 'music-lyrics-toggle';
    lyricsToggle.setAttribute('aria-expanded', 'true');
    lyricsToggle.setAttribute('aria-controls', 'musicLyricsPanel');
    lyricsToggle.textContent = 'Hide lyrics';

    const lyricsPanel = document.createElement('div');
    lyricsPanel.id = 'musicLyricsPanel';
    lyricsPanel.className = 'music-lyrics-panel';
    lyricsPanel.hidden = false;

    const lyricsStatus = document.createElement('p');
    lyricsStatus.className = 'music-lyrics-status';
    lyricsStatus.textContent = 'Lyrics will appear here when available.';

    const lyricsBody = document.createElement('div');
    lyricsBody.className = 'music-lyrics-body';

    lyricsPanel.appendChild(lyricsStatus);
    lyricsPanel.appendChild(lyricsBody);

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    wrapper.appendChild(nowPlaying);
    wrapper.appendChild(controlsRow);
    wrapper.appendChild(audio);
    if (enableLyrics) {
      wrapper.appendChild(lyricsToggle);
      wrapper.appendChild(lyricsPanel);
    }
    document.body.appendChild(wrapper);

    const state = getMusicState();
    const letterDefaultIndex = 0;
    const selectedIndex = clampIndex(Number(state.index));
    const startIndex = Number.isInteger(selectedIndex) ? selectedIndex : letterDefaultIndex;

    function handleTrackSelection() {
      const idx = Number(select.value);
      setTrack(idx, true);
    }
    select.addEventListener('change', handleTrackSelection);
    select.addEventListener('input', handleTrackSelection);
    prevButton.addEventListener('click', function () { stepTrack(-1, true); });
    nextButton.addEventListener('click', function () { stepTrack(1, true); });
    rewindButton.addEventListener('click', function () { seekBy(-10); });
    forwardButton.addEventListener('click', function () { seekBy(10); });

    if (enableLyrics) {
      lyricsToggle.addEventListener('click', function () {
        const isOpen = lyricsToggle.getAttribute('aria-expanded') === 'true';
        lyricsToggle.setAttribute('aria-expanded', String(!isOpen));
        lyricsToggle.textContent = isOpen ? 'Show lyrics' : 'Hide lyrics';
        lyricsPanel.hidden = isOpen;
      });
    }

    audio.addEventListener('play', saveMusicState);
    audio.addEventListener('pause', saveMusicState);
    audio.addEventListener('timeupdate', saveMusicState);
    audio.addEventListener('error', function () {
      if (enableLyrics) {
        lyricsStatus.textContent = 'Selected song failed to load. Try another track.';
      }
    });
    audio.addEventListener('ended', function () {
      stepTrack(1, true);
    });
    window.addEventListener('beforeunload', saveMusicState);

    setTrack(startIndex, false);

    const resumeTime = (typeof state.time === 'number' && Number.isFinite(state.time) && state.time > 0)
      ? state.time
      : 0;
    if (resumeTime > 0) {
      audio.addEventListener('loadedmetadata', function handleLoaded() {
        try {
          audio.currentTime = Math.min(resumeTime, Number.isFinite(audio.duration) ? audio.duration : resumeTime);
        } catch (error) {
          // Ignore seek errors; playback can still proceed from start.
        }
        audio.removeEventListener('loadedmetadata', handleLoaded);
      });
    }

    const shouldAutoPlay = page === 'letter' || state.playing === true;
    if (shouldAutoPlay) {
      audio.play().catch(function () {
        // Autoplay can be blocked by browser policy.
      });
    }

    let parsedTimedLyrics = [];
    let currentTimedIndex = -1;
    let lyricLoadToken = 0;

    audio.addEventListener('timeupdate', function () {
      if (!enableLyrics || !parsedTimedLyrics.length) return;
      const now = audio.currentTime;
      let nextIndex = -1;
      for (let i = 0; i < parsedTimedLyrics.length; i += 1) {
        if (now >= parsedTimedLyrics[i].time) {
          nextIndex = i;
        } else {
          break;
        }
      }
      if (nextIndex === currentTimedIndex || nextIndex < 0) return;
      currentTimedIndex = nextIndex;
      const lines = lyricsBody.querySelectorAll('.music-lyric-line');
      lines.forEach(function (line, idx) {
        if (idx === currentTimedIndex) {
          line.classList.add('is-current');
          line.scrollIntoView({ block: 'nearest' });
        } else {
          line.classList.remove('is-current');
        }
      });
    });

    function setTrack(index, shouldPlay) {
      const safeIndex = clampIndex(index);
      if (safeIndex === null) return;
      const track = playlist[safeIndex];
      select.value = String(safeIndex);
      nowPlaying.innerHTML = 'Now playing: <strong>' + track.title + '</strong>';
      if (enableLyrics) {
        lyricsStatus.textContent = 'Loading lyrics...';
      }
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        const srcUrl = track.src + (track.src.indexOf('?') === -1 ? '?t=' : '&t=') + Date.now();
        audio.src = srcUrl;
        audio.load();
      } catch (error) {
        console.warn('Failed to set track source:', error);
        nowPlaying.innerHTML = 'Now playing: <strong>Unavailable</strong>';
        return;
      }
      parsedTimedLyrics = [];
      currentTimedIndex = -1;
      if (enableLyrics) {
        loadLyrics(track);
      }
      saveMusicState();
      if (shouldPlay) {
        audio.play().catch(function () {
          if (enableLyrics) {
            lyricsStatus.textContent = 'Tap play in the player to start this song.';
          }
        });
      }
    }

    function stepTrack(delta, shouldPlay) {
      if (!playlist.length) return;
      const current = clampIndex(Number(select.value));
      const base = Number.isInteger(current) ? current : 0;
      const next = (base + delta + playlist.length) % playlist.length;
      setTrack(next, shouldPlay);
    }

    function seekBy(seconds) {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const target = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
      audio.currentTime = target;
      saveMusicState();
    }

    async function loadLyrics(track) {
      if (!enableLyrics) return;
      lyricLoadToken += 1;
      const token = lyricLoadToken;
      lyricsBody.innerHTML = '';
      lyricsStatus.textContent = 'Loading lyrics...';

      if (!track.lyrics) {
        lyricsStatus.textContent = 'Lyrics unavailable for this song.';
        return;
      }

      try {
        const raw = await fetchLyricsText(track.lyrics);
        if (token !== lyricLoadToken) return;
        if (!raw.trim()) {
          lyricsStatus.textContent = 'Lyrics file is empty.';
          return;
        }

        if (/^\s*\[\d{1,2}:\d{2}/m.test(raw)) {
          parsedTimedLyrics = parseLrc(raw);
          renderTimedLyrics(parsedTimedLyrics);
          lyricsStatus.textContent = 'Timed lyrics ready. Press play to sing along.';
        } else {
          renderPlainLyrics(raw);
          lyricsStatus.textContent = 'Lyrics loaded.';
        }
      } catch (error) {
        if (token !== lyricLoadToken) return;
        lyricsStatus.textContent = 'Lyrics unavailable. Add a .txt or .lrc file under assets/Song/lyrics/.';
      }
    }

    async function fetchLyricsText(lyricsPath) {
      const candidates = [lyricsPath];
      const decoded = safeDecodePath(lyricsPath);
      if (decoded && decoded !== lyricsPath) candidates.push(decoded);

      let lastError = null;
      for (let i = 0; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        try {
          const response = await fetchWithTimeout(candidate, {
            cache: 'no-store',
            headers: { Accept: 'text/plain, text/*;q=0.9, */*;q=0.1' }
          }, 8000);
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return await response.text();
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error('Unable to load lyrics');
    }

    async function fetchWithTimeout(url, options, timeoutMs) {
      const controller = new AbortController();
      const timer = window.setTimeout(function () {
        controller.abort();
      }, timeoutMs);
      try {
        return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
      } finally {
        window.clearTimeout(timer);
      }
    }

    function safeDecodePath(path) {
      try {
        return decodeURIComponent(path);
      } catch (error) {
        return path;
      }
    }

    function renderPlainLyrics(text) {
      const pre = document.createElement('pre');
      pre.className = 'music-lyrics-text';
      pre.textContent = text;
      lyricsBody.appendChild(pre);
    }

    function renderTimedLyrics(lines) {
      lyricsBody.innerHTML = '';
      lines.forEach(function (line) {
        const p = document.createElement('p');
        p.className = 'music-lyric-line';
        p.textContent = line.text || '...';
        lyricsBody.appendChild(p);
      });
    }

    function parseLrc(text) {
      const result = [];
      const rows = text.split(/\r?\n/);
      rows.forEach(function (row) {
        const matches = row.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]/g);
        const lyricText = row.replace(/\[[^\]]+\]/g, '').trim();
        for (const match of matches) {
          const mm = Number(match[1] || 0);
          const ss = Number(match[2] || 0);
          const fractionRaw = match[3] || '';
          const fraction = fractionRaw ? Number('0.' + fractionRaw) : 0;
          const time = (mm * 60) + ss + fraction;
          result.push({ time: time, text: lyricText });
        }
      });
      return result.sort(function (a, b) { return a.time - b.time; });
    }

    function saveMusicState() {
      const payload = {
        index: clampIndex(Number(select.value)) || 0,
        time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        playing: !audio.paused
      };
      sessionStorage.setItem(MUSIC_SESSION_KEY, JSON.stringify(payload));
    }
  }

  function getMusicState() {
    try {
      const raw = sessionStorage.getItem(MUSIC_SESSION_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function clampIndex(value) {
    if (!playlist.length) return null;
    if (!Number.isInteger(value)) return null;
    if (value < 0) return 0;
    if (value >= playlist.length) return playlist.length - 1;
    return value;
  }

  function discoverPlaylist() {
    const sources = [
      'assets/Song/Poked Into Forever.mp3',
      'assets/Song/Queen of Dindinburg.mp3',
      'assets/Song/Baby With Me.mp3',
      'assets/Song/Papi, Baby Me.mp3'
    ];

    return sources.map(function (src) {
      const title = src.split('/').pop().replace(/\.mp3$/i, '');
      return {
        title: title,
        src: encodePath(src),
        lyrics: encodePath('assets/Song/lyrics/' + title + '.txt')
      };
    });
  }

  function resolvePlaylist(content) {
    const tracks = content && content.site && Array.isArray(content.site.musicTracks)
      ? content.site.musicTracks
      : [];
    const normalized = tracks
      .map(function (item) {
        if (typeof item === 'string') {
          const title = item.split('/').pop().replace(/\.mp3$/i, '');
          return {
            title: title,
            src: encodePath(item),
            lyrics: encodePath('assets/Song/lyrics/' + title + '.txt')
          };
        }
        if (!item || typeof item !== 'object') return null;
        if (!item.src) return null;
        const fallbackTitle = String(item.src).split('/').pop().replace(/\.mp3$/i, '');
        return {
          title: item.title || fallbackTitle,
          src: encodePath(item.src),
          lyrics: item.lyrics ? encodePath(item.lyrics) : encodePath('assets/Song/lyrics/' + fallbackTitle + '.txt')
        };
      })
      .filter(Boolean);

    return normalized.length ? normalized : discoverPlaylist();
  }

  function resolveLyricsEnabled(content) {
    const configured = content && content.site && content.site.enableLyrics;
    if (typeof configured === 'boolean') return configured;
    return false;
  }

  async function fetchLyricsTextWithFallback(path) {
    if (!path) throw new Error('Missing lyrics path');
    const candidates = [path];
    const decoded = safeDecodePath(path);
    if (decoded && decoded !== path) {
      candidates.push(decoded);
    }

    let lastError = null;
    for (let i = 0; i < candidates.length; i += 1) {
      try {
        const response = await fetchWithTimeout(candidates[i], {
          cache: 'no-store',
          headers: { Accept: 'text/plain, text/*;q=0.9, */*;q=0.1' }
        }, 8000);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return await response.text();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Unable to load lyrics');
  }

  async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = window.setTimeout(function () {
      controller.abort();
    }, timeoutMs);

    try {
      return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
    } finally {
      window.clearTimeout(timer);
    }
  }

  function safeDecodePath(path) {
    try {
      return decodeURIComponent(path);
    } catch (error) {
      return path;
    }
  }

  function encodePath(path) {
    return path
      .split('/')
      .map(function (segment) { return encodeURIComponent(segment); })
      .join('/');
  }

  function setTextAll(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = value;
    });
  }
})();
