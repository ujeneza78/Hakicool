import { Router } from "express";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import requireAdmin from "../middleware/admin.js";

const router = Router();

function pick(body, partial = false) {
  const data = {};
  for (const key of ["name", "phone", "email", "address", "notes"]) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim();
  }
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (!partial && !data.name) throw new Error("Le nom du client est obligatoire");
  if (partial && data.name === "") throw new Error("Le nom du client est obligatoire");
  return data;
}

function errorMessage(error) {
  return error.code === 11000 ? "Un client porte déjà ce nom" : error.message;
}

router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un client (administrateur)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const customer = await Customer.create(pick(req.body));
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
});

// Modifier un client, l'activer ou le désactiver (administrateur)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const customer = await Customer.findByIdAndUpdate(req.params.id, pick(req.body, true), {
      returnDocument: "after",
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ message: "Client introuvable" });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Client introuvable" });
    res.json({ message: "Client supprimé" });
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
});

export default router;