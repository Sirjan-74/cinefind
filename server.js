const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function readJsonFile(filename, fallback) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return fallback;
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return fallback;
  }
}

function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    return false;
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API ROUTING
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // GET /api/movies
    if (pathname === '/api/movies' && req.method === 'GET') {
      const movies = readJsonFile('movies.json', []);
      const { q, genre, provider, sort } = parsedUrl.query;

      let filtered = [...movies];

      if (q && q.trim()) {
        const queryLower = q.trim().toLowerCase();
        filtered = filtered.filter(m =>
          m.title.toLowerCase().includes(queryLower) ||
          m.genres.some(g => g.toLowerCase().includes(queryLower)) ||
          m.cast.some(c => c.toLowerCase().includes(queryLower)) ||
          m.director.toLowerCase().includes(queryLower)
        );
      }

      if (genre && genre !== 'All') {
        filtered = filtered.filter(m => m.genres.includes(genre));
      }

      if (provider && provider !== 'All') {
        filtered = filtered.filter(m =>
          m.providers.some(p => p.name.toLowerCase().includes(provider.toLowerCase()))
        );
      }

      if (sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'year') {
        filtered.sort((a, b) => b.year - a.year);
      } else if (sort === 'trending') {
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
      }

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: filtered.length, movies: filtered }));
      return;
    }

    // GET /api/movies/:id
    if (pathname.startsWith('/api/movies/') && req.method === 'GET') {
      const id = pathname.replace('/api/movies/', '').trim();
      const movies = readJsonFile('movies.json', []);
      const movie = movies.find(m => m.id === id);

      if (!movie) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Movie not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, movie }));
      return;
    }

    // GET /api/analytics
    if (pathname === '/api/analytics' && req.method === 'GET') {
      const analytics = readJsonFile('analytics.json', { totalClicks: 0, estimatedEarnings: 0, clicksByProvider: {} });
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, analytics }));
      return;
    }

    // GET /api/config
    if (pathname === '/api/config' && req.method === 'GET') {
      const config = readJsonFile('config.json', {});
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, config }));
      return;
    }

    // POST /api/config
    if (pathname === '/api/config' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newConfig = JSON.parse(body);
          const currentConfig = readJsonFile('config.json', {});
          const updated = { ...currentConfig, ...newConfig };
          writeJsonFile('config.json', updated);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, config: updated }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
        }
      });
      return;
    }

    // POST /api/track-click (Monetization Affiliate Tracker)
    if (pathname === '/api/track-click' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { provider, movieTitle } = JSON.parse(body || '{}');
          const analytics = readJsonFile('analytics.json', { totalClicks: 0, estimatedEarnings: 0, clicksByProvider: {}, recentEvents: [] });
          
          analytics.totalClicks = (analytics.totalClicks || 0) + 1;
          const commission = 1.75;
          analytics.estimatedEarnings = +(analytics.estimatedEarnings + commission).toFixed(2);

          if (!analytics.clicksByProvider) analytics.clicksByProvider = {};
          analytics.clicksByProvider[provider] = (analytics.clicksByProvider[provider] || 0) + 1;

          if (!analytics.recentEvents) analytics.recentEvents = [];
          analytics.recentEvents.unshift({
            provider: provider || 'Unknown',
            movie: movieTitle || 'General',
            time: new Date().toISOString()
          });
          if (analytics.recentEvents.length > 20) analytics.recentEvents.pop();

          writeJsonFile('analytics.json', analytics);

          res.writeHead(200);
          res.end(JSON.stringify({ success: true, analytics }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Failed to record click' }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
    return;
  }

  // STATIC FILE SERVING
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`CineFind server running at http://localhost:${PORT}`);
});

