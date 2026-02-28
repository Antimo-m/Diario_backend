import jwt from "jsonwebtoken";

export const secretMiddleware = (req, res, next) => {
  const token = req.cookies.secretToken;

  if (!token) {
    return res.status(401).json({ error: "Accesso segreto non autorizzato" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token segreto non valido" });
    }


    if (!decoded.secretAccess || decoded.userId !== req.user.userId) {
      return res.status(403).json({ error: "Accesso non autorizzato" });
    }

    next();
  });
};
