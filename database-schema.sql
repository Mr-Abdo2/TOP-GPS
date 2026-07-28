-- ============================================
--  TOP-GPS Database Schema for Supabase
--  انسخ الكود ده كله وشغله في SQL Editor
-- ============================================

-- 1. جدول السيارات / الأجهزة
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'جهاز جديد',
  plate_number TEXT DEFAULT '',
  driver_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  type TEXT DEFAULT 'car',
  status TEXT DEFAULT 'offline',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المواقع (كل نقطة GPS بتتحفظ هنا)
CREATE TABLE IF NOT EXISTS positions (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  accuracy DOUBLE PRECISION DEFAULT 0,
  altitude DOUBLE PRECISION DEFAULT 0,
  battery INTEGER DEFAULT 100,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS positions_device_id_idx ON positions(device_id);
CREATE INDEX IF NOT EXISTS positions_recorded_at_idx ON positions(recorded_at DESC);
CREATE INDEX IF NOT EXISTS positions_device_time_idx ON positions(device_id, recorded_at DESC);

-- 3. جدول مناطق Geofence
CREATE TABLE IF NOT EXISTS geofences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lon DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION DEFAULT 500,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول التنبيهات
CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. تفعيل Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 6. سياسات الوصول (مفتوح للكل حالياً)
CREATE POLICY "Allow all on vehicles"  ON vehicles  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on positions" ON positions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on geofences" ON geofences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on alerts"    ON alerts    FOR ALL USING (true) WITH CHECK (true);

-- 7. تفعيل Realtime على الجداول
ALTER PUBLICATION supabase_realtime ADD TABLE positions;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- 8. بيانات تجريبية أولية
INSERT INTO vehicles (device_id, name, plate_number, driver_name, status) VALUES
  ('my-phone', 'تليفوني', 'ABC-001', 'أنا', 'offline'),
  ('device-002', 'سيارة 2', 'XYZ-002', 'السائق الثاني', 'offline')
ON CONFLICT (device_id) DO NOTHING;

-- تم! ✅
SELECT 'TOP-GPS Database Ready! ✅' as status;
