import connection from '../db/diario_db.js';

export function createEntry(req, res) {
    const userId = req.user && req.user.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, content } = req.body || {};
    if (!title || !content) {
        return res.status(400).json({ error: 'title and content are required' });
    }

    const sql = `
        INSERT INTO diary_entries (user_id, title, content, created_at)
        VALUES (?, ?, ?, NOW())
    `;

    connection.query(sql, [userId, title, content], (err, results) => {
        if (err) {
            console.error('DB error (createEntry):', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Diary entry created', id: results.insertId });
    });
}

export function getEntries(req, res) {
    const userId = req.user && req.user.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = `
        SELECT id, user_id, title, content, created_at
        FROM diary_entries
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('DB error (getEntries):', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
}