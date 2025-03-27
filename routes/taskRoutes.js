const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// 🟢 GET /tasks - Récupérer toutes les tâches avec filtres et tri
router.get("/", async (req, res) => {
  try {
    let query = {};

    // Filtres
    if (req.query.statut) query.statut = req.query.statut;
    if (req.query.priorite) query.priorite = req.query.priorite;
    if (req.query.categorie)
      query.categorie = { $regex: req.query.categorie, $options: "i" };
    if (req.query.etiquette) query.etiquettes = { $in: [req.query.etiquette] };

    // Filtre sur les dates
    if (req.query.avant) query.echeance = { $lte: new Date(req.query.avant) };
    if (req.query.apres) query.echeance = { $gte: new Date(req.query.apres) };

    // Recherche par texte libre
    if (req.query.q) {
      query.$or = [
        { titre: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } },
      ];
    }

    // Récupération des tâches
    let tasks = await Task.find(query);

    // Tri
    if (req.query.tri) {
      const sortField = req.query.tri;
      const sortOrder = req.query.ordre === "desc" ? -1 : 1;

      // Tri par date d'échéance, priorité, ou date de création
      tasks = tasks.sort((a, b) => {
        if (sortField === "echeance") {
          return (new Date(a.echeance) - new Date(b.echeance)) * sortOrder;
        }
        if (sortField === "priorite") {
          const priorites = ["basse", "moyenne", "haute", "critique"];
          return (
            (priorites.indexOf(a.priorite) - priorites.indexOf(b.priorite)) *
            sortOrder
          );
        }
        if (sortField === "dateCreation") {
          return (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder;
        }
        return 0;
      });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 GET /tasks/:id - Récupérer une tâche par ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➕ POST /tasks - Ajouter une nouvelle tâche
router.post("/", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✏️ PUT /tasks/:id - Modifier une tâche existante
router.put("/:id", async (req, res) => {
  try {
    const { titre, description, statut, priorite, auteur } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    // Création d'un objet historique de modification
    const modification = {
      date: new Date(),
      modifiePar: auteur?.nom || "Utilisateur inconnu",
      changements: `Modifications : ${titre ? "titre=" + titre : ""} ${
        statut ? "statut=" + statut : ""
      } ${priorite ? "priorite=" + priorite : ""}`.trim(),
    };

    // Mise à jour des champs, sans écraser l'historique
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $set: { titre, description, statut, priorite },
        $push: { historiqueModifications: modification }, // Ajout à l'historique
      },
      { new: true }
    );

    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ❌ DELETE /tasks/:id - Supprimer une tâche
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ message: "Tâche non trouvée" });
    res.status(200).json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📝 Ajout des sous-tâches
router.post("/:id/sous-tache", async (req, res) => {
  try {
    const { titre, statut, echeance } = req.body;
    if (!titre || !statut) {
      return res.status(400).json({ message: "Titre et statut sont requis" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    task.sousTaches.push({ titre, statut, echeance: echeance || null });
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📝 Ajout des commentaires
router.post("/:id/commentaire", async (req, res) => {
  try {
    const { auteur, contenu } = req.body;
    if (!auteur || !contenu) {
      return res.status(400).json({ message: "Auteur et contenu sont requis" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    task.commentaires.push({ auteur, contenu, date: new Date() });
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🕒 Récupérer l'historique des modifications
router.get("/:id/historique", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    res.status(200).json(task.historique);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
