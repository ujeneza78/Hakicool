import { Router } from "express";
import Product from "../models/Product.js";
import Movement from "../models/Movement.js";

const router = Router();

// Texte : échappe ; " et retours à la ligne, et neutralise les formules Excel (=, +, -, @)
function text(value) {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[";\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Nombre au format français (virgule décimale)
const num = (n) => String(Number(n ?? 0)).replace(".", ",");

const today = () => new Date().toISOString().slice(0, 10);

function sendCsv(res, filename, header, rows) {
  const lines = [header, ...rows].map((row) => row.join(";"));
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  // "\uFEFF" : permet à Excel d'afficher correctement les accents
  res.send("\uFEFF" + lines.join("\r\n") + "\r\n");
}

// Inventaire
router.get("/products.csv", async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    const rows = products.map((p) => [
      text(p.name),
      text(p.reference),
      text(p.category),
      num(p.quantity),
      num(p.price),
      num(p.threshold),
      num(Math.round(p.quantity * p.price * 100) / 100),
      p.quantity <= p.threshold ? "En alerte" : "OK",
    ]);
    sendCsv(
      res,
      `inventaire-${today()}.csv`,
      ["Nom", "Référence", "Catégorie", "Quantité", "Prix", "Seuil d'alerte", "Valeur", "Statut"],
      rows
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Historique complet des mouvements
router.get("/movements.csv", async (req, res) => {
  try {
    const movements = await Movement.find().sort({ createdAt: -1 });
    const rows = movements.map((m) => [
      new Date(m.createdAt).toLocaleString("fr-FR"),
      text(m.productName),
      text(m.reference),
      m.type === "in" ? "Entrée" : "Sortie",
      num(m.quantity),
      text(m.note),
    ]);
    sendCsv(
      res,
      `mouvements-${today()}.csv`,
      ["Date", "Produit", "Référence", "Type", "Quantité", "Note"],
      rows
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;