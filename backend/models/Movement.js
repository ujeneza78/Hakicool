import mongoose from "mongoose";

const movementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    reference: { type: String, required: true },
    type: { type: String, enum: ["in", "out"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Movement", movementSchema);