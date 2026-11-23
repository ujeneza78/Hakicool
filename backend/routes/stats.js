import { Router } from "express";
import Product from "../models/Product.js";
import Movement from "../models/Movement.js";

const router = Router();

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

router.get("/", async (req, res) => {
  try {
    // Début du jour d'il y a 6 jours : on affiche 7 jours, aujourd'hui compris
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6);

    const lowStockFilter = { $expr: { $lte: ["$quantity", "$threshold"] } };

    const [totals, lowStockCount, lowStock, recentMovements, weekMovements] =
      await Promise.all([
        Product.aggregate([
          {
            $group: {
              _id: null,
              products: { $sum: 1 },
              units: { $sum: "$quantity" },
              value: { $sum: { $multiply: ["$quantity", "$price"] } },
            },
          },
        ]),
        Product.countDocuments(lowStockFilter),
        Product.find(lowStockFilter)
          .sort({ quantity: 1 })
          .limit(10)
          .select("name reference quantity threshold"),
        Movement.find().sort({ createdAt: -1 }).limit(5),
        Movement.find({ createdAt: { $gte: since } }).select("type quantity createdAt"),
      ]);

    // Un total d'entrées et de sorties pour chacun des 7 derniers jours
    const daily = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      daily.push({ date: dayKey(d), in: 0, out: 0 });
    }
    const byDay = new Map(daily.map((day) => [day.date, day]));
    for (const m of weekMovements) {
      const entry = byDay.get(dayKey(m.createdAt));
      if (entry) entry[m.type] += m.quantity;
    }

    const t = totals[0] || { products: 0, units: 0, value: 0 };

    res.json({
      products: t.products,
      units: t.units,
      value: t.value,
      lowStockCount,
      lowStock,
      recentMovements,
      daily,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;