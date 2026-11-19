import { Router } from "express";
import Product from "../models/Product.js";
import Movement from "../models/Movement.js";

const router = Router();

// Historique (les 100 derniers mouvements)
router.get("/", async (req, res) => {
  try {
    const movements = await Movement.find().sort({ createdAt: -1 }).limit(100);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enregistrer une entrée ou une sortie
router.post("/", async (req, res) => {
  try {
    const { productId, type, note } = req.body;
    const quantity = Number(req.body.quantity);

    if (!["in", "out"].includes(type)) {
      return res.status(400).json({ message: "Type invalide (in ou out)" });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "La quantité doit être un entier supérieur ou égal à 1" });
    }

    // Pour une sortie, on exige assez de stock : le stock ne devient jamais négatif
    const filter = { _id: productId };
    if (type === "out") filter.quantity = { $gte: quantity };

    const product = await Product.findOneAndUpdate(
      filter,
      { $inc: { quantity: type === "in" ? quantity : -quantity } },
          { returnDocument: "after" } 
    );

    if (!product) {
      const exists = await Product.exists({ _id: productId });
      return exists
        ? res.status(400).json({ message: "Stock insuffisant" })
        : res.status(404).json({ message: "Produit introuvable" });
    }

    const movement = await Movement.create({
      product: product._id,
      productName: product.name,
      reference: product.reference,
      type,
      quantity,
      note,
    });

    res.status(201).json({ movement, product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;