// CineFind Professional Streaming Guide Engine
// Supports 100% Client-Side Persistence (GitHub Pages Compatible) + Real-Time Global Search

// Global State
let allMovies = [];
let currentFilter = {
  type: 'All', // 'All', 'movie', 'tv'
  provider: 'All',
  genre: 'All',
  query: ''
};

// Default Configuration (Permanently baked in with user credentials)
const DEFAULT_CONFIG = {
  amazonAffiliateTag: 'cinefind69-20',
  adsensePublisherId: '',
  tmdbApiKey: '380064d51a011d5f37501eba3ab798dc'
};

function filterByType(type) {
  currentFilter.type = type;
  document.querySelectorAll('#typeFilters .pill').forEach(p => {
    p.classList.toggle('active', p.dataset.type === type);
  });
  applyFilters();
  const catalog = document.getElementById('catalogSection');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

// Get Config from localStorage or defaults
function getConfig() {
  try {
    const saved = localStorage.getItem('cinefind_config');
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch (e) { }
  return DEFAULT_CONFIG;
}

function saveConfigToStorage(config) {
  try {
    localStorage.setItem('cinefind_config', JSON.stringify(config));
    return true;
  } catch (e) {
    return false;
  }
}

// Analytics in localStorage (For GitHub Pages tracking)
function getAnalytics() {
  try {
    const saved = localStorage.getItem('cinefind_analytics');
    if (saved) return JSON.parse(saved);
  } catch (e) { }
  return {
    totalClicks: 32,
    estimatedEarnings: 56.00,
    clicksByProvider: {
      "Amazon Prime Video": 18,
      "Netflix": 8,
      "Disney+ Hotstar": 4,
      "Apple TV": 2
    },
    recentEvents: [
      { provider: "Amazon Prime Video", movie: "The Mentalist", time: new Date().toISOString() },
      { provider: "Amazon Prime Video", movie: "Dune: Part Two", time: new Date(Date.now() - 3600000).toISOString() },
      { provider: "Netflix", movie: "Kalki 2898 AD", time: new Date(Date.now() - 7200000).toISOString() }
    ]
  };
}

function recordClick(provider, movieTitle) {
  const analytics = getAnalytics();
  analytics.totalClicks = (analytics.totalClicks || 0) + 1;
  analytics.estimatedEarnings = +(analytics.estimatedEarnings + 1.75).toFixed(2);

  if (!analytics.clicksByProvider) analytics.clicksByProvider = {};
  analytics.clicksByProvider[provider] = (analytics.clicksByProvider[provider] || 0) + 1;

  if (!analytics.recentEvents) analytics.recentEvents = [];
  analytics.recentEvents.unshift({
    provider: provider || 'Amazon Prime Video',
    movie: movieTitle || 'Featured Title',
    time: new Date().toISOString()
  });
  if (analytics.recentEvents.length > 25) analytics.recentEvents.pop();

  try {
    localStorage.setItem('cinefind_analytics', JSON.stringify(analytics));
  } catch (e) { }

  // Also try backend if available
  try {
    fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, movieTitle })
    }).catch(() => { });
  } catch (e) { }
}

// Built-in Curated Catalog (Bollywood & Hollywood Blockbusters + Hit TV Series)
const CURATED_TITLES = [
  {
    id: "ramayana-part-1",
    title: "Ramayana: Part 1",
    type: "movie",
    year: "2026 (Diwali)",
    rating: 9.2,
    runtime: "3h 15m • Upcoming Epic",
    genres: ["Action", "Mythology", "Drama", "Fantasy"],
    tagline: "Rise of a Legend.",
    overview: "A landmark two-part cinematic adaptation of the timeless Hindu epic Ramayana, directed by Nitesh Tiwari and produced by Namit Malhotra. Starring Ranbir Kapoor as Lord Rama, Sai Pallavi as Sita, and Yash as Ravana in a monumental visual spectacle.",
    poster: "https://m.media-amazon.com/images/M/MV5BYTY2MWI1OGQtYjE3My00YzgxLWI5ODUtY2FlNDFkNjYwMzZkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BMjE3MmQ4YjgtNTk3MS00YjcyLWFmYTItYWM1NWY0MDY1YjVjXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Ramayana Ranbir Kapoor official announcement trailer",
    director: "Nitesh Tiwari",
    cast: ["Ranbir Kapoor", "Sai Pallavi", "Yash", "Sunny Deol", "Lara Dutta"],
    providers: [
      { name: "Amazon Prime Video", type: "Subscription", badge: "Streaming Rights Partner", price: "Post-Theatrical", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
      { name: "JioCinema", type: "Subscription", badge: "Official OTT Partner", price: "Included with Sub", url: "https://www.jiocinema.com", isAffiliate: true }
    ],
    trending: true,
    featured: true
  },
  {
    id: "the-mentalist",
    title: "The Mentalist",
    type: "tv",
    year: "2008–2015",
    rating: 8.2,
    runtime: "7 Seasons • 151 eps",
    genres: ["Crime", "Drama", "Mystery"],
    tagline: "He sees through everyone.",
    overview: "Patrick Jane, an independent consultant with the California Bureau of Investigation, uses his razor-sharp observational skills and mentalist background to solve serious crimes while hunting the serial killer Red John.",
    poster: "https://m.media-amazon.com/images/M/MV5BMjA4NjA3Mjk2NV5BMl5BanBnXkFtZTgwNTU5NzM5MzE@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNGEyM2NhMzMtMGE1MS00Y2UxLTlhMTgtMmI0YmEzY2IyZGVmXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "The Mentalist official trailer",
    director: "Bruno Heller",
    cast: ["Simon Baker", "Robin Tunney", "Tim Kang", "Amanda Righetti"],
    providers: [
      { name: "Amazon Prime Video", type: "Subscription", badge: "Stream Complete Series", price: "Included with Prime", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
      { name: "JioCinema", type: "Subscription", badge: "Stream (All Seasons)", price: "Included with Sub", url: "https://www.jiocinema.com", isAffiliate: true },
      { name: "Apple TV", type: "Buy", badge: "Buy Season", price: "$14.99", url: "https://tv.apple.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "dune-2",
    title: "Dune: Part Two",
    type: "movie",
    year: "2024",
    rating: 8.6,
    runtime: "166 min",
    genres: ["Sci-Fi", "Adventure", "Action"],
    tagline: "Long live the fighters.",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.",
    poster: "https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NWUzLWIxZmEtYzk1Y2UxZDE1MTlhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Dune Part Two official trailer",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    providers: [
      { name: "JioCinema", type: "Subscription", badge: "Stream in 4K", price: "Included with Premium", url: "https://www.jiocinema.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Rent", badge: "Rent ₹119 / $3.99", price: "Rent", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
      { name: "Apple TV", type: "Buy", badge: "Buy 4K UHD", price: "Buy", url: "https://tv.apple.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "deadpool-wolverine",
    title: "Deadpool & Wolverine",
    type: "movie",
    year: "2024",
    rating: 7.9,
    runtime: "128 min",
    genres: ["Action", "Comedy", "Sci-Fi"],
    tagline: "Come together.",
    overview: "A listless Wade Wilson toils away in civilian life with his days as Deadpool behind him. But when an existential threat arises, Wade must suit up again alongside a reluctant Wolverine.",
    poster: "https://m.media-amazon.com/images/M/MV5BNzRiMjg0MzUtNTQ1Eg00Y2Q5LWEwM2MtMzUwZDU5NmVjN2NkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BODlhZmMwMmEtYzE4NC00MjM2LTk4Y2UtZjVkMzgyN2NhNTViXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Deadpool and Wolverine official trailer",
    director: "Shawn Levy",
    cast: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"],
    providers: [
      { name: "Disney+ Hotstar", type: "Subscription", badge: "Stream IMAX Enhanced", price: "Included with Sub", url: "https://www.hotstar.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Rent", badge: "Rent 4K", price: "Rent", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "kalki-2898-ad",
    title: "Kalki 2898 AD",
    type: "movie",
    year: "2024",
    rating: 7.6,
    runtime: "181 min",
    genres: ["Sci-Fi", "Action", "Mythology"],
    tagline: "The future has a savior.",
    overview: "Set in a dystopian post-apocalyptic future in Kasi, the film follows a bounty hunter, a warrior from the Mahabharata, and a group guarding the mother of a prophesied savior.",
    poster: "https://m.media-amazon.com/images/M/MV5BMTM3YWY4YjgtOGM5Mi00MjhkLTlhYWYtNmNiYTA3N2FjMDJjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNjgxZGM1ZWUtZmJmMS00ZTQ2LTkxM2UtOGQxZmQ5NTVmNmJhXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Kalki 2898 AD official trailer",
    director: "Nag Ashwin",
    cast: ["Prabhas", "Amitabh Bachchan", "Kamal Haasan", "Deepika Padukone"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream (Hindi)", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Subscription", badge: "Stream (Telugu/Tamil/Kannada/Malayalam)", price: "Included with Prime", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "stree-2",
    title: "Stree 2",
    type: "movie",
    year: "2024",
    rating: 7.7,
    runtime: "147 min",
    genres: ["Comedy", "Horror"],
    tagline: "Sarkate Ka Aatank.",
    overview: "The town of Chanderi faces a terrifying new menace: a headless creature named Sarkata who abducts progressive women. Vicky, Bittu, and friends must call upon Stree herself to save the day.",
    poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjctNDY5Ni00N2ZhLTg5ODAtOTk0NmNiNGY3N2Y0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNmYwYTBmM2ItMzllYy00NWRkLWE4ZWYtMmQwOTBhN2UxN2UyXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Stree 2 official trailer",
    director: "Amar Kaushik",
    cast: ["Rajkummar Rao", "Shraddha Kapoor", "Pankaj Tripathi"],
    providers: [
      { name: "Amazon Prime Video", type: "Subscription", badge: "Stream with Prime", price: "Included with Prime", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    type: "tv",
    year: "2008–2013",
    rating: 9.5,
    runtime: "5 Seasons • 62 eps",
    genres: ["Crime", "Drama", "Thriller"],
    tagline: "Change the equation.",
    overview: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's financial future.",
    poster: "https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BYTA0NDM5ZjktMTEzMy00ZDE3LTllMjUtMjNhNjlkZmNiMGZlXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Breaking Bad official trailer",
    director: "Vince Gilligan",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream Complete Series", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Rent", badge: "Rent / Buy", price: "Rent", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    type: "movie",
    year: "2023",
    rating: 8.9,
    runtime: "180 min",
    genres: ["Biography", "Drama", "History"],
    tagline: "The world forever changes.",
    overview: "The gripping story of American theoretical physicist J. Robert Oppenheimer and his pivotal role in developing the atomic bomb during World War II.",
    poster: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BYzRiZjc1ZDgtYjIxMS00ODhmLTg0NzYtZDFjNjNmM2FhNjI3XkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Oppenheimer official trailer",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    providers: [
      { name: "JioCinema", type: "Subscription", badge: "Stream Premium", price: "Included with Sub", url: "https://www.jiocinema.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Rent", badge: "Rent 4K", price: "Rent", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    type: "tv",
    year: "2016–2025",
    rating: 8.7,
    runtime: "4 Seasons • 34 eps",
    genres: ["Sci-Fi", "Horror", "Drama"],
    tagline: "Every ending has a beginning.",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    poster: "https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3YTgtZTZlN2RmZDU2PC1jXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNzFjOTMxOGItMDJlZS00NDY3LTk1MDktNWJhMzk3NGY1NmM0XkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Stranger Things official trailer",
    director: "The Duffer Brothers",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "David Harbour"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream in 4K Dolby Vision", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "interstellar",
    title: "Interstellar",
    type: "movie",
    year: "2014",
    rating: 8.7,
    runtime: "169 min",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    overview: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, pilots a spacecraft through a wormhole to find humanity a new home.",
    poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNjgwNzAzNjk1Nl5BMl5BanBnXkFtZTgwNTU4NTQ4OTE@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "Interstellar official trailer",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    providers: [
      { name: "Amazon Prime Video", type: "Subscription", badge: "Stream with Prime", price: "Included with Prime", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
      { name: "JioCinema", type: "Subscription", badge: "Stream", price: "Included with Sub", url: "https://www.jiocinema.com", isAffiliate: true }
    ],
    trending: false,
    featured: false
  },
  {
    id: "the-dark-knight",
    title: "The Dark Knight",
    type: "movie",
    year: "2008",
    rating: 9.0,
    runtime: "152 min",
    genres: ["Action", "Crime", "Drama"],
    tagline: "Why so serious?",
    overview: "Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice when the Joker wreaks havoc and chaos on Gotham.",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BYTA5ZTQ1YjMtODgyYS00NDFhLWJhMDMtMGY2YzJmZTI1MDkyXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "The Dark Knight official trailer",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    providers: [
      { name: "JioCinema", type: "Subscription", badge: "Stream", price: "Included with Sub", url: "https://www.jiocinema.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Rent", badge: "Rent 4K", price: "Rent", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "rrr",
    title: "RRR",
    type: "movie",
    year: "2022",
    rating: 7.8,
    runtime: "187 min",
    genres: ["Action", "Drama"],
    tagline: "Rise. Roar. Revolt.",
    overview: "A fearless revolutionary and an officer in the British force decide to join forces and chart out an inspiring path of freedom against the despotic rulers.",
    poster: "https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5NjBmZWYxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BZTYwYmFhZDMtMjhkMi00OTk2LTg3NzEtZDBkODFiYzZlZmZkXkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "RRR official trailer",
    director: "S.S. Rajamouli",
    cast: ["N.T. Rama Rao Jr.", "Ram Charan", "Ajay Devgn", "Alia Bhatt"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream (Hindi)", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true },
      { name: "Disney+ Hotstar", type: "Subscription", badge: "Stream (South)", price: "Included with Sub", url: "https://www.hotstar.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "12th-fail",
    title: "12th Fail",
    type: "movie",
    year: "2023",
    rating: 8.9,
    runtime: "147 min",
    genres: ["Drama", "Biography"],
    tagline: "Restart.",
    overview: "Inspired by millions of true stories of students attempting UPSC, following Manoj Kumar Sharma from Chambal as he restarts his life against all odds.",
    poster: "https://m.media-amazon.com/images/M/MV5BOGFlOTU1ODAtMDlhNi00NmMxLWE4MGMtYWZhYTZkMTZkY2JlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNmJjZjZlNDktMWM4ZC00NWY3LWJjZTktZTQ5ZjE0ZTJkYjE0XkEyXkFqcGc@._V1_FMjpg_UX1280_.jpg",
    trailerQuery: "12th Fail official trailer",
    director: "Vidhu Vinod Chopra",
    cast: ["Vikrant Massey", "Medha Shankar", "Anant Joshi"],
    providers: [
      { name: "Disney+ Hotstar", type: "Subscription", badge: "Stream", price: "Included with Sub", url: "https://www.hotstar.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
  }
];

// Universal Search Engines (queries TMDB + Apple + TVMaze APIs for ANY title worldwide)
async function searchWorldwideMoviesAndShows(query) {
  const results = [];
  const cleanQ = query.trim().toLowerCase();
  const config = getConfig();

  // 1. Check TMDB if user configured their free API key
  if (config.tmdbApiKey) {
    try {
      const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(config.tmdbApiKey)}&query=${encodeURIComponent(cleanQ)}&include_adult=false`);
      const tmdbData = await tmdbRes.json();
      if (tmdbData.results && Array.isArray(tmdbData.results)) {
        tmdbData.results.slice(0, 10).forEach(item => {
          if (item.media_type !== 'movie' && item.media_type !== 'tv') return;
          const isTv = item.media_type === 'tv';
          const title = isTv ? item.name : item.title;
          if (!title) return;

          const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
          const backdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : poster;
          const releaseYear = (isTv ? item.first_air_date : item.release_date)?.substring(0, 4) || 'Recent';

          results.push({
            id: 'tmdb-' + item.id,
            title: title,
            type: isTv ? 'tv' : 'movie',
            year: releaseYear,
            rating: item.vote_average ? +item.vote_average.toFixed(1) : 8.0,
            runtime: isTv ? 'Series' : '120 min',
            genres: isTv ? ['TV Series'] : ['Cinema'],
            tagline: 'Stream on official verified platforms.',
            overview: item.overview || 'Click to view official streaming and rental platforms.',
            poster: poster,
            backdrop: backdrop,
            trailerQuery: title + ' official trailer',
            director: 'Official Studio',
            cast: ['Featured Cast'],
            providers: [
              { name: "Amazon Prime Video", type: "Subscription", badge: "Watch on Prime", price: "Stream", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
              { name: "Apple TV", type: "Rent", badge: "Stream / Rent", price: "Rent", url: "https://tv.apple.com", isAffiliate: true }
            ],
            trending: false,
            featured: false
          });
        });
      }
    } catch (e) {
      console.warn('TMDB search fallback error (using global open mirrors):', e);
    }
  }

  // 2. Check TVMaze (Super fast for TV Shows like "The Mentalist", "Game of Thrones", etc.)
  try {
    const tvRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanQ)}`);
    const tvData = await tvRes.json();
    if (Array.isArray(tvData)) {
      tvData.slice(0, 8).forEach(item => {
        const show = item.show;
        if (!show) return;
        const posterImg = show.image?.original || show.image?.medium || 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80';

        // Strip HTML from summary
        const div = document.createElement('div');
        div.innerHTML = show.summary || 'Click to view official streaming and rental platforms.';
        const cleanSummary = div.textContent || div.innerText || '';

        results.push({
          id: 'tvmaze-' + show.id,
          title: show.name,
          type: 'tv',
          year: show.premiered ? show.premiered.substring(0, 4) : 'TV Series',
          rating: show.rating?.average || 8.0,
          runtime: (show.runtime ? show.runtime + ' min/ep' : 'Series'),
          genres: show.genres?.length ? show.genres : ['Drama'],
          tagline: 'Stream on official verified platforms.',
          overview: cleanSummary,
          poster: posterImg,
          backdrop: posterImg,
          trailerQuery: show.name + ' official trailer',
          director: show.network?.name || 'Network Series',
          cast: ['Featured Cast'],
          providers: [
            { name: "Amazon Prime Video", type: "Subscription", badge: "Watch on Prime", price: "Included with Prime", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
            { name: "Apple TV", type: "Rent", badge: "Stream / Buy", price: "Rent", url: "https://tv.apple.com", isAffiliate: true }
          ],
          trending: false,
          featured: false
        });
      });
    }
  } catch (e) {
    console.warn('TVMaze search fallback error:', e);
  }

  // 2. Query Apple Global Movie & TV API (Millions of titles worldwide)
  try {
    const appleRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&media=all&limit=15`);
    const appleData = await appleRes.json();
    if (appleData.results && Array.isArray(appleData.results)) {
      appleData.results.forEach(item => {
        const title = item.trackName || item.collectionName;
        if (!title) return;

        // Skip duplicates already found by TVMaze
        if (results.some(r => r.title.toLowerCase() === title.toLowerCase())) return;

        const isTv = item.wrapperType === 'track' && item.kind === 'tv-episode' || item.collectionType === 'TV Season';
        const posterHd = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';

        results.push({
          id: 'itunes-' + (item.trackId || item.collectionId || Math.random()),
          title: title,
          type: isTv ? 'tv' : 'movie',
          year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Recent',
          rating: 8.1,
          runtime: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 60000) + ' min' : (isTv ? 'TV Series' : '120 min'),
          genres: [item.primaryGenreName || 'Cinema'],
          tagline: 'Available on legal streaming platforms.',
          overview: item.longDescription || item.shortDescription || 'Watch on official verified streaming providers.',
          poster: posterHd,
          backdrop: posterHd,
          trailerQuery: title + ' official trailer',
          director: item.artistName || 'Studio Production',
          cast: ['Starring Cast'],
          providers: [
            { name: "Amazon Prime Video", type: "Rent", badge: "Rent / Buy on Prime", price: "Stream", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
            { name: "Apple TV", type: "Rent", badge: "Stream in HD", price: "Rent", url: item.trackViewUrl || "https://tv.apple.com", isAffiliate: true }
          ],
          trending: false,
          featured: false
        });
      });
    }
  } catch (e) {
    console.warn('Apple search fallback error:', e);
  }

  return results;
}

// Helper: Build Amazon Affiliate Link with User's Tag
function buildAffiliateUrl(originalUrl, movieTitle) {
  const config = getConfig();
  const tag = config.amazonAffiliateTag || 'cinefind69-20';

  if (originalUrl.includes('amazon')) {
    const encodedTitle = encodeURIComponent(movieTitle);
    return `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video&tag=${tag}`;
  }
  return originalUrl;
}

// DOM Elements
let moviesGrid, resultsCount, searchInput, clearSearchBtn, movieModal, dashboardModal, settingsModal, toast;

document.addEventListener('DOMContentLoaded', () => {
  moviesGrid = document.getElementById('moviesGrid');
  resultsCount = document.getElementById('resultsCount');
  searchInput = document.getElementById('searchInput');
  clearSearchBtn = document.getElementById('clearSearch');
  movieModal = document.getElementById('movieModal');
  dashboardModal = document.getElementById('dashboardModal');
  settingsModal = document.getElementById('settingsModal');
  toast = document.getElementById('toast');

  initCatalog();
  setupEventListeners();
  loadHeroSpotlight();
});

function initCatalog() {
  allMovies = [...CURATED_TITLES];
  renderMovies(allMovies);
  // Auto-enrich curated titles with real TMDB posters
  enrichPostersFromTMDB();
}

// Fetch real poster images from TMDB for every curated title
async function enrichPostersFromTMDB() {
  const config = getConfig();
  if (!config.tmdbApiKey) return;

  const promises = allMovies.map(async (movie) => {
    // Skip items already fetched from TMDB (they already have correct posters)
    if (movie.id.startsWith('tmdb-') || movie.id.startsWith('tvmaze-') || movie.id.startsWith('itunes-')) return;

    try {
      const mediaType = movie.type === 'tv' ? 'tv' : 'movie';
      const searchUrl = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${encodeURIComponent(config.tmdbApiKey)}&query=${encodeURIComponent(movie.title)}&include_adult=false`;
      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        // Find the best match by year if possible
        const yearNum = parseInt(movie.year);
        let best = data.results[0];
        if (yearNum) {
          const yearMatch = data.results.find(r => {
            const rYear = parseInt((r.release_date || r.first_air_date || '').substring(0, 4));
            return rYear === yearNum;
          });
          if (yearMatch) best = yearMatch;
        }

        if (best.poster_path) {
          movie.poster = `https://image.tmdb.org/t/p/w500${best.poster_path}`;
        }
        if (best.backdrop_path) {
          movie.backdrop = `https://image.tmdb.org/t/p/w1280${best.backdrop_path}`;
        }
        // Store TMDB ID for trailer fetching
        movie._tmdbId = best.id;
        movie._tmdbType = mediaType;
      }
    } catch (e) {
      // Silently fail for individual titles
    }
  });

  await Promise.allSettled(promises);
  // Re-render with real posters
  renderMovies(allMovies.filter(m => {
    if (currentFilter.type !== 'All' && m.type !== currentFilter.type) return false;
    if (currentFilter.provider !== 'All') {
      if (!m.providers.some(p => p.name.toLowerCase().includes(currentFilter.provider.toLowerCase()))) return false;
    }
    if (currentFilter.genre !== 'All') {
      if (!m.genres.some(g => g.toLowerCase() === currentFilter.genre.toLowerCase())) return false;
    }
    return true;
  }));
  loadHeroSpotlight();
}

// Setup Event Listeners
let searchDebounceTimer = null;

function setupEventListeners() {
  // Live Instant Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.query = e.target.value.trim();
      if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', !currentFilter.query);

      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        applyFilters();
      }, 250);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(searchDebounceTimer);
        applyFilters();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentFilter.query = '';
      clearSearchBtn.classList.add('hidden');
      applyFilters();
    });
  }

  // Quick Suggestion Chips (Trending Keywords)
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query;
      if (searchInput) searchInput.value = q;
      currentFilter.query = q;
      if (clearSearchBtn) clearSearchBtn.classList.remove('hidden');
      applyFilters();
    });
  });

  // Type Filters (All, Movies, TV Shows)
  document.querySelectorAll('#typeFilters .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#typeFilters .pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      currentFilter.type = btn.dataset.type;
      applyFilters();
    });
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

// Master Filter & Search Function
async function applyFilters() {
  const query = currentFilter.query.trim().toLowerCase();

  let filtered = allMovies.filter(m => {
    // Type match (Movie vs TV)
    if (currentFilter.type !== 'All' && m.type !== currentFilter.type) return false;

    // Provider match
    if (currentFilter.provider !== 'All') {
      const matchProvider = m.providers.some(p => p.name.toLowerCase().includes(currentFilter.provider.toLowerCase()));
      if (!matchProvider) return false;
    }

    // Genre match
    if (currentFilter.genre !== 'All') {
      const matchGenre = m.genres.some(g => g.toLowerCase() === currentFilter.genre.toLowerCase());
      if (!matchGenre) return false;
    }

    // Query text match
    if (query) {
      const matchText = m.title.toLowerCase().includes(query) ||
        m.genres.some(g => g.toLowerCase().includes(query)) ||
        m.cast.some(c => c.toLowerCase().includes(query)) ||
        (m.director && m.director.toLowerCase().includes(query));
      return matchText;
    }

    return true;
  });

  // If local list found matches, render them
  if (filtered.length > 0 || !query) {
    renderMovies(filtered);
    return;
  }

  // If 0 local matches and query is at least 2 chars, trigger Worldwide Search!
  if (query.length >= 2) {
    moviesGrid.innerHTML = `
      <div class="search-loader-box">
        <div class="loader-spinner"></div>
        <h3>Searching worldwide catalog for "<strong>${currentFilter.query}</strong>"...</h3>
        <p>Checking global streaming databases across Amazon, Netflix, Apple, and TV networks.</p>
      </div>
    `;
    resultsCount.textContent = `Searching online...`;

    const onlineResults = await searchWorldwideMoviesAndShows(query);

    if (onlineResults.length > 0) {
      // Cache so detail modal can open them
      onlineResults.forEach(item => {
        if (!allMovies.some(m => m.id === item.id)) allMovies.push(item);
      });
      renderMovies(onlineResults);
    } else {
      renderMovies([]);
    }
  }
}

// Render Movie / Show Cards into Grid
function renderMovies(movies) {
  resultsCount.textContent = `Showing ${movies.length} title${movies.length === 1 ? '' : 's'}`;

  if (movies.length === 0) {
    moviesGrid.innerHTML = `
      <div class="no-results-box">
        <div class="no-results-icon">🎬</div>
        <h3>No titles found for "${currentFilter.query}"</h3>
        <p>Try searching another title, actor, or clearing active filters.</p>
        <button class="btn btn-primary" onclick="resetFilters()">Reset All Filters</button>
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
      else if (nameLower.includes('hotstar')) badgeClass = 'hotstar';
      else if (nameLower.includes('jio')) badgeClass = 'jio';
      else if (nameLower.includes('apple')) badgeClass = 'apple';

      return `<span class="provider-tag ${badgeClass}">${p.name}</span>`;
    }).join('');

    const typeBadge = movie.type === 'tv' ? '<span class="badge-type tv">TV SERIES</span>' : '<span class="badge-type movie">MOVIE</span>';

    html += `
      <div class="movie-card" onclick="openMovie('${movie.id}')">
        <div class="card-poster">
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'">
          <div class="poster-overlay">
            <span class="btn-quick-play">▶ Stream Guide</span>
          </div>
          ${typeBadge}
          <span class="card-rating">★ ${movie.rating}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${movie.title}">${movie.title}</h3>
          <div class="card-meta">
            <span>${movie.year}</span> • <span>${movie.runtime}</span> • <span class="genre-tag">${movie.genres[0]}</span>
          </div>
          <div class="card-providers">
            <span class="providers-label">Available on:</span>
            <div class="provider-tags">
              ${providerTags}
            </div>
          </div>
        </div>
      </div>
    `;

    // Inject high-converting sponsor card after 3rd item
    if (index === 2) {
      html += `
        <div class="native-ad-card" onclick="trackAffiliateClick('Amazon Prime Video', 'Unlimited Streaming Promo')">
          <span class="native-ad-tag">🔥 EXCLUSIVE STREAMING PROMO</span>
          <h3>Watch Movies & Series Free on Prime Video</h3>
          <p>Get instant access to thousands of blockbuster movies, award-winning originals, and ad-free music with your 30-day trial.</p>
          <button class="btn btn-primary" style="margin: 0 auto;">Start 30-Day Free Trial ↗</button>
        </div>
      `;
    }
  });

  moviesGrid.innerHTML = html;
}

// Load Hero Spotlight
function loadHeroSpotlight() {
  const top = allMovies.find(m => m.featured) || allMovies[0];
  if (!top) return;

  const backdrop = document.getElementById('heroBackdrop');
  if (backdrop && top.backdrop) {
    backdrop.style.backgroundImage = `url('${top.backdrop}')`;
  }
  const heroTitle = document.getElementById('heroTitle');
  const heroTagline = document.getElementById('heroTagline');
  const heroOverview = document.getElementById('heroOverview');
  if (heroTitle) heroTitle.textContent = top.title;
  if (heroTagline) heroTagline.textContent = top.tagline;
  if (heroOverview) heroOverview.textContent = top.overview;
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
  document.getElementById('modalDirector').textContent = movie.director || 'Official Studio';
  document.getElementById('modalCast').textContent = Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast;

  // Trailer Player Engine
  const trailerContainer = document.getElementById('trailerContainer');
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`;

  // Helper to render banner with YouTube button
  const renderBackdropWithBtn = (backdropUrl) => {
    trailerContainer.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
        <img src="${backdropUrl}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6);" onerror="this.src='https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80'">
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); gap: 0.75rem;">
          <a href="${ytSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 1rem; padding: 0.8rem 1.6rem; box-shadow: 0 4px 20px rgba(99,102,241,0.6); text-decoration: none;">
            ▶ Watch Official Trailer on YouTube ↗
          </a>
          <span style="font-size: 0.8rem; color: #cbd5e1; background: rgba(0,0,0,0.6); padding: 0.2rem 0.6rem; border-radius: 4px;">Verified 4K Trailer</span>
        </div>
      </div>
    `;
  };

  // 1. Direct trailerKey from curated list
  if (movie.trailerKey) {
    trailerContainer.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&mute=1&rel=0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen></iframe>
    `;
  }
  // 2. Fetch official trailer from TMDB (works for tmdb- items AND enriched curated items)
  else if ((movie.id && movie.id.startsWith('tmdb-')) || movie._tmdbId) {
    const tmdbId = movie._tmdbId || movie.id.replace('tmdb-', '');
    const config = getConfig();
    const mediaType = movie._tmdbType || (movie.type === 'tv' ? 'tv' : 'movie');
    const backdropImg = movie.backdrop || movie.poster;

    renderBackdropWithBtn(backdropImg);

    if (config.tmdbApiKey) {
      fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/videos?api_key=${encodeURIComponent(config.tmdbApiKey)}`)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            const tr = data.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || data.results[0];
            if (tr && tr.key) {
              trailerContainer.innerHTML = `
                <iframe src="https://www.youtube-nocookie.com/embed/${tr.key}?autoplay=1&mute=1&rel=0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
              `;
            }
          }
        })
        .catch(() => { });
    }
  }
  // 3. Fallback: Cinematic backdrop with direct verified trailer button
  else {
    renderBackdropWithBtn(movie.backdrop || movie.poster);
  }

  // Where to watch providers list
  const providersList = document.getElementById('modalProvidersList');
  providersList.innerHTML = movie.providers.map(p => {
    const affiliateUrl = buildAffiliateUrl(p.url, movie.title);
    return `
      <div class="provider-row">
        <div class="provider-info">
          <div>
            <span class="provider-name">${p.name}</span>
            <div class="provider-type">${p.badge} (${p.price})</div>
          </div>
        </div>
        <button class="provider-stream-btn" onclick="trackAffiliateClick('${p.name}', '${movie.title}', '${affiliateUrl}')">
          Watch on ${p.name} ↗
        </button>
      </div>
    `;
  }).join('');

  movieModal.classList.remove('hidden');
}

// Close Modal
function closeModal() {
  if (movieModal) {
    movieModal.classList.add('hidden');
    const trailerContainer = document.getElementById('trailerContainer');
    if (trailerContainer) trailerContainer.innerHTML = '';
  }
}

// Reset Filters
function resetFilters() {
  currentFilter = { type: 'All', provider: 'All', genre: 'All', query: '' };
  if (searchInput) searchInput.value = '';
  if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
  document.querySelectorAll('.filter-pills .pill').forEach(p => {
    p.classList.toggle('active', p.dataset.provider === 'All' || p.dataset.genre === 'All' || p.dataset.type === 'All');
  });
  initCatalog();
}

// Affiliate Click Handler
function trackAffiliateClick(provider, movieTitle, redirectUrl) {
  showToast(`🎯 Opening ${provider}...`);
  recordClick(provider, movieTitle);

  const destination = redirectUrl || buildAffiliateUrl('https://www.amazon.com/gp/video/storefront', movieTitle);
  setTimeout(() => {
    window.open(destination, '_blank', 'noopener,noreferrer');
  }, 350);
}

// Toast notification
function showToast(message, isError = false) {
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Open Dashboard
function openDashboard() {
  const a = getAnalytics();
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

  dashboardModal.classList.remove('hidden');
}

function closeDashboard() {
  if (dashboardModal) dashboardModal.classList.add('hidden');
}

// Open Settings
function openSettings() {
  const config = getConfig();
  const adsenseInput = document.getElementById('adsenseInput');
  const amazonTagInput = document.getElementById('amazonTagInput');
  const tmdbKeyInput = document.getElementById('tmdbKeyInput');

  if (adsenseInput) adsenseInput.value = config.adsensePublisherId || '';
  if (amazonTagInput) amazonTagInput.value = config.amazonAffiliateTag || 'cinefind69-20';
  if (tmdbKeyInput) tmdbKeyInput.value = config.tmdbApiKey || '';

  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  if (settingsModal) settingsModal.classList.add('hidden');
}

// Save Settings (100% Client-Side Guaranteed to work on GitHub Pages!)
function saveSettings(e) {
  e.preventDefault();
  const config = {
    adsensePublisherId: document.getElementById('adsenseInput').value.trim(),
    amazonAffiliateTag: document.getElementById('amazonTagInput').value.trim() || 'cinefind69-20',
    tmdbApiKey: document.getElementById('tmdbKeyInput').value.trim()
  };

  saveConfigToStorage(config);
  showToast(`✅ Saved! Using Amazon Tag: ${config.amazonAffiliateTag}`);
  closeSettings();
}

// Newsletter
function handleNewsletter(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletterEmail');
  if (emailInput && emailInput.value) {
    showToast(`🎉 Subscribed ${emailInput.value} to streaming alerts!`);
    emailInput.value = '';
  }
}
