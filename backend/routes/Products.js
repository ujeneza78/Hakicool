import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Movement from "../models/Movement.js";
import requireAdmin from "../middleware/admin.js";

const router = Router();

const CREATE_FIELDS = ["name", "reference", "category", "quantity", "price", "threshold", "supplier"];
const UPDATE_FIELDS = ["name", "reference", "category", "price", "threshold", "supplier"];

// Ne garde que les champs autorisés ; un fournisseur vide devient null
function pick(body, fields) {
  const data = {};
  for (const key of fields) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if ("supplier" in data && !data.supplier) data.supplier = null;
  return data;
}

function errorMessage(error) {
  return error.code === 11000
    ? "Cette référence existe déjà. Choisissez une autre référence."
    : error.message;
}

// Lister tous les produits (avec le nom du fournisseur)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("supplier", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un produit (administrateur)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const created = await Product.create(pick(req.body, CREATE_FIELDS));

    if (created.quantity > 0) {
      await Movement.create({
        product: created._id,
        productName: created.name,
        reference: created.reference,
        type: "in",
        quantity: created.quantity,
        note: "Stock initial",
      });
    }

    const product = await Product.findById(created._id).populate("supplier", "name");
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
});

// Modifier un produit (administrateur) : la quantité ne se change que par un mouvement
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      pick(req.body, UPDATE_FIELDS),
      { returnDocument: "after", runValidators: true }
    ).populate("supplier", "name");
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
});

// Supprimer un produit (administrateur)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;