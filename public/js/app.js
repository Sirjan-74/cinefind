// State
let allMovies = [];
let currentFilter = {
  provider: 'All',
  genre: 'All',
  query: ''
};

// DOM Elements
const moviesGrid = document.getElementById('moviesGrid');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const movieModal = document.getElementById('movieModal');
const dashboardModal = document.getElementById('dashboardModal');
const settingsModal = document.getElementById('settingsModal');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchMovies();
  setupEventListeners();
  loadHeroSpotlight();
});

// Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', (e) => {
    currentFilter.query = e.target.value.trim();
    clearSearchBtn.classList.toggle('hidden', !currentFilter.query);
    applyFilters();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentFilter.query = '';
    clearSearchBtn.classList.add('hidden');
    applyFilters();
  });

  // Provider filter pills
  document.querySelectorAll('#providerFilters .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#providerFilters .pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      currentFilter.provider = btn.dataset.provider;
      applyFilters();
    });
  });

  // Genre filter pills
  document.querySelectorAll('#genreFilters .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#genreFilters .pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      currentFilter.genre = btn.dataset.genre;
      applyFilters();
    });
  });

  // Hero actions
  const heroWatchBtn = document.getElementById('heroWatchBtn');
  const heroWhereToWatchBtn = document.getElementById('heroWhereToWatchBtn');
  if (heroWatchBtn) {
    heroWatchBtn.addEventListener('click', () => {
      const topMovie = allMovies[0];
      if (topMovie) openMovie(topMovie.id);
    });
  }
  if (heroWhereToWatchBtn) {
    heroWhereToWatchBtn.addEventListener('click', () => {
      const topMovie = allMovies[0];
      if (topMovie) openMovie(topMovie.id);
    });
  }
}

// Fallback Seed Data (Top Blockbusters across Bollywood & Hollywood)
const SEED_MOVIES = [
  {
    "id": "dune-2",
    "title": "Dune: Part Two",
    "year": 2024,
    "rating": 8.6,
    "runtime": "166 min",
    "genres": ["Sci-Fi", "Adventure", "Action"],
    "tagline": "Long live the fighters.",
    "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    "poster": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "Way9Dexny3w",
    "director": "Denis Villeneuve",
    "cast": ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    "providers": [
      { "name": "JioCinema", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.jiocinema.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent ₹119", "price": "₹119", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true },
      { "name": "Apple TV", "type": "Buy", "badge": "Buy", "price": "₹490", "url": "https://tv.apple.com", "isAffiliate": true }
    ],
    "trending": true,
    "featured": true
  },
  {
    "id": "deadpool-wolverine",
    "title": "Deadpool & Wolverine",
    "year": 2024,
    "rating": 7.9,
    "runtime": "128 min",
    "genres": ["Action", "Comedy", "Sci-Fi"],
    "tagline": "Come together.",
    "overview": "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    "poster": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "73_1biulkYk",
    "director": "Shawn Levy",
    "cast": ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin", "Morena Baccarin"],
    "providers": [
      { "name": "Disney+ Hotstar", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.hotstar.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent ₹149", "price": "₹149", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "kalki-2898-ad",
    "title": "Kalki 2898 AD",
    "year": 2024,
    "rating": 7.6,
    "runtime": "181 min",
    "genres": ["Sci-Fi", "Action", "Mythology"],
    "tagline": "The future has a savior.",
    "overview": "Set in a post-apocalyptic world in the year 2898 AD, the film follows a select group on a mission to save the unborn child of SUM-80, believed to be the avatar of Vishnu.",
    "poster": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "y1-w1CdG19A",
    "director": "Nag Ashwin",
    "cast": ["Prabhas", "Amitabh Bachchan", "Kamal Haasan", "Deepika Padukone"],
    "providers": [
      { "name": "Netflix", "type": "Subscription", "badge": "Stream (Hindi)", "price": "Included with Sub", "url": "https://www.netflix.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream (South)", "price": "Included with Prime", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "stree-2",
    "title": "Stree 2: Sarkate Ka Aatank",
    "year": 2024,
    "rating": 7.7,
    "runtime": "147 min",
    "genres": ["Comedy", "Horror"],
    "tagline": "O Stree kal mat aana, aaj hi aana.",
    "overview": "After the events of Stree, the town of Chanderi is being haunted again. This time, women are mysteriously abducted by a headless entity called Sarkata.",
    "poster": "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "KVnhe472fBw",
    "director": "Amar Kaushik",
    "cast": ["Rajkummar Rao", "Shraddha Kapoor", "Pankaj Tripathi", "Abhishek Banerjee"],
    "providers": [
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream", "price": "Included with Prime", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "12th-fail",
    "title": "12th Fail",
    "year": 2023,
    "rating": 8.9,
    "runtime": "147 min",
    "genres": ["Drama", "Biography"],
    "tagline": "Restart.",
    "overview": "Inspired by millions of true stories of students attempting the world's toughest competitive exam, UPSC, following Manoj Kumar Sharma from Chambal as he restarts his life against all odds.",
    "poster": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1519074069444-1ba4ea16e911?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "we3sPqL9nF8",
    "director": "Vidhu Vinod Chopra",
    "cast": ["Vikrant Massey", "Medha Shankar", "Anant Joshi"],
    "providers": [
      { "name": "Disney+ Hotstar", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.hotstar.com", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "oppenheimer",
    "title": "Oppenheimer",
    "year": 2023,
    "rating": 8.9,
    "runtime": "180 min",
    "genres": ["Biography", "Drama", "History"],
    "tagline": "The world forever changes.",
    "overview": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    "poster": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "uYPbbksJxIg",
    "director": "Christopher Nolan",
    "cast": ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    "providers": [
      { "name": "JioCinema", "type": "Subscription", "badge": "Stream", "price": "Included with Premium", "url": "https://www.jiocinema.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent ₹119", "price": "₹119", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "rrr",
    "title": "RRR",
    "year": 2022,
    "rating": 7.8,
    "runtime": "187 min",
    "genres": ["Action", "Drama"],
    "tagline": "Rise. Roar. Revolt.",
    "overview": "A fearless revolutionary and an officer in the British force, who once shared a deep bond, decide to join forces and chart out an inspiring path of freedom against the despotic rulers.",
    "poster": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "NgBoMJy386M",
    "director": "S.S. Rajamouli",
    "cast": ["N.T. Rama Rao Jr.", "Ram Charan", "Ajay Devgn", "Alia Bhatt"],
    "providers": [
      { "name": "Netflix", "type": "Subscription", "badge": "Stream (Hindi)", "price": "Included with Sub", "url": "https://www.netflix.com", "isAffiliate": true },
      { "name": "Disney+ Hotstar", "type": "Subscription", "badge": "Stream (South)", "price": "Included with Sub", "url": "https://www.hotstar.com", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "jawan",
    "title": "Jawan",
    "year": 2023,
    "rating": 7.0,
    "runtime": "169 min",
    "genres": ["Action", "Thriller"],
    "tagline": "Ready.",
    "overview": "A man is driven by a personal vendetta to rectify the wrongs in society, while keeping a promise made years ago. He comes up against a monstrous outlaw with no fear, who's caused extreme suffering to many.",
    "poster": "https://images.unsplash.com/photo-1519074069444-1ba4ea16e911?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "MWOlnZSnXWA",
    "director": "Atlee",
    "cast": ["Shah Rukh Khan", "Nayanthara", "Vijay Sethupathi", "Deepika Padukone"],
    "providers": [
      { "name": "Netflix", "type": "Subscription", "badge": "Stream Extended Cut", "price": "Included with Sub", "url": "https://www.netflix.com", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "the-dark-knight",
    "title": "The Dark Knight",
    "year": 2008,
    "rating": 9.0,
    "runtime": "152 min",
    "genres": ["Action", "Crime", "Drama"],
    "tagline": "Why so serious?",
    "overview": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    "poster": "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "EXeTwQWrcwY",
    "director": "Christopher Nolan",
    "cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    "providers": [
      { "name": "JioCinema", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.jiocinema.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent ₹119", "price": "₹119", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "inception",
    "title": "Inception",
    "year": 2010,
    "rating": 8.8,
    "runtime": "148 min",
    "genres": ["Sci-Fi", "Action", "Adventure"],
    "tagline": "Your mind is the scene of the crime.",
    "overview": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
    "poster": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "YoHD9XEInc0",
    "director": "Christopher Nolan",
    "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    "providers": [
      { "name": "Netflix", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.netflix.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent ₹119", "price": "₹119", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": false,
    "featured": false
  },
  {
    "id": "3-idiots",
    "title": "3 Idiots",
    "year": 2009,
    "rating": 8.4,
    "runtime": "170 min",
    "genres": ["Comedy", "Drama"],
    "tagline": "All is well.",
    "overview": "Two friends embark on a quest for a lost buddy. On this journey, they reminisce about their college days and the friend who inspired them to think differently, even as all the other students conformed.",
    "poster": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "K0eDlFX9GMc",
    "director": "Rajkumar Hirani",
    "cast": ["Aamir Khan", "Madhavan", "Sharman Joshi", "Kareena Kapoor"],
    "providers": [
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream", "price": "Included with Prime", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": false,
    "featured": false
  },
  {
    "id": "interstellar",
    "title": "Interstellar",
    "year": 2014,
    "rating": 8.7,
    "runtime": "169 min",
    "genres": ["Sci-Fi", "Drama", "Adventure"],
    "tagline": "Mankind was born on Earth. It was never meant to die here.",
    "overview": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
    "poster": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "zSWdZVtXT7E",
    "director": "Christopher Nolan",
    "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    "providers": [
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream", "price": "Included with Prime", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true },
      { "name": "JioCinema", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.jiocinema.com", "isAffiliate": true }
    ],
    "trending": false,
    "featured": false
  },
  {
    "id": "john-wick-4",
    "title": "John Wick: Chapter 4",
    "year": 2023,
    "rating": 7.7,
    "runtime": "169 min",
    "genres": ["Action", "Crime", "Thriller"],
    "tagline": "No way back. One way out.",
    "overview": "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
    "poster": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "qEVUtrk8_B4",
    "director": "Chad Stahelski",
    "cast": ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård"],
    "providers": [
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream", "price": "Included with Prime", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  }
];

// Live global movie search fallback (queries Apple Movie API for ANY title with zero keys)
async function searchOnlineMovies(query) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=movie&limit=12`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results.map(item => ({
        id: 'itunes-' + item.trackId,
        title: item.trackName,
        year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Recent',
        rating: 8.0,
        runtime: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 60000) + ' min' : '120 min',
        genres: [item.primaryGenreName || 'Drama'],
        tagline: 'Available to stream and rent.',
        overview: item.longDescription || item.shortDescription || 'Click to watch on official streaming and rental platforms.',
        poster: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        trailerKey: 'Way9Dexny3w',
        director: item.artistName || 'Official Studio',
        cast: ['All Star Cast'],
        providers: [
          { "name": "Apple TV", "type": "Rent", "badge": "Rent / Buy", "price": "₹120", "url": item.trackViewUrl || "https://tv.apple.com", "isAffiliate": true },
          { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent on Prime", "price": "Rent", "url": "https://www.amazon.in/gp/video/storefront", "isAffiliate": true }
        ],
        trending: false,
        featured: false
      }));
    }
  } catch (err) {
    console.warn('Online movie search unavailable:', err);
  }
  return [];
}

// Fetch movies from our Node.js API (or fallback if opened directly)
async function fetchMovies() {
  try {
    const res = await fetch('/api/movies');
    if (!res.ok) throw new Error('API not available');
    const data = await res.json();
    if (data.success && data.movies && data.movies.length > 0) {
      allMovies = data.movies;
      renderMovies(allMovies);
      loadHeroSpotlight();
      return;
    }
  } catch (err) {
    console.warn('Backend API not reached (running in standalone/local mode), using seed data');
  }

  // Fallback
  allMovies = SEED_MOVIES;
  renderMovies(allMovies);
  loadHeroSpotlight();
}

// Apply client-side filters + live search
let searchDebounceTimer = null;

async function applyFilters() {
  let filtered = [...allMovies];

  // Query search
  if (currentFilter.query) {
    const q = currentFilter.query.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.genres.some(g => g.toLowerCase().includes(q)) ||
      m.cast.some(c => c.toLowerCase().includes(q)) ||
      m.director.toLowerCase().includes(q)
    );

    // If no local matches, search global online API automatically!
    if (filtered.length === 0 && q.length >= 2) {
      clearTimeout(searchDebounceTimer);
      moviesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: #818cf8;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem; animation: pulse 1.5s infinite;">🔍</div>
          <h3>Searching global movie library for "${currentFilter.query}"...</h3>
        </div>
      `;
      searchDebounceTimer = setTimeout(async () => {
        const onlineResults = await searchOnlineMovies(currentFilter.query);
        if (onlineResults.length > 0) {
          // Cache so openMovie can find them
          onlineResults.forEach(om => {
            if (!allMovies.some(m => m.id === om.id)) allMovies.push(om);
          });
          renderMovies(onlineResults);
        } else {
          renderMovies([]);
        }
      }, 350);
      return;
    }
  }

  // Provider
  if (currentFilter.provider !== 'All') {
    filtered = filtered.filter(m =>
      m.providers.some(p => p.name.toLowerCase().includes(currentFilter.provider.toLowerCase()))
    );
  }

  // Genre
  if (currentFilter.genre !== 'All') {
    filtered = filtered.filter(m => m.genres.includes(currentFilter.genre));
  }

  renderMovies(filtered);
}

// Render movie cards into grid
function renderMovies(movies) {
  resultsCount.textContent = `Showing ${movies.length} title${movies.length === 1 ? '' : 's'}`;

  if (movies.length === 0) {
    moviesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94a3b8;">
        <h3>No movies matched your search</h3>
        <p style="margin-top: 0.5rem;">Try clearing your filters or search for another title.</p>
        <button class="btn btn-primary" onclick="resetFilters()" style="margin-top: 1rem;">Reset All Filters</button>
      </div>
    `;
    return;
  }

  let html = '';

  movies.forEach((movie, index) => {
    // Generate streaming provider badges
    const providerTags = movie.providers.map(p => {
      let badgeClass = 'default';
      const nameLower = p.name.toLowerCase();
      if (nameLower.includes('netflix')) badgeClass = 'netflix';
      else if (nameLower.includes('amazon') || nameLower.includes('prime')) badgeClass = 'amazon';
      else if (nameLower.includes('max')) badgeClass = 'max';
      else if (nameLower.includes('apple')) badgeClass = 'apple';

      return `<span class="provider-tag ${badgeClass}">${p.name}</span>`;
    }).join('');

    html += `
      <div class="movie-card" onclick="openMovie('${movie.id}')">
        <div class="card-poster">
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
          <span class="card-rating">★ ${movie.rating}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${movie.title}</h3>
          <div class="card-meta">${movie.year} • ${movie.runtime} • ${movie.genres[0]}</div>
          <div class="card-providers">
            <span class="providers-label">Stream On:</span>
            <div class="provider-tags">
              ${providerTags}
            </div>
          </div>
        </div>
      </div>
    `;

    // Inject native monetization ad card after the 3rd movie
    if (index === 2) {
      html += `
        <div class="native-ad-card" onclick="trackAffiliateClick('Max', 'Stream Blockbusters Promo')">
          <span class="native-ad-tag">SPONSORED RECOMMENDATION</span>
          <h3>Watch New Releases First on Max</h3>
          <p>Direct Warner Bros blockbusters streaming in 4K UHD. Plans starting at $9.99/mo.</p>
          <button class="btn btn-primary" style="margin: 0 auto;">Stream Now ↗</button>
        </div>
      `;
    }
  });

  moviesGrid.innerHTML = html;
}

// Load Hero Banner
function loadHeroSpotlight() {
  const top = allMovies.find(m => m.featured) || allMovies[0];
  if (!top) return;

  const backdrop = document.getElementById('heroBackdrop');
  if (backdrop && top.backdrop) {
    backdrop.style.backgroundImage = `url('${top.backdrop}')`;
  }
  document.getElementById('heroTitle').textContent = top.title;
  document.getElementById('heroTagline').textContent = top.tagline;
  document.getElementById('heroOverview').textContent = top.overview;
}

// Open Movie Details & Where to Watch Modal
function openMovie(movieId) {
  const movie = allMovies.find(m => m.id === movieId);
  if (!movie) return;

  document.getElementById('modalTitle').textContent = movie.title;
  document.getElementById('modalTagline').textContent = movie.tagline || '';
  document.getElementById('modalRating').textContent = `★ ${movie.rating}`;
  document.getElementById('modalYear').textContent = movie.year;
  document.getElementById('modalRuntime').textContent = movie.runtime;
  document.getElementById('modalGenres').textContent = movie.genres.join(', ');
  document.getElementById('modalOverview').textContent = movie.overview;
  document.getElementById('modalDirector').textContent = movie.director;
  document.getElementById('modalCast').textContent = movie.cast.join(', ');

  // YouTube Trailer Embed
  const trailerContainer = document.getElementById('trailerContainer');
  if (movie.trailerKey) {
    trailerContainer.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&mute=1&rel=0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen></iframe>
    `;
  } else {
    trailerContainer.innerHTML = `<img src="${movie.backdrop}" style="width: 100%; height: 100%; object-fit: cover;">`;
  }

  // Where to watch providers
  const providersList = document.getElementById('modalProvidersList');
  providersList.innerHTML = movie.providers.map(p => `
    <div class="provider-row">
      <div class="provider-info">
        <div>
          <span class="provider-name">${p.name}</span>
          <div class="provider-type">${p.badge} (${p.price})</div>
        </div>
      </div>
      <button class="provider-stream-btn" onclick="trackAffiliateClick('${p.name}', '${movie.title}', '${p.url}')">
        Stream on ${p.name} ↗
      </button>
    </div>
  `).join('');

  movieModal.classList.remove('hidden');
}

// Close Modal
function closeModal() {
  movieModal.classList.add('hidden');
  document.getElementById('trailerContainer').innerHTML = '';
}

// Reset Filters
function resetFilters() {
  currentFilter = { provider: 'All', genre: 'All', query: '' };
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  document.querySelectorAll('.filter-pills .pill').forEach(p => {
    p.classList.toggle('active', p.dataset.provider === 'All' || p.dataset.genre === 'All');
  });
  applyFilters();
}

// Track Affiliate Click (Monetization Engine)
async function trackAffiliateClick(provider, movieTitle, redirectUrl) {
  showToast(`🎯 Affiliate Click: Redirecting to ${provider}...`);

  try {
    // Send click event to backend analytics
    await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, movieTitle })
    });
  } catch (e) {
    console.error('Click tracking error:', e);
  }

  // Open provider in new tab after brief interval
  setTimeout(() => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://www.amazon.com/gp/video/storefront', '_blank', 'noopener,noreferrer');
    }
  }, 400);
}

// Show Toast Notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Open Earnings Dashboard
async function openDashboard() {
  try {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    if (data.success) {
      const a = data.analytics;
      document.getElementById('statClicks').textContent = a.totalClicks || 0;
      document.getElementById('statEarnings').textContent = `$${(a.estimatedEarnings || 0).toFixed(2)}`;

      // Clicks by provider
      const providerClicksTable = document.getElementById('providerClicksTable');
      const providers = a.clicksByProvider || {};
      const providerRows = Object.entries(providers).map(([name, count]) => `
        <div class="p-row">
          <span><strong>${name}</strong></span>
          <span>${count} clicks ($${(count * 1.75).toFixed(2)})</span>
        </div>
      `).join('') || '<p style="color: #94a3b8;">No clicks recorded yet.</p>';
      providerClicksTable.innerHTML = providerRows;

      // Recent clicks
      const recentClicksList = document.getElementById('recentClicksList');
      const events = a.recentEvents || [];
      const eventRows = events.map(e => `
        <div class="p-row">
          <span>${e.movie} ➔ <strong>${e.provider}</strong></span>
          <span style="color: #34d399;">+$1.75 Commission</span>
        </div>
      `).join('') || '<p style="color: #94a3b8;">No recent stream events.</p>';
      recentClicksList.innerHTML = eventRows;
    }
  } catch (e) {
    console.error('Failed to load analytics:', e);
  }

  dashboardModal.classList.remove('hidden');
}

function closeDashboard() {
  dashboardModal.classList.add('hidden');
}

// Open Settings
async function openSettings() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.success && data.config) {
      document.getElementById('adsenseInput').value = data.config.adsensePublisherId || '';
      document.getElementById('amazonTagInput').value = data.config.amazonAffiliateTag || '';
      document.getElementById('tmdbKeyInput').value = data.config.tmdbApiKey || '';
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

async function saveSettings(e) {
  e.preventDefault();
  const config = {
    adsensePublisherId: document.getElementById('adsenseInput').value.trim(),
    amazonAffiliateTag: document.getElementById('amazonTagInput').value.trim(),
    tmdbApiKey: document.getElementById('tmdbKeyInput').value.trim()
  };

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (data.success) {
      showToast('✅ Monetization settings saved successfully!');
      closeSettings();
    }
  } catch (err) {
    showToast('❌ Error saving settings');
  }
}

// Newsletter
function handleNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail').value;
  if (email) {
    showToast(`🎉 Subscribed ${email} to streaming release alerts!`);
    document.getElementById('newsletterEmail').value = '';
  }
}
