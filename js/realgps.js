// =============================================
//  TOP-GPS — Real GPS + Supabase Integration
//  Uses Browser Geolocation API → saves to Supabase
// =============================================

const RealGPS = (() => {
  let realMarkers = {};
  let watchId = null;
  let firstFix = true;
  let findMeAdded = false;
  let lastLat = null, lastLon = null;
  let lastSavedTime = 0;
  const SAVE_INTERVAL_MS = 15000; // Save to Supabase every 15 seconds
  let lastSpeed = 0;
  const OVERSPEED_LIMIT = 120; // km/h

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
      #real-gps-status.disconnected { background: rgba(239,68,68,0.95); }
      #real-gps-status.waiting { background: rgba(245,158,11,0.95); }
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
    btn.innerHTML = '📱 موقعي';
    btn.style.cssText = `
      position: fixed; top: 70px; left: 16px; z-index: 9998;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white; border: none; border-radius: 10px;
      padding: 8px 14px; font-family: Cairo, sans-serif;
      font-size: 13px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 15px rgba(16,185,129,0.5);
    `;
    btn.onclick = () => {
      if (lastLat !== null) {
        const map = window.MapManager && MapManager.getMap ? MapManager.getMap() : null;
        if (map) map.flyTo([lastLat, lastLon], 16, { animate: true, duration: 1.5 });
      }
    };
    document.body.appendChild(btn);
  }

  function updateMarker(lat, lon, speed, accuracy) {
    const map = window.MapManager && MapManager.getMap ? MapManager.getMap() : null;
    if (!map) { setTimeout(() => updateMarker(lat, lon, speed, accuracy), 1000); return; }

    lastLat = lat;
    lastLon = lon;
    lastSpeed = speed;

    const time = new Date().toLocaleTimeString('ar-SA');
    const speedKmh = speed ? Math.round(speed * 3.6) : 0;
    const acc = accuracy ? Math.round(accuracy) : '?';
    const id = 'my-phone';

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

    if (firstFix) {
      firstFix = false;
      map.flyTo([lat, lon], 15, { animate: true, duration: 2 });
    }

    addFindMeButton();
    showStatus(`📡 موقعي: ${lat.toFixed(4)}, ${lon.toFixed(4)} | ${speedKmh} كم/س | دقة: ${acc}م`);

    // ── Save to Supabase every SAVE_INTERVAL_MS ──
    const now = Date.now();
    if (now - lastSavedTime >= SAVE_INTERVAL_MS) {
      lastSavedTime = now;
      if (typeof savePositionToSupabase === 'function') {
        const battLevel = window._batteryLevel || 100;
        savePositionToSupabase(lat, lon, speedKmh, accuracy || 0, battLevel);
      }

      // Check overspeed alert
      if (speedKmh > OVERSPEED_LIMIT && typeof saveAlert === 'function') {
        saveAlert('overspeed', `تجاوز السرعة: ${speedKmh} كم/س`, lat, lon, speedKmh);
      }
    }
  }

  function onSuccess(position) {
    const { latitude, longitude, speed, accuracy } = position.coords;
    updateMarker(latitude, longitude, speed, accuracy);

    // Try to get battery level
    if (navigator.getBattery) {
      navigator.getBattery().then(b => {
        window._batteryLevel = Math.round(b.level * 100);
      });
    }
  }

  function onError(err) {
    let msg = 'تعذّر تحديد الموقع';
    if (err.code === 1) msg = '❌ تم رفض إذن الموقع — افتح الإعدادات';
    else if (err.code === 2) msg = '❌ GPS غير متاح — تأكد من تفعيله';
    else if (err.code === 3) msg = '⏱️ انتهى وقت تحديد الموقع';
    showStatus(msg, 'disconnected');
  }

  function init() {
    injectStyles();

    if (!navigator.geolocation) {
      showStatus('❌ المتصفح لا يدعم GPS', 'disconnected');
      return;
    }

    showStatus('🔍 جاري تحديد موقعك...', 'waiting');

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });

    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    });

    console.log('[RealGPS] 🚀 Started — Device ID:', typeof DEVICE_ID !== 'undefined' ? DEVICE_ID : 'N/A');
  }

  function stop() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  function panToDevice() {
    if (lastLat !== null) {
      const map = window.MapManager && MapManager.getMap ? MapManager.getMap() : null;
      if (map) map.flyTo([lastLat, lastLon], 16, { animate: true, duration: 1.5 });
    }
  }

  return { init, stop, panToDevice };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(RealGPS.init, 2500));
} else {
  setTimeout(RealGPS.init, 2500);
}
