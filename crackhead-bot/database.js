const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Fout bij openen van database:', err.message);
    } else {
        console.log('Verbonden met de SQLite database! 💾');
    }
});

module.exports = db;