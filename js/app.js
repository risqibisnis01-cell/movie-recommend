/**
 * CineLuxe - Main Catalog Application Logic
 * Anti-Slop (antislop-ui) and Emil Kowalski craft adherence:
 * - Zero decorative emojis
 * - Clean archival indexing
 * - Precise interaction targets
 */

document.addEventListener('DOMContentLoaded', async () => {
  // State
  let allMovies = [];
  let currentGenre = 'All';
  let searchQuery = '';
  let currentSort = 'rating-desc';

  // DOM Elements
  const heroSection = document.getElementById('heroSection');
  const heroBackdropImg = document.getElementById('heroBackdropImg');
  const heroTitle = document.getElementById('heroTitle');
  const heroTagline = document.getElementById('heroTagline');
  const heroRating = document.getElementById('heroRating');
  const heroYear = document.getElementById('heroYear');
  const heroDuration = document.getElementById('heroDuration');
  const heroGenres = document.getElementById('heroGenres');
  const heroViewLink = document.getElementById('heroViewLink');
  const heroDetailLink = document.getElementById('heroDetailLink');

  const movieGrid = document.getElementById('movieGrid');
  const genrePillsContainer = document.getElementById('genrePills');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const catalogCount = document.getElementById('catalogCount');

  // Modal elements
  const addMovieModal = document.getElementById('addMovieModal');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const btnCloseAddModal = document.getElementById('btnCloseAddModal');
  const btnCancelAdd = document.getElementById('btnCancelAdd');
  const addMovieForm = document.getElementById('addMovieForm');
  const moviePosterUrlInput = document.getElementById('moviePosterUrl');
  const posterPreviewRow = document.getElementById('posterPreviewRow');
  const posterPreviewImg = document.getElementById('posterPreviewImg');

  const btnExportJson = document.getElementById('btnExportJson');
  const btnResetCatalog = document.getElementById('btnResetCatalog');
  const toastContainer = document.getElementById('toastContainer');

  const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80';
  const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280&auto=format&fit=crop&q=80';

  // 1. Initialize data
  try {
    allMovies = await window.movieService.getAll();
    renderHeroSpotlight(allMovies);
    renderGenrePills(allMovies);
    applyFiltersAndRender();
  } catch (err) {
    console.error('Failed to load movie archive:', err);
    showToast('Failed to load movie database', 'error');
  }

  // 2. Render Hero Spotlight
  function renderHeroSpotlight(movies) {
    if (!movies || movies.length === 0) return;
    const featured = movies.filter(m => m.featured);
    const heroMovie = featured.length > 0 ? featured[0] : movies[0];

    heroBackdropImg.src = heroMovie.backdropUrl || heroMovie.posterUrl || FALLBACK_BACKDROP;
    heroBackdropImg.onerror = () => { heroBackdropImg.src = FALLBACK_BACKDROP; };

    heroTitle.textContent = heroMovie.title;
    heroTagline.textContent = heroMovie.tagline || heroMovie.synopsis.slice(0, 100) + '...';
    
    heroRating.innerHTML = `
      <span style="font-size: 10px; text-transform: uppercase; color: var(--text-muted);">SCORE</span>
      <span>${heroMovie.rating.toFixed(1)}</span>
    `;

    heroYear.textContent = heroMovie.year;
    heroDuration.textContent = heroMovie.duration;
    heroGenres.textContent = Array.isArray(heroMovie.genres) ? heroMovie.genres.join(' • ') : '';

    heroViewLink.href = heroMovie.viewUrl;
    heroDetailLink.href = `detail.html?id=${encodeURIComponent(heroMovie.id)}`;
  }

  // 3. Render Genre Filter Tabs (Anti-slop: clean text, no emojis)
  function renderGenrePills(movies) {
    const genreCounts = {};
    movies.forEach(m => {
      if (Array.isArray(m.genres)) {
        m.genres.forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    const watchlistCount = window.movieService.getWatchlist().length;
    const standardGenres = [
      { name: 'All', count: movies.length },
      ...Object.keys(genreCounts).sort().map(g => ({ name: g, count: genreCounts[g] })),
      { name: 'Watchlist', count: watchlistCount }
    ];

    genrePillsContainer.innerHTML = '';

    standardGenres.forEach(genreItem => {
      const btn = document.createElement('button');
      btn.className = `pill-btn ${genreItem.name === currentGenre ? 'active' : ''}`;
      btn.innerHTML = `
        <span>${escapeHtml(genreItem.name)}</span>
        <span class="pill-count-badge">${genreItem.count}</span>
      `;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', genreItem.name === currentGenre);

      btn.addEventListener('click', () => {
        if (currentGenre === genreItem.name) return;
        currentGenre = genreItem.name;
        document.querySelectorAll('.pill-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        applyFiltersAndRender();
      });

      genrePillsContainer.appendChild(btn);
    });
  }

  // 4. Filtering and Sorting Logic
  function applyFiltersAndRender() {
    let filtered = [...allMovies];

    // Filter by Genre or Watchlist
    if (currentGenre === 'Watchlist') {
      const watchlist = window.movieService.getWatchlist();
      filtered = filtered.filter(m => watchlist.includes(m.id));
    } else if (currentGenre !== 'All') {
      filtered = filtered.filter(m => m.genres && m.genres.includes(currentGenre));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => {
        const titleMatch = m.title.toLowerCase().includes(q);
        const directorMatch = m.director && m.director.toLowerCase().includes(q);
        const castMatch = Array.isArray(m.cast) && m.cast.some(c => c.toLowerCase().includes(q));
        const genreMatch = Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes(q));
        return titleMatch || directorMatch || castMatch || genreMatch;
      });
    }

    // Sorting
    switch (currentSort) {
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'year-desc':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        filtered.sort((a, b) => a.year - b.year);
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    renderGrid(filtered);
  }

  // 5. Render Movie Cards Grid with Archival Indexing
  function renderGrid(movies) {
    catalogCount.textContent = `${movies.length} ${movies.length === 1 ? 'FILM' : 'FILMS'} CATALOGED`;

    if (movies.length === 0) {
      movieGrid.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <div class="empty-state-title">No Archive Entries Found</div>
          <div class="empty-state-desc">No films matching "${escapeHtml(searchQuery || currentGenre)}" were located in the repository.</div>
          <button id="btnResetFilter" class="btn btn-secondary" style="margin-top: 8px;">Reset Filter Parameters</button>
        </div>
      `;
      const btnResetFilter = document.getElementById('btnResetFilter');
      if (btnResetFilter) {
        btnResetFilter.addEventListener('click', () => {
          searchInput.value = '';
          searchQuery = '';
          currentGenre = 'All';
          renderGenrePills(allMovies);
          applyFiltersAndRender();
        });
      }
      return;
    }

    movieGrid.innerHTML = '';
    const watchlist = window.movieService.getWatchlist();

    movies.forEach((movie, idx) => {
      const card = document.createElement('article');
      card.className = 'movie-card';
      card.style.setProperty('--i', idx);

      const isBookmarked = watchlist.includes(movie.id);
      const catalogNum = `№ ${String(idx + 1).padStart(2, '0')}`;

      card.innerHTML = `
        <div class="card-poster-wrapper">
          <img class="poster-img" src="${escapeHtml(movie.posterUrl || FALLBACK_POSTER)}" alt="${escapeHtml(movie.title)}" loading="lazy">
          
          <div class="card-index-tag">${catalogNum}</div>
          <div class="card-score-tag">${movie.rating.toFixed(1)}</div>

          <!-- Bottom Action Bar on Hover -->
          <div class="card-action-bar">
            <a href="${escapeHtml(movie.viewUrl)}" target="_blank" rel="noopener noreferrer" class="card-action-btn" title="Watch Trailer">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Trailer</span>
            </a>

            <button class="card-action-btn card-btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-id="${movie.id}" title="${isBookmarked ? 'Remove Bookmark' : 'Add to Watchlist'}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
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

      // Card click -> navigate to detail
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-action-bar')) return;
        window.location.href = `detail.html?id=${encodeURIComponent(movie.id)}`;
      });

      // Bookmark action listener
      const bookmarkBtn = card.querySelector('.card-btn-bookmark');
      bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const result = window.movieService.toggleWatchlist(movie.id);
        if (result.added) {
          bookmarkBtn.classList.add('bookmarked');
          bookmarkBtn.querySelector('svg').setAttribute('fill', 'currentColor');
          bookmarkBtn.querySelector('span').textContent = 'Saved';
          showToast(`Cataloged "${movie.title}" to Watchlist`);
        } else {
          bookmarkBtn.classList.remove('bookmarked');
          bookmarkBtn.querySelector('svg').setAttribute('fill', 'none');
          bookmarkBtn.querySelector('span').textContent = 'Save';
          showToast(`Removed "${movie.title}" from Watchlist`, 'info');
          if (currentGenre === 'Watchlist') {
            applyFiltersAndRender();
          }
        }
        renderGenrePills(allMovies);
      });

      movieGrid.appendChild(card);
    });
  }

  // 6. Search & Keyboard Interaction
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      applyFiltersAndRender();
    }, 120);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !addMovieModal.classList.contains('open')) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && addMovieModal.classList.contains('open')) {
      closeAddModal();
    }
  });

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFiltersAndRender();
  });

  // 7. Add Movie Modal Handlers
  function openAddModal() {
    addMovieModal.classList.add('open');
    addMovieModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('movieTitle').focus();
  }

  function closeAddModal() {
    addMovieModal.classList.remove('open');
    addMovieModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    addMovieForm.reset();
    posterPreviewRow.style.display = 'none';
  }

  if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', openAddModal);
  if (btnCloseAddModal) btnCloseAddModal.addEventListener('click', closeAddModal);
  if (btnCancelAdd) btnCancelAdd.addEventListener('click', closeAddModal);

  if (addMovieModal) {
    addMovieModal.addEventListener('click', (e) => {
      if (e.target === addMovieModal) closeAddModal();
    });
  }

  if (moviePosterUrlInput) {
    moviePosterUrlInput.addEventListener('input', () => {
      const url = moviePosterUrlInput.value.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        posterPreviewImg.src = url;
        posterPreviewImg.onerror = () => { posterPreviewRow.style.display = 'none'; };
        posterPreviewImg.onload = () => { posterPreviewRow.style.display = 'flex'; };
      } else {
        posterPreviewRow.style.display = 'none';
      }
    });
  }

  if (addMovieForm) {
    addMovieForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('movieTitle').value.trim();
      const tagline = document.getElementById('movieTagline').value.trim();
      const year = document.getElementById('movieYear').value;
      const rating = document.getElementById('movieRating').value;
      const duration = document.getElementById('movieDuration').value.trim();
      const genres = document.getElementById('movieGenres').value.trim();
      const director = document.getElementById('movieDirector').value.trim();
      const cast = document.getElementById('movieCast').value.trim();
      const posterUrl = document.getElementById('moviePosterUrl').value.trim();
      const backdropUrl = document.getElementById('movieBackdropUrl').value.trim();
      const viewUrl = document.getElementById('movieViewUrl').value.trim();
      const synopsis = document.getElementById('movieSynopsis').value.trim();

      if (!title || !posterUrl || !viewUrl || !synopsis) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      const newMovieData = {
        title,
        tagline,
        year,
        rating,
        duration: duration || '2h 00m',
        genres,
        director: director || 'Unknown Director',
        cast,
        posterUrl,
        backdropUrl: backdropUrl || posterUrl,
        viewUrl,
        synopsis,
        featured: false
      };

      try {
        const created = await window.movieService.addMovie(newMovieData);
        allMovies = await window.movieService.getAll();
        renderGenrePills(allMovies);
        applyFiltersAndRender();
        closeAddModal();
        showToast(`Cataloged "${created.title}" to database.`);
      } catch (err) {
        console.error('Save failed:', err);
        showToast('Error saving movie entry', 'error');
      }
    });
  }

  // 8. Export JSON button
  btnExportJson.addEventListener('click', () => {
    window.movieService.exportJSON();
    showToast('Downloaded movies.json');
  });

  // 9. Reset Catalog button
  btnResetCatalog.addEventListener('click', async () => {
    if (confirm('Reset entire collection back to default seed archive?')) {
      allMovies = await window.movieService.resetCatalog();
      renderHeroSpotlight(allMovies);
      renderGenrePills(allMovies);
      applyFiltersAndRender();
      showToast('Catalog restored to default seed', 'info');
    }
  });

  // 10. Sonner-style Toast Helper
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
        if (toast.parentNode) {
          toastContainer.removeChild(toast);
        }
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
