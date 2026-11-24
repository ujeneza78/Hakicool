import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Session invalide ou expirée" });
  }

  try {
    const user = await User.findById(payload.id).select("role active");
    if (!user || user.active === false) {
      return res.status(401).json({ message: "Compte introuvable ou désactivé" });
    }
    req.user = { id: String(user._id), role: user.role };
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}