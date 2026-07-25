// TOP-GPS — Full Debug Tracking Server
// Captures EVERYTHING from the phone
const http = require('http');
const net  = require('net');

const HTTP_PORT = 5055;
const API_PORT  = 5056;
const TCP_PORT  = 5044; // Raw TCP capture

const positions = {};
const wsClients = new Set();

// =============================================
//  RAW TCP Server — captures binary/text data
// =============================================
const tcpServer = net.createServer(socket => {
  const remote = socket.remoteAddress + ':' + socket.remotePort;
  console.log(`\n[TCP] 🔌 New connection from ${remote}`);

  socket.on('data', data => {
    console.log(`[TCP] 📥 Raw data from ${remote}:\n${data.toString()}\n`);
    socket.write('HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nOK');
  });

  socket.on('error', () => {});
  socket.on('close', () => console.log(`[TCP] ❌ Connection closed: ${remote}`));
});

// =============================================
//  HTTP Server — receives GPS positions
// =============================================
const trackingServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[📡 HTTP] ${new Date().toISOString()}`);
    console.log(`   Method  : ${req.method}`);
    console.log(`   URL     : ${req.url}`);
    console.log(`   From    : ${req.socket.remoteAddress}`);
    console.log(`   Headers : ${JSON.stringify(req.headers, null, 2)}`);
    if (body) console.log(`   Body    : ${body}`);
    console.log('═'.repeat(60));

    // Try all possible param sources
    const urlObj = new URL(req.url, 'http://localhost');
    const q = Object.fromEntries(urlObj.searchParams.entries());

    let params = q;
    if (Object.keys(q).length === 0 && body) {
      try { params = JSON.parse(body); }
      catch(e) {
        params = {};
        body.split('&').forEach(p => {
          const [k,v] = p.split('=');
          if (k) params[decodeURIComponent(k)] = decodeURIComponent(v||'');
        });
      }
    }

    const id  = params.id || params.deviceId || req.socket.remoteAddress || 'phone';
    const lat = parseFloat(params.lat || params.latitude  || 0);
    const lon = parseFloat(params.lon || params.longitude || 0);

    if (lat && lon) {
      const pos = {
        id, lat, lon,
        speed    : Math.round(parseFloat(params.speed    || 0) * 3.6),
        altitude : Math.round(parseFloat(params.altitude || 0)),
        bearing  : Math.round(parseFloat(params.bearing  || 0)),
        accuracy : Math.round(parseFloat(params.accuracy || 0)),
        batt     : parseFloat(params.batt || 0),
        timestamp: params.timestamp
          ? new Date(parseInt(params.timestamp) * 1000).toISOString()
          : new Date().toISOString()
      };
      positions[id] = pos;
      console.log(`[✅ GPS] Saved: ${id} → ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      broadcastPosition(pos);
    } else {
      console.log(`[⚠️] No coords. Params found: ${JSON.stringify(params)}`);
    }

    res.writeHead(200);
    res.end('OK');
  });
});

// =============================================
//  API Server — WebSocket + REST
// =============================================
const apiServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const p = new URL(req.url, 'http://localhost').pathname;

  if (p === '/api/positions') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(Object.values(positions)));
    return;
  }
  if (p === '/api/status') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'running',
      devices: Object.keys(positions).length,
      knownDevices: Object.keys(positions),
      uptime: Math.round(process.uptime()) + 's'
    }));
    return;
  }
  res.writeHead(404); res.end('Not found');
});

// WebSocket upgrade
apiServer.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  const acc = require('crypto').createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
  socket.readyState = 'OPEN';
  wsClients.add(socket);
  sendWsMessage(socket, JSON.stringify({ type: 'init', data: Object.values(positions) }));
  socket.on('close', () => wsClients.delete(socket));
  socket.on('error', () => wsClients.delete(socket));
});

function broadcastPosition(pos) {
  const msg = JSON.stringify({ type: 'position', data: pos });
  wsClients.forEach(c => { try { if (c.readyState === 'OPEN') sendWsMessage(c, msg); } catch(e){} });
}

function sendWsMessage(socket, message) {
  const buf = Buffer.from(message);
  const len = buf.length;
  const hdr = len < 126 ? Buffer.from([0x81, len]) : Buffer.from([0x81, 126, len >> 8, len & 0xFF]);
  try { socket.write(Buffer.concat([hdr, buf])); } catch(e) {}
}

// =============================================
//  Start Servers
// =============================================
tcpServer.listen(TCP_PORT, () => {
  console.log(`[TCP] Raw capture server on port ${TCP_PORT}`);
});

trackingServer.listen(HTTP_PORT, () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let localIP = '0.0.0.0';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) localIP = net.address;
    }
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║      TOP-GPS Debug Tracking Server v2             ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  📡 HTTP Tracking → Port ${HTTP_PORT}                      ║`);
  console.log(`║  🌐 API & WebSocket → Port ${API_PORT}                     ║`);
  console.log(`║  🔌 Raw TCP Debug   → Port ${TCP_PORT}                     ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  📱 Traccar Client Settings:                      ║');
  console.log('║  Protocol: OsmAnd                                 ║');
  console.log(`║  Server URL: http://${localIP}:${HTTP_PORT}      ║`);
  console.log('║  Waiting for GPS data...                          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
});

apiServer.listen(API_PORT);
