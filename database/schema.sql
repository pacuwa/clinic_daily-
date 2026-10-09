-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
  full_name TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  opening_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  supplier TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_in table
CREATE TABLE IF NOT EXISTS stock_in (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  quantity_in INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  received_by INTEGER,
  date_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);

-- Create stock_out table
CREATE TABLE IF NOT EXISTS stock_out (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  quantity_out INTEGER NOT NULL,
  sale_price DECIMAL(10, 2) DEFAULT 0,
  sold_to TEXT,
  notes TEXT,
  recorded_by INTEGER,
  date_out TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(item_name);
CREATE INDEX IF NOT EXISTS idx_stock_in_date ON stock_in(date_in);
CREATE INDEX IF NOT EXISTS idx_stock_out_date ON stock_out(date_out);
CREATE INDEX IF NOT EXISTS idx_stock_in_item ON stock_in(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_item ON stock_out(item_id);
