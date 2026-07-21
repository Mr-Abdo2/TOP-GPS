// =============================================
//  FLEET TRACK PRO — Map Module (Leaflet.js)
// =============================================

const MapManager = (() => {
  let map = null;
  let markers = {};
  let trails = {};
  let selectedVehicleId = null;
  let showTrails = false;
  let geofenceCircles = [];
  let routePolyline = null;

  const STATUS_COLORS = {
    moving: '#22c55e',
    stopped: '#ef4444',
    idle: '#f59e0b',
    offline: '#6b7280'
  };

  const STATUS_LABELS = {
    moving: 'يتحرك',
    stopped: 'واقفة',
    idle: 'خامل',
    offline: 'غير متصل'
  };

  function init(containerId) {
    map = L.map(containerId, {
      center: [30.044, 31.235],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // Dark-styled OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Add custom zoom controls
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: '' }).addTo(map);

    // Click on map to deselect
    map.on('click', () => {
      if (selectedVehicleId) {
        deselectVehicle();
        document.dispatchEvent(new CustomEvent('vehicleDeselected'));
      }
    });

    // Auto-save map position whenever the user moves/zooms (for remember_last)
    map.on('moveend', saveLastPosition);

    return map;
  }

  // ─── Startup Position ──────────────────────────────────────────────────────

  let _suppressSavePosition = false;

  /** Persist current center + zoom to localStorage */
  function saveLastPosition() {
    if (_suppressSavePosition || !map) return;
    const center = map.getCenter();
    const zoom   = map.getZoom();
    try {
      localStorage.setItem('map_last_position', JSON.stringify({
        lat: center.lat,
        lng: center.lng,
        zoom
      }));
    } catch (e) {}
  }

  /**
   * Apply the chosen startup behaviour.
   * @param {'remember_last'|'fit_all'|'default'} mode
   */
  function applyStartupPosition(mode) {
    if (!map) return;

    // Suppress auto-save while we programmatically position the map
    _suppressSavePosition = true;

    if (mode === 'remember_last') {
      try {
        const saved = JSON.parse(localStorage.getItem('map_last_position'));
        if (saved && saved.lat !== undefined) {
          map.setView([saved.lat, saved.lng], saved.zoom, { animate: false });
          _suppressSavePosition = false;
          return;
        }
      } catch (e) {}
      // Fall through to fit_all if nothing saved yet
      fitAllVehicles();

    } else if (mode === 'fit_all') {
      fitAllVehicles();

    } else {
      // 'default' — hard-coded starting point
      map.setView([30.044, 31.235], 11, { animate: false });
    }

    _suppressSavePosition = false;
  }

  // ─── Icon Size ──────────────────────────────────────────────────────────────

  /** Read the saved icon-size percentage and convert to a 0..N scale factor */
  function getIconScale() {
    try {
      const cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
      const pct = parseInt(cfg.mapIconSize, 10);
      if (!isNaN(pct) && pct > 0) return pct / 100;
    } catch (e) {}
    return 1; // default 100%
  }

  function createMarkerIcon(vehicle) {
    const color   = STATUS_COLORS[vehicle.status] || '#6b7280';
    const state   = TrackingEngine.getVehicleState(vehicle.id);
    const heading = state ? (state.heading || 0) : 0;
    const scale   = getIconScale();

    const base   = 32;
    const sz     = Math.round(base * scale);       // e.g. 32 → 40 at 125%
    const dot    = Math.round(6  * scale);
    const dotOff = Math.round(13 * scale);
    const labelTop = Math.round(34 * scale);
    const fontSize = Math.max(7, Math.round(9 * scale));
    const anchor = Math.round(sz / 2);

    const html = `
      <div class="traccar-marker-wrap" style="
        width: ${sz}px; height: ${sz}px;
        display: flex; align-items: center; justify-content: center;
        position: relative;
        cursor: pointer;
      ">
        <svg width="${sz}" height="${sz}" viewBox="0 0 32 32" fill="none"
             xmlns="http://www.w3.org/2000/svg" style="
          transform: rotate(${heading}deg);
          transform-origin: 50% 50%;
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
        ">
          <path d="M16 3L6 27L16 21L26 27L16 3" fill="${color}" stroke="white"
                stroke-width="2.5" stroke-linejoin="round"/>
        </svg>
        <div style="
          position: absolute; width: ${dot}px; height: ${dot}px;
          background: white; border-radius: 50%;
          top: ${dotOff}px; left: ${dotOff}px;
        "></div>
      </div>
      <div style="
        position: absolute; top: ${labelTop}px; left: 50%; transform: translateX(-50%);
        background: rgba(13,19,35,0.9); color: #f0f4ff;
        font-size: ${fontSize}px; font-weight: 700;
        padding: 2px 6px; border-radius: 4px;
        white-space: nowrap;
        font-family: 'Cairo', sans-serif;
        border: 1px solid rgba(255,255,255,0.07);
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      ">${vehicle.plate}</div>`;

    return L.divIcon({
      html,
      className: '',
      iconSize:    [sz, sz],
      iconAnchor:  [anchor, anchor],
      popupAnchor: [0, -Math.round(18 * scale)]
    });
  }

  /**
   * Re-render every existing vehicle marker with the current icon-size setting.
   * Call this right after saving UI settings.
   */
  function applyIconSize() {
    const vehicles = FleetData.getVehicles();
    vehicles.forEach(v => {
      if (markers[v.id]) {
        markers[v.id].setIcon(createMarkerIcon(v));
      }
    });
  }

  function createPopupContent(vehicle) {
    const driver = FleetData.getDriverByVehicle(vehicle.id);
    const state = TrackingEngine.getVehicleState(vehicle.id);
    const lastStop = TrackingEngine.getFormattedLastStop(vehicle.id);
    const statusLabel = STATUS_LABELS[vehicle.status] || vehicle.status;
    const statusColor = STATUS_COLORS[vehicle.status] || '#6b7280';
    const fuelPct = vehicle.fuel;
    const fuelColor = fuelPct > 50 ? '#22c55e' : fuelPct > 20 ? '#f59e0b' : '#ef4444';

    return `
      <div class="vehicle-popup" dir="rtl">
        <div class="popup-header">
          <div class="popup-status ${vehicle.status}" style="background:${statusColor}"></div>
          <div class="popup-name">${vehicle.name}</div>
          <span style="font-size:10px;background:${statusColor}22;color:${statusColor};padding:2px 8px;border-radius:10px;font-weight:700;">${statusLabel}</span>
        </div>
        <div class="popup-row"><span>🪪 اللوحة</span><span>${vehicle.plate}</span></div>
        <div class="popup-row"><span>🚗 النوع</span><span>${vehicle.make} ${vehicle.model} ${vehicle.year}</span></div>
        <div class="popup-row"><span>👤 السائق</span><span>${driver ? driver.name : 'غير محدد'}</span></div>
        <div class="popup-row"><span>⚡ السرعة</span><span style="color:${vehicle.speed > 80 ? '#ef4444' : '#22c55e'}">${vehicle.speed} كم/س</span></div>
        <div class="popup-row"><span>⛽ الوقود</span><span style="color:${fuelColor}">${fuelPct}%</span></div>
        <div class="popup-row"><span>📍 آخر توقف</span><span>${lastStop.time}</span></div>
        <div class="popup-row"><span>📌 المكان</span><span>${lastStop.location.substring(0, 20)}...</span></div>
        <div style="margin-top:8px;height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${fuelPct}%;background:${fuelColor};border-radius:3px;transition:width 0.3s;"></div>
        </div>
        <div class="popup-actions">
          <button class="popup-btn primary" onclick="selectVehicleFromMap('${vehicle.id}')">📊 التفاصيل</button>
          <button class="popup-btn secondary" onclick="focusVehicleOnMap('${vehicle.id}')">🎯 تتبع</button>
        </div>
      </div>`;
  }

  function addVehicleMarker(vehicle) {
    const icon = createMarkerIcon(vehicle);
    const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
      .bindPopup(createPopupContent(vehicle), {
        maxWidth: 280,
        className: 'fleet-popup'
      })
      .addTo(map);

    marker.on('click', () => {
      selectVehicle(vehicle.id);
      document.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: vehicle.id } }));
    });

    markers[vehicle.id] = marker;
    trails[vehicle.id] = [];
    return marker;
  }

  function updateVehicleMarker(vehicle) {
    if (!markers[vehicle.id]) {
      addVehicleMarker(vehicle);
      return;
    }

    const marker = markers[vehicle.id];
    const newLatLng = L.latLng(vehicle.lat, vehicle.lng);

    // Smooth position update
    marker.setLatLng(newLatLng);
    marker.setIcon(createMarkerIcon(vehicle));

    // Update popup if open
    if (marker.isPopupOpen()) {
      marker.setPopupContent(createPopupContent(vehicle));
    }

    // Update trail
    if (showTrails) {
      trails[vehicle.id].push([vehicle.lat, vehicle.lng]);
      if (trails[vehicle.id].length > 30) trails[vehicle.id].shift();
      drawTrail(vehicle.id);
    }

    // Follow selected vehicle
    if (selectedVehicleId === vehicle.id && vehicle.status === 'moving') {
      map.panTo(newLatLng, { animate: true, duration: 0.5 });
    }
  }

  let trailLines = {};
  function drawTrail(vehicleId) {
    if (trailLines[vehicleId]) {
      map.removeLayer(trailLines[vehicleId]);
    }
    if (trails[vehicleId] && trails[vehicleId].length > 1) {
      const v = FleetData.getVehicleById(vehicleId);
      trailLines[vehicleId] = L.polyline(trails[vehicleId], {
        color: v ? v.color : '#3b82f6',
        weight: 2,
        opacity: 0.6,
        dashArray: '4 4'
      }).addTo(map);
    }
  }

  function selectVehicle(id) {
    selectedVehicleId = id;
    // Highlight marker
    Object.keys(markers).forEach(vid => {
      const el = markers[vid].getElement();
      if (el) {
        el.style.zIndex = vid === id ? '1000' : '600';
      }
    });
  }

  function deselectVehicle() {
    selectedVehicleId = null;
    if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
  }

  function focusVehicle(id) {
    const v = FleetData.getVehicleById(id);
    if (!v) return;
    map.setView([v.lat, v.lng], 16, { animate: true, duration: 1 });
    markers[id]?.openPopup();
    selectVehicle(id);
  }

  function fitAllVehicles() {
    const vehicles = FleetData.getVehicles().filter(v => v.lat && v.lng);
    if (vehicles.length === 0) return;
    const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lng]));
    map.fitBounds(bounds.pad(0.1), { animate: true, duration: 0.8 });
  }

  function toggleTrails() {
    showTrails = !showTrails;
    if (!showTrails) {
      Object.keys(trailLines).forEach(id => {
        if (trailLines[id]) map.removeLayer(trailLines[id]);
      });
      trailLines = {};
    }
    return showTrails;
  }

  function drawGeofences() {
    geofenceCircles.forEach(c => map.removeLayer(c));
    geofenceCircles = [];
    const geofences = FleetData.getGeofences();
    geofences.forEach(gf => {
      if (!gf.active) return;
      const circle = L.circle([gf.lat, gf.lng], {
        radius: gf.radius,
        color: gf.color,
        fillColor: gf.color,
        fillOpacity: 0.08,
        weight: 2,
        dashArray: gf.type === 'forbidden' ? '8 4' : '4 4'
      }).addTo(map);
      circle.bindTooltip(gf.name, {
        permanent: false,
        direction: 'center',
        className: 'geofence-tooltip'
      });
      geofenceCircles.push(circle);
    });
  }

  function drawRoutePlayback(trips) {
    if (routePolyline) { map.removeLayer(routePolyline); }
    if (!trips || trips.length === 0) return;

    const points = [];
    trips.forEach(t => {
      points.push([t.startLat, t.startLng]);
      if (t.stops) {
        t.stops.forEach(s => points.push([s.lat, s.lng]));
      }
      points.push([t.endLat, t.endLng]);
    });

    routePolyline = L.polyline(points, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8
    }).addTo(map);

    // Add start/stop markers
    if (points.length > 0) {
      L.marker(points[0], {
        icon: L.divIcon({
          html: '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
          className: '', iconSize: [14, 14], iconAnchor: [7, 7]
        })
      }).addTo(map).bindTooltip('بداية الرحلة');

      L.marker(points[points.length - 1], {
        icon: L.divIcon({
          html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
          className: '', iconSize: [14, 14], iconAnchor: [7, 7]
        })
      }).addTo(map).bindTooltip('نهاية الرحلة');
    }

    // Add stop markers
    trips.forEach(t => {
      (t.stops || []).forEach(s => {
        L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            html: '<div style="background:#f59e0b;width:10px;height:10px;border-radius:50%;border:2px solid white;"></div>',
            className: '', iconSize: [10, 10], iconAnchor: [5, 5]
          })
        }).addTo(map).bindTooltip(`توقف: ${s.duration} دقيقة`);
      });
    });

    map.fitBounds(routePolyline.getBounds().pad(0.1));
  }

  function toggleVehicleVisibility(id, isVisible) {
    const marker = markers[id];
    if (!marker) return;
    if (isVisible) {
      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }
    } else {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    }
  }

  let customMarkers = [];

  function addCustomMarker(loc) {
    let iconHtml = '';
    if (loc.type === 'default') {
      iconHtml = `
        <div style="position: relative; width: 30px; height: 38px;">
          <svg width="30" height="38" viewBox="0 0 24 30" style="position: absolute; top:0; left:0;">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9.6 12 18 12 18s12-8.4 12-18c0-6.6-5.4-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="#34a853"/>
          </svg>
          <div style="position: absolute; top: 9px; left: 8px; width: 14px; height: 14px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 9px;">
            ${loc.symbol}
          </div>
        </div>
      `;
    } else {
      iconHtml = `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #ffffff; border: 2px solid #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
          ${loc.symbol}
        </div>
      `;
    }

    const icon = L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [32, 38],
      iconAnchor: [16, 38]
    });

    const marker = L.marker([loc.lat, loc.lng], { icon })
      .bindPopup(`<div style="font-family:'Cairo', sans-serif; font-size:12px; font-weight:700; text-align:right;" dir="rtl">📍 ${loc.name}<br><span style="font-size:10px; font-weight:normal; color:#64748b;">${loc.desc || ''}</span></div>`)
      .addTo(map);

    customMarkers.push(marker);
  }

  function clearAllCustomMarkers() {
    customMarkers.forEach(m => map.removeLayer(m));
    customMarkers = [];
  }

  function getMap() { return map; }
  function getSelectedVehicle() { return selectedVehicleId; }

  return {
    init,
    addVehicleMarker,
    updateVehicleMarker,
    selectVehicle,
    deselectVehicle,
    focusVehicle,
    fitAllVehicles,
    toggleTrails,
    drawGeofences,
    drawRoutePlayback,
    getMap,
    getSelectedVehicle,
    toggleVehicleVisibility,
    addCustomMarker,
    clearAllCustomMarkers,
    applyStartupPosition,
    applyIconSize
  };
})();

// Global callbacks for popup buttons
function selectVehicleFromMap(id) {
  document.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id, openPanel: true } }));
}
function focusVehicleOnMap(id) {
  MapManager.focusVehicle(id);
}
