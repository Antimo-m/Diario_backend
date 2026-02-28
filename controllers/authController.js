import bcrypt from "bcrypt";
import connection from "../db/diario_db.js";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    const { username, email, password } = req.body;

   
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }

    const checkSql = "SELECT * FROM users WHERE email = ?";

    connection.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Errore database" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "Email già registrata" });
        }

        
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: "Errore hashing password" });
            }

            
            const insertSql =
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

            connection.query(
                insertSql,
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: "Errore inserimento" });
                    }

                    res.status(201).json({
                        message: "Utente registrato con successo",
                        userId: result.insertId,
                    });
                }
            );
        });
    });
};

export const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email e password obbligatorie" });

    const sql = "SELECT * FROM users WHERE email = ?";
    connection.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Errore database" });
        if (results.length === 0) return res.status(400).json({ error: "Email non registrata" });

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: "Errore server" });
            if (!isMatch) return res.status(400).json({ error: "Password errata" });

            const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.json({ message: "Login riuscito", userId: user.id, username: user.username });
        });
    });
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax"
    });

    res.clearCookie("secretToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    });

    res.json({ message: "Logout effettuato con successo" });
};