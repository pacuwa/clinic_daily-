-- Enable UUID extension (optional, useful for primary keys if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Staff')),
    full_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ITEMS TABLE (INVENTORY)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    opening_stock INTEGER DEFAULT 0 CHECK (opening_stock >= 0),
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
    reorder_level INTEGER DEFAULT 0 CHECK (reorder_level >= 0),
    unit_cost DECIMAL(10, 2) DEFAULT 0.00 CHECK (unit_cost >= 0),
    supplier VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STOCK IN TABLE
CREATE TABLE IF NOT EXISTS stock_in (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity_in INTEGER NOT NULL CHECK (quantity_in > 0),
    unit_cost DECIMAL(10, 2) DEFAULT 0.00 CHECK (unit_cost >= 0),
    supplier VARCHAR(255),
    notes TEXT,
    received_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    date_in TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. STOCK OUT TABLE
CREATE TABLE IF NOT EXISTS stock_out (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity_out INTEGER NOT NULL CHECK (quantity_out > 0),
    sale_price DECIMAL(10, 2) DEFAULT 0.00 CHECK (sale_price >= 0),
    sold_to VARCHAR(255),
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    date_out TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR POSTGRESQL PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(item_name);
CREATE INDEX IF NOT EXISTS idx_stock_in_date ON stock_in(date_in);
CREATE INDEX IF NOT EXISTS idx_stock_out_date ON stock_out(date_out);
CREATE INDEX IF NOT EXISTS idx_stock_in_item ON stock_in(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_item ON stock_out(item_id);

-- AUTOMATED INVENTORY TRIGGER FUNCTIONS (POSTGRESQL PL/pgSQL)
CREATE OR REPLACE FUNCTION update_inventory_on_stock_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE items
  SET current_stock = current_stock + NEW.quantity_in,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stock_in ON stock_in;
CREATE TRIGGER trg_stock_in
AFTER INSERT ON stock_in
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_stock_in();

CREATE OR REPLACE FUNCTION update_inventory_on_stock_out()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE items
  SET current_stock = current_stock - NEW.quantity_out,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stock_out ON stock_out;
CREATE TRIGGER trg_stock_out
AFTER INSERT ON stock_out
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_stock_out();
