# CineLuxe - Movie Recommendation Web App

A movie recommendation web application built with HTML5, CSS3, vanilla JavaScript, and JSON data persistence, designed according to Emil Kowalski's UI engineering principles.

## Features

- **4 Dedicated Pages**:
  - **Movie Catalog (`index.html`)**:
    - **Hero Spotlight**: Featured movie recommendation banner with atmospheric backdrop and instant watch/details action.
    - **Live Fuzzy Search**: Filter by title, director, cast, or genre. Keyboard shortcut `/` to focus search instantly.
    - **Category Tabs**: Filter by genres or view your personal **Watchlist**.
    - **Sorting Selector**: Highest Rated, Newest, Classic, and Alphabetical (A-Z).
    - **Movie Card Grid**: Staggered entrances, hover action bar (`Trailer`, `Edit`, `Save`), and rating badge.
    - **JSON Export & Reset**: One-click "Export JSON" button to download `movies.json` with all saved changes, plus reset to default seed.
  - **Detail Page (`detail.html`)**:
    - Accessible via `detail.html?id=<movie-id>`.
    - Immersive full-bleed backdrop with dark gradient vignettes.
    - High-resolution movie poster with specular border.
    - **Action Controls**: "Watch / Link to View", "Play Trailer" modal, "Add to Watchlist", and direct **"Edit Entry"** link.
    - Comprehensive metadata: Critic score, release year, runtime, director, genre tags, storyline, and starring cast badges.
    - **"More Like This" Recommendations**: Curated similar movies based on overlapping genres and director.
  - **Add Film Studio Page (`add.html`)**:
    - Full-page archival submission studio for new film recommendations.
    - **Sectioned Dossier Form**: Film identification, credits & personnel, media assets & viewing links, and narrative synopsis.
    - **Live Real-time Preview Stage**: Instant rendering of the movie card, score tag, and backdrop frame as inputs change.
    - **Interactive Verification**: Pre-commit validation checklist and live "Test Link" action to test streaming/trailer URLs.
    - Direct persistence into the JSON catalog with instant redirect to the new film's detail dossier.
  - **Edit Film Studio Page (`edit.html`)**:
    - Accessible via `edit.html?id=<movie-id>` or from any card's "Edit" action button or the detail page.
    - Pre-populates all existing metadata, posters, viewing URLs, and synopsis.
    - Live real-time preview reflecting edits instantly.
    - Save updates to the JSON archive with confirmation toasts.
    - Safe "Delete Film Entry" action with confirmation dialog.

## Design Engineering Polish (`emil-design-eng`)

- **Tactile Micro-interactions**: `transform: scale(0.97)` on `:active` for all pressable buttons and controls with `160ms ease-out` timing.
- **Natural Entrances**: Modals and cards scale in from `scale(0.95)` with `opacity: 0` (never from `scale(0)`).
- **Custom Easing Curves**:
  - `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
  - `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);`
- **Touch-safe Hover States**: All hover animations are gated behind `@media (hover: hover) and (pointer: fine)`.
- **GPU-accelerated**: Only transforms and opacities are animated, maintaining smooth 60fps rendering.
- **Sonner-inspired Toast Alerts**: Non-intrusive feedback for saving movies, watchlist toggles, and JSON exports.

## How to Run

You can open the HTML files directly in your web browser:
```bash
# Option 1: Direct open
Open index.html in any modern browser (Chrome, Edge, Firefox, Safari)

# Option 2: Run with local HTTP server
npx serve .
# or
python -m http.server 3000
```
