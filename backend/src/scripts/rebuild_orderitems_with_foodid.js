// Migration: Rebuild OrderItems table with foodId column if missing
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
  db.all("PRAGMA table_info('OrderItems')", (err, columns) => {
    if (err) throw err;
    const hasFoodId = columns.some(col => col.name === 'foodId');
    if (hasFoodId) {
      console.log('OrderItems table already has foodId column.');
      db.close();
      return;
    }
    // 1. Create new table with correct schema
    db.run(`CREATE TABLE OrderItems_temp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      foodId INTEGER,
      quantity INTEGER,
      price FLOAT,
      createdAt DATETIME,
      updatedAt DATETIME
    )`, (err) => {
      if (err) throw err;
      // 2. Copy data from old table (set foodId to NULL)
      db.run(`INSERT INTO OrderItems_temp (id, orderId, quantity, price, createdAt, updatedAt)
        SELECT id, orderId, quantity, price, createdAt, updatedAt FROM OrderItems`, (err) => {
        if (err) throw err;
        // 3. Drop old table
        db.run('DROP TABLE OrderItems', (err) => {
          if (err) throw err;
          // 4. Rename new table
          db.run('ALTER TABLE OrderItems_temp RENAME TO OrderItems', (err) => {
            if (err) throw err;
            console.log('OrderItems table rebuilt with foodId column.');
            db.close();
          });
        });
      });
    });
  });
});
