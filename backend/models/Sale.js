import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      reference: String,
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // cash, card, etc.
  cashierId: mongoose.Schema.Types.ObjectId, // utilisateur qui a fait la vente
  customerId: mongoose.Schema.Types.ObjectId, // client associé à la vente
  notes: String, // optionnel
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Sale", saleSchema);