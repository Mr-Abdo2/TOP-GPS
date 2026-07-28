// ============================================
//  TOP-GPS — Supabase Configuration
//  Project: qwafrmrgzohcfppftqwz
// ============================================

const SUPABASE_URL = 'https://qwafrmrgzohcfppftqwz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BTtRvuQ5MqTkigfclT1iPg_cOjmYM11';

// Device ID: unique per phone (stored in localStorage)
function getDeviceId() {
  let id = localStorage.getItem('topgps_device_id');
  if (!id) {
    id = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('topgps_device_id', id);
  }
  return id;
}

const DEVICE_ID = getDeviceId();

// Initialize Supabase Client
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  if (typeof window.supabase === 'undefined') {
    console.error('[Supabase] ❌ Library not loaded yet');
    return null;
  }
  const { createClient } = window.supabase;
  _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('[Supabase] ✅ Connected to:', SUPABASE_URL);
  console.log('[Supabase] 📱 Device ID:', DEVICE_ID);
  return _supabase;
}

// Save position to Supabase
async function savePositionToSupabase(lat, lon, speed = 0, accuracy = 0, battery = 100) {
  const db = getSupabase();
  if (!db) return;

  const { error } = await db.from('positions').insert({
    device_id: DEVICE_ID,
    latitude: lat,
    longitude: lon,
    speed: speed,
    accuracy: accuracy,
    battery: battery,
    recorded_at: new Date().toISOString()
  });

  if (error) {
    console.error('[Supabase] ❌ Save position error:', error.message);
  } else {
    console.log(`[Supabase] 📍 Position saved: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
  }

  // Update vehicle status
  await db.from('vehicles').upsert({
    device_id: DEVICE_ID,
    status: speed > 2 ? 'moving' : 'stopped',
    updated_at: new Date().toISOString()
  }, { onConflict: 'device_id' });
}

// Save alert to Supabase
async function saveAlert(type, message, lat = null, lon = null, speed = null) {
  const db = getSupabase();
  if (!db) return;
  await db.from('alerts').insert({
    device_id: DEVICE_ID,
    type: type,
    message: message,
    latitude: lat,
    longitude: lon,
    speed: speed
  });
  console.log('[Supabase] 🔔 Alert saved:', type, message);
}

// Get positions history for a device between dates
async function getPositionsHistory(deviceId, fromDate, toDate) {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from('positions')
    .select('*')
    .eq('device_id', deviceId)
    .gte('recorded_at', fromDate)
    .lte('recorded_at', toDate)
    .order('recorded_at', { ascending: true });
  if (error) { console.error('[Supabase] History error:', error); return []; }
  return data || [];
}

// Get all vehicles with latest position
async function getAllVehicles() {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db.from('vehicles').select('*');
  if (error) { console.error('[Supabase] Vehicles error:', error); return []; }
  return data || [];
}

// Get latest position per device
async function getLatestPositions() {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from('positions')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(100);
  if (error) { console.error('[Supabase] Positions error:', error); return []; }
  // Return only latest per device_id
  const seen = {};
  return (data || []).filter(p => {
    if (seen[p.device_id]) return false;
    seen[p.device_id] = true;
    return true;
  });
}

// Subscribe to real-time position updates
function subscribeToPositions(callback) {
  const db = getSupabase();
  if (!db) return null;
  return db
    .channel('positions-live')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'positions'
    }, payload => {
      console.log('[Supabase] 📡 Live position:', payload.new.device_id);
      callback(payload.new);
    })
    .subscribe(status => {
      console.log('[Supabase] Realtime status:', status);
    });
}

console.log('[Supabase Config] ✅ Loaded');
