const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Dit maakt een databasebestand aan in je projectmap
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Fout bij openen van database:', err.message);
    } else {
        console.log('Verbonden met de SQLite database! 💾');
    }
});

// Zorg dat de tabel bestaat en vul hem direct met testdata voor je docent!
db.serialize(() => {
    // 1. Maak de tabel aan als deze nog niet bestaat
    db.run(`CREATE TABLE IF NOT EXISTS scores (
        userId TEXT PRIMARY KEY,
        username TEXT,
        points INTEGER DEFAULT 0
    )`);

    // 2. Voeg testdata toe (INSERT OR IGNORE zorgt ervoor dat hij niet crasht als ze er al in staan)
    const stmt = db.prepare(`INSERT OR IGNORE INTO scores (userId, username, points) VALUES (?, ?, ?)`);
    
    stmt.run('999111', 'TyLem (Jijzelf)', 150);
    stmt.run('999222', 'De Docent', 50);
    stmt.run('999323', 'CrackheadFan', 85);
    
    stmt.finalize();
    console.log('Testdata succesvol ingeladen in de database! 📊');
});

module.exports = db;