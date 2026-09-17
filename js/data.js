/**
 * CineLuxe - Movie Data Management Layer
 * Handles JSON loading, LocalStorage persistence, export/import, and watchlist state.
 */

const STORAGE_KEY = 'cineluxe_movies_catalog_v1';
const WATCHLIST_KEY = 'cineluxe_user_watchlist_v1';

// Seed catalog ensures seamless offline and file:// protocol support
const SEED_MOVIES = [
  {
    "id": "interstellar",
    "title": "Interstellar",
    "tagline": "Mankind was born on Earth. It was never meant to die here.",
    "year": 2014,
    "rating": 8.7,
    "duration": "2h 49m",
    "genres": ["Sci-Fi", "Adventure", "Drama"],
    "director": "Christopher Nolan",
    "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    "synopsis": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    "featured": true,
    "similarIds": ["blade-runner-2049", "dune-part-two", "inception"]
  },
  {
    "id": "blade-runner-2049",
    "title": "Blade Runner 2049",
    "tagline": "The key to the future is finally unearthed.",
    "year": 2017,
    "rating": 8.0,
    "duration": "2h 44m",
    "genres": ["Sci-Fi", "Mystery", "Action"],
    "director": "Denis Villeneuve",
    "cast": ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Sylvia Hoeks"],
    "synopsis": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/ilRyAZwNpHq04n457s1R47t0g6S.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=gCcx85zbxz4",
    "featured": true,
    "similarIds": ["interstellar", "dune-part-two", "inception"]
  },
  {
    "id": "dune-part-two",
    "title": "Dune: Part Two",
    "tagline": "Long live the fighters.",
    "year": 2024,
    "rating": 8.6,
    "duration": "2h 46m",
    "genres": ["Sci-Fi", "Adventure", "Action"],
    "director": "Denis Villeneuve",
    "cast": ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    "synopsis": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=Way9Dexny3w",
    "featured": true,
    "similarIds": ["blade-runner-2049", "interstellar", "oppenheimer"]
  },
  {
    "id": "oppenheimer",
    "title": "Oppenheimer",
    "tagline": "The world forever changes.",
    "year": 2023,
    "rating": 8.9,
    "duration": "3h 00m",
    "genres": ["Biography", "Drama", "History"],
    "director": "Christopher Nolan",
    "cast": ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    "synopsis": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, examining the scientific breakthroughs and profound moral dilemmas that followed.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=uYPbbksJxIg",
    "featured": false,
    "similarIds": ["interstellar", "the-dark-knight", "whiplash"]
  },
  {
    "id": "spirited-away",
    "title": "Spirited Away",
    "tagline": "Tunnel into a world where gods and spirits dwell.",
    "year": 2001,
    "rating": 8.6,
    "duration": "2h 05m",
    "genres": ["Animation", "Fantasy", "Adventure"],
    "director": "Hayao Miyazaki",
    "cast": ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki", "Takashi Naito"],
    "synopsis": "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, a world where humans are changed into beasts.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    "featured": false,
    "similarIds": ["spider-man-into-the-spider-verse", "everything-everywhere", "la-la-land"]
  },
  {
    "id": "parasite",
    "title": "Parasite",
    "tagline": "Act like you own the place.",
    "year": 2019,
    "rating": 8.5,
    "duration": "2h 12m",
    "genres": ["Drama", "Thriller", "Comedy"],
    "director": "Bong Joon Ho",
    "cast": ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    "synopsis": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=5xH0RzeSojI",
    "featured": false,
    "similarIds": ["whiplash", "the-dark-knight", "everything-everywhere"]
  },
  {
    "id": "spider-man-into-the-spider-verse",
    "title": "Spider-Man: Into the Spider-Verse",
    "tagline": "More than one wears the mask.",
    "year": 2018,
    "rating": 8.4,
    "duration": "1h 57m",
    "genres": ["Animation", "Action", "Adventure"],
    "director": "Bob Persichetti, Peter Ramsey, Rodney Rothman",
    "cast": ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld", "Mahershala Ali"],
    "synopsis": "Teen Miles Morales becomes the new Spider-Man and joins other Spider-Heroes from various parallel universes to save all of reality from Kingpin's collider.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/7d6o00OSI7j9fqVH5wz2Kkn6942.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=g4Hbz2jLxvQ",
    "featured": false,
    "similarIds": ["spirited-away", "everything-everywhere", "the-dark-knight"]
  },
  {
    "id": "the-dark-knight",
    "title": "The Dark Knight",
    "tagline": "Why so serious?",
    "year": 2008,
    "rating": 9.0,
    "duration": "2h 32m",
    "genres": ["Action", "Crime", "Drama"],
    "director": "Christopher Nolan",
    "cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    "synopsis": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/hkBaDkMWbLaf8B1rsqRmAqqnls3.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    "featured": false,
    "similarIds": ["oppenheimer", "inception", "parasite"]
  },
  {
    "id": "whiplash",
    "title": "Whiplash",
    "tagline": "The road to greatness can take you to the edge.",
    "year": 2014,
    "rating": 8.5,
    "duration": "1h 47m",
    "genres": ["Drama", "Music"],
    "director": "Damien Chazelle",
    "cast": ["Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"],
    "synopsis": "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/f2t4Jb4b74jFzYf1F4o9E7pA17Z.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=7d_jQycdQGo",
    "featured": false,
    "similarIds": ["la-la-land", "parasite", "oppenheimer"]
  },
  {
    "id": "everything-everywhere",
    "title": "Everything Everywhere All at Once",
    "tagline": "The universe is so much bigger than you realize.",
    "year": 2022,
    "rating": 8.8,
    "duration": "2h 19m",
    "genres": ["Sci-Fi", "Adventure", "Comedy"],
    "director": "Daniel Kwan, Daniel Scheinert",
    "cast": ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis"],
    "synopsis": "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/w3LxiVYPqrlrUImsYJ9jh0JWZKm.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/ss0Os3u6ut8unqV7iq68h2x2t7p.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=wxN1T1uxQ2g",
    "featured": false,
    "similarIds": ["spider-man-into-the-spider-verse", "spirited-away", "blade-runner-2049"]
  },
  {
    "id": "inception",
    "title": "Inception",
    "tagline": "Your mind is the scene of the crime.",
    "year": 2010,
    "rating": 8.8,
    "duration": "2h 28m",
    "genres": ["Sci-Fi", "Action", "Adventure"],
    "director": "Christopher Nolan",
    "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    "synopsis": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=YoHD9XEInc0",
    "featured": false,
    "similarIds": ["interstellar", "the-dark-knight", "blade-runner-2049"]
  },
  {
    "id": "la-la-land",
    "title": "La La Land",
    "tagline": "Here's to the fools who dream.",
    "year": 2016,
    "rating": 8.0,
    "duration": "2h 08m",
    "genres": ["Drama", "Music", "Romance"],
    "director": "Damien Chazelle",
    "cast": ["Ryan Gosling", "Emma Stone", "Rosemarie DeWitt", "J.K. Simmons"],
    "synopsis": "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    "posterUrl": "https://image.tmdb.org/t/p/w780/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg",
    "backdropUrl": "https://image.tmdb.org/t/p/w1280/qJeU7KM400LG1C7Y12eDqK6kGgS.jpg",
    "viewUrl": "https://www.youtube.com/watch?v=0pdqf4P9MB8",
    "featured": false,
    "similarIds": ["whiplash", "spirited-away", "everything-everywhere"]
  }
];

class MovieDataService {
  constructor() {
    this.movies = [];
    this.isReady = false;
    this.readyPromise = this.init();
  }

  async init() {
    // 1. Try reading from LocalStorage
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        this.movies = JSON.parse(cached);
        if (Array.isArray(this.movies) && this.movies.length > 0) {
          this.isReady = true;
          return this.movies;
        }
      } catch (err) {
        console.warn('Failed to parse cached movies, refreshing from source', err);
      }
    }

    // 2. Try fetching from data/movies.json
    try {
      const res = await fetch('data/movies.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.movies = data;
          this.persist();
          this.isReady = true;
          return this.movies;
        }
      }
    } catch (err) {
      // Typically network error or file:// origin restrictions
      console.log('Using embedded seed data fallback.');
    }

    // 3. Fallback to embedded seed
    this.movies = [...SEED_MOVIES];
    this.persist();
    this.isReady = true;
    return this.movies;
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.movies));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }

  async getAll() {
    await this.readyPromise;
    return [...this.movies];
  }

  async getById(id) {
    await this.readyPromise;
    return this.movies.find(m => m.id === id) || null;
  }

  async getFeatured() {
    await this.readyPromise;
    const featured = this.movies.filter(m => m.featured);
    return featured.length > 0 ? featured : [this.movies[0]];
  }

  async getSimilar(movieId, limit = 4) {
    await this.readyPromise;
    const current = this.movies.find(m => m.id === movieId);
    if (!current) return [];

    // If explicit similarIds exist
    if (current.similarIds && current.similarIds.length > 0) {
      const explicitMatches = this.movies.filter(m => current.similarIds.includes(m.id));
      if (explicitMatches.length >= limit) return explicitMatches.slice(0, limit);
    }

    // Otherwise calculate genre similarity
    const candidates = this.movies.filter(m => m.id !== movieId);
    const scored = candidates.map(m => {
      let score = 0;
      if (m.director === current.director) score += 3;
      const sharedGenres = m.genres.filter(g => current.genres.includes(g));
      score += sharedGenres.length * 2;
      return { movie: m, score };
    });

    scored.sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating);
    return scored.slice(0, limit).map(item => item.movie);
  }

  async addMovie(movie) {
    await this.readyPromise;
    
    // Generate clean slug id
    const baseSlug = movie.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'movie';
    let slug = baseSlug;
    let count = 1;
    while (this.movies.some(m => m.id === slug)) {
      slug = `${baseSlug}-${count++}`;
    }

    const newMovie = {
      id: slug,
      title: movie.title.trim(),
      tagline: movie.tagline?.trim() || '',
      year: parseInt(movie.year, 10) || new Date().getFullYear(),
      rating: parseFloat(movie.rating) || 7.5,
      duration: movie.duration?.trim() || '2h 00m',
      genres: Array.isArray(movie.genres) ? movie.genres : movie.genres.split(',').map(g => g.trim()).filter(Boolean),
      director: movie.director?.trim() || 'Unknown Director',
      cast: Array.isArray(movie.cast) ? movie.cast : (movie.cast || '').split(',').map(c => c.trim()).filter(Boolean),
      synopsis: movie.synopsis?.trim() || 'No synopsis provided.',
      posterUrl: movie.posterUrl?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80',
      backdropUrl: movie.backdropUrl?.trim() || movie.posterUrl?.trim() || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280&auto=format&fit=crop&q=80',
      viewUrl: movie.viewUrl?.trim() || 'https://www.youtube.com',
      featured: Boolean(movie.featured),
      similarIds: []
    };

    this.movies.unshift(newMovie);
    this.persist();
    return newMovie;
  }

  async deleteMovie(id) {
    await this.readyPromise;
    this.movies = this.movies.filter(m => m.id !== id);
    this.persist();
    return true;
  }

  async resetCatalog() {
    this.movies = [...SEED_MOVIES];
    this.persist();
    return [...this.movies];
  }

  exportJSON() {
    const jsonStr = JSON.stringify(this.movies, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movies-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importJSON(fileOrText) {
    try {
      const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        this.movies = parsed;
        this.persist();
        return { success: true, count: parsed.length };
      }
      throw new Error('Invalid JSON format: array of movie objects expected.');
    } catch (err) {
      console.error('Import failed:', err);
      return { success: false, error: err.message };
    }
  }

  // Watchlist helpers
  getWatchlist() {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  }

  toggleWatchlist(id) {
    const list = this.getWatchlist();
    const index = list.indexOf(id);
    let added = false;
    if (index > -1) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(id);
      added = true;
    }
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    return { added, count: list.length };
  }

  isInWatchlist(id) {
    return this.getWatchlist().includes(id);
  }
}

// Singleton global instance
window.movieService = new MovieDataService();
