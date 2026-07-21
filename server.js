const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 5050;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle custom download endpoint
  if (pathname === '/download-report' && req.method === 'POST') {
    console.log(`[Server] POST /download-report request received.`);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsedBody = querystring.parse(body);
        const data = JSON.parse(parsedBody.data);
        const filename = data.filename || 'report.xls';
        const contentType = filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.ms-excel';
        console.log(`[Server] Exporting: ${filename} (Type: ${contentType}), base64: ${data.base64}, size: ${data.content ? data.content.length : 0} chars`);
        
        // Return file directly with correct headers
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}"`,
          'Access-Control-Allow-Origin': '*'
        });
        
        if (data.base64) {
          const contentStr = typeof data.content === 'string' ? data.content : '';
          res.end(Buffer.from(contentStr, 'base64'));
        } else {
          res.end(data.content || '');
        }
      } catch (err) {
        if (!res.headersSent) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
        }
        res.end('Bad Request: ' + err.message);
      }
    });
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Serve static files
  let filePath = path.join(PUBLIC_DIR, pathname);
  if (pathname === '/') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  // Security: prevent directory traversal
  const relative = path.relative(PUBLIC_DIR, filePath);
  if (relative && relative.startsWith('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Custom server running at http://localhost:${PORT}/`);
});
