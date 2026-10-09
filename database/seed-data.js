const bcrypt = require('bcryptjs');
const pgp = require('pg-promise')();
const dotenv = require('dotenv');

dotenv.config();

const db = pgp({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'clinic_inventory',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

(async () => {
  try {
    console.log('Initializing database tables...');

    await db.none(`
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

      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        item_name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        opening_stock INTEGER DEFAULT 0 CHECK (opening_stock >= 0),
        current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
        reorder_level INTEGER DEFAULT 0 CHECK (reorder_level >= 0),
        unit_cost DECIMAL(10, 2) DEFAULT 0 CHECK (unit_cost >= 0),
        supplier TEXT,
        status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stock_in (
        id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        quantity_in INTEGER NOT NULL CHECK (quantity_in > 0),
        unit_cost DECIMAL(10, 2) DEFAULT 0,
        supplier TEXT,
        notes TEXT,
        received_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        date_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stock_out (
        id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        quantity_out INTEGER NOT NULL CHECK (quantity_out > 0),
        sale_price DECIMAL(10, 2) DEFAULT 0,
        sold_to TEXT,
        notes TEXT,
        recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        date_out TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_items_name ON items(item_name);
      CREATE INDEX IF NOT EXISTS idx_stock_in_date ON stock_in(date_in);
      CREATE INDEX IF NOT EXISTS idx_stock_out_date ON stock_out(date_out);
      CREATE INDEX IF NOT EXISTS idx_stock_in_item ON stock_in(item_id);
      CREATE INDEX IF NOT EXISTS idx_stock_out_item ON stock_out(item_id);
    `);

    console.log('Setting up automated inventory triggers...');
    await db.none(`
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
    `);

    console.log('Hashing passwords...');
    const adminPassword = await hashPassword('admin123');
    const staffPassword = await hashPassword('staff123');

    console.log('Inserting default users...');
    await db.none(
      `INSERT INTO users (email, password_hash, role, full_name, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@clinic.com', adminPassword, 'Admin', 'System Administrator', 'Active']
    );

    await db.none(
      `INSERT INTO users (email, password_hash, role, full_name, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['staff@clinic.com', staffPassword, 'Staff', 'Clinic Staff Member', 'Active']
    );

    console.log('Inserting sample items...');
    const items = [
      ['Paracetamol 500mg', 'Medicines', 'Tablet', 500, 500, 50, 0.50, 'Clinic Pharmacy'],
      ['Aspirin 100mg', 'Medicines', 'Tablet', 300, 300, 40, 0.75, 'Clinic Pharmacy'],
      ['Cough Syrup', 'Medicines', 'Bottle', 150, 150, 30, 2.50, 'Clinic Pharmacy'],
      ['Antibiotic Cream', 'Medicines', 'Tube', 80, 80, 20, 3.00, 'Medical Supplies'],
      ['Surgical Gloves (Box)', 'Supplies', 'Box', 200, 200, 50, 10.00, 'Medical Supplies'],
      ['Disposable Masks', 'Supplies', 'Box', 500, 500, 100, 5.00, 'Medical Supplies'],
      ['Bandages 5cm', 'Supplies', 'Box', 100, 100, 30, 2.00, 'Medical Supplies'],
      ['Thermometer', 'Equipment', 'Unit', 20, 20, 5, 15.00, 'Medical Equipment']
    ];

    for (const item of items) {
      await db.none(
        `INSERT INTO items (item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (item_name) DO NOTHING`,
        [...item, 'Active']
      );
    }

    console.log('\n=== Database seeded successfully ===');
    console.log('Default Admin: admin@clinic.com / admin123');
    console.log('Default Staff: staff@clinic.com / staff123');

    pgp.end();
  } catch (error) {
    console.error('Seed error:', error);
    pgp.end();
    process.exit(1);
  }
})();
