-- ============================================================
-- Northstar Retail Co. — Inventory Table Setup
-- Run this entire script in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Create the inventory table
CREATE TABLE IF NOT EXISTS inventory (
  item_id    TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 0,
  in_stock   BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed with the 5 mock items
INSERT INTO inventory (item_id, name, quantity, in_stock) VALUES
  ('A001', 'Blue T-Shirt (M)',   42, true),
  ('A002', 'Running Shoes (42)',  0, false),
  ('A003', 'Leather Wallet',     15, true),
  ('A004', 'Wireless Earbuds',    3, true),
  ('A005', 'Yoga Mat',            0, false)
ON CONFLICT (item_id) DO NOTHING;

-- 3. Disable Row Level Security so the anon key can read/write
--    (fine for a prototype — in production you would add RLS policies)
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- 4. Confirm everything was created correctly
SELECT * FROM inventory ORDER BY item_id;
-- ============================================================
-- Northstar Retail Co. — Inventory Table Setup
-- Run this entire script in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Create the inventory table
CREATE TABLE IF NOT EXISTS inventory (
  item_id    TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 0,
  in_stock   BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed with the 5 mock items
INSERT INTO inventory (item_id, name, quantity, in_stock) VALUES
  ('A001', 'Blue T-Shirt (M)',   42, true),
  ('A002', 'Running Shoes (42)',  0, false),
  ('A003', 'Leather Wallet',     15, true),
  ('A004', 'Wireless Earbuds',    3, true),
  ('A005', 'Yoga Mat',            0, false)
ON CONFLICT (item_id) DO NOTHING;

-- 3. Disable Row Level Security so the anon key can read/write
--    (fine for a prototype — in production you would add RLS policies)
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- 4. Confirm everything was created correctly
SELECT * FROM inventory ORDER BY item_id;
