const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Fout bij openen van database:', err.message);
    } else {
        console.log('Verbonden met de SQLite database! ');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS scores (
        userId TEXT PRIMARY KEY,
        username TEXT,
        points INTEGER DEFAULT 0
    )`);

    const stmt = db.prepare(`INSERT OR IGNORE INTO scores (userId, username, points) VALUES (?, ?, ?)`);
    
    stmt.run('999111', 'Ty', 150);
    stmt.run('999222', 'Emile67', 50);
    stmt.run('999323', 'ruben de sigma', 85);
    
    stmt.finalize();
    console.log('Testdata succesvol ingeladen in de database! ');
});

module.exports = db;