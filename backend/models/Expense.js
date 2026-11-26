import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true },      // Loyer, Transport, Électricité...
  amount: { type: Number, required: true, min: 0 },
  description: String,                             // Description (optionnel)
  date: { type: Date, default: Date.now },         // Date de la dépense
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Expense", expenseSchema);