const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  dateCreation: { type: Date, default: Date.now },
  echeance: { type: Date, required: false },
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
  categorie: { type: String, required: true },
  etiquettes: { type: [String], default: [] },
  sousTaches: [
    {
      titre: String,
      statut: { type: String, enum: ["à faire", "en cours", "terminée"] },
      echeance: Date,
    },
  ],
  commentaires: [
    {
      auteur: { nom: String, prenom: String, email: String },
      date: { type: Date, default: Date.now },
      contenu: String,
    },
  ],
  historiqueModifications: [
    {
      champModifie: String,
      ancienneValeur: String,
      nouvelleValeur: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Task", TaskSchema);
