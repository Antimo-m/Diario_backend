import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connection from "../db/diario_db.js";

// ---------------------
// SET PASSWORD SEGRETA
// ---------------------
export const setupSecret = (req, res) => { // store
  const { password } = req.body;
  const userId = req.user.userId;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "La password deve avere almeno 6 caratteri" });
  }

  const checkSql = "SELECT secret_password FROM users WHERE id = ?";

  connection.query(checkSql, [userId], (err, results) => {
    if (err) {
      console.error("Errore database:", err);
      return res.status(500).json({ error: "Errore database" });
    }

    if (results[0]?.secret_password) {
      return res.status(400).json({ error: "Password segreta già impostata" });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error("Errore hashing:", err);
        return res.status(500).json({ error: "Errore server" });
      }

      const updateSql = "UPDATE users SET secret_password = ? WHERE id = ?";

      connection.query(updateSql, [hash, userId], (err) => {
        if (err) {
          console.error("Errore update:", err);
          return res.status(500).json({ error: "Errore database" });
        }

        res.status(201).json({ message: "Password segreta impostata con successo" });
      });
    });
  });
};

// ---------------------
// LOGIN DIARIO SEGRETO
// ---------------------
export const secretLogin = (req, res) => { // login
  const { password } = req.body;
  const userId = req.user.userId;

  if (!password) {
    return res.status(400).json({ error: "Password richiesta" });
  }

  const sql = "SELECT secret_password FROM users WHERE id = ?";

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Errore database:", err);
      return res.status(500).json({ error: "Errore database" });
    }

    const hashedPassword = results[0]?.secret_password;

    if (!hashedPassword) {
      return res.status(400).json({ error: "Password segreta non impostata" });
    }

    bcrypt.compare(password, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error("Errore compare:", err);
        return res.status(500).json({ error: "Errore server" });
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Password errata" });
      }

      const token = jwt.sign(
        { userId, secretAccess: true },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.cookie("secretToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 2 * 60 * 60 * 1000
      });

      res.json({ message: "Accesso al Diario Segreto riuscito" });
    });
  });
};

// ---------------------
// LOGOUT DIARIO SEGRETO
// ---------------------
export const secretLogout = (req, res) => { // logout
  res.clearCookie("secretToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  });

  res.json({ message: "Logout Diario Segreto effettuato" });
};

// ---------------------
// STATUS PASSWORD SEGRETA
// ---------------------
export const secretStatus = (req, res) => { // show
  const userId = req.user.userId;

  const sql = "SELECT secret_password FROM users WHERE id = ?";

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Errore database:", err);
      return res.status(500).json({ error: "Errore database" });
    }

    const isSetup = !!results[0]?.secret_password;
    res.json({ setup: isSetup });
  });
};