// =============================================
//  FLEET TRACK PRO — Alerts Module
// =============================================

const AlertsManager = (() => {
  const ALERT_ICONS = {
    speed: '🚨',
    geofence: '🏁',
    stop: '⏸️',
    fuel: '⛽'
  };
  const ALERT_LABELS = {
    speed: 'تجاوز سرعة',
    geofence: 'خروج منطقة',
    stop: 'توقف طويل',
    fuel: 'وقود منخفض'
  };
  const SEVERITY_COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#06b6d4'
  };

  function showToast(msg, type = 'warning', icon = '⚠️') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="font-size:18px">${icon}</span><div style="flex:1"><div>${msg}</div></div><button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px">✕</button>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutLeft 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  function updateAlertBadge() {
    const count = FleetData.getUnreadAlertCount();
    const badge = document.getElementById('alert-nav-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline' : 'none';
    }
    const topBadge = document.getElementById('topbar-alert-count');
    if (topBadge) topBadge.textContent = count;
  }

  function renderAlertsList(containerId, limit = null, filterQuery = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    let alerts = FleetData.getAlerts();

    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      alerts = alerts.filter(a => 
        (a.message && a.message.toLowerCase().includes(q)) ||
        (a.vehicleName && a.vehicleName.toLowerCase().includes(q)) ||
        (a.vehiclePlate && a.vehiclePlate.toLowerCase().includes(q)) ||
        (a.type && a.type.toLowerCase().includes(q))
      );
    }

    if (limit) alerts = alerts.slice(0, limit);

    if (alerts.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><h3>لا توجد تنبيهات</h3><p>كل شيء يعمل بشكل طبيعي</p></div>`;
      return;
    }

    container.innerHTML = alerts.map(a => {
      const dt = new Date(a.timestamp);
      const timeStr = dt.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const sevColor = SEVERITY_COLORS[a.severity] || '#6b7280';
      return `
        <div class="alert-item" id="alert-${a.id}" style="${!a.read ? 'border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05)' : ''}">
          <div class="alert-icon ${a.type}" style="background:${sevColor}22">
            <span style="font-size:16px">${ALERT_ICONS[a.type] || '⚠️'}</span>
          </div>
          <div class="alert-content">
            <div class="alert-title" style="color:${!a.read ? 'var(--text-primary)' : 'var(--text-secondary)'}">
              ${ALERT_LABELS[a.type] || a.type} — ${a.vehicleName}
            </div>
            <div class="alert-desc">${a.message}</div>
            <div class="alert-time">🪪 ${a.vehiclePlate} • 🕐 ${timeStr}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:${sevColor}22;color:${sevColor}">
              ${a.severity === 'high' ? 'عالي' : a.severity === 'medium' ? 'متوسط' : 'منخفض'}
            </span>
            ${!a.read ? `<button class="btn btn-sm btn-secondary" onclick="AlertsManager.markRead('${a.id}')">قراءة</button>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function markRead(id) {
    FleetData.markAlertRead(id);
    const el = document.getElementById(`alert-${id}`);
    if (el) {
      el.style.borderColor = 'var(--border)';
      el.style.background = 'var(--bg-secondary)';
      const btn = el.querySelector('button');
      if (btn) btn.remove();
    }
    updateAlertBadge();
  }

  function markAllRead() {
    const alerts = FleetData.getAlerts();
    alerts.forEach(a => { a.read = true; });
    FleetData.saveAlerts(alerts);
    updateAlertBadge();
    // Refresh both: alerts page list AND sidebar events tab
    renderAlertsList('alerts-list-full');
    renderAlertsList('sidebar-alerts-list');
    showToast('تم وضع علامة مقروء على جميع التنبيهات', 'success', '✅');
  }

  function clearAll() {
    FleetData.saveAlerts([]);
    updateAlertBadge();
    showToast('تم مسح جميع التنبيهات والأحداث', 'success', '🗑️');
  }

  // Listen to tracking engine for real-time alerts
  function init() {
    TrackingEngine.on('alert', (data) => {
      updateAlertBadge();
      const icons = { fuel: '⛽', speed: '🚨', geofence: '🏁', stop: '⏸️' };
      const types = { fuel: 'warning', speed: 'error', geofence: 'warning', stop: 'warning' };
      showToast(`${data.vehicle}: ${data.type === 'speed' ? `تجاوز ${data.speed} كم/س` : 'تنبيه جديد'}`, types[data.type] || 'warning', icons[data.type] || '⚠️');
    });
    updateAlertBadge();
  }

  return { init, showToast, updateAlertBadge, renderAlertsList, markRead, markAllRead, clearAll };
})();
