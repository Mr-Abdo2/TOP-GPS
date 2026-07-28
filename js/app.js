// =============================================
//  FLEET TRACK PRO — Main App Controller
// =============================================

const App = (() => {
  let selectedVehicleId = null;
  let clockInterval = null;
  let selectedUiItems = [];

  const TRANSLATIONS = {
    'ar': {
      'fleet_tracking_system': 'نظام تتبع الأسطول',
      'moving': 'يتحرك',
      'stopped': 'واقف',
      'idle': 'خامل',
      'live_tracking': 'التتبع الحي',
      'dashboard': 'لوحة التحكم',
      'admin': 'الإدارة',
      'vehicles_mgmt': 'إدارة السيارات',
      'drivers': 'السائقون',
      'analytics_section': 'التحليل',
      'trip_history': 'تاريخ الرحلات',
      'reports': 'التقارير',
      'alerts': 'التنبيهات',
      'settings_section': 'الإعدادات',
      'geofence': 'مناطق الجيوفنس',
      'general_settings': 'الإعدادات العامة',
      'fleet_manager': 'مدير الأسطول',
      'online_now': 'متصل الآن',
      'clear_cache': '🧹 مسح الكاش وتحديث',
      'main_dashboard': 'لوحة التحكم الرئيسية',
      'realtime_tracking': 'تتبع الأسطول في الوقت الفعلي',
      'live': 'بث حي',
      'data': 'معطيات',
      'chart': 'رسم بياني',
      'messages': 'رسائل',
      'no_data_select': 'اضغط على سيارة لعرض معطيات والتفاصيل الحية',
      'vehicles': 'المركبات',
      'events': 'الأحداث',
      'places': 'أماكن',
      'history': 'تاريخ',
      'search': 'ابحث عن سيارة...',
      'status': '📈 حالة',
      'sim': '💳 SIM رقم بطاقة',
      'odometer': '⏱️ عداد المسافات',
      'plate': '🪪 لوحة',
      'time_pos': '🕒 Time (position)',
      'time_server': '🕒 Time (server)',
      'closest_zone': '📍 أقرب منطقة',
      'altitude': '⛰️ ارتفاع',
      'speed': '⚡ السرعة',
      'angle': '🧭 زاوية',
      'address': '🏠 عنوان',
      'position': '📍 موقف',
      'coordinates': '📍 موقع',
      'closest_marker': '🏁 أقرب علامة',
      'engine': '🔑 Engine',
      'crash': '⚠️ Crash detection',
      'green': '🛡️ Green driving',
      'power_cut': '⚡ انقطاع التيار الكهربائي',
      'device_cut': '📴 فصل الجهاز',
      'driver': '👤 السائق الحالي',
      'driver_phone': '📞 رقم السائق',
      'driver_rating': '⭐ تقييم السائق',
      'offline': 'غير متصل',
      'idle_live': 'خامل / بث حي',
      'moving_label': 'متحرك',
      'safe_driving': 'قيادة آمنة',
      'power_connected': 'تيار موصول',
      'not_disconnected': 'غير مفصول',
      'not_defined': 'غير محدد',
      'no_markers_close': 'لا توجد علامات قريبة',
      'no_data_selected': 'لا توجد معطيات محددة للعرض'
    },
    'en': {
      'fleet_tracking_system': 'Fleet Tracking System',
      'moving': 'Moving',
      'stopped': 'Stopped',
      'idle': 'Idle',
      'live_tracking': 'Live Tracking',
      'dashboard': 'Dashboard',
      'admin': 'Administration',
      'vehicles_mgmt': 'Vehicles Management',
      'drivers': 'Drivers',
      'analytics_section': 'Analytics',
      'trip_history': 'Trip History',
      'reports': 'Reports',
      'alerts': 'Alerts',
      'settings_section': 'Settings',
      'geofence': 'Geofences',
      'general_settings': 'General Settings',
      'fleet_manager': 'Fleet Manager',
      'online_now': 'Online Now',
      'clear_cache': '🧹 Clear Cache & Reload',
      'main_dashboard': 'Main Dashboard',
      'realtime_tracking': 'Real-time Fleet Tracking',
      'live': 'Live',
      'data': 'Data',
      'chart': 'Chart',
      'messages': 'Messages',
      'no_data_select': 'Click on a vehicle to view coordinates and live details',
      'vehicles': 'Vehicles',
      'events': 'Events',
      'places': 'Places',
      'history': 'History',
      'search': 'Search vehicle...',
      'status': '📈 Status',
      'sim': '💳 SIM Card No.',
      'odometer': '⏱️ Odometer',
      'plate': '🪪 Plate',
      'time_pos': '🕒 Time (position)',
      'time_server': '🕒 Time (server)',
      'closest_zone': '📍 Closest Zone',
      'altitude': '⛰️ Altitude',
      'speed': '⚡ Speed',
      'angle': '🧭 Angle',
      'address': '🏠 Address',
      'position': '📍 Position',
      'coordinates': '📍 Coordinates',
      'closest_marker': '🏁 Closest Marker',
      'engine': '🔑 Engine',
      'crash': '⚠️ Crash Detection',
      'green': '🛡️ Green Driving',
      'power_cut': '⚡ Power Outage',
      'device_cut': '📴 Device Disconnect',
      'driver': '👤 Current Driver',
      'driver_phone': '📞 Driver Phone',
      'driver_rating': '⭐ Driver Rating',
      'offline': 'Offline',
      'idle_live': 'Idle / Live',
      'moving_label': 'Moving',
      'safe_driving': 'Safe Driving',
      'power_connected': 'Power Connected',
      'not_disconnected': 'Not Disconnected',
      'not_defined': 'Not Defined',
      'no_markers_close': 'No close markers',
      'no_data_selected': 'No data items selected for display'
    }
  };

  function translate(key) {
    try {
      const cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
      const lang = cfg.lang || 'ar';
      const actualLang = lang === 'ar' ? 'ar' : 'en';
      return TRANSLATIONS[actualLang][key] || key;
    } catch(e) {
      return TRANSLATIONS['ar'][key] || key;
    }
  }

  function getLocalDateStr(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ===== Initialize =====
  function init() {
    FleetData.init();
    renderSidebar();
    renderTopbar();
    renderDashboard();
    applyLanguage();
    startClock();

    // Apply saved panel position (left / right / hidden)
    applyDataListPosition();

    // Init map
    MapManager.init('main-map');
    MapManager.drawGeofences();

    // Load vehicles onto map
    const vehicles = FleetData.getVehicles();
    vehicles.forEach(v => MapManager.addVehicleMarker(v));

    // Apply startup position based on user preference
    try {
      const uiCfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
      const startupMode = uiCfg.mapStartupPosition || 'remember_last';
      MapManager.applyStartupPosition(startupMode);
    } catch (e) {
      MapManager.fitAllVehicles();
    }

    // Init alerts
    AlertsManager.init();

    // Start tracking engine
    TrackingEngine.start();

    // Listen for tracking updates
    TrackingEngine.on('tick', (updates) => {
      updates.forEach(u => {
        const v = FleetData.getVehicleById(u.id);
        if (v) MapManager.updateVehicleMarker(v);
      });
      refreshVehicleList();
      refreshKPIs();
      refreshSidebarStatus();
      
      // Auto refresh events if the events tab is open
      const eventsTab = document.getElementById('tab-events');
      if (eventsTab && eventsTab.style.display !== 'none') {
        refreshEventsTab();
      }
    });

    // Listen for vehicle selection events
    document.addEventListener('vehicleSelected', (e) => {
      selectVehicle(e.detail.id);
      openVehicleDetailPanel(e.detail.id);
    });
    document.addEventListener('vehicleDeselected', () => {
      closeVehicleDetailPanel();
      selectedVehicleId = null;
    });

    // Search filter
    const searchInput = document.getElementById('vehicle-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterVehicleList(e.target.value);
      });
    }
  }

  // ===== Clock =====
  function startClock() {
    function update() {
      const el = document.getElementById('topbar-time');
      if (el) {
        const now = new Date();
        el.textContent = now.toLocaleString('ar-EG', {
          weekday: 'long', day: 'numeric', month: 'long',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      }
    }
    update();
    clockInterval = setInterval(update, 1000);
  }

  // ===== Render Sidebar =====
  function renderSidebar() {
    const stats = FleetData.getFleetStats();
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-icon">🚗</div>
        <div class="logo-text">
          <h1>Fleet Track Pro</h1>
          <span>نظام تتبع الأسطول</span>
        </div>
      </div>
      <div class="fleet-status-mini">
        <div class="status-badge moving"><span class="count" id="sb-moving">${stats.moving}</span>يتحرك</div>
        <div class="status-badge stopped"><span class="count" id="sb-stopped">${stats.stopped}</span>واقف</div>
        <div class="status-badge idle"><span class="count" id="sb-idle">${stats.idle + stats.offline}</span>خامل</div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-title">التتبع الحي</div>
        <a class="nav-item active" href="index.html" id="nav-dashboard">
          <span class="nav-icon">🗺️</span> لوحة التحكم
        </a>
        <div class="nav-section-title">الإدارة</div>
        <a class="nav-item" href="pages/vehicles.html" id="nav-vehicles">
          <span class="nav-icon">🚗</span> إدارة السيارات
        </a>
        <a class="nav-item" href="pages/drivers.html" id="nav-drivers">
          <span class="nav-icon">👤</span> السائقون
        </a>
        <div class="nav-section-title">التحليل</div>
        <a class="nav-item" href="pages/history.html" id="nav-history">
          <span class="nav-icon">📍</span> تاريخ الرحلات
        </a>
        <a class="nav-item" href="pages/reports.html" id="nav-reports">
          <span class="nav-icon">📊</span> التقارير
        </a>
        <a class="nav-item" href="pages/alerts.html" id="nav-alerts">
          <span class="nav-icon">🔔</span> التنبيهات
          <span class="nav-badge" id="alert-nav-badge" style="display:none">${stats.alerts}</span>
        </a>
        <div class="nav-section-title">الإعدادات</div>
        <a class="nav-item" href="pages/geofence.html" id="nav-geofence">
          <span class="nav-icon">🏁</span> مناطق الجيوفنس
        </a>
        <a class="nav-item" href="javascript:void(0)" onclick="App.openSettingsMainModal()" id="nav-settings-main">
          <span class="nav-icon">⚙️</span> الإعدادات العامة
        </a>
        <a class="nav-item" href="pages/account.html" id="nav-account">
          <span class="nav-icon">👤</span> حسابي
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">م</div>
          <div class="user-info">
            <h4>مدير الأسطول</h4>
            <span>متصل الآن</span>
          </div>
          <div style="font-size:10px;color:var(--green)">●</div>
        </div>
      </div>`;
  }

  function refreshSidebarStatus() {
    const stats = FleetData.getFleetStats();
    const mov = document.getElementById('sb-moving');
    const stp = document.getElementById('sb-stopped');
    const idl = document.getElementById('sb-idle');
    if (mov) mov.textContent = stats.moving;
    if (stp) stp.textContent = stats.stopped;
    if (idl) idl.textContent = stats.idle + stats.offline;
  }

  // ===== Render Topbar =====
  function renderTopbar() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;
    topbar.innerHTML = `
      <div>
        <div class="topbar-title">لوحة التحكم الرئيسية</div>
        <div class="topbar-subtitle">تتبع الأسطول في الوقت الفعلي</div>
      </div>
      <div class="topbar-right">
        <div class="live-indicator"><div class="live-dot"></div>بث حي</div>
        <div class="topbar-time" id="topbar-time">...</div>
        <button class="btn" style="background:#f59e0b;color:#fff;border:none;display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:12px;padding:6px 12px;border-radius:6px;cursor:pointer;margin-left:8px;" onclick="clearCacheAndReload()">🧹 مسح الكاش وتحديث</button>
        <button class="btn-icon" onclick="MapManager.fitAllVehicles()" title="عرض كل السيارات">🗺️</button>
        <button class="btn-icon" id="trail-btn" onclick="toggleTrails()" title="إظهار/إخفاء المسارات">〰️</button>
        <button class="btn-icon" onclick="refreshPage()" title="تحديث">🔄</button>
        <button class="btn-icon" onclick="App.openSettingsMainModal()" title="الإعدادات">⚙️</button>
        <a href="pages/alerts.html" class="btn-icon" title="التنبيهات" style="position:relative;text-decoration:none">
          🔔
          <span id="topbar-alert-count" style="position:absolute;top:-4px;left:-4px;background:var(--red);color:white;font-size:9px;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;">${FleetData.getUnreadAlertCount()}</span>
        </a>
      </div>`;
  }

  function toggleTrails() {
    const active = MapManager.toggleTrails();
    const btn = document.getElementById('trail-btn');
    if (btn) btn.style.color = active ? 'var(--accent-light)' : '';
    AlertsManager.showToast(active ? 'تم تفعيل عرض المسارات' : 'تم إخفاء المسارات', 'success', '〰️');
  }

  function refreshPage() {
    window.location.reload();
  }

  // ===== Render Dashboard =====
  function renderDashboard() {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = `
      <!-- Map + Vehicle Panel (Full Height Workspace) -->
      <div class="split-layout">
        <!-- Map -->
        <div class="split-map" style="position:relative;">
          <div id="main-map" style="width:100%;height:100%;"></div>
          <!-- Map Controls -->
          <div class="map-controls" style="position:absolute;top:12px;right:12px;z-index:1000;display:flex;flex-direction:column;gap:6px;">
            <button class="map-btn" onclick="MapManager.fitAllVehicles()">🗺️ كل السيارات</button>
            <button class="map-btn" id="geofence-btn" onclick="toggleGeofences()">🏁 مناطق الجيوفنس</button>
          </div>
          <div class="map-legend" style="position:absolute;bottom:12px;right:12px;z-index:1000;background:rgba(13,19,35,0.92);border:1px solid var(--border);border-radius:10px;padding:10px 14px;backdrop-filter:blur(10px);">
            <div class="legend-item"><div class="legend-dot" style="background:#22c55e"></div>يتحرك</div>
            <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div>واقفة</div>
            <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div>خامل</div>
            <div class="legend-item"><div class="legend-dot" style="background:#6b7280"></div>غير متصل</div>
          </div>
          <!-- Vehicle Detail Panel (Bottom Sheet Layout) -->
          <div id="vehicle-detail-panel" class="vehicle-detail-panel">
            <div class="vd-header">
              <div style="display:flex;align-items:center;height:100%;flex:1;gap:4px;">
                <button class="vd-tab-btn active">معطيات</button>
                <button class="vd-tab-btn" onclick="alert('الرسومات البيانية والتحليلات متوفرة في قسم التقارير')">رسم بياني</button>
                <button class="vd-tab-btn" onclick="alert('سجل الرسائل متوفر في قسم التنبيهات')">رسائل</button>
              </div>
              <button class="modal-close" onclick="closeVehicleDetailPanel()" style="font-size:18px;background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:4px 8px;">✕</button>
            </div>
            <div class="vd-body" id="vehicle-detail-body">
              <div class="empty-state" style="padding:20px;"><div class="empty-icon">👆</div><p>اضغط على سيارة لعرض معطيات والتفاصيل الحية</p></div>
            </div>
          </div>
        </div>
        
        <!-- Vehicle List Panel (Traccar Layout) -->
        <div class="split-panel">
          <!-- Tabs Bar -->
          <div class="split-panel-tabs">
            <button class="panel-tab-btn active" onclick="App.switchTab('vehicles')">المركبات</button>
            <button class="panel-tab-btn" onclick="App.switchTab('events')">أحداث</button>
            <button class="panel-tab-btn" onclick="App.switchTab('places')">الأماكن</button>
            <button class="panel-tab-btn" onclick="App.switchTab('history')">تاريخ</button>
          </div>

          <!-- Vehicles Tab Content -->
          <div id="tab-vehicles" class="tab-content" style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
            <!-- Sidebar Search & Action Bar -->
            <div class="sidebar-action-bar">
              <input type="text" id="vehicle-search" placeholder="ابحث عن سيارة...">
              <div class="sidebar-action-btns">
                <button class="sidebar-btn" onclick="MapManager.fitAllVehicles()" title="عرض كل السيارات">🗺️</button>
                <button class="sidebar-btn" onclick="window.location.reload()" title="تحديث">🔄</button>
              </div>
            </div>
            
            <!-- Column Headers -->
            <div class="vehicle-list-header">
              <div class="header-col select-all">
                <input type="checkbox" id="select-all-vehicles" checked onclick="App.toggleAllVehicleVisibility(this)">
              </div>
              <div class="header-col vehicle-info">المركبة</div>
              <div class="header-col vehicle-distance">المسافة</div>
              <div class="header-col vehicle-status-icons">الحالة</div>
              <div class="header-col vehicle-actions"></div>
            </div>
            
            <div class="split-panel-body" style="padding:0; flex:1; overflow-y:auto;">
              <div id="vehicle-list"></div>
            </div>
          </div>

          <!-- Events Tab Content -->
          <div id="tab-events" class="tab-content" style="display:none; flex-direction:column; height:100%; overflow:hidden; padding:12px; gap:8px;">
            <!-- Header & Mark All Read -->
            <div style="font-size:13px; font-weight:700; display:flex; justify-content:space-between; align-items:center; direction:rtl;">
              <span>🔔 التنبيهات والأحداث الأخيرة</span>
              <button class="btn btn-sm btn-secondary" onclick="AlertsManager.markAllRead(); App.refreshEventsTab();" style="padding:4px 8px; font-size:10px; font-family:'Cairo', sans-serif;">قراءة الكل</button>
            </div>

            <!-- Action Bar -->
            <div style="display: flex; gap: 8px; align-items: center; direction: rtl;">
              <input type="text" id="events-search" oninput="App.filterEventsList(this.value)" placeholder="ابحث في الأحداث..." style="flex: 1; padding: 6px 12px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); height: 32px; font-family:'Cairo', sans-serif;">
              
              <!-- Refresh button -->
              <button onclick="App.refreshEventsTab()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="تحديث">
                <span style="font-size: 15px;">🔄</span>
              </button>
              
              <!-- Export button -->
              <button onclick="App.exportEventsToExcel()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="تصدير إكسيل">
                <span style="font-size: 15px;">📤</span>
              </button>
              
              <!-- Delete/Clear button -->
              <button onclick="App.clearEventsList()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;" title="مسح الكل">
                <span style="font-size: 15px;">🗑️</span>
                <span style="position: absolute; bottom: 3px; left: 3px; background: #ef4444; color: white; font-size: 7px; font-weight: bold; border-radius: 50%; width: 10px; height: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid white;">&times;</span>
              </button>
            </div>

            <div class="split-panel-body" id="sidebar-alerts-list" style="padding:0; flex:1; overflow-y:auto;"></div>
          </div>

          <!-- Places Tab Content -->
          <div id="tab-places" class="tab-content" style="display:none; flex-direction:column; height:100%; overflow:hidden; padding:12px; gap:8px;">
            <!-- Header bar: المناطق and Routes -->
            <div style="font-size:13px; font-weight:700; display:flex; justify-content:space-between; align-items:center; direction:rtl; padding-bottom:4px; border-bottom:1px solid var(--border, #e2e8f0);">
              <span id="places-tab-regions-count">المناطق (0)</span>
              <span>Routes (0)</span>
            </div>

            <!-- Action Bar -->
            <div style="display: flex; gap: 6px; align-items: center; direction: rtl;">
              <input type="text" id="places-search" oninput="App.filterPlacesList(this.value)" placeholder="ابحث في الأماكن..." style="flex: 1; padding: 6px 12px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); height: 32px; font-family:'Cairo', sans-serif;">
              
              <!-- Refresh button -->
              <button onclick="App.refreshPlacesTab()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="تحديث">
                <span style="font-size: 15px;">🔄</span>
              </button>
              
              <!-- Add Marker button -->
              <button onclick="App.openAddMarkerModal()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;" title="إضافة علامة">
                <span style="font-size: 15px;">📍</span>
                <span style="position: absolute; bottom: 2px; left: 2px; background: #22c55e; color: white; font-size: 6px; font-weight: bold; border-radius: 50%; width: 9px; height: 9px; display: flex; align-items: center; justify-content: center; border: 1px solid white;">+</span>
              </button>

              <!-- Group/Hierarchy button -->
              <button onclick="App.openGroupsModal()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="تجميع">
                <span style="font-size: 15px;">📊</span>
              </button>

              <!-- Import button -->
              <button onclick="alert('استيراد الأماكن متوفر قريباً')" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="استيراد">
                <span style="font-size: 15px;">📥</span>
              </button>

              <!-- Export button -->
              <button onclick="App.exportPlaces()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer;" title="تصدير">
                <span style="font-size: 15px;">📤</span>
              </button>
              
              <!-- Delete/Clear button -->
              <button onclick="App.clearPlacesList()" style="width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary, #f8fafc); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;" title="مسح الكل">
                <span style="font-size: 15px;">🗑️</span>
                <span style="position: absolute; bottom: 3px; left: 3px; background: #ef4444; color: white; font-size: 7px; font-weight: bold; border-radius: 50%; width: 10px; height: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid white;">&times;</span>
              </button>
            </div>

            <div class="split-panel-body" id="sidebar-places-list" style="padding:0; flex:1; overflow-y:auto;"></div>
          </div>

          <!-- History Tab Content -->
          <div id="tab-history" class="tab-content" style="display:none; flex-direction:column; height:100%; overflow:hidden;">
            <div class="sidebar-history-controls" style="padding:10px 12px; border-bottom:1px solid var(--border); background:var(--bg-card); display:flex; flex-direction:column; gap:6px;">
              <!-- Vehicle Select -->
              <div style="display:flex; align-items:center; gap:8px;">
                <label class="form-label" style="font-size:12px; width:60px; margin-bottom:0; flex-shrink:0;">مركبة</label>
                <select class="form-control" id="sidebar-history-vehicle" style="flex:1; padding:4px 8px; font-size:12px; height:28px; cursor:pointer;">
                  <option value="">-- اختر سيارة --</option>
                </select>
              </div>

              <!-- Period Select -->
              <div style="display:flex; align-items:center; gap:8px;">
                <label class="form-label" style="font-size:12px; width:60px; margin-bottom:0; flex-shrink:0;">اختيار</label>
                <select class="form-control" id="sidebar-history-period" onchange="App.onHistoryPeriodChange(this.value)" style="flex:1; padding:4px 8px; font-size:12px; height:28px; cursor:pointer;">
                  <option value="today">اليوم</option>
                  <option value="yesterday">أمس</option>
                  <option value="thisweek">هذا الأسبوع</option>
                  <option value="lastweek">الأسبوع الماضي</option>
                  <option value="custom">مخصص</option>
                </select>
              </div>

              <!-- Time From -->
              <div style="display:flex; align-items:center; gap:4px;">
                <label class="form-label" style="font-size:12px; width:60px; margin-bottom:0; flex-shrink:0;">الوقت من</label>
                <input type="date" class="form-control" id="sidebar-history-date-from" onchange="document.getElementById('sidebar-history-period').value = 'custom'" style="flex:2; padding:4px 6px; font-size:11px; height:28px; direction:ltr;">
                <select class="form-control" id="sidebar-history-hour-from" onchange="document.getElementById('sidebar-history-period').value = 'custom'" style="flex:1; padding:4px 2px; font-size:11px; height:28px;"></select>
                <select class="form-control" id="sidebar-history-min-from" onchange="document.getElementById('sidebar-history-period').value = 'custom'" style="flex:1; padding:4px 2px; font-size:11px; height:28px;"></select>
              </div>

              <!-- Time To -->
              <div style="display:flex; align-items:center; gap:4px;">
                <label class="form-label" style="font-size:12px; width:60px; margin-bottom:0; flex-shrink:0;">الوقت الى</label>
                <input type="date" class="form-control" id="sidebar-history-date-to" onchange="document.getElementById('sidebar-history-period').value = 'custom'" style="flex:2; padding:4px 6px; font-size:11px; height:28px; direction:ltr;">
                <select class="form-control" id="sidebar-history-hour-to" onchange="document.getElementById('sidebar-history-period').value = 'custom'" style="flex:1; padding:4px 2px; font-size:11px; height:28px;"></select>
                <select class="form-control" id="sidebar-history-min-to" onchange="document.getElementById('sidebar-history-period').value = 'custom'" style="flex:1; padding:4px 2px; font-size:11px; height:28px;"></select>
              </div>

              <!-- Stop Threshold -->
              <div style="display:flex; align-items:center; gap:8px;">
                <label class="form-label" style="font-size:12px; width:60px; margin-bottom:0; flex-shrink:0;">توقف</label>
                <select class="form-control" id="sidebar-history-stop" style="flex:1; padding:4px 8px; font-size:12px; height:28px; cursor:pointer;">
                  <option value="1">> 1 دقيقة</option>
                  <option value="2">> 2 دقيقة</option>
                  <option value="5">> 5 دقيقة</option>
                  <option value="10">> 10 دقيقة</option>
                  <option value="30">> 30 دقيقة</option>
                </select>
              </div>

              <!-- Buttons -->
              <div style="display:grid; grid-template-columns:1fr 1fr 1.2fr; gap:6px; margin-top:4px;">
                <button class="btn btn-primary btn-sm" onclick="App.showHistory()" style="justify-content:center; height:28px; font-size:11px; font-weight:700; padding:0;">عرض</button>
                <button class="btn btn-secondary btn-sm" onclick="App.hideHistory()" style="justify-content:center; height:28px; font-size:11px; font-weight:700; padding:0;">إخفاء</button>
                <button class="btn btn-secondary btn-sm" onclick="alert('Import/Export functionality is active in reports.')" style="justify-content:center; height:28px; font-size:11px; font-weight:700; padding:0;">Import/Export</button>
              </div>
            </div>

            <!-- Table Header -->
            <div style="display:flex; background:var(--bg-secondary); border-bottom:1px solid var(--border); padding:6px 12px; font-size:11px; font-weight:700; color:var(--text-secondary); text-align:right;">
              <div style="flex:1;">معلومات</div>
              <div style="width:130px; text-align:left;">وقت</div>
            </div>

            <!-- Results -->
            <div class="split-panel-body" id="sidebar-history-results" style="padding:0; flex:1; overflow-y:auto;">
              <div class="empty-state" style="padding:20px;"><div class="empty-icon">📅</div><p>اختر سيارة وفترة زمنية لعرض سجل الأحداث والرحلات</p></div>
            </div>
          </div>
        </div>
      </div>`;

    renderVehicleList();
  }

  // ===== Vehicle List =====

  /** Read current vehiclesDetails setting */
  function getVehicleDetailsMode() {
    try {
      const cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
      return cfg.vehiclesDetails || 'time_position';
    } catch (e) { return 'time_position'; }
  }

  /**
   * Build the subtitle string shown under each vehicle name.
   * @param {object} v   - vehicle object
   * @param {string} mode - 'time_position' | 'time_server' | 'speed' | 'last_update'
   */
  function getVehicleSubtitle(v, mode) {
    let cfg = {};
    try {
      cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
    } catch(e) {}
    
    const lang = cfg.lang || 'ar';
    const isAr = (lang === 'ar');
    const locale = isAr ? 'ar-EG' : 'en-US';
    const fmt = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    
    const getTzTime = (offsetMs) => {
      try {
        const tzStr = cfg.timezone || 'UTC+3';
        const offsetHours = parseInt(tzStr.replace('UTC', '')) || 0;
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const adjusted = new Date(utc + (3600000 * offsetHours) + offsetMs);
        return adjusted.toLocaleTimeString(locale, fmt);
      } catch(e) {
        return new Date().toLocaleTimeString(locale, fmt);
      }
    };
    
    switch (mode) {
      case 'time_server':
        return getTzTime(0);
      case 'speed': {
        const spd = v.speed != null ? v.speed : 0;
        if (cfg.unitDistance === 'mi') {
          return Math.round(spd * 0.621371) + (isAr ? ' ميل/س' : ' mph');
        } else if (cfg.unitDistance === 'nmi') {
          return Math.round(spd * 0.539957) + (isAr ? ' عقدة' : ' kn');
        }
        return spd + (isAr ? ' كم/س' : ' km/h');
      }
      case 'last_update':
        return getTzTime(-5000);
      case 'time_position':
      default:
        return getTzTime(-5000);
    }
  }

  /** Re-render subtitle cells of all vehicle rows immediately */
  function applyVehiclesDetails() {
    const mode = getVehicleDetailsMode();
    const vehicles = FleetData.getVehicles();
    vehicles.forEach(v => {
      const card = document.getElementById(`vc-${v.id}`);
      if (!card) return;
      const subtitle = card.querySelector('.vehicle-subtitle-text');
      if (subtitle) subtitle.textContent = getVehicleSubtitle(v, mode);
    });
  }

  /**
   * Apply the vehicle-list panel position immediately.
   * Reads dataListPosition from localStorage and adjusts the split-layout DOM.
   *  bottom_icons / bottom → panel on right (row-reverse, visible)
   *  left                  → panel on left  (row, visible)
   *  none                  → panel hidden
   */
  function applyLanguage() {
    try {
      const cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
      const lang = cfg.lang || 'ar';
      const isRtl = (lang === 'ar' || lang === 'fa');
      
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      
      document.title = lang === 'ar' ? 'Fleet Track Pro — لوحة التحكم' : 'Fleet Track Pro — Dashboard';
      
      renderSidebar();
      renderTopbar();
      
      const tabs = document.querySelectorAll('.panel-tab-btn');
      if (tabs.length >= 4) {
        tabs[0].textContent = translate('vehicles');
        tabs[1].textContent = translate('events');
        tabs[2].textContent = translate('places');
        tabs[3].textContent = translate('history');
      }
      
      const searchInput = document.getElementById('vehicle-search');
      if (searchInput) searchInput.placeholder = translate('search');
      
      const fitBtn = document.querySelector('.map-btn[onclick="MapManager.fitAllVehicles()"]');
      if (fitBtn) fitBtn.textContent = lang === 'ar' ? '🗺️ كل السيارات' : '🗺️ Fit All';
      
      const geoBtn = document.getElementById('geofence-btn');
      if (geoBtn) geoBtn.textContent = lang === 'ar' ? '🏁 مناطق الجيوفنس' : '🏁 Geofences';
      
      if (selectedVehicleId) {
        const body = document.getElementById('vehicle-detail-body');
        if (body) renderVehicleDetail(selectedVehicleId, body);
      }
    } catch(e) {
      console.error(e);
    }
  }

  function applyDataListPosition() {
    try {
      const cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
      const pos = cfg.dataListPosition || 'bottom_icons';
      const layout = document.querySelector('.split-layout');
      const panel  = document.querySelector('.split-panel');
      if (!layout || !panel) return;

      if (pos === 'none') {
        panel.style.display = 'none';
        layout.classList.remove('panel-left');
        layout.style.flexDirection = 'row-reverse';
      } else if (pos === 'left') {
        panel.style.display = 'flex';
        layout.classList.add('panel-left');
        layout.style.flexDirection = 'row'; // panel appears on LEFT of map
      } else {
        // bottom_icons, bottom — panel on RIGHT (default, RTL layout)
        panel.style.display = 'flex';
        layout.classList.remove('panel-left');
        layout.style.flexDirection = 'row-reverse';
      }
    } catch (e) {}
  }

  function renderVehicleList() {
    const vehicles = FleetData.getVehicles();
    const container = document.getElementById('vehicle-list');
    if (!container) return;

    const mode = getVehicleDetailsMode();
    let cfg = {};
    try {
      cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
    } catch(e) {}
    const isAr = (cfg.lang === 'ar');
    
    const formatSidebarDistance = (km) => {
      if (cfg.unitDistance === 'mi') {
        return Math.round(km * 0.621371) + (isAr ? ' ميل' : ' mi');
      } else if (cfg.unitDistance === 'nmi') {
        return (km * 0.539957).toFixed(1) + (isAr ? ' ميل بحري' : ' nmi');
      }
      return km + (isAr ? ' كم' : ' km');
    };

    container.innerHTML = vehicles.map(v => {
      const todayKm = getTodayKmForVehicle(v.id);
      
      const emoji = v.type === 'بيك أب' ? '🛻' :
                    v.type === 'SUV' ? '🚙' :
                    v.type === 'ميني باص' ? '🚐' : '🚗';

      const subtitle = getVehicleSubtitle(v, mode);

      return `
        <div class="vehicle-list-row" id="vc-${v.id}">
          <div class="row-cell select-cell">
            <input type="checkbox" class="vehicle-visibility-chk" data-id="${v.id}" checked onclick="event.stopPropagation(); toggleVehicleVisibility('${v.id}', this.checked)">
          </div>
          <div class="row-cell info-cell" onclick="selectAndFocusVehicle('${v.id}')">
            <div class="vehicle-icon-circle ${v.status}">
              ${emoji}
            </div>
            <div class="vehicle-text-wrap">
              <div class="vehicle-title-text">${v.plate} - ${v.name}</div>
              <div class="vehicle-subtitle-text">${subtitle}</div>
            </div>
          </div>
          <div class="row-cell distance-cell">
            <span class="dist-val">${formatSidebarDistance(todayKm)}</span>
          </div>
          <div class="row-cell status-icons-cell">
            <span class="status-icon wifi ${v.status}" title="الاتصال بالشبكة">📶</span>
            <span class="status-icon engine ${v.status}" title="تشغيل المحرك">🔑</span>
          </div>
          <div class="row-cell action-cell">
            <button class="btn-dots" onclick="event.stopPropagation(); openVehicleMenu(event, '${v.id}')">&#8942;</button>
          </div>
        </div>`;
    }).join('');
  }

  function refreshVehicleList() {
    const vehicles = FleetData.getVehicles();
    const mode = getVehicleDetailsMode();
    let cfg = {};
    try {
      cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
    } catch(e) {}
    const isAr = (cfg.lang === 'ar');
    
    const formatSidebarDistance = (km) => {
      if (cfg.unitDistance === 'mi') {
        return Math.round(km * 0.621371) + (isAr ? ' ميل' : ' mi');
      } else if (cfg.unitDistance === 'nmi') {
        return (km * 0.539957).toFixed(1) + (isAr ? ' ميل بحري' : ' nmi');
      }
      return km + (isAr ? ' كم' : ' km');
    };

    vehicles.forEach(v => {
      const card = document.getElementById(`vc-${v.id}`);
      if (!card) return;
      const todayKm = getTodayKmForVehicle(v.id);
      
      // Update icon status color
      const iconCircle = card.querySelector('.vehicle-icon-circle');
      if (iconCircle) {
        iconCircle.className = `vehicle-icon-circle ${v.status}`;
      }

      // Update subtitle based on current Details setting
      const subtitle = card.querySelector('.vehicle-subtitle-text');
      if (subtitle) subtitle.textContent = getVehicleSubtitle(v, mode);

      // Update distance
      const dist = card.querySelector('.dist-val');
      if (dist) {
        dist.textContent = formatSidebarDistance(todayKm);
      }

      // Update wifi status classes
      const wifi = card.querySelector('.status-icon.wifi');
      if (wifi) {
        wifi.className = `status-icon wifi ${v.status}`;
      }

      // Update engine status classes
      const engine = card.querySelector('.status-icon.engine');
      if (engine) {
        engine.className = `status-icon engine ${v.status}`;
      }

      // If this vehicle is currently selected and the details panel is open, refresh its data in real-time
      if (selectedVehicleId === v.id) {
        const body = document.getElementById('vehicle-detail-body');
        const panel = document.getElementById('vehicle-detail-panel');
        if (panel && panel.classList.contains('open') && body) {
          renderVehicleDetail(v.id, body);
        }
      }
    });
  }

  function filterVehicleList(query) {
    const vehicles = FleetData.getVehicles();
    const container = document.getElementById('vehicle-list');
    if (!container) return;
    const q = query.toLowerCase();
    const filtered = vehicles.filter(v =>
      v.name.includes(q) || v.plate.includes(q) || v.make.includes(q) || v.model.includes(q)
    );
    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>لا توجد نتائج</p></div>`;
      return;
    }
    renderVehicleList();
    // Hide non-matching
    vehicles.forEach(v => {
      const card = document.getElementById(`vc-${v.id}`);
      if (card) card.style.display = filtered.find(f => f.id === v.id) ? '' : 'none';
    });
  }

  function getTodayKmForVehicle(vehicleId) {
    const today = getLocalDateStr();
    const trips = FleetData.getVehicleHistory(vehicleId, today);
    return trips.reduce((sum, t) => sum + t.distanceKm, 0).toFixed(0);
  }

  function refreshKPIs() {
    AlertsManager.updateAlertBadge();
  }

  function selectVehicle(id) {
    selectedVehicleId = id;
    document.querySelectorAll('.vehicle-list-row').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById(`vc-${id}`);
    if (card) { 
      card.classList.add('selected'); 
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
    MapManager.selectVehicle(id);
  }

  function selectAndFocusVehicle(id) {
    selectVehicle(id);
    MapManager.focusVehicle(id);
    openVehicleDetailPanel(id);
  }

  function openVehicleDetailPanel(id) {
    const panel = document.getElementById('vehicle-detail-panel');
    const body = document.getElementById('vehicle-detail-body');
    if (!panel || !body) return;
    panel.classList.add('open');
    renderVehicleDetail(id, body);
  }

  function closeVehicleDetailPanel() {
    const panel = document.getElementById('vehicle-detail-panel');
    if (panel) panel.classList.remove('open');
  }

  function renderVehicleDetail(id, container) {
    const v = FleetData.getVehicleById(id);
    const driver = FleetData.getDriverByVehicle(id);
    if (!v) return;
    const state = TrackingEngine.getVehicleState(id);
    const today = getLocalDateStr();
    const trips = FleetData.getVehicleHistory(id, today);
    const todayKm = trips.reduce((sum, t) => sum + t.distanceKm, 0).toFixed(0);

    let cfg = {};
    try {
      cfg = JSON.parse(localStorage.getItem('settings_ui') || '{}');
    } catch(e) {}

    const showRow = (itemLabel) => {
      const items = cfg.dataListItems;
      if (!items || items === 'all') return true;
      if (items === 'none') return false;
      if (Array.isArray(items)) {
        return items.includes(itemLabel);
      }
      return true;
    };

    const lang = cfg.lang || 'ar';
    const isAr = (lang === 'ar');
    
    const formatDistanceVal = (km) => {
      if (cfg.unitDistance === 'mi') {
        const mi = Math.round(km * 0.621371);
        return mi + (isAr ? ' ميل' : ' miles');
      } else if (cfg.unitDistance === 'nmi') {
        const nmi = (km * 0.539957).toFixed(1);
        return nmi + (isAr ? ' ميل بحري' : ' nmi');
      }
      return km + (isAr ? ' كيلومتراً' : ' km');
    };

    const formatKmDistVal = (kmVal) => {
      if (cfg.unitDistance === 'mi') {
        const mi = (kmVal * 0.621371).toFixed(2);
        return mi + (isAr ? ' ميل' : ' miles');
      } else if (cfg.unitDistance === 'nmi') {
        const nmi = (kmVal * 0.539957).toFixed(2);
        return nmi + (isAr ? ' ميل بحري' : ' nmi');
      }
      return kmVal + (isAr ? ' كيلومتراً' : ' km');
    };

    const formatSpeedVal = (kmh) => {
      if (cfg.unitDistance === 'mi') {
        const mph = Math.round(kmh * 0.621371);
        return mph + (isAr ? ' ميل/س' : ' mph');
      } else if (cfg.unitDistance === 'nmi') {
        const kn = Math.round(kmh * 0.539957);
        return kn + (isAr ? ' عقدة' : ' kn');
      }
      return kmh + (isAr ? ' كم/س' : ' km/h');
    };

    const getAdjustedTimeStr = (offsetMs) => {
      try {
        const tzStr = cfg.timezone || 'UTC+3';
        const offsetHours = parseInt(tzStr.replace('UTC', '')) || 0;
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const adjusted = new Date(utc + (3600000 * offsetHours) + offsetMs);
        
        const year = adjusted.getFullYear();
        const month = String(adjusted.getMonth() + 1).padStart(2, '0');
        const day = String(adjusted.getDate()).padStart(2, '0');
        const hours = String(adjusted.getHours()).padStart(2, '0');
        const minutes = String(adjusted.getMinutes()).padStart(2, '0');
        const seconds = String(adjusted.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch(e) {
        return '';
      }
    };
    
    // Status formatting
    let statusText = translate('offline');
    if (v.status === 'moving') statusText = (isAr ? 'متحرك ' : 'Moving ') + formatSpeedVal(v.speed || 60);
    else if (v.status === 'stopped') statusText = translate('stopped');
    else if (v.status === 'idle') statusText = translate('idle_live');
    
    // Coordinates
    const coordsStr = `${v.lat.toFixed(6)}° , ${v.lng.toFixed(6)}°`;
    
    // Timing
    const serverTimeStr = getAdjustedTimeStr(0);
    const positionTimeStr = getAdjustedTimeStr(-5000);

    // Heading (angle)
    const headingAngle = state ? Math.round(state.heading || 0) : 0;
    const cleanHeading = headingAngle < 0 ? (headingAngle + 360) : headingAngle;

    // Simulate plate formatting
    const plateFormatted = v.plate || 'ر هـ س - 4492';
    const simNumber = '89966098211231' + String(v.id).replace(/\D/g, '').padEnd(4, '0');
    const odometerVal = 66400 + Number(todayKm);

    // Calculate closest location dynamically
    let closest = null;
    let minDist = Infinity;
    const locations = FleetData.LOCATIONS || [];
    for (const loc of locations) {
      const dLat = loc.lat - v.lat;
      const dLng = loc.lng - v.lng;
      const dist = dLat*dLat + dLng*dLng;
      if (dist < minDist) {
        minDist = dist;
        closest = loc;
      }
    }
    const distKm = (Math.sqrt(minDist) * 111).toFixed(2);
    const closestLocName = closest ? closest.name : (isAr ? 'موقع غير معروف' : 'Unknown Location');

    // Calculate closest place dynamically
    let closestPlace = null;
    let minPlaceDist = Infinity;
    const customPlaces = getCustomPlaces();
    customPlaces.forEach(loc => {
      const dLat = loc.lat - v.lat;
      const dLng = loc.lng - v.lng;
      const dist = dLat*dLat + dLng*dLng;
      if (dist < minPlaceDist) {
        minPlaceDist = dist;
        closestPlace = loc;
      }
    });
    const closestPlaceName = closestPlace ? `${closestPlace.name} (${formatKmDistVal(Math.sqrt(minPlaceDist) * 111)})` : translate('no_markers_close');

    container.innerHTML = `
      <div class="traccar-data-grid">
        <!-- Column 1 (Left Table) -->
        <div>
          <table class="traccar-data-table">
            ${showRow('حالة') ? `
            <tr>
              <td class="label-cell">${translate('status')}</td>
              <td class="value-cell" style="color:${v.status === 'moving' ? 'var(--green)' : 'var(--red)'}">${statusText}</td>
            </tr>` : ''}
            ${showRow('SIM رقم بطاقة') ? `
            <tr>
              <td class="label-cell">${translate('sim')}</td>
              <td class="value-cell">${simNumber}</td>
            </tr>` : ''}
            ${showRow('عداد المسافات') ? `
            <tr>
              <td class="label-cell">${translate('odometer')}</td>
              <td class="value-cell">${formatDistanceVal(odometerVal)}</td>
            </tr>` : ''}
            ${showRow('ساعات المحرك') ? `
            <tr>
              <td class="label-cell">⏳ ${translate('idle')}</td>
              <td class="value-cell">${v.engineHours || 0} ${isAr ? 'ساعة' : 'hours'}</td>
            </tr>` : ''}
            ${showRow('نموذج') ? `
            <tr>
              <td class="label-cell">🚗 ${translate('vehicles')}</td>
              <td class="value-cell">${v.make} ${v.model} (${v.year})</td>
            </tr>` : ''}
            ${showRow('VIN') ? `
            <tr>
              <td class="label-cell">🆔 VIN / IMEI</td>
              <td class="value-cell">${v.serial || '—'}</td>
            </tr>` : ''}
            ${showRow('لوحة') ? `
            <tr>
              <td class="label-cell">${translate('plate')}</td>
              <td class="value-cell">${plateFormatted}</td>
            </tr>` : ''}
            ${showRow('Time (position)') ? `
            <tr>
              <td class="label-cell">${translate('time_pos')}</td>
              <td class="value-cell">${positionTimeStr}</td>
            </tr>` : ''}
            ${showRow('Time (server)') ? `
            <tr>
              <td class="label-cell">${translate('time_server')}</td>
              <td class="value-cell">${serverTimeStr}</td>
            </tr>` : ''}
            ${showRow('أقرب منطقة') ? `
            <tr>
              <td class="label-cell">${translate('closest_zone')}</td>
              <td class="value-cell">${closestLocName.split(' — ')[0]} (${formatKmDistVal(distKm)})</td>
            </tr>` : ''}
            ${showRow('ارتفاع') ? `
            <tr>
              <td class="label-cell">${translate('altitude')}</td>
              <td class="value-cell">${isAr ? 'متر 25' : '25 meters'}</td>
            </tr>` : ''}
            ${showRow('السرعة') ? `
            <tr>
              <td class="label-cell">${translate('speed')}</td>
              <td class="value-cell">${formatSpeedVal(v.speed)}</td>
            </tr>` : ''}
            ${showRow('زاوية') ? `
            <tr>
              <td class="label-cell">${translate('angle')}</td>
              <td class="value-cell">${cleanHeading}°</td>
            </tr>` : ''}
            ${showRow('عنوان') ? `
            <tr>
              <td class="label-cell">${translate('address')}</td>
              <td class="value-cell" style="font-size:10px;">${closestLocName}</td>
            </tr>` : ''}
            ${showRow('حالة') === false && showRow('SIM رقم بطاقة') === false && showRow('عداد المسافات') === false && showRow('ساعات المحرك') === false && showRow('نموذج') === false && showRow('VIN') === false && showRow('لوحة') === false && showRow('Time (position)') === false && showRow('Time (server)') === false && showRow('أقرب منطقة') === false && showRow('ارتفاع') === false && showRow('السرعة') === false && showRow('زاوية') === false && showRow('عنوان') === false ? `
            <tr>
              <td colspan="2" style="text-align:center;color:var(--text-muted);font-size:12px;padding:12px 0;">${translate('no_data_selected')}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Column 2 (Right Table) -->
        <div>
          <table class="traccar-data-table">
            ${showRow('موقف') ? `
            <tr>
              <td class="label-cell">${translate('position')}</td>
              <td class="value-cell"><a href="https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}" target="_blank" style="color:var(--accent-light);text-decoration:none;">${coordsStr} 🔗</a></td>
            </tr>` : ''}
            ${showRow('موقع') ? `
            <tr>
              <td class="label-cell">${translate('coordinates')}</td>
              <td class="value-cell">${coordsStr}</td>
            </tr>` : ''}
            ${showRow('أقرب علامة') ? `
            <tr>
              <td class="label-cell">${translate('closest_marker')}</td>
              <td class="value-cell">${closestPlaceName}</td>
            </tr>` : ''}
            ${showRow('عام') ? `
            <tr>
              <td class="label-cell">${translate('engine')}</td>
              <td class="value-cell" style="color:${v.status === 'moving' ? 'var(--green)' : 'var(--text-secondary)'}">${v.status === 'moving' ? 'On' : 'Off'}</td>
            </tr>
            <tr>
              <td class="label-cell">${translate('crash')}</td>
              <td class="value-cell">0</td>
            </tr>
            <tr>
              <td class="label-cell">${translate('green')}</td>
              <td class="value-cell" style="color:var(--green)">${translate('safe_driving')}</td>
            </tr>
            <tr>
              <td class="label-cell">${translate('power_cut')}</td>
              <td class="value-cell">${translate('power_connected')}</td>
            </tr>
            <tr>
              <td class="label-cell">${translate('device_cut')}</td>
              <td class="value-cell">${translate('not_disconnected')}</td>
            </tr>` : ''}
            ${showRow('Trailer') ? `
            <tr>
              <td class="label-cell">🚛 Trailer / Towing</td>
              <td class="value-cell">${v.status === 'moving' ? (isAr ? 'حركة' : 'In motion') : (isAr ? 'ثابت' : 'Stationary')}</td>
            </tr>` : ''}
            ${showRow('سائق') ? `
            <tr>
              <td class="label-cell">${translate('driver')}</td>
              <td class="value-cell">${driver ? driver.name : translate('not_defined')}</td>
            </tr>
            <tr>
              <td class="label-cell">${translate('driver_phone')}</td>
              <td class="value-cell">${driver ? driver.phone : '—'}</td>
            </tr>
            <tr>
              <td class="label-cell">${translate('driver_rating')}</td>
              <td class="value-cell" style="color:var(--yellow)">${driver ? '⭐ ' + driver.rating : '—'}</td>
            </tr>` : ''}
            ${showRow('موقف') === false && showRow('موقع') === false && showRow('أقرب علامة') === false && showRow('عام') === false && showRow('Trailer') === false && showRow('سائق') === false ? `
            <tr>
              <td colspan="2" style="text-align:center;color:var(--text-muted);font-size:12px;padding:12px 0;">${translate('no_data_selected')}</td>
            </tr>` : ''}
          </table>
        </div>
      </div>`;
  }

  let geofencesVisible = true;
  function toggleGeofences() {
    geofencesVisible = !geofencesVisible;
    const btn = document.getElementById('geofence-btn');
    if (btn) btn.classList.toggle('active', geofencesVisible);
    if (geofencesVisible) MapManager.drawGeofences();
    else {
      const m = MapManager.getMap();
      m.eachLayer(l => { if (l instanceof L.Circle) m.removeLayer(l); });
    }
  }

  function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => {
      el.style.display = 'none';
    });
    // Show selected tab content
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) {
      selectedTab.style.display = 'flex';
    }

    // Toggle active class on buttons
    document.querySelectorAll('.panel-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    // Find active button
    const btn = Array.from(document.querySelectorAll('.panel-tab-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
    if (btn) btn.classList.add('active');

    // Populate data depending on tab
    if (tabId === 'events') {
      refreshEventsTab();
    } else if (tabId === 'places') {
      refreshPlacesTab();
    } else if (tabId === 'history') {
      initHistoryTab();
    }
  }

  function refreshEventsTab(filterQuery = '') {
    AlertsManager.renderAlertsList('sidebar-alerts-list', null, filterQuery);
  }

  function filterEventsList(query) {
    refreshEventsTab(query);
  }

  function exportEventsToExcel() {
    const alerts = FleetData.getAlerts();
    if (alerts.length === 0) {
      AlertsManager.showToast('لا توجد أحداث لتصديرها.', 'warning', '⚠️');
      return;
    }
    
    // Create CSV content (Excel compatible with UTF-8 BOM)
    const headers = ['اسم المركبة', 'اللوحة', 'الحدث', 'الوقت', 'المستوى', 'الحالة'];
    const rows = alerts.map(a => {
      const dt = new Date(a.timestamp);
      const timeStr = dt.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return [
        a.vehicleName || '',
        a.vehiclePlate || '',
        a.message || '',
        timeStr,
        a.severity === 'high' ? 'عالي' : a.severity === 'medium' ? 'متوسط' : 'منخفض',
        a.read ? 'مقروء' : 'غير مقروء'
      ];
    });
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `events_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    AlertsManager.showToast('تم تصدير الأحداث إلى ملف CSV بنجاح', 'success', '📤');
  }

  function clearEventsList() {
    if (confirm('هل أنت متأكد من مسح جميع الأحداث؟')) {
      AlertsManager.clearAll();
      refreshEventsTab();
    }
  }

  function getCustomPlaces() {
    try {
      const saved = localStorage.getItem('custom_places');
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  }

  function saveCustomPlaces(places) {
    try {
      localStorage.setItem('custom_places', JSON.stringify(places));
    } catch(e) {}
  }

  function refreshPlacesTab(filterQuery = '') {
    const container = document.getElementById('sidebar-places-list');
    if (!container) return;
    
    let geofences = FleetData.getGeofences();
    const customPlaces = getCustomPlaces();
    let locations = (FleetData.LOCATIONS || []).concat(customPlaces);

    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      geofences = geofences.filter(gf => gf.name.toLowerCase().includes(q));
      locations = locations.filter(loc => loc.name.toLowerCase().includes(q));
    }

    const countEl = document.getElementById('places-tab-regions-count');
    if (countEl) {
      countEl.textContent = `المناطق (${geofences.length + locations.length})`;
    }

    let html = '';

    if (geofences.length === 0 && locations.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📍</div><p>لا توجد مناطق أو أماكن مطابقة</p></div>`;
      return;
    }

    if (geofences.length > 0) {
      html += `<div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase;">مناطق الجيوفنس</div>`;
      html += geofences.map(gf => `
        <div class="geofence-item" onclick="App.focusOnCoordinate(${gf.lat}, ${gf.lng}, 14)" style="cursor:pointer; margin-bottom:6px;">
          <div class="geofence-color" style="background:${gf.color}"></div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:700; color:var(--text-primary);">${gf.name}</div>
            <div style="font-size:10px; color:var(--text-secondary);">${gf.type === 'allowed' ? '✅ مسموح' : '⛔ محظور'} • نصف قطر: ${gf.radius}م</div>
          </div>
        </div>
      `).join('');
    }

    if (locations.length > 0) {
      html += `<div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-top:12px; margin-bottom:8px; text-transform:uppercase;">الأماكن المعلمة</div>`;
      html += locations.map(loc => `
        <div class="geofence-item" onclick="App.focusOnCoordinate(${loc.lat}, ${loc.lng}, 15)" style="cursor:pointer; margin-bottom:6px;">
          <div class="geofence-color" style="background:var(--accent, #3b82f6); display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-family:'Cairo', sans-serif;">
            ${loc.symbol || '📍'}
          </div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:700; color:var(--text-primary);">${loc.name}</div>
            <div style="font-size:10px; color:var(--text-secondary);">📍 إحداثيات: ${loc.lat.toFixed(4)}، ${loc.lng.toFixed(4)}</div>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = html;

    // Draw custom markers on map if MapManager is ready
    if (window.MapManager && typeof MapManager.clearAllCustomMarkers === 'function') {
      MapManager.clearAllCustomMarkers();
      customPlaces.forEach(loc => {
        MapManager.addCustomMarker(loc);
      });
    }
  }

  function filterPlacesList(query) {
    refreshPlacesTab(query);
  }

  let selectedMarkerIcon = { type: 'default', symbol: '🏠' };

  function openAddMarkerModal() {
    selectedMarkerIcon = { type: 'default', symbol: '🏠' };

    const overlay = document.createElement('div');
    overlay.id = 'marker-properties-modal';
    overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 20000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

    const defaultPinSymbols = [
      '🏠', '👁️', '⏳', '🔄', '🔁', '☁️',
      '⇅', '🔃', '↑', '↓', '←', '➕',
      '→', '✏️', '🔍', '⚙️', '❤️', '⚠️',
      '⭐', 'ℹ️', '⛔', '✔️', '🔴', '❌',
      '➕', '٪', '🄷', '➖', '👤', '🔒'
    ];

    const customCircularIcons = [
      { emoji: '🍽️', bg: '#ffe0b2' },
      { emoji: '🏋️', bg: '#e1f5fe' },
      { emoji: '🛗', bg: '#e8f5e9' },
      { emoji: '🛗', bg: '#ffebee' },
      { emoji: '🪙', bg: '#eceff1' },
      { emoji: '🔥', bg: '#f3e5f5' },
      
      { emoji: '🩴', bg: '#e8f5e9' },
      { emoji: '🍟', bg: '#fffde7' },
      { emoji: '🎮', bg: '#e1f5fe' },
      { emoji: '✂️', bg: '#e0f7fa' },
      { emoji: '👔', bg: '#ffebee' },
      { emoji: '🏨', bg: '#e8f5e9' },
      
      { emoji: '🏩', bg: '#fffde7' },
      { emoji: '🏫', bg: '#e3f2fd' },
      { emoji: '🏥', bg: '#e8f5e9' },
      { emoji: '🛎️', bg: '#fff8e1' },
      { emoji: '👩‍💼', bg: '#f3e5f5' },
      { emoji: '🗺️', bg: '#ffebee' },
      
      { emoji: '📍', bg: '#e8f5e9' },
      { emoji: '📖', bg: '#fffde7' },
      { emoji: '🥤', bg: '#ffebee' },
      { emoji: '💵', bg: '#e8f5e9' },
      { emoji: '💳', bg: '#e1f5fe' },
      { emoji: '📄', bg: '#eceff1' },
      
      { emoji: '🚭', bg: '#ffebee' },
      { emoji: '📓', bg: '#e8f5e9' },
      { emoji: '📝', bg: '#fffde7' },
      { emoji: '🏷️', bg: '#ffebee' },
      { emoji: '🅿️', bg: '#fff8e1' },
      { emoji: '🛂', bg: '#e3f2fd' }
    ];

    overlay.innerHTML = `
      <div style="width: 420px; background: var(--bg-card, #ffffff); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); max-height: 90vh;">
        
        <!-- Header -->
        <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 700;">خصائص علامة</h3>
          <span onclick="App.closeAddMarkerModal()" style="cursor: pointer; font-size: 24px; font-weight: bold; line-height: 1;">&times;</span>
        </div>

        <!-- Form Inputs -->
        <div style="padding: 16px; display: flex; flex-direction: column; gap: 10px; direction: rtl; text-align: right; border-bottom: 1px solid var(--border, #e2e8f0);">
          <div style="display: flex; align-items: center;">
            <label style="width: 80px; font-size: 12px; color: var(--text-secondary, #475569);">اسم</label>
            <input type="text" id="marker-name" value="علامة جديدة 1" style="flex: 1; padding: 6px 10px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: flex-start;">
            <label style="width: 80px; font-size: 12px; color: var(--text-secondary, #475569); margin-top: 4px;">وصف</label>
            <textarea id="marker-desc" style="flex: 1; height: 60px; padding: 6px 10px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); resize: none;"></textarea>
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 80px; font-size: 12px; color: var(--text-secondary, #475569);">مجموعة</label>
            <select id="marker-group" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); height: 28px;">
              <option value="فك تجميعها">فك تجميعها</option>
            </select>
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 80px; font-size: 12px; color: var(--text-secondary, #475569);">علامة مرئية</label>
            <input type="checkbox" id="marker-visible" checked style="cursor: pointer;">
          </div>
        </div>

        <!-- Icon Tabs -->
        <div style="display: flex; background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); direction: rtl;">
          <div id="marker-tab-default" onclick="App.switchMarkerTab('default')" style="flex: 1; text-align: center; padding: 8px; font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 3px solid #3b82f6; cursor: pointer;">الافتراضي</div>
          <div id="marker-tab-custom" onclick="App.switchMarkerTab('custom')" style="flex: 1; text-align: center; padding: 8px; font-size: 12px; color: var(--text-secondary, #475569); cursor: pointer;">اختر الأمر</div>
        </div>

        <!-- Icon Scroll Container -->
        <div style="padding: 12px; overflow-y: auto; max-height: 250px; flex: 1; background: var(--bg-primary, #ffffff);">
          
          <!-- Default Grid -->
          <div id="marker-grid-default" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; justify-items: center;">
            ${defaultPinSymbols.map((sym, i) => `
              <div class="marker-icon-btn default-pin" data-symbol="${sym}" onclick="App.selectMarkerIcon('default', '${sym}', this)" style="position: relative; width: 36px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; padding: 2px; border: 2px solid transparent; ${i === 0 ? 'border-color: #3b82f6; background: #e0f7fa;' : ''}">
                <!-- Green Pin SVG -->
                <svg width="30" height="38" viewBox="0 0 24 30" style="position: absolute; top: 2px; left: 3px;">
                  <path d="M12 0C5.4 0 0 5.4 0 12c0 9.6 12 18 12 18s12-8.4 12-18c0-6.6-5.4-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="#34a853"/>
                </svg>
                <!-- Circle background for symbol inside pin -->
                <div style="position: absolute; top: 9px; left: 11px; width: 14px; height: 14px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 9px;">
                  ${sym}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Custom Grid -->
          <div id="marker-grid-custom" style="display: none; grid-template-columns: repeat(6, 1fr); gap: 12px; justify-items: center;">
            ${customCircularIcons.map(icon => `
              <div class="marker-icon-btn custom-poi" data-symbol="${icon.emoji}" data-bg="${icon.bg}" onclick="App.selectMarkerIcon('custom', '${icon.emoji}', this)" style="width: 36px; height: 36px; border-radius: 50%; background: ${icon.bg}; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; border: 2px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${icon.emoji}
              </div>
            `).join('')}
          </div>

        </div>

        <!-- Footer Buttons -->
        <div style="padding: 10px 16px; border-top: 1px solid var(--border, #e2e8f0); display: flex; justify-content: center; gap: 12px; background: var(--bg-secondary, #f8fafc); direction: rtl;">
          <button type="button" onclick="App.saveCustomMarker()" style="background: #3b82f6; color: white; border: none; padding: 6px 20px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
            💾 حفظ
          </button>
          <button type="button" onclick="App.closeAddMarkerModal()" style="background: #334155; color: #f8fafc; border: none; padding: 6px 20px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
            ✖ إلغاء
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
  }

  function switchMarkerTab(type) {
    const tabDefault = document.getElementById('marker-tab-default');
    const tabCustom = document.getElementById('marker-tab-custom');
    const gridDefault = document.getElementById('marker-grid-default');
    const gridCustom = document.getElementById('marker-grid-custom');

    if (type === 'default') {
      tabDefault.style.color = '#3b82f6';
      tabDefault.style.borderBottom = '3px solid #3b82f6';
      tabDefault.style.fontWeight = '700';
      tabCustom.style.color = 'var(--text-secondary, #475569)';
      tabCustom.style.borderBottom = 'none';
      tabCustom.style.fontWeight = 'normal';
      gridDefault.style.display = 'grid';
      gridCustom.style.display = 'none';
    } else {
      tabCustom.style.color = '#3b82f6';
      tabCustom.style.borderBottom = '3px solid #3b82f6';
      tabCustom.style.fontWeight = '700';
      tabDefault.style.color = 'var(--text-secondary, #475569)';
      tabDefault.style.borderBottom = 'none';
      tabDefault.style.fontWeight = 'normal';
      gridCustom.style.display = 'grid';
      gridDefault.style.display = 'none';
    }
  }

  function selectMarkerIcon(type, symbol, el) {
    selectedMarkerIcon = { type, symbol };
    document.querySelectorAll('.marker-icon-btn').forEach(btn => {
      btn.style.borderColor = 'transparent';
      btn.style.background = btn.classList.contains('custom-poi') ? btn.getAttribute('data-bg') : 'transparent';
    });
    el.style.borderColor = '#3b82f6';
    if (type === 'default') {
      el.style.background = '#e0f7fa';
    }
  }

  function saveCustomMarker() {
    const name = document.getElementById('marker-name').value;
    const desc = document.getElementById('marker-desc').value;
    const visible = document.getElementById('marker-visible').checked;

    if (!name) {
      alert('الرجاء إدخال اسم العلامة');
      return;
    }

    let lat = 26.375708;
    let lng = 50.149212;
    const map = MapManager.getMap();
    if (map) {
      const center = map.getCenter();
      lat = center.lat;
      lng = center.lng;
    }

    const customPlaces = getCustomPlaces();
    const newLoc = {
      name,
      desc,
      lat,
      lng,
      visible,
      type: selectedMarkerIcon.type,
      symbol: selectedMarkerIcon.symbol
    };

    customPlaces.push(newLoc);
    saveCustomPlaces(customPlaces);

    closeAddMarkerModal();
    refreshPlacesTab();
    
    AlertsManager.showToast('تمت إضافة العلامة بنجاح على الخريطة', 'success', '📍');
  }

  function closeAddMarkerModal() {
    const modal = document.getElementById('marker-properties-modal');
    if (modal) modal.remove();
  }

  function exportPlaces() {
    const customPlaces = getCustomPlaces();
    const geofences = FleetData.getGeofences();
    const locations = (FleetData.LOCATIONS || []).concat(customPlaces);
    
    if (locations.length === 0 && geofences.length === 0) {
      AlertsManager.showToast('لا توجد أماكن لتصديرها.', 'warning', '⚠️');
      return;
    }
    
    // Create CSV content
    const headers = ['النوع', 'الاسم', 'الوصف', 'خط العرض', 'خط الطول', 'الرمز'];
    const rows = [];
    
    geofences.forEach(gf => {
      rows.push(['منطقة جيوفنس', gf.name || '', gf.type || '', gf.lat || '', gf.lng || '', '🏁']);
    });
    
    locations.forEach(loc => {
      rows.push(['مكان معلم', loc.name || '', loc.desc || '', loc.lat || '', loc.lng || '', loc.symbol || '📍']);
    });
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `places_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    AlertsManager.showToast('تم تصدير الأماكن والمناطق بنجاح', 'success', '📤');
  }

  function clearPlacesList() {
    if (confirm('هل أنت متأكد من مسح جميع الأماكن المضافة مخصصاً؟')) {
      saveCustomPlaces([]);
      refreshPlacesTab();
    }
  }

  function getGroups() {
    try {
      const saved = localStorage.getItem('poi_groups');
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  }

  function saveGroups(groups) {
    try {
      localStorage.setItem('poi_groups', JSON.stringify(groups));
    } catch(e) {}
  }

  function openGroupsModal() {
    if (document.getElementById('groups-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'groups-modal';
    overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 20000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

    overlay.innerHTML = `
      <div style="width: 800px; height: 500px; background: var(--bg-card, #ffffff); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
        
        <!-- Header -->
        <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 700;">Groups</h3>
          <span onclick="App.closeGroupsModal()" style="cursor: pointer; font-size: 24px; font-weight: bold; line-height: 1;">&times;</span>
        </div>

        <!-- Search input -->
        <div style="padding: 10px 16px; border-bottom: 1px solid var(--border, #e2e8f0); display: flex; align-items: center; background: var(--bg-secondary, #f8fafc); direction: rtl;">
          <div style="position: relative; flex: 1;">
            <span style="position: absolute; right: 12px; top: 7px; color: var(--text-secondary, #64748b);">🔍</span>
            <input type="text" id="groups-search-input" oninput="App.populateGroupsTable(this.value)" placeholder="بحث" style="width: 100%; padding: 6px 36px 6px 12px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
          </div>
        </div>

        <!-- Table content -->
        <div style="flex: 1; overflow-y: auto; direction: rtl;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right;">
            <thead>
              <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                <th style="padding: 10px; text-align: center; width: 40px;"><input type="checkbox" id="select-all-groups" onclick="App.toggleSelectAllGroups(this)" style="cursor: pointer;"></th>
                <th style="padding: 10px; font-weight: 700; width: 30%;">اسم ⇅</th>
                <th style="padding: 10px; font-weight: 700; width: 20%;">الأماكن</th>
                <th style="padding: 10px; font-weight: 700; width: 50%;">وصف</th>
              </tr>
            </thead>
            <tbody id="groups-table-body">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>

        <!-- Bottom Footer Bar -->
        <div style="padding: 8px 16px; border-top: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); display: flex; justify-content: space-between; align-items: center; position: relative;">
          
          <!-- Actions on the Left -->
          <div style="display: flex; gap: 8px; align-items: center; position: relative;">
            <!-- Add Group button -->
            <button onclick="App.openAddGroupModal()" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer;" title="إضافة">+</button>
            <!-- Refresh button -->
            <button onclick="App.populateGroupsTable()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
            <!-- Settings button -->
            <button onclick="App.toggleGroupsSettingsMenu(event)" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; position: relative;" title="خيارات">⚙️</button>

            <!-- Settings Popup Menu -->
            <div id="groups-settings-menu" style="display: none; position: absolute; bottom: 34px; left: 0; background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 25000; width: 120px; font-size: 12px; direction: rtl; text-align: right;">
              <div onclick="App.importGroups()" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📥</span> استيراد
              </div>
              <div onclick="App.exportGroups()" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📤</span> تصدير
              </div>
              <div onclick="App.deleteSelectedGroups()" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #ef4444;">
                <span>🗑️</span> حذف
              </div>
            </div>
          </div>

          <!-- Pagination and stats -->
          <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: var(--text-secondary, #475569);">
            <!-- Pagination controls -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="cursor: pointer; opacity: 0.5;">|&lt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&lt;</span>
              <span>Page 1 of 1</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;|</span>
              <select style="font-size: 11px; padding: 2px; border: 1px solid var(--border); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary);">
                <option value="50">50</option>
              </select>
            </div>
            
            <!-- Status string -->
            <span id="groups-stats-text">No records to view</span>
          </div>

        </div>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  populateGroupsTable();
}

function closeGroupsModal() {
  const modal = document.getElementById('groups-modal');
  if (modal) modal.remove();
}

function openAddGroupModal() {
  const overlay = document.createElement('div');
  overlay.id = 'add-group-modal';
  overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 30000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';
  
  overlay.innerHTML = `
    <div style="width: 320px; background: var(--bg-card, #ffffff); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <div style="background: #3b82f6; color: white; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
        <h4 style="margin: 0; font-size: 13px; font-weight: 700;">إضافة مجموعة جديدة</h4>
        <span onclick="document.getElementById('add-group-modal').remove()" style="cursor: pointer; font-size: 20px; font-weight: bold; line-height: 1;">&times;</span>
      </div>
      <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px; direction: rtl; text-align: right;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; color: var(--text-secondary, #475569);">اسم المجموعة</label>
          <input type="text" id="new-group-name" style="padding: 5px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; color: var(--text-secondary, #475569);">وصف</label>
          <textarea id="new-group-desc" style="height: 50px; padding: 5px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); resize: none;"></textarea>
        </div>
      </div>
      <div style="padding: 8px 12px; border-top: 1px solid var(--border, #e2e8f0); display: flex; justify-content: center; gap: 8px; background: var(--bg-secondary, #f8fafc); direction: rtl;">
        <button type="button" onclick="App.saveNewGroup()" style="background: #3b82f6; color: white; border: none; padding: 4px 14px; font-size: 11px; border-radius: 4px; font-weight: 700; cursor: pointer;">حفظ</button>
        <button type="button" onclick="document.getElementById('add-group-modal').remove()" style="background: #334155; color: white; border: none; padding: 4px 14px; font-size: 11px; border-radius: 4px; font-weight: 700; cursor: pointer;">إلغاء</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

function saveNewGroup() {
  const name = document.getElementById('new-group-name').value;
  const desc = document.getElementById('new-group-desc').value;
  if (!name) {
    alert('الرجاء إدخال اسم المجموعة');
    return;
  }
  
  const groups = getGroups();
  groups.push({
    id: 'grp_' + Date.now(),
    name,
    desc,
    placesCount: 0
  });
  saveGroups(groups);
  
  const addModal = document.getElementById('add-group-modal');
  if (addModal) addModal.remove();
  
  populateGroupsTable();
  AlertsManager.showToast('تمت إضافة المجموعة بنجاح', 'success', '✅');
}

function populateGroupsTable(filterQuery = '') {
  const tbody = document.getElementById('groups-table-body');
  if (!tbody) return;
  
  let groups = getGroups();
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    groups = groups.filter(g => 
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.desc && g.desc.toLowerCase().includes(q))
    );
  }
  
  const statsEl = document.getElementById('groups-stats-text');
  if (statsEl) {
    if (groups.length === 0) {
      statsEl.textContent = 'No records to view';
    } else {
      statsEl.textContent = `1-${groups.length} of ${groups.length}`;
    }
  }
  
  if (groups.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="padding: 20px; text-align: center; color: var(--text-secondary, #475569);">No records to view</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = groups.map(g => `
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 10px; text-align: center;"><input type="checkbox" class="group-row-chk" data-id="${g.id}" style="cursor: pointer;"></td>
      <td style="padding: 10px; font-weight: 700;">${g.name}</td>
      <td style="padding: 10px;">${g.placesCount || 0}</td>
      <td style="padding: 10px; color: var(--text-secondary);">${g.desc || ''}</td>
    </tr>
  `).join('');
}

function toggleSelectAllGroups(chk) {
  const checked = chk.checked;
  document.querySelectorAll('.group-row-chk').forEach(c => {
    c.checked = checked;
  });
}

function toggleGroupsSettingsMenu(event) {
  if (event) {
    event.stopPropagation();
  }
  const menu = document.getElementById('groups-settings-menu');
  if (!menu) return;
  
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
    
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  } else {
    menu.style.display = 'none';
  }
}

function deleteSelectedGroups() {
  const checkedChks = document.querySelectorAll('.group-row-chk:checked');
  if (checkedChks.length === 0) {
    alert('الرجاء اختيار مجموعة واحدة على الأقل للحذف');
    return;
  }
  
  if (!confirm('هل أنت متأكد من حذف المجموعات المحددة؟')) return;
  
  const idsToDelete = Array.from(checkedChks).map(c => c.getAttribute('data-id'));
  const groups = getGroups().filter(g => !idsToDelete.includes(g.id));
  saveGroups(groups);
  
  populateGroupsTable();
  const selectAll = document.getElementById('select-all-groups');
  if (selectAll) selectAll.checked = false;
  
  AlertsManager.showToast('تم حذف المجموعات المحددة', 'success', '🗑️');
}

function exportGroups() {
  const groups = getGroups();
  if (groups.length === 0) {
    AlertsManager.showToast('لا توجد مجموعات لتصديرها.', 'warning', '⚠️');
    return;
  }
  
  const headers = ['الاسم', 'الأماكن', 'الوصف'];
  const rows = groups.map(g => [
    g.name || '',
    g.placesCount || 0,
    g.desc || ''
  ]);
  
  const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `groups_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  AlertsManager.showToast('تم تصدير المجموعات بنجاح', 'success', '📤');
}

function importGroups() {
  alert('ميزة استيراد المجموعات متوفرة قريباً');
}

  function getSettingsEvents() {
    try {
      const saved = localStorage.getItem('settings_events');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    
    // Default list of 38 events
    const defaultList = [
      { id: 'se_1', name: 'جولدن الدمام', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_2', name: 'دخول فرع اشبيليا', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_3', name: 'دخول فرع الرمال', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_4', name: 'دخول فرع طويق', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_5', name: 'فرع النوفوتيل', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_6', name: 'مواسم القوة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_7', name: 'السكن', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_8', name: 'تم ايقاف محرك المركبة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_9', name: 'تم تشغيل محرك المركبة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_10', name: 'تم سحب المركبة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_11', name: 'تم فصل الجهاز عن المركبة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_12', name: 'خروج مواسم القوة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_13', name: 'خروج سكن النخبة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_14', name: 'خروج فرع اشبيليا', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_15', name: 'خروج فرع الرمال', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_16', name: 'خروج فرع العزيزية', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_17', name: 'خروج فرع النرجس', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_18', name: 'خروج فرع طويق', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_19', name: 'خروج من فرع الفاخرية', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_20', name: 'دخول فرع العزيزية', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_21', name: 'دخول فرع النرجس', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_22', name: 'دخول فرع الفاخرية', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_23', name: 'تجاوز السرعة المحددة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_24', name: 'انخفاض مستوى البطارية', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_25', name: 'تنبيه الاهتزاز', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_26', name: 'انخفاض مستوى الوقود', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_27', name: 'دخول فرع المونسية', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_28', name: 'خروج فرع المونسية', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_29', name: 'دخول فرع الصحافة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_30', name: 'خروج فرع الصحافة', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_31', name: 'دخول فرع الياسمين', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_32', name: 'خروج فرع الياسمين', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_33', name: 'دخول فرع الملقا', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_34', name: 'خروج فرع الملقا', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_35', name: 'دخول فرع حطين', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_36', name: 'خروج فرع حطين', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_37', name: 'دخول فرع القيروان', enabled: true, system: true, push: true, email: false, sms: false },
      { id: 'se_38', name: 'خروج فرع القيروان', enabled: true, system: true, push: true, email: false, sms: false }
    ];
    
    localStorage.setItem('settings_events', JSON.stringify(defaultList));
    return defaultList;
  }

  function saveSettingsEvents(events) {
    try {
      localStorage.setItem('settings_events', JSON.stringify(events));
    } catch(e) {}
  }

  let currentSettingsTab = 'events';

  function switchSettingsTab(tab) {
    currentSettingsTab = tab;
    const tabs = ['vehicles', 'events', 'templates', 'kml', 'sms', 'ui', 'account', 'subaccounts'];
    tabs.forEach(t => {
      const el = document.getElementById(`settings-tab-${t}`);
      if (el) {
        if (t === tab) {
          el.style.color = '#334155';
          el.style.background = '#ffffff';
          el.style.borderColor = '#cbd5e1';
          el.style.borderBottom = '1px solid #ffffff';
          el.style.marginBottom = '-1px';
          el.style.fontWeight = '700';
          el.style.zIndex = '2';
        } else {
          el.style.color = 'var(--text-secondary, #475569)';
          el.style.background = 'transparent';
          el.style.borderColor = 'transparent';
          el.style.borderBottom = 'none';
          el.style.marginBottom = '0';
          el.style.fontWeight = 'normal';
          el.style.zIndex = 'auto';
        }
      }
    });

    const saveContainer = document.getElementById('settings-tab-save-container');
    if (saveContainer) {
      saveContainer.style.display = (tab === 'sms' || tab === 'ui') ? 'flex' : 'none';
    }

    renderSettingsActiveTab();
  }

  function renderSettingsActiveTab(searchQuery = '') {
    const container = document.getElementById('settings-tab-pane');
    if (!container) return;

    if (currentSettingsTab === 'events') {
      let events = getSettingsEvents();
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        events = events.filter(e => e.name.toLowerCase().includes(q));
      }

      container.innerHTML = `
        <!-- Search input -->
        <div style="padding: 10px 16px; border-bottom: 1px solid var(--border, #e2e8f0); display: flex; align-items: center; background: var(--bg-secondary, #f8fafc); direction: rtl;">
          <div style="position: relative; flex: 1;">
            <span style="position: absolute; right: 12px; top: 7px; color: var(--text-secondary, #64748b);">🔍</span>
            <input type="text" id="settings-events-search" oninput="App.renderSettingsActiveTab(this.value)" placeholder="بحث" value="${searchQuery}" style="width: 100%; padding: 6px 36px 6px 12px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
          </div>
        </div>

        <!-- Table content -->
        <div style="flex: 1; overflow-y: auto; direction: rtl;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
            <thead>
              <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                <th style="padding: 8px 10px; text-align: center; width: 40px;"><input type="checkbox" id="select-all-settings-events" onclick="App.toggleSelectAllSettingsEvents(this)" style="cursor: pointer;"></th>
                <th style="padding: 8px 10px; font-weight: 700; width: 30%;">اسم ⇅</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center;">تفعيل</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center;">نظام</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center;">Push notification</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center;">البريد الإلكتروني</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center;">SMS</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center; width: 80px;">عمليات</th>
              </tr>
            </thead>
            <tbody>
              ${events.length === 0 ? `
                <tr>
                  <td colspan="8" style="padding: 20px; text-align: center; color: var(--text-secondary, #475569);">No records to view</td>
                </tr>
              ` : events.map(e => `
                <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
                  <td style="padding: 8px 10px; text-align: center;"><input type="checkbox" class="settings-event-row-chk" data-id="${e.id}" style="cursor: pointer;"></td>
                  <td style="padding: 8px 10px; font-weight: 700;">${e.name}</td>
                  <td style="padding: 8px 10px; text-align: center; font-size: 14px;">${e.enabled ? '✔️' : '❌'}</td>
                  <td style="padding: 8px 10px; text-align: center; font-size: 14px;">${e.system ? '✔️' : '❌'}</td>
                  <td style="padding: 8px 10px; text-align: center; font-size: 14px;">${e.push ? '✔️' : '❌'}</td>
                  <td style="padding: 8px 10px; text-align: center; font-size: 14px;">${e.email ? '✔️' : '❌'}</td>
                  <td style="padding: 8px 10px; text-align: center; font-size: 14px;">${e.sms ? '✔️' : '❌'}</td>
                  <td style="padding: 8px 10px; text-align: center; display: flex; gap: 8px; justify-content: center; align-items: center; height: 35px;">
                    <span onclick="App.openEditSettingsEventModal('${e.id}')" style="cursor: pointer; font-size: 12px;" title="تعديل">✏️</span>
                    <span onclick="App.deleteSettingsEvent('${e.id}')" style="cursor: pointer; font-size: 12px;" title="حذف">🗑️</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Bottom Footer Bar -->
        <div style="padding: 8px 16px; border-top: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); display: flex; justify-content: space-between; align-items: center; position: relative;">
          <!-- Actions on the Left -->
          <div style="display: flex; gap: 8px; align-items: center; position: relative;">
            <button onclick="App.openAddSettingsEventModal()" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer;" title="إضافة">+</button>
            <button onclick="App.renderSettingsActiveTab()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
            <button onclick="App.toggleSettingsEventsMenu(event)" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; position: relative;" title="خيارات">⚙️</button>

            <!-- Settings Popup Menu -->
            <div id="settings-events-menu" style="display: none; position: absolute; bottom: 34px; left: 0; background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 25000; width: 120px; font-size: 12px; direction: rtl; text-align: right;">
              <div onclick="alert('استيراد الأحداث متوفر قريباً')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📥</span> استيراد
              </div>
              <div onclick="App.exportSettingsEvents()" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📤</span> تصدير
              </div>
              <div onclick="App.deleteSelectedSettingsEvents()" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #ef4444;">
                <span>🗑️</span> حذف
              </div>
            </div>
          </div>

          <!-- Pagination and stats -->
          <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: var(--text-secondary, #475569);">
            <!-- Pagination controls -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="cursor: pointer; opacity: 0.5;">|&lt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&lt;</span>
              <span>Page 1 of 1</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;|</span>
              <select style="font-size: 11px; padding: 2px; border: 1px solid var(--border); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary);">
                <option value="50">50</option>
              </select>
            </div>
            
            <!-- Status string -->
            <span>View 1 - ${events.length} of ${events.length}</span>
          </div>
        </div>
      `;
    } else if (currentSettingsTab === 'vehicles') {
      let vehicles = FleetData.getVehicles();
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        vehicles = vehicles.filter(v => v.name.toLowerCase().includes(q) || (v.serial && v.serial.toLowerCase().includes(q)));
      }

      container.innerHTML = `
        <!-- Warning Info Note -->
        <div style="padding: 12px 20px; font-size: 11px; color: #64748b; background: var(--bg-primary, #ffffff); text-align: right; direction: rtl; border-bottom: 1px solid var(--border, #e2e8f0); font-family: 'Cairo', sans-serif;">
          Additional plans can be purchased via billing system. اتصل بمسؤول إذا كنت تريد أن تفعل أي تغييرات مع الأشياء الخاصة بك.
        </div>

        <!-- Sub-tabs Nav Bar -->
        <div style="display: flex; gap: 20px; padding: 10px 20px; border-bottom: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); direction: rtl; font-family: 'Cairo', sans-serif;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; cursor: pointer;">المركبات</div>
          <div style="font-size: 12px; color: #64748b; cursor: pointer;" onclick="alert('Groups tab is available in Places tab')">Groups</div>
          <div style="font-size: 12px; color: #64748b; cursor: pointer;" onclick="alert('Drivers tab is under construction')">Drivers</div>
          <div style="font-size: 12px; color: #64748b; cursor: pointer;" onclick="alert('UHF/RFID tab is under construction')">UHF/RFID</div>
          <div style="font-size: 12px; color: #64748b; cursor: pointer;" onclick="alert('Trailers tab is under construction')">Trailers</div>
        </div>

        <!-- Search Bar -->
        <div style="padding: 10px 16px; border-bottom: 1px solid var(--border, #e2e8f0); display: flex; align-items: center; background: var(--bg-secondary, #f8fafc); direction: rtl;">
          <div style="position: relative; flex: 1;">
            <span style="position: absolute; right: 12px; top: 7px; color: var(--text-secondary, #64748b);">🔍</span>
            <input type="text" id="settings-vehicles-search" oninput="App.renderSettingsActiveTab(this.value)" placeholder="بحث" value="${searchQuery}" style="width: 100%; padding: 6px 36px 6px 12px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); font-family: 'Cairo', sans-serif;">
          </div>
        </div>

        <!-- Vehicles Table -->
        <div style="flex: 1; overflow-y: auto; direction: rtl; font-family: 'Cairo', sans-serif;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
            <thead>
              <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                <th style="padding: 8px 10px; text-align: center; width: 40px;"><input type="checkbox" style="cursor: pointer;"></th>
                <th style="padding: 8px 10px; font-weight: 700; width: 35%;">اسم <span style="font-size: 8px; color: #94a3b8;">▲</span></th>
                <th style="padding: 8px 10px; font-weight: 700; width: 25%;">الرقم التسلسلي</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center; width: 10%;">تفعيل</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center; width: 15%;">Expires on</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center; width: 15%;">عمليات</th>
              </tr>
            </thead>
            <tbody>
              ${vehicles.length === 0 ? `
                <tr>
                  <td colspan="6" style="padding: 20px; text-align: center; color: var(--text-secondary, #475569);">No records to view</td>
                </tr>
              ` : vehicles.map(v => `
                <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); height: 35px;">
                  <td style="padding: 8px 10px; text-align: center;"><input type="checkbox" style="cursor: pointer;"></td>
                  <td style="padding: 8px 10px; font-weight: 700;">${v.name}</td>
                  <td style="padding: 8px 10px; font-family: monospace; font-size: 12px; color: #475569;">${v.serial || ''}</td>
                  <td style="padding: 8px 10px; text-align: center;">
                    ${v.enabled ? '<span style="color: #22c55e; font-size: 12px; font-weight: bold;">✔️</span>' : '<span style="color: #ef4444; font-size: 12px; font-weight: bold;">❌</span>'}
                  </td>
                  <td style="padding: 8px 10px; text-align: center;">
                    ${v.enabled ? `<span style="color: #475569;">${v.expiresOn}</span>` : `<a href="#" onclick="App.openBillingModal(); return false;" style="color: #3b82f6; text-decoration: none; font-weight: bold;">تفعيل</a>`}
                  </td>
                  <td style="padding: 8px 10px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center; align-items: center; height: 100%;">
                      <span onclick="App.openEditDeviceModal('${v.id}')" style="cursor: pointer; font-size: 11px;" title="تعديل">✏️</span>
                      <span onclick="alert('نسخ المركبة متوفر قريباً')" style="cursor: pointer; font-size: 11px; font-weight: 700; color: #64748b;" title="نسخ">x2</span>
                      <span onclick="alert('أجهزة الاستشعار للمركبة')" style="cursor: pointer; font-size: 11px;" title="حساسات">📟</span>
                      <span onclick="alert('حذف المركبة')" style="cursor: pointer; font-size: 11px;" title="حذف">🗑️</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer Bottom Bar -->
        <div style="padding: 8px 16px; border-top: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); display: flex; justify-content: space-between; align-items: center; position: relative;">
          <!-- Actions on the Left -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button onclick="alert('إضافة مركبة جديدة متوفر قريباً')" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer;" title="إضافة">+</button>
            <button onclick="App.renderSettingsActiveTab()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
            <button onclick="alert('خيارات إضافية')" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="خيارات">⚙️</button>
          </div>

          <!-- Pagination and Stats -->
          <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: var(--text-secondary, #475569);">
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="cursor: pointer; opacity: 0.5;">|&lt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&lt;</span>
              <span>Page 1 of 1</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;|</span>
              <select style="font-size: 11px; padding: 2px; border: 1px solid var(--border); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary);">
                <option value="50">50</option>
              </select>
            </div>
            <span>View 1 - ${vehicles.length} of ${vehicles.length}</span>
          </div>
        </div>
      `;
    } else if (currentSettingsTab === 'templates') {
      let templates = FleetData.getTemplates();
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        templates = templates.filter(t => t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
      }

      container.innerHTML = `
        <!-- Search input -->
        <div style="padding: 10px 16px; border-bottom: 1px solid var(--border, #e2e8f0); display: flex; align-items: center; background: var(--bg-secondary, #f8fafc); direction: rtl;">
          <div style="position: relative; flex: 1;">
            <span style="position: absolute; right: 12px; top: 7px; color: var(--text-secondary, #64748b);">🔍</span>
            <input type="text" id="settings-templates-search" oninput="App.renderSettingsActiveTab(this.value)" placeholder="بحث" value="${searchQuery}" style="width: 100%; padding: 6px 36px 6px 12px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); font-family: 'Cairo', sans-serif;">
          </div>
        </div>

        <!-- Table content -->
        <div style="flex: 1; overflow-y: auto; direction: rtl; font-family: 'Cairo', sans-serif;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
            <thead>
              <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                <th style="padding: 8px 10px; text-align: center; width: 40px;"><input type="checkbox" style="cursor: pointer;" id="select-all-templates" onclick="App.toggleSelectAllTemplates(this)"></th>
                <th style="padding: 8px 10px; font-weight: 700; width: 35%;">اسم <span style="font-size: 8px; color: #94a3b8; cursor: pointer;">▲</span></th>
                <th style="padding: 8px 10px; font-weight: 700; width: 50%;">وصف</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center; width: 15%;">عمليات</th>
              </tr>
            </thead>
            <tbody>
              ${templates.length === 0 ? `
                <tr>
                  <td colspan="4" style="padding: 20px; text-align: center; color: var(--text-secondary, #475569);">No records to view</td>
                </tr>
              ` : templates.map(t => `
                <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); height: 35px;">
                  <td style="padding: 8px 10px; text-align: center;"><input type="checkbox" class="template-row-chk" data-id="${t.id}" style="cursor: pointer;"></td>
                  <td style="padding: 8px 10px; font-weight: 700;">${t.name}</td>
                  <td style="padding: 8px 10px; color: #475569;">${t.description || ''}</td>
                  <td style="padding: 8px 10px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center; align-items: center; height: 100%;">
                      <span onclick="App.openEditTemplateModal('${t.id}')" style="cursor: pointer; font-size: 11px;" title="تعديل">✏️</span>
                      <span onclick="App.deleteTemplate('${t.id}')" style="cursor: pointer; font-size: 11px;" title="حذف">🗑️</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Bottom Footer Bar -->
        <div style="padding: 8px 16px; border-top: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); display: flex; justify-content: space-between; align-items: center; position: relative;">
          <!-- Actions on the Left -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button onclick="App.openAddTemplateModal()" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer;" title="إضافة">+</button>
            <button onclick="App.renderSettingsActiveTab()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
            <button onclick="App.toggleTemplatesMenu(event)" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="خيارات">⚙️</button>
            
            <div id="settings-templates-menu" style="display: none; position: absolute; bottom: 34px; left: 16px; background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 25000; width: 120px; font-size: 12px; direction: rtl; text-align: right;">
              <div onclick="alert('استيراد القوالب متوفر قريباً')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📥</span> استيراد
              </div>
              <div onclick="alert('تصدير القوالب متوفر قريباً')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📤</span> تصدير
              </div>
              <div onclick="App.deleteSelectedTemplates()" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #ef4444;">
                <span>🗑️</span> حذف
              </div>
            </div>
          </div>

          <!-- Pagination and stats -->
          <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: var(--text-secondary, #475569); direction: ltr;">
            <!-- Pagination controls -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="cursor: pointer; opacity: 0.5;">|&lt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&lt;</span>
              <span>Page 1 of 1</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;|</span>
              <select style="font-size: 11px; padding: 2px; border: 1px solid var(--border); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary);">
                <option value="50">50</option>
              </select>
            </div>
            
            <!-- Status string -->
            <span>${templates.length === 0 ? 'No records to view' : `View 1 - ${templates.length} of ${templates.length}`}</span>
          </div>
        </div>
      `;
    } else if (currentSettingsTab === 'kml') {
      let kmlList = FleetData.getKml();
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        kmlList = kmlList.filter(k => k.name.toLowerCase().includes(q) || (k.description && k.description.toLowerCase().includes(q)));
      }

      container.innerHTML = `
        <!-- Top Info Note -->
        <div style="padding: 12px 16px; font-size: 13px; color: var(--text-secondary, #475569); text-align: left; background: var(--bg-primary, #ffffff); border-bottom: 1px solid var(--border, #e2e8f0);">
          KML allows to import and visualize additional data on the map.
        </div>

        <!-- Search input -->
        <div style="padding: 10px 16px; border-bottom: 1px solid var(--border, #e2e8f0); display: flex; align-items: center; background: var(--bg-secondary, #f8fafc); direction: rtl;">
          <div style="position: relative; flex: 1;">
            <span style="position: absolute; right: 12px; top: 7px; color: var(--text-secondary, #64748b);">🔍</span>
            <input type="text" id="settings-kml-search" oninput="App.renderSettingsActiveTab(this.value)" placeholder="بحث" value="${searchQuery}" style="width: 100%; padding: 6px 36px 6px 12px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); font-family: 'Cairo', sans-serif;">
          </div>
        </div>

        <!-- Table content -->
        <div style="flex: 1; overflow-y: auto; direction: rtl; font-family: 'Cairo', sans-serif;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
            <thead>
              <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                <th style="padding: 8px 10px; text-align: center; width: 40px;"><input type="checkbox" style="cursor: pointer;" id="select-all-kml" onclick="App.toggleSelectAllKml(this)"></th>
                <th style="padding: 8px 10px; font-weight: 700; width: 30%;">اسم <span style="font-size: 8px; color: #94a3b8; cursor: pointer;">▲</span></th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center; width: 15%;">تفعيل</th>
                <th style="padding: 8px 10px; font-weight: 700; width: 40%;">وصف</th>
                <th style="padding: 8px 10px; font-weight: 700; text-align: center; width: 15%;">عمليات</th>
              </tr>
            </thead>
            <tbody>
              ${kmlList.length === 0 ? `
                <tr>
                  <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary, #475569);">No records to view</td>
                </tr>
              ` : kmlList.map(k => `
                <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); height: 35px;">
                  <td style="padding: 8px 10px; text-align: center;"><input type="checkbox" class="kml-row-chk" data-id="${k.id}" style="cursor: pointer;"></td>
                  <td style="padding: 8px 10px; font-weight: 700;">${k.name}</td>
                  <td style="padding: 8px 10px; text-align: center;"><input type="checkbox" ${k.enabled ? 'checked' : ''} onclick="App.toggleKmlEnable('${k.id}', this.checked)" style="cursor: pointer;"></td>
                  <td style="padding: 8px 10px; color: #475569;">${k.description || ''}</td>
                  <td style="padding: 8px 10px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center; align-items: center; height: 100%;">
                      <span onclick="App.openEditKmlModal('${k.id}')" style="cursor: pointer; font-size: 11px;" title="تعديل">✏️</span>
                      <span onclick="App.deleteKml('${k.id}')" style="cursor: pointer; font-size: 11px;" title="حذف">🗑️</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Bottom Footer Bar -->
        <div style="padding: 8px 16px; border-top: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); display: flex; justify-content: space-between; align-items: center; position: relative;">
          <!-- Actions on the Left -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button onclick="App.openAddKmlModal()" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer;" title="إضافة">+</button>
            <button onclick="App.renderSettingsActiveTab()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
            <button onclick="App.toggleKmlMenu(event)" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="خيارات">⚙️</button>
            
            <div id="settings-kml-menu" style="display: none; position: absolute; bottom: 34px; left: 16px; background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 25000; width: 120px; font-size: 12px; direction: rtl; text-align: right;">
              <div onclick="alert('استيراد KML متوفر قريباً')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📥</span> استيراد
              </div>
              <div onclick="alert('تصدير KML متوفر قريباً')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
                <span>📤</span> تصدير
              </div>
              <div onclick="App.deleteSelectedKml()" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #ef4444;">
                <span>🗑️</span> حذف
              </div>
            </div>
          </div>

          <!-- Pagination and stats -->
          <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: var(--text-secondary, #475569); direction: ltr;">
            <!-- Pagination controls -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="cursor: pointer; opacity: 0.5;">|&lt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&lt;</span>
              <span>Page 1 of 1</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;</span>
              <span style="cursor: pointer; opacity: 0.5;">&gt;|</span>
              <select style="font-size: 11px; padding: 2px; border: 1px solid var(--border); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary);">
                <option value="50">50</option>
              </select>
            </div>
            
            <!-- Status string -->
            <span>${kmlList.length === 0 ? 'No records to view' : `View 1 - ${kmlList.length} of ${kmlList.length}`}</span>
          </div>
        </div>
      `;
    } else if (currentSettingsTab === 'sms') {
      let smsSettings = JSON.parse(localStorage.getItem('settings_sms') || '{"enabled":false,"type":"mobile","identifier":"56094537566631003005","queueCount":0,"httpUrl":"","httpMethod":"GET","httpHeaders":"","httpBody":""}');

      container.innerHTML = `
        <div style="flex: 1; padding: 24px 32px; overflow-y: auto; text-align: left; direction: ltr; display: flex; flex-direction: column; gap: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; background: #ffffff;">
          
          <h4 style="margin: 0 0 4px 0; color: #2563eb; font-size: 16px; font-weight: 600;">SMS Gateway</h4>
          
          <!-- Enable SMS Gateway -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Enable SMS Gateway</label>
            <input type="checkbox" id="sms-enabled" ${smsSettings.enabled ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
          </div>

          <!-- SMS Gateway type -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569;">SMS Gateway type</label>
            <select id="sms-type" onchange="App.handleSmsTypeChange(this.value)" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; box-sizing: border-box; cursor: pointer;">
              <option value="mobile" ${smsSettings.type === 'mobile' ? 'selected' : ''}>Mobile application</option>
              <option value="http" ${smsSettings.type === 'http' ? 'selected' : ''}>HTTP</option>
            </select>
          </div>

          <!-- Mobile Gateway Section -->
          <div id="sms-section-mobile" style="display: ${smsSettings.type === 'http' ? 'none' : 'flex'}; flex-direction: column; gap: 20px;">
            <h4 style="margin: 12px 0 0 0; color: #2563eb; font-size: 16px; font-weight: 600;">Mobile application</h4>
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; max-width: 800px;">
              Mobile application should be used which allows to use mobile device as SMS Gateway. Below SMS Gateway identifier should be entered in mobile application settings.
            </p>

            <!-- SMS Gateway identifier -->
            <div style="display: flex; align-items: center; min-height: 32px; margin-top: 4px;">
              <label style="width: 290px; font-size: 13px; color: #475569;">SMS Gateway identifier</label>
              <input type="text" id="sms-identifier" value="${smsSettings.identifier}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 4px; background: #f1f5f9; color: #475569; box-sizing: border-box; cursor: default;" readonly>
            </div>

            <!-- Total SMS in queue to send -->
            <div style="display: flex; align-items: center; min-height: 32px;">
              <label style="width: 290px; font-size: 13px; color: #475569;">Total SMS in queue to send</label>
              <div style="display: flex; align-items: center; gap: 110px;">
                <span id="sms-queue-count" style="font-size: 13px; color: #334155; min-width: 30px;">${smsSettings.queueCount}</span>
                <button type="button" onclick="App.clearSmsQueue()" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 40px; font-size: 13px; cursor: pointer; color: #475569; transition: background 0.2s, color 0.2s;">Clear</button>
              </div>
            </div>
          </div>

          <!-- HTTP Gateway Section -->
          <div id="sms-section-http" style="display: ${smsSettings.type === 'http' ? 'flex' : 'none'}; flex-direction: column; gap: 20px;">
            <h4 style="margin: 12px 0 0 0; color: #2563eb; font-size: 16px; font-weight: 600;">HTTP</h4>
            
            <!-- HTTP URL -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; min-height: 32px;">
                <label style="width: 290px; font-size: 13px; color: #475569;">HTTP URL</label>
                <input type="text" id="sms-http-url" value="${smsSettings.httpUrl || ''}" placeholder="https://example.com/api/send" style="width: 450px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; box-sizing: border-box; outline: none;">
              </div>
              <div style="margin-left: 290px; font-size: 11px; color: #64748b; margin-top: -2px;">
                Supported placeholders: {phone} (recipient number), {message} (text message)
              </div>
            </div>

            <!-- HTTP Method -->
            <div style="display: flex; align-items: center; min-height: 32px;">
              <label style="width: 290px; font-size: 13px; color: #475569;">HTTP Method</label>
              <select id="sms-http-method" onchange="App.handleHttpMethodChange(this.value)" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; box-sizing: border-box; cursor: pointer;">
                <option value="GET" ${smsSettings.httpMethod === 'GET' ? 'selected' : ''}>GET</option>
                <option value="POST" ${smsSettings.httpMethod === 'POST' ? 'selected' : ''}>POST</option>
              </select>
            </div>

            <!-- HTTP Headers -->
            <div style="display: flex; align-items: flex-start; min-height: 32px;">
              <label style="width: 290px; font-size: 13px; color: #475569; margin-top: 6px;">HTTP Headers</label>
              <textarea id="sms-http-headers" placeholder="Authorization: Bearer api_key&#10;Content-Type: application/json" style="width: 450px; height: 60px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; resize: vertical; box-sizing: border-box; font-family: monospace; line-height: 1.4;">${smsSettings.httpHeaders || ''}</textarea>
            </div>

            <!-- HTTP Body -->
            <div id="sms-http-body-container" style="display: ${smsSettings.httpMethod === 'POST' ? 'flex' : 'none'}; align-items: flex-start; min-height: 32px;">
              <label style="width: 290px; font-size: 13px; color: #475569; margin-top: 6px;">HTTP Body</label>
              <textarea id="sms-http-body" placeholder="{&#10;  &quot;to&quot;: &quot;{phone}&quot;,&#10;  &quot;text&quot;: &quot;{message}&quot;&#10;}" style="width: 450px; height: 80px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; resize: vertical; box-sizing: border-box; font-family: monospace; line-height: 1.4;">${smsSettings.httpBody || ''}</textarea>
            </div>
          </div>

        </div>
      `;
    } else if (currentSettingsTab === 'ui') {
      let uiSettings = JSON.parse(localStorage.getItem('settings_ui') || '{"pushNotifications":false,"chatSound":"alarm1.mp3","openAfterLogin":false,"mapStartupPosition":"remember_last","mapIconSize":"100","routeColor":"FF0000","routeHighlightColor":"0800FF","clusterHoverPopup":true,"collapsed":{"vehicles":false,"markers":false,"routes":false,"zones":false},"vehiclesDetails":"time_position","noConnectionColorEnabled":false,"noConnectionColor":"FFAEAE","stoppedColorEnabled":false,"stoppedColor":"FFAEAE","movingColorEnabled":false,"movingColor":"B0E57C","engineIdleColorEnabled":false,"engineIdleColor":"FFF0AA","dataListPosition":"bottom_icons","dataListItems":"all","lang":"ar","unitDistance":"km","unitCapacity":"liter","unitTemp":"celsius","currency":"SAR","timezone":"UTC+3","dstEnabled":false,"dstStartDate":"","dstStartTime":"00:00","dstEndDate":"","dstEndTime":"00:00"}');

      const allItems = customDropdownItems['ui-items-dropdown-menu'];
      if (!uiSettings.dataListItems || uiSettings.dataListItems === 'all') {
        selectedUiItems = [...allItems];
      } else if (uiSettings.dataListItems === 'none') {
        selectedUiItems = [];
      } else if (Array.isArray(uiSettings.dataListItems)) {
        selectedUiItems = [...uiSettings.dataListItems];
      } else {
        selectedUiItems = [...allItems];
      }

      const generateTimeOptions = (selected) => {
        let opts = '';
        for (let h = 0; h < 24; h++) {
          const hh = String(h).padStart(2, '0') + ':00';
          opts += `<option value="${hh}" ${selected === hh ? 'selected' : ''}>${hh}</option>`;
        }
        return opts;
      };

      container.innerHTML = `
        <div style="flex: 1; padding: 24px 32px; overflow-y: auto; text-align: left; direction: ltr; display: flex; flex-direction: column; gap: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; background: #ffffff;">
          
          <!-- Notifications Section -->
          <h4 style="margin: 0; color: #2563eb; font-size: 15px; font-weight: 600;">Notifications</h4>
          
          <!-- Push notifications -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Push notifications</label>
            <input type="checkbox" id="ui-push-notifications" ${uiSettings.pushNotifications ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
          </div>
          
          <!-- New chat message sound alert -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569;">New chat message sound alert</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <select id="ui-chat-sound" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
                <option value="alarm1.mp3" ${uiSettings.chatSound === 'alarm1.mp3' ? 'selected' : ''}>alarm1.mp3</option>
                <option value="alarm2.mp3" ${uiSettings.chatSound === 'alarm2.mp3' ? 'selected' : ''}>alarm2.mp3</option>
                <option value="alarm3.mp3" ${uiSettings.chatSound === 'alarm3.mp3' ? 'selected' : ''}>alarm3.mp3</option>
                <option value="beep.mp3" ${uiSettings.chatSound === 'beep.mp3' ? 'selected' : ''}>beep.mp3</option>
                <option value="notification.mp3" ${uiSettings.chatSound === 'notification.mp3' ? 'selected' : ''}>notification.mp3</option>
              </select>
              <button type="button" onclick="App.playUiSound()" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 30px; font-size: 13px; cursor: pointer; color: #475569; transition: background 0.2s, color 0.2s; font-family: 'Cairo', sans-serif;">لعب</button>
            </div>
          </div>

          <!-- Dashboard Section -->
          <h4 style="margin: 10px 0 0 0; color: #2563eb; font-size: 15px; font-weight: 600;">Dashboard</h4>
          
          <!-- Open after login -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Open after login</label>
            <input type="checkbox" id="ui-open-after-login" ${uiSettings.openAfterLogin ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
          </div>

          <!-- Map Section (خريطة) -->
          <h4 style="margin: 10px 0 0 0; color: #2563eb; font-size: 15px; font-weight: 600; font-family: 'Cairo', sans-serif;">خريطة</h4>
          
          <!-- Map startup position -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569;">Map startup position</label>
            <select id="ui-map-startup-position" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="remember_last" ${uiSettings.mapStartupPosition === 'remember_last' ? 'selected' : ''}>Remember last</option>
              <option value="fit_all" ${uiSettings.mapStartupPosition === 'fit_all' ? 'selected' : ''}>Fit all</option>
              <option value="default" ${uiSettings.mapStartupPosition === 'default' ? 'selected' : ''}>Default</option>
            </select>
          </div>

          <!-- Map icon size -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569;">Map icon size</label>
            <select id="ui-map-icon-size" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="100" ${uiSettings.mapIconSize === '100' ? 'selected' : ''}>100%</option>
              <option value="125" ${uiSettings.mapIconSize === '125' ? 'selected' : ''}>125%</option>
              <option value="150" ${uiSettings.mapIconSize === '150' ? 'selected' : ''}>150%</option>
              <option value="175" ${uiSettings.mapIconSize === '175' ? 'selected' : ''}>175%</option>
              <option value="200" ${uiSettings.mapIconSize === '200' ? 'selected' : ''}>200%</option>
            </select>
          </div>

          <!-- Route color (لون الطريق) -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">لون الطريق</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="text" id="ui-route-color" value="${uiSettings.routeColor}" oninput="App.updateColorInputBg(this)" onclick="document.getElementById('ui-route-color-picker').click()" style="width: 100px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #${uiSettings.routeColor}; color: ${getContrastColor(uiSettings.routeColor)}; text-align: center; font-weight: bold; outline: none; box-sizing: border-box; cursor: pointer;">
              <input type="color" id="ui-route-color-picker" value="#${uiSettings.routeColor}" oninput="App.syncColorPicker(this, 'ui-route-color')" style="width: 0px; height: 0px; visibility: hidden; position: absolute;">
            </div>
          </div>

          <!-- Route highlight color (الطريق تسليط الضوء على اللون) -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">الطريق تسليط الضوء على اللون</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="text" id="ui-route-highlight-color" value="${uiSettings.routeHighlightColor}" oninput="App.updateColorInputBg(this)" onclick="document.getElementById('ui-route-highlight-color-picker').click()" style="width: 100px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #${uiSettings.routeHighlightColor}; color: ${getContrastColor(uiSettings.routeHighlightColor)}; text-align: center; font-weight: bold; outline: none; box-sizing: border-box; cursor: pointer;">
              <input type="color" id="ui-route-highlight-color-picker" value="#${uiSettings.routeHighlightColor}" oninput="App.syncColorPicker(this, 'ui-route-highlight-color')" style="width: 0px; height: 0px; visibility: hidden; position: absolute;">
            </div>
          </div>

          <!-- Object details popup on cluster mouse hover -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Object details popup on cluster mouse hover</label>
            <input type="checkbox" id="ui-cluster-hover-popup" ${uiSettings.clusterHoverPopup ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
          </div>

          <!-- Groups Section -->
          <h4 style="margin: 10px 0 0 0; color: #2563eb; font-size: 15px; font-weight: 600;">Groups</h4>

          <!-- Collapsed -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Collapsed</label>
            <div style="display: flex; align-items: center; gap: 16px;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; user-select: none; font-family: 'Cairo', sans-serif;">
                <input type="checkbox" id="ui-collapse-vehicles" ${uiSettings.collapsed.vehicles ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;"> المركبات
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; user-select: none; font-family: 'Cairo', sans-serif;">
                <input type="checkbox" id="ui-collapse-markers" ${uiSettings.collapsed.markers ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;"> علامات
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; user-select: none;">
                <input type="checkbox" id="ui-collapse-routes" ${uiSettings.collapsed.routes ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;"> Routes
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; user-select: none; font-family: 'Cairo', sans-serif;">
                <input type="checkbox" id="ui-collapse-zones" ${uiSettings.collapsed.zones ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;"> المناطق
              </label>
            </div>
          </div>

          <!-- Vehicles List Section (لائحة المركبات) -->
          <h4 style="margin: 10px 0 0 0; color: #2563eb; font-size: 15px; font-weight: 600; font-family: 'Cairo', sans-serif;">لائحة المركبات</h4>

          <!-- Details -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569;">Details</label>
            <select id="ui-vehicles-details" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="time_position" ${uiSettings.vehiclesDetails === 'time_position' ? 'selected' : ''}>Time (position)</option>
              <option value="time_server"   ${uiSettings.vehiclesDetails === 'time_server'   ? 'selected' : ''}>Time (server)</option>
              <option value="speed"         ${uiSettings.vehiclesDetails === 'speed'         ? 'selected' : ''}>Speed</option>
              <option value="last_update"   ${uiSettings.vehiclesDetails === 'last_update'   ? 'selected' : ''}>Last update</option>
            </select>
          </div>

          <!-- No connection color -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">No connection color</label>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="ui-no-connection-color-enabled" ${uiSettings.noConnectionColorEnabled ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
              <input type="text" id="ui-no-connection-color" value="${uiSettings.noConnectionColor}" oninput="App.updateColorInputBg(this)" onclick="document.getElementById('ui-no-connection-color-picker').click()" style="width: 100px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #${uiSettings.noConnectionColor}; color: ${getContrastColor(uiSettings.noConnectionColor)}; text-align: center; font-weight: bold; outline: none; box-sizing: border-box; cursor: pointer;">
              <input type="color" id="ui-no-connection-color-picker" value="#${uiSettings.noConnectionColor}" oninput="App.syncColorPicker(this, 'ui-no-connection-color')" style="width: 0px; height: 0px; visibility: hidden; position: absolute;">
            </div>
          </div>

          <!-- Stopped color -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Stopped color</label>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="ui-stopped-color-enabled" ${uiSettings.stoppedColorEnabled ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
              <input type="text" id="ui-stopped-color" value="${uiSettings.stoppedColor}" oninput="App.updateColorInputBg(this)" onclick="document.getElementById('ui-stopped-color-picker').click()" style="width: 100px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #${uiSettings.stoppedColor}; color: ${getContrastColor(uiSettings.stoppedColor)}; text-align: center; font-weight: bold; outline: none; box-sizing: border-box; cursor: pointer;">
              <input type="color" id="ui-stopped-color-picker" value="#${uiSettings.stoppedColor}" oninput="App.syncColorPicker(this, 'ui-stopped-color')" style="width: 0px; height: 0px; visibility: hidden; position: absolute;">
            </div>
          </div>

          <!-- Moving color -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Moving color</label>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="ui-moving-color-enabled" ${uiSettings.movingColorEnabled ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
              <input type="text" id="ui-moving-color" value="${uiSettings.movingColor}" oninput="App.updateColorInputBg(this)" onclick="document.getElementById('ui-moving-color-picker').click()" style="width: 100px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #${uiSettings.movingColor}; color: ${getContrastColor(uiSettings.movingColor)}; text-align: center; font-weight: bold; outline: none; box-sizing: border-box; cursor: pointer;">
              <input type="color" id="ui-moving-color-picker" value="#${uiSettings.movingColor}" oninput="App.syncColorPicker(this, 'ui-moving-color')" style="width: 0px; height: 0px; visibility: hidden; position: absolute;">
            </div>
          </div>

          <!-- Engine idle color -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; user-select: none;">Engine idle color</label>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="ui-engine-idle-color-enabled" ${uiSettings.engineIdleColorEnabled ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
              <input type="text" id="ui-engine-idle-color" value="${uiSettings.engineIdleColor}" oninput="App.updateColorInputBg(this)" onclick="document.getElementById('ui-engine-idle-color-picker').click()" style="width: 100px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #${uiSettings.engineIdleColor}; color: ${getContrastColor(uiSettings.engineIdleColor)}; text-align: center; font-weight: bold; outline: none; box-sizing: border-box; cursor: pointer;">
              <input type="color" id="ui-engine-idle-color-picker" value="#${uiSettings.engineIdleColor}" oninput="App.syncColorPicker(this, 'ui-engine-idle-color')" style="width: 0px; height: 0px; visibility: hidden; position: absolute;">
            </div>
          </div>

          <!-- Data list Section -->
          <h4 style="margin: 10px 0 0 0; color: #2563eb; font-size: 15px; font-weight: 600;">Data list</h4>

          <!-- موقف -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">موقف</label>
            <select id="ui-data-list-position" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="bottom_icons" ${uiSettings.dataListPosition === 'bottom_icons' ? 'selected' : ''}>Bottom panel with icons</option>
              <option value="left"         ${uiSettings.dataListPosition === 'left'         ? 'selected' : ''}>Left panel</option>
              <option value="bottom"       ${uiSettings.dataListPosition === 'bottom'       ? 'selected' : ''}>Bottom panel</option>
              <option value="none"         ${uiSettings.dataListPosition === 'none'         ? 'selected' : ''}>None</option>
            </select>
          </div>

          <!-- Items -->
          <div style="display: flex; align-items: center; min-height: 32px; position: relative;">
            <label style="width: 290px; font-size: 13px; color: #475569;">Items</label>
            <div style="position: relative; width: 250px;">
              <div id="ui-items-dropdown-btn" onclick="App.toggleCustomDropdown('ui-items-dropdown-menu')" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 12px; font-size: 13px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #ffffff; color: #334155; box-sizing: border-box; height: 32px;">
                <span id="ui-items-dropdown-selected-text">All selected</span>
                <span style="font-size: 8px; color: #64748b;">▼</span>
              </div>
              <!-- Dropdown Menu -->
              <div id="ui-items-dropdown-menu" style="display: none; position: absolute; bottom: 34px; left: 0; right: 0; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; z-index: 25000; box-shadow: 0 -4px 12px rgba(0,0,0,0.15); flex-direction: column; max-height: 250px; overflow: hidden; text-align: left; direction: ltr;">
                <div style="padding: 4px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 4px; align-items: center; background: #f8fafc;">
                  <input type="text" oninput="App.filterCustomDropdown('ui-items-dropdown-menu', this.value)" placeholder="Search..." style="flex: 1; border: none; background: transparent; font-size: 12px; padding: 4px; outline: none; text-align: left; color: #0f172a;">
                  <span style="font-size: 12px; color: #64748b; padding: 0 4px;">🔍</span>
                </div>
                <div class="custom-dropdown-item-row" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; cursor: pointer; border-bottom: 1px solid #cbd5e1; font-weight: bold;" onclick="event.stopPropagation()">
                  <input type="checkbox" id="ui-items-chk-all" onchange="App.selectAllCustomDropdown('ui-items-dropdown-menu', this.checked)" style="cursor: pointer; width: 13px; height: 13px; margin: 0;">
                  <label for="ui-items-chk-all" style="cursor: pointer; user-select: none; flex: 1; text-align: left; color: #0f172a; font-size: 12px; font-family: 'Cairo', sans-serif;">[Select all]</label>
                </div>
                <div id="ui-items-dropdown-list" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column;">
                  <!-- Items populated dynamically -->
                </div>
              </div>
            </div>
          </div>

          <!-- آخر Section -->
          <h4 style="margin: 10px 0 0 0; color: #2563eb; font-size: 15px; font-weight: 600; font-family: 'Cairo', sans-serif;">آخر</h4>

          <!-- لغة -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">لغة</label>
            <select id="ui-lang" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="en" ${uiSettings.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="sq" ${uiSettings.lang === 'sq' ? 'selected' : ''}>Albanian</option>
              <option value="ar" ${uiSettings.lang === 'ar' ? 'selected' : ''}>Arabic</option>
              <option value="bn" ${uiSettings.lang === 'bn' ? 'selected' : ''}>Bengali</option>
              <option value="bg" ${uiSettings.lang === 'bg' ? 'selected' : ''}>Bulgarian</option>
              <option value="zh" ${uiSettings.lang === 'zh' ? 'selected' : ''}>Chinese</option>
              <option value="hr" ${uiSettings.lang === 'hr' ? 'selected' : ''}>Croatian</option>
              <option value="da" ${uiSettings.lang === 'da' ? 'selected' : ''}>Danish</option>
              <option value="nl" ${uiSettings.lang === 'nl' ? 'selected' : ''}>Dutch</option>
              <option value="et" ${uiSettings.lang === 'et' ? 'selected' : ''}>Estonian</option>
              <option value="fa" ${uiSettings.lang === 'fa' ? 'selected' : ''}>Farsi</option>
              <option value="fr" ${uiSettings.lang === 'fr' ? 'selected' : ''}>French</option>
              <option value="de" ${uiSettings.lang === 'de' ? 'selected' : ''}>German</option>
              <option value="el" ${uiSettings.lang === 'el' ? 'selected' : ''}>Greek</option>
              <option value="hu" ${uiSettings.lang === 'hu' ? 'selected' : ''}>Hungarian</option>
              <option value="lt" ${uiSettings.lang === 'lt' ? 'selected' : ''}>Lithuanian</option>
              <option value="mn" ${uiSettings.lang === 'mn' ? 'selected' : ''}>Mongolian</option>
              <option value="nl_NL" ${uiSettings.lang === 'nl_NL' ? 'selected' : ''}>Nederlands</option>
              <option value="no" ${uiSettings.lang === 'no' ? 'selected' : ''}>Norsk</option>
              <option value="pl" ${uiSettings.lang === 'pl' ? 'selected' : ''}>Polish</option>
              <option value="pt" ${uiSettings.lang === 'pt' ? 'selected' : ''}>Portuguese</option>
              <option value="ro" ${uiSettings.lang === 'ro' ? 'selected' : ''}>Romanian</option>
              <option value="ru" ${uiSettings.lang === 'ru' ? 'selected' : ''}>Russian</option>
              <option value="sr" ${uiSettings.lang === 'sr' ? 'selected' : ''}>Serbian</option>
              <option value="sk" ${uiSettings.lang === 'sk' ? 'selected' : ''}>Slovak</option>
              <option value="es" ${uiSettings.lang === 'es' ? 'selected' : ''}>Spanish</option>
              <option value="sv" ${uiSettings.lang === 'sv' ? 'selected' : ''}>Swedish</option>
              <option value="th" ${uiSettings.lang === 'th' ? 'selected' : ''}>Thai</option>
              <option value="tr" ${uiSettings.lang === 'tr' ? 'selected' : ''}>Turkish</option>
              <option value="vi" ${uiSettings.lang === 'vi' ? 'selected' : ''}>Vietnamese</option>
            </select>
          </div>

          <!-- وحدة مسافة -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">وحدة مسافة</label>
            <select id="ui-unit-distance" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="km" ${uiSettings.unitDistance === 'km' ? 'selected' : ''}>كيلومتر</option>
              <option value="mi" ${uiSettings.unitDistance === 'mi' ? 'selected' : ''}>ميل</option>
              <option value="nmi" ${uiSettings.unitDistance === 'nmi' ? 'selected' : ''}>Nautical mile</option>
            </select>
          </div>

          <!-- وحدة قدرة -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">وحدة قدرة</label>
            <select id="ui-unit-capacity" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="liter" ${uiSettings.unitCapacity === 'liter' ? 'selected' : ''}>لتر</option>
              <option value="gallon" ${uiSettings.unitCapacity === 'gallon' ? 'selected' : ''}>غالون</option>
            </select>
          </div>

          <!-- درجة الحرارة -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">درجة الحرارة</label>
            <select id="ui-unit-temp" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="celsius" ${uiSettings.unitTemp === 'celsius' ? 'selected' : ''}>سلسيوس</option>
              <option value="fahrenheit" ${uiSettings.unitTemp === 'fahrenheit' ? 'selected' : ''}>فهرنهايت</option>
            </select>
          </div>

          <!-- Currency -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569;">Currency</label>
            <input type="text" id="ui-currency" value="${uiSettings.currency}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; box-sizing: border-box;">
          </div>

          <!-- منطقة زمنية -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569; font-family: 'Cairo', sans-serif;">منطقة زمنية</label>
            <select id="ui-timezone" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; cursor: pointer;">
              <option value="UTC+3" ${uiSettings.timezone === 'UTC+3' ? 'selected' : ''}>(UTC +3:00)</option>
              <option value="UTC+2" ${uiSettings.timezone === 'UTC+2' ? 'selected' : ''}>(UTC +2:00)</option>
              <option value="UTC+4" ${uiSettings.timezone === 'UTC+4' ? 'selected' : ''}>(UTC +4:00)</option>
              <option value="UTC+0" ${uiSettings.timezone === 'UTC+0' ? 'selected' : ''}>(UTC +0:00)</option>
            </select>
          </div>

          <!-- Daylight saving time (DST) -->
          <div style="display: flex; align-items: center; min-height: 32px;">
            <label style="width: 290px; font-size: 13px; color: #475569;">Daylight saving time (DST)</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="ui-dst-enabled" ${uiSettings.dstEnabled ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px;">
              <input type="date" id="ui-dst-start-date" value="${uiSettings.dstStartDate}" style="padding: 4px 8px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; box-sizing: border-box; height: 28px;">
              <select id="ui-dst-start-time" style="padding: 4px 8px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; box-sizing: border-box; cursor: pointer; height: 28px;">
                ${generateTimeOptions(uiSettings.dstStartTime)}
              </select>
              <span style="color: #64748b;">-</span>
              <input type="date" id="ui-dst-end-date" value="${uiSettings.dstEndDate}" style="padding: 4px 8px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; box-sizing: border-box; height: 28px;">
              <select id="ui-dst-end-time" style="padding: 4px 8px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; color: #334155; outline: none; box-sizing: border-box; cursor: pointer; height: 28px;">
                ${generateTimeOptions(uiSettings.dstEndTime)}
              </select>
            </div>
          </div>

        </div>
      `;

      filterCustomDropdown('ui-items-dropdown-menu', '');
      
      const headerSpan = document.getElementById('ui-items-dropdown-selected-text');
      if (headerSpan) {
        if (selectedUiItems.length === 0) {
          headerSpan.textContent = 'Nothing selected';
        } else if (selectedUiItems.length === allItems.length) {
          headerSpan.textContent = 'All selected';
        } else {
          headerSpan.textContent = selectedUiItems.join(', ');
        }
      }
      
      const allCheckbox = document.getElementById('ui-items-chk-all');
      if (allCheckbox) {
        allCheckbox.checked = allItems.length > 0 && allItems.every(it => selectedUiItems.includes(it));
      }

    } else if (currentSettingsTab === 'account') {
      container.innerHTML = `
        <div style="flex:1; padding:24px; overflow-y:auto; direction:rtl; text-align:right; display:flex; flex-direction:column; gap:16px; max-width:500px;">
          <h4 style="margin-top:0; color:#3b82f6; font-size:14px;">إعدادات الحساب الشخصي</h4>
          
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; color:var(--text-secondary);">اسم المستخدم</label>
            <input type="text" value="مدير الأسطول" style="padding:8px 12px; font-size:12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-primary); color:var(--text-primary);">
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; color:var(--text-secondary);">البريد الإلكتروني</label>
            <input type="email" value="manager@fleettrack.pro" style="padding:8px 12px; font-size:12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-primary); color:var(--text-primary);">
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; color:var(--text-secondary);">اللغة المفضلة</label>
            <select style="padding:8px 12px; font-size:12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-primary); color:var(--text-primary);">
              <option value="ar">العربية (RTL)</option>
              <option value="en">English (LTR)</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; color:var(--text-secondary);">كلمة المرور الجديدة</label>
            <input type="password" placeholder="••••••••" style="padding:8px 12px; font-size:12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-primary); color:var(--text-primary);">
          </div>

          <button onclick="AlertsManager.showToast('تم حفظ تغييرات الحساب بنجاح', 'success', '💾')" style="background:#3b82f6; color:white; border:none; padding:10px; font-size:12px; font-weight:700; border-radius:6px; cursor:pointer; width:150px;">حفظ التغييرات</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-secondary); direction:rtl; gap:8px;">
          <span style="font-size:32px;">🛠️</span>
          <h4 style="margin:0; font-size:14px; font-weight:700;">تبويب ${currentSettingsTab.toUpperCase()}</h4>
          <p style="margin:0; font-size:11px;">هذا التبويب يحتوي على إعدادات متقدمة للنظام</p>
        </div>
      `;
    }
  }

  function openSettingsMainModal() {
    if (document.getElementById('settings-main-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'settings-main-modal';
    overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 20000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

    overlay.innerHTML = `
      <div style="width: 1000px; height: 650px; background: var(--bg-card, #ffffff); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
        
        <!-- Header -->
        <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 700;">إعدادات</h3>
          <span onclick="App.closeSettingsMainModal()" style="cursor: pointer; font-size: 24px; font-weight: bold; line-height: 1;">&times;</span>
        </div>

        <!-- Sub-tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); padding: 0 10px; overflow: hidden; height: 40px; direction: ltr; box-sizing: border-box;">
          <div style="display: flex; white-space: nowrap; overflow-x: auto; flex: 1; align-items: flex-end; height: 100%;">
            <div id="settings-tab-vehicles" onclick="App.switchSettingsTab('vehicles')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">المركبات</div>
            <div id="settings-tab-events" onclick="App.switchSettingsTab('events')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">أحداث</div>
            <div id="settings-tab-templates" onclick="App.switchSettingsTab('templates')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">Templates</div>
            <div id="settings-tab-kml" onclick="App.switchSettingsTab('kml')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">KML</div>
            <div id="settings-tab-sms" onclick="App.switchSettingsTab('sms')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">SMS</div>
            <div id="settings-tab-ui" onclick="App.switchSettingsTab('ui')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">واجهة المستخدم</div>
            <div id="settings-tab-account" onclick="App.switchSettingsTab('account')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">حسابي</div>
            <div id="settings-tab-subaccounts" onclick="App.switchSettingsTab('subaccounts')" style="padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary); line-height: 1.5; border: 1px solid transparent; border-bottom: none; display: flex; align-items: center; height: 32px; box-sizing: border-box; border-top-left-radius: 4px; border-top-right-radius: 4px;">حسابات فرعية</div>
          </div>
          
          <div id="settings-tab-save-container" style="display: none; align-items: center; height: 100%; border-left: 1px solid #e2e8f0; padding-left: 12px; margin-left: 10px;">
            <button onclick="App.saveSettingsTab()" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #334155; font-family: 'Cairo', sans-serif; height: 28px; box-sizing: border-box;">
              <span>💾</span> حفظ
            </button>
          </div>
        </div>

        <!-- Active Tab Pane -->
        <div id="settings-tab-pane" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-primary, #ffffff);">
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      const isDropdownClick = e.target.closest('#ui-items-dropdown-btn') || 
                              e.target.closest('#ui-items-dropdown-menu');
      if (!isDropdownClick) {
        const menu = document.getElementById('ui-items-dropdown-menu');
        if (menu) menu.style.display = 'none';
      }
    });

    currentSettingsTab = 'sms';
    switchSettingsTab('sms');
  }

  function closeSettingsMainModal() {
    const modal = document.getElementById('settings-main-modal');
    if (modal) modal.remove();
  }

  function openEditDeviceModal(id) {
    if (typeof editVehicle === 'function') {
      editVehicle(id);
    }
  }

  function openBillingModal() {
    if (document.getElementById('billing-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'billing-modal';
    overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 25000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

    overlay.innerHTML = `
      <div style="width: 850px; height: 580px; background: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; color: #334155; font-family: Arial, sans-serif; direction: ltr; text-align: left;">
        
        <!-- Header -->
        <div style="background: #84cc16; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; user-select: none;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold; font-family: sans-serif;">Billing</h3>
          <span onclick="App.closeBillingModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; line-height: 1;">✕</span>
        </div>

        <!-- Description -->
        <div style="padding: 16px 20px; font-size: 13px; color: #475569; line-height: 1.5; background: #ffffff;">
          Billing allows to purchase additional plans and extend object activity periods. Purchased plans will appear in below list after payment is confirmed, sometimes it may take a while.
        </div>

        <!-- Table Container -->
        <div style="flex: 1; overflow-y: auto; padding: 0 20px; background: #ffffff; display: flex; flex-direction: column; position: relative;">
          <!-- Table Header -->
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; height: 35px; user-select: none;">
                <th style="padding: 8px 12px; font-weight: normal; border-right: 1px solid #cbd5e1; width: 18%;">وقت <span style="font-size: 9px; color: #94a3b8;">▼</span></th>
                <th style="padding: 8px 12px; font-weight: normal; border-right: 1px solid #cbd5e1; width: 35%;">اسم</th>
                <th style="padding: 8px 12px; font-weight: normal; border-right: 1px solid #cbd5e1; width: 15%;">المركبات</th>
                <th style="padding: 8px 12px; font-weight: normal; border-right: 1px solid #cbd5e1; width: 15%;">فترة</th>
                <th style="padding: 8px 12px; font-weight: normal; width: 17%;">Price</th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty Area (No records to view) -->
            </tbody>
          </table>
          
          <!-- Scrollable empty area track representation -->
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 250px;">
            <!-- Placeholder for no records -->
          </div>
        </div>

        <!-- Footer Bottom Bar -->
        <div style="padding: 8px 16px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-family: Arial, sans-serif; color: #475569; user-select: none;">
          <!-- Actions on the Left -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button onclick="alert('جدولة شراء خطة جديدة')" style="background: #84cc16; color: white; border: none; width: 34px; height: 30px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; cursor: pointer;" title="إضافة">+</button>
            <button onclick="alert('تحديث البيانات')" style="background: transparent; border: 1px solid #cbd5e1; width: 30px; height: 30px; border-radius: 3px; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
          </div>

          <!-- Pagination -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="cursor: pointer; opacity: 0.5; font-weight: bold; font-family: monospace;">|&lt;</span>
            <span style="cursor: pointer; opacity: 0.5; font-weight: bold; font-family: monospace;">&lt;</span>
            <span style="font-size: 12px; display: flex; align-items: center; gap: 4px;">Page <span style="border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 3px; background: #ffffff;">1</span> of 1</span>
            <span style="cursor: pointer; opacity: 0.5; font-weight: bold; font-family: monospace;">&gt;</span>
            <span style="cursor: pointer; opacity: 0.5; font-weight: bold; font-family: monospace;">&gt;|</span>
            <select style="font-size: 12px; padding: 2px 4px; border: 1px solid #cbd5e1; border-radius: 3px; background: #ffffff; color: #334155; margin-left: 5px;">
              <option value="50">50</option>
            </select>
          </div>

          <!-- Stats on the Right -->
          <div style="color: #64748b;">
            No records to view
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
  }

  function closeBillingModal() {
    const modal = document.getElementById('billing-modal');
    if (modal) modal.remove();
  }

  function openAddSettingsEventModal() {
    openEditSettingsEventModal(null);
  }

  let currentEditingEventParams = [];
  let selectedSettingsEventVehicles = [];
  let selectedSettingsEventRoutes = [];
  let selectedSettingsEventZones = [];

  const customDropdownItems = {
    'settings-event-vehicles-menu': [
      'السيارة الأولى', 'السيارة الثانية', 'السيارة الثالثة', 'السيارة الرابعة', 'السيارة الخامسة',
      'السيارة السادسة', 'السيارة السابعة', 'السيارة الثامنة', 'السيارة التاسعة', 'السيارة العاشرة'
    ],
    'settings-event-routes-menu': [
      'مسار الرياض', 'مسار الدمام', 'مسار جدة'
    ],
    'settings-event-zones-menu': [
      'فك تجميعها', 'السكن لبن', 'سكن التقبة', 'طيبة 1', 'فرع اشبيلية', 'فرع الخرج',
      'فرع الرمال', 'فرع الشفا', 'فرع العزيزية', 'فرع الفاخرية', 'فرع النرجس', 'فرع النسيم',
      'فرع النوفيتيل', 'فرع الهيلتون'
    ],
    'ui-items-dropdown-menu': [
      'عام', 'عداد المسافات', 'ساعات المحرك', 'حالة', 'نموذج', 'VIN', 'لوحة', 'SIM رقم بطاقة',
      'سائق', 'Trailer', 'موقع', 'Time (position)', 'Time (server)', 'عنوان', 'موقف',
      'السرعة', 'ارتفاع', 'زاوية', 'أقرب منطقة', 'أقرب علامة'
    ]
  };

  function toggleCustomDropdown(menuId) {
    ['settings-event-vehicles-menu', 'settings-event-routes-menu', 'settings-event-zones-menu', 'ui-items-dropdown-menu'].forEach(id => {
      if (id !== menuId) {
        const otherMenu = document.getElementById(id);
        if (otherMenu) otherMenu.style.display = 'none';
      }
    });

    const menu = document.getElementById(menuId);
    if (!menu) return;
    if (menu.style.display === 'none') {
      menu.style.display = 'flex';
      const input = menu.querySelector('input');
      if (input) {
        input.value = '';
        filterCustomDropdown(menuId, '');
      }
    } else {
      menu.style.display = 'none';
    }
  }

  function filterCustomDropdown(menuId, query) {
    const listDiv = document.getElementById(menuId.replace('-menu', '-list'));
    if (!listDiv) return;

    const items = customDropdownItems[menuId] || [];
    let selectedList = [];
    if (menuId.includes('vehicles')) selectedList = selectedSettingsEventVehicles;
    else if (menuId.includes('routes')) selectedList = selectedSettingsEventRoutes;
    else if (menuId.includes('zones')) selectedList = selectedSettingsEventZones;
    else if (menuId === 'ui-items-dropdown-menu') selectedList = selectedUiItems;

    const filtered = items.filter(item => item.toLowerCase().includes(query.toLowerCase()));

    listDiv.innerHTML = filtered.map(item => {
      const isChecked = selectedList.includes(item);
      const itemId = `${menuId.replace('-menu', '')}-chk-${item.replace(/\s+/g, '-')}`;
      const isUiItems = menuId === 'ui-items-dropdown-menu';

      return `
        <div class="custom-dropdown-item-row" style="display: flex; align-items: center; gap: 8px; padding: ${isUiItems ? '6px 12px' : '4px 12px'}; cursor: pointer; font-size: 11px;" onclick="event.stopPropagation()">
          <input type="checkbox" id="${itemId}" ${isChecked ? 'checked' : ''} onchange="App.updateCustomDropdownSelection('${menuId}', '${item}', this.checked)" style="cursor: pointer; width: 13px; height: 13px; margin: 0;">
          <label for="${itemId}" style="cursor: pointer; user-select: none; flex: 1; text-align: ${isUiItems ? 'left' : 'right'}; color: var(--text-primary); font-size: ${isUiItems ? '13px' : '12px'}; font-family: ${isUiItems ? "'Cairo', sans-serif" : 'inherit'};">${item}</label>
        </div>
      `;
    }).join('');
  }

  function updateCustomDropdownSelection(menuId, itemVal, checked) {
    let selectedList = [];
    if (menuId.includes('vehicles')) selectedList = selectedSettingsEventVehicles;
    else if (menuId.includes('routes')) selectedList = selectedSettingsEventRoutes;
    else if (menuId.includes('zones')) selectedList = selectedSettingsEventZones;
    else if (menuId === 'ui-items-dropdown-menu') selectedList = selectedUiItems;

    if (checked) {
      if (!selectedList.includes(itemVal)) selectedList.push(itemVal);
    } else {
      const idx = selectedList.indexOf(itemVal);
      if (idx !== -1) selectedList.splice(idx, 1);
    }

    const allCheckbox = document.getElementById(
      menuId.includes('vehicles') ? 'vehicles-chk-all' : 
      menuId.includes('routes') ? 'routes-chk-all' : 
      menuId.includes('zones') ? 'zones-chk-all' : 'ui-items-chk-all'
    );
    const items = customDropdownItems[menuId] || [];
    if (allCheckbox) {
      allCheckbox.checked = items.length > 0 && items.every(it => selectedList.includes(it));
    }

    const headerSpan = document.getElementById(menuId.replace('-menu', '-selected-text'));
    if (headerSpan) {
      if (selectedList.length === 0) {
        headerSpan.textContent = 'Nothing selected';
      } else if (selectedList.length === items.length) {
        headerSpan.textContent = 'All selected';
      } else {
        headerSpan.textContent = selectedList.join(', ');
      }
    }
  }

  function selectAllCustomDropdown(menuId, checked) {
    let selectedList = [];
    if (menuId.includes('vehicles')) {
      selectedSettingsEventVehicles = checked ? [...customDropdownItems[menuId]] : [];
      selectedList = selectedSettingsEventVehicles;
    } else if (menuId.includes('routes')) {
      selectedSettingsEventRoutes = checked ? [...customDropdownItems[menuId]] : [];
      selectedList = selectedSettingsEventRoutes;
    } else if (menuId.includes('zones')) {
      selectedSettingsEventZones = checked ? [...customDropdownItems[menuId]] : [];
      selectedList = selectedSettingsEventZones;
    } else if (menuId === 'ui-items-dropdown-menu') {
      selectedUiItems.length = 0;
      if (checked) {
        customDropdownItems[menuId].forEach(it => selectedUiItems.push(it));
      }
      selectedList = selectedUiItems;
    }

    const items = customDropdownItems[menuId] || [];
    items.forEach(item => {
      const itemId = `${menuId.replace('-menu', '')}-chk-${item.replace(/\s+/g, '-')}`;
      const chk = document.getElementById(itemId);
      if (chk) chk.checked = checked;
    });

    const headerSpan = document.getElementById(menuId.replace('-menu', '-selected-text'));
    if (headerSpan) {
      headerSpan.textContent = checked ? 'All selected' : 'Nothing selected';
    }
  }

  function openEditSettingsEventModal(eventId = null) {
    let eventData = {
      name: '',
      enabled: true,
      system: true,
      push: true,
      email: false,
      sms: false,
      type: 'نجدة',
      vehicles: 'Nothing selected',
      depRoutes: 'Off',
      routes: 'Nothing selected',
      depZones: 'Off',
      zones: 'Nothing selected',
      timePeriod: '',
      speedLimit: '',
      params: [],
      hasDuration: false,
      durationVal: 0,
      weekDays: [true, true, true, true, true, true, true],
      hasDaytime: false,
      daytimeDetails: {
        monday: { enabled: false, start: '00:00', end: '24:00' },
        tuesday: { enabled: false, start: '00:00', end: '24:00' },
        wednesday: { enabled: false, start: '00:00', end: '24:00' },
        thursday: { enabled: false, start: '00:00', end: '24:00' },
        friday: { enabled: false, start: '00:00', end: '24:00' },
        saturday: { enabled: false, start: '00:00', end: '24:00' },
        sunday: { enabled: false, start: '00:00', end: '24:00' }
      }
    };

    if (eventId) {
      const found = getSettingsEvents().find(e => e.id === eventId);
      if (found) {
        eventData = { ...eventData, ...found };
      }
    }

    currentEditingEventParams = eventData.params || [];
    selectedSettingsEventVehicles = eventData.vehicles && eventData.vehicles !== 'Nothing selected' ? eventData.vehicles.split(', ') : [];
    selectedSettingsEventRoutes = eventData.routes && eventData.routes !== 'Nothing selected' ? eventData.routes.split(', ') : [];
    selectedSettingsEventZones = eventData.zones && eventData.zones !== 'Nothing selected' ? eventData.zones.split(', ') : [];

    const overlay = document.createElement('div');
    overlay.id = 'edit-settings-event-modal';
    overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 30000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

    overlay.innerHTML = `
      <div style="width: 850px; background: var(--bg-card, #ffffff); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); max-height: 90vh;">
        
        <!-- Header -->
        <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 700;">خصائص الحدث</h3>
          <span onclick="document.getElementById('edit-settings-event-modal').remove()" style="cursor: pointer; font-size: 24px; font-weight: bold; line-height: 1;">&times;</span>
        </div>

        <!-- Sub-tabs -->
        <div style="display: flex; background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); direction: rtl; padding: 0 10px;">
          <div id="submodal-tab-main" onclick="App.switchSubmodalTab('main')" style="padding: 10px 14px; font-size: 12px; cursor: pointer; color: #3b82f6; border-bottom: 3px solid #3b82f6; font-weight: 700;">رئيسي</div>
          <div id="submodal-tab-time" onclick="App.switchSubmodalTab('time')" style="padding: 10px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary);">وقت</div>
          <div id="submodal-tab-notifications" onclick="App.switchSubmodalTab('notifications')" style="padding: 10px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary);">Notifications</div>
          <div id="submodal-tab-webhook" onclick="App.switchSubmodalTab('webhook')" style="padding: 10px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary);">Webhook</div>
          <div id="submodal-tab-commands" onclick="App.switchSubmodalTab('commands')" style="padding: 10px 14px; font-size: 12px; cursor: pointer; color: var(--text-secondary);">ارسال أوامر المركبة</div>
        </div>

        <!-- Main Tab Pane -->
        <div id="submodal-pane-main" style="display: flex; gap: 20px; padding: 20px; direction: rtl; text-align: right; overflow-y: auto; flex: 1;">
          
          <!-- Left Column (Form Inputs) -->
          <div style="flex: 1.2; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; margin-bottom: 6px;">حدث</div>
            
            <!-- Enable -->
            <div style="display: flex; align-items: center; min-height: 28px;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">تفعيل</label>
              <input type="checkbox" id="setting-event-enabled" ${eventData.enabled ? 'checked' : ''} style="cursor: pointer;">
            </div>

            <!-- Name -->
            <div style="display: flex; align-items: center; min-height: 28px;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">اسم</label>
              <input type="text" id="setting-event-name" value="${eventData.name}" style="flex: 1; padding: 5px 10px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
            </div>

            <!-- Type -->
            <div style="display: flex; align-items: center; min-height: 28px;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">نوع</label>
              <select id="setting-event-type" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); height: 28px;">
                <option value="نجدة" ${eventData.type === 'نجدة' ? 'selected' : ''}>نجدة</option>
                <option value="تشغيل سوار" ${eventData.type === 'تشغيل سوار' ? 'selected' : ''}>تشغيل سوار</option>
                <option value="اقفال سوار" ${eventData.type === 'اقفال سوار' ? 'selected' : ''}>اقفال سوار</option>
                <option value="Dismount" ${eventData.type === 'Dismount' ? 'selected' : ''}>Dismount</option>
                <option value="Disassemble" ${eventData.type === 'Disassemble' ? 'selected' : ''}>Disassemble</option>
                <option value="Door" ${eventData.type === 'Door' ? 'selected' : ''}>Door</option>
                <option value="هبوط" ${eventData.type === 'هبوط' ? 'selected' : ''}>هبوط</option>
                <option value="صدمة" ${eventData.type === 'صدمة' ? 'selected' : ''}>صدمة</option>
                <option value="سحب" ${eventData.type === 'سحب' ? 'selected' : ''}>سحب</option>
                <option value="انقطاع التيار الكهربائي" ${eventData.type === 'انقطاع التيار الكهربائي' ? 'selected' : ''}>انقطاع التيار الكهربائي</option>
                <option value="GPS antenna cut" ${eventData.type === 'GPS antenna cut' ? 'selected' : ''}>GPS antenna cut</option>
                <option value="التشويش إشارة" ${eventData.type === 'التشويش إشارة' ? 'selected' : ''}>التشويش إشارة</option>
                <option value="Low DC" ${eventData.type === 'Low DC' ? 'selected' : ''}>Low DC</option>
                <option value="البطارية منخفضة" ${eventData.type === 'البطارية منخفضة' ? 'selected' : ''}>البطارية منخفضة</option>
                <option value="Connection: Yes" ${eventData.type === 'Connection: Yes' ? 'selected' : ''}>Connection: Yes</option>
                <option value="Connection: No" ${eventData.type === 'Connection: No' ? 'selected' : ''}>Connection: No</option>
                <option value="GPS: Yes" ${eventData.type === 'GPS: Yes' ? 'selected' : ''}>GPS: Yes</option>
                <option value="GPS: No" ${eventData.type === 'GPS: No' ? 'selected' : ''}>GPS: No</option>
                <option value="توقف" ${eventData.type === 'توقف' ? 'selected' : ''}>توقف</option>
                <option value="متحرك" ${eventData.type === 'متحرك' ? 'selected' : ''}>متحرك</option>
                <option value="محرك راكد" ${eventData.type === 'محرك راكد' ? 'selected' : ''}>محرك راكد</option>
                <option value="السرعة الزائدة" ${eventData.type === 'السرعة الزائدة' ? 'selected' : ''}>السرعة الزائدة</option>
                <option value="تحت سرعة" ${eventData.type === 'تحت سرعة' ? 'selected' : ''}>تحت سرعة</option>
                <option value="التسارع القوي" ${eventData.type === 'التسارع القوي' ? 'selected' : ''}>التسارع القوي</option>
                <option value="الإيقاف القوي" ${eventData.type === 'الإيقاف القوي' ? 'selected' : ''}>الإيقاف القوي</option>
                <option value="الانعطاف القوي" ${eventData.type === 'الانعطاف القوي' ? 'selected' : ''}>الانعطاف القوي</option>
                <option value="Driver change" ${eventData.type === 'Driver change' ? 'selected' : ''}>Driver change</option>
                <option value="Trailer change" ${eventData.type === 'Trailer change' ? 'selected' : ''}>Trailer change</option>
                <option value="الضبط" ${eventData.type === 'الضبط' ? 'selected' : ''}>الضبط</option>
                <option value="الاستشعار" ${eventData.type === 'الاستشعار' ? 'selected' : ''}>الاستشعار</option>
                <option value="خدمة" ${eventData.type === 'خدمة' ? 'selected' : ''}>خدمة</option>
                <option value="DTC (Diagnostic Trouble Codes)" ${eventData.type === 'DTC (Diagnostic Trouble Codes)' ? 'selected' : ''}>DTC (Diagnostic Trouble Codes)</option>
                <option value="Route in" ${eventData.type === 'Route in' ? 'selected' : ''}>Route in</option>
                <option value="Route out" ${eventData.type === 'Route out' ? 'selected' : ''}>Route out</option>
                <option value="داخل المنطقة" ${eventData.type === 'داخل المنطقة' ? 'selected' : ''}>داخل المنطقة</option>
                <option value="خارج المنطقة" ${eventData.type === 'خارج المنطقة' ? 'selected' : ''}>خارج المنطقة</option>
              </select>
            </div>

            <!-- Vehicles (Custom multi-select) -->
            <div style="display: flex; align-items: center; min-height: 28px; position: relative;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">المركبات</label>
              <div style="flex: 1; position: relative;">
                <div id="settings-event-vehicles-btn" onclick="App.toggleCustomDropdown('settings-event-vehicles-menu')" style="border: 1px solid var(--border, #e2e8f0); border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; height: 28px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
                  <span id="settings-event-vehicles-selected-text">Nothing selected</span>
                  <span>▼</span>
                </div>
                <div id="settings-event-vehicles-menu" style="display: none; position: absolute; top: 32px; left: 0; right: 0; background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 4px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-direction: column; max-height: 250px; overflow: hidden; text-align: right;">
                  <div style="display: flex; align-items: center; padding: 4px; border-bottom: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); gap: 4px;">
                    <span style="font-size: 12px; padding-right: 4px;">🔍</span>
                    <input type="text" oninput="App.filterCustomDropdown('settings-event-vehicles-menu', this.value)" placeholder="بحث..." style="flex: 1; border: none; background: transparent; font-size: 11px; padding: 4px; outline: none; direction: rtl; text-align: right; color: var(--text-primary);">
                  </div>
                  <div style="overflow-y: auto; flex: 1; padding: 4px 0;">
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 12px; cursor: pointer; font-size: 11px;" onclick="event.stopPropagation()">
                      <input type="checkbox" id="vehicles-chk-all" onchange="App.selectAllCustomDropdown('settings-event-vehicles-menu', this.checked)" style="cursor: pointer; width: 13px; height: 13px; margin: 0;">
                      <label for="vehicles-chk-all" style="cursor: pointer; user-select: none; font-size: 12px; color: var(--text-primary);">[Select all]</label>
                    </div>
                    <div style="height: 1px; background: var(--border, #e2e8f0); margin: 4px 0;"></div>
                    <div id="settings-event-vehicles-list">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Depending on routes -->
            <div style="display: flex; align-items: center; min-height: 28px;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">Depending on routes</label>
              <select id="setting-event-deproutes" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); height: 28px;">
                <option value="Off" ${eventData.depRoutes === 'Off' ? 'selected' : ''}>Off</option>
                <option value="In selected routes" ${eventData.depRoutes === 'In selected routes' ? 'selected' : ''}>In selected routes</option>
                <option value="Out of selected routes" ${eventData.depRoutes === 'Out of selected routes' ? 'selected' : ''}>Out of selected routes</option>
              </select>
            </div>

            <!-- Routes (Custom multi-select) -->
            <div style="display: flex; align-items: center; min-height: 28px; position: relative;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">Routes</label>
              <div style="flex: 1; position: relative;">
                <div id="settings-event-routes-btn" onclick="App.toggleCustomDropdown('settings-event-routes-menu')" style="border: 1px solid var(--border, #e2e8f0); border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; height: 28px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
                  <span id="settings-event-routes-selected-text">Nothing selected</span>
                  <span>▼</span>
                </div>
                <div id="settings-event-routes-menu" style="display: none; position: absolute; top: 32px; left: 0; right: 0; background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 4px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-direction: column; max-height: 250px; overflow: hidden; text-align: right;">
                  <div style="display: flex; align-items: center; padding: 4px; border-bottom: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); gap: 4px;">
                    <span style="font-size: 12px; padding-right: 4px;">🔍</span>
                    <input type="text" oninput="App.filterCustomDropdown('settings-event-routes-menu', this.value)" placeholder="بحث..." style="flex: 1; border: none; background: transparent; font-size: 11px; padding: 4px; outline: none; direction: rtl; text-align: right; color: var(--text-primary);">
                  </div>
                  <div style="overflow-y: auto; flex: 1; padding: 4px 0;">
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 12px; cursor: pointer; font-size: 11px;" onclick="event.stopPropagation()">
                      <input type="checkbox" id="routes-chk-all" onchange="App.selectAllCustomDropdown('settings-event-routes-menu', this.checked)" style="cursor: pointer; width: 13px; height: 13px; margin: 0;">
                      <label for="routes-chk-all" style="cursor: pointer; user-select: none; font-size: 12px; color: var(--text-primary);">[Select all]</label>
                    </div>
                    <div style="height: 1px; background: var(--border, #e2e8f0); margin: 4px 0;"></div>
                    <div id="settings-event-routes-list">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Depending on zones -->
            <div style="display: flex; align-items: center; min-height: 28px;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">Depending on zones</label>
              <select id="setting-event-depzones" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); height: 28px;">
                <option value="Off" ${eventData.depZones === 'Off' ? 'selected' : ''}>Off</option>
                <option value="In selected zones" ${eventData.depZones === 'In selected zones' ? 'selected' : ''}>In selected zones</option>
                <option value="Out of selected zones" ${eventData.depZones === 'Out of selected zones' ? 'selected' : ''}>Out of selected zones</option>
              </select>
            </div>

            <!-- Zones (Custom multi-select) -->
            <div style="display: flex; align-items: center; min-height: 28px; position: relative;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">المناطق</label>
              <div style="flex: 1; position: relative;">
                <div id="settings-event-zones-btn" onclick="App.toggleCustomDropdown('settings-event-zones-menu')" style="border: 1px solid var(--border, #e2e8f0); border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; height: 28px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
                  <span id="settings-event-zones-selected-text">Nothing selected</span>
                  <span>▼</span>
                </div>
                <div id="settings-event-zones-menu" style="display: none; position: absolute; top: 32px; left: 0; right: 0; background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 4px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-direction: column; max-height: 250px; overflow: hidden; text-align: right;">
                  <div style="display: flex; align-items: center; padding: 4px; border-bottom: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); gap: 4px;">
                    <span style="font-size: 12px; padding-right: 4px;">🔍</span>
                    <input type="text" oninput="App.filterCustomDropdown('settings-event-zones-menu', this.value)" placeholder="بحث..." style="flex: 1; border: none; background: transparent; font-size: 11px; padding: 4px; outline: none; direction: rtl; text-align: right; color: var(--text-primary);">
                  </div>
                  <div style="overflow-y: auto; flex: 1; padding: 4px 0;">
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 12px; cursor: pointer; font-size: 11px;" onclick="event.stopPropagation()">
                      <input type="checkbox" id="zones-chk-all" onchange="App.selectAllCustomDropdown('settings-event-zones-menu', this.checked)" style="cursor: pointer; width: 13px; height: 13px; margin: 0;">
                      <label for="zones-chk-all" style="cursor: pointer; user-select: none; font-size: 12px; color: var(--text-primary);">[Select all]</label>
                    </div>
                    <div style="height: 1px; background: var(--border, #e2e8f0); margin: 4px 0;"></div>
                    <div id="settings-event-zones-list">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Time period -->
            <div style="display: flex; align-items: center; min-height: 28px;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">Time period (min)</label>
              <input type="text" id="setting-event-timeperiod" value="${eventData.timePeriod}" style="flex: 1; padding: 5px 10px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
            </div>

            <!-- Speed Limit -->
            <div style="display: flex; align-items: center; min-height: 28px;">
              <label style="width: 140px; font-size: 12px; color: var(--text-secondary, #475569);">حد السرعة (كيلومترًا)</label>
              <input type="text" id="setting-event-speedlimit" value="${eventData.speedLimit}" style="flex: 1; padding: 5px 10px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
            </div>

          </div>

          <!-- Right Column (Parameters and Sensors) -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; margin-bottom: 6px;">Parameters and sensors</div>
            
            <!-- Grid Scrollbox -->
            <div style="flex: 1; min-height: 200px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; overflow-y: auto; background: var(--bg-secondary, #f8fafc); display: flex; flex-direction: column;">
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="background: var(--border, #e2e8f0); color: var(--text-secondary, #475569); border-bottom: 1px solid var(--border, #e2e8f0);">
                    <th style="padding: 6px 8px; font-weight: 700; text-align: right; width: 45%;">Source</th>
                    <th style="padding: 6px 8px; font-weight: 700; text-align: right; width: 35%;">قيمة</th>
                    <th style="padding: 6px 8px; font-weight: 700; text-align: center; width: 20%;">حذف</th>
                  </tr>
                </thead>
                <tbody id="event-params-grid-body">
                  <!-- Rendered dynamically -->
                </tbody>
              </table>
            </div>

            <!-- Row Addition Controls -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <select id="event-param-source" style="flex: 1; padding: 4px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
                <option value="Speed">Speed</option>
                <option value="Fuel">Fuel</option>
                <option value="Battery">Battery</option>
                <option value="Ignition">Ignition</option>
              </select>
              <select id="event-param-op" style="width: 60px; padding: 4px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
                <option value="=">=</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
              </select>
              <input type="text" id="event-param-value" placeholder="القيمة" style="width: 80px; padding: 4px 6px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
              <button type="button" onclick="App.addEventParamRow()" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
            </div>

          </div>

        </div>

        <!-- Time Tab Pane -->
        <div id="submodal-pane-time" style="display: none; flex-direction: column; gap: 12px; padding: 20px; direction: rtl; text-align: right; overflow-y: auto; flex: 1; font-family: 'Cairo', sans-serif;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; margin-bottom: 6px;">وقت</div>
          
          <!-- Duration from last event in minutes -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">Duration from last event in minutes</label>
            <input type="checkbox" id="setting-event-has-duration" onchange="App.toggleEventTimeDuration(this.checked)" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
            <input type="number" id="setting-event-duration-val" value="0" disabled style="width: 80px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-secondary); color: var(--text-primary);">
          </div>

          <!-- Week days -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">Week days</label>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="display: flex; gap: 12px; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; font-family: monospace;">
                <span style="width: 14px; text-align: center;">M</span>
                <span style="width: 14px; text-align: center;">T</span>
                <span style="width: 14px; text-align: center;">W</span>
                <span style="width: 14px; text-align: center;">T</span>
                <span style="width: 14px; text-align: center;">F</span>
                <span style="width: 14px; text-align: center;">S</span>
                <span style="width: 14px; text-align: center;">S</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <input type="checkbox" id="weekday-m" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                <input type="checkbox" id="weekday-t" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                <input type="checkbox" id="weekday-w" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                <input type="checkbox" id="weekday-th" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                <input type="checkbox" id="weekday-f" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                <input type="checkbox" id="weekday-sa" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                <input type="checkbox" id="weekday-su" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
              </div>
            </div>
          </div>

          <!-- Day time -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">Day time</label>
            <input type="checkbox" id="setting-event-has-daytime" onchange="App.toggleEventDaytime(this.checked)" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
          </div>

          <!-- Time selectors for each day -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; padding-right: 20px;">
            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
              <div style="display: flex; align-items: center; gap: 16px;">
                <label style="width: 120px; font-size: 12px; color: var(--text-secondary);">${day}</label>
                <input type="checkbox" class="daytime-checkbox" id="day-chk-${day.toLowerCase()}" disabled style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
                
                <select class="daytime-start-select" id="day-start-${day.toLowerCase()}" disabled style="width: 90px; padding: 4px 8px; font-size: 11px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-secondary); color: var(--text-primary); height: 28px;">
                  ${Array.from({ length: 24 }).map((_, h) => {
                    const timeStr = String(h).padStart(2, '0') + ':00';
                    return `<option value="${timeStr}">${timeStr}</option>`;
                  }).join('')}
                </select>

                <span style="font-size: 11px; color: var(--text-secondary);">إلى</span>

                <select class="daytime-end-select" id="day-end-${day.toLowerCase()}" disabled style="width: 90px; padding: 4px 8px; font-size: 11px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-secondary); color: var(--text-primary); height: 28px;">
                  ${Array.from({ length: 24 }).map((_, h) => {
                    const timeStr = String(h + 1).padStart(2, '0') + ':00';
                    return `<option value="${timeStr}" ${h === 23 ? 'selected' : ''}>${timeStr}</option>`;
                  }).join('')}
                </select>
              </div>
            `).join('')}
          </div>

        </div>

        <!-- Notifications Tab Pane -->
        <div id="submodal-pane-notifications" style="display: none; flex-direction: column; gap: 12px; padding: 20px; direction: rtl; text-align: right; overflow-y: auto; flex: 1; font-family: 'Cairo', sans-serif;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; margin-bottom: 6px;">Notifications</div>

          <!-- رسالة النظام -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">رسالة النظام</label>
            <input type="checkbox" id="setting-event-notif-system" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
          </div>

          <!-- إخفاء تلقائي -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">إخفاء تلقائي</label>
            <input type="checkbox" id="setting-event-notif-autohide" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
          </div>

          <!-- Push notification -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">Push notification</label>
            <input type="checkbox" id="setting-event-notif-push" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
          </div>

          <!-- تنبيه الصوت -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">تنبيه الصوت</label>
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <input type="checkbox" id="setting-event-notif-sound" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
              <select id="setting-event-notif-sound-file" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
                <option value="alarm1.mp3">alarm1.mp3</option>
                <option value="alarm2.mp3">alarm2.mp3</option>
                <option value="alarm3.mp3">alarm3.mp3</option>
                <option value="alarm4.mp3">alarm4.mp3</option>
                <option value="alarm5.mp3">alarm5.mp3</option>
                <option value="alarm6.mp3">alarm6.mp3</option>
                <option value="alarm7.mp3">alarm7.mp3</option>
                <option value="alarm8.mp3">alarm8.mp3</option>
                <option value="beep1.mp3">beep1.mp3</option>
                <option value="beep2.mp3">beep2.mp3</option>
                <option value="beep3.mp3">beep3.mp3</option>
                <option value="beep4.mp3">beep4.mp3</option>
                <option value="beep5.mp3">beep5.mp3</option>
              </select>
              <button type="button" onclick="App.playNotificationSound()" style="background: var(--border, #e2e8f0); border: 1px solid var(--border); color: var(--text-primary); padding: 4px 16px; font-size: 11px; border-radius: 4px; cursor: pointer; height: 28px;">لعب</button>
            </div>
          </div>

          <!-- رسالة إلى البريد الإلكتروني -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">رسالة إلى البريد الإلكتروني</label>
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <input type="checkbox" id="setting-event-notif-email" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
              <input type="email" id="setting-event-notif-email-val" placeholder="عنوان البريد الإلكتروني" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 11px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
            </div>
          </div>

          <!-- الهاتف المحمول SMS -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">الهاتف المحمول SMS</label>
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <input type="checkbox" id="setting-event-notif-sms" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
              <input type="text" id="setting-event-notif-sms-val" placeholder="رقم الهاتف مع رمز" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 11px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
            </div>
          </div>

          <!-- E-mail template -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">E-mail template</label>
            <select id="setting-event-notif-email-tmpl" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
              <option value="الافتراضي">الافتراضي</option>
            </select>
          </div>

          <!-- SMS template -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">SMS template</label>
            <select id="setting-event-notif-sms-tmpl" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
              <option value="الافتراضي">الافتراضي</option>
            </select>
          </div>

          <!-- Colors Header -->
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; margin-top: 10px; margin-bottom: 6px;">Colors</div>

          <!-- Object arrow color -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">Object arrow color</label>
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <input type="checkbox" id="setting-event-color-arrow-chk" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
              <select id="setting-event-color-arrow-val" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
                <option value="Black">Black</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Grey">Grey</option>
                <option value="Orange">Orange</option>
                <option value="Purple">Purple</option>
                <option value="Red">Red</option>
                <option value="Yellow" selected>Yellow</option>
              </select>
            </div>
          </div>

          <!-- Object list color -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 250px; font-size: 12px; color: var(--text-secondary, #475569);">Object list color</label>
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <input type="checkbox" id="setting-event-color-list-chk" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
              <input type="text" id="setting-event-color-list-val" value="FFFF00" oninput="App.updateObjectListColorPreview(this.value)" style="width: 100px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; text-align: center; font-weight: 700; height: 28px; background: #FFFF00; color: #000;">
            </div>
          </div>

        </div>

        <div id="submodal-pane-webhook" style="display: none; flex-direction: column; gap: 12px; padding: 20px; direction: rtl; text-align: right; overflow-y: auto; flex: 1; font-family: 'Cairo', sans-serif;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; margin-bottom: 6px;">Webhook</div>
          
          <!-- Send webhook -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 200px; font-size: 12px; color: var(--text-secondary, #475569);">Send webhook</label>
            <input type="checkbox" id="setting-event-webhook-send" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
          </div>

          <!-- Webhook URL -->
          <div style="display: flex; align-items: flex-start; min-height: 80px; gap: 10px;">
            <label style="width: 200px; font-size: 12px; color: var(--text-secondary, #475569); padding-top: 4px;">Webhook URL</label>
            <textarea id="setting-event-webhook-url" placeholder="ex. http://full_address_here" style="flex: 1; min-height: 80px; padding: 6px 10px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a); resize: vertical; font-family: monospace;"></textarea>
          </div>

        </div>

        <div id="submodal-pane-commands" style="display: none; flex-direction: column; gap: 12px; padding: 20px; direction: rtl; text-align: right; overflow-y: auto; flex: 1; font-family: 'Cairo', sans-serif;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; margin-bottom: 6px;">ارسال أوامر المركبة</div>

          <!-- ارسال طلب -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 200px; font-size: 12px; color: var(--text-secondary, #475569);">ارسال طلب</label>
            <input type="checkbox" id="setting-event-cmd-send" style="cursor: pointer; width: 14px; height: 14px; margin: 0;">
          </div>

          <!-- Template -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 200px; font-size: 12px; color: var(--text-secondary, #475569);">Template</label>
            <select id="setting-event-cmd-template" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
              <option value="اختر الأمر">اختر الأمر</option>
              <option value="الافتراضي">الافتراضي</option>
              <option value="Alarm arm">Alarm arm</option>
              <option value="Alarm disarm">Alarm disarm</option>
              <option value="Command interval">Command interval</option>
              <option value="Engine resume">Engine resume</option>
              <option value="Engine stop">Engine stop</option>
              <option value="Output off">Output off</option>
              <option value="Output on">Output on</option>
              <option value="Photo request">Photo request</option>
              <option value="Position interval">Position interval</option>
              <option value="Tracking start">Tracking start</option>
              <option value="Tracking stop">Tracking stop</option>
            </select>
          </div>

          <!-- Gateway -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 200px; font-size: 12px; color: var(--text-secondary, #475569);">Gateway</label>
            <select id="setting-event-cmd-gateway" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
              <option value="GPRS">GPRS</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <!-- نوع (Type) -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 200px; font-size: 12px; color: var(--text-secondary, #475569);">نوع</label>
            <select id="setting-event-cmd-type" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); height: 28px;">
              <option value="ASCII">ASCII</option>
              <option value="HEX">HEX</option>
            </select>
          </div>

          <!-- طلب (Request) -->
          <div style="display: flex; align-items: center; min-height: 28px; gap: 10px;">
            <label style="width: 200px; font-size: 12px; color: var(--text-secondary, #475569);">طلب</label>
            <input type="text" id="setting-event-cmd-request" style="flex: 1; max-width: 250px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-secondary, #f1f5f9); color: var(--text-primary); height: 28px;" readonly>
          </div>

        </div>

        <!-- Footer Buttons -->
        <div style="padding: 12px 20px; border-top: 1px solid var(--border, #e2e8f0); display: flex; justify-content: center; gap: 12px; background: var(--bg-secondary, #f8fafc); direction: rtl;">
          <button type="button" onclick="App.saveSettingsEvent('${eventId}')" style="background: #3b82f6; color: white; border: none; padding: 6px 24px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
            💾 حفظ
          </button>
          <button type="button" onclick="document.getElementById('edit-settings-event-modal').remove()" style="background: #334155; color: #f8fafc; border: none; padding: 6px 24px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
            ✖ إلغاء
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      const isDropdownClick = e.target.closest('#settings-event-vehicles-btn') || 
                              e.target.closest('#settings-event-vehicles-menu') ||
                              e.target.closest('#settings-event-routes-btn') || 
                              e.target.closest('#settings-event-routes-menu') ||
                              e.target.closest('#settings-event-zones-btn') || 
                              e.target.closest('#settings-event-zones-menu');
      if (!isDropdownClick) {
        ['settings-event-vehicles-menu', 'settings-event-routes-menu', 'settings-event-zones-menu'].forEach(id => {
          const menu = document.getElementById(id);
          if (menu) menu.style.display = 'none';
        });
      }
    });

    renderEventParamsGrid();

    filterCustomDropdown('settings-event-vehicles-menu', '');
    filterCustomDropdown('settings-event-routes-menu', '');
    filterCustomDropdown('settings-event-zones-menu', '');

    const updateHeader = (menuId, list) => {
      const headerSpan = document.getElementById(menuId.replace('-menu', '-selected-text'));
      if (headerSpan) {
        const items = customDropdownItems[menuId] || [];
        if (list.length === 0) headerSpan.textContent = 'Nothing selected';
        else if (list.length === items.length) headerSpan.textContent = '[Select all]';
        else headerSpan.textContent = list.join(', ');
      }
    };
    updateHeader('settings-event-vehicles-menu', selectedSettingsEventVehicles);
    updateHeader('settings-event-routes-menu', selectedSettingsEventRoutes);
    updateHeader('settings-event-zones-menu', selectedSettingsEventZones);

    const allVehCheckbox = document.getElementById('vehicles-chk-all');
    if (allVehCheckbox) allVehCheckbox.checked = customDropdownItems['settings-event-vehicles-menu'].every(it => selectedSettingsEventVehicles.includes(it));

    const allRtCheckbox = document.getElementById('routes-chk-all');
    if (allRtCheckbox) allRtCheckbox.checked = customDropdownItems['settings-event-routes-menu'].every(it => selectedSettingsEventRoutes.includes(it));

    const allZnCheckbox = document.getElementById('zones-chk-all');
    if (allZnCheckbox) allZnCheckbox.checked = customDropdownItems['settings-event-zones-menu'].every(it => selectedSettingsEventZones.includes(it));

    const hasDuration = eventData.hasDuration || false;
    const durationVal = eventData.durationVal || 0;
    const weekDays = eventData.weekDays || [true, true, true, true, true, true, true];
    const hasDaytime = eventData.hasDaytime || false;
    const daytimeDetails = eventData.daytimeDetails || {
      monday: { enabled: false, start: '00:00', end: '24:00' },
      tuesday: { enabled: false, start: '00:00', end: '24:00' },
      wednesday: { enabled: false, start: '00:00', end: '24:00' },
      thursday: { enabled: false, start: '00:00', end: '24:00' },
      friday: { enabled: false, start: '00:00', end: '24:00' },
      saturday: { enabled: false, start: '00:00', end: '24:00' },
      sunday: { enabled: false, start: '00:00', end: '24:00' }
    };

    const hasDurChk = document.getElementById('setting-event-has-duration');
    const durValInput = document.getElementById('setting-event-duration-val');
    if (hasDurChk && durValInput) {
      hasDurChk.checked = hasDuration;
      durValInput.value = durationVal;
      toggleEventTimeDuration(hasDuration);
    }

    const weekdaysIds = ['m', 't', 'w', 'th', 'f', 'sa', 'su'];
    weekdaysIds.forEach((id, idx) => {
      const chk = document.getElementById('weekday-' + id);
      if (chk) chk.checked = weekDays[idx];
    });

    const hasDaytimeChk = document.getElementById('setting-event-has-daytime');
    if (hasDaytimeChk) {
      hasDaytimeChk.checked = hasDaytime;
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
        const dayData = daytimeDetails[day] || { enabled: false, start: '00:00', end: '24:00' };
        const dayChk = document.getElementById('day-chk-' + day);
        const startSel = document.getElementById('day-start-' + day);
        const endSel = document.getElementById('day-end-' + day);
        if (dayChk) dayChk.checked = dayData.enabled;
        if (startSel) startSel.value = dayData.start;
        if (endSel) endSel.value = dayData.end;
      });
      toggleEventDaytime(hasDaytime);
    }

    // Restore notifications values
    const notifSystem = eventData.notifSystem || false;
    const notifAutohide = eventData.notifAutohide || false;
    const notifPush = eventData.notifPush || false;
    const notifSound = eventData.notifSound || false;
    const notifSoundFile = eventData.notifSoundFile || 'alarm1.mp3';
    const notifEmail = eventData.notifEmail || false;
    const notifEmailVal = eventData.notifEmailVal || '';
    const notifSms = eventData.notifSms || false;
    const notifSmsVal = eventData.notifSmsVal || '';
    const notifEmailTmpl = eventData.notifEmailTmpl || 'الافتراضي';
    const notifSmsTmpl = eventData.notifSmsTmpl || 'الافتراضي';
    
    const colorArrowChk = eventData.colorArrowChk || false;
    const colorArrowVal = eventData.colorArrowVal || 'Yellow';
    const colorListChk = eventData.colorListChk || false;
    const colorListVal = eventData.colorListVal || 'FFFF00';

    document.getElementById('setting-event-notif-system').checked = notifSystem;
    document.getElementById('setting-event-notif-autohide').checked = notifAutohide;
    document.getElementById('setting-event-notif-push').checked = notifPush;
    document.getElementById('setting-event-notif-sound').checked = notifSound;
    document.getElementById('setting-event-notif-sound-file').value = notifSoundFile;
    document.getElementById('setting-event-notif-email').checked = notifEmail;
    document.getElementById('setting-event-notif-email-val').value = notifEmailVal;
    document.getElementById('setting-event-notif-sms').checked = notifSms;
    document.getElementById('setting-event-notif-sms-val').value = notifSmsVal;
    document.getElementById('setting-event-notif-email-tmpl').value = notifEmailTmpl;
    document.getElementById('setting-event-notif-sms-tmpl').value = notifSmsTmpl;
    
    document.getElementById('setting-event-color-arrow-chk').checked = colorArrowChk;
    document.getElementById('setting-event-color-arrow-val').value = colorArrowVal;
    document.getElementById('setting-event-color-list-chk').checked = colorListChk;
    
    const colorListInput = document.getElementById('setting-event-color-list-val');
    if (colorListInput) {
      colorListInput.value = colorListVal;
      updateObjectListColorPreview(colorListVal);
    }
    
    // Restore webhook values
    const webhookSend = eventData.webhookSend || false;
    const webhookUrl = eventData.webhookUrl || '';

    document.getElementById('setting-event-webhook-send').checked = webhookSend;
    document.getElementById('setting-event-webhook-url').value = webhookUrl;

    // Restore vehicle command values
    const cmdSend = eventData.cmdSend || false;
    const cmdTemplate = eventData.cmdTemplate || 'اختر الأمر';
    const cmdGateway = eventData.cmdGateway || 'GPRS';
    const cmdType = eventData.cmdType || 'ASCII';
    const cmdRequest = eventData.cmdRequest || '';

    document.getElementById('setting-event-cmd-send').checked = cmdSend;
    document.getElementById('setting-event-cmd-template').value = cmdTemplate;
    document.getElementById('setting-event-cmd-gateway').value = cmdGateway;
    document.getElementById('setting-event-cmd-type').value = cmdType;
    document.getElementById('setting-event-cmd-request').value = cmdRequest;

    const tmplSelect = document.getElementById('setting-event-cmd-template');
    const reqInput = document.getElementById('setting-event-cmd-request');
    if (tmplSelect && reqInput) {
      tmplSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        let reqText = '';
        if (val === 'Alarm arm') reqText = 'ARM';
        else if (val === 'Alarm disarm') reqText = 'DISARM';
        else if (val === 'Command interval') reqText = 'INTERVAL 60';
        else if (val === 'Engine resume') reqText = 'RESUME ENGINE';
        else if (val === 'Engine stop') reqText = 'STOP ENGINE';
        else if (val === 'Output off') reqText = 'OUTPUT 0';
        else if (val === 'Output on') reqText = 'OUTPUT 1';
        else if (val === 'Photo request') reqText = 'PHOTO';
        else if (val === 'Position interval') reqText = 'POS_INTERVAL';
        else if (val === 'Tracking start') reqText = 'TRACK_START';
        else if (val === 'Tracking stop') reqText = 'TRACK_STOP';
        else if (val === 'الافتراضي') reqText = 'DEFAULT_CMD';
        reqInput.value = reqText;
      });
    }
  }

  function switchSubmodalTab(tabName) {
    ['main', 'time', 'notifications', 'webhook', 'commands'].forEach(name => {
      const pane = document.getElementById('submodal-pane-' + name);
      if (pane) pane.style.display = 'none';

      const tab = document.getElementById('submodal-tab-' + name);
      if (tab) {
        tab.style.color = 'var(--text-secondary)';
        tab.style.borderBottom = 'none';
        tab.style.fontWeight = 'normal';
      }
    });

    const activePane = document.getElementById('submodal-pane-' + tabName);
    if (activePane) activePane.style.display = 'flex';

    const activeTab = document.getElementById('submodal-tab-' + tabName);
    if (activeTab) {
      activeTab.style.color = '#3b82f6';
      activeTab.style.borderBottom = '3px solid #3b82f6';
      activeTab.style.fontWeight = '700';
    }
  }

  function toggleEventTimeDuration(checked) {
    const input = document.getElementById('setting-event-duration-val');
    if (input) {
      input.disabled = !checked;
      input.style.background = checked ? 'var(--bg-primary, #ffffff)' : 'var(--bg-secondary, #f8fafc)';
    }
  }

  function toggleEventDaytime(checked) {
    const checkboxes = document.querySelectorAll('.daytime-checkbox');
    checkboxes.forEach(chk => {
      chk.disabled = !checked;
    });

    const selects = document.querySelectorAll('.daytime-start-select, .daytime-end-select');
    selects.forEach(sel => {
      sel.disabled = !checked;
      sel.style.background = checked ? 'var(--bg-primary, #ffffff)' : 'var(--bg-secondary, #f8fafc)';
    });
  }

  function updateObjectListColorPreview(val) {
    const input = document.getElementById('setting-event-color-list-val');
    if (!input) return;
    const clean = val.replace('#', '');
    input.style.backgroundColor = '#' + clean;
    let r = parseInt(clean.substring(0,2), 16);
    let g = parseInt(clean.substring(2,4), 16);
    let b = parseInt(clean.substring(4,6), 16);
    if (isNaN(r)) r = 255;
    if (isNaN(g)) g = 255;
    if (isNaN(b)) b = 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    input.style.color = luminance > 0.5 ? '#000000' : '#ffffff';
  }

  function playNotificationSound() {
    const soundFile = document.getElementById('setting-event-notif-sound-file')?.value || 'alarm1.mp3';
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;

      if (soundFile === 'alarm1.mp3') {
        // Fast alternating two-tone siren
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(850, now + 0.15);
        osc.frequency.setValueAtTime(600, now + 0.3);
        osc.frequency.setValueAtTime(850, now + 0.45);
        osc.frequency.setValueAtTime(600, now + 0.6);
        osc.frequency.setValueAtTime(850, now + 0.75);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (soundFile === 'alarm2.mp3') {
        // Continuous frequency sweep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(1300, now + 1.0);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
      } else if (soundFile === 'alarm3.mp3') {
        // Pulsating high alert
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.2, now);
        [0, 0.18, 0.36].forEach(delay => {
          const osc = audioCtx.createOscillator();
          osc.connect(gain);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1300, now + delay);
          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        });
      } else if (soundFile === 'alarm4.mp3') {
        // Low Sawtooth horn/buzz
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (soundFile === 'alarm5.mp3') {
        // Rapid triplets chirping
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.18, now);
        [0, 0.08, 0.16, 0.28, 0.36, 0.44].forEach((delay, idx) => {
          const osc = audioCtx.createOscillator();
          osc.connect(gain);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now + delay);
          osc.start(now + delay);
          osc.stop(now + delay + 0.04);
        });
      } else if (soundFile === 'alarm6.mp3') {
        // Sol-mi chimes
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(784, now); // G5
        osc.frequency.setValueAtTime(659, now + 0.25); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (soundFile === 'alarm7.mp3') {
        // Ascending alert scale
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.18, now);
        const freqs = [392, 523, 659, 784]; // G4, C5, E5, G5
        freqs.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          osc.connect(gain);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.13);
        });
      } else if (soundFile === 'alarm8.mp3') {
        // Descending warning sweep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.8);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
        osc.start(now);
        osc.stop(now + 0.85);
      } else if (soundFile === 'beep1.mp3') {
        // Short high single beep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (soundFile === 'beep2.mp3') {
        // Two quick high beeps
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.18, now);
        [0, 0.1].forEach(delay => {
          const osc = audioCtx.createOscillator();
          osc.connect(gain);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1150, now + delay);
          osc.start(now + delay);
          osc.stop(now + delay + 0.06);
        });
      } else if (soundFile === 'beep3.mp3') {
        // Triple arpeggio chime
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.18, now);
        const freqs = [600, 800, 1000];
        freqs.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          osc.connect(gain);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.09);
        });
      } else if (soundFile === 'beep4.mp3') {
        // Flat warning beep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (soundFile === 'beep5.mp3') {
        // Soft bell decay chime
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }

      AlertsManager.showToast(`تشغيل صوت التنبيه: ${soundFile}`, 'success', '🔊');
    } catch (e) {
      console.error(e);
      AlertsManager.showToast('تعذر تشغيل الصوت', 'error', '❌');
    }
  }

  function renderEventParamsGrid() {
    const tbody = document.getElementById('event-params-grid-body');
    if (!tbody) return;

    if (currentEditingEventParams.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="padding: 20px; text-align: center; color: var(--text-secondary, #64748b);">No parameters added</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = currentEditingEventParams.map((p, index) => `
      <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary);">
        <td style="padding: 6px 8px;">${p.source}</td>
        <td style="padding: 6px 8px;">${p.op} ${p.value}</td>
        <td style="padding: 6px 8px; text-align: center;">
          <span onclick="App.deleteEventParamRow(${index})" style="cursor: pointer; color: #ef4444; font-size: 11px;">🗑️</span>
        </td>
      </tr>
    `).join('');
  }

  function addEventParamRow() {
    const src = document.getElementById('event-param-source').value;
    const op = document.getElementById('event-param-op').value;
    const val = document.getElementById('event-param-value').value;

    if (!val) {
      alert('الرجاء إدخال القيمة');
      return;
    }

    currentEditingEventParams.push({ source: src, op, value: val });
    document.getElementById('event-param-value').value = '';
    renderEventParamsGrid();
  }

  function deleteEventParamRow(index) {
    currentEditingEventParams.splice(index, 1);
    renderEventParamsGrid();
  }

  function saveSettingsEvent(eventId = null) {
    const name = document.getElementById('setting-event-name').value;
    const enabled = document.getElementById('setting-event-enabled').checked;
    
    const system = true;
    const push = true;
    const email = false;
    const sms = false;

    const type = document.getElementById('setting-event-type').value;
    const vehicles = selectedSettingsEventVehicles.length > 0 ? selectedSettingsEventVehicles.join(', ') : 'Nothing selected';
    const depRoutes = document.getElementById('setting-event-deproutes').value;
    const routes = selectedSettingsEventRoutes.length > 0 ? selectedSettingsEventRoutes.join(', ') : 'Nothing selected';
    const depZones = document.getElementById('setting-event-depzones').value;
    const zones = selectedSettingsEventZones.length > 0 ? selectedSettingsEventZones.join(', ') : 'Nothing selected';
    const timePeriod = document.getElementById('setting-event-timeperiod').value;
    const speedLimit = document.getElementById('setting-event-speedlimit').value;

    const hasDuration = document.getElementById('setting-event-has-duration').checked;
    const durationVal = parseInt(document.getElementById('setting-event-duration-val').value || 0);

    const weekdaysIds = ['m', 't', 'w', 'th', 'f', 'sa', 'su'];
    const weekDays = weekdaysIds.map(id => {
      const chk = document.getElementById('weekday-' + id);
      return chk ? chk.checked : true;
    });

    const hasDaytime = document.getElementById('setting-event-has-daytime').checked;
    const daytimeDetails = {};
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      const dayChk = document.getElementById('day-chk-' + day);
      const startSel = document.getElementById('day-start-' + day);
      const endSel = document.getElementById('day-end-' + day);
      daytimeDetails[day] = {
        enabled: dayChk ? dayChk.checked : false,
        start: startSel ? startSel.value : '00:00',
        end: endSel ? endSel.value : '24:00'
      };
    });

    // Notifications compile
    const notifSystem = document.getElementById('setting-event-notif-system').checked;
    const notifAutohide = document.getElementById('setting-event-notif-autohide').checked;
    const notifPush = document.getElementById('setting-event-notif-push').checked;
    const notifSound = document.getElementById('setting-event-notif-sound').checked;
    const notifSoundFile = document.getElementById('setting-event-notif-sound-file').value;
    const notifEmail = document.getElementById('setting-event-notif-email').checked;
    const notifEmailVal = document.getElementById('setting-event-notif-email-val').value;
    const notifSms = document.getElementById('setting-event-notif-sms').checked;
    const notifSmsVal = document.getElementById('setting-event-notif-sms-val').value;
    const notifEmailTmpl = document.getElementById('setting-event-notif-email-tmpl').value;
    const notifSmsTmpl = document.getElementById('setting-event-notif-sms-tmpl').value;
    
    const colorArrowChk = document.getElementById('setting-event-color-arrow-chk').checked;
    const colorArrowVal = document.getElementById('setting-event-color-arrow-val').value;
    const colorListChk = document.getElementById('setting-event-color-list-chk').checked;
    const colorListVal = document.getElementById('setting-event-color-list-val').value;

    const webhookSend = document.getElementById('setting-event-webhook-send').checked;
    const webhookUrl = document.getElementById('setting-event-webhook-url').value;

    const cmdSend = document.getElementById('setting-event-cmd-send').checked;
    const cmdTemplate = document.getElementById('setting-event-cmd-template').value;
    const cmdGateway = document.getElementById('setting-event-cmd-gateway').value;
    const cmdType = document.getElementById('setting-event-cmd-type').value;
    const cmdRequest = document.getElementById('setting-event-cmd-request').value;

    if (!name) {
      alert('الرجاء إدخال اسم الحدث');
      return;
    }

    const events = getSettingsEvents();
    if (eventId && eventId !== 'null') {
      const idx = events.findIndex(e => e.id === eventId);
      if (idx !== -1) {
        events[idx] = { 
          id: eventId, 
          name, 
          enabled, 
          system, 
          push, 
          email, 
          sms,
          type,
          vehicles,
          depRoutes,
          routes,
          depZones,
          zones,
          timePeriod,
          speedLimit,
          params: currentEditingEventParams,
          hasDuration,
          durationVal,
          weekDays,
          hasDaytime,
          daytimeDetails,
          notifSystem,
          notifAutohide,
          notifPush,
          notifSound,
          notifSoundFile,
          notifEmail,
          notifEmailVal,
          notifSms,
          notifSmsVal,
          notifEmailTmpl,
          notifSmsTmpl,
          colorArrowChk,
          colorArrowVal,
          colorListChk,
          colorListVal,
          webhookSend,
          webhookUrl,
          cmdSend,
          cmdTemplate,
          cmdGateway,
          cmdType,
          cmdRequest
        };
      }
    } else {
      events.push({
        id: 'se_' + Date.now(),
        name,
        enabled,
        system,
        push,
        email,
        sms,
        type,
        vehicles,
        depRoutes,
        routes,
        depZones,
        zones,
        timePeriod,
        speedLimit,
        params: currentEditingEventParams,
        hasDuration,
        durationVal,
        weekDays,
        hasDaytime,
        daytimeDetails,
        notifSystem,
        notifAutohide,
        notifPush,
        notifSound,
        notifSoundFile,
        notifEmail,
        notifEmailVal,
        notifSms,
        notifSmsVal,
        notifEmailTmpl,
        notifSmsTmpl,
        colorArrowChk,
        colorArrowVal,
        colorListChk,
        colorListVal,
        webhookSend,
        webhookUrl,
        cmdSend,
        cmdTemplate,
        cmdGateway,
        cmdType,
        cmdRequest
      });
    }

    saveSettingsEvents(events);
    const modal = document.getElementById('edit-settings-event-modal');
    if (modal) modal.remove();
    renderSettingsActiveTab();
    AlertsManager.showToast('تم حفظ تغييرات الحدث بنجاح', 'success', '✅');
  }

  function deleteSettingsEvent(eventId) {
    if (!confirm('هل أنت متأكد من حذف هذا الحدث؟')) return;

    const events = getSettingsEvents().filter(e => e.id !== eventId);
    saveSettingsEvents(events);
    renderSettingsActiveTab();
    AlertsManager.showToast('تم حذف الحدث بنجاح', 'success', '🗑️');
  }

  function toggleSelectAllSettingsEvents(chk) {
    const checked = chk.checked;
    document.querySelectorAll('.settings-event-row-chk').forEach(c => {
      c.checked = checked;
    });
  }

  function toggleSettingsEventsMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('settings-events-menu');
    if (!menu) return;

    if (menu.style.display === 'none') {
      menu.style.display = 'block';

      const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
          menu.style.display = 'none';
          document.removeEventListener('click', closeMenu);
        }
      };
      document.addEventListener('click', closeMenu);
    } else {
      menu.style.display = 'none';
    }
  }

  function deleteSelectedSettingsEvents() {
    const checkedChks = document.querySelectorAll('.settings-event-row-chk:checked');
    if (checkedChks.length === 0) {
      alert('الرجاء اختيار حدث واحد على الأقل للحذف');
      return;
    }

    if (!confirm('هل أنت متأكد من حذف الأحداث المحددة؟')) return;

    const idsToDelete = Array.from(checkedChks).map(c => c.getAttribute('data-id'));
    const events = getSettingsEvents().filter(e => !idsToDelete.includes(e.id));
    saveSettingsEvents(events);

    renderSettingsActiveTab();
    const selectAll = document.getElementById('select-all-settings-events');
    if (selectAll) selectAll.checked = false;

    AlertsManager.showToast('تم حذف الأحداث المحددة', 'success', '🗑️');
  }

  function exportSettingsEvents() {
    const events = getSettingsEvents();
    if (events.length === 0) {
      AlertsManager.showToast('لا توجد أحداث لتصديرها.', 'warning', '⚠️');
      return;
    }

    const headers = ['الاسم', 'تفعيل', 'نظام', 'Push notification', 'البريد الإلكتروني', 'SMS'];
    const rows = events.map(e => [
      e.name || '',
      e.enabled ? '✔️' : '❌',
      e.system ? '✔️' : '❌',
      e.push ? '✔️' : '❌',
      e.email ? '✔️' : '❌',
      e.sms ? '✔️' : '❌'
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `settings_events_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    AlertsManager.showToast('تم تصدير الإعدادات بنجاح', 'success', '📤');
  }

  function focusOnCoordinate(lat, lng, zoom = 15) {
    const map = MapManager.getMap();
    if (map) {
      map.setView([lat, lng], zoom, { animate: true, duration: 1 });
    }
  }

  function initHistoryTab() {
    const select = document.getElementById('sidebar-history-vehicle');
    if (!select || select.children.length > 1) return; // Already populated
    const vehicles = FleetData.getVehicles();
    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.plate} - ${v.name}`;
      select.appendChild(opt);
    });

    // Populate hours
    const hourFrom = document.getElementById('sidebar-history-hour-from');
    const hourTo = document.getElementById('sidebar-history-hour-to');
    if (hourFrom && hourFrom.children.length === 0) {
      for (let i = 0; i < 24; i++) {
        const val = String(i).padStart(2, '0');
        hourFrom.appendChild(new Option(val, val));
        hourTo.appendChild(new Option(val, val));
      }
    }

    // Populate minutes
    const minFrom = document.getElementById('sidebar-history-min-from');
    const minTo = document.getElementById('sidebar-history-min-to');
    if (minFrom && minFrom.children.length === 0) {
      for (let i = 0; i < 60; i++) {
        const val = String(i).padStart(2, '0');
        minFrom.appendChild(new Option(val, val));
        minTo.appendChild(new Option(val, val));
      }
    }

    // Set default dates
    const dateFrom = document.getElementById('sidebar-history-date-from');
    const dateTo = document.getElementById('sidebar-history-date-to');
    const now = new Date();
    const todayStr = getLocalDateStr(now);
    if (dateFrom && !dateFrom.value) dateFrom.value = todayStr;
    if (dateTo && !dateTo.value) dateTo.value = todayStr;
    
    // Set default hours & minutes
    if (hourFrom) hourFrom.value = '00';
    if (minFrom) minFrom.value = '00';
    if (hourTo) hourTo.value = '23';
    if (minTo) minTo.value = '59';

    // Trigger onchange to disable custom selectors
    onHistoryPeriodChange('today');
  }

  function onHistoryPeriodChange(val) {
    const customSection = document.querySelectorAll('#sidebar-history-date-from, #sidebar-history-hour-from, #sidebar-history-min-from, #sidebar-history-date-to, #sidebar-history-hour-to, #sidebar-history-min-to');
    const isCustom = val === 'custom';
    
    // Set dates based on selection
    const now = new Date();
    const todayStr = getLocalDateStr(now);
    
    if (val === 'today') {
      document.getElementById('sidebar-history-date-from').value = todayStr;
      document.getElementById('sidebar-history-date-to').value = todayStr;
      document.getElementById('sidebar-history-hour-from').value = '00';
      document.getElementById('sidebar-history-min-from').value = '00';
      document.getElementById('sidebar-history-hour-to').value = '23';
      document.getElementById('sidebar-history-min-to').value = '59';
    } else if (val === 'yesterday') {
      const yesterday = new Date(now.getTime() - 86400000);
      const yesterdayStr = getLocalDateStr(yesterday);
      document.getElementById('sidebar-history-date-from').value = yesterdayStr;
      document.getElementById('sidebar-history-date-to').value = yesterdayStr;
      document.getElementById('sidebar-history-hour-from').value = '00';
      document.getElementById('sidebar-history-min-from').value = '00';
      document.getElementById('sidebar-history-hour-to').value = '23';
      document.getElementById('sidebar-history-min-to').value = '59';
    } else if (val === 'thisweek') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfWeekStr = getLocalDateStr(startOfWeek);
      document.getElementById('sidebar-history-date-from').value = startOfWeekStr;
      document.getElementById('sidebar-history-date-to').value = todayStr;
      document.getElementById('sidebar-history-hour-from').value = '00';
      document.getElementById('sidebar-history-min-from').value = '00';
      document.getElementById('sidebar-history-hour-to').value = '23';
      document.getElementById('sidebar-history-min-to').value = '59';
    } else if (val === 'lastweek') {
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
      const startOfLastWeekStr = getLocalDateStr(startOfLastWeek);
      const endOfLastWeek = new Date(now);
      endOfLastWeek.setDate(now.getDate() - now.getDay() - 1);
      const endOfLastWeekStr = getLocalDateStr(endOfLastWeek);
      document.getElementById('sidebar-history-date-from').value = startOfLastWeekStr;
      document.getElementById('sidebar-history-date-to').value = endOfLastWeekStr;
      document.getElementById('sidebar-history-hour-from').value = '00';
      document.getElementById('sidebar-history-min-from').value = '00';
      document.getElementById('sidebar-history-hour-to').value = '23';
      document.getElementById('sidebar-history-min-to').value = '59';
    }
  }

  function showHistory() {
    const vehicleId = document.getElementById('sidebar-history-vehicle').value;
    const period = document.getElementById('sidebar-history-period').value;
    const dateFrom = document.getElementById('sidebar-history-date-from').value;
    const dateTo = document.getElementById('sidebar-history-date-to').value;
    const hourFrom = document.getElementById('sidebar-history-hour-from').value;
    const minFrom = document.getElementById('sidebar-history-min-from').value;
    const hourTo = document.getElementById('sidebar-history-hour-to').value;
    const minTo = document.getElementById('sidebar-history-min-to').value;
    const stopThreshold = parseInt(document.getElementById('sidebar-history-stop').value || 1);
    
    const resultsContainer = document.getElementById('sidebar-history-results');
    if (!vehicleId) {
      alert('الرجاء اختيار سيارة');
      return;
    }

    let startTimestamp, endTimestamp;
    const now = new Date();

    if (period === 'today') {
      const todayStr = getLocalDateStr(now);
      startTimestamp = new Date(`${todayStr}T00:00:00`).getTime();
      endTimestamp = new Date(`${todayStr}T23:59:59`).getTime();
    } else if (period === 'yesterday') {
      const yesterday = new Date(now.getTime() - 86400000);
      const yesterdayStr = getLocalDateStr(yesterday);
      startTimestamp = new Date(`${yesterdayStr}T00:00:00`).getTime();
      endTimestamp = new Date(`${yesterdayStr}T23:59:59`).getTime();
    } else if (period === 'thisweek') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfWeekStr = getLocalDateStr(startOfWeek);
      startTimestamp = new Date(`${startOfWeekStr}T00:00:00`).getTime();
      endTimestamp = now.getTime();
    } else if (period === 'lastweek') {
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
      const startOfLastWeekStr = getLocalDateStr(startOfLastWeek);
      const endOfLastWeek = new Date(now);
      endOfLastWeek.setDate(now.getDate() - now.getDay() - 1);
      const endOfLastWeekStr = getLocalDateStr(endOfLastWeek);
      startTimestamp = new Date(`${startOfLastWeekStr}T00:00:00`).getTime();
      endTimestamp = new Date(`${endOfLastWeekStr}T23:59:59`).getTime();
    } else {
      if (!dateFrom || !dateTo) {
        alert('الرجاء تحديد تاريخ البداية والنهاية');
        return;
      }
      startTimestamp = new Date(`${dateFrom}T${hourFrom}:${minFrom}:00`).getTime();
      endTimestamp = new Date(`${dateTo}T${hourTo}:${minTo}:00`).getTime();
    }

    const allTrips = FleetData.getVehicleHistory(vehicleId);
    const filteredTrips = allTrips.filter(t => {
      const tripTime = new Date(t.startTime).getTime();
      return tripTime >= startTimestamp && tripTime <= endTimestamp;
    });

    if (filteredTrips.length === 0) {
      resultsContainer.innerHTML = `<div class="empty-state" style="padding:20px;"><div class="empty-icon">📅</div><p>لا توجد بيانات مسجلة لهذه السيارة في هذه الفترة</p></div>`;
      MapManager.drawRoutePlayback([]);
      return;
    }

    const logItems = [];
    const startIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" /></svg>`;
    const eventIcon = `<div style="width:18px; height:18px; background:#ef4444; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:800; font-family:sans-serif;">E</div>`;
    const moveIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L10 14L14 18L20 12" stroke-dasharray="3 3"/><circle cx="20" cy="12" r="2" fill="#22c55e"/><circle cx="4" cy="20" r="2" fill="#6b7280"/></svg>`;
    const parkingIcon = `<div style="width:18px; height:18px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:800; font-family:sans-serif;">P</div>`;

    filteredTrips.forEach(t => {
      const tStart = new Date(t.startTime);
      const tEnd = new Date(t.endTime);

      logItems.push({
        time: tStart,
        lat: t.startLat,
        lng: t.startLng,
        icon: startIcon,
        message: 'بدء الحركة من ' + t.startLocation
      });

      logItems.push({
        time: new Date(tStart.getTime() + 5000),
        lat: t.startLat,
        lng: t.startLng,
        icon: eventIcon,
        message: `خروج ${t.startLocation} (${t.startLocation})`
      });

      let currentPositionTime = tStart.getTime();
      const stops = t.stops || [];

      stops.forEach(s => {
        const stopTime = new Date(s.time);
        const stopDurationMs = s.duration * 60000;

        if (s.duration >= stopThreshold) {
          const moveDurationMs = stopTime.getTime() - currentPositionTime;
          if (moveDurationMs > 30000) {
            const mins = Math.floor(moveDurationMs / 60000);
            const secs = Math.floor((moveDurationMs % 60000) / 1000);
            logItems.push({
              time: new Date(currentPositionTime + 10000),
              lat: s.lat,
              lng: s.lng,
              icon: moveIcon,
              message: `حركة لمدة ${mins} دقيقة ${secs} ثانية`
            });
          }

          logItems.push({
            time: stopTime,
            lat: s.lat,
            lng: s.lng,
            icon: eventIcon,
            message: `دخول ${s.location} (${s.location})`
          });

          const mins = s.duration;
          logItems.push({
            time: new Date(stopTime.getTime() + 10000),
            lat: s.lat,
            lng: s.lng,
            icon: parkingIcon,
            message: `توقف لمدة ${mins} دقيقة`
          });

          logItems.push({
            time: new Date(stopTime.getTime() + stopDurationMs),
            lat: s.lat,
            lng: s.lng,
            icon: eventIcon,
            message: `خروج من ${s.location} (${s.location})`
          });
        }

        currentPositionTime = stopTime.getTime() + stopDurationMs;
      });

      const finalMoveMs = tEnd.getTime() - currentPositionTime;
      if (finalMoveMs > 30000) {
        const mins = Math.floor(finalMoveMs / 60000);
        const secs = Math.floor((finalMoveMs % 60000) / 1000);
        logItems.push({
          time: new Date(currentPositionTime + 10000),
          lat: t.endLat,
          lng: t.endLng,
          icon: moveIcon,
          message: `حركة لمدة ${mins} دقيقة ${secs} ثانية`
        });
      }

      logItems.push({
        time: new Date(tEnd.getTime() - 5000),
        lat: t.endLat,
        lng: t.endLng,
        icon: eventIcon,
        message: `دخول ${t.endLocation} (${t.endLocation})`
      });

      logItems.push({
        time: tEnd,
        lat: t.endLat,
        lng: t.endLng,
        icon: parkingIcon,
        message: `نهاية الرحلة والتوقف في ${t.endLocation}`
      });
    });

    logItems.sort((a, b) => a.time.getTime() - b.time.getTime());

    resultsContainer.innerHTML = logItems.map(item => {
      const yr = item.time.getFullYear();
      const mo = String(item.time.getMonth() + 1).padStart(2, '0');
      const dy = String(item.time.getDate()).padStart(2, '0');
      const timeStr = `${yr}-${mo}-${dy} ${item.time.toLocaleTimeString('ar-EG', { hour12: false })}`;
      
      const latVal = item.lat || 0;
      const lngVal = item.lng || 0;

      return `
        <div class="history-log-row" onclick="App.focusOnCoordinate(${latVal}, ${lngVal}, 16)" style="display:flex; align-items:center; padding:8px 12px; border-bottom:1px solid var(--border); font-size:11px; gap:8px;">
          <div class="log-icon-wrap" style="width:20px; height:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${item.icon}
          </div>
          <div class="log-info" style="flex:1; color:var(--text-primary); text-align:right; font-weight:600; line-height:1.3;">
            ${item.message}
          </div>
          <div class="log-time" style="width:130px; text-align:left; color:var(--text-secondary); font-family:monospace; white-space:nowrap; direction:ltr;">
            ${timeStr}
          </div>
        </div>`;
    }).join('');

    MapManager.drawRoutePlayback(filteredTrips);
  }

  function hideHistory() {
    const resultsContainer = document.getElementById('sidebar-history-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `<div class="empty-state" style="padding:20px;"><div class="empty-icon">📅</div><p>تم إخفاء التاريخ. اختر سيارة وفترة لعرضه مجدداً</p></div>`;
    }
    MapManager.drawRoutePlayback([]);
  }

  let lastFocusedTplInput = null;

  function setLastFocusedTplInput(id) {
    lastFocusedTplInput = document.getElementById(id);
  }

  function insertTplVariable(variable) {
    if (!lastFocusedTplInput) {
      lastFocusedTplInput = document.getElementById('tpl-message');
    }
    if (lastFocusedTplInput) {
      const val = lastFocusedTplInput.value;
      const start = lastFocusedTplInput.selectionStart;
      const end = lastFocusedTplInput.selectionEnd;
      lastFocusedTplInput.value = val.substring(0, start) + variable + val.substring(end);
      lastFocusedTplInput.focus();
      lastFocusedTplInput.selectionStart = lastFocusedTplInput.selectionEnd = start + variable.length;
    }
  }

  function toggleTemplatesMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('settings-templates-menu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  }

  // Close template menu on click outside
  document.addEventListener('click', () => {
    const menu = document.getElementById('settings-templates-menu');
    if (menu) menu.style.display = 'none';
  });

  function toggleSelectAllTemplates(master) {
    const checked = master.checked;
    const checkboxes = document.querySelectorAll('.template-row-chk');
    checkboxes.forEach(chk => chk.checked = checked);
  }

  function toggleKmlMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('settings-kml-menu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  }

  // Close KML menu on click outside
  document.addEventListener('click', () => {
    const menu = document.getElementById('settings-kml-menu');
    if (menu) menu.style.display = 'none';
  });

  function toggleSelectAllKml(master) {
    const checked = master.checked;
    const checkboxes = document.querySelectorAll('.kml-row-chk');
    checkboxes.forEach(chk => chk.checked = checked);
  }

  function saveSmsSettings() {
    const enabled = document.getElementById('sms-enabled').checked;
    const type = document.getElementById('sms-type').value;
    const identifier = document.getElementById('sms-identifier') ? document.getElementById('sms-identifier').value : '';
    const queueText = document.getElementById('sms-queue-count') ? document.getElementById('sms-queue-count').innerText : '0';
    const queueCount = parseInt(queueText) || 0;

    const httpUrl = document.getElementById('sms-http-url') ? document.getElementById('sms-http-url').value : '';
    const httpMethod = document.getElementById('sms-http-method') ? document.getElementById('sms-http-method').value : 'GET';
    const httpHeaders = document.getElementById('sms-http-headers') ? document.getElementById('sms-http-headers').value : '';
    const httpBody = document.getElementById('sms-http-body') ? document.getElementById('sms-http-body').value : '';

    const settings = { enabled, type, identifier, queueCount, httpUrl, httpMethod, httpHeaders, httpBody };
    localStorage.setItem('settings_sms', JSON.stringify(settings));
    AlertsManager.showToast('تم حفظ إعدادات بوابة الرسائل بنجاح', 'success', '💾');
  }

  function getContrastColor(hexColor) {
    let hex = hexColor.trim();
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return '#334155';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#334155' : '#ffffff';
  }

  function updateColorInputBg(el) {
    let val = el.value.trim().replace('#', '');
    if (/^[0-9A-F]{3,6}$/i.test(val)) {
      el.style.background = '#' + val;
      el.style.color = getContrastColor(val);
      const picker = document.getElementById(el.id + '-picker');
      if (picker) {
        picker.value = '#' + (val.length === 3 ? val.split('').map(c => c+c).join('') : val);
      }
    }
  }

  function syncColorPicker(picker, textInputId) {
    const textInput = document.getElementById(textInputId);
    if (textInput) {
      const hex = picker.value.toUpperCase().replace('#', '');
      textInput.value = hex;
      textInput.style.background = '#' + hex;
      textInput.style.color = getContrastColor(hex);
    }
  }

  function playUiSound() {
    const select = document.getElementById('ui-chat-sound');
    if (!select) return;
    const soundFile = select.value;
    AlertsManager.showToast(`تشغيل صوت التنبيه: ${soundFile}`, 'info', '🔊');
    try {
      const audio = new Audio(`sounds/${soundFile}`);
      audio.play().catch(e => console.warn('Could not play sound: ', e));
    } catch(e) {
      console.warn(e);
    }
  }

  function saveUiSettings() {
    const pushNotifications = document.getElementById('ui-push-notifications').checked;
    const chatSound = document.getElementById('ui-chat-sound').value;
    const openAfterLogin = document.getElementById('ui-open-after-login').checked;
    const mapStartupPosition = document.getElementById('ui-map-startup-position').value;
    const mapIconSize = document.getElementById('ui-map-icon-size').value;
    const routeColor = document.getElementById('ui-route-color').value.replace('#', '');
    const routeHighlightColor = document.getElementById('ui-route-highlight-color').value.replace('#', '');
    const clusterHoverPopup = document.getElementById('ui-cluster-hover-popup').checked;
    
    const collapsed = {
      vehicles: document.getElementById('ui-collapse-vehicles').checked,
      markers: document.getElementById('ui-collapse-markers').checked,
      routes: document.getElementById('ui-collapse-routes').checked,
      zones: document.getElementById('ui-collapse-zones').checked
    };

    const vehiclesDetails = document.getElementById('ui-vehicles-details').value;
    const noConnectionColorEnabled = document.getElementById('ui-no-connection-color-enabled').checked;
    const noConnectionColor = document.getElementById('ui-no-connection-color').value.replace('#', '');

    const stoppedColorEnabled = document.getElementById('ui-stopped-color-enabled').checked;
    const stoppedColor = document.getElementById('ui-stopped-color').value.replace('#', '');
    const movingColorEnabled = document.getElementById('ui-moving-color-enabled').checked;
    const movingColor = document.getElementById('ui-moving-color').value.replace('#', '');
    const engineIdleColorEnabled = document.getElementById('ui-engine-idle-color-enabled').checked;
    const engineIdleColor = document.getElementById('ui-engine-idle-color').value.replace('#', '');

    const dataListPosition = document.getElementById('ui-data-list-position').value;
    const dataListItems = selectedUiItems;

    const lang = document.getElementById('ui-lang').value;
    const unitDistance = document.getElementById('ui-unit-distance').value;
    const unitCapacity = document.getElementById('ui-unit-capacity').value;
    const unitTemp = document.getElementById('ui-unit-temp').value;
    const currency = document.getElementById('ui-currency').value;
    const timezone = document.getElementById('ui-timezone').value;
    const dstEnabled = document.getElementById('ui-dst-enabled').checked;
    const dstStartDate = document.getElementById('ui-dst-start-date').value;
    const dstStartTime = document.getElementById('ui-dst-start-time').value;
    const dstEndDate = document.getElementById('ui-dst-end-date').value;
    const dstEndTime = document.getElementById('ui-dst-end-time').value;

    const settings = {
      pushNotifications,
      chatSound,
      openAfterLogin,
      mapStartupPosition,
      mapIconSize,
      routeColor,
      routeHighlightColor,
      clusterHoverPopup,
      collapsed,
      vehiclesDetails,
      noConnectionColorEnabled,
      noConnectionColor,
      stoppedColorEnabled,
      stoppedColor,
      movingColorEnabled,
      movingColor,
      engineIdleColorEnabled,
      engineIdleColor,
      dataListPosition,
      dataListItems,
      lang,
      unitDistance,
      unitCapacity,
      unitTemp,
      currency,
      timezone,
      dstEnabled,
      dstStartDate,
      dstStartTime,
      dstEndDate,
      dstEndTime
    };

    localStorage.setItem('settings_ui', JSON.stringify(settings));
    AlertsManager.showToast('تم حفظ إعدادات واجهة المستخدم بنجاح', 'success', '💾');

    // Apply changes immediately (no page reload needed)
    MapManager.applyIconSize();
    applyVehiclesDetails();
    applyDataListPosition();
    applyLanguage();

    // Dynamically refresh current vehicle detail popup to show only selected items
    if (selectedVehicleId) {
      const body = document.getElementById('vehicle-detail-body');
      const panel = document.getElementById('vehicle-detail-panel');
      if (panel && panel.classList.contains('open') && body) {
        renderVehicleDetail(selectedVehicleId, body);
      }
    }
  }

  function saveSettingsTab() {
    if (currentSettingsTab === 'sms') {
      saveSmsSettings();
    } else if (currentSettingsTab === 'ui') {
      saveUiSettings();
    }
  }

  function clearSmsQueue() {
    const enabled = document.getElementById('sms-enabled').checked;
    const type = document.getElementById('sms-type').value;
    const identifier = document.getElementById('sms-identifier') ? document.getElementById('sms-identifier').value : '';

    const httpUrl = document.getElementById('sms-http-url') ? document.getElementById('sms-http-url').value : '';
    const httpMethod = document.getElementById('sms-http-method') ? document.getElementById('sms-http-method').value : 'GET';
    const httpHeaders = document.getElementById('sms-http-headers') ? document.getElementById('sms-http-headers').value : '';
    const httpBody = document.getElementById('sms-http-body') ? document.getElementById('sms-http-body').value : '';

    const settings = { enabled, type, identifier, queueCount: 0, httpUrl, httpMethod, httpHeaders, httpBody };
    localStorage.setItem('settings_sms', JSON.stringify(settings));

    const countEl = document.getElementById('sms-queue-count');
    if (countEl) countEl.innerText = '0';

    AlertsManager.showToast('تم تفريغ قائمة انتظار الرسائل القصيرة بنجاح', 'info', '🧹');
  }

  function handleSmsTypeChange(value) {
    const mobileSec = document.getElementById('sms-section-mobile');
    const httpSec = document.getElementById('sms-section-http');
    if (mobileSec && httpSec) {
      if (value === 'mobile') {
        mobileSec.style.display = 'flex';
        httpSec.style.display = 'none';
      } else if (value === 'http') {
        mobileSec.style.display = 'none';
        httpSec.style.display = 'flex';
      }
    }
  }

  function handleHttpMethodChange(value) {
    const bodyContainer = document.getElementById('sms-http-body-container');
    if (bodyContainer) {
      bodyContainer.style.display = (value === 'POST') ? 'flex' : 'none';
    }
  }

  function deleteKml(id) {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      let kmlList = FleetData.getKml();
      kmlList = kmlList.filter(k => k.id !== id);
      FleetData.saveKml(kmlList);
      renderSettingsActiveTab();
      AlertsManager.showToast('تم حذف ملف KML بنجاح', 'success', '🗑️');
    }
  }

  function deleteSelectedKml() {
    const checkedChks = document.querySelectorAll('.kml-row-chk:checked');
    if (checkedChks.length === 0) {
      alert('الرجاء تحديد ملفات لحذفها');
      return;
    }
    if (confirm('هل أنت متأكد من حذف الملفات المحددة؟')) {
      const idsToDelete = Array.from(checkedChks).map(chk => chk.getAttribute('data-id'));
      let kmlList = FleetData.getKml();
      kmlList = kmlList.filter(k => !idsToDelete.includes(k.id));
      FleetData.saveKml(kmlList);
      renderSettingsActiveTab();
      AlertsManager.showToast('تم حذف ملفات KML المحددة بنجاح', 'success', '🗑️');
    }
  }

  function toggleKmlEnable(id, checked) {
    let kmlList = FleetData.getKml();
    kmlList = kmlList.map(k => {
      if (k.id === id) {
        return { ...k, enabled: checked };
      }
      return k;
    });
    FleetData.saveKml(kmlList);
    AlertsManager.showToast(checked ? 'تم تفعيل ملف KML' : 'تم تعطيل ملف KML', 'info', '📍');
  }

  function openAddKmlModal() {
    openEditKmlModal(null);
  }

  function openEditKmlModal(id = null) {
    const existing = document.getElementById('kml-properties-modal');
    if (existing) existing.remove();

    let kmlEnabled = true;
    let kmlName = '';
    let kmlDesc = '';
    let kmlFileName = '';

    if (id) {
      const kmlList = FleetData.getKml();
      const k = kmlList.find(item => item.id === id);
      if (k) {
        kmlEnabled = k.enabled !== undefined ? k.enabled : true;
        kmlName = k.name || '';
        kmlDesc = k.description || '';
        kmlFileName = k.fileName || '';
      }
    }

    const modal = document.createElement('div');
    modal.id = 'kml-properties-modal';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 30000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

    modal.innerHTML = `
      <div style="width: 600px; background: var(--bg-card, #ffffff); border-radius: 4px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
        
        <!-- Header -->
        <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; direction: ltr; user-select: none;">
          <h3 style="margin: 0; font-size: 15px; font-weight: bold; font-family: sans-serif;">KML properties</h3>
          <span onclick="App.closeKmlModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; line-height: 1;">✕</span>
        </div>

        <!-- Form Body -->
        <div style="display: flex; flex-direction: column; gap: 12px; padding: 20px; text-align: left; direction: ltr; background: var(--bg-primary, #ffffff);">
          
          <!-- تفعيل -->
          <div style="display: flex; align-items: center;">
            <label style="width: 120px; font-size: 13px; color: var(--text-secondary, #475569); font-weight: 700;">تفعيل</label>
            <input type="checkbox" id="kml-enabled" ${kmlEnabled ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
          </div>

          <!-- اسم -->
          <div style="display: flex; align-items: center;">
            <label style="width: 120px; font-size: 13px; color: var(--text-secondary, #475569); font-weight: 700;">اسم</label>
            <input type="text" id="kml-name" value="${kmlName}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #334155);" required>
          </div>

          <!-- وصف -->
          <div style="display: flex; align-items: flex-start;">
            <label style="width: 120px; font-size: 13px; color: var(--text-secondary, #475569); font-weight: 700; margin-top: 4px;">وصف</label>
            <textarea id="kml-desc" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #334155); height: 80px; resize: none; font-family: 'Cairo', sans-serif;">${kmlDesc}</textarea>
          </div>

          <!-- KML File -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 120px; font-size: 13px; color: var(--text-secondary, #475569); font-weight: 700;">KML file</label>
            <input type="text" id="kml-filename" value="${kmlFileName}" placeholder="" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #334155);" readonly>
            <input type="file" id="kml-file-input" style="display: none;" onchange="App.handleKmlFileUpload(this)">
            <button type="button" onclick="document.getElementById('kml-file-input').click()" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 16px; font-size: 13px; font-weight: bold; cursor: pointer; color: #334155;">Upload</button>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid var(--border, #e2e8f0); padding: 12px 16px; display: flex; justify-content: center; gap: 10px;">
          <button type="button" onclick="App.saveKml('${id || ''}')" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 16px; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>💾</span> حفظ
          </button>
          <button type="button" onclick="App.closeKmlModal()" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 16px; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>✕</span> إلغاء
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
  }

  function closeKmlModal() {
    const modal = document.getElementById('kml-properties-modal');
    if (modal) modal.remove();
  }

  function handleKmlFileUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const filenameInput = document.getElementById('kml-filename');
      if (filenameInput) {
        filenameInput.value = file.name;
      }
    }
  }

  function saveKml(id = '') {
    const enabled = document.getElementById('kml-enabled').checked;
    const name = document.getElementById('kml-name').value.trim();
    const desc = document.getElementById('kml-desc').value.trim();
    const fileName = document.getElementById('kml-filename').value;

    if (!name) {
      alert('الرجاء إدخال اسم ملف KML');
      return;
    }

    let kmlList = FleetData.getKml();

    if (id) {
      // Edit
      kmlList = kmlList.map(k => {
        if (k.id === id) {
          return { ...k, enabled, name, description: desc, fileName };
        }
        return k;
      });
    } else {
      // Add
      const newKml = {
        id: 'kml_' + Date.now(),
        enabled,
        name,
        description: desc,
        fileName
      };
      kmlList.push(newKml);
    }

    FleetData.saveKml(kmlList);
    closeKmlModal();
    renderSettingsActiveTab();
    AlertsManager.showToast('تم حفظ ملف KML بنجاح', 'success', '💾');
  }

  function deleteTemplate(id) {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      let templates = FleetData.getTemplates();
      templates = templates.filter(t => t.id !== id);
      FleetData.saveTemplates(templates);
      renderSettingsActiveTab();
      AlertsManager.showToast('تم حذف القالب بنجاح', 'success', '🗑️');
    }
  }

  function deleteSelectedTemplates() {
    const checkedChks = document.querySelectorAll('.template-row-chk:checked');
    if (checkedChks.length === 0) {
      alert('الرجاء تحديد قوالب لحذفها');
      return;
    }
    if (confirm('هل أنت متأكد من حذف القوالب المحددة؟')) {
      const idsToDelete = Array.from(checkedChks).map(chk => chk.getAttribute('data-id'));
      let templates = FleetData.getTemplates();
      templates = templates.filter(t => !idsToDelete.includes(t.id));
      FleetData.saveTemplates(templates);
      renderSettingsActiveTab();
      AlertsManager.showToast('تم حذف القوالب المحددة بنجاح', 'success', '🗑️');
    }
  }

  function openAddTemplateModal() {
    openEditTemplateModal(null);
  }

  function openEditTemplateModal(id = null) {
    const existing = document.getElementById('template-properties-modal');
    if (existing) existing.remove();

    let templateName = '';
    let templateDesc = '';
    let templateSubject = '';
    let templateMessage = '';

    if (id) {
      const templates = FleetData.getTemplates();
      const t = templates.find(item => item.id === id);
      if (t) {
        templateName = t.name || '';
        templateDesc = t.description || '';
        templateSubject = t.subject || '';
        templateMessage = t.message || '';
      }
    }

    const modal = document.createElement('div');
    modal.id = 'template-properties-modal';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 30000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

    modal.innerHTML = `
      <div style="width: 850px; background: var(--bg-card, #ffffff); border-radius: 4px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
        
        <!-- Header -->
        <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; direction: ltr; user-select: none;">
          <h3 style="margin: 0; font-size: 15px; font-weight: bold; font-family: sans-serif;">Template properties</h3>
          <span onclick="App.closeTemplateModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; line-height: 1;">✕</span>
        </div>

        <!-- Form and Variables Body -->
        <div style="display: flex; gap: 20px; padding: 20px; max-height: 480px; overflow-y: auto; direction: ltr; background: var(--bg-primary, #ffffff);">
          
          <!-- Left side: Form -->
          <div style="flex: 1.3; display: flex; flex-direction: column; gap: 12px; text-align: left;">
            <div style="font-size: 14px; font-weight: bold; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 6px;">Template</div>
            
            <!-- اسم -->
            <div style="display: flex; align-items: center;">
              <label style="width: 100px; font-size: 13px; color: var(--text-secondary, #475569);">اسم</label>
              <input type="text" id="tpl-name" value="${templateName}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #334155);" required>
            </div>

            <!-- وصف -->
            <div style="display: flex; align-items: flex-start;">
              <label style="width: 100px; font-size: 13px; color: var(--text-secondary, #475569); margin-top: 4px;">وصف</label>
              <textarea id="tpl-desc" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #334155); height: 60px; resize: none; font-family: 'Cairo', sans-serif;">${templateDesc}</textarea>
            </div>

            <!-- Subject -->
            <div style="display: flex; align-items: center;">
              <label style="width: 100px; font-size: 13px; color: var(--text-secondary, #475569);">Subject</label>
              <input type="text" id="tpl-subject" value="${templateSubject}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #334155);" onfocus="App.setLastFocusedTplInput('tpl-subject')">
            </div>

            <!-- Message -->
            <div style="display: flex; align-items: flex-start;">
              <label style="width: 100px; font-size: 13px; color: var(--text-secondary, #475569); margin-top: 4px;">Message</label>
              <textarea id="tpl-message" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #334155); height: 160px; resize: none; font-family: sans-serif;" onfocus="App.setLastFocusedTplInput('tpl-message')">${templateMessage}</textarea>
            </div>

          </div>

          <!-- Right side: Variables -->
          <div style="width: 320px; display: flex; flex-direction: column; gap: 8px; text-align: left;">
            <div style="font-size: 14px; font-weight: bold; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 6px;">Variables</div>
            
            <div id="tpl-variables-list" style="flex: 1; border: 1px solid var(--border, #cbd5e1); border-radius: 4px; overflow-y: auto; background: var(--bg-secondary, #f8fafc); height: 280px; display: flex; flex-direction: column; font-family: monospace; font-size: 11px; color: #334155;">
              <div onclick="App.insertTplVariable('%NAME%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%NAME% - Object name</div>
              <div onclick="App.insertTplVariable('%IMEI%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%IMEI% - Object IMEI</div>
              <div onclick="App.insertTplVariable('%EVENT%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%EVENT% - Event name</div>
              <div onclick="App.insertTplVariable('%ROUTE%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%ROUTE% - Route name</div>
              <div onclick="App.insertTplVariable('%ZONE%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%ZONE% - Zone name</div>
              <div onclick="App.insertTplVariable('%LAT%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%LAT% - Position latitude</div>
              <div onclick="App.insertTplVariable('%LNG%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%LNG% - Position longitude</div>
              <div onclick="App.insertTplVariable('%ADDRESS%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%ADDRESS% - Position address</div>
              <div onclick="App.insertTplVariable('%SPEED%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%SPEED% - Speed</div>
              <div onclick="App.insertTplVariable('%ALT%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%ALT% - Altitude</div>
              <div onclick="App.insertTplVariable('%ANGLE%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%ANGLE% - Moving angle</div>
              <div onclick="App.insertTplVariable('%DT_POS%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%DT_POS% - Position date and time</div>
              <div onclick="App.insertTplVariable('%DT_SER%')" style="padding: 6px 10px; cursor: pointer; border-bottom: 1px solid var(--border, #e2e8f0);" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%DT_SER% - Server date and time</div>
              <div onclick="App.insertTplVariable('%G_MAP%')" style="padding: 6px 10px; cursor: pointer;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='transparent'">%G_MAP% - URL to Google Maps with position</div>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid var(--border, #e2e8f0); padding: 12px 16px; display: flex; justify-content: center; gap: 10px;">
          <button type="button" onclick="App.saveTemplate('${id || ''}')" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 16px; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>💾</span> حفظ
          </button>
          <button type="button" onclick="App.closeTemplateModal()" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 16px; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>✕</span> إلغاء
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    lastFocusedTplInput = document.getElementById('tpl-message');
  }

  function closeTemplateModal() {
    const modal = document.getElementById('template-properties-modal');
    if (modal) modal.remove();
  }

  function saveTemplate(id = '') {
    const name = document.getElementById('tpl-name').value.trim();
    const desc = document.getElementById('tpl-desc').value.trim();
    const subject = document.getElementById('tpl-subject').value.trim();
    const message = document.getElementById('tpl-message').value.trim();

    if (!name) {
      alert('الرجاء إدخال اسم القالب');
      return;
    }

    let templates = FleetData.getTemplates();

    if (id) {
      // Edit
      templates = templates.map(t => {
        if (t.id === id) {
          return { ...t, name, description: desc, subject, message };
        }
        return t;
      });
    } else {
      // Add
      const newTpl = {
        id: 'tpl_' + Date.now(),
        name,
        description: desc,
        subject,
        message
      };
      templates.push(newTpl);
    }

    FleetData.saveTemplates(templates);
    closeTemplateModal();
    renderSettingsActiveTab();
    AlertsManager.showToast('تم حفظ القالب بنجاح', 'success', '💾');
  }

  function playSingleTrip(tripId, event) {
    // Keep for backwards compatibility
  }

  return { 
    init,
    toggleVehicleVisibility: function(id, checked) {
      MapManager.toggleVehicleVisibility(id, checked);
    },
    toggleAllVehicleVisibility: function(el) {
      const checked = el.checked;
      const checkboxes = document.querySelectorAll('.vehicle-visibility-chk');
      checkboxes.forEach(chk => {
        chk.checked = checked;
        const id = chk.getAttribute('data-id');
        MapManager.toggleVehicleVisibility(id, checked);
      });
    },
    switchTab,
    refreshEventsTab,
    refreshPlacesTab,
    focusOnCoordinate,
    showHistory,
    hideHistory,
    onHistoryPeriodChange,
    playSingleTrip,
    exportEventsToExcel,
    clearEventsList,
    filterEventsList,
    filterPlacesList,
    openAddMarkerModal,
    switchMarkerTab,
    selectMarkerIcon,
    saveCustomMarker,
    closeAddMarkerModal,
    exportPlaces,
    clearPlacesList,
    openGroupsModal,
    closeGroupsModal,
    openAddGroupModal,
    saveNewGroup,
    populateGroupsTable,
    toggleSelectAllGroups,
    toggleGroupsSettingsMenu,
    deleteSelectedGroups,
    exportGroups,
    importGroups,
    openSettingsMainModal,
    closeSettingsMainModal,
    switchSettingsTab,
    renderSettingsActiveTab,
    openAddSettingsEventModal,
    openEditSettingsEventModal,
    saveSettingsEvent,
    deleteSettingsEvent,
    toggleSelectAllSettingsEvents,
    toggleSettingsEventsMenu,
    deleteSelectedSettingsEvents,
    exportSettingsEvents,
    addEventParamRow,
    deleteEventParamRow,
    toggleCustomDropdown,
    filterCustomDropdown,
    updateCustomDropdownSelection,
    selectAllCustomDropdown,
    switchSubmodalTab,
    toggleEventTimeDuration,
    toggleEventDaytime,
    updateObjectListColorPreview,
    playNotificationSound,
    openBillingModal,
    closeBillingModal,
    openEditDeviceModal,
    openAddTemplateModal,
    openEditTemplateModal,
    closeTemplateModal,
    saveTemplate,
    deleteTemplate,
    deleteSelectedTemplates,
    toggleTemplatesMenu,
    toggleSelectAllTemplates,
    insertTplVariable,
    setLastFocusedTplInput,
    openAddKmlModal,
    openEditKmlModal,
    closeKmlModal,
    saveKml,
    deleteKml,
    deleteSelectedKml,
    toggleKmlEnable,
    toggleSelectAllKml,
    toggleKmlMenu,
    handleKmlFileUpload,
    saveSmsSettings,
    clearSmsQueue,
    saveSettingsTab,
    playUiSound,
    updateColorInputBg,
    syncColorPicker
  };
})();

// ===== Bootstrap =====
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Global helpers used by inline event handlers
function closeVehicleDetailPanel() {
  const panel = document.getElementById('vehicle-detail-panel');
  if (panel) panel.classList.remove('open');
}
function selectAndFocusVehicle(id) {
  MapManager.focusVehicle(id);
  document.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id, openPanel: true } }));
}
function toggleGeofences() {
  const m = MapManager.getMap();
  let hasCircles = false;
  m.eachLayer(l => { if (l instanceof L.Circle) hasCircles = true; });
  if (hasCircles) {
    m.eachLayer(l => { if (l instanceof L.Circle) m.removeLayer(l); });
    document.getElementById('geofence-btn')?.classList.remove('active');
  } else {
    MapManager.drawGeofences();
    document.getElementById('geofence-btn')?.classList.add('active');
  }
}
function toggleTrails() {
  const active = MapManager.toggleTrails();
  const btn = document.getElementById('trail-btn');
  if (btn) btn.style.color = active ? 'var(--accent-light)' : '';
  AlertsManager.showToast(active ? 'تم تفعيل عرض المسارات' : 'تم إخفاء المسارات', 'success', '〰️');
}

function toggleVehicleVisibility(id, checked) {
  App.toggleVehicleVisibility(id, checked);
}
function toggleAllVehicleVisibility(el) {
  App.toggleAllVehicleVisibility(el);
}

function clearCacheAndReload() {
  // Preserve user settings so they survive the cache wipe
  const preserved = [
    'settings_ui', 'settings_events', 'custom_places',
    'custom_groups', 'map_last_position'
  ];
  const backup = {};
  preserved.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) backup[k] = v;
  });

  localStorage.clear();

  // Restore user settings immediately
  Object.keys(backup).forEach(k => localStorage.setItem(k, backup[k]));

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  if (window.caches) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  setTimeout(function() {
    window.location.reload(true);
  }, 200);
}

// ===== Vehicle Dropdown Menu & Callbacks =====
function openVehicleMenu(event, id) {
  event.preventDefault();
  event.stopPropagation();
  
  // Close any existing open menu first
  closeVehicleMenu();

  const v = FleetData.getVehicleById(id);
  if (!v) return;

  const menu = document.createElement('div');
  menu.className = 'vehicle-dropdown-menu';
  menu.id = 'active-vehicle-dropdown';
  
  // Position menu next to cursor
  menu.style.top = `${event.clientY}px`;
  menu.style.left = `${event.clientX - 180}px`;

  menu.innerHTML = `
    <div class="vehicle-dropdown-item has-submenu">
      <span>🕒 إظهار التاريخ</span>
      <span class="submenu-arrow">◀</span>
      <div class="vehicle-submenu">
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', '1h')">Last hour</div>
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', 'today')">اليوم</div>
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', 'yesterday')">أمس</div>
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', '2days')">قبل 2 أيام</div>
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', '3days')">قبل 3 أيام</div>
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', 'thisweek')">هذا الاسبوع</div>
    <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', 'lastweek')">الأسبوع الماضي</div>
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', 'thismonth')">هذا الشهر</div>
        <div class="vehicle-dropdown-item" onclick="navigateHistory('${id}', 'lastmonth')">الشهر الماضي</div>
      </div>
    </div>
    <div class="vehicle-dropdown-item" onclick="followVehicle('${id}')">
      <span>🎯 Follow</span>
    </div>
    <div class="vehicle-dropdown-item" onclick="followVehicleNewWindow('${id}')">
      <span>↗️ Follow (new window)</span>
    </div>
    <div class="vehicle-dropdown-item" onclick="openStreetView('${id}', ${v.lat}, ${v.lng})">
      <span>👤 Street View (new window)</span>
    </div>
    <div class="vehicle-dropdown-item" onclick="sendVehicleCommand('${id}')">
      <span>✈️ ارسال طلب</span>
    </div>
    <div class="vehicle-dropdown-item" onclick="editVehicle('${id}')">
      <span>✏️ تحرير</span>
    </div>
  `;

  document.body.appendChild(menu);
  
  // Register click handler to close menu on clicking anywhere else
  setTimeout(() => {
    document.addEventListener('click', closeVehicleMenu);
  }, 10);
}

function closeVehicleMenu() {
  const menu = document.getElementById('active-vehicle-dropdown');
  if (menu) {
    menu.remove();
  }
  document.removeEventListener('click', closeVehicleMenu);
}

function navigateHistory(id, period) {
  window.location.href = `pages/history.html?id=${id}&period=${period}`;
}

function followVehicle(id) {
  MapManager.focusVehicle(id);
  selectAndFocusVehicle(id);
}

function followVehicleNewWindow(id) {
  window.open(`index.html?focus=${id}`, '_blank');
}

function openStreetView(id, lat, lng) {
  window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`, '_blank');
}

function sendVehicleCommand(id) {
  const cmd = prompt("أدخل الطلب المراد إرساله للمركبة (مثال: stop_engine, resume_engine, refresh):");
  if (cmd) {
    alert(`تم إرسال الطلب "${cmd}" بنجاح للمركبة.`);
  }
}

function editVehicle(id) {
  const v = FleetData.getVehicleById(id);
  if (!v) return;

  // Close any existing modal first
  closeEditVehicleModal();

  const modal = document.createElement('div');
  modal.id = 'edit-vehicle-modal';
  modal.setAttribute('data-vehicle-id', id);
  modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 30000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

  // Get drivers list to populate
  const drivers = typeof FleetData.getDrivers === 'function' ? FleetData.getDrivers() : [];
  const driverOptions = drivers.map(d => `<option value="${d.id}" ${v.driverId === d.id ? 'selected' : ''}>${d.name}</option>`).join('');

  const randomSerial = v.serial || '';
  const randomSim = v.simNumber || '';
  const randomVin = v.vin || '';
  const randomGps = v.gpsDevice || '';
  const odometerVal = v.odometer !== undefined ? v.odometer : 152127;
  const engineHoursVal = v.engineHours !== undefined ? v.engineHours : 0;

  // Read saved values or defaults for icon tab
  const savedIconType = v.iconType || 'arrow';
  const savedOfflineColor = v.offlineColor || 'red';
  const savedStoppedColor = v.stoppedColor || 'red';
  const savedMovingColor = v.movingColor || 'green';
  const savedIdleColor = v.idleColor || 'off';
  const savedTailColor = v.tailColor || '00FF44';
  const savedTailPoints = v.tailPoints || 7;

  // Read saved values or defaults for fuel tab
  const savedFuelSource = v.fuelSource || 'Rates';
  const savedFuelMeasurement = v.fuelMeasurement || 'l/100km';
  const savedFuelCost = v.fuelCost || 0;
  const savedFuelSummerRate = v.fuelSummerRate || 0;
  const savedFuelWinterRate = v.fuelWinterRate || 0;
  const savedFuelWinterStart = v.fuelWinterStart || '2026-12-01';
  const savedFuelWinterEnd = v.fuelWinterEnd || '2026-03-01';

  // Read saved values or defaults for accuracy tab
  const savedTimezone = v.timezone || 'UTC 0:00';
  const savedStopDetection = v.stopDetection || 'GPS + ACC';
  const savedMinMoveSpeed = v.minMoveSpeed || 6;
  const savedMinIdleSpeed = v.minIdleSpeed || 3;
  const savedPathDiff = v.pathDiff || 0.0005;
  const savedUseGpslev = v.useGpslev !== undefined ? v.useGpslev : false;
  const savedGpslev = v.gpslev || 5;
  const savedUseHdop = v.useHdop !== undefined ? v.useHdop : false;
  const savedHdop = v.hdop || 3;
  const savedMinFuelDiffSpeed = v.minFuelDiffSpeed || 10;
  const savedFuelFillThresh = v.fuelFillThresh || 10;
  const savedFuelTheftThresh = v.fuelTheftThresh || 10;

  modal.innerHTML = `
    <div class="modal-container" style="width: 850px; background: var(--bg-card, #ffffff); border-radius: 4px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); font-family: Arial, sans-serif;">
      
      <!-- Modal Header -->
      <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; direction: ltr; user-select: none;">
        <h3 style="margin: 0; font-size: 16px; font-weight: bold; font-family: sans-serif;">تعديل الجهاز</h3>
        <span onclick="closeEditVehicleModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; line-height: 1;">✕</span>
      </div>

      <!-- Modal Tab Bar -->
      <div style="display: flex; background: #f8fafc; border-bottom: 1px solid var(--border, #e2e8f0); overflow-x: auto; padding: 0 4px; direction: ltr; user-select: none;">
        <div class="modal-tab active-tab" onclick="switchModalTab(this, 'main')" style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #3b82f6; border-bottom: 3px solid #3b82f6; cursor: pointer; white-space: nowrap;">رئيسي</div>
        <div class="modal-tab" onclick="switchModalTab(this, 'icon')" style="padding: 10px 14px; font-size: 13px; color: var(--text-secondary, #475569); cursor: pointer; white-space: nowrap;">رمز</div>
        <div class="modal-tab" onclick="switchModalTab(this, 'fuel')" style="padding: 10px 14px; font-size: 13px; color: var(--text-secondary, #475569); cursor: pointer; white-space: nowrap;">استهلاك الوقود</div>
        <div class="modal-tab" onclick="switchModalTab(this, 'accuracy')" style="padding: 10px 14px; font-size: 13px; color: var(--text-secondary, #475569); cursor: pointer; white-space: nowrap;">دقة</div>
        <div class="modal-tab" onclick="switchModalTab(this, 'sensors')" style="padding: 10px 14px; font-size: 13px; color: var(--text-secondary, #475569); cursor: pointer; white-space: nowrap;">أجهزة الاستشعار</div>
        <div class="modal-tab" onclick="switchModalTab(this, 'service')" style="padding: 10px 14px; font-size: 13px; color: var(--text-secondary, #475569); cursor: pointer; white-space: nowrap;">خدمة</div>
        <div class="modal-tab" onclick="switchModalTab(this, 'custom')" style="padding: 10px 14px; font-size: 13px; color: var(--text-secondary, #475569); cursor: pointer; white-space: nowrap;">حقول مخصصة</div>
        <div class="modal-tab" onclick="switchModalTab(this, 'info')" style="padding: 10px 14px; font-size: 13px; color: var(--text-secondary, #475569); cursor: pointer; white-space: nowrap;">معلومات</div>
      </div>

      <!-- Modal Form Body -->
      <form id="edit-vehicle-form" onsubmit="event.preventDefault(); saveEditVehicle('${id}');" style="padding: 20px; overflow-y: auto; max-height: 480px; display: flex; flex-direction: column; gap: 10px; margin: 0; direction: ltr; text-align: left;">
        
        <!-- Tab Content: main -->
        <div id="modal-tab-main" class="modal-tab-content-panel" style="display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 13px; font-weight: bold; color: #3b82f6; margin-bottom: 8px; padding-bottom: 2px;">رئيسي</div>
          
          <!-- Name -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">اسم</label>
            <input type="text" id="edit-v-name" value="${v.name || ''}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;" required>
          </div>

          <!-- Serial -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">الرقم التسلسلي</label>
            <input type="text" id="edit-v-uniqueId" value="${randomSerial}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Vehicle Type -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">نوع المركبة</label>
            <select id="edit-v-type" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left;">
        <!-- Tab Content: icon -->
        <div id="modal-tab-icon" class="modal-tab-content-panel" style="display: none; flex-direction: column; gap: 10px;">
          <div style="font-size: 13px; font-weight: bold; color: #3b82f6; margin-bottom: 8px; padding-bottom: 2px;">رمز</div>

          <!-- Icon Type -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">أيقونة تظهر على الخريطة</label>
            <select id="edit-v-iconType" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left; -webkit-appearance: menulist; appearance: menulist;">
              <option value="arrow" ${savedIconType === 'arrow' ? 'selected' : ''}>سهم</option>
              <option value="default" ${savedIconType === 'default' ? 'selected' : ''}>الافتراضي</option>
            </select>
          </div>

          <!-- Offline Color -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">لون سهم عدم الاتصال</label>
            <select id="edit-v-offlineColor" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left; -webkit-appearance: menulist; appearance: menulist;">
              <option value="red" ${savedOfflineColor === 'red' ? 'selected' : ''}>أحمر</option>
              <option value="gray" ${savedOfflineColor === 'gray' ? 'selected' : ''}>رمادي</option>
              <option value="blue" ${savedOfflineColor === 'blue' ? 'selected' : ''}>أزرق</option>
            </select>
          </div>

          <!-- Stopped Color -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">لون سهم التوقف</label>
            <select id="edit-v-stoppedColor" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left; -webkit-appearance: menulist; appearance: menulist;">
              <option value="red" ${savedStoppedColor === 'red' ? 'selected' : ''}>أحمر</option>
              <option value="orange" ${savedStoppedColor === 'orange' ? 'selected' : ''}>برتقالي</option>
              <option value="yellow" ${savedStoppedColor === 'yellow' ? 'selected' : ''}>أصفر</option>
            </select>
          </div>

          <!-- Moving Color -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">لون سهم الحركة</label>
            <select id="edit-v-movingColor" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left; -webkit-appearance: menulist; appearance: menulist;">
              <option value="green" ${savedMovingColor === 'green' ? 'selected' : ''}>أخضر</option>
              <option value="blue" ${savedMovingColor === 'blue' ? 'selected' : ''}>أزرق</option>
              <option value="red" ${savedMovingColor === 'red' ? 'selected' : ''}>أحمر</option>
            </select>
          </div>

          <!-- Idle Color -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">لون سهم خمول المحرك</label>
            <select id="edit-v-idleColor" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left; -webkit-appearance: menulist; appearance: menulist;">
              <option value="off" ${savedIdleColor === 'off' ? 'selected' : ''}>إيقاف</option>
              <option value="yellow" ${savedIdleColor === 'yellow' ? 'selected' : ''}>أصفر</option>
              <option value="orange" ${savedIdleColor === 'orange' ? 'selected' : ''}>برتقالي</option>
            </select>
          </div>

          <!-- Icon Visual -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">رمز</label>
            <div style="font-size: 24px; line-height: 1; cursor: default;">🚗</div>
          </div>

          <!-- Tail Section -->
          <div style="font-size: 14px; font-weight: bold; color: #3b82f6; margin-top: 15px; margin-bottom: 6px; padding-bottom: 2px;">المسار الخلفي</div>

          <!-- Tail Color -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">لون المسار الخلفي</label>
            <input type="text" id="edit-v-tailColor" value="${savedTailColor}" style="width: 80px; text-align: center; font-weight: bold; background: #${savedTailColor}; color: #000; border: none; border-radius: 4px; padding: 4px; font-size: 11px;">
            <input type="color" id="edit-v-tailColorPicker" value="#${savedTailColor}" oninput="document.getElementById('edit-v-tailColor').value = this.value.replace('#', '').toUpperCase(); document.getElementById('edit-v-tailColor').style.background = this.value;" style="width: 28px; height: 28px; padding: 0; border: none; cursor: pointer; background: none;">
          </div>

          <!-- Tail Points Quantity -->
          <div style="display: flex; align-items: center;">
            <label style="width: 180px; font-size: 13px; color: #475569; font-weight: normal;">عدد نقاط المسار الخلفي</label>
            <input type="number" id="edit-v-tailPoints" value="${savedTailPoints}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>
        </div>

        <!-- Tab Content: fuel -->
        <div id="modal-tab-fuel" class="modal-tab-content-panel" style="display: none; flex-direction: column; gap: 10px;">
          <div style="font-size: 13px; font-weight: bold; color: #3b82f6; margin-bottom: 8px; padding-bottom: 2px;">الحساب</div>

          <!-- Source -->
          <div style="display: flex; align-items: center;">
            <label style="width: 200px; font-size: 13px; color: #475569; font-weight: normal;">المصدر</label>
            <select id="edit-v-fuelSource" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left; -webkit-appearance: menulist; appearance: menulist;">
              <option value="Rates" ${savedFuelSource === 'Rates' ? 'selected' : ''}>المعدلات</option>
              <option value="OBD" ${savedFuelSource === 'OBD' ? 'selected' : ''}>OBD</option>
              <option value="Off" ${savedFuelSource === 'Off' ? 'selected' : ''}>إيقاف</option>
            </select>
          </div>

          <!-- Measurement -->
          <div style="display: flex; align-items: center;">
            <label style="width: 200px; font-size: 13px; color: #475569; font-weight: normal;">القياس</label>
            <select id="edit-v-fuelMeasurement" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; cursor: pointer; text-align: left; -webkit-appearance: menulist; appearance: menulist;">
              <option value="Rates" ${savedFuelMeasurement === 'Rates' || savedFuelMeasurement === 'l/100km' ? 'selected' : ''}>المعدلات</option>
              <option value="level" ${savedFuelMeasurement === 'level' ? 'selected' : ''}>مستوى الوقود</option>
              <option value="consumption" ${savedFuelMeasurement === 'consumption' ? 'selected' : ''}>استهلاك الوقود</option>
            </select>
          </div>

          <!-- Cost per liter -->
          <div style="display: flex; align-items: center;">
            <label style="width: 200px; font-size: 13px; color: #475569; font-weight: normal;">تكلفة اللتر</label>
            <input type="number" step="0.01" id="edit-v-fuelCost" value="${savedFuelCost}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <div style="font-size: 13px; font-weight: bold; color: #3b82f6; margin-top: 15px; margin-bottom: 6px; padding-bottom: 2px;">المعدلات</div>

          <!-- Summer rate -->
          <div style="display: flex; align-items: center;">
            <label style="width: 200px; font-size: 13px; color: #475569; font-weight: normal;">معدل الصيف (كيلومتر لكل لتر)</label>
            <input type="number" step="0.1" id="edit-v-fuelSummerRate" value="${savedFuelSummerRate}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Winter rate -->
          <div style="display: flex; align-items: center;">
            <label style="width: 200px; font-size: 13px; color: #475569; font-weight: normal;">معدل الشتاء (كيلومتر لكل لتر)</label>
            <input type="number" step="0.1" id="edit-v-fuelWinterRate" value="${savedFuelWinterRate}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Winter start date -->
          <div style="display: flex; align-items: center;">
            <label style="width: 200px; font-size: 13px; color: #475569; font-weight: normal;">الشتاء من (الشهر واليوم)</label>
            <input type="date" id="edit-v-fuelWinterStart" value="${savedFuelWinterStart}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left; cursor: pointer;">
          </div>

          <!-- Winter end date -->
          <div style="display: flex; align-items: center;">
            <label style="width: 200px; font-size: 13px; color: #475569; font-weight: normal;">الشتاء إلى (الشهر واليوم)</label>
            <input type="date" id="edit-v-fuelWinterEnd" value="${savedFuelWinterEnd}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left; cursor: pointer;">
          </div>
        </div>

        <!-- Tab Content: accuracy -->
        <div id="modal-tab-accuracy" class="modal-tab-content-panel" style="display: none; flex-direction: column; gap: 10px;">
          <div style="font-size: 13px; font-weight: bold; color: #3b82f6; margin-bottom: 8px; padding-bottom: 2px;">دقة</div>

          <!-- Time zone offset -->
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 4px;">
            <label style="flex: 1; font-size: 12px; color: #475569; line-height: 1.4;">إزاحة المنطقة الزمنية - بشكل افتراضي يجب تعيينها على (UTC 0:00)، قم بتعديلها فقط في حال تعذر ضبط المنطقة الزمنية (UTC 0:00) في جهاز الـ GPS</label>
            <select id="edit-v-timezone" style="width: 250px; padding: 6px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; -webkit-appearance: menulist; appearance: menulist;">
              <option value="UTC-14:00" ${savedTimezone === 'UTC-14:00' ? 'selected' : ''}>(UTC -14:00)</option>
              <option value="UTC-13:00" ${savedTimezone === 'UTC-13:00' ? 'selected' : ''}>(UTC -13:00)</option>
              <option value="UTC-12:00" ${savedTimezone === 'UTC-12:00' ? 'selected' : ''}>(UTC -12:00)</option>
              <option value="UTC-11:00" ${savedTimezone === 'UTC-11:00' ? 'selected' : ''}>(UTC -11:00)</option>
              <option value="UTC-10:00" ${savedTimezone === 'UTC-10:00' ? 'selected' : ''}>(UTC -10:00)</option>
              <option value="UTC-09:00" ${savedTimezone === 'UTC-09:00' ? 'selected' : ''}>(UTC -9:00)</option>
              <option value="UTC-08:00" ${savedTimezone === 'UTC-08:00' ? 'selected' : ''}>(UTC -8:00)</option>
              <option value="UTC-07:00" ${savedTimezone === 'UTC-07:00' ? 'selected' : ''}>(UTC -7:00)</option>
              <option value="UTC-06:00" ${savedTimezone === 'UTC-06:00' ? 'selected' : ''}>(UTC -6:00)</option>
              <option value="UTC-05:00" ${savedTimezone === 'UTC-05:00' ? 'selected' : ''}>(UTC -5:00)</option>
              <option value="UTC-04:00" ${savedTimezone === 'UTC-04:00' ? 'selected' : ''}>(UTC -4:00)</option>
              <option value="UTC-03:00" ${savedTimezone === 'UTC-03:00' ? 'selected' : ''}>(UTC -3:00)</option>
              <option value="UTC-02:00" ${savedTimezone === 'UTC-02:00' ? 'selected' : ''}>(UTC -2:00)</option>
              <option value="UTC-01:00" ${savedTimezone === 'UTC-01:00' ? 'selected' : ''}>(UTC -1:00)</option>
              <option value="UTC 0:00" ${savedTimezone === 'UTC 0:00' ? 'selected' : ''}>(UTC 0:00)</option>
              <option value="UTC+01:00" ${savedTimezone === 'UTC+01:00' ? 'selected' : ''}>(UTC +1:00)</option>
              <option value="UTC+02:00" ${savedTimezone === 'UTC+02:00' ? 'selected' : ''}>(UTC +2:00)</option>
              <option value="UTC+03:00" ${savedTimezone === 'UTC+03:00' ? 'selected' : ''}>(UTC +3:00)</option>
              <option value="UTC+04:00" ${savedTimezone === 'UTC+04:00' ? 'selected' : ''}>(UTC +4:00)</option>
              <option value="UTC+05:00" ${savedTimezone === 'UTC+05:00' ? 'selected' : ''}>(UTC +5:00)</option>
              <option value="UTC+06:00" ${savedTimezone === 'UTC+06:00' ? 'selected' : ''}>(UTC +6:00)</option>
              <option value="UTC+07:00" ${savedTimezone === 'UTC+07:00' ? 'selected' : ''}>(UTC +7:00)</option>
              <option value="UTC+08:00" ${savedTimezone === 'UTC+08:00' ? 'selected' : ''}>(UTC +8:00)</option>
              <option value="UTC+09:00" ${savedTimezone === 'UTC+09:00' ? 'selected' : ''}>(UTC +9:00)</option>
              <option value="UTC+10:00" ${savedTimezone === 'UTC+10:00' ? 'selected' : ''}>(UTC +10:00)</option>
              <option value="UTC+11:00" ${savedTimezone === 'UTC+11:00' ? 'selected' : ''}>(UTC +11:00)</option>
              <option value="UTC+12:00" ${savedTimezone === 'UTC+12:00' ? 'selected' : ''}>(UTC +12:00)</option>
              <option value="UTC+13:00" ${savedTimezone === 'UTC+13:00' ? 'selected' : ''}>(UTC +13:00)</option>
              <option value="UTC+14:00" ${savedTimezone === 'UTC+14:00' ? 'selected' : ''}>(UTC +14:00)</option>
            </select>
          </div>

          <!-- Stop detection source -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 13px; color: #475569;">مصدر كشف التوقف</label>
            <select id="edit-v-stopDetection" style="width: 250px; padding: 6px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; height: 32px; -webkit-appearance: menulist; appearance: menulist;">
              <option value="GPS" ${savedStopDetection === 'GPS' ? 'selected' : ''}>GPS</option>
              <option value="ACC" ${savedStopDetection === 'ACC' ? 'selected' : ''}>ACC</option>
              <option value="GPS + ACC" ${savedStopDetection === 'GPS + ACC' ? 'selected' : ''}>GPS + ACC</option>
            </select>
          </div>

          <!-- Min moving speed -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 12px; color: #475569;">الحد الأدنى لسرعة الحركة (كم/ساعة) (يؤثر على دقة التتبع والتوقف، الافتراضي 6)</label>
            <input type="number" id="edit-v-minMoveSpeed" value="${savedMinMoveSpeed}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Engine idle speed -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 13px; color: #475569;">الحد الأدنى لسرعة خمول المحرك (كم/ساعة) (يؤثر على حالة خمول المحرك، الافتراضي 3)</label>
            <input type="number" id="edit-v-minIdleSpeed" value="${savedMinIdleSpeed}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Path distance diff -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 12px; color: #475569;">الحد الأدنى للفرق بين نقاط المسار (يزيل الانجراف، الافتراضي 0.0005)</label>
            <input type="number" step="0.0001" id="edit-v-pathDiff" value="${savedPathDiff}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- GPS Level -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 12px; color: #475569;">مستوى إشارة الـ GPS الأدنى (يزيل الانجراف، الافتراضي 5)</label>
            <div style="width: 250px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="edit-v-useGpslev" ${savedUseGpslev ? 'checked' : ''} style="cursor: pointer;">
              <input type="number" id="edit-v-gpslev" value="${savedGpslev}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
            </div>
          </div>

          <!-- HDOP -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 12px; color: #475569;">قيمة الـ HDOP الأقصى (يزيل الانجراف، الافتراضي 3)</label>
            <div style="width: 250px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="edit-v-useHdop" ${savedUseHdop ? 'checked' : ''} style="cursor: pointer;">
              <input type="number" id="edit-v-hdop" value="${savedHdop}" style="flex: 1; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
            </div>
          </div>

          <!-- Min fuel diff speed -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 13px; color: #475569;">الحد الأدنى لسرعة كشف اختلاف الوقود (كم/ساعة) (الافتراضي 10)</label>
            <input type="number" id="edit-v-minFuelDiffSpeed" value="${savedMinFuelDiffSpeed}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Fuel fill threshold -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 12px; color: #475569;">الحد الأدنى لكشف تزويد الوقود (الافتراضي 10)</label>
            <input type="number" id="edit-v-fuelFillThresh" value="${savedFuelFillThresh}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Fuel theft threshold -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="flex: 1; font-size: 12px; color: #475569;">الحد الأدنى لكشف سرقة الوقود (الافتراضي 10)</label>
            <input type="number" id="edit-v-fuelTheftThresh" value="${savedFuelTheftThresh}" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; color: #334155; text-align: left;">
          </div>

          <!-- Other/آخر Section -->
          <div style="font-size: 14px; font-weight: bold; color: #3b82f6; margin-top: 15px; margin-bottom: 6px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">آخر</div>

          <!-- Clear sensor cache -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            <label style="flex: 1; font-size: 13px; color: #475569;">مسح ذاكرة تخزين الحساسات المكتشفة</label>
            <button type="button" onclick="alert('تم مسح ذاكرة التخزين المؤقت للحساسات!')" style="width: 250px; padding: 6px 12px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f1f5f9; color: #334155; cursor: pointer; text-align: center; font-weight: 500;">مسح</button>
          </div>

        </div>

        <!-- Tab Content: sensors -->
        <div id="modal-tab-sensors" class="modal-tab-content-panel" style="display: none; flex-direction: column; gap: 10px; width: 100%;">
          <!-- Table -->
          <div style="border: 1px solid var(--border, #e2e8f0); border-radius: 4px; overflow: hidden; background: var(--bg-primary, #ffffff); max-height: 250px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right; direction: rtl;">
              <thead>
                <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                  <th style="padding: 6px; width: 30px; text-align: center;"><input type="checkbox" style="cursor: pointer;"></th>
                  <th style="padding: 6px; font-weight: 700;">اسم</th>
                  <th style="padding: 6px; font-weight: 700;">نوع</th>
                  <th style="padding: 6px; font-weight: 700;">الضبط</th>
                  <th style="padding: 6px; width: 80px; text-align: center;">العمليات</th>
                </tr>
              </thead>
              <tbody id="sensors-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>

          <!-- Bottom Control Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-top: 1px solid var(--border, #e2e8f0); margin-top: 4px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <!-- Add button -->
              <button type="button" onclick="openSensorPropertiesModal()" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer;" title="إضافة استشعار">+</button>
              <!-- Refresh button -->
              <button type="button" onclick="refreshSensorsTable()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
              <!-- Settings button -->
              <button type="button" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="خيارات">⚙️</button>
            </div>
          </div>
        </div>

        <!-- Tab Content: service -->
        <div id="modal-tab-service" class="modal-tab-content-panel" style="display: none; flex-direction: column; gap: 10px; width: 100%;">
          <!-- Table -->
          <div style="border: 1px solid var(--border, #e2e8f0); border-radius: 4px; overflow: hidden; background: var(--bg-primary, #ffffff); max-height: 250px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right; direction: rtl;">
              <thead>
                <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                  <th style="padding: 6px; width: 30px; text-align: center;"><input type="checkbox" style="cursor: pointer;"></th>
                  <th style="padding: 6px; font-weight: 700;">اسم</th>
                  <th style="padding: 6px; font-weight: 700;">حالة</th>
                  <th style="padding: 6px; width: 80px; text-align: center;">العمليات</th>
                </tr>
              </thead>
              <tbody id="service-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>

          <!-- Bottom Control Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-top: 1px solid var(--border, #e2e8f0); margin-top: 4px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <!-- Add button -->
              <button type="button" onclick="openServicePropertiesModal()" style="background: #3b82f6; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer;" title="إضافة خدمة">+</button>
              <!-- Refresh button -->
              <button type="button" onclick="refreshServiceTable()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
              <!-- Settings button -->
              <button type="button" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="خيارات">⚙️</button>
            </div>
          </div>
        </div>

        <!-- Tab Content: info -->
        <div id="modal-tab-info" class="modal-tab-content-panel" style="display: none; flex-direction: column; gap: 10px; width: 100%;">
          <!-- Table -->
          <div style="border: 1px solid var(--border, #e2e8f0); border-radius: 4px; overflow: hidden; background: var(--bg-primary, #ffffff); max-height: 280px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right; direction: rtl;">
              <thead>
                <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-secondary, #475569);">
                  <th style="padding: 8px 12px; font-weight: 700; width: 30%;">معطيات</th>
                  <th style="padding: 8px 12px; font-weight: 700; width: 70%;">قيمة</th>
                </tr>
              </thead>
              <tbody id="info-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>

          <!-- Bottom Control Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-top: 1px solid var(--border, #e2e8f0); margin-top: 4px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <!-- Refresh button -->
              <button type="button" onclick="populateInfoTable()" style="background: transparent; border: 1px solid var(--border, #e2e8f0); width: 28px; height: 28px; border-radius: 4px; color: var(--text-secondary, #475569); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;" title="تحديث">🔄</button>
            </div>
          </div>
        </div>

        <!-- Other Tabs Content -->
        <div id="modal-tab-other" class="modal-tab-content-panel" style="display: none; padding: 20px; text-align: center; color: var(--text-secondary, #475569); font-size: 12px;">
          هذه اللوحة متاحة وجاهزة للتخصيص في النسخة الاحترافية.
        </div>

      </form>

      <!-- Modal Footer -->
      <div style="padding: 12px 16px; border-top: 1px solid #cbd5e1; display: flex; justify-content: center; gap: 12px; background: #f8fafc; user-select: none; direction: ltr;">
        <button type="button" onclick="saveEditVehicle('${id}')" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 6px 20px; font-size: 13px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          💾 &nbsp; حفظ
        </button>
        <button type="button" onclick="closeEditVehicleModal()" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 6px 20px; font-size: 13px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          ✕ &nbsp; إلغاء
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);
}

function closeEditVehicleModal() {
  const modal = document.getElementById('edit-vehicle-modal');
  if (modal) modal.remove();
}

function switchModalTab(tabEl, tabId) {
  // Toggle active class on tabs
  const tabContainer = tabEl.parentElement;
  tabContainer.querySelectorAll('.modal-tab').forEach(t => {
    t.style.color = 'var(--text-secondary, #475569)';
    t.style.borderBottom = 'none';
    t.style.fontWeight = 'normal';
  });

  tabEl.style.color = '#3b82f6';
  tabEl.style.borderBottom = '3px solid #3b82f6';
  tabEl.style.fontWeight = '700';

  // Toggle tab contents
  const mainTabContent = document.getElementById('modal-tab-main');
  const iconTabContent = document.getElementById('modal-tab-icon');
  const fuelTabContent = document.getElementById('modal-tab-fuel');
  const accuracyTabContent = document.getElementById('modal-tab-accuracy');
  const sensorsTabContent = document.getElementById('modal-tab-sensors');
  const serviceTabContent = document.getElementById('modal-tab-service');
  const infoTabContent = document.getElementById('modal-tab-info');
  const otherTabContent = document.getElementById('modal-tab-other');

  // Hide all first
  mainTabContent.style.display = 'none';
  iconTabContent.style.display = 'none';
  fuelTabContent.style.display = 'none';
  accuracyTabContent.style.display = 'none';
  sensorsTabContent.style.display = 'none';
  serviceTabContent.style.display = 'none';
  infoTabContent.style.display = 'none';
  otherTabContent.style.display = 'none';

  if (tabId === 'main') {
    mainTabContent.style.display = 'flex';
  } else if (tabId === 'icon') {
    iconTabContent.style.display = 'flex';
  } else if (tabId === 'fuel') {
    fuelTabContent.style.display = 'flex';
  } else if (tabId === 'accuracy') {
    accuracyTabContent.style.display = 'flex';
  } else if (tabId === 'sensors') {
    sensorsTabContent.style.display = 'flex';
    populateSensorsTable();
  } else if (tabId === 'service') {
    serviceTabContent.style.display = 'flex';
    populateServiceTable();
  } else if (tabId === 'info') {
    infoTabContent.style.display = 'flex';
    populateInfoTable();
  } else {
    otherTabContent.style.display = 'block';
    otherTabContent.innerHTML = `لوحة <b>"${tabEl.textContent}"</b> نشطة وقابلة للتعديل عند ربط الحقول المخصصة بالمركبة.`;
  }
}

function saveEditVehicle(id) {
  const name = document.getElementById('edit-v-name').value;
  const plate = document.getElementById('edit-v-plate').value;
  const type = document.getElementById('edit-v-type').value;
  const uniqueId = document.getElementById('edit-v-uniqueId').value;
  const vin = document.getElementById('edit-v-vin').value;
  const gpsDevice = document.getElementById('edit-v-gps').value;
  const simNumber = document.getElementById('edit-v-sim').value;
  const odometer = parseInt(document.getElementById('edit-v-odoVal').value || 0);
  const engineHours = parseInt(document.getElementById('edit-v-hoursVal').value || 0);

  const iconType = document.getElementById('edit-v-iconType').value;
  const offlineColor = document.getElementById('edit-v-offlineColor').value;
  const stoppedColor = document.getElementById('edit-v-stoppedColor').value;
  const movingColor = document.getElementById('edit-v-movingColor').value;
  const idleColor = document.getElementById('edit-v-idleColor').value;
  const tailColor = document.getElementById('edit-v-tailColor').value;
  const tailPoints = parseInt(document.getElementById('edit-v-tailPoints').value || 7);

  const fuelSource = document.getElementById('edit-v-fuelSource').value;
  const fuelMeasurement = document.getElementById('edit-v-fuelMeasurement').value;
  const fuelCost = parseFloat(document.getElementById('edit-v-fuelCost').value || 0);
  const fuelSummerRate = parseFloat(document.getElementById('edit-v-fuelSummerRate').value || 0);
  const fuelWinterRate = parseFloat(document.getElementById('edit-v-fuelWinterRate').value || 0);
  const fuelWinterStart = document.getElementById('edit-v-fuelWinterStart').value;
  const fuelWinterEnd = document.getElementById('edit-v-fuelWinterEnd').value;

  const timezone = document.getElementById('edit-v-timezone').value;
  const stopDetection = document.getElementById('edit-v-stopDetection').value;
  const minMoveSpeed = parseFloat(document.getElementById('edit-v-minMoveSpeed').value || 6);
  const minIdleSpeed = parseFloat(document.getElementById('edit-v-minIdleSpeed').value || 3);
  const pathDiff = parseFloat(document.getElementById('edit-v-pathDiff').value || 0.0005);
  const useGpslev = document.getElementById('edit-v-useGpslev').checked;
  const gpslev = parseInt(document.getElementById('edit-v-gpslev').value || 5);
  const useHdop = document.getElementById('edit-v-useHdop').checked;
  const hdop = parseInt(document.getElementById('edit-v-hdop').value || 3);
  const minFuelDiffSpeed = parseFloat(document.getElementById('edit-v-minFuelDiffSpeed').value || 10);
  const fuelFillThresh = parseFloat(document.getElementById('edit-v-fuelFillThresh').value || 10);
  const fuelTheftThresh = parseFloat(document.getElementById('edit-v-fuelTheftThresh').value || 10);

  if (!name || !plate) {
    alert('الرجاء تعبئة الحقول المطلوبة (الاسم واللوحة)');
    return;
  }

  // Get active vehicle sensors so they are not overwritten
  const v = FleetData.getVehicleById(id);
  const sensors = v ? v.sensors : null;
  const services = v ? v.services : null;

  // Update vehicle in FleetData
  const success = FleetData.updateVehicle(id, {
    name,
    plate,
    type,
    uniqueId,
    vin,
    gpsDevice,
    simNumber,
    odometer,
    engineHours,
    iconType,
    offlineColor,
    stoppedColor,
    movingColor,
    idleColor,
    tailColor,
    tailPoints,
    fuelSource,
    fuelMeasurement,
    fuelCost,
    fuelSummerRate,
    fuelWinterRate,
    fuelWinterStart,
    fuelWinterEnd,
    timezone,
    stopDetection,
    minMoveSpeed,
    minIdleSpeed,
    pathDiff,
    useGpslev,
    gpslev,
    useHdop,
    hdop,
    minFuelDiffSpeed,
    fuelFillThresh,
    fuelTheftThresh,
    sensors,
    services
  });

  if (success) {
    closeEditVehicleModal();
    // Reload page to reflect changes
    window.location.reload();
  } else {
    alert('فشل حفظ البيانات. الرجاء المحاولة مرة أخرى.');
  }
}

// Sensors management logic
const defaultSensors = [
  { name: 'Crash detection', type: 'اختر الأمر', param: 'io247' },
  { name: 'Engine', type: 'اشتعال (ACC)', param: 'io239' },
  { name: 'Green driving type', type: 'اختر الأمر', param: 'io253' },
  { name: 'towing', type: 'اختر الأمر', param: 'io246' },
  { name: 'انقطاع التيار الكهربائي', type: 'اختر الأمر', param: 'io66' },
  { name: 'فصل الجهاز', type: 'اختر الأمر', param: 'io252' }
];

function populateSensorsTable() {
  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;
  
  if (!v.sensors) {
    v.sensors = JSON.parse(JSON.stringify(defaultSensors));
  }
  
  const tbody = document.getElementById('sensors-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = v.sensors.map((s, index) => `
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 6px; text-align: center;"><input type="checkbox" style="cursor: pointer;"></td>
      <td style="padding: 6px;">${s.name}</td>
      <td style="padding: 6px;">${s.type}</td>
      <td style="padding: 6px;">${s.param}</td>
      <td style="padding: 6px; text-align: center; display: flex; justify-content: center; gap: 8px;">
        <span onclick="openSensorPropertiesModal(${index})" style="cursor: pointer; color: #3b82f6; font-size: 14px;" title="تعديل">✏️</span>
        <span onclick="deleteSensor(${index})" style="cursor: pointer; color: #ef4444; font-size: 14px;" title="حذف">🗑️</span>
      </td>
    </tr>
  `).join('');
}

function refreshSensorsTable() {
  populateSensorsTable();
}

function deleteSensor(index) {
  if (!confirm('هل أنت متأكد من حذف هذا الاستشعار؟')) return;
  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;
  
  if (!v.sensors) {
    v.sensors = JSON.parse(JSON.stringify(defaultSensors));
  }
  v.sensors.splice(index, 1);
  populateSensorsTable();
}

let currentCalibrationPoints = [];
let currentDictionaryEntries = [];

function openSensorPropertiesModal(sensorIndex = null) {
  let name = '';
  let type = 'Battery';
  let param = 'io1';
  let dataList = true;
  let popup = false;
  let resultType = 'قيمة';
  let units = 'Percentage';
  let textOn = '';
  let textOff = '';
  let formula = '(X+1)/2*3';
  let minVal = '';
  let maxVal = '';
  let ignoreIgnition = false;

  currentCalibrationPoints = [];
  currentDictionaryEntries = [];

  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;
  
  if (!v.sensors) {
    v.sensors = JSON.parse(JSON.stringify(defaultSensors));
  }

  if (sensorIndex !== null) {
    const s = v.sensors[sensorIndex];
    if (s) {
      name = s.name || '';
      type = s.type || 'Battery';
      param = s.param || 'io1';
      dataList = s.dataList !== undefined ? s.dataList : true;
      popup = s.popup || false;
      units = s.units || '';
      textOn = s.textOn || '';
      textOff = s.textOff || '';
      formula = s.formula || '';
      minVal = s.minVal || '';
      maxVal = s.maxVal || '';
      ignoreIgnition = s.ignoreIgnition || false;
      currentCalibrationPoints = s.calibration || [];
      currentDictionaryEntries = s.dictionary || [];
    }
  }

  const overlay = document.createElement('div');
  overlay.id = 'sensor-properties-modal';
  overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 20000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

  overlay.innerHTML = `
    <div style="width: 900px; background: var(--bg-card, #ffffff); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); max-height: 90vh;">
      
      <!-- Header -->
      <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 15px; font-weight: 700;">خصائص استشعار</h3>
        <span onclick="closeSensorPropertiesModal()" style="cursor: pointer; font-size: 24px; font-weight: bold; line-height: 1;">&times;</span>
      </div>

      <!-- Content Split into 3 Columns -->
      <div style="padding: 16px; display: flex; gap: 16px; overflow-y: auto; flex: 1; direction: rtl; text-align: right;">
        
        <!-- Column 1: الاستشعار -->
        <div style="flex: 1.2; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--border, #e2e8f0); padding-left: 12px;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 4px;">الاستشعار</div>
          
          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">اسم</label>
            <input type="text" id="sensor-name" value="${name}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">نوع</label>
            <select id="sensor-type" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a); height: 26px;">
              <option value="Battery" ${type === 'Battery' ? 'selected' : ''}>Battery</option>
              <option value="المدخلات الرقمية" ${type === 'المدخلات الرقمية' ? 'selected' : ''}>المدخلات الرقمية</option>
              <option value="الإخراج الرقمي" ${type === 'الإخراج الرقمي' ? 'selected' : ''}>الإخراج الرقمي</option>
              <option value="Driver assign" ${type === 'Driver assign' ? 'selected' : ''}>Driver assign</option>
              <option value="ساعات المحرك" ${type === 'ساعات المحرك' ? 'selected' : ''}>ساعات المحرك</option>
              <option value="مستوى الوقود" ${type === 'مستوى الوقود' ? 'selected' : ''}>مستوى الوقود</option>
              <option value="Fuel level sum up" ${type === 'Fuel level sum up' ? 'selected' : ''}>Fuel level sum up</option>
              <option value="استهلاك الوقود" ${type === 'استهلاك الوقود' ? 'selected' : ''}>استهلاك الوقود</option>
              <option value="GSM level" ${type === 'GSM level' ? 'selected' : ''}>GSM level</option>
              <option value="GPS level" ${type === 'GPS level' ? 'selected' : ''}>GPS level</option>
              <option value="اشتعال (ACC)" ${type === 'اشتعال (ACC)' || type === '(ACC) اشتعال' ? 'selected' : ''}>اشتعال (ACC)</option>
              <option value="عداد المسافات" ${type === 'عداد المسافات' ? 'selected' : ''}>عداد المسافات</option>
              <option value="Passenger assign" ${type === 'Passenger assign' ? 'selected' : ''}>Passenger assign</option>
              <option value="Temperature" ${type === 'Temperature' ? 'selected' : ''}>Temperature</option>
              <option value="Trailer assign" ${type === 'Trailer assign' ? 'selected' : ''}>Trailer assign</option>
            </select>
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">الضبط</label>
            <select id="sensor-param" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a); height: 26px;">
              <option value="F_WEIGHT_120_300" ${param === 'F_WEIGHT_120_300' ? 'selected' : ''}>F_WEIGHT_120_300</option>
              <option value="F_WEIGHT_125_350" ${param === 'F_WEIGHT_125_350' ? 'selected' : ''}>F_WEIGHT_125_350</option>
              <option value="F_WEIGHT_300_350" ${param === 'F_WEIGHT_300_350' ? 'selected' : ''}>F_WEIGHT_300_350</option>
              <option value="F_WEIGHT_65_125" ${param === 'F_WEIGHT_65_125' ? 'selected' : ''}>F_WEIGHT_65_125</option>
              <option value="F_WEIGHT_65_350" ${param === 'F_WEIGHT_65_350' ? 'selected' : ''}>F_WEIGHT_65_350</option>
              <option value="RAW_HEX" ${param === 'RAW_HEX' ? 'selected' : ''}>RAW_HEX</option>
              <option value="RAW_TRAC" ${param === 'RAW_TRAC' ? 'selected' : ''}>RAW_TRAC</option>
              <option value="gpslev" ${param === 'gpslev' ? 'selected' : ''}>gpslev</option>
              <option value="gsmlev" ${param === 'gsmlev' ? 'selected' : ''}>gsmlev</option>
              <option value="io1" ${param === 'io1' ? 'selected' : ''}>io1</option>
              <option value="io66" ${param === 'io66' ? 'selected' : ''}>io66</option>
              <option value="io239" ${param === 'io239' ? 'selected' : ''}>io239</option>
              <option value="io246" ${param === 'io246' ? 'selected' : ''}>io246</option>
              <option value="io247" ${param === 'io247' ? 'selected' : ''}>io247</option>
              <option value="io252" ${param === 'io252' ? 'selected' : ''}>io252</option>
              <option value="io253" ${param === 'io253' ? 'selected' : ''}>io253</option>
              <option value="io10812" ${param === 'io10812' ? 'selected' : ''}>io10812</option>
              <option value="io109" ${param === 'io109' ? 'selected' : ''}>io109</option>
              <option value="io113" ${param === 'io113' ? 'selected' : ''}>io113</option>
              <option value="io16" ${param === 'io16' ? 'selected' : ''}>io16</option>
              <option value="io2" ${param === 'io2' ? 'selected' : ''}>io2</option>
            </select>
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">Data list</label>
            <input type="checkbox" id="sensor-datalist" ${dataList ? 'checked' : ''} style="cursor: pointer;">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">Popup</label>
            <input type="checkbox" id="sensor-popup" ${popup ? 'checked' : ''} style="cursor: pointer;">
          </div>

          <!-- نتيجة section -->
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 4px; margin-top: 8px;">نتيجة</div>
          
          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">نوع</label>
            <select id="sensor-res-type" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a); height: 26px;">
              <option value="قيمة" selected>قيمة</option>
            </select>
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">وحدات القياس</label>
            <input type="text" id="sensor-units" value="${units}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">استشعار "1" (نص)</label>
            <input type="text" id="sensor-text-on" value="${textOn}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">استشعار "0" (نص)</label>
            <input type="text" id="sensor-text-off" value="${textOff}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">صيغة</label>
            <input type="text" id="sensor-formula" value="${formula}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">أدنى قيمة</label>
            <input type="text" id="sensor-minval" value="${minVal}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 100px; font-size: 11px; color: var(--text-secondary, #475569);">أعلى قيمة</label>
            <input type="text" id="sensor-maxval" value="${maxVal}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center;">
            <label style="width: 150px; font-size: 11px; color: var(--text-secondary, #475569);">Ignore if ignition is off</label>
            <input type="checkbox" id="sensor-ignore-ignition" ${ignoreIgnition ? 'checked' : ''} style="cursor: pointer;">
          </div>
        </div>

        <!-- Column 2: Calibration -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--border, #e2e8f0); padding-left: 12px;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 4px;">Calibration</div>
          
          <div style="flex: 1; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; overflow-y: auto; background: var(--bg-primary, #ffffff); min-height: 150px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center;">
              <thead>
                <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0);">
                  <th style="padding: 4px; font-weight: 700; width: 50%;">X</th>
                  <th style="padding: 4px; font-weight: 700; width: 50%;">Y</th>
                </tr>
              </thead>
              <tbody id="calibration-table-body">
                <!-- Points list -->
              </tbody>
            </table>
          </div>

          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="calib-x" placeholder="X" style="width: 40%; padding: 4px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; text-align: center; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            <input type="text" id="calib-y" placeholder="Y" style="width: 40%; padding: 4px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; text-align: center; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            <button type="button" onclick="addCalibrationPoint()" style="background: #e2e8f0; border: 1px solid var(--border, #e2e8f0); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; cursor: pointer; border-radius: 4px; color: #334155;">+</button>
          </div>
        </div>

        <!-- Column 3: Dictionary -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 12px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 4px;">Dictionary</div>
          
          <div style="flex: 1; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; overflow-y: auto; background: var(--bg-primary, #ffffff); min-height: 150px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center;">
              <thead>
                <tr style="background: var(--bg-secondary, #f8fafc); border-bottom: 1px solid var(--border, #e2e8f0);">
                  <th style="padding: 4px; font-weight: 700; width: 40%;">قيمة</th>
                  <th style="padding: 4px; font-weight: 700; width: 60%;">Text</th>
                </tr>
              </thead>
              <tbody id="dictionary-table-body">
                <!-- Dictionary translations -->
              </tbody>
            </table>
          </div>

          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="dict-key" placeholder="قيمة" style="width: 35%; padding: 4px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; text-align: center; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            <span style="font-size: 14px; color: var(--text-secondary, #475569);">=</span>
            <input type="text" id="dict-val" placeholder="Text" style="width: 45%; padding: 4px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; text-align: center; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            <button type="button" onclick="addDictionaryEntry()" style="background: #e2e8f0; border: 1px solid var(--border, #e2e8f0); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; cursor: pointer; border-radius: 4px; color: #334155;">+</button>
          </div>
        </div>

      </div>

      <!-- Sensor result preview section -->
      <div style="padding: 12px 16px; border-top: 1px solid var(--border, #e2e8f0); border-bottom: 1px solid var(--border, #e2e8f0); background: var(--bg-secondary, #f8fafc); direction: rtl; text-align: right; display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; font-weight: 700; color: #3b82f6;">Sensor result preview</div>
        
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 11px; color: var(--text-secondary, #475569);">Current value</span>
          <input type="text" id="preview-current-val" value="" style="width: 150px; padding: 4px 8px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-primary, #ffffff); color: var(--text-primary, #0f172a);">
          
          <button type="button" onclick="calculateSensorPreview()" style="background: #e2e8f0; border: 1px solid var(--border, #e2e8f0); padding: 4px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 700; color: #334155;">&gt;</button>
          
          <span style="font-size: 11px; color: var(--text-secondary, #475569); margin-right: auto;">نتيجة</span>
          <input type="text" id="preview-result-val" readonly style="width: 200px; padding: 4px 8px; font-size: 11px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: #f1f5f9; color: var(--text-primary, #0f172a); font-weight: bold;">
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 10px 16px; display: flex; justify-content: center; gap: 12px; background: var(--bg-secondary, #f8fafc); border-top: 1px solid var(--border, #e2e8f0);">
        <button type="button" onclick="saveSensorProperties(${sensorIndex})" style="background: #3b82f6; color: white; border: none; padding: 6px 20px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
          💾 حفظ
        </button>
        <button type="button" onclick="closeSensorPropertiesModal()" style="background: #334155; color: #f8fafc; border: none; padding: 6px 20px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
          ✖ إلغاء
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);
  renderCalibrationTable();
  renderDictionaryTable();
}

function closeSensorPropertiesModal() {
  const overlay = document.getElementById('sensor-properties-modal');
  if (overlay) overlay.remove();
}

function renderCalibrationTable() {
  const tbody = document.getElementById('calibration-table-body');
  if (!tbody) return;
  tbody.innerHTML = currentCalibrationPoints.map((pt, idx) => `
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0);">
      <td style="padding: 4px;">${pt.x}</td>
      <td style="padding: 4px; position: relative;">
        ${pt.y}
        <span onclick="deleteCalibrationPoint(${idx})" style="position: absolute; left: 8px; cursor: pointer; color: #ef4444; font-weight: bold;">&times;</span>
      </td>
    </tr>
  `).join('');
}

function addCalibrationPoint() {
  const x = document.getElementById('calib-x').value;
  const y = document.getElementById('calib-y').value;
  if (!x || !y) return;
  currentCalibrationPoints.push({ x, y });
  document.getElementById('calib-x').value = '';
  document.getElementById('calib-y').value = '';
  renderCalibrationTable();
}

function deleteCalibrationPoint(idx) {
  currentCalibrationPoints.splice(idx, 1);
  renderCalibrationTable();
}

function renderDictionaryTable() {
  const tbody = document.getElementById('dictionary-table-body');
  if (!tbody) return;
  tbody.innerHTML = currentDictionaryEntries.map((ent, idx) => `
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0);">
      <td style="padding: 4px;">${ent.key}</td>
      <td style="padding: 4px; position: relative;">
        ${ent.val}
        <span onclick="deleteDictionaryEntry(${idx})" style="position: absolute; left: 8px; cursor: pointer; color: #ef4444; font-weight: bold;">&times;</span>
      </td>
    </tr>
  `).join('');
}

function addDictionaryEntry() {
  const key = document.getElementById('dict-key').value;
  const val = document.getElementById('dict-val').value;
  if (!key || !val) return;
  currentDictionaryEntries.push({ key, val });
  document.getElementById('dict-key').value = '';
  document.getElementById('dict-val').value = '';
  renderDictionaryTable();
}

function deleteDictionaryEntry(idx) {
  currentDictionaryEntries.splice(idx, 1);
  renderDictionaryTable();
}

function calculateSensorPreview() {
  const currentVal = document.getElementById('preview-current-val').value;
  const formula = document.getElementById('sensor-formula').value;
  const units = document.getElementById('sensor-units').value;
  
  if (!currentVal) {
    document.getElementById('preview-result-val').value = '';
    return;
  }
  
  // Look up in dictionary first
  const dictMatch = currentDictionaryEntries.find(ent => ent.key === currentVal);
  if (dictMatch) {
    document.getElementById('preview-result-val').value = dictMatch.val;
    return;
  }

  // Otherwise evaluate formula
  try {
    let x = parseFloat(currentVal);
    if (!isNaN(x)) {
      // Evaluate formula if set
      if (formula) {
        // Safe evaluation
        const cleanFormula = formula.replace(/X/g, x).replace(/x/g, x);
        const evalResult = Function('"use strict";return (' + cleanFormula + ')')();
        document.getElementById('preview-result-val').value = evalResult + (units ? ' ' + units : '');
      } else {
        document.getElementById('preview-result-val').value = x + (units ? ' ' + units : '');
      }
    } else {
      document.getElementById('preview-result-val').value = currentVal;
    }
  } catch (e) {
    document.getElementById('preview-result-val').value = 'Error in formula';
  }
}

function saveSensorProperties(index) {
  const name = document.getElementById('sensor-name').value;
  const type = document.getElementById('sensor-type').value;
  const param = document.getElementById('sensor-param').value;
  const dataList = document.getElementById('sensor-datalist').checked;
  const popup = document.getElementById('sensor-popup').checked;
  const units = document.getElementById('sensor-units').value;
  const textOn = document.getElementById('sensor-text-on').value;
  const textOff = document.getElementById('sensor-text-off').value;
  const formula = document.getElementById('sensor-formula').value;
  const minVal = document.getElementById('sensor-minval').value;
  const maxVal = document.getElementById('sensor-maxval').value;
  const ignoreIgnition = document.getElementById('sensor-ignore-ignition').checked;

  if (!name) {
    alert('الرجاء إدخال اسم الاستشعار');
    return;
  }

  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;

  if (!v.sensors) {
    v.sensors = JSON.parse(JSON.stringify(defaultSensors));
  }

  const sensorData = {
    name,
    type,
    param,
    dataList,
    popup,
    units,
    textOn,
    textOff,
    formula,
    minVal,
    maxVal,
    ignoreIgnition,
    calibration: currentCalibrationPoints,
    dictionary: currentDictionaryEntries
  };

  if (index === null) {
    v.sensors.push(sensorData);
  } else {
    v.sensors[index] = sensorData;
  }

  // Update vehicle in storage
  FleetData.updateVehicle(vehicleId, { sensors: v.sensors });
  
  closeSensorPropertiesModal();
  populateSensorsTable();
}

// Service management logic
function populateServiceTable() {
  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;
  
  if (!v.services) {
    v.services = [];
  }
  
  const tbody = document.getElementById('service-table-body');
  if (!tbody) return;
  
  if (v.services.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="padding: 10px; text-align: center; color: var(--text-secondary, #475569);">لا توجد خدمات مضافة بعد.</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = v.services.map((s, index) => `
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 6px; text-align: center;"><input type="checkbox" style="cursor: pointer;"></td>
      <td style="padding: 6px;">${s.name}</td>
      <td style="padding: 6px;">${s.status || 'نشط'}</td>
      <td style="padding: 6px; text-align: center; display: flex; justify-content: center; gap: 8px;">
        <span onclick="openServicePropertiesModal(${index})" style="cursor: pointer; color: #3b82f6; font-size: 14px;" title="تعديل">✏️</span>
        <span onclick="deleteService(${index})" style="cursor: pointer; color: #ef4444; font-size: 14px;" title="حذف">🗑️</span>
      </td>
    </tr>
  `).join('');
}

function refreshServiceTable() {
  populateServiceTable();
}

function deleteService(index) {
  if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;
  
  if (!v.services) {
    v.services = [];
  }
  v.services.splice(index, 1);
  populateServiceTable();
}

function openServicePropertiesModal(serviceIndex = null) {
  let name = '';
  let dataList = false;
  let popup = false;
  
  let useOdo = false;
  let odoLast = '';
  let odoInterval = '';
  
  let useHours = false;
  let hoursLast = '';
  let hoursInterval = '';
  
  let useDays = false;
  let daysLast = '';
  let daysInterval = '';
  
  let leftoverOdo = false;
  let leftoverOdoVal = '';
  let updateLast = false;
  
  let leftoverHours = false;
  let leftoverHoursVal = '';
  
  let leftoverDays = false;
  let leftoverDaysVal = '';

  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;
  
  const currentOdo = v.odometer || 156722;
  const currentHours = v.engineHours || 0;

  if (serviceIndex !== null && v.services && v.services[serviceIndex]) {
    const s = v.services[serviceIndex];
    name = s.name || '';
    dataList = s.dataList || false;
    popup = s.popup || false;
    
    useOdo = s.useOdo || false;
    odoLast = s.odoLast || '';
    odoInterval = s.odoInterval || '';
    
    useHours = s.useHours || false;
    hoursLast = s.hoursLast || '';
    hoursInterval = s.hoursInterval || '';
    
    useDays = s.useDays || false;
    daysLast = s.daysLast || '';
    daysInterval = s.daysInterval || '';
    
    leftoverOdo = s.leftoverOdo || false;
    leftoverOdoVal = s.leftoverOdoVal || '';
    updateLast = s.updateLast || false;
    
    leftoverHours = s.leftoverHours || false;
    leftoverHoursVal = s.leftoverHoursVal || '';
    
    leftoverDays = s.leftoverDays || false;
    leftoverDaysVal = s.leftoverDaysVal || '';
  }

  const overlay = document.createElement('div');
  overlay.id = 'service-properties-modal';
  overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 20000; align-items: center; justify-content: center; font-family: "Cairo", sans-serif;';

  overlay.innerHTML = `
    <div style="width: 800px; background: var(--bg-card, #ffffff); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; border: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a); max-height: 90vh;">
      
      <!-- Header -->
      <div style="background: #3b82f6; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 15px; font-weight: 700;">خصائص خدمة</h3>
        <span onclick="closeServicePropertiesModal()" style="cursor: pointer; font-size: 24px; font-weight: bold; line-height: 1;">&times;</span>
      </div>

      <!-- Form Content -->
      <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; flex: 1; direction: rtl; text-align: right;">
        
        <!-- Section: خدمة -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 13px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 4px;">خدمة</div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 12px; color: var(--text-secondary, #475569);">اسم</label>
            <input type="text" id="service-name" value="${name}" style="flex: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 12px; color: var(--text-secondary, #475569);">Data list</label>
            <input type="checkbox" id="service-datalist" ${dataList ? 'checked' : ''} style="cursor: pointer;">
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 12px; color: var(--text-secondary, #475569);">Popup</label>
            <input type="checkbox" id="service-popup" ${popup ? 'checked' : ''} style="cursor: pointer;">
          </div>

          <!-- Odometer row -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 11px; color: var(--text-secondary, #475569); display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="service-use-odo" ${useOdo ? 'checked' : ''} style="cursor: pointer;">
              آخر قراءة لعداد المسافات (كيلومترا)
            </label>
            <input type="number" id="service-odo-last" value="${odoLast}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            
            <label style="width: 150px; font-size: 11px; color: var(--text-secondary, #475569); text-align: center;">خدمة مشاركة (كيلومترا)</label>
            <input type="number" id="service-odo-interval" value="${odoInterval}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <!-- Engine Hours row -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 11px; color: var(--text-secondary, #475569); display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="service-use-hours" ${useHours ? 'checked' : ''} style="cursor: pointer;">
              آخر قراءة لساعات المحرك (ساعة)
            </label>
            <input type="number" id="service-hours-last" value="${hoursLast}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            
            <label style="width: 150px; font-size: 11px; color: var(--text-secondary, #475569); text-align: center;">خدمة مشاركة (ساعة)</label>
            <input type="number" id="service-hours-interval" value="${hoursInterval}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <!-- Days row -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 11px; color: var(--text-secondary, #475569); display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="service-use-days" ${useDays ? 'checked' : ''} style="cursor: pointer;">
              آخر قراءة للأيام
            </label>
            <input type="text" id="service-days-last" value="${daysLast}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            
            <label style="width: 150px; font-size: 11px; color: var(--text-secondary, #475569); text-align: center;">خدمة مشاركة</label>
            <input type="date" id="service-days-interval" value="${daysInterval}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a); cursor: pointer;">
          </div>
        </div>

        <!-- Section: آثار الحدث -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <div style="font-size: 13px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 4px;">آثار الحدث</div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 11px; color: var(--text-secondary, #475569); display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="service-leftover-odo" ${leftoverOdo ? 'checked' : ''} style="cursor: pointer;">
              عداد المسافات الى اليسار (كيلومترا)
            </label>
            <input type="number" id="service-leftover-odo-val" value="${leftoverOdoVal}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
            
            <label style="width: 150px; font-size: 11px; color: var(--text-secondary, #475569); text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px; margin-right: auto;">
              <input type="checkbox" id="service-update-last" ${updateLast ? 'checked' : ''} style="cursor: pointer;">
              Update last service
            </label>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 11px; color: var(--text-secondary, #475569); display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="service-leftover-hours" ${leftoverHours ? 'checked' : ''} style="cursor: pointer;">
              انتهت عداد المسافات (ساعة)
            </label>
            <input type="number" id="service-leftover-hours-val" value="${leftoverHoursVal}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 11px; color: var(--text-secondary, #475569); display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="service-leftover-days" ${leftoverDays ? 'checked' : ''} style="cursor: pointer;">
              ساعات محرك انتهت
            </label>
            <input type="number" id="service-leftover-days-val" value="${leftoverDaysVal}" style="width: 150px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: var(--bg-input, #f8fafc); color: var(--text-primary, #0f172a);">
          </div>
        </div>

        <!-- Section: عدادات المركبة الحالية -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <div style="font-size: 13px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 4px;">عدادات المركبة الحالية</div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 12px; color: var(--text-secondary, #475569);">عداد المسافات الحالي (كيلومترا)</label>
            <input type="text" value="${currentOdo}" readonly style="width: 200px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: #e2e8f0; color: #334155; font-weight: bold;">
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 220px; font-size: 12px; color: var(--text-secondary, #475569);">ساعات المحرك الحالي (ساعة)</label>
            <input type="text" value="${currentHours}" readonly style="width: 200px; padding: 4px 8px; font-size: 12px; border: 1px solid var(--border, #e2e8f0); border-radius: 4px; background: #e2e8f0; color: #334155; font-weight: bold;">
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div style="padding: 10px 16px; display: flex; justify-content: center; gap: 12px; background: var(--bg-secondary, #f8fafc); border-top: 1px solid var(--border, #e2e8f0);">
        <button type="button" onclick="saveServiceProperties(${serviceIndex})" style="background: #3b82f6; color: white; border: none; padding: 6px 20px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
          💾 حفظ
        </button>
        <button type="button" onclick="closeServicePropertiesModal()" style="background: #334155; color: #f8fafc; border: none; padding: 6px 20px; font-size: 12px; border-radius: 4px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Cairo', sans-serif;">
          ✖ إلغاء
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);
}

function closeServicePropertiesModal() {
  const overlay = document.getElementById('service-properties-modal');
  if (overlay) overlay.remove();
}

function saveServiceProperties(index) {
  const name = document.getElementById('service-name').value;
  const dataList = document.getElementById('service-datalist').checked;
  const popup = document.getElementById('service-popup').checked;
  
  const useOdo = document.getElementById('service-use-odo').checked;
  const odoLast = document.getElementById('service-odo-last').value;
  const odoInterval = document.getElementById('service-odo-interval').value;
  
  const useHours = document.getElementById('service-use-hours').checked;
  const hoursLast = document.getElementById('service-hours-last').value;
  const hoursInterval = document.getElementById('service-hours-interval').value;
  
  const useDays = document.getElementById('service-use-days').checked;
  const daysLast = document.getElementById('service-days-last').value;
  const daysInterval = document.getElementById('service-days-interval').value;
  
  const leftoverOdo = document.getElementById('service-leftover-odo').checked;
  const leftoverOdoVal = document.getElementById('service-leftover-odo-val').value;
  const updateLast = document.getElementById('service-update-last').checked;
  
  const leftoverHours = document.getElementById('service-leftover-hours').checked;
  const leftoverHoursVal = document.getElementById('service-leftover-hours-val').value;
  
  const leftoverDays = document.getElementById('service-leftover-days').checked;
  const leftoverDaysVal = document.getElementById('service-leftover-days-val').value;

  if (!name) {
    alert('الرجاء إدخال اسم الخدمة');
    return;
  }

  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;

  if (!v.services) {
    v.services = [];
  }

  const serviceData = {
    name,
    status: 'نشط',
    dataList,
    popup,
    useOdo,
    odoLast,
    odoInterval,
    useHours,
    hoursLast,
    hoursInterval,
    useDays,
    daysLast,
    daysInterval,
    leftoverOdo,
    leftoverOdoVal,
    updateLast,
    leftoverHours,
    leftoverHoursVal,
    leftoverDays,
    leftoverDaysVal
  };

  if (index === null) {
    v.services.push(serviceData);
  } else {
    v.services[index] = serviceData;
  }

  // Update vehicle in storage
  FleetData.updateVehicle(vehicleId, { services: v.services });
  
  closeServicePropertiesModal();
  populateServiceTable();
}

function populateInfoTable() {
  const modalEl = document.getElementById('edit-vehicle-modal');
  if (!modalEl) return;
  const vehicleId = modalEl.getAttribute('data-vehicle-id');
  const v = FleetData.getVehicleById(vehicleId);
  if (!v) return;

  const tbody = document.getElementById('info-table-body');
  if (!tbody) return;

  // Format dates nicely
  const now = new Date();
  const formatTime = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const posTimeStr = formatTime(new Date(now.getTime() - 4000));
  const serverTimeStr = formatTime(now);

  const speedVal = v.speed !== undefined ? v.speed : 0;
  const latVal = v.lat !== undefined ? parseFloat(v.lat).toFixed(6) : '26.261260';
  const lngVal = v.lng !== undefined ? parseFloat(v.lng).toFixed(6) : '50.191212';
  const courseVal = v.course !== undefined ? v.course : 135;

  tbody.innerHTML = `
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">البروتوكول</td>
      <td style="padding: 8px 12px;">teltonika</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">وقت (الموقع)</td>
      <td style="padding: 8px 12px;">${posTimeStr}</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">وقت (الخادم)</td>
      <td style="padding: 8px 12px;">${serverTimeStr}</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">ارتفاع</td>
      <td style="padding: 8px 12px;">22 متر</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">السرعة</td>
      <td style="padding: 8px 12px;">${speedVal} كيلومترا</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">الضبط</td>
      <td style="padding: 8px 12px; word-break: break-all; font-family: monospace; font-size: 11px;">gpslev=20, gsmlev=4, io1=0, io2=0, io239=0, io240=0, io66=12568, io67=0, io16=468435822, io69=</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">خط الطول</td>
      <td style="padding: 8px 12px;">${lngVal} °</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">خط العرض</td>
      <td style="padding: 8px 12px;">${latVal} °</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--border, #e2e8f0); color: var(--text-primary, #0f172a);">
      <td style="padding: 8px 12px; font-weight: 700; color: var(--text-secondary, #475569);">زاوية</td>
      <td style="padding: 8px 12px;">${courseVal} °</td>
    </tr>
  `;
}

// =========================================================
//  DRAWER NAVIGATION — TMT GPS Style
//  Replaces bottom nav with a professional slide-in drawer
// =========================================================
(function initDrawerUI() {

  // ── Inject Drawer CSS ──────────────────────────────────
  function injectDrawerStyles() {
    if (document.getElementById('drawer-styles')) return;
    const style = document.createElement('style');
    style.id = 'drawer-styles';
    style.textContent = `
      /* ── Drawer Overlay ── */
      #drawer-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 19000;
        backdrop-filter: blur(2px);
      }
      #drawer-overlay.open { display: block; }

      /* ── Side Drawer ── */
      #side-drawer {
        position: fixed;
        top: 0;
        right: -300px;
        width: 280px;
        height: 100vh;
        background: linear-gradient(180deg, #0f1929 0%, #111827 100%);
        z-index: 20000;
        display: flex;
        flex-direction: column;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -8px 0 30px rgba(0,0,0,0.5);
        overflow: hidden;
      }
      #side-drawer.open { right: 0; }

      /* ── Drawer Header ── */
      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 20px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        flex-shrink: 0;
      }
      .drawer-logo {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .drawer-logo-icon {
        width: 36px; height: 36px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px;
      }
      .drawer-logo-text {
        font-size: 18px;
        font-weight: 900;
        color: #fff;
        font-family: 'Cairo', sans-serif;
        letter-spacing: 1px;
      }
      .drawer-logo-text sup {
        font-size: 9px;
        font-weight: 700;
        color: #10b981;
        vertical-align: super;
      }
      .drawer-close {
        background: rgba(255,255,255,0.08);
        border: none;
        color: #94a3b8;
        width: 32px; height: 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s;
      }
      .drawer-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

      /* ── Drawer Nav ── */
      .drawer-nav {
        flex: 1;
        overflow-y: auto;
        padding: 12px 0;
      }
      .drawer-nav::-webkit-scrollbar { width: 4px; }
      .drawer-nav::-webkit-scrollbar-track { background: transparent; }
      .drawer-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

      .drawer-section-label {
        padding: 8px 20px 4px;
        font-size: 10px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-family: 'Cairo', sans-serif;
      }

      .drawer-nav-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 20px;
        text-decoration: none;
        color: #94a3b8;
        font-size: 14px;
        font-weight: 600;
        font-family: 'Cairo', sans-serif;
        transition: all 0.2s;
        border-radius: 0;
        position: relative;
        cursor: pointer;
      }
      .drawer-nav-item:hover {
        background: rgba(255,255,255,0.06);
        color: #e2e8f0;
      }
      .drawer-nav-item.active {
        background: rgba(16,185,129,0.12);
        color: #10b981;
      }
      .drawer-nav-item.active::before {
        content: '';
        position: absolute;
        right: 0; top: 0; bottom: 0;
        width: 3px;
        background: #10b981;
        border-radius: 3px 0 0 3px;
      }
      .drawer-nav-icon {
        width: 34px; height: 34px;
        border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        background: rgba(255,255,255,0.06);
        flex-shrink: 0;
        transition: background 0.2s;
      }
      .drawer-nav-item.active .drawer-nav-icon {
        background: rgba(16,185,129,0.2);
      }
      .drawer-nav-name { flex: 1; }

      /* ── Drawer Footer ── */
      .drawer-footer {
        padding: 16px 20px;
        border-top: 1px solid rgba(255,255,255,0.08);
        flex-shrink: 0;
      }
      .drawer-support-btn {
        width: 100%;
        padding: 11px 16px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        font-family: 'Cairo', sans-serif;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 14px;
        transition: all 0.2s;
      }
      .drawer-support-btn:hover { opacity: 0.9; transform: translateY(-1px); }
      .drawer-user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: rgba(255,255,255,0.04);
        border-radius: 12px;
      }
      .drawer-user-avatar {
        width: 36px; height: 36px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;
        font-weight: 800;
        color: #fff;
        flex-shrink: 0;
      }
      .drawer-user-email {
        font-size: 11px;
        color: #64748b;
        font-family: 'Cairo', sans-serif;
      }
      .drawer-user-version {
        font-size: 10px;
        color: #334155;
        margin-top: 2px;
        font-family: 'Cairo', sans-serif;
      }

      /* ── Hamburger Button in Topbar ── */
      #drawer-hamburger {
        background: rgba(255,255,255,0.08);
        border: none;
        color: #e2e8f0;
        width: 36px; height: 36px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 18px;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      #drawer-hamburger:hover { background: rgba(255,255,255,0.15); }

      /* ── Hide old bottom nav on mobile ── */
      @media (max-width: 768px) {
        .mobile-nav-bar { display: none !important; }
        body { padding-bottom: 0 !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Build Nav Items ────────────────────────────────────
  function getNavItems() {
    const isInsidePages = window.location.pathname.includes('/pages/');
    const base = isInsidePages ? '' : 'pages/';
    const root = isInsidePages ? '../index.html' : 'index.html';
    const currentPath = window.location.pathname;

    const isActive = (key) => {
      if (key === 'home') return currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('GPS/');
      return currentPath.includes(key);
    };

    return [
      {
        section: 'الوحدات الرئيسية',
        items: [
          { name: 'الرئيسية',     icon: '🏠', url: root,                       key: 'home' },
          { name: 'الخريطة',      icon: '🗺️', url: root + '#map',              key: 'map'  },
          { name: 'المركبات',     icon: '🚗', url: base + 'vehicles.html',      key: 'vehicles' },
          { name: 'السائقون',     icon: '👤', url: base + 'drivers.html',       key: 'drivers' },
          { name: 'الاحداث',      icon: '🔔', url: base + 'alerts.html',        key: 'alerts' },
          { name: 'التقارير',     icon: '📊', url: base + 'reports.html',       key: 'reports' },
        ]
      },
      {
        section: 'الوحدات النشطة',
        items: [
          { name: 'الأماكن',      icon: '📍', url: base + 'geofence.html',      key: 'geofence' },
          { name: 'تاريخ الرحلات', icon: '📅', url: base + 'history.html',      key: 'history' },
          { name: 'حسابي',        icon: '⚙️', url: base + 'account.html',       key: 'account' },
        ]
      }
    ].map(section => ({
      ...section,
      items: section.items.map(item => ({ ...item, active: isActive(item.key) }))
    }));
  }

  // ── Inject Drawer HTML ─────────────────────────────────
  function injectDrawer() {
    if (document.getElementById('side-drawer')) return;

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'drawer-overlay';
    overlay.onclick = closeDrawer;
    document.body.appendChild(overlay);

    // Drawer
    const drawer = document.createElement('nav');
    drawer.id = 'side-drawer';
    drawer.setAttribute('dir', 'rtl');

    const sections = getNavItems();
    let navHtml = '';
    sections.forEach(sec => {
      navHtml += `<div class="drawer-section-label">${sec.section}</div>`;
      sec.items.forEach(item => {
        navHtml += `
          <a href="${item.url}" class="drawer-nav-item${item.active ? ' active' : ''}">
            <span class="drawer-nav-icon">${item.icon}</span>
            <span class="drawer-nav-name">${item.name}</span>
          </a>
        `;
      });
    });

    drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-logo">
          <div class="drawer-logo-icon">🛰️</div>
          <div class="drawer-logo-text">TOP<sup>GPS</sup></div>
        </div>
        <button class="drawer-close" onclick="window.__closeDrawer && window.__closeDrawer()">✕</button>
      </div>
      <div class="drawer-nav">${navHtml}</div>
      <div class="drawer-footer">
        <button class="drawer-support-btn">🎧 الدعم والمساعدة</button>
        <div class="drawer-user-info">
          <div class="drawer-user-avatar">T</div>
          <div>
            <div class="drawer-user-email">topgps@gmail.com</div>
            <div class="drawer-user-version">v8.0.0 — TOP-GPS</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);
  }

  // ── Inject Hamburger Button into Topbar ───────────────
  function injectHamburger() {
    if (document.getElementById('drawer-hamburger')) return;
    const topbar = document.getElementById('topbar') || document.querySelector('.topbar');
    if (!topbar) return;

    const btn = document.createElement('button');
    btn.id = 'drawer-hamburger';
    btn.innerHTML = '☰';
    btn.title = 'القائمة';
    btn.onclick = openDrawer;

    // Insert as first child of topbar
    topbar.insertBefore(btn, topbar.firstChild);
  }

  // ── Open / Close ──────────────────────────────────────
  function openDrawer() {
    document.getElementById('side-drawer')?.classList.add('open');
    document.getElementById('drawer-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('side-drawer')?.classList.remove('open');
    document.getElementById('drawer-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Expose globally for inline onclick
  window.__closeDrawer = closeDrawer;

  // Close on Escape key
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // ── Init ──────────────────────────────────────────────
  function init() {
    injectDrawerStyles();
    injectDrawer();
    injectHamburger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
    // Retry after a second in case topbar isn't mounted yet
    setTimeout(() => { injectHamburger(); }, 800);
  }

})();

(function initMobileUI() {
  function injectMobileNav() {
    if (document.getElementById('mobile-bottom-nav')) return;

    const isInsidePages = window.location.pathname.includes('/pages/');
    const basePath = isInsidePages ? '' : 'pages/';
    const rootPath = isInsidePages ? '../index.html' : 'index.html';
    const currentPath = window.location.pathname;

    const navItems = [
      { name: 'الخريطة', icon: '🗺️', url: rootPath, key: 'index', action: 'showMap' },
      { name: 'السيارات', icon: '🚗', url: rootPath, key: 'vehicles', action: 'toggleVehicles' },
      { name: 'التنبيهات', icon: '🔔', url: basePath + 'alerts.html', key: 'alerts' },
      { name: 'التقارير', icon: '📊', url: basePath + 'reports.html', key: 'reports' },
      { name: 'حسابي', icon: '👤', url: basePath + 'account.html', key: 'account' }
    ];

    const nav = document.createElement('nav');
    nav.id = 'mobile-bottom-nav';
    nav.className = 'mobile-nav-bar';

    navItems.forEach(item => {
      const a = document.createElement('a');
      a.href = item.url;
      a.className = 'mobile-nav-item';
      if (
        (item.key === 'index' && (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('GPS/'))) ||
        (currentPath.includes(item.key))
      ) {
        a.classList.add('active');
      }

      if (item.action === 'toggleVehicles') {
        a.onclick = (e) => {
          const isDashboard = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('GPS/');
          if (isDashboard) {
            e.preventDefault();
            toggleMobilePanel();
          }
        };
      } else if (item.action === 'showMap') {
        a.onclick = (e) => {
          const isDashboard = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('GPS/');
          if (isDashboard) {
            e.preventDefault();
            collapseMobilePanel();
          }
        };
      }

      a.innerHTML = `
        <span class="nav-icon">${item.icon}</span>
        <span>${item.name}</span>
      `;
      nav.appendChild(a);
    });

    document.body.appendChild(nav);
  }

  function toggleMobilePanel() {
    const panel = document.querySelector('.split-panel');
    if (panel) {
      panel.classList.toggle('expanded');
    }
  }

  function collapseMobilePanel() {
    const panel = document.querySelector('.split-panel');
    if (panel) {
      panel.classList.remove('expanded');
    }
  }

  function setupMobileSheetEvents() {
    const panelTabs = document.querySelector('.split-panel-tabs');
    if (panelTabs) {
      panelTabs.onclick = () => toggleMobilePanel();
    }

    // Collapse sheet when vehicle selected to show map
    document.addEventListener('vehicleSelected', () => {
      if (window.innerWidth <= 768) {
        collapseMobilePanel();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectMobileNav();
      setTimeout(setupMobileSheetEvents, 1000);
    });
  } else {
    injectMobileNav();
    setTimeout(setupMobileSheetEvents, 1000);
  }
})();


