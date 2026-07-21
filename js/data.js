// =============================================
//  FLEET TRACK PRO — Data & Storage Module
// =============================================

const FleetData = (() => {

  function getLocalDateStr(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Simulation bounds (Dhahran / Khobar / Dammam, Saudi Arabia)
  const SAUDI_BOUNDS = {
    lat: { min: 26.10, max: 26.45 },
    lng: { min: 50.00, max: 50.25 }
  };

  const LOCATIONS = [
    { name: 'الظهران — فرع النوفوتيل', lat: 26.375708, lng: 50.149212 },
    { name: 'الخبر — شارع الأمير تركي (الكورنيش)', lat: 26.2902, lng: 50.2188 },
    { name: 'الظهران — شارع الملك عبد العزيز', lat: 26.3142, lng: 50.1362 },
    { name: 'الدمام — طريق الأمير محمد بن فهد', lat: 26.4258, lng: 50.1065 },
    { name: 'الظهران — جامعة الملك فهد (KFUPM)', lat: 26.3040, lng: 50.1474 },
    { name: 'الظهران — مجمع الظهران مول', lat: 26.3082, lng: 50.1630 },
    { name: 'الظهران — مستشفى الظهران العام', lat: 26.2758, lng: 50.1420 },
    { name: 'الظهران — حي الدوحة الشمالي', lat: 26.3315, lng: 50.1215 },
    { name: 'الخبر — حي الحزام الذهبي', lat: 26.3000, lng: 50.2000 },
    { name: 'الخبر — حي الهدا الخبر', lat: 26.3210, lng: 50.1850 },
    { name: 'الخبر — شاطئ نصف القمر', lat: 26.1550, lng: 50.0450 },
    { name: 'الدمام — حي العثيم التجاري', lat: 26.4350, lng: 50.0890 },
    { name: 'الدمام — بحيرة مدن الصناعية', lat: 26.2620, lng: 50.0380 },
    { name: 'الظهران — أرامكو السعودية (السكن)', lat: 26.3005, lng: 50.1298 }
  ];

  const VEHICLE_TYPES = ['سيدان', 'SUV', 'ميني باص', 'شاحنة صغيرة', 'بيك أب'];
  const MAKES = ['تويوتا', 'كيا', 'هيونداي', 'نيسان', 'فورد'];
  const MODELS = {
    'تويوتا': ['كورولا', 'هايلوكس', 'هايلاكس', 'فورتونر'],
    'كيا': ['سيراتو', 'سبورتاج', 'سورنتو'],
    'هيونداي': ['إلنترا', 'توسان', 'سنتافي'],
    'نيسان': ['صني', 'إكس-تريل', 'باترول'],
    'فورد': ['ف-150', 'رينجر', 'إكسبلورر']
  };
  const DRIVER_NAMES = [
    'أحمد محمد علي', 'محمود إبراهيم', 'خالد عبد الله', 'عمر سعيد',
    'يوسف حسن', 'مصطفى كمال', 'سامي فؤاد', 'طارق النجار',
    'رامي حسين', 'بلال شريف'
  ];

  const DEFAULT_VEHICLES = [
    { id: 'v001', name: 'كريم  ر ه س - 4493', plate: 'ر ه س - 4493', serial: '353201350537012', enabled: false, expiresOn: 'تفعيل', make: 'تويوتا', model: 'كورولا', year: 2021, type: 'سيدان', color: '#ef4444', tankCapacity: 55, driverId: 'auto', status: 'offline', speed: 0, fuel: 0, odometer: 152127, engineHours: 0, simNumber: '8996609824113963038', lat: 26.3757, lng: 50.1492 },
    { id: 'v002', name: 'نظام  ر ه س - 4494', plate: 'ر ه س 4494', serial: '352592577533748', enabled: false, expiresOn: 'تفعيل', make: 'كيا', model: 'سبورتاج', year: 2022, type: 'SUV', color: '#3b82f6', tankCapacity: 60, driverId: 'd002', status: 'offline', speed: 0, fuel: 0, odometer: 20000, lat: 26.2902, lng: 50.2188 },
    { id: 'v003', name: 'عيد  ر ه س - 4495', plate: 'ر ه س 4495', serial: '353201350119571', enabled: false, expiresOn: 'تفعيل', make: 'هيونداي', model: 'إلنترا', year: 2020, type: 'سيدان', color: '#10b981', tankCapacity: 50, driverId: 'd003', status: 'offline', speed: 0, fuel: 0, odometer: 30000, lat: 26.3142, lng: 50.1362 },
    { id: 'v004', name: 'اكسنت  ح ه ح 2631', plate: 'ح ه ح 2631', serial: '352592579063827', enabled: false, expiresOn: 'تفعيل', make: 'هيونداي', model: 'إلنترا', year: 2023, type: 'سيدان', color: '#f59e0b', tankCapacity: 50, driverId: 'd004', status: 'offline', speed: 0, fuel: 0, odometer: 15000, lat: 26.4258, lng: 50.1065 },
    { id: 'v005', name: 'د ع م - 7975 فورد', plate: 'د ع م 7975', serial: '352592577536758', enabled: false, expiresOn: 'تفعيل', make: 'فورد', model: 'إكسبلورر', year: 2021, type: 'SUV', color: '#6366f1', tankCapacity: 70, driverId: 'd005', status: 'offline', speed: 0, fuel: 0, odometer: 25000, lat: 26.3040, lng: 50.1474 },
    { id: 'v006', name: 'محمود  ر ه س - 4491', plate: 'ر ه س 4491', serial: '353691840940786', enabled: true, expiresOn: '2027-02-11', make: 'نيسان', model: 'صني', year: 2022, type: 'سيدان', color: '#ec4899', tankCapacity: 45, driverId: 'd006', status: 'moving', speed: 65, fuel: 80, odometer: 45000, lat: 26.3082, lng: 50.1630 },
    { id: 'v007', name: 'عوض  ر ه س - 4492', plate: 'ر ه س 4492', serial: '353691840555907', enabled: true, expiresOn: '2027-02-11', make: 'تويوتا', model: 'هايلوكس', year: 2020, type: 'بيك أب', color: '#14b8a6', tankCapacity: 75, driverId: 'd007', status: 'stopped', speed: 0, fuel: 60, odometer: 120000, lat: 26.2758, lng: 50.1420 },
    { id: 'v008', name: 'احمد السيد  ر ه س - 4496', plate: 'ر ه س 4496', serial: '353691840940703', enabled: true, expiresOn: '2027-02-11', make: 'تويوتا', model: 'كورولا', year: 2023, type: 'سيدان', color: '#8b5cf6', tankCapacity: 55, driverId: 'd008', status: 'idle', speed: 0, fuel: 45, odometer: 9500, lat: 26.3315, lng: 50.1215 },
    { id: 'v009', name: 'ياسين  ر ه س - 4497', plate: 'ر ه س 4497', serial: '353691840552326', enabled: true, expiresOn: '2027-02-11', make: 'كيا', model: 'سيراتو', year: 2022, type: 'سيدان', color: '#f97316', tankCapacity: 50, driverId: 'd009', status: 'moving', speed: 80, fuel: 90, odometer: 28000, lat: 26.3000, lng: 50.2000 },
    { id: 'v010', name: 'عبدالعزيز  س ا ي - 2508', plate: 'س ا ي 2508', serial: '353742372026344', enabled: true, expiresOn: '2026-10-05', make: 'تويوتا', model: 'فورتونر', year: 2021, type: 'SUV', color: '#06b6d4', tankCapacity: 80, driverId: 'd010', status: 'stopped', speed: 0, fuel: 35, odometer: 65000, lat: 26.3210, lng: 50.1850 },
    { id: 'v011', name: 'فينس  س ا ي - 2509', plate: 'س ا ي 2509', serial: '353742372026427', enabled: true, expiresOn: '2026-10-05', make: 'كيا', model: 'سورنتو', year: 2022, type: 'SUV', color: '#4ade80', tankCapacity: 70, driverId: 'd010', status: 'moving', speed: 45, fuel: 50, odometer: 72000, lat: 26.3005, lng: 50.1298 },
    { id: 'v012', name: 'طيبه  محمد مصطفي', plate: 'ط ي ب 1111', serial: '352592577533649', enabled: false, expiresOn: 'تفعيل', make: 'هيونداي', model: 'سنتافي', year: 2021, type: 'SUV', color: '#94a3b8', tankCapacity: 65, driverId: 'd001', status: 'offline', speed: 0, fuel: 0, odometer: 58000, lat: 26.3757, lng: 50.1492 },
    { id: 'v013', name: 'كريس 5075 ح ك أ', plate: 'ح ك أ 5075', serial: '352592577933757', enabled: false, expiresOn: 'تفعيل', make: 'نيسان', model: 'إكس-تريل', year: 2020, type: 'SUV', color: '#f43f5e', tankCapacity: 60, driverId: 'd002', status: 'offline', speed: 0, fuel: 0, odometer: 81000, lat: 26.2902, lng: 50.2188 },
    { id: 'v014', name: 'كيا', plate: 'ك ي ا 9999', serial: '352592577679012', enabled: false, expiresOn: 'تفعيل', make: 'كيا', model: 'سيراتو', year: 2023, type: 'سيدان', color: '#3b82f6', tankCapacity: 50, driverId: 'd003', status: 'offline', speed: 0, fuel: 0, odometer: 12000, lat: 26.3142, lng: 50.1362 }
  ];

  const DEFAULT_DRIVERS = [
    { id: 'd001', name: 'أحمد محمد علي', phone: '01001234567', license: 'A12345678', rating: 4.8, vehicleId: 'v001' },
    { id: 'd002', name: 'محمود إبراهيم', phone: '01112345678', license: 'B23456789', rating: 4.5, vehicleId: 'v002' },
    { id: 'd003', name: 'خالد عبد الله', phone: '01223456789', license: 'C34567890', rating: 4.2, vehicleId: 'v003' },
    { id: 'd004', name: 'عمر سعيد الغامدي', phone: '01534567890', license: 'D45678901', rating: 4.9, vehicleId: 'v004' },
    { id: 'd005', name: 'يوسف حسن طه', phone: '01045678901', license: 'E56789012', rating: 3.8, vehicleId: 'v005' },
    { id: 'd006', name: 'مصطفى كمال', phone: '01156789012', license: 'F67890123', rating: 4.6, vehicleId: 'v006' },
    { id: 'd007', name: 'سامي فؤاد رشدي', phone: '01267890123', license: 'G78901234', rating: 4.3, vehicleId: 'v007' },
    { id: 'd008', name: 'طارق النجار', phone: '01578901234', license: 'H89012345', rating: 4.7, vehicleId: 'v008' },
    { id: 'd009', name: 'رامي حسين محفوظ', phone: '01089012345', license: 'I90123456', rating: 4.4, vehicleId: 'v009' },
    { id: 'd010', name: 'بلال شريف', phone: '01190123456', license: 'J01234567', rating: 4.1, vehicleId: 'v010' },
  ];

  // Generate trip history for the last 7 days
  function generateTripHistory() {
    const history = {};
    const now = new Date();

    DEFAULT_VEHICLES.forEach(v => {
      history[v.id] = [];
      for (let day = 0; day < 7; day++) {
        const dayDate = new Date(now);
        dayDate.setDate(dayDate.getDate() - day);
        const tripCount = Math.floor(Math.random() * 4) + 1;

        for (let t = 0; t < tripCount; t++) {
          const startHour = 7 + t * 3 + Math.floor(Math.random() * 2);
          const startTime = new Date(dayDate);
          startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
          const duration = 20 + Math.floor(Math.random() * 80); // minutes
          const endTime = new Date(startTime.getTime() + duration * 60000);
          const distKm = (5 + Math.random() * 40).toFixed(1);
          const avgSpeed = (30 + Math.random() * 50).toFixed(0);
          const fuelUsed = (distKm * 0.1).toFixed(1);
          const startLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
          const endLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
          const maxSpeed = (parseInt(avgSpeed) + 10 + Math.random() * 30).toFixed(0);

          const stops = [];
          const stopCount = Math.floor(Math.random() * 3);
          for (let s = 0; s < stopCount; s++) {
            const stopLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            const stopTime = new Date(startTime.getTime() + (s + 1) * (duration / (stopCount + 1)) * 60000);
            const stopDuration = 5 + Math.floor(Math.random() * 25);
            stops.push({
              location: stopLoc.name,
              lat: stopLoc.lat + (Math.random() - 0.5) * 0.01,
              lng: stopLoc.lng + (Math.random() - 0.5) * 0.01,
              time: stopTime.toISOString(),
              duration: stopDuration
            });
          }

          history[v.id].push({
            id: `trip_${v.id}_${day}_${t}`,
            vehicleId: v.id,
            date: getLocalDateStr(dayDate),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            startLocation: startLoc.name,
            endLocation: endLoc.name,
            startLat: startLoc.lat,
            startLng: startLoc.lng,
            endLat: endLoc.lat,
            endLng: endLoc.lng,
            distanceKm: parseFloat(distKm),
            avgSpeedKmh: parseInt(avgSpeed),
            maxSpeedKmh: parseInt(maxSpeed),
            fuelUsedL: parseFloat(fuelUsed),
            stops: stops,
            durationMin: duration
          });
        }
      }
    });
    return history;
  }

  // Generate alert history
  function generateAlerts() {
    const alerts = [];
    const types = ['speed', 'geofence', 'stop', 'fuel'];
    const msgs = {
      speed: (v, sp) => `تجاوز السرعة ${sp} كم/س`,
      geofence: (v) => `خروج من المنطقة المحددة`,
      stop: (v) => `توقف غير مبرر لأكثر من 30 دقيقة`,
      fuel: (v) => `انخفاض مستوى الوقود إلى أقل من 20%`
    };
    const now = Date.now();
    for (let i = 0; i < 25; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const veh = DEFAULT_VEHICLES[Math.floor(Math.random() * DEFAULT_VEHICLES.length)];
      const speed = (90 + Math.floor(Math.random() * 50));
      const timeAgo = Math.floor(Math.random() * 86400000 * 3);
      alerts.push({
        id: `alert_${i}`,
        type,
        vehicleId: veh.id,
        vehicleName: veh.name,
        vehiclePlate: veh.plate,
        message: msgs[type](veh, speed),
        timestamp: new Date(now - timeAgo).toISOString(),
        read: Math.random() > 0.4,
        severity: type === 'speed' ? 'high' : type === 'geofence' ? 'medium' : 'low'
      });
    }
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  const DEFAULT_GEOFENCES = [
    { id: 'gf001', name: 'منطقة العمل الرئيسية', type: 'allowed', color: '#22c55e', lat: 30.0620, lng: 31.3280, radius: 2000, active: true },
    { id: 'gf002', name: 'منطقة التخزين — المعادي', type: 'allowed', color: '#3b82f6', lat: 29.9553, lng: 31.2511, radius: 1500, active: true },
    { id: 'gf003', name: 'منطقة محظورة — خارج القاهرة', type: 'forbidden', color: '#ef4444', lat: 30.3000, lng: 31.5000, radius: 5000, active: true },
  ];

  // ===== Initialize / Load from localStorage =====
  function init() {
    const stored = localStorage.getItem('fleet_vehicles');
    if (!stored || JSON.parse(stored).length < 14 || !JSON.parse(stored)[0].serial || !JSON.parse(stored)[0].simNumber) {
      localStorage.setItem('fleet_vehicles', JSON.stringify(DEFAULT_VEHICLES));
      localStorage.removeItem('fleet_history'); // trigger history regeneration
    }
    if (!localStorage.getItem('fleet_drivers')) {
      localStorage.setItem('fleet_drivers', JSON.stringify(DEFAULT_DRIVERS));
    }
    if (!localStorage.getItem('fleet_history')) {
      localStorage.setItem('fleet_history', JSON.stringify(generateTripHistory()));
    }
    if (!localStorage.getItem('fleet_alerts')) {
      localStorage.setItem('fleet_alerts', JSON.stringify(generateAlerts()));
    }
    if (!localStorage.getItem('fleet_geofences')) {
      localStorage.setItem('fleet_geofences', JSON.stringify(DEFAULT_GEOFENCES));
    }
    if (!localStorage.getItem('fleet_templates')) {
      localStorage.setItem('fleet_templates', JSON.stringify([]));
    }
    if (!localStorage.getItem('fleet_kml')) {
      localStorage.setItem('fleet_kml', JSON.stringify([]));
    }
  }

  // ===== CRUD Operations =====
  function getVehicles() { return JSON.parse(localStorage.getItem('fleet_vehicles') || '[]'); }
  function getDrivers() { return JSON.parse(localStorage.getItem('fleet_drivers') || '[]'); }
  function getHistory() { return JSON.parse(localStorage.getItem('fleet_history') || '{}'); }
  function getAlerts() { return JSON.parse(localStorage.getItem('fleet_alerts') || '[]'); }
  function getGeofences() { return JSON.parse(localStorage.getItem('fleet_geofences') || '[]'); }
  function getTemplates() { return JSON.parse(localStorage.getItem('fleet_templates') || '[]'); }
  function getKml() { return JSON.parse(localStorage.getItem('fleet_kml') || '[]'); }

  function saveVehicles(v) { localStorage.setItem('fleet_vehicles', JSON.stringify(v)); }
  function saveDrivers(d) { localStorage.setItem('fleet_drivers', JSON.stringify(d)); }
  function saveAlerts(a) { localStorage.setItem('fleet_alerts', JSON.stringify(a)); }
  function saveGeofences(g) { localStorage.setItem('fleet_geofences', JSON.stringify(g)); }
  function saveTemplates(t) { localStorage.setItem('fleet_templates', JSON.stringify(t)); }
  function saveKml(k) { localStorage.setItem('fleet_kml', JSON.stringify(k)); }

  function getVehicleById(id) { return getVehicles().find(v => v.id === id); }
  function getDriverById(id) { return getDrivers().find(d => d.id === id); }
  function getDriverByVehicle(vehicleId) { return getDrivers().find(d => d.vehicleId === vehicleId); }

  function addVehicle(vehicle) {
    const vehicles = getVehicles();
    vehicle.id = 'v' + Date.now();
    vehicles.push(vehicle);
    saveVehicles(vehicles);
    return vehicle;
  }

  function updateVehicle(id, updates) {
    const vehicles = getVehicles();
    const idx = vehicles.findIndex(v => v.id === id);
    if (idx !== -1) {
      vehicles[idx] = { ...vehicles[idx], ...updates };
      saveVehicles(vehicles);
      return vehicles[idx];
    }
    return null;
  }

  function deleteVehicle(id) {
    const vehicles = getVehicles().filter(v => v.id !== id);
    saveVehicles(vehicles);
  }

  function addAlert(alert) {
    const alerts = getAlerts();
    alert.id = 'alert_' + Date.now();
    alert.timestamp = new Date().toISOString();
    alert.read = false;
    alerts.unshift(alert);
    saveAlerts(alerts);
    return alert;
  }

  function markAlertRead(id) {
    const alerts = getAlerts();
    const alert = alerts.find(a => a.id === id);
    if (alert) { alert.read = true; saveAlerts(alerts); }
  }

  function getUnreadAlertCount() { return getAlerts().filter(a => !a.read).length; }

  function getVehicleHistory(vehicleId, date) {
    const history = getHistory();
    const vh = history[vehicleId] || [];
    if (date) return vh.filter(t => t.date === date);
    return vh;
  }

  function getFleetStats() {
    const vehicles = getVehicles();
    const history = getHistory();
    const today = getLocalDateStr();

    let todayKm = 0, todayFuel = 0;
    vehicles.forEach(v => {
      const todayTrips = (history[v.id] || []).filter(t => t.date === today);
      todayKm += todayTrips.reduce((sum, t) => sum + t.distanceKm, 0);
      todayFuel += todayTrips.reduce((sum, t) => sum + t.fuelUsedL, 0);
    });

    return {
      total: vehicles.length,
      moving: vehicles.filter(v => v.status === 'moving').length,
      stopped: vehicles.filter(v => v.status === 'stopped').length,
      idle: vehicles.filter(v => v.status === 'idle').length,
      offline: vehicles.filter(v => v.status === 'offline').length,
      todayKm: todayKm.toFixed(1),
      todayFuel: todayFuel.toFixed(1),
      alerts: getUnreadAlertCount()
    };
  }

  // Monthly km per vehicle (for charts)
  function getMonthlyStats() {
    const history = getHistory();
    const vehicles = getVehicles();
    const result = {};
    vehicles.forEach(v => {
      result[v.id] = {
        name: v.name,
        km: 0,
        fuel: 0,
        trips: 0
      };
      (history[v.id] || []).forEach(t => {
        result[v.id].km += t.distanceKm;
        result[v.id].fuel += t.fuelUsedL;
        result[v.id].trips++;
      });
    });
    return result;
  }

  // Daily km for the last 7 days (for chart)
  function getDailyKmChart() {
    const history = getHistory();
    const vehicles = getVehicles();
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('ar-EG', { weekday: 'short' });
      labels.push(dayLabel);
      let dayKm = 0;
      vehicles.forEach(v => {
        (history[v.id] || []).filter(t => t.date === dateStr).forEach(t => { dayKm += t.distanceKm; });
      });
      data.push(parseFloat(dayKm.toFixed(1)));
    }
    return { labels, data };
  }

  return {
    init,
    getVehicles, getDrivers, getHistory, getAlerts, getGeofences, getTemplates, getKml,
    saveVehicles, saveDrivers, saveAlerts, saveGeofences, saveTemplates, saveKml,
    getVehicleById, getDriverById, getDriverByVehicle,
    addVehicle, updateVehicle, deleteVehicle,
    addAlert, markAlertRead, getUnreadAlertCount,
    getVehicleHistory, getFleetStats, getMonthlyStats, getDailyKmChart,
    LOCATIONS
  };
})();
