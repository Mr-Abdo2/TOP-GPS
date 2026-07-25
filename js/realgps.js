// =============================================
//  TOP-GPS — Real GPS Live Integration
//  Connects to traccar-server WebSocket and
//  shows your real phone position on the map
// =============================================

const RealGPS = (() => {
  let ws = null;
  let realMarkers = {};
  let reconnectTimer = null;
  const API_URL = 'http://localhost:5056';
  const WS_URL  = 'ws://localhost:5056';

  // Phone icon for real device
  const phoneIcon = (id) => L.divIcon({
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    html: `
      <div style="
        width:48px; height:48px;
        background: linear-gradient(135deg,#10b981,#059669);
        border-radius: 50%;
        border: 3px solid #fff;
        box-shadow: 0 0 0 3px #10b981, 0 4px 15px rgba(16,185,129,0.6);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
        animation: realGpsPulse 2s infinite;
      ">📱</div>
      <div style="
        text-align:center;
        background:rgba(16,185,129,0.9);
        color:#fff;
        font-size:10px;
        font-weight:700;
        border-radius:4px;
        padding:1px 4px;
        margin-top:2px;
        white-space:nowrap;
        font-family:Cairo,sans-serif;
      ">📡 موقعي الحقيقي</div>
    `
  });

  // Add pulse animation CSS
  function injectStyles() {
    if (document.getElementById('real-gps-styles')) return;
    const style = document.createElement('style');
    style.id = 'real-gps-styles';
    style.textContent = `
      @keyframes realGpsPulse {
        0%, 100% { box-shadow: 0 0 0 3px #10b981, 0 4px 15px rgba(16,185,129,0.6); }
        50%       { box-shadow: 0 0 0 8px rgba(16,185,129,0.2), 0 4px 25px rgba(16,185,129,0.8); }
      }
      #real-gps-status {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16,185,129,0.95);
        color: #fff;
        padding: 8px 20px;
        border-radius: 20px;
        font-family: Cairo, sans-serif;
        font-size: 13px;
        font-weight: 600;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 20px rgba(16,185,129,0.4);
        transition: all 0.3s;
      }
      #real-gps-status.disconnected {
        background: rgba(239,68,68,0.95);
        box-shadow: 0 4px 20px rgba(239,68,68,0.4);
      }
    `;
    document.head.appendChild(style);
  }

  function showStatus(msg, connected = true) {
    let el = document.getElementById('real-gps-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'real-gps-status';
      document.body.appendChild(el);
    }
    el.className = connected ? '' : 'disconnected';
    el.innerHTML = (connected ? '🟢' : '🔴') + ' ' + msg;
  }

  let firstFix = true; // Auto-pan to real location on first GPS fix
  let findMeAdded = false;

  function addFindMeButton(lat, lon) {
    if (findMeAdded) return;
    findMeAdded = true;

    // Add "Find Me" button to map controls
    const btn = document.createElement('button');
    btn.id = 'find-me-btn';
    btn.title = 'اذهب لموقعي الحقيقي';
    btn.innerHTML = '📱 موقعي';
    btn.style.cssText = `
      position: fixed;
      top: 80px;
      left: 20px;
      z-index: 9999;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 8px 14px;
      font-family: Cairo, sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(16,185,129,0.5);
      transition: all 0.2s;
    `;
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => {
      const map = MapManager.getMap();
      if (map) map.flyTo([lat, lon], 16, { animate: true, duration: 1.5 });
    };
    document.body.appendChild(btn);
  }

  function updateMarker(pos) {
    const map = MapManager.getMap();
    if (!map) { setTimeout(() => updateMarker(pos), 1000); return; }

    const { id, lat, lon, speed, batt, accuracy, timestamp } = pos;

    // Update or create marker
    if (realMarkers[id]) {
      realMarkers[id].setLatLng([lat, lon]);
    } else {
      realMarkers[id] = L.marker([lat, lon], { icon: phoneIcon(id), zIndexOffset: 9000 });
      realMarkers[id].addTo(map);
    }

    // Bind popup
    const time = new Date(timestamp).toLocaleTimeString('ar-SA');
    realMarkers[id].bindPopup(`
      <div dir="rtl" style="font-family:Cairo,sans-serif;min-width:200px">
        <div style="font-weight:700;font-size:15px;color:#10b981;margin-bottom:8px">📱 موقعي الحقيقي</div>
        <div>📍 lat: <b>${lat.toFixed(5)}</b></div>
        <div>📍 lon: <b>${lon.toFixed(5)}</b></div>
        <div>🚀 السرعة: <b>${speed} كم/س</b></div>
        <div>🔋 البطارية: <b>${batt}%</b></div>
        <div>🎯 الدقة: <b>${accuracy}م</b></div>
        <div>🕐 آخر تحديث: <b>${time}</b></div>
      </div>
    `);

    // ✅ Auto-pan to real location on FIRST fix
    if (firstFix) {
      firstFix = false;
      map.flyTo([lat, lon], 15, { animate: true, duration: 2 });
      console.log(`[RealGPS] 🗺️ Auto-panned to real location: ${lat}, ${lon}`);
    }

    // Add Find Me button
    addFindMeButton(lat, lon);
    // Update button onclick with latest coords
    const btn = document.getElementById('find-me-btn');
    if (btn) btn.onclick = () => map.flyTo([lat, lon], 16, { animate: true, duration: 1.5 });

    // Update status bar
    showStatus(`📡 GPS حي: ${lat.toFixed(4)}, ${lon.toFixed(4)} | ${speed} كم/س | 🔋 ${batt}%`);
  }

  function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[RealGPS] ✅ WebSocket connected');
      showStatus('متصل — في انتظار بيانات GPS...', true);
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'position') {
          updateMarker(msg.data);
        } else if (msg.type === 'init' && msg.data.length > 0) {
          msg.data.forEach(pos => updateMarker(pos));
        }
      } catch(err) { console.error('[RealGPS] Parse error:', err); }
    };

    ws.onclose = () => {
      console.log('[RealGPS] ❌ Disconnected. Reconnecting in 5s...');
      showStatus('انقطع الاتصال — جاري إعادة الاتصال...', false);
      reconnectTimer = setTimeout(connect, 5000);
    };

    ws.onerror = (e) => {
      console.error('[RealGPS] Error:', e);
    };
  }

  // Fetch existing positions on start
  async function fetchInitial() {
    try {
      const res = await fetch(`${API_URL}/api/positions`);
      const data = await res.json();
      data.forEach(pos => updateMarker(pos));
      if (data.length > 0) {
        showStatus(`تم تحميل ${data.length} جهاز GPS حقيقي`, true);
      }
    } catch(e) {
      console.log('[RealGPS] No tracking server found at', API_URL);
    }
  }

  function init() {
    injectStyles();
    fetchInitial();
    connect();
    console.log('[RealGPS] 🚀 Real GPS integration started');
  }

  function panToDevice(id) {
    const map = window.MapManager && MapManager.getMap ? MapManager.getMap() : null;
    if (map && realMarkers[id]) {
      map.flyTo(realMarkers[id].getLatLng(), 16, { animate: true, duration: 1.5 });
    }
  }

  return { init, panToDevice };
})();

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(RealGPS.init, 2000);
  });
} else {
  setTimeout(RealGPS.init, 2000);
}
