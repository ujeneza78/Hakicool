import { Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import requireAdmin from "../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

const FIELDS = "name email role active createdAt";

// Lister les comptes
router.get("/", async (req, res) => {
  try {
    res.json(await User.find().sort({ createdAt: 1 }).select(FIELDS));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un compte
router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");
    const role = req.body.role === "admin" ? "admin" : "user";

    if (!name || !email || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Nom, e-mail et mot de passe (8 caractères minimum) requis" });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    const message = error.code === 11000 ? "Cet e-mail est déjà utilisé" : error.message;
    res.status(400).json({ message });
  }
});

// Changer le rôle ou activer / désactiver un compte
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const update = {};
    if (req.body.role !== undefined) {
      if (!["admin", "user"].includes(req.body.role)) {
        return res.status(400).json({ message: "Rôle invalide" });
      }
      update.role = req.body.role;
    }
    if (req.body.active !== undefined) update.active = Boolean(req.body.active);

    if (id === req.user.id && (update.role === "user" || update.active === false)) {
      return res.status(400).json({
        message: "Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte",
      });
    }

    Object.assign(user, update);
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Réinitialiser le mot de passe d'un compte
router.put("/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const newPassword = String(req.body.newPassword || "");
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Mot de passe réinitialisé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;