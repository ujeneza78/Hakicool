import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function publicUser(user) {
  return { name: user.name, email: user.email, role: user.role };
}

// Indique si on peut encore créer le premier compte
router.get("/status", async (req, res) => {
  const count = await User.countDocuments();
  res.json({ registrationOpen: count === 0 });
});

// Création du premier compte (administrateur), puis inscriptions fermées
router.post("/register", async (req, res) => {
  try {
    if ((await User.countDocuments()) > 0) {
      return res.status(403).json({ message: "Les inscriptions sont fermées" });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password || String(password).length < 8) {
      return res
        .status(400)
        .json({ message: "Nom, e-mail et mot de passe (8 caractères minimum) requis" });
    }

    const hash = await bcrypt.hash(String(password), 10);
    const user = await User.create({ name, email, password: hash, role: "admin" });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    const valid = user && (await bcrypt.compare(password, user.password));

    if (!valid) {
      return res.status(401).json({ message: "E-mail ou mot de passe incorrect" });
    }
        if (user.active === false) {
      return res.status(403).json({ message: "Compte désactivé. Contactez l'administrateur." });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Utilisateur connecté
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email role");
  if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });
  res.json(user);
});
// Changer son mot de passe
router.put("/password", auth, async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Mot de passe modifié" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;