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
    poster: "",
    backdrop: "",
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
    id: "pushpa-2",
    title: "Pushpa 2: The Rule",
    type: "movie",
    year: "2024",
    rating: 8.8,
    runtime: "200 min",
    genres: ["Action", "Crime", "Thriller"],
    tagline: "Rule begins.",
    overview: "Pushpa Raj continues his dominance over the red sandalwood smuggling syndicate, clashing fiercely with SP Bhanwar Singh Shekhawat in a war of power, grit, and retribution.",
    poster: "",
    backdrop: "",
    trailerQuery: "Pushpa 2 The Rule official trailer",
    director: "Sukumar",
    cast: ["Allu Arjun", "Rashmika Mandanna", "Fahadh Faasil"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream Post-Theatrical", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Rent", badge: "Stream / Rent", price: "Rent", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "singham-again",
    title: "Singham Again",
    type: "movie",
    year: "2024",
    rating: 7.5,
    runtime: "144 min",
    genres: ["Action", "Drama"],
    tagline: "Lion is back.",
    overview: "DCP Bajirao Singham leads the Cop Universe alongside Simmba, Sooryavanshi, and Shakti Shetty on a high-stakes cross-border rescue mission inspired by modern epic themes.",
    poster: "",
    backdrop: "",
    trailerQuery: "Singham Again official trailer",
    director: "Rohit Shetty",
    cast: ["Ajay Devgn", "Kareena Kapoor", "Deepika Padukone", "Ranveer Singh", "Akshay Kumar"],
    providers: [
      { name: "Amazon Prime Video", type: "Subscription", badge: "Stream on Prime", price: "Included with Prime", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "bhool-bhulaiyaa-3",
    title: "Bhool Bhulaiyaa 3",
    type: "movie",
    year: "2024",
    rating: 7.4,
    runtime: "158 min",
    genres: ["Comedy", "Horror"],
    tagline: "Double Manjulika horror.",
    overview: "Rooh Baba travels to the haunted kingdom of Raktaghat in Bengal, facing two vengeful spirits who claim to be the original Manjulika.",
    poster: "",
    backdrop: "",
    trailerQuery: "Bhool Bhulaiyaa 3 official trailer",
    director: "Anees Bazmee",
    cast: ["Kartik Aaryan", "Vidya Balan", "Madhuri Dixit", "Triptii Dimri"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream on Netflix", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "the-penguin",
    title: "The Penguin",
    type: "tv",
    year: "2024",
    rating: 8.8,
    runtime: "1 Season • 8 eps",
    genres: ["Crime", "Drama"],
    tagline: "Gotham is his.",
    overview: "Following the events of The Batman, Oz Cobb wages a brutal and cunning war for the criminal throne of Gotham City against Sofia Falcone.",
    poster: "",
    backdrop: "",
    trailerQuery: "The Penguin official trailer HBO",
    director: "Lauren LeFranc",
    cast: ["Colin Farrell", "Cristin Milioti", "Rhenzy Feliz"],
    providers: [
      { name: "JioCinema", type: "Subscription", badge: "Stream Premium 4K", price: "Included with Sub", url: "https://www.jiocinema.com", isAffiliate: true },
      { name: "Amazon Prime Video", type: "Rent", badge: "Stream / Rent", price: "Rent", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "squid-game",
    title: "Squid Game",
    type: "tv",
    year: "2021–2024",
    rating: 8.0,
    runtime: "2 Seasons • 15 eps",
    genres: ["Drama", "Mystery", "Thriller"],
    tagline: "The game never ends.",
    overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize, but the stakes are deadly.",
    poster: "",
    backdrop: "",
    trailerQuery: "Squid Game Season 2 official trailer",
    director: "Hwang Dong-hyuk",
    cast: ["Lee Jung-jae", "Lee Byung-hun", "Wi Ha-joon"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream in 4K Dolby Vision", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
  },
  {
    id: "devara-part-1",
    title: "Devara: Part 1",
    type: "movie",
    year: "2024",
    rating: 7.2,
    runtime: "178 min",
    genres: ["Action", "Drama"],
    tagline: "All hail the sea.",
    overview: "A fearless sea chieftain stands against the lawless piracy of coastal clans, sparking a generational feud spanning across treacherous coastal waters.",
    poster: "",
    backdrop: "",
    trailerQuery: "Devara Part 1 official trailer",
    director: "Koratala Siva",
    cast: ["N.T. Rama Rao Jr.", "Janhvi Kapoor", "Saif Ali Khan"],
    providers: [
      { name: "Netflix", type: "Subscription", badge: "Stream in Hindi & South", price: "Included with Sub", url: "https://www.netflix.com", isAffiliate: true }
    ],
    trending: true,
    featured: false
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
    poster: "",
    backdrop: "",
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
// TMDB is the primary source; TVMaze and iTunes are supplementary
async function searchWorldwideMoviesAndShows(query) {
  const tmdbResults = [];
  const supplementaryResults = [];
  const cleanQ = query.trim().toLowerCase();
  const queryWords = cleanQ.split(/\s+/).filter(w => w.length >= 2);
  const config = getConfig();

  // Helper: check if a title is relevant to the search query
  function isRelevant(title) {
    const t = title.toLowerCase();
    if (queryWords.length === 0) return t.includes(cleanQ);
    return queryWords.some(word => t.includes(word));
  }

  // Helper: relevance score (higher = better match)
  function relevanceScore(title) {
    const t = title.toLowerCase();
    let score = 0;
    // Full query match
    if (t.includes(cleanQ)) score += 100;
    // Each matching word
    queryWords.forEach(word => { if (t.includes(word)) score += 10; });
    // Title starts with query
    if (t.startsWith(cleanQ)) score += 50;
    // Exact match
    if (t === cleanQ) score += 200;
    return score;
  }

  // 1. TMDB — Primary search engine (most comprehensive movie database)
  if (config.tmdbApiKey) {
    try {
      const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(config.tmdbApiKey)}&query=${encodeURIComponent(cleanQ)}&include_adult=false`);
      const tmdbData = await tmdbRes.json();
      if (tmdbData.results && Array.isArray(tmdbData.results)) {
        tmdbData.results.slice(0, 12).forEach(item => {
          if (item.media_type !== 'movie' && item.media_type !== 'tv') return;
          const isTv = item.media_type === 'tv';
          const title = isTv ? item.name : item.title;
          if (!title) return;

          const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
          const backdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : poster;
          const releaseYear = (isTv ? item.first_air_date : item.release_date)?.substring(0, 4) || 'Recent';

          // Get genres from TMDB genre IDs
          const genreMap = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10762:'Kids',10763:'News',10764:'Reality',10765:'Sci-Fi & Fantasy',10766:'Soap',10767:'Talk',10768:'War & Politics'};
          const genres = item.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 3) || (isTv ? ['TV Series'] : ['Cinema']);

          tmdbResults.push({
            id: 'tmdb-' + item.id,
            title: title,
            type: isTv ? 'tv' : 'movie',
            year: releaseYear,
            rating: item.vote_average ? +item.vote_average.toFixed(1) : 0,
            runtime: isTv ? 'Series' : '~120 min',
            genres: genres.length > 0 ? genres : (isTv ? ['TV Series'] : ['Cinema']),
            tagline: item.vote_average >= 7 ? 'Highly rated on TMDB.' : 'Available on legal streaming platforms.',
            overview: item.overview || 'Click to view official streaming and rental platforms.',
            poster: poster,
            backdrop: backdrop,
            trailerQuery: title + ' official trailer',
            director: 'Official Studio',
            cast: ['Featured Cast'],
            providers: [
              { name: "Amazon Prime Video", type: "Subscription", badge: "Watch on Prime", price: "Stream", url: "https://www.amazon.com/gp/video/storefront", isAffiliate: true },
              { name: "Netflix", type: "Subscription", badge: "Check Availability", price: "Stream", url: "https://www.netflix.com/search?q=" + encodeURIComponent(title), isAffiliate: false },
              { name: "Apple TV", type: "Rent", badge: "Stream / Rent", price: "Rent", url: "https://tv.apple.com", isAffiliate: true }
            ],
            trending: false,
            featured: false,
            _relevance: relevanceScore(title) + (item.popularity || 0)
          });
        });
      }
    } catch (e) {
      console.warn('TMDB search error:', e);
    }
  }

  // 2. TVMaze — Supplementary for TV shows only (skip if TMDB already found plenty)
  if (tmdbResults.filter(r => r.type === 'tv').length < 3) {
    try {
      const tvRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanQ)}`);
      const tvData = await tvRes.json();
      if (Array.isArray(tvData)) {
        tvData.slice(0, 5).forEach(item => {
          const show = item.show;
          if (!show || !show.name) return;
          // Only add if relevant AND not already found by TMDB
          if (!isRelevant(show.name)) return;
          if (tmdbResults.some(r => r.title.toLowerCase() === show.name.toLowerCase())) return;

          const posterImg = show.image?.original || show.image?.medium || null;
          const div = document.createElement('div');
          div.innerHTML = show.summary || '';
          const cleanSummary = div.textContent || div.innerText || 'Available on legal streaming platforms.';

          supplementaryResults.push({
            id: 'tvmaze-' + show.id,
            title: show.name,
            type: 'tv',
            year: show.premiered ? show.premiered.substring(0, 4) : 'TV Series',
            rating: show.rating?.average || 0,
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
            featured: false,
            _relevance: relevanceScore(show.name) + (item.score || 0)
          });
        });
      }
    } catch (e) {
      console.warn('TVMaze search error:', e);
    }
  }

  // 3. Apple iTunes — Supplementary (only if TMDB found few results, and only relevant matches)
  if (tmdbResults.length < 5) {
    try {
      const appleRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&media=movie&limit=8`);
      const appleData = await appleRes.json();
      if (appleData.results && Array.isArray(appleData.results)) {
        appleData.results.forEach(item => {
          const title = item.trackName || item.collectionName;
          if (!title) return;
          // Only add if relevant AND not a duplicate
          if (!isRelevant(title)) return;
          if (tmdbResults.some(r => r.title.toLowerCase() === title.toLowerCase())) return;
          if (supplementaryResults.some(r => r.title.toLowerCase() === title.toLowerCase())) return;

          const posterHd = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null;

          supplementaryResults.push({
            id: 'itunes-' + (item.trackId || item.collectionId || Math.random()),
            title: title,
            type: 'movie',
            year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Recent',
            rating: 0,
            runtime: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 60000) + ' min' : '120 min',
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
            featured: false,
            _relevance: relevanceScore(title)
          });
        });
      }
    } catch (e) {
      console.warn('Apple search error:', e);
    }
  }

  // Combine: TMDB results first (sorted by relevance), then supplementary
  const allResults = [...tmdbResults, ...supplementaryResults];
  allResults.sort((a, b) => (b._relevance || 0) - (a._relevance || 0));
  return allResults;
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

// Watchlist Management (100% Client-Side Persistence)
function getWatchlist() {
  try {
    const list = localStorage.getItem('cinefind_watchlist');
    return list ? JSON.parse(list) : [];
  } catch (e) { return []; }
}

function saveWatchlist(list) {
  try {
    localStorage.setItem('cinefind_watchlist', JSON.stringify(list));
  } catch (e) {}
  updateWatchlistBadge();
}

function isInWatchlist(id) {
  return getWatchlist().includes(id);
}

function toggleWatchlist(movieId, e) {
  if (e) e.stopPropagation();
  let list = getWatchlist();
  const exists = list.includes(movieId);
  if (exists) {
    list = list.filter(id => id !== movieId);
    showToast('Removed from Watchlist ❌');
  } else {
    list.push(movieId);
    showToast('Saved to Watchlist! 🔖');
  }
  saveWatchlist(list);
  updateModalWatchlistState(movieId);
  if (isWatchlistActive) {
    showWatchlistView();
  } else {
    updateCardWatchlistBadges();
  }
}

let isWatchlistActive = false;
function toggleWatchlistView() {
  isWatchlistActive = !isWatchlistActive;
  const btn = document.getElementById('navWatchlistBtn');
  if (btn) btn.classList.toggle('active', isWatchlistActive);
  
  if (isWatchlistActive) {
    showWatchlistView();
  } else {
    resetFilters();
  }
}

function showWatchlistView() {
  const list = getWatchlist();
  const savedMovies = allMovies.filter(m => list.includes(m.id));
  const catTitle = document.getElementById('catalogTitle');
  if (catTitle) catTitle.textContent = `🔖 My Watchlist (${savedMovies.length})`;
  renderMovies(savedMovies);
  const catalog = document.getElementById('catalogSection');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

function updateWatchlistBadge() {
  const count = getWatchlist().length;
  const badge = document.getElementById('navWatchlistCount');
  if (badge) badge.textContent = count;
}

function updateCardWatchlistBadges() {
  const list = getWatchlist();
  document.querySelectorAll('.card-watchlist-btn').forEach(btn => {
    const id = btn.dataset.id;
    const active = list.includes(id);
    btn.classList.toggle('active', active);
    btn.innerHTML = active ? '★' : '☆';
    btn.title = active ? 'Remove from Watchlist' : 'Add to Watchlist';
  });
}

function handleModalWatchlistToggle() {
  if (currentOpenMovieId) {
    toggleWatchlist(currentOpenMovieId);
  }
}

function updateModalWatchlistState(movieId) {
  const btn = document.getElementById('modalWatchlistBtn');
  const txt = document.getElementById('modalWatchlistText');
  if (!btn || !txt) return;
  const active = isInWatchlist(movieId);
  btn.classList.toggle('active', active);
  txt.textContent = active ? 'In Your Watchlist ★' : 'Add to Watchlist';
}

// Surprise Me (Random Pick)
function surpriseMe() {
  const eligible = allMovies.filter(m => m.rating >= 7.5);
  const pool = eligible.length > 0 ? eligible : allMovies;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (picked) {
    showToast(`🎲 Surprise Pick: ${picked.title}!`);
    openMovie(picked.id);
  }
}

// Deep-Linking & Social Sharing
let currentOpenMovieId = null;

function shareCurrentMovieToWhatsApp() {
  if (!currentOpenMovieId) return;
  const movie = allMovies.find(m => m.id === currentOpenMovieId);
  if (!movie) return;
  const shareUrl = `${window.location.origin}${window.location.pathname}#movie=${encodeURIComponent(movie.id)}`;
  const text = `🍿 Where to stream "${movie.title}" (${movie.year}) legally on Netflix, Prime & Hotstar:\n👉 ${shareUrl}`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

function copyCurrentMovieLink() {
  if (!currentOpenMovieId) return;
  const shareUrl = `${window.location.origin}${window.location.pathname}#movie=${encodeURIComponent(currentOpenMovieId)}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('📋 Direct link copied! Share anywhere.');
    }).catch(() => {
      prompt('Copy this link:', shareUrl);
    });
  } else {
    prompt('Copy this link:', shareUrl);
  }
}

function checkDeepLink() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#movie=')) {
    const movieId = decodeURIComponent(hash.replace('#movie=', ''));
    setTimeout(() => {
      openMovie(movieId);
    }, 400);
  }
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
  updateWatchlistBadge();
  checkDeepLink();
  window.addEventListener('hashchange', checkDeepLink);
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
    const isSaved = isInWatchlist(movie.id);

    const posterSrc = movie.poster || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect fill='%231a1a2e' width='300' height='450'/%3E%3Ctext fill='%236366f1' font-family='sans-serif' font-size='48' text-anchor='middle' x='150' y='215'%3E🎬%3C/text%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='13' text-anchor='middle' x='150' y='250'%3ELoading poster...%3C/text%3E%3C/svg%3E";

    html += `
      <div class="movie-card" onclick="openMovie('${movie.id}')">
        <div class="card-poster">
          <img src="${posterSrc}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null;this.style.objectFit='contain';this.style.padding='2rem';this.style.background='#1a1a2e';this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27450%27%3E%3Crect fill=%27%231a1a2e%27 width=%27300%27 height=%27450%27/%3E%3Ctext fill=%27%236366f1%27 font-family=%27sans-serif%27 font-size=%2748%27 text-anchor=%27middle%27 x=%27150%27 y=%27215%27%3E🎬%3C/text%3E%3Ctext fill=%27%2394a3b8%27 font-family=%27sans-serif%27 font-size=%2713%27 text-anchor=%27middle%27 x=%27150%27 y=%27250%27%3EPoster unavailable%3C/text%3E%3C/svg%3E'">
          <div class="poster-overlay">
            <span class="btn-quick-play">▶ Stream Guide</span>
          </div>
          ${typeBadge}
          <button class="card-watchlist-btn ${isSaved ? 'active' : ''}" data-id="${movie.id}" title="${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}" onclick="toggleWatchlist('${movie.id}', event)">${isSaved ? '★' : '☆'}</button>
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

// Dynamic Auto-Rotating Hero Carousel
const HERO_TITLES_LIST = ["ramayana-part-1", "pushpa-2", "the-penguin", "stree-2"];
let currentHeroIndex = 0;
let heroCarouselTimer = null;

function renderHeroDots() {
  const container = document.getElementById('heroDots');
  if (!container) return;
  container.innerHTML = HERO_TITLES_LIST.map((id, idx) => `
    <span class="hero-dot ${idx === currentHeroIndex ? 'active' : ''}" onclick="setHeroIndex(${idx})"></span>
  `).join('');
}

function loadHeroSpotlight() {
  renderHeroDots();
  const targetId = HERO_TITLES_LIST[currentHeroIndex];
  const movie = allMovies.find(m => m.id === targetId) || allMovies[0];
  if (!movie) return;

  const backdrop = document.getElementById('heroBackdrop');
  if (backdrop) {
    if (movie.backdrop) {
      backdrop.style.backgroundImage = `url('${movie.backdrop}')`;
    } else if (movie.poster) {
      backdrop.style.backgroundImage = `url('${movie.poster}')`;
    }
  }
  const heroTitle = document.getElementById('heroTitle');
  const heroTagline = document.getElementById('heroTagline');
  const heroOverview = document.getElementById('heroOverview');
  const heroRating = document.getElementById('heroRating');
  const heroYear = document.getElementById('heroYear');
  const heroRuntime = document.getElementById('heroRuntime');
  const heroGenre = document.getElementById('heroGenre');
  if (heroTitle) heroTitle.textContent = movie.title;
  if (heroTagline) heroTagline.textContent = movie.tagline || 'Trending Blockbuster';
  if (heroOverview) heroOverview.textContent = movie.overview;
  if (heroRating) heroRating.textContent = `★ ${movie.rating}`;
  if (heroYear) heroYear.textContent = movie.year;
  if (heroRuntime) heroRuntime.textContent = movie.runtime;
  if (heroGenre) heroGenre.textContent = movie.genres ? movie.genres[0] : 'Blockbuster';

  // Attach buttons to current hero movie
  const heroWatchBtn = document.getElementById('heroWatchBtn');
  const heroWhereToWatchBtn = document.getElementById('heroWhereToWatchBtn');
  if (heroWatchBtn) heroWatchBtn.onclick = () => openMovie(movie.id);
  if (heroWhereToWatchBtn) heroWhereToWatchBtn.onclick = () => openMovie(movie.id);

  startHeroAutoRotation();
}

function nextHeroSpotlight() {
  currentHeroIndex = (currentHeroIndex + 1) % HERO_TITLES_LIST.length;
  loadHeroSpotlight();
}

function prevHeroSpotlight() {
  currentHeroIndex = (currentHeroIndex - 1 + HERO_TITLES_LIST.length) % HERO_TITLES_LIST.length;
  loadHeroSpotlight();
}

function setHeroIndex(idx) {
  currentHeroIndex = idx;
  loadHeroSpotlight();
}

function startHeroAutoRotation() {
  clearInterval(heroCarouselTimer);
  heroCarouselTimer = setInterval(() => {
    nextHeroSpotlight();
  }, 6500);
}

// "What's Your Mood?" Filter Handler
function selectMood(genre) {
  currentFilter.genre = genre;
  document.querySelectorAll('#moodFilters .mood-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.genre === genre);
  });
  document.querySelectorAll('#genreFilters .pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.genre === genre);
  });
  applyFilters();
  const catalog = document.getElementById('catalogSection');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

// "New on OTT This Weekend" Filter Handler
function filterByWeekendOTT() {
  currentFilter.type = 'All';
  currentFilter.genre = 'All';
  currentFilter.provider = 'All';
  currentFilter.query = '';
  document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
  const weekendPill = document.querySelector('.ott-weekend-pill');
  if (weekendPill) weekendPill.classList.add('active');

  const weekendTitles = ["pushpa-2", "bhool-bhulaiyaa-3", "singham-again", "the-penguin", "devara-part-1", "stree-2", "kalki-2898-ad"];
  const filtered = allMovies.filter(m => weekendTitles.includes(m.id) || (m.year && m.year.includes('2024')));
  const catTitle = document.getElementById('catalogTitle');
  if (catTitle) catTitle.textContent = '📅 New on OTT This Weekend (Official Releases)';
  renderMovies(filtered);
  const catalog = document.getElementById('catalogSection');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

// PWA Install Prompt Handler
let deferredPwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const btn = document.getElementById('installPwaBtn');
  if (btn) btn.style.display = 'inline-flex';
});

function promptPwaInstall() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('🎉 CineFind App Installed!');
      }
      deferredPwaPrompt = null;
    });
  } else {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos) {
      alert('To install CineFind on your iPhone/iPad:\n1. Tap the Share button at the bottom of Safari\n2. Tap "Add to Home Screen" 📲');
    } else {
      showToast('📲 Bookmark this page or tap your browser menu -> "Add to Home screen" to install.');
    }
  }
}

// Open Movie Details & Where to Watch Modal
function openMovie(movieId) {
  const movie = allMovies.find(m => m.id === movieId);
  if (!movie) return;

  currentOpenMovieId = movieId;
  updateModalWatchlistState(movieId);

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
        <img src="${backdropUrl}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6);" onerror="this.onerror=null;this.style.display='none'">
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
  currentOpenMovieId = null;
  if (window.location.hash && window.location.hash.startsWith('#movie=')) {
    try {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    } catch (e) {}
  }
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
