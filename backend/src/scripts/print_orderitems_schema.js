// Print the full schema and file path being used at runtime
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../db.sqlite');
console.log('Using SQLite file:', dbPath);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) throw err;
    console.log('Tables:');
    tables.forEach(t => console.log(' -', t.name));
    db.all("PRAGMA table_info('OrderItems')", (err, columns) => {
      if (err) throw err;
      console.log('\nOrderItems schema:');
      columns.forEach(col => {
        console.log(`  ${col.cid}: ${col.name} (${col.type})${col.pk ? ' PRIMARY KEY' : ''}`);
      });
      db.close();
    });
  });
});
