const pgp = require('pg-promise')();
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Ensure DATABASE_URL exists in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is missing on Render!');
  process.exit(1);
}

const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Render PostgreSQL
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
    const connection = await db.connect();
    console.log('✓ Connected to PostgreSQL database');
    connection.done();

    const tableExists = await db.oneOrNone(
      `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='users')`
    );

    if (tableExists?.exists) {
      console.log('✓ Database schema already initialized');
      return;
    }

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
