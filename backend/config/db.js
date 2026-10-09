const pgp = require('pg-promise')();
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load local .env file only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

// Determine if connection requires SSL:
// - Render External URLs contain '.render.com' and require SSL ({ rejectUnauthorized: false }).
// - Render Internal URLs (e.g., 'dpg-xxxxx-a') do NOT require SSL (ssl: false).
const requiresSsl = connectionString && connectionString.includes('.render.com');

const dbConfig = connectionString
  ? {
      connectionString: connectionString,
      ssl: requiresSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      database: process.env.DATABASE_NAME || 'clinic_inventory',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD,
    };

const db = pgp(dbConfig);

const initializeDatabase = async () => {
  try {
    // Verify connection first
    const connection = await db.connect();
    console.log('✓ Connected to PostgreSQL database');
    connection.done();

    // Check if schema already exists
    const tableExists = await db.oneOrNone(
      `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='users')`
    );

    if (tableExists?.exists) {
      console.log('✓ Database schema already initialized');
      return;
    }

    // Load and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.none(schema);
    console.log('✓ Database schema initialized successfully');

  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    throw error;
  }
};

const getDb = () => db;

module.exports = { db, initializeDatabase, getDb };
