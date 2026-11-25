import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");

  if (!match) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ message: "Session invalide ou expirée" });
  }

  if (!payload || typeof payload !== "object" || typeof payload.id !== "string") {
    return res.status(401).json({ message: "Session invalide ou expirée" });
  }

  // Le rôle et l'état du compte sont relus en base : un compte supprimé ou désactivé
  // perd l'accès immédiatement, même si son jeton n'a pas expiré.
  const user = await User.findById(payload.id).select("_id role active");
  if (!user) {
    return res.status(401).json({ message: "Utilisateur introuvable" });
  }
  if (user.active === false) {
    return res.status(403).json({ message: "Compte désactivé" });
  }

  req.user = { id: user._id.toString(), role: user.role };
  return next();
}