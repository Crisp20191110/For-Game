import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    // Serve only public application files, never repository metadata or tests.
    if (!['index.html', 'sw.js', 'manifest.webmanifest'].includes(relative) && !/^(src|public)\/[\w./-]+$/.test(relative)) {
      res.writeHead(404).end('Not found'); return;
    }
    const file = path.resolve(root, relative);
    if (!file.startsWith(root) || relative.split('/').includes('..')) {
      res.writeHead(403).end(); return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`一叶问仙 · http://localhost:${port}`));
