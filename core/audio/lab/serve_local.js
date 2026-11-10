// Serve the private local Audio Lab over loopback so browsers can fetch preview audio
// into Web Audio for the Cut editor. This server is intentionally not exposed to the LAN.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.env.KRATOR_AUDIO || path.resolve(__dirname, '..', '..', '..', '..', 'krator-audio'), 'lab');
const host = '127.0.0.1';
const port = Number(process.env.KRATOR_AUDIO_LAB_PORT || 8765);
const types = { '.html': 'text/html; charset=utf-8', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.json': 'application/json; charset=utf-8' };

http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, `http://${host}:${port}`).pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  const requested = pathname === '/' ? '/index.html' : pathname;
  const file = path.resolve(root, '.' + requested);
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) {
    res.writeHead(403).end('Forbidden'); return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    fs.createReadStream(file).pipe(res);
  });
}).listen(port, host, () => console.log(`Krator Audio Lab: http://${host}:${port}/ (local machine only; serving ${root})`));
