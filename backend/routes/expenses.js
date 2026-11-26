import { Router } from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import Expense from "../models/Expense.js";

const router = Router();

// GET /api/expenses - Lister les dépenses
router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/expenses - Ajouter une dépense
router.post("/", auth, admin, async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    // Vérifier que category et amount existent
    if (!category || !amount) {
      return res.status(400).json({ error: "Catégorie et montant requis" });
    }

    const expense = new Expense({
      category,
      amount,
      description,
      date: date || new Date(),
    });
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/expenses/:id - Supprimer une dépense
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Dépense introuvable" });
    }
    res.json({ message: "Dépense supprimée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;