const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// 🟢 GET /tasks - Récupérer toutes les tâches avec filtres et tri
router.get("/", async (req, res) => {
  try {
    let query = {};

    if (req.query.statut) query.statut = req.query.statut;
    if (req.query.priorite) query.priorite = req.query.priorite;
    if (req.query.categorie) query.categorie = req.query.categorie;
    if (req.query.etiquette) query.etiquettes = req.query.etiquette;
    if (req.query.avant) query.echeance = { $lt: new Date(req.query.avant) };
    if (req.query.apres) query.echeance = { $gt: new Date(req.query.apres) };

    if (req.query.q)
      query.$or = [
        { titre: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } },
      ];

    let sort = {};
    if (req.query.tri)
      sort[req.query.tri] = req.query.ordre === "desc" ? -1 : 1;

    const tasks = await Task.find(query).sort(sort);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 POST /tasks/:id/sous-tache - Ajouter une sous-tâche
router.post("/:id/sous-tache", async (req, res) => {
  try {
    const { titre, statut, echeance } = req.body;

    // Validation des champs
    if (!titre || !statut) {
      return res
        .status(400)
        .json({ message: "Titre et statut sont requis pour une sous-tâche" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    // Ajout de la sous-tâche à la tâche
    task.sousTaches.push({ titre, statut, echeance: echeance || null });
    await task.save();

    res.status(201).json(task); // Retourner la tâche mise à jour
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 POST /tasks/:id/commentaire - Ajouter un commentaire
router.post("/:id/commentaire", async (req, res) => {
  try {
    const { auteur, contenu } = req.body;

    // Validation des champs
    if (!auteur || !contenu) {
      return res
        .status(400)
        .json({ message: "Auteur et contenu sont requis pour un commentaire" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    // Ajout du commentaire à la tâche
    task.commentaires.push({ auteur, contenu, date: new Date() });
    await task.save();

    res.status(201).json(task); // Retourner la tâche mise à jour
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔍 GET /tasks/:id - Récupérer une tâche par ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    console.log("Tâche récupérée :", JSON.stringify(task, null, 2)); // 🟢 Vérification console
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

// ✏️ PUT /tasks/:id - Modifier une tâche
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTask)
      return res.status(404).json({ message: "Tâche non trouvée" });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

module.exports = router;
