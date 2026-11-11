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

// Fallback Seed Data (allows opening index.html directly by double clicking)
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
      { "name": "Max", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.max.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent $3.99", "price": "$3.99", "url": "https://www.amazon.com/gp/video/storefront", "isAffiliate": true },
      { "name": "Apple TV", "type": "Buy", "badge": "Buy $19.99", "price": "$19.99", "url": "https://tv.apple.com", "isAffiliate": true }
    ],
    "trending": true,
    "featured": true
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
    "poster": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "uYPbbksJxIg",
    "director": "Christopher Nolan",
    "cast": ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    "providers": [
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream", "price": "Included with Prime", "url": "https://www.amazon.com/gp/video/storefront", "isAffiliate": true },
      { "name": "Apple TV", "type": "Rent", "badge": "Rent $3.99", "price": "$3.99", "url": "https://tv.apple.com", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "spider-verse",
    "title": "Spider-Man: Across the Spider-Verse",
    "year": 2023,
    "rating": 8.7,
    "runtime": "140 min",
    "genres": ["Animation", "Action", "Adventure"],
    "tagline": "It's how you wear the mask that matters.",
    "overview": "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    "poster": "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "cqGjhVJWtEg",
    "director": "Joaquim Dos Santos, Kemp Powers",
    "cast": ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    "providers": [
      { "name": "Netflix", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.netflix.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent $3.99", "price": "$3.99", "url": "https://www.amazon.com/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
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
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream", "price": "Included with Prime", "url": "https://www.amazon.com/gp/video/storefront", "isAffiliate": true },
      { "name": "Paramount+", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.paramountplus.com", "isAffiliate": true }
    ],
    "trending": false,
    "featured": false
  },
  {
    "id": "the-batman",
    "title": "The Batman",
    "year": 2022,
    "rating": 7.8,
    "runtime": "176 min",
    "genres": ["Action", "Crime", "Drama"],
    "tagline": "Unmask the truth.",
    "overview": "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    "poster": "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "mqqft2x_Aa4",
    "director": "Matt Reeves",
    "cast": ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Colin Farrell"],
    "providers": [
      { "name": "Max", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.max.com", "isAffiliate": true },
      { "name": "Netflix", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.netflix.com", "isAffiliate": true }
    ],
    "trending": false,
    "featured": false
  },
  {
    "id": "top-gun-maverick",
    "title": "Top Gun: Maverick",
    "year": 2022,
    "rating": 8.3,
    "runtime": "130 min",
    "genres": ["Action", "Drama"],
    "tagline": "Feel the need. The need for speed.",
    "overview": "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates on an impossible mission.",
    "poster": "https://images.unsplash.com/photo-1519074069444-1ba4ea16e911?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "giXco2jaZ_4",
    "director": "Joseph Kosinski",
    "cast": ["Tom Cruise", "Miles Teller", "Jennifer Connelly"],
    "providers": [
      { "name": "Paramount+", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.paramountplus.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Subscription", "badge": "Stream", "price": "Included with Prime", "url": "https://www.amazon.com/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  },
  {
    "id": "everything-everywhere",
    "title": "Everything Everywhere All at Once",
    "year": 2022,
    "rating": 7.8,
    "runtime": "139 min",
    "genres": ["Sci-Fi", "Comedy", "Adventure"],
    "tagline": "The universe is so much bigger than you realize.",
    "overview": "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    "poster": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "trailerKey": "wxN1T1uxQ2g",
    "director": "Daniel Kwan, Daniel Scheinert",
    "cast": ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis"],
    "providers": [
      { "name": "Netflix", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.netflix.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent $3.99", "price": "$3.99", "url": "https://www.amazon.com/gp/video/storefront", "isAffiliate": true }
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
    "cast": ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård", "Laurence Fishburne"],
    "providers": [
      { "name": "Starz", "type": "Subscription", "badge": "Stream", "price": "Included with Sub", "url": "https://www.starz.com", "isAffiliate": true },
      { "name": "Amazon Prime Video", "type": "Rent", "badge": "Rent $3.99", "price": "$3.99", "url": "https://www.amazon.com/gp/video/storefront", "isAffiliate": true }
    ],
    "trending": true,
    "featured": false
  }
];

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

// Apply client-side filters
function applyFilters() {
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
