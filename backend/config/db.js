const pgp = require('pg-promise')();
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const db = pgp({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

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
