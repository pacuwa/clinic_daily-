const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/clinic_inventory.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(schemaPath, 'utf8', (err, schemaSql) => {
      if (err) {
        reject(err);
        return;
      }

      db.exec(schemaSql, (execError) => {
        if (execError) {
          reject(execError);
          return;
        }
        resolve();
      });
    });
  });
};

const getDb = () => db;

module.exports = { db, initializeDatabase, getDb };
