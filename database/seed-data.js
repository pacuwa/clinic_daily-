const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'clinic_inventory.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath);

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const runSqlFile = (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

(async () => {
  try {
    console.log('Initializing database...');
    await runSqlFile(schemaPath);

    console.log('Hashing passwords...');
    const adminPassword = await hashPassword('admin123');
    const staffPassword = await hashPassword('staff123');

    console.log('Inserting admin user...');
    db.run(
      `INSERT OR IGNORE INTO users (email, password_hash, role, full_name, status) VALUES (?, ?, ?, ?, ?)`,
      ['admin@clinic.com', adminPassword, 'Admin', 'System Administrator', 'Active'],
      (err) => {
        if (err) console.error('Error inserting admin:', err);
        else console.log('Admin user created');
      }
    );

    console.log('Inserting staff user...');
    db.run(
      `INSERT OR IGNORE INTO users (email, password_hash, role, full_name, status) VALUES (?, ?, ?, ?, ?)`,
      ['staff@clinic.com', staffPassword, 'Staff', 'Clinic Staff Member', 'Active'],
      (err) => {
        if (err) console.error('Error inserting staff:', err);
        else console.log('Staff user created');
      }
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

    items.forEach((item) => {
      db.run(
        `INSERT OR IGNORE INTO items (item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...item, 'Active'],
        (err) => {
          if (err) console.error('Error inserting item:', err);
        }
      );
    });

    setTimeout(() => {
      console.log('\n=== Database seeded successfully ===');
      console.log('Default Admin: admin@clinic.com / admin123');
      console.log('Default Staff: staff@clinic.com / staff123');
      db.close();
    }, 1000);
  } catch (error) {
    console.error('Seed error:', error);
    db.close();
    process.exit(1);
  }
})();
