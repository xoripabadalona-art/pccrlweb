import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const OUT_DIR = path.resolve(process.cwd(), 'out');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function requestHandler(req, res) {
  const clientIp = req.socket.remoteAddress ?? 'unknown';
  const rawUrl = (req.url ?? '/').split('?')[0] ?? '/';
  const decodedPath = decodeURIComponent(rawUrl);
  const safeRel = decodedPath.replace(/^\/+/, '');

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${rawUrl} from ${clientIp}`);

  res.setHeader('Access-Control-Allow-Origin', '*');

  // Candidate file paths
  const candidates = [
    path.join(OUT_DIR, safeRel),
    path.join(OUT_DIR, `${safeRel}.html`),
    path.join(OUT_DIR, safeRel, 'index.html'),
    // Fallback: prepend 'es' locale if not found directly (e.g. /carta -> /es/carta)
    path.join(OUT_DIR, 'es', safeRel),
    path.join(OUT_DIR, 'es', `${safeRel}.html`),
    path.join(OUT_DIR, 'es', safeRel, 'index.html'),
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
  const stat = fs.statSync(resolvedFile);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Support HTTP 206 Partial Content (Byte-Range requests), required by iOS Safari for MP4/WebM video playback
  if (range && (ext === '.mp4' || ext === '.webm')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0] ?? '0', 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const clampedStart = Math.max(0, Math.min(start, fileSize - 1));
    const clampedEnd = Math.max(clampedStart, Math.min(end, fileSize - 1));
    const chunkSize = clampedEnd - clampedStart + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${clampedStart}-${clampedEnd}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(resolvedFile, { start: clampedStart, end: clampedEnd });
    stream.pipe(res);
    return;
  }

  const headers = {
    'Content-Type': contentType,
    'Content-Length': fileSize,
    'Accept-Ranges': 'bytes',
  };

  if (ext === '.mp4' || ext === '.webm' || ext === '.webp' || ext === '.woff2') {
    headers['Cache-Control'] = 'public, max-age=3600';
  } else {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

  res.writeHead(200, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(resolvedFile).pipe(res);
}

function getNetworkIp() {
  const nets = os.networkInterfaces();
  for (const addrs of Object.values(nets)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '127.0.0.1';
}

const networkIp = getNetworkIp();
const PORTS = [3000, 5000];

for (const port of PORTS) {
  const server = http.createServer(requestHandler);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}:`);
    console.log(`  > Local:   http://localhost:${port}`);
    console.log(`  > Wi-Fi:   http://${networkIp}:${port}`);
    console.log(`  > mDNS:    http://${os.hostname().split('.')[0]}.local:${port}`);
  });
  server.on('error', (err) => {
    console.error(`Error on port ${port}: ${err.message}`);
  });
}
