import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

// Lister tous les produits
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/// Ajouter un produit
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (product.quantity > 0) {
      await Movement.create({
        product: product._id,
        productName: product.name,
        reference: product.reference,
        type: "in",
        quantity: product.quantity,
        note: "Stock initial",
      });
    }
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Modifier un produit
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un produit
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;