const bcrypt = require('bcryptjs');
const pgp = require('pg-promise')();
const dotenv = require('dotenv');

dotenv.config();

const db = pgp({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
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
    console.log('Initializing database...');

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

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_items_name ON items(item_name);
      CREATE INDEX IF NOT EXISTS idx_stock_in_date ON stock_in(date_in);
      CREATE INDEX IF NOT EXISTS idx_stock_out_date ON stock_out(date_out);
      CREATE INDEX IF NOT EXISTS idx_stock_in_item ON stock_in(item_id);
      CREATE INDEX IF NOT EXISTS idx_stock_out_item ON stock_out(item_id);
    `);

    console.log('Hashing passwords...');
    const adminPassword = await hashPassword('admin123');
    const staffPassword = await hashPassword('staff123');

    console.log('Inserting admin user...');
    await db.none(
      `INSERT INTO users (email, password_hash, role, full_name, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@clinic.com', adminPassword, 'Admin', 'System Administrator', 'Active']
    );

    console.log('Inserting staff user...');
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
         ON CONFLICT DO NOTHING`,
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
