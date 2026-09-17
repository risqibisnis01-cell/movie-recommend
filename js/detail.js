/**
 * CineLuxe - Movie Detail Page Controller
 * Handles URL query parameter parsing, dynamic rendering,
 * trailer modal player, watchlist state, and related recommendations.
 * Anti-Slop (antislop-ui) and Emil Kowalski craft adherence.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80';
  const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280&auto=format&fit=crop&q=80';

  // DOM Elements
  const detailBackdropImg = document.getElementById('detailBackdropImg');
  const detailPosterImg = document.getElementById('detailPosterImg');
  const detailTitle = document.getElementById('detailTitle');
  const detailTagline = document.getElementById('detailTagline');
  const detailRating = document.getElementById('detailRating');
  const detailYear = document.getElementById('detailYear');
  const detailDuration = document.getElementById('detailDuration');
  const detailDirectorTop = document.getElementById('detailDirectorTop');
  const detailGenres = document.getElementById('detailGenres');
  const detailSynopsis = document.getElementById('detailSynopsis');
  const detailCastList = document.getElementById('detailCastList');

  const detailDirector = document.getElementById('detailDirector');
  const detailMetaYear = document.getElementById('detailMetaYear');
  const detailMetaDuration = document.getElementById('detailMetaDuration');
  const detailMetaScore = document.getElementById('detailMetaScore');
  const detailMetaLink = document.getElementById('detailMetaLink');

  const btnWatchDirect = document.getElementById('btnWatchDirect');
  const btnOpenPlayer = document.getElementById('btnOpenPlayer');
  const btnToggleWatchlist = document.getElementById('btnToggleWatchlist');
  const watchlistIcon = document.getElementById('watchlistIcon');
  const watchlistBtnText = document.getElementById('watchlistBtnText');
  const btnShare = document.getElementById('btnShare');

  const videoModal = document.getElementById('videoModal');
  const btnCloseVideo = document.getElementById('btnCloseVideo');
  const videoIframe = document.getElementById('videoIframe');
  const relatedGrid = document.getElementById('relatedGrid');
  const toastContainer = document.getElementById('toastContainer');

  let currentMovie = null;

  try {
    // 1. Resolve movie by ID or fallback to first catalog item
    if (movieId) {
      currentMovie = await window.movieService.getById(movieId);
    }
    if (!currentMovie) {
      const all = await window.movieService.getAll();
      currentMovie = all[0];
    }

    if (!currentMovie) {
      window.location.href = 'index.html';
      return;
    }

    // 2. Populate Page Details
    document.title = `${currentMovie.title} (${currentMovie.year}) — CineLuxe Archive`;

    // Images
    detailBackdropImg.src = currentMovie.backdropUrl || currentMovie.posterUrl || FALLBACK_BACKDROP;
    detailBackdropImg.onerror = () => { detailBackdropImg.src = FALLBACK_BACKDROP; };

    detailPosterImg.src = currentMovie.posterUrl || FALLBACK_POSTER;
    detailPosterImg.onerror = () => { detailPosterImg.src = FALLBACK_POSTER; };

    // Text & Metadata
    detailTitle.textContent = currentMovie.title;
    detailTagline.textContent = currentMovie.tagline ? `"${currentMovie.tagline}"` : '';
    detailRating.innerHTML = `
      <span style="font-size: 10px; text-transform: uppercase; color: var(--text-muted);">SCORE</span>
      <span>${currentMovie.rating.toFixed(1)} / 10</span>
    `;

    detailYear.textContent = currentMovie.year;
    detailDuration.textContent = currentMovie.duration || 'Feature Film';
    detailDirectorTop.textContent = `Directed by ${currentMovie.director}`;

    // Genres
    detailGenres.innerHTML = (currentMovie.genres || [])
      .map(g => `<span class="genre-tag" style="font-size: 11px; padding: 3px 8px;">${escapeHtml(g)}</span>`)
      .join('');

    detailSynopsis.textContent = currentMovie.synopsis;

    // Cast List
    if (Array.isArray(currentMovie.cast) && currentMovie.cast.length > 0) {
      detailCastList.innerHTML = currentMovie.cast
        .map(actor => `
          <div class="cast-chip">
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-right: 4px;">ACTOR</span>
            <span>${escapeHtml(actor)}</span>
          </div>
        `)
        .join('');
    } else {
      detailCastList.innerHTML = '<span style="color: var(--text-muted); font-size: 13px;">Cast information not cataloged.</span>';
    }

    // Sidebar Info
    detailDirector.textContent = currentMovie.director;
    detailMetaYear.textContent = currentMovie.year;
    detailMetaDuration.textContent = currentMovie.duration;
    detailMetaScore.textContent = `${currentMovie.rating.toFixed(1)} / 10 (Archival Aggregate)`;
    detailMetaLink.href = currentMovie.viewUrl;

    // Action Links
    btnWatchDirect.href = currentMovie.viewUrl;

    // Watchlist State
    updateWatchlistButtonState();

    // 3. Setup Watchlist Toggle
    btnToggleWatchlist.addEventListener('click', () => {
      const res = window.movieService.toggleWatchlist(currentMovie.id);
      updateWatchlistButtonState();
      if (res.added) {
        showToast(`Cataloged "${currentMovie.title}" to Watchlist`);
      } else {
        showToast(`Removed "${currentMovie.title}" from Watchlist`, 'info');
      }
    });

    // 4. Setup Share Button
    btnShare.addEventListener('click', async () => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Film dossier link copied to clipboard');
        } else {
          showToast('Copy URL from address bar', 'info');
        }
      } catch {
        showToast('Link ready in address bar', 'info');
      }
    });

    // 5. Setup Video Trailer Player Modal
    btnOpenPlayer.addEventListener('click', () => {
      const embedUrl = getYouTubeEmbedUrl(currentMovie.viewUrl);
      if (embedUrl) {
        videoIframe.src = embedUrl;
        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      } else {
        window.open(currentMovie.viewUrl, '_blank', 'noopener,noreferrer');
      }
    });

    function closeVideoModal() {
      videoModal.classList.remove('open');
      videoModal.setAttribute('aria-hidden', 'true');
      videoIframe.src = '';
      document.body.style.overflow = '';
    }

    btnCloseVideo.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('open')) {
        closeVideoModal();
      }
    });

    // 6. Curated Related Recommendations
    const similarMovies = await window.movieService.getSimilar(currentMovie.id, 4);
    renderSimilarMovies(similarMovies);

  } catch (err) {
    console.error('Error rendering movie detail:', err);
    showToast('Failed to load movie details', 'error');
  }

  function updateWatchlistButtonState() {
    const isBookmarked = window.movieService.isInWatchlist(currentMovie.id);
    if (isBookmarked) {
      watchlistIcon.setAttribute('fill', 'currentColor');
      watchlistIcon.style.color = 'var(--accent-vermilion)';
      watchlistBtnText.textContent = 'Saved in Watchlist';
      btnToggleWatchlist.classList.add('btn-primary');
      btnToggleWatchlist.classList.remove('btn-secondary');
    } else {
      watchlistIcon.setAttribute('fill', 'none');
      watchlistIcon.style.color = 'inherit';
      watchlistBtnText.textContent = 'Save to Watchlist';
      btnToggleWatchlist.classList.remove('btn-primary');
      btnToggleWatchlist.classList.add('btn-secondary');
    }
  }

  function renderSimilarMovies(movies) {
    if (!movies || movies.length === 0) {
      relatedGrid.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 13px;">No related archival entries recorded.</div>`;
      return;
    }

    relatedGrid.innerHTML = '';
    movies.forEach((movie, idx) => {
      const card = document.createElement('article');
      card.className = 'movie-card';
      card.style.setProperty('--i', idx);

      const catalogNum = `№ ${String(idx + 1).padStart(2, '0')}`;

      card.innerHTML = `
        <div class="card-poster-wrapper">
          <img class="poster-img" src="${escapeHtml(movie.posterUrl || FALLBACK_POSTER)}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <div class="card-index-tag">${catalogNum}</div>
          <div class="card-score-tag">${movie.rating.toFixed(1)}</div>
        </div>

        <div class="card-body">
          <h3 class="card-title" title="${escapeHtml(movie.title)}">${escapeHtml(movie.title)}</h3>
          <div class="card-director">${escapeHtml(movie.director || 'Director')}</div>
          
          <div class="card-meta-row">
            <span>${movie.year}</span>
            <span>${escapeHtml(movie.duration || '')}</span>
          </div>
          
          <div class="card-genres">
            ${(movie.genres || []).slice(0, 2).map(g => `<span class="genre-tag">${escapeHtml(g)}</span>`).join('')}
          </div>
        </div>
      `;

      const img = card.querySelector('.poster-img');
      img.onerror = () => { img.src = FALLBACK_POSTER; };

      card.addEventListener('click', () => {
        window.location.href = `detail.html?id=${encodeURIComponent(movie.id)}`;
      });

      relatedGrid.appendChild(card);
    });
  }

  function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtube.com')) {
        const v = parsed.searchParams.get('v');
        if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1`;
      }
      if (parsed.hostname.includes('youtu.be')) {
        const v = parsed.pathname.replace(/^\//, '');
        if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1`;
      }
    } catch {
      // Invalid URL
    }
    return null;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';

    const iconSvg = type === 'success' 
      ? `<svg class="toast-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg class="toast-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toastContainer.removeChild(toast);
      }, 200);
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
