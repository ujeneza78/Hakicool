import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    // Clé unique : garantit un seul document « boutique » même en cas de requêtes simultanées
    key: { type: String, default: "main", unique: true },
    name: { type: String, trim: true, default: "Ma boutique" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Shop", shopSchema);