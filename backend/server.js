import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env"), override: true });import express from "express";// Import d'Express pour créer le serveur
import cors from "cors";//pour connect a l'API depuis le frontend
import mongoose from "mongoose";// Import de Mongoose pour la connexion à MongoDB
import productRoutes from "./routes/products.js"; // Import des routes pour les produits
import movementRoutes from "./routes/movements.js";// Import des routes pour les mouvements
import authRoutes from "./routes/auth.js";
import auth from "./middleware/auth.js";
    
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); // Routes pour l'authentification
app.use("/api/products", auth, productRoutes); // Routes pour les produits
app.use("/api/movements", auth, movementRoutes); // Routes pour les mouvements
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "L'API de gestion de stock fonctionne" });
});

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error(
      "JWT_SECRET manquant. Fichier .env cherché ici : " + path.join(__dirname, ".env")
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connecté à MongoDB");
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error.message);
    process.exit(1);
  }
}
start();