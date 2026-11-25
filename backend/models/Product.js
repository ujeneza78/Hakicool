import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    reference: { type: String, required: true, unique: true, trim: true },
    category: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 },
    threshold: { type: Number, min: 0, default: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);