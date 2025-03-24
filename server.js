require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Middleware
app.use(cors());
app.use(bodyParser.json());

// 📌 Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static("public"));

// 🔹 Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Connecté à MongoDB"))
  .catch((err) => {
    console.error("🔴 Erreur de connexion à MongoDB:", err);
    process.exit(1); // Stoppe le serveur en cas d'erreur critique
  });

// 🔹 Routes API
const taskRoutes = require("./routes/taskRoutes");
app.use("/tasks", taskRoutes);

// 🔹 Route par défaut (Gestion des erreurs 404)
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route non trouvée" });
});

// 🔹 Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
