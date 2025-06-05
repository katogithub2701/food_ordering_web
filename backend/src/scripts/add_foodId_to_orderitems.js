// Migration: Add foodId column to OrderItems table if it does not exist
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
  db.all("PRAGMA table_info('OrderItems')", (err, columns) => {
    if (err) throw err;
    const hasFoodId = columns.some(col => col.name === 'foodId');
    if (!hasFoodId) {
      db.run('ALTER TABLE OrderItems ADD COLUMN foodId INTEGER', (err) => {
        if (err) throw err;
        console.log('Added foodId column to OrderItems table.');
        db.close();
      });
    } else {
      console.log('OrderItems table already has foodId column.');
      db.close();
    }
  });
});
