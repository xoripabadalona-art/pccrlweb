import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.argv[2] ?? process.env.PORT ?? 3123);
const OUT_DIR = path.resolve(process.cwd(), 'out');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const rawUrl = (req.url ?? '/').split('?')[0] ?? '/';
  const decodedPath = decodeURIComponent(rawUrl);
  const safeRel = decodedPath.replace(/^\/+/, '');

  const candidates = [
    path.join(OUT_DIR, safeRel),
    path.join(OUT_DIR, `${safeRel}.html`),
    path.join(OUT_DIR, safeRel, 'index.html'),
  ];

  let resolvedFile = null;
  for (const candidate of candidates) {
    if (!candidate.startsWith(OUT_DIR)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      resolvedFile = candidate;
      break;
    }
  }

  if (!resolvedFile) {
    const notFoundHtml = path.join(OUT_DIR, '404.html');
    if (fs.existsSync(notFoundHtml)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(notFoundHtml));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(resolvedFile).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  res.end(fs.readFileSync(resolvedFile));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Static export server listening on http://localhost:${PORT}`);
});
