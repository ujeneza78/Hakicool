import { Router } from "express";
import Shop from "../models/Shop.js";
import requireAdmin from "../middleware/admin.js";

const router = Router();

const publicShop = (s) => ({ name: s.name, phone: s.phone, address: s.address });

async function getShop() {
  // Upsert atomique ; la clé unique évite les doublons. Un ancien document sans clé est réutilisé.
  try {
    return await Shop.findOneAndUpdate(
      { key: { $in: ["main", null] } },
      { $set: { key: "main" } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    return Shop.findOne({ key: "main" });
  }
}

// Lecture : tous les utilisateurs connectés
router.get("/", async (req, res) => {
  try {
    res.json(publicShop(await getShop()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modification : administrateur seulement
router.put("/", requireAdmin, async (req, res) => {
  try {
    const shop = await getShop();
    const name = String(req.body.name ?? shop.name).trim();
    if (!name) {
      return res.status(400).json({ message: "Le nom de la boutique est obligatoire" });
    }
    shop.name = name;
    shop.phone = String(req.body.phone ?? shop.phone).trim();
    shop.address = String(req.body.address ?? shop.address).trim();
    await shop.save();
    res.json(publicShop(shop));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;