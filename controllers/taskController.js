import connection from '../db/diario_db.js';

export function createTask(req, res) { // store
    const userId = req.user && req.user.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { column_title, task_title, task_description } = req.body || {};
    if (!column_title || !task_title) {
        return res.status(400).json({ error: 'column_title and task_title are required' });
    }

    const sql = `
        INSERT INTO tasks (user_id, column_title, task_title, task_description, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;

    connection.query(
        sql,
        [userId, column_title, task_title, task_description || null],
        (err, results) => {
            if (err) {
                console.error('DB error (createTask):', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Task created', id: results.insertId });
        }
    );
}

export function getTasks(req, res) { // index
    
    const userId = req.user && req.user.userId;

    if (!userId) {
        return res.status(200).json([]);
    }

    const sql = `
        SELECT id, user_id, column_title, task_title, task_description, created_at
        FROM tasks
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('DB error (getTasks):', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
}