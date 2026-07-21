// =============================================
//  FLEET TRACK PRO — GPS Simulation Engine
// =============================================

const TrackingEngine = (() => {
  const tabId = Math.random().toString(36).substring(2, 10);
  let intervalId = null;
  let listeners = [];
  const TICK_MS = 4000; // Update every 4 seconds

  // Vehicle movement state (runtime, not persisted)
  let vehicleState = {};

  // Route waypoints for moving vehicles
  const ROUTES = {
    'v001': [
      [30.0620, 31.3280], [30.0650, 31.3320], [30.0700, 31.3350],
      [30.0750, 31.3300], [30.0720, 31.3250], [30.0680, 31.3200],
      [30.0640, 31.3230], [30.0620, 31.3280]
    ],
    'v004': [
      [30.0649, 31.2178], [30.0600, 31.2150], [30.0550, 31.2100],
      [30.0500, 31.2050], [30.0480, 31.2100], [30.0510, 31.2160],
      [30.0580, 31.2190], [30.0649, 31.2178]
    ],
    'v006': [
      [30.0072, 31.4635], [30.0100, 31.4600], [30.0150, 31.4550],
      [30.0130, 31.4500], [30.0080, 31.4520], [30.0050, 31.4580],
      [30.0072, 31.4635]
    ],
    'v008': [
      [30.0793, 31.2180], [30.0820, 31.2200], [30.0860, 31.2220],
      [30.0880, 31.2180], [30.0850, 31.2140], [30.0810, 31.2150],
      [30.0793, 31.2180]
    ]
  };

  function initState() {
    const vehicles = FleetData.getVehicles();
    vehicles.forEach(v => {
      vehicleState[v.id] = {
        lat: v.lat,
        lng: v.lng,
        speed: v.speed,
        status: v.status,
        fuel: v.fuel,
        waypointIdx: 0,
        stopTimer: 0,
        heading: Math.random() * 360,
        lastStopTime: new Date().toISOString(),
        lastStopLocation: 'مدينة نصر',
        tripDistanceToday: Math.random() * 120,
        fuelConsumedToday: Math.random() * 15
      };
    });
  }

  function tick() {
    const vehicles = FleetData.getVehicles();
    const updates = [];

    vehicles.forEach(v => {
      if (v.status === 'offline') return;

      const state = vehicleState[v.id] || {
        lat: v.lat, lng: v.lng, speed: 0, status: v.status,
        fuel: v.fuel, waypointIdx: 0, heading: 0, stopTimer: 0,
        tripDistanceToday: 0, fuelConsumedToday: 0
      };
      vehicleState[v.id] = state;

      // Simulate position change for moving vehicles
      if (state.status === 'moving') {
        if (ROUTES[v.id]) {
          // Follow predefined route
          const route = ROUTES[v.id];
          const nextIdx = (state.waypointIdx + 1) % route.length;
          const target = route[nextIdx];
          const dlat = target[0] - state.lat;
          const dlng = target[1] - state.lng;
          const dist = Math.sqrt(dlat * dlat + dlng * dlng);

          if (dist < 0.001) {
            state.waypointIdx = nextIdx;
          } else {
            const step = 0.0015;
            state.lat += (dlat / dist) * step;
            state.lng += (dlng / dist) * step;
            state.heading = Math.atan2(dlng, dlat) * 180 / Math.PI;
          }
        } else {
          // Random walk
          const angle = state.heading + (Math.random() - 0.5) * 30;
          state.heading = angle;
          const rad = angle * Math.PI / 180;
          state.lat += Math.cos(rad) * 0.001;
          state.lng += Math.sin(rad) * 0.001;

          // Clamp to Dhahran / Khobar / Dammam bounds
          state.lat = Math.max(26.10, Math.min(26.45, state.lat));
          state.lng = Math.max(50.00, Math.min(50.25, state.lng));
        }

        // Vary speed
        state.speed = Math.max(20, Math.min(120, state.speed + (Math.random() - 0.5) * 15));

        // Consume fuel
        const fuelRate = 0.00003 * state.speed;
        state.fuel = Math.max(0, state.fuel - fuelRate);
        state.tripDistanceToday += state.speed * (TICK_MS / 3600000);
        state.fuelConsumedToday += fuelRate * state.speed;

        // Randomly stop sometimes
        if (Math.random() < 0.02) {
          state.status = 'stopped';
          state.speed = 0;
          state.stopTimer = 0;
          state.lastStopTime = new Date().toISOString();
          const locs = FleetData.LOCATIONS;
          state.lastStopLocation = locs[Math.floor(Math.random() * locs.length)].name;
        }

        // Fuel alert
        if (state.fuel < 20 && state.fuel > 18) {
          FleetData.addAlert({
            type: 'fuel',
            vehicleId: v.id,
            vehicleName: v.name,
            vehiclePlate: v.plate,
            message: `انخفاض مستوى الوقود إلى ${Math.round(state.fuel)}%`,
            severity: 'medium'
          });
          emitEvent('alert', { type: 'fuel', vehicle: v.name });
        }

        // Speed alert
        if (state.speed > 100) {
          if (Math.random() < 0.1) {
            FleetData.addAlert({
              type: 'speed',
              vehicleId: v.id,
              vehicleName: v.name,
              vehiclePlate: v.plate,
              message: `تجاوز السرعة المقررة — ${Math.round(state.speed)} كم/س`,
              severity: 'high'
            });
            emitEvent('alert', { type: 'speed', vehicle: v.name, speed: Math.round(state.speed) });
          }
        }

      } else if (state.status === 'stopped') {
        state.speed = 0;
        state.stopTimer = (state.stopTimer || 0) + TICK_MS / 1000;

        // Resume moving after some time
        if (state.stopTimer > 60 + Math.random() * 120) {
          state.status = 'moving';
          state.speed = 20 + Math.random() * 30;
          state.stopTimer = 0;
        }

        // Long stop alert (fire once when timer crosses 2 minutes)
        if (state.stopTimer >= 120 && state.stopTimer < 120 + TICK_MS / 1000) {
          FleetData.addAlert({
            type: 'stop',
            vehicleId: v.id,
            vehicleName: v.name,
            vehiclePlate: v.plate,
            message: `توقف طويل — ${Math.round(state.stopTimer / 60)} دقيقة في ${state.lastStopLocation || 'موقع غير معروف'}`,
            severity: 'low'
          });
        }

      } else if (state.status === 'idle') {
        state.speed = 0;
        // Occasionally start moving
        if (Math.random() < 0.01) {
          state.status = 'moving';
          state.speed = 15 + Math.random() * 20;
        }
      }

      // Update vehicle in storage
      FleetData.updateVehicle(v.id, {
        lat: state.lat,
        lng: state.lng,
        speed: Math.round(state.speed),
        fuel: parseFloat(state.fuel.toFixed(1)),
        status: state.status
      });

      updates.push({ id: v.id, lat: state.lat, lng: state.lng, speed: state.speed, status: state.status, fuel: state.fuel, heading: state.heading });
    });

    localStorage.setItem('fleet_vehicle_state', JSON.stringify(vehicleState));
    emitEvent('tick', updates);
  }

  function emitEvent(type, data) {
    listeners.forEach(l => {
      if (l.type === type || l.type === '*') {
        try { l.callback(data); } catch(e) { console.error('Listener error:', e); }
      }
    });
  }

  let isLeader = false;
  let electionIntervalId = null;

  function checkLeaderElection() {
    const now = Date.now();
    let heartbeat = { timestamp: 0, leaderId: '' };
    try {
      heartbeat = JSON.parse(localStorage.getItem('simulation_heartbeat') || '{}');
    } catch (e) {}

    const hbTime = heartbeat.timestamp || 0;
    const hbLeader = heartbeat.leaderId || '';

    // If heartbeat is fresh (less than 6 seconds) AND written by another tab:
    if (now - hbTime < 6000 && hbLeader !== tabId) {
      if (isLeader) {
        console.log('🔌 Demoting to follower, another active tab is simulating.');
        isLeader = false;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    } else {
      // Elect ourselves as leader
      if (!isLeader) {
        console.log('👑 Elected as simulation leader.');
        isLeader = true;
      }
      // Update heartbeat
      localStorage.setItem('simulation_heartbeat', JSON.stringify({
        timestamp: now,
        leaderId: tabId
      }));
      if (!intervalId) {
        intervalId = setInterval(tick, TICK_MS);
      }
    }
  }

  // Listen for storage updates in other tabs
  window.addEventListener('storage', (e) => {
    if (isLeader) return; // Leader tab updates internally

    if (e.key === 'fleet_vehicles') {
      try {
        const vehicles = JSON.parse(e.newValue);
        const updates = vehicles.map(v => ({
          id: v.id,
          lat: v.lat,
          lng: v.lng,
          speed: v.speed,
          status: v.status,
          fuel: v.fuel,
          heading: v.heading || 0
        }));
        emitEvent('tick', updates);
      } catch (err) {
        console.error('Error parsing storage fleet_vehicles:', err);
      }
    } else if (e.key === 'fleet_vehicle_state') {
      try {
        vehicleState = JSON.parse(e.newValue || '{}');
      } catch (err) {
        console.error('Error parsing storage fleet_vehicle_state:', err);
      }
    } else if (e.key === 'fleet_alerts') {
      if (window.AlertsManager) {
        AlertsManager.updateAlertBadge();
        AlertsManager.renderAlertsList('sidebar-alerts-list');
        
        try {
          const alerts = JSON.parse(e.newValue || '[]');
          if (alerts.length > 0) {
            alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const newest = alerts[0];
            const timeDiff = Date.now() - new Date(newest.timestamp).getTime();
            if (timeDiff < 4000 && !newest.read) {
              const icons = { fuel: '⛽', speed: '🚨', geofence: '🏁', stop: '⏸️' };
              const types = { fuel: 'warning', speed: 'error', geofence: 'warning', stop: 'warning' };
              AlertsManager.showToast(
                `${newest.vehicleName}: ${newest.message}`, 
                types[newest.type] || 'warning', 
                icons[newest.type] || '⚠️'
              );
            }
          }
        } catch (err) {
          console.error('Error parsing storage fleet_alerts:', err);
        }
      }
    }
  });

  function on(type, callback) {
    const id = Date.now() + Math.random();
    listeners.push({ id, type, callback });
    return id;
  }

  function off(id) {
    listeners = listeners.filter(l => l.id !== id);
  }

  function start() {
    initState();
    checkLeaderElection();
    if (!electionIntervalId) {
      electionIntervalId = setInterval(checkLeaderElection, 2500);
    }
    console.log('🚗 Tracking engine started (synced)');
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (electionIntervalId) {
      clearInterval(electionIntervalId);
      electionIntervalId = null;
    }
  }

  function isRunning() { return intervalId !== null || electionIntervalId !== null; }

  function getVehicleState(id) { return vehicleState[id]; }

  function getFormattedLastStop(vehicleId) {
    const state = vehicleState[vehicleId];
    if (!state || !state.lastStopTime) return { time: 'غير متاح', location: 'غير متاح', duration: '-' };
    const stopDate = new Date(state.lastStopTime);
    const now = new Date();
    const diffMin = Math.round((now - stopDate) / 60000);
    const timeStr = stopDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const diffStr = diffMin < 60
      ? `منذ ${diffMin} دقيقة`
      : `منذ ${Math.floor(diffMin / 60)} ساعة و${diffMin % 60} دقيقة`;
    return {
      time: timeStr,
      location: state.lastStopLocation || 'غير معروف',
      duration: diffStr
    };
  }

  return { start, stop, isRunning, on, off, getVehicleState, getFormattedLastStop };
})();
