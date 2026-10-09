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

const initializeDatabase = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await db.none(schema);
    console.log('Connected to PostgreSQL database and schema initialized.');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
};

const getDb = () => db;

module.exports = { db, initializeDatabase, getDb };
