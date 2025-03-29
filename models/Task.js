const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  dateCreation: { type: Date, default: Date.now },
  echeance: { type: Date },
  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
    default: "à faire",
  },
  priorite: {
    type: String,
    enum: ["basse", "moyenne", "haute", "critique"],
    default: "moyenne",
  },
  auteur: {
    nom: String,
    prenom: String,
    email: String,
  },
  categorie: String,
  etiquettes: [String],
  sousTaches: [
    {
      titre: String,
      statut: { type: String, enum: ["à faire", "en cours", "terminée"] },
      echeance: Date,
    },
  ],
  commentaires: [
    {
      auteur: String,
      date: { type: Date, default: Date.now },
      contenu: String,
    },
  ],
  historiqueModifications: [
    {
      champModifie: String,
      ancienneValeur: mongoose.Schema.Types.Mixed, // Accepte tout type de données
      nouvelleValeur: mongoose.Schema.Types.Mixed, // Accepte tout type de données
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Task", TaskSchema);
