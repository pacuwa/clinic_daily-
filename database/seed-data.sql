CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
  full_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  opening_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  unit_cost REAL DEFAULT 0,
  supplier TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_in (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  quantity_in INTEGER NOT NULL,
  unit_cost REAL DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  received_by INTEGER,
  date_in DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS stock_out (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  quantity_out INTEGER NOT NULL,
  sale_price REAL DEFAULT 0,
  sold_to TEXT,
  notes TEXT,
  recorded_by INTEGER,
  date_out DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);
