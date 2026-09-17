/**
 * CineLuxe - Add New Film Submission Logic
 * Manages live preview synchronization, image verification,
 * checklist status, link validation, and JSON archive persistence.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure movieService is ready
  await window.movieService.getAll();

  const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80';
  const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280&auto=format&fit=crop&q=80';

  // Form Inputs
  const form = document.getElementById('newFilmForm');
  const inputTitle = document.getElementById('addTitle');
  const inputTagline = document.getElementById('addTagline');
  const inputYear = document.getElementById('addYear');
  const inputRating = document.getElementById('addRating');
  const inputDuration = document.getElementById('addDuration');
  const inputGenres = document.getElementById('addGenres');
  const inputDirector = document.getElementById('addDirector');
  const inputCast = document.getElementById('addCast');
  const inputPosterUrl = document.getElementById('addPosterUrl');
  const inputBackdropUrl = document.getElementById('addBackdropUrl');
  const inputViewUrl = document.getElementById('addViewUrl');
  const inputFeatured = document.getElementById('addFeatured');
  const inputSynopsis = document.getElementById('addSynopsis');

  const btnResetForm = document.getElementById('btnResetForm');
  const btnTestViewLink = document.getElementById('btnTestViewLink');
  const btnSubmitFilm = document.getElementById('btnSubmitFilm');
  const toastContainer = document.getElementById('toastContainer');

  // Preview Stage Elements
  const previewTitle = document.getElementById('previewTitle');
  const previewDirector = document.getElementById('previewDirector');
  const previewYear = document.getElementById('previewYear');
  const previewDuration = document.getElementById('previewDuration');
  const previewScoreTag = document.getElementById('previewScoreTag');
  const previewGenres = document.getElementById('previewGenres');
  const previewPosterImg = document.getElementById('previewPosterImg');
  const previewBackdropImg = document.getElementById('previewBackdropImg');
  const backdropStatusTag = document.getElementById('backdropStatusTag');

  // Checklist items
  const checkTitle = document.getElementById('checkTitle');
  const checkDirector = document.getElementById('checkDirector');
  const checkGenres = document.getElementById('checkGenres');
  const checkPoster = document.getElementById('checkPoster');
  const checkViewLink = document.getElementById('checkViewLink');
  const checkSynopsis = document.getElementById('checkSynopsis');

  // 1. Synchronize Live Card Preview
  function updateLivePreview() {
    const titleVal = inputTitle.value.trim();
    previewTitle.textContent = titleVal || 'Movie Title';

    const directorVal = inputDirector.value.trim();
    previewDirector.textContent = directorVal ? `Dir. ${directorVal}` : 'Director Name';

    previewYear.textContent = inputYear.value || '2024';
    previewDuration.textContent = inputDuration.value.trim() || '2h 00m';

    const ratingVal = parseFloat(inputRating.value);
    previewScoreTag.textContent = !isNaN(ratingVal) ? ratingVal.toFixed(1) : '8.0';

    // Genres
    const rawGenres = inputGenres.value.trim();
    if (rawGenres) {
      const tags = rawGenres.split(',').map(g => g.trim()).filter(Boolean);
      previewGenres.innerHTML = tags.slice(0, 3)
        .map(t => `<span class="genre-tag">${escapeHtml(t)}</span>`)
        .join('');
    } else {
      previewGenres.innerHTML = '<span class="genre-tag">Genre</span>';
    }

    // Poster Image URL verification
    const posterVal = inputPosterUrl.value.trim();
    if (isValidHttpUrl(posterVal)) {
      previewPosterImg.src = posterVal;
      previewPosterImg.onerror = () => {
        previewPosterImg.src = FALLBACK_POSTER;
        setChecklistValid(checkPoster, false);
      };
      previewPosterImg.onload = () => {
        setChecklistValid(checkPoster, true);
      };
    } else {
      previewPosterImg.src = FALLBACK_POSTER;
      setChecklistValid(checkPoster, false);
    }

    // Backdrop Image
    const backdropVal = inputBackdropUrl.value.trim();
    if (isValidHttpUrl(backdropVal)) {
      previewBackdropImg.src = backdropVal;
      backdropStatusTag.textContent = 'Custom Backdrop Verified';
      previewBackdropImg.onerror = () => {
        previewBackdropImg.src = FALLBACK_BACKDROP;
        backdropStatusTag.textContent = 'Invalid Backdrop URL';
      };
    } else if (isValidHttpUrl(posterVal)) {
      previewBackdropImg.src = posterVal;
      backdropStatusTag.textContent = 'Derived from Poster';
    } else {
      previewBackdropImg.src = FALLBACK_BACKDROP;
      backdropStatusTag.textContent = 'Default Still';
    }

    // Checklist Verification
    setChecklistValid(checkTitle, Boolean(titleVal && inputYear.value));
    setChecklistValid(checkDirector, Boolean(directorVal));
    setChecklistValid(checkGenres, Boolean(rawGenres));
    setChecklistValid(checkViewLink, isValidHttpUrl(inputViewUrl.value.trim()));
    setChecklistValid(checkSynopsis, inputSynopsis.value.trim().length >= 10);
  }

  function setChecklistValid(el, isValid) {
    if (!el) return;
    if (isValid) {
      el.classList.add('valid');
    } else {
      el.classList.remove('valid');
    }
  }

  function isValidHttpUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Bind real-time input listeners
  const watchedInputs = [
    inputTitle, inputTagline, inputYear, inputRating, inputDuration,
    inputGenres, inputDirector, inputPosterUrl, inputBackdropUrl,
    inputViewUrl, inputSynopsis
  ];

  watchedInputs.forEach(input => {
    input.addEventListener('input', updateLivePreview);
    input.addEventListener('change', updateLivePreview);
  });

  // 2. Test Link to View Button
  btnTestViewLink.addEventListener('click', () => {
    const url = inputViewUrl.value.trim();
    if (!isValidHttpUrl(url)) {
      showToast('Enter a valid URL starting with http:// or https://', 'info');
      inputViewUrl.focus();
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Destination link opened in new tab for verification');
  });

  // 3. Clear Inputs Button
  btnResetForm.addEventListener('click', () => {
    if (confirm('Clear all entered movie information?')) {
      form.reset();
      inputYear.value = '2024';
      inputRating.value = '8.0';
      inputDuration.value = '2h 00m';
      updateLivePreview();
      showToast('Form inputs cleared', 'info');
    }
  });

  // 4. Form Submission: Commit to JSON Archive
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = inputTitle.value.trim();
    const tagline = inputTagline.value.trim();
    const year = parseInt(inputYear.value, 10);
    const rating = parseFloat(inputRating.value);
    const duration = inputDuration.value.trim() || '2h 00m';
    const genres = inputGenres.value.trim();
    const director = inputDirector.value.trim();
    const cast = inputCast.value.trim();
    const posterUrl = inputPosterUrl.value.trim();
    const backdropUrl = inputBackdropUrl.value.trim();
    const viewUrl = inputViewUrl.value.trim();
    const synopsis = inputSynopsis.value.trim();
    const featured = inputFeatured.checked;

    if (!title || !director || !genres || !posterUrl || !viewUrl || !synopsis) {
      showToast('Please complete all mandatory fields', 'error');
      return;
    }

    if (!isValidHttpUrl(posterUrl)) {
      showToast('Invalid Foto URL. Must begin with http:// or https://', 'error');
      inputPosterUrl.focus();
      return;
    }

    if (!isValidHttpUrl(viewUrl)) {
      showToast('Invalid Viewing Link. Must begin with http:// or https://', 'error');
      inputViewUrl.focus();
      return;
    }

    btnSubmitFilm.disabled = true;
    btnSubmitFilm.innerHTML = `
      <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
      <span>Committing...</span>
    `;

    try {
      const newMovie = await window.movieService.addMovie({
        title,
        tagline,
        year,
        rating,
        duration,
        genres,
        director,
        cast,
        posterUrl,
        backdropUrl: backdropUrl || posterUrl,
        viewUrl,
        synopsis,
        featured
      });

      showToast(`Cataloged "${newMovie.title}" to JSON Archive!`);

      // Redirect to newly created film's detail dossier page
      setTimeout(() => {
        window.location.href = `detail.html?id=${encodeURIComponent(newMovie.id)}`;
      }, 900);

    } catch (err) {
      console.error('Submission failed:', err);
      showToast('Failed to save film to archive', 'error');
      btnSubmitFilm.disabled = false;
      btnSubmitFilm.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Save to JSON Archive</span>
      `;
    }
  });

  // 5. Toast Notification System
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

  // Run initial preview population
  updateLivePreview();
});
