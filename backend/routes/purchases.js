import { Router } from "express";
import auth from "../middleware/auth.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import Movement from "../models/Movement.js";
import Supplier from "../models/Supplier.js";

const router = Router();

// POST /api/purchases - Créer un achat
router.post("/", auth, async (req, res) => {
  try {
    const { items, supplierId, purchaseDate, notes } = req.body;

    // Vérifier que le fournisseur existe
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Fournisseur introuvable" });
    }

    // Vérifier que chaque produit existe et calculer le totalAmount
    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: `Produit ${item.productId} introuvable` });
      }

      // Calculer le total de cet article
      const itemTotal = item.quantity * item.costPrice;
      totalAmount += itemTotal;

      // Ajouter à la liste d'achat
      purchaseItems.push({
        productId: product._id,
        productName: product.name,
        reference: product.reference,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: itemTotal,
      });
    }

    // Créer l'achat
    const purchase = new Purchase({
      supplier: supplier._id,
      supplierName: supplier.name,
      items: purchaseItems,
      totalAmount,
      purchaseDate: purchaseDate || new Date(),
      notes,
    });
    await purchase.save();

    // Augmenter le stock et créer les mouvements "in"
    for (const item of purchaseItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: item.quantity } },
        { returnDocument: "after" }
      );

      await Movement.create({
        product: item.productId,
        productName: item.productName,
        reference: item.reference,
        type: "in",
        quantity: item.quantity,
        note: `Achat - ${purchase._id}${notes ? ` - ${notes}` : ""}`,
      });
    }

    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/purchases - Lister les achats
router.get("/", auth, async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
