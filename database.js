const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'quests.db'), { verbose: console.log });

// Create tables if they don't exist
function initDatabase() {
    // Quests table
    db.exec(`
        CREATE TABLE IF NOT EXISTS quests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            points INTEGER NOT NULL,
            completed INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            completed_at TEXT
        )
    `);

    // Settings table for total points
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `);

    // Initialize total_points if it doesn't exist
    const checkSettings = db.prepare('SELECT value FROM settings WHERE key = ?').get('total_points');
    if (!checkSettings) {
        db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('total_points', '0');
    }

    console.log('✅ Database initialized');
}

// Quest CRUD operations
const questOperations = {
    // Get all quests
    getAll: () => {
        return db.prepare('SELECT * FROM quests ORDER BY created_at DESC').all();
    },

    // Get a single quest by ID
    getById: (id) => {
        return db.prepare('SELECT * FROM quests WHERE id = ?').get(id);
    },

    // Create a new quest
    create: (title, points) => {
        const createdAt = new Date().toISOString();
        const result = db.prepare(
            'INSERT INTO quests (title, points, completed, created_at) VALUES (?, ?, 0, ?)'
        ).run(title, points, createdAt);
        
        return {
            id: result.lastInsertRowid,
            title,
            points,
            completed: false,
            createdAt
        };
    },

    // Update a quest
    update: (id, data) => {
        const quest = questOperations.getById(id);
        if (!quest) return null;

        const updates = [];
        const params = [];

        if (data.title !== undefined) {
            updates.push('title = ?');
            params.push(data.title);
        }
        if (data.points !== undefined) {
            updates.push('points = ?');
            params.push(data.points);
        }
        if (data.completed !== undefined) {
            updates.push('completed = ?');
            params.push(data.completed ? 1 : 0);
            
            if (data.completed) {
                updates.push('completed_at = ?');
                params.push(new Date().toISOString());
            } else {
                updates.push('completed_at = NULL');
            }
        }

        if (updates.length === 0) return quest;

        params.push(id);
        const sql = `UPDATE quests SET ${updates.join(', ')} WHERE id = ?`;
        db.prepare(sql).run(...params);

        return questOperations.getById(id);
    },

    // Complete a quest
    complete: (id) => {
        const quest = questOperations.getById(id);
        if (!quest || quest.completed) return null;

        const completedAt = new Date().toISOString();
        db.prepare('UPDATE quests SET completed = 1, completed_at = ? WHERE id = ?')
            .run(completedAt, id);

        // Update total points
        const currentPoints = parseInt(settingsOperations.get('total_points'));
        settingsOperations.set('total_points', (currentPoints + quest.points).toString());

        return questOperations.getById(id);
    },

    // Uncomplete a quest
    uncomplete: (id) => {
        const quest = questOperations.getById(id);
        if (!quest || !quest.completed) return null;

        db.prepare('UPDATE quests SET completed = 0, completed_at = NULL WHERE id = ?')
            .run(id);

        // Update total points
        const currentPoints = parseInt(settingsOperations.get('total_points'));
        settingsOperations.set('total_points', (currentPoints - quest.points).toString());

        return questOperations.getById(id);
    },

    // Delete a quest
    delete: (id) => {
        const quest = questOperations.getById(id);
        if (!quest) return false;

        db.prepare('DELETE FROM quests WHERE id = ?').run(id);
        return true;
    }
};

// Settings operations
const settingsOperations = {
    get: (key) => {
        const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
        return result ? result.value : null;
    },

    set: (key, value) => {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }
};

// Initialize the database
initDatabase();

module.exports = {
    db,
    quests: questOperations,
    settings: settingsOperations
};

