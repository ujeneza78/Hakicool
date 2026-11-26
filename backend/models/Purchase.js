import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  supplier: mongoose.Schema.Types.ObjectId,     // ID du fournisseur
  supplierName: String,                         // Nom (copie)
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      reference: String,
      quantity: { type: Number, required: true, min: 1 },
      costPrice: { type: Number, required: true },  // Prix d'achat unitaire
      total: { type: Number, required: true },      // qty × costPrice
    },
  ],
  totalAmount: { type: Number, required: true },
  purchaseDate: Date,                           // Date de réception
  notes: String,                                // Notes (optionnel)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Purchase", purchaseSchema);