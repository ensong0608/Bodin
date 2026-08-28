(function () {
  const MUSIC_SESSION_KEY = 'music_player_state';
  let enableLyrics = false;
  const body = document.body;
  const page = body.dataset.page || 'home';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playlist = discoverPlaylist();

  const fallbackContent = {
    site: {
      brand: 'Bodin + Ensong',
      eyebrow: '25 Years Together · August 29, 2026',
      homeTitle: '25 Years of Us',
      homeIntro: 'Twenty-five years ago, you poked me and started all this trouble. We have grown older, grayer, and possibly even more annoying—but I would still choose you every single time.',
      homeSummary: 'A quarter century in, and we still have the same chaotic energy.',
      footerText: 'Bodin + Ensong · 25 Years and Counting',
      relationshipStartISO: '2001-08-29',
      anniversaryDateISO: '2026-08-29',
      anniversaryDateText: 'August 29, 2026',
      privacyNote: 'Made with 25 years of love for Bodin.',
      enableLyrics: false
    },
    timeline: {
      title: 'Us, Over Time',
      subtitle: 'Our version of romance: sarcastic, goofy, and serious when it counts.',
      events: [
        { label: '2001 · The Beginning of Trouble', text: 'You poked my ass, I was embarrassed, and somehow that was the beginning of us.' },
        { label: 'Learning Life Together', text: 'We began figuring out adulthood side by side.' },
        { label: 'Our First Time Apart', text: 'Distance proved that nothing could keep me away from you.' },
        { label: 'Our First Home', text: 'We built a place and a life of our own.' },
        { label: '2026 · Twenty-Five Years', text: 'More gray hair, more stories, and still very much us.' }
      ]
    },
    highlights: {
      cards: [
        { title: '25 years', text: 'Of choosing each other.' },
        { title: '9,131 days', text: 'Of love, laughter, and beautiful trouble.' },
        { title: 'One famous expression', text: 'Those pouting lips still get me every time.' },
        { title: 'Still my baby', text: 'Still hot, funny, demanding, and sexy.' }
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
      date: 'August 29, 2026 · Our 25th Anniversary',
      title: 'Twenty-Five Years, Still You',
      greeting: 'Dear Claudine Diwata,',
      paragraphs: [
        'I keep looking at that number and wondering how we got here so fast.',
        'Twenty-five years have passed, but you have never become ordinary to me.',
        'If I could go back to August 29, 2001, knowing exactly what the next twenty-five years would bring, I would still choose you.'
      ],
      closing: 'Always yours,',
      signature: 'Papi'
    },
    birthdayLetter: {
      title: 'A Letter to My Baby Bodin',
      greeting: 'Bodin my Baby,',
      paragraphs: [
        'Almost 25 years together... and somehow you are still my favorite person to argue with about absolutely nothing.',
        'You drive me crazy. And somehow, that is still one of my favorite places to be.',
        "I love you. Happy Valentine's Day, Baby."
      ],
      closing: 'Forever yours,',
      signature: 'Papi'
    }
  };

  initNavigation();
  initSmoothAnchors();

  init();

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
      renderHome(content);
      renderSongGallery();
      initThenNowComparison();
    }

    if (page === 'gallery') {
      renderGallery(content.gallery);
    }

    if (page === 'letter' || page === 'birthday-letter') {
      renderLetter(page === 'letter' ? content.letter : content.birthdayLetter);
      initReadProgress();
    }

    if (page === 'songs') {
      renderSongsHub(content);
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

    initAnniversaryCountdown(site);
  }

  function renderHome(content) {
    const timelineEvents = Array.isArray(content.timeline && content.timeline.events) ? content.timeline.events : [];
    const galleryItems = Array.isArray(content.gallery && content.gallery.items) ? content.gallery.items : [];
    const featuredItems = Array.isArray(content.gallery && content.gallery.featuredItems)
      ? content.gallery.featuredItems
      : [];
    const galleryGroups = groupGalleryItems(featuredItems.length ? featuredItems : galleryItems);
    const letterParagraphs = Array.isArray(content.letter && content.letter.paragraphs) ? content.letter.paragraphs : [];

    const fallbackHighlights = [
      {
        title: '25 years',
        text: 'Of choosing each other.'
      },
      {
        title: '9,131 days',
        text: 'Of love, laughter, and beautiful trouble.'
      },
      {
        title: 'One famous expression',
        text: 'Those pouting lips still get me every time.'
      },
      {
        title: 'Still my baby',
        text: 'Still hot, funny, demanding, and sexy.'
      }
    ];
    const configuredHighlights = content.highlights && Array.isArray(content.highlights.cards)
      ? content.highlights.cards
      : [];
    const highlights = configuredHighlights.length ? configuredHighlights : fallbackHighlights;

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

    setTextAll('.js-timeline-title', content.timeline && content.timeline.title);
    setTextAll('.js-timeline-subtitle', content.timeline && content.timeline.subtitle);

    const timelineList = document.getElementById('timelineList');
    if (timelineList && timelineEvents.length) {
      timelineList.innerHTML = '';
      timelineEvents.forEach(function (event, index) {
        const item = document.createElement('li');
        item.className = 'timeline-card js-reveal';
        const toggle = document.createElement('button');
        toggle.className = 'timeline-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-expanded', String(index === 0));
        const marker = document.createElement('span');
        marker.className = 'timeline-marker';
        marker.textContent = event.label || 'Our story';
        const symbol = document.createElement('span');
        symbol.className = 'timeline-symbol';
        symbol.setAttribute('aria-hidden', 'true');
        symbol.textContent = index === 0 ? '−' : '+';
        const details = document.createElement('div');
        details.className = 'timeline-details';
        details.hidden = index !== 0;
        const text = document.createElement('p');
        text.textContent = event.text || '';
        toggle.appendChild(marker);
        toggle.appendChild(symbol);
        details.appendChild(text);
        item.appendChild(toggle);
        item.appendChild(details);
        toggle.addEventListener('click', function () {
          const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
          timelineList.querySelectorAll('.timeline-toggle').forEach(function (otherToggle) {
            otherToggle.setAttribute('aria-expanded', 'false');
            otherToggle.querySelector('.timeline-symbol').textContent = '+';
            otherToggle.nextElementSibling.hidden = true;
          });
          if (willOpen) {
            toggle.setAttribute('aria-expanded', 'true');
            symbol.textContent = '−';
            details.hidden = false;
          }
        });
        timelineList.appendChild(item);
      });
    }

    const galleryPreview = document.getElementById('galleryPreview');
    if (galleryPreview) {
      galleryPreview.innerHTML = '';
      galleryGroups.slice(0, 3).forEach(function (group) {
        const cover = group.cover || {};
        const link = document.createElement('a');
        link.className = 'soft-card preview-card js-reveal';
        link.href = 'gallery.html?memory=' + encodeURIComponent(group.memoryId);
        link.setAttribute('aria-label', 'Open ' + group.title + ' album');
        const media = createGalleryMediaElement(cover, 'preview-media');
        const cap = document.createElement('span');
        cap.className = 'preview-caption';
        cap.textContent = group.items.length > 1
          ? (group.title + ' album (' + group.items.length + ' photos)')
          : (group.caption || 'Memory');
        const action = document.createElement('span');
        action.className = 'preview-action';
        action.textContent = 'Open album →';
        link.appendChild(media);
        link.appendChild(cap);
        link.appendChild(action);
        galleryPreview.appendChild(link);
      });
    }

    const letterExcerpt = document.getElementById('letterExcerpt');
    if (letterExcerpt && letterParagraphs.length) {
      letterExcerpt.textContent = letterParagraphs.slice(0, 2).join(' ');
    }
  }

  function initAnniversaryCountdown(site) {
    const container = document.getElementById('anniversaryCountdown');
    const value = document.getElementById('anniversaryCountdownValue');
    const label = document.getElementById('anniversaryCountdownLabel');
    if (!container || !value || !label || !site.anniversaryDateISO) return;

    const target = new Date(site.anniversaryDateISO + 'T00:00:00');
    if (Number.isNaN(target.getTime())) return;

    function update() {
      const remainingMs = target.getTime() - Date.now();
      if (remainingMs <= 0) {
        value.textContent = '25 years';
        label.textContent = 'and counting';
        container.classList.add('is-celebrating');
        return;
      }

      const totalMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;

      if (days > 0) {
        value.textContent = days + (days === 1 ? ' day' : ' days') + ' · ' + hours + (hours === 1 ? ' hour' : ' hours');
      } else {
        value.textContent = hours > 0
          ? hours + (hours === 1 ? ' hr' : ' hrs') + ' · ' + minutes + ' min'
          : minutes + (minutes === 1 ? ' min' : ' mins');
      }
      label.textContent = 'until ' + (site.anniversaryDateText || 'our anniversary');
      container.classList.remove('is-celebrating');
    }

    update();
    window.setInterval(update, 60000);
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

  function renderSongsHub(content) {
    const lyricsList = document.getElementById('songsLyricsList');
    const lyricsTitle = document.getElementById('songsLyricsTitle');
    const lyricsStatus = document.getElementById('songsLyricsStatus');
    const lyricsBody = document.getElementById('songsLyricsBody');
    const downloadList = document.getElementById('songsDownloadList');
    if (!lyricsList || !lyricsTitle || !lyricsStatus || !lyricsBody || !downloadList) return;

    initProudPapiCarousel(content);

    if (!playlist.length) {
      lyricsStatus.textContent = 'No songs found in site.musicTracks.';
      downloadList.innerHTML = '<p class="song-lyrics-status">No songs available to download yet.</p>';
      return;
    }

    lyricsList.innerHTML = '';
    downloadList.innerHTML = '';
    const buttons = [];
    let loadToken = 0;

    playlist.forEach(function (track, index) {
      const lyricButton = document.createElement('button');
      lyricButton.type = 'button';
      lyricButton.className = 'song-track-button';
      lyricButton.textContent = track.title;
      lyricButton.addEventListener('click', function () {
        showLyrics(index);
      });
      lyricsList.appendChild(lyricButton);
      buttons.push(lyricButton);

      const downloadLink = document.createElement('a');
      downloadLink.className = 'song-download-link';
      downloadLink.href = track.src;
      downloadLink.textContent = 'Download: ' + track.title;
      const decodedSrc = safeDecodePath(track.src);
      const filename = decodedSrc.split('/').pop();
      if (filename) {
        downloadLink.setAttribute('download', filename);
      } else {
        downloadLink.setAttribute('download', '');
      }
      downloadList.appendChild(downloadLink);
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

      lyricsTitle.textContent = 'Lyrics: ' + track.title;
      lyricsStatus.textContent = 'Loading lyrics...';
      lyricsBody.textContent = '';

      if (!track.lyrics) {
        lyricsStatus.textContent = 'Lyrics unavailable for this song.';
        return;
      }

      try {
        const text = await fetchLyricsTextWithFallback(track.lyrics);
        if (token !== loadToken) return;
        if (!text.trim()) {
          lyricsStatus.textContent = 'Lyrics file is empty.';
          return;
        }
        lyricsBody.textContent = text;
        lyricsStatus.textContent = 'Lyrics loaded.';
      } catch (error) {
        if (token !== loadToken) return;
        lyricsStatus.textContent = 'Lyrics unavailable for this song.';
      }
    }
  }

  function initProudPapiCarousel(content) {
    const carousel = document.getElementById('proudPapiCarousel');
    const image = document.getElementById('proudPapiImage');
    const caption = document.getElementById('proudPapiCaption');
    const prev = document.getElementById('proudPapiPrev');
    const next = document.getElementById('proudPapiNext');
    if (!carousel || !image || !caption || !prev || !next) return;

    const items = Array.isArray(content && content.gallery && content.gallery.items) ? content.gallery.items : [];
    const proudPapiItems = items.filter(function (item, index) {
      return String(inferMemoryId(item, index)) === '5';
    });

    if (!proudPapiItems.length) {
      carousel.hidden = true;
      return;
    }

    let activeIndex = 0;
    let intervalId = null;

    function render(index) {
      const safeIndex = ((index % proudPapiItems.length) + proudPapiItems.length) % proudPapiItems.length;
      activeIndex = safeIndex;
      const item = proudPapiItems[safeIndex];
      image.src = item.src || '';
      image.alt = item.alt || ("I'm a proud papi photo " + (safeIndex + 1));
      const baseCaption = item.caption || "I'm a proud papi";
      caption.textContent = baseCaption + ' (' + (safeIndex + 1) + '/' + proudPapiItems.length + ')';
    }

    function startAutoRotate() {
      stopAutoRotate();
      intervalId = window.setInterval(function () {
        render(activeIndex + 1);
      }, 4800);
    }

    function stopAutoRotate() {
      if (!intervalId) return;
      window.clearInterval(intervalId);
      intervalId = null;
    }

    prev.addEventListener('click', function () {
      render(activeIndex - 1);
      startAutoRotate();
    });
    next.addEventListener('click', function () {
      render(activeIndex + 1);
      startAutoRotate();
    });

    carousel.addEventListener('mouseenter', stopAutoRotate);
    carousel.addEventListener('mouseleave', startAutoRotate);
    carousel.addEventListener('focusin', stopAutoRotate);
    carousel.addEventListener('focusout', function (event) {
      if (carousel.contains(event.relatedTarget)) return;
      startAutoRotate();
    });

    render(0);
    startAutoRotate();
  }

  function renderGallery(gallery) {
    if (!gallery) return;

    setTextAll('.js-gallery-title', gallery.title);
    setTextAll('.js-gallery-subtitle', gallery.subtitle);

    const grid = document.getElementById('galleryGrid');
    const standardItems = Array.isArray(gallery.items) ? gallery.items : [];
    const featuredItems = Array.isArray(gallery.featuredItems) ? gallery.featuredItems : [];
    const featuredSources = new Set(featuredItems.map(function (item) { return item && item.src; }));
    const items = featuredItems.concat(standardItems.filter(function (item) {
      return !featuredSources.has(item && item.src);
    }));
    const groups = groupGalleryItems(items);
    if (!grid || !groups.length) return;

    grid.innerHTML = '';
    groups.forEach(function (group, index) {
      const cover = group.cover || {};
      const figure = document.createElement('figure');
      figure.className = 'gallery-card js-reveal';

      const button = document.createElement('button');
      button.className = 'gallery-trigger';
      button.type = 'button';
      button.dataset.groupIndex = String(index);
      button.setAttribute('aria-label', 'Open ' + (group.title || ('memory ' + (index + 1))));

      const media = createGalleryMediaElement(cover, '');

      const cap = document.createElement('figcaption');
      cap.textContent = group.items.length > 1
        ? (group.title + ' album (' + group.items.length + ' photos)')
        : (group.caption || 'Memory caption');

      button.appendChild(media);
      figure.appendChild(button);
      figure.appendChild(cap);
      grid.appendChild(figure);
    });

    initLightbox(groups);
  }

  function initLightbox(groups) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImage');
    const video = document.getElementById('lightboxVideo');
    const caption = document.getElementById('lightboxCaption');
    const closeButton = document.getElementById('lightboxClose');
    const prevButton = document.getElementById('lightboxPrev');
    const nextButton = document.getElementById('lightboxNext');
    const triggers = Array.from(document.querySelectorAll('.gallery-trigger'));

    if (!lightbox || !caption || !closeButton || !prevButton || !nextButton || !triggers.length) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let activeGroupIndex = 0;
    let activePhotoIndex = 0;
    let previousFocus = null;
    let touchStartX = 0;

    function updateLightboxMedia(item) {
      const source = item.src || 'assets/images/memory-1.svg';
      const alt = item.alt || 'Memory image';

      if (isVideoSource(source) && video) {
        if (image) {
          image.hidden = true;
          image.removeAttribute('src');
        }
        video.hidden = false;
        video.pause();
        video.src = source;
        video.setAttribute('aria-label', alt);
        video.load();
        return;
      }

      if (video) {
        video.pause();
        video.hidden = true;
        video.removeAttribute('src');
      }
      if (image) {
        image.hidden = false;
        image.src = source;
        image.alt = alt;
      }
    }

    function update(groupIndex, photoIndex) {
      const safeGroup = ((groupIndex % groups.length) + groups.length) % groups.length;
      activeGroupIndex = safeGroup;
      const group = groups[safeGroup] || {};
      const photos = Array.isArray(group.items) && group.items.length ? group.items : [group.cover].filter(Boolean);
      const safePhoto = ((photoIndex % photos.length) + photos.length) % photos.length;
      activePhotoIndex = safePhoto;
      const item = photos[safePhoto] || {};
      updateLightboxMedia(item);
      if (photos.length > 1) {
        const label = group.title || 'Memory';
        caption.textContent = label + ' (' + (safePhoto + 1) + '/' + photos.length + ')';
      } else {
        caption.textContent = item.caption || group.caption || 'Memory caption';
      }
    }

    function open(groupIndex) {
      previousFocus = document.activeElement;
      update(groupIndex, 0);
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    }

    function close() {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (video) video.pause();
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
        open(Number(trigger.dataset.groupIndex || 0));
      });
    });

    closeButton.addEventListener('click', close);
    prevButton.addEventListener('click', function () { update(activeGroupIndex, activePhotoIndex - 1); });
    nextButton.addEventListener('click', function () { update(activeGroupIndex, activePhotoIndex + 1); });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) close();
    });

    [image, video].filter(Boolean).forEach(function (mediaNode) {
      mediaNode.addEventListener('touchstart', function (event) {
        if (!event.changedTouches[0]) return;
        touchStartX = event.changedTouches[0].clientX;
      }, { passive: true });

      mediaNode.addEventListener('touchend', function (event) {
        if (!event.changedTouches[0]) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) < 40) return;
        if (deltaX > 0) {
          update(activeGroupIndex, activePhotoIndex - 1);
        } else {
          update(activeGroupIndex, activePhotoIndex + 1);
        }
      }, { passive: true });
    });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key === 'ArrowLeft') {
        update(activeGroupIndex, activePhotoIndex - 1);
        return;
      }
      if (event.key === 'ArrowRight') {
        update(activeGroupIndex, activePhotoIndex + 1);
        return;
      }
      trapFocus(event);
    });

    const requestedMemory = new URLSearchParams(window.location.search).get('memory');
    if (requestedMemory) {
      const requestedIndex = groups.findIndex(function (group) {
        return String(group.memoryId) === String(requestedMemory);
      });
      if (requestedIndex >= 0) {
        window.setTimeout(function () { open(requestedIndex); }, 120);
      }
    }
  }

  function initThenNowComparison() {
    const comparison = document.getElementById('thenNowComparison');
    const range = document.getElementById('comparisonRange');
    if (!comparison || !range) return;

    function updateComparison() {
      comparison.style.setProperty('--reveal', range.value + '%');
      range.setAttribute('aria-valuetext', range.value + '% of the current-day image revealed');
    }

    range.addEventListener('input', updateComparison);
    updateComparison();
  }

  function groupGalleryItems(items) {
    const groups = [];
    const byMemory = {};
    items.forEach(function (item, index) {
      if (!item) return;
      const memoryId = inferMemoryId(item, index);
      const key = String(memoryId);
      if (!byMemory[key]) {
        byMemory[key] = {
          memoryId: memoryId,
          title: String(memoryId) === '3'
            ? 'Honeymoon'
            : (String(memoryId) === '4'
              ? 'Older and Grayer but better'
              : (String(memoryId) === '5' ? "I'm a proud papi" : ('Memory ' + memoryId))),
          caption: item.caption || ('Memory ' + memoryId),
          cover: item,
          items: []
        };
        groups.push(byMemory[key]);
      }
      byMemory[key].items.push(item);
    });
    return groups;
  }

  function inferMemoryId(item, index) {
    if (item && item.memory !== undefined && item.memory !== null && String(item.memory).trim() !== '') {
      return String(item.memory).trim();
    }

    const src = String(item && item.src ? item.src : '');
    const sourceMatch = src.match(/memory-(\d+)/i);
    if (sourceMatch && sourceMatch[1]) {
      return sourceMatch[1];
    }

    return String(index + 1);
  }

  function isVideoSource(source) {
    return /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i.test(String(source || ''));
  }

  function createGalleryMediaElement(item, className) {
    const source = item && item.src ? item.src : 'assets/images/memory-1.svg';
    const alt = item && item.alt ? item.alt : 'Memory image';

    if (isVideoSource(source)) {
      const video = document.createElement('video');
      video.src = source;
      video.muted = true;
      video.loop = true;
      video.autoplay = false;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', alt);
      if (className) video.className = className;
      return video;
    }

    const img = document.createElement('img');
    img.src = source;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    if (className) img.className = className;
    return img;
  }

  function renderLetter(letter) {
    if (!letter) return;

    const article = document.getElementById('letterContent');
    if (!article) return;

    article.innerHTML = '';

    if (letter.date) {
      const date = document.createElement('p');
      date.className = 'letter-date';
      date.textContent = letter.date;
      article.appendChild(date);
    }

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

    const wrapper = document.createElement('aside');
    wrapper.id = 'musicPlayer';
    wrapper.className = 'music-player';
    wrapper.setAttribute('aria-label', 'Site music player');

    const playerToggle = document.createElement('button');
    playerToggle.type = 'button';
    playerToggle.className = 'music-player-toggle';
    playerToggle.setAttribute('aria-expanded', 'false');
    playerToggle.setAttribute('aria-controls', 'musicPlayerBody');
    playerToggle.innerHTML = '<span aria-hidden="true">♪</span><strong>Our Songs</strong><span class="music-player-toggle-state">Open</span>';

    const playerBody = document.createElement('div');
    playerBody.id = 'musicPlayerBody';
    playerBody.className = 'music-player-body';

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

    playerBody.appendChild(label);
    playerBody.appendChild(select);
    playerBody.appendChild(nowPlaying);
    playerBody.appendChild(audio);
    if (enableLyrics) {
      playerBody.appendChild(lyricsToggle);
      playerBody.appendChild(lyricsPanel);
    }
    wrapper.appendChild(playerToggle);
    wrapper.appendChild(playerBody);
    document.body.appendChild(wrapper);

    const state = getMusicState();
    const letterDefaultIndex = 0;
    const selectedIndex = clampIndex(Number(state.index));
    const startIndex = Number.isInteger(selectedIndex) ? selectedIndex : letterDefaultIndex;

    function setPlayerOpen(isOpen) {
      wrapper.classList.toggle('is-open', isOpen);
      playerToggle.setAttribute('aria-expanded', String(isOpen));
      const stateLabel = playerToggle.querySelector('.music-player-toggle-state');
      if (stateLabel) stateLabel.textContent = isOpen ? 'Close' : 'Open';
    }

    playerToggle.addEventListener('click', function () {
      setPlayerOpen(!wrapper.classList.contains('is-open'));
    });

    setPlayerOpen(state.playing === true);

    function handleTrackSelection() {
      const idx = Number(select.value);
      setTrack(idx, true);
    }
    select.addEventListener('change', handleTrackSelection);
    select.addEventListener('input', handleTrackSelection);

    if (enableLyrics) {
      lyricsToggle.addEventListener('click', function () {
        const isOpen = lyricsToggle.getAttribute('aria-expanded') === 'true';
        lyricsToggle.setAttribute('aria-expanded', String(!isOpen));
        lyricsToggle.textContent = isOpen ? 'Show lyrics' : 'Hide lyrics';
        lyricsPanel.hidden = isOpen;
      });
    }

    audio.addEventListener('play', function () {
      setPlayerOpen(true);
      saveMusicState();
    });
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

    const shouldAutoPlay = state.playing === true;
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
