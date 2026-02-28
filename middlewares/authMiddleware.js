import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        // 1. Cerca nel header Authorization (Bearer token)
        if (authHeader && typeof authHeader === "string") {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                token = parts[1];
            }
        }

        // 2. Cerca nei cookies
        if (!token && req.cookies) {
            token = req.cookies.token || req.cookies.authToken || req.cookies.secretToken;
        }

        console.log('🔍 Auth Check:', {
            method: req.method,
            path: req.path,
            cookies: Object.keys(req.cookies || {}),
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
        });

        if (!token) {
            console.log('❌ Token mancante per:', req.path);
            return res.status(401).json({ error: "Token mancante" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('❌ Token verification error:', err.message, 'per path:', req.path);
                return res.status(403).json({ error: "Token non valido" });
            }

            console.log('✅ Token valido per:', req.path, 'userId:', decoded.userId);
            req.user = decoded;
            next();
        });
    } catch (err) {
        next(err);
    }
};