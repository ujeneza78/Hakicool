import { Router } from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Movement from "../models/Movement.js";

const router = Router();

// POST /api/sales - Créer une vente
router.post("/", auth, async (req, res) => {
  try {
  const { items, paymentMethod, notes, customerId } = req.body;
  let totalAmount = 0;
  const saleItems = [];
  for (const item of items) { // Vérifier chaque produit et calculer le total
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ error: `Produit avec ID ${item.productId} non trouvé` });
    }
    if (product.quantity < item.quantity) {
      return res.status(400).json({ error: `Stock insuffisant pour le produit ${product.name}` });
    }
    const total = item.quantity * product.price;
    totalAmount += total;
    saleItems.push({
      productId: item.productId,
      productName: product.name,
      reference: product.reference,
      quantity: item.quantity,
      price: product.price,
      total,
    });
  }

  // Créer la vente
  const sale = new Sale({
    items: saleItems,
    totalAmount,
    paymentMethod,
    cashierId: req.user._id,
    customerId,
    notes,
  });
  await sale.save();

    // Mettre à jour le stock et créer les mouvements "out"
  for (const item of saleItems) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { quantity: -item.quantity } },
      { returnDocument: "after" }
    );
    
    await Movement.create({
      product: item.productId,
      productName: item.productName,
      reference: item.reference,
      type: "out",
      quantity: item.quantity,
      note: `Vente - ${sale._id}${notes ? ` - ${notes}` : ""}`,
    });
  }
  res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/sales - Lister les ventes
router.get("/", auth, async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;