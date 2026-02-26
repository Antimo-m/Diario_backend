import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || typeof authHeader !== "string") {
            return res.status(401).json({ error: "Authorization header mancante" });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ error: "Formato Authorization non valido. Usa 'Bearer <token>'" });
        }

        const token = parts[1];
        if (!token) return res.status(401).json({ error: "Token mancante" });

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ error: "Token non valido" });

            req.user = decoded;
            next();
        });
    } catch (err) {
        next(err);
    }
};