const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DIST = path.resolve(__dirname, '..', 'frontend', 'dist');
const PORT = process.env.PORT || 5000;

function sendFile(res, filePath, contentType = 'text/html'){
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(DIST, pathname);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }[ext] || 'application/octet-stream';
      sendFile(res, filePath, mime);
      return;
    }

    // fallback to index.html for SPA routes
    const indexFile = path.join(DIST, 'index.html');
    fs.stat(indexFile, (ie, istat) => {
      if (ie || !istat.isFile()){
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      sendFile(res, indexFile, 'text/html');
    });
  });
});

server.listen(PORT, () => {
  console.log(`SPA server listening on http://localhost:${PORT}`);
});

// handle graceful shutdown
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
