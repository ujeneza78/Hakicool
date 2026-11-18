import "dotenv/config";// Chargement des variables d'environnement depuis le fichier .env
import express from "express";// Import d'Express pour créer le serveur
import cors from "cors";//pour connect a l'API depuis le frontend
import mongoose from "mongoose";// Import de Mongoose pour la connexion à MongoDB
import productRoutes from "./routes/products.js"; // Import des routes pour les produits
import movementRoutes from "./routes/movements.js";// Import des routes pour les mouvements


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes); // Utilisation des routes pour les produits
app.use("/api/movements", movementRoutes); // Utilisation des routes pour les mouvements

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "L'API de gestion de stock fonctionne" });
});

async function start() {
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