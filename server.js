require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 📌 Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static("public"));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Connecté à MongoDB"))
  .catch((err) => console.log("🔴 Erreur MongoDB:", err));

// Routes API
const taskRoutes = require("./routes/taskRoutes");
app.use("/tasks", taskRoutes);

// Démarrer le serveur
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
