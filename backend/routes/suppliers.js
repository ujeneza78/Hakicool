import { Router } from "express";
import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import requireAdmin from "../middleware/admin.js";

const router = Router();

function pick(body, partial = false) {
  const data = {};
  for (const key of ["name", "phone", "email", "address", "notes"]) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim();
  }
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (!partial && !data.name) throw new Error("Le nom du fournisseur est obligatoire");
  if (partial && data.name === "") throw new Error("Le nom du fournisseur est obligatoire");
  return data;
}

function errorMessage(error) {
  return error.code === 11000 ? "Un fournisseur porte déjà ce nom" : error.message;
}

// Lister les fournisseurs, avec le nombre de produits liés (tous les utilisateurs)
router.get("/", async (req, res) => {
  try {
    const [suppliers, counts] = await Promise.all([
      Supplier.find().sort({ name: 1 }),
      Product.aggregate([
        { $match: { supplier: { $ne: null } } },
        { $group: { _id: "$supplier", count: { $sum: 1 } } },
      ]),
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.count]));

    res.json(
      suppliers.map((s) => ({
        _id: s._id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        notes: s.notes,
        active: s.active,
        productCount: byId.get(String(s._id)) || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un fournisseur (administrateur)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const supplier = await Supplier.create(pick(req.body));
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
});

// Modifier un fournisseur, l'activer ou le désactiver (administrateur)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, pick(req.body, true), {
      returnDocument: "after",
      runValidators: true,
    });
    if (!supplier) return res.status(404).json({ message: "Fournisseur introuvable" });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
});

// Supprimer un fournisseur (administrateur) : ses produits ne sont plus rattachés à personne
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Fournisseur introuvable" });
    await Product.updateMany({ supplier: supplier._id }, { supplier: null });
    res.json({ message: "Fournisseur supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;