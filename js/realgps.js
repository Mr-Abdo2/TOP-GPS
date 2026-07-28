// =============================================
//  TOP-GPS — Real GPS Live Integration
//  Uses Browser Geolocation API (works directly
//  on the phone — no external server needed!)
// =============================================

const RealGPS = (() => {
  let realMarkers = {};
  let watchId = null;
  let firstFix = true;
  let findMeAdded = false;
  let lastLat = null, lastLon = null;

  // Phone icon for real device
  const phoneIcon = () => L.divIcon({
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
        bottom: 75px;
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
        white-space: nowrap;
      }
      #real-gps-status.disconnected {
        background: rgba(239,68,68,0.95);
        box-shadow: 0 4px 20px rgba(239,68,68,0.4);
      }
      #real-gps-status.waiting {
        background: rgba(245,158,11,0.95);
        box-shadow: 0 4px 20px rgba(245,158,11,0.4);
      }
    `;
    document.head.appendChild(style);
  }

  function showStatus(msg, type = 'connected') {
    let el = document.getElementById('real-gps-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'real-gps-status';
      document.body.appendChild(el);
    }
    el.className = type === 'connected' ? '' : type;
    const icon = type === 'connected' ? '🟢' : type === 'waiting' ? '🟡' : '🔴';
    el.innerHTML = icon + ' ' + msg;
  }

  function addFindMeButton() {
    if (findMeAdded) return;
    findMeAdded = true;

    const btn = document.createElement('button');
    btn.id = 'find-me-btn';
    btn.title = 'اذهب لموقعي الحقيقي';
    btn.innerHTML = '📱 موقعي';
    btn.style.cssText = `
      position: fixed;
      top: 70px;
      left: 16px;
      z-index: 9998;
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
    btn.onclick = () => {
      if (lastLat !== null && lastLon !== null) {
        const map = MapManager.getMap();
        if (map) map.flyTo([lastLat, lastLon], 16, { animate: true, duration: 1.5 });
      }
    };
    document.body.appendChild(btn);
  }

  function updateMarker(lat, lon, speed, accuracy) {
    const map = MapManager.getMap();
    if (!map) { setTimeout(() => updateMarker(lat, lon, speed, accuracy), 1000); return; }

    lastLat = lat;
    lastLon = lon;

    const id = 'my-phone';
    const time = new Date().toLocaleTimeString('ar-SA');
    const speedKmh = speed ? Math.round(speed * 3.6) : 0;
    const acc = accuracy ? Math.round(accuracy) : '?';

    if (realMarkers[id]) {
      realMarkers[id].setLatLng([lat, lon]);
    } else {
      realMarkers[id] = L.marker([lat, lon], { icon: phoneIcon(), zIndexOffset: 9000 });
      realMarkers[id].addTo(map);
    }

    realMarkers[id].bindPopup(`
      <div dir="rtl" style="font-family:Cairo,sans-serif;min-width:200px">
        <div style="font-weight:700;font-size:15px;color:#10b981;margin-bottom:8px">📱 موقعي الحقيقي</div>
        <div>📍 خط العرض: <b>${lat.toFixed(5)}</b></div>
        <div>📍 خط الطول: <b>${lon.toFixed(5)}</b></div>
        <div>🚀 السرعة: <b>${speedKmh} كم/س</b></div>
        <div>🎯 الدقة: <b>${acc} متر</b></div>
        <div>🕐 آخر تحديث: <b>${time}</b></div>
      </div>
    `);

    // Auto-pan on first fix
    if (firstFix) {
      firstFix = false;
      map.flyTo([lat, lon], 15, { animate: true, duration: 2 });
      console.log(`[RealGPS] 🗺️ Auto-panned to real location: ${lat}, ${lon}`);
    }

    addFindMeButton();
    showStatus(`📡 موقعي: ${lat.toFixed(4)}, ${lon.toFixed(4)} | ${speedKmh} كم/س | دقة: ${acc}م`);
  }

  function onSuccess(position) {
    const { latitude, longitude, speed, accuracy } = position.coords;
    updateMarker(latitude, longitude, speed, accuracy);
  }

  function onError(err) {
    let msg = 'تعذّر تحديد الموقع';
    if (err.code === 1) msg = '❌ تم رفض إذن الموقع — افتح الإعدادات وامنح الإذن';
    else if (err.code === 2) msg = '❌ GPS غير متاح — تأكد من تفعيله';
    else if (err.code === 3) msg = '⏱️ انتهى وقت تحديد الموقع — حاول مرة أخرى';
    console.error('[RealGPS] Error:', err.code, err.message);
    showStatus(msg, 'disconnected');
  }

  function init() {
    injectStyles();

    if (!navigator.geolocation) {
      showStatus('❌ المتصفح لا يدعم GPS', 'disconnected');
      console.warn('[RealGPS] Geolocation not supported');
      return;
    }

    showStatus('🔍 جاري تحديد موقعك...', 'waiting');
    console.log('[RealGPS] 🚀 Starting Browser Geolocation...');

    // Get first fix immediately
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });

    // Then watch continuously for live updates every ~5s
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    });
  }

  function stop() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  function panToDevice() {
    if (lastLat !== null && lastLon !== null) {
      const map = MapManager.getMap();
      if (map) map.flyTo([lastLat, lastLon], 16, { animate: true, duration: 1.5 });
    }
  }

  return { init, stop, panToDevice };
})();

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(RealGPS.init, 2000);
  });
} else {
  setTimeout(RealGPS.init, 2000);
}
