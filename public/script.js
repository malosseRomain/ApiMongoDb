const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");

// Charger les tâches au démarrage
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
  setMinDate(); // Définir la date min à l'ouverture de la page

  const sortBySelect = document.getElementById("sortBy");
  const sortOrderBtn = document.getElementById("sortOrder");
  let isAscending = true; // Par défaut, tri croissant

  // Fonction pour trier et mettre à jour l'affichage
  function sortTasks() {
    const tasks = Array.from(document.querySelectorAll("#taskList li")); // Récupère toutes les tâches
    const sortBy = sortBySelect.value;
    const order = isAscending ? 1 : -1; // Détermine l'ordre du tri

    tasks.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case "echeance":
          valueA = new Date(a.dataset.echeance || "9999-12-31");
          valueB = new Date(b.dataset.echeance || "9999-12-31");
          break;
        case "priorite":
          const priorities = { basse: 1, moyenne: 2, haute: 3, critique: 4 };
          valueA = priorities[a.dataset.priorite] || 0;
          valueB = priorities[b.dataset.priorite] || 0;
          break;
        case "dateCreation":
          valueA = new Date(a.dataset.dateCreation || "9999-12-31");
          valueB = new Date(b.dataset.dateCreation || "9999-12-31");
          break;
        default:
          return 0;
      }

      return (valueA > valueB ? 1 : -1) * order;
    });

    // Réinsère les tâches triées dans la liste
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    tasks.forEach((task) => taskList.appendChild(task));
  }

  // Changement d'ordre croissant/décroissant
  sortOrderBtn.addEventListener("click", () => {
    isAscending = !isAscending;
    sortOrderBtn.textContent = isAscending ? "⬆️" : "⬇️";
    sortTasks();
  });

  // Tri lorsqu'on change le critère
  sortBySelect.addEventListener("change", sortTasks);
});

// Fonction pour définir la date minimum sur les champs de date
function setMinDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("echeance").min = today;

  document.querySelectorAll(".sous-tache-echeance").forEach((input) => {
    input.min = today;
  });
}

async function fetchTasks() {
  try {
    // Récupérer les valeurs des filtres
    const statut = document.getElementById("filterStatut").value || "";
    const priorite = document.getElementById("filterPriorite").value || "";
    const categorie = document.getElementById("filterCategorie").value.trim();
    const etiquette = document.getElementById("filterEtiquette").value.trim();
    const recherche = document.getElementById("filterRecherche").value.trim();
    const tri = document.getElementById("sortBy").value || "";
    const ordre = isAscending ? "asc" : "desc";

    let echeanceAvant = document.getElementById("filterEcheance").value;
    let echeanceApres = document.getElementById("filterApres").value;

    // ✅ Vérification des dates avant envoi
    if (echeanceAvant) {
      echeanceAvant = new Date(echeanceAvant).toISOString(); // Format correct pour MongoDB
    }
    if (echeanceApres) {
      echeanceApres = new Date(echeanceApres).toISOString();
    }

    console.log("Filtres envoyés :", { echeanceAvant, echeanceApres }); // Vérifier dans la console

    // Construire l'URL des filtres
    let params = new URLSearchParams();
    if (statut) params.append("statut", statut);
    if (priorite) params.append("priorite", priorite);
    if (categorie) params.append("categorie", categorie);
    if (etiquette) params.append("etiquette", etiquette);
    if (recherche) params.append("q", recherche);
    if (echeanceAvant) params.append("avant", echeanceAvant);
    if (echeanceApres) params.append("apres", echeanceApres);
    if (tri) {
      params.append("tri", tri);
      params.append("ordre", ordre);
    }

    const url = `/tasks?${params.toString()}`;

    // Appel API avec les filtres
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur serveur");
    const tasks = await response.json();

    displayTasks(tasks);
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches :", err);
  }
}

// Afficher les tâches dans un tableau
function displayTasks(tasks) {
  taskList.innerHTML = ""; // Vider la liste avant d'ajouter les tâches

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-container");

    // 📌 Formatage de la date d'échéance
    let echeance = task.echeance
      ? new Date(task.echeance).toLocaleDateString()
      : "Aucune";

    li.innerHTML = `
      <h3>${task.titre}</h3>
      <p><strong>Auteur :</strong> ${task.auteur?.prenom || "Inconnu"} ${
      task.auteur?.nom || ""
    }</p>
      <p><strong>Échéance :</strong> ${echeance}</p>
      <p><strong>Priorité :</strong> ${task.priorite}</p>
      <p><em>${task.statut}</em></p>

      <div class="task-buttons">
        <button class="btn-green" onclick="viewTask('${
          task._id
        }')">Voir</button>
        <button class="btn-green" onclick="editTask('${task._id}', '${
      task.titre
    }', '${task.statut}', '${task.priorite}')">Modifier</button>
        <button class="btn-red" onclick="deleteTask('${
          task._id
        }')">Supprimer</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Voir les détails d'une tâche
function viewTask(taskId) {
  window.location.href = `taskDetails.html?id=${taskId}`;
}

// Réinitialiser complètement le formulaire après soumission
function resetForm() {
  taskForm.reset(); // Réinitialise les champs texte et sélection

  // Vider les sous-tâches et commentaires
  document.getElementById("sousTachesContainer").innerHTML = "";
  document.getElementById("commentairesContainer").innerHTML = "";

  // Supprimer l'ID de la tâche pour éviter d'écraser une tâche existante
  delete taskForm.dataset.taskId;

  // Remettre le bouton à "Ajouter"
  document.querySelector("#taskForm button[type='submit']").textContent =
    "Ajouter";

  // Re-définir la date minimum pour éviter des dates passées
  setMinDate();
}

// Supprimer une tâche
async function deleteTask(taskId) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    await fetch(`/tasks/${taskId}`, { method: "DELETE" });
    fetchTasks();
  }
}

// Ajouter ou Modifier une tâche
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const taskId = taskForm.dataset.taskId; // Vérifie si on modifie une tâche existante
  const taskData = {
    titre: document.getElementById("titre").value,
    description: document.getElementById("description").value,
    statut: document.getElementById("statut").value,
    categorie: document.getElementById("categorie").value,
    priorite: document.getElementById("priorite").value,
    auteur: {
      nom: document.getElementById("auteurNom").value,
      prenom: document.getElementById("auteurPrenom").value,
      email: document.getElementById("auteurEmail").value,
    },
    etiquettes: document
      .getElementById("etiquettes")
      .value.split(",")
      .map((e) => e.trim()),
    echeance: document.getElementById("echeance").value,

    // Sous-tâches avec priorité, échéance et statut
    sousTaches: Array.from(
      document.querySelectorAll(".sous-tache-container")
    ).map((container) => ({
      titre: container.querySelector(".sous-tache-titre").value.trim(),
      statut: container.querySelector(".sous-tache-statut").value,
      priorite: container.querySelector(".sous-tache-priorite").value,
      echeance: container.querySelector(".sous-tache-echeance").value,
    })),

    // Commentaires
    commentaires: Array.from(
      document.querySelectorAll(".commentaire-container")
    ).map((container) => ({
      contenu: container.querySelector(".commentaire").value.trim(),
      auteur: container.querySelector(".auteur").value.trim(), // Récupérer l'auteur spécifique
    })),
  };

  // Vérifie si on est dans un mode de modification ou d'ajout
  if (taskId) {
    await fetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    alert("Tâche modifier avec succès !");
  } else {
    await fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    alert("Tâche ajouter avec succès !");
  }

  resetForm(); // Réinitialiser le formulaire après ajout ou modification
  fetchTasks(); // Recharger la liste des tâches
});

// Ajouter une sous-tâche dynamiquement avec priorité, échéance et statut
document.getElementById("ajouterSousTache").addEventListener("click", () => {
  const container = document.getElementById("sousTachesContainer");
  const today = new Date().toISOString().split("T")[0]; // Date actuelle

  const sousTacheDiv = document.createElement("div");
  sousTacheDiv.className = "sous-tache-container";

  sousTacheDiv.innerHTML = `
    <input type="text" class="sous-tache-titre" placeholder="Titre de la sous-tâche">
    <select class="sous-tache-statut">
      <option value="à faire">À faire</option>
      <option value="en cours">En cours</option>
      <option value="terminé">Terminé</option>
    </select>
    <input type="date" class="sous-tache-echeance" min="${today}">
    <button type="button" class="supprimerSousTache">❌</button>
  `;

  // Supprimer la sous-tâche
  sousTacheDiv
    .querySelector(".supprimerSousTache")
    .addEventListener("click", () => {
      sousTacheDiv.remove();
    });

  container.appendChild(sousTacheDiv);
});

document.getElementById("ajouterCommentaire").addEventListener("click", () => {
  const container = document.getElementById("commentairesContainer");

  const divComment = document.createElement("div");
  divComment.className = "commentaire-container";

  divComment.innerHTML = `
    <input type="text" class="auteur" id="auteurPrenom" placeholder="Auteur">
    <input type="text" class="commentaire" placeholder="Ajouter un commentaire...">
    <button type="button" class="supprimerCommentaire">❌</button>
  `;

  // Supprimer un commentaire ajouté dynamiquement
  divComment
    .querySelector(".supprimerCommentaire")
    .addEventListener("click", () => {
      divComment.remove();
    });

  container.appendChild(divComment);
});

// Modifier une tâche (remplit le formulaire avec les données existantes)
async function editTask(id) {
  try {
    const response = await fetch(`/tasks/${id}`);
    const task = await response.json();

    console.log(task.sousTaches); // Vérifiez si l'échéance est bien renvoyée

    // Remplir les champs du formulaire
    document.getElementById("titre").value = task.titre;
    document.getElementById("description").value = task.description || "";
    document.getElementById("statut").value = task.statut;
    document.getElementById("categorie").value = task.categorie || "";
    document.getElementById("priorite").value = task.priorite;
    document.getElementById("echeance").value = task.echeance
      ? new Date(task.echeance).toISOString().split("T")[0]
      : "";

    document.getElementById("auteurNom").value = task.auteur?.nom || "";
    document.getElementById("auteurPrenom").value = task.auteur?.prenom || "";
    document.getElementById("auteurEmail").value = task.auteur?.email || "";
    document.getElementById("etiquettes").value = task.etiquettes
      ? task.etiquettes.join(", ")
      : "";

    // Supprimer les anciennes sous-tâches et commentaires affichés
    const sousTachesContainer = document.getElementById("sousTachesContainer");
    const commentairesContainer = document.getElementById(
      "commentairesContainer"
    );
    sousTachesContainer.innerHTML = "";
    commentairesContainer.innerHTML = "";

    // Ajouter les sous-tâches existantes
    if (task.sousTaches && task.sousTaches.length > 0) {
      task.sousTaches.forEach((sousTache) => {
        const sousTacheDiv = document.createElement("div");
        sousTacheDiv.className = "sous-tache-container";

        sousTacheDiv.innerHTML = `
          <input type="text" class="sous-tache-titre" value="${
            sousTache.titre
          }" placeholder="Titre de la sous-tâche">
          <select class="sous-tache-priorite">
            <option value="Basse" ${
              sousTache.priorite === "Basse" ? "selected" : ""
            }>Basse</option>
            <option value="Moyenne" ${
              sousTache.priorite === "Moyenne" ? "selected" : ""
            }>Moyenne</option>
            <option value="Haute" ${
              sousTache.priorite === "Haute" ? "selected" : ""
            }>Haute</option>
            <option value="Critique" ${
              sousTache.priorite === "Critique" ? "selected" : ""
            }>Critique</option>
          </select>
          <select class="sous-tache-statut">
            <option value="à faire" ${
              sousTache.statut === "à faire" ? "selected" : ""
            }>À faire</option>
            <option value="en cours" ${
              sousTache.statut === "en cours" ? "selected" : ""
            }>En cours</option>
            <option value="terminé" ${
              sousTache.statut === "terminé" ? "selected" : ""
            }>Terminé</option>
          </select>
          <input type="date" class="sous-tache-echeance" value="${
            sousTache.echeance
              ? new Date(sousTache.echeance).toISOString().split("T")[0]
              : ""
          }" min="${new Date().toISOString().split("T")[0]}">
          <button type="button" class="supprimerSousTache">❌</button>
        `;

        // Ajouter un gestionnaire pour supprimer la sous-tâche
        sousTacheDiv
          .querySelector(".supprimerSousTache")
          .addEventListener("click", () => {
            sousTacheDiv.remove();
          });

        sousTachesContainer.appendChild(sousTacheDiv);
      });
    }

    // Ajouter les commentaires existants
    if (task.commentaires && task.commentaires.length > 0) {
      task.commentaires.forEach((commentaire) => {
        const commentaireDiv = document.createElement("div");
        commentaireDiv.className = "commentaire-container";

        commentaireDiv.innerHTML = `
      <input type="text" class="auteur" value="${
        commentaire.auteur || ""
      }" placeholder="Auteur">
      <input type="text" class="commentaire" value="${
        commentaire.contenu
      }" placeholder="Ajouter un commentaire...">
      <button type="button" class="supprimerCommentaire">❌</button>
    `;

        // Ajouter un gestionnaire pour supprimer le commentaire
        commentaireDiv
          .querySelector(".supprimerCommentaire")
          .addEventListener("click", () => {
            commentaireDiv.remove();
          });

        commentairesContainer.appendChild(commentaireDiv);
      });
    }

    // Mettre l'ID de la tâche dans le formulaire pour la modification
    taskForm.dataset.taskId = id;

    document.querySelector("#taskForm button[type='submit']").textContent =
      "Mettre à jour";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Passer en mode modification
    document.getElementById("addTaskBtn").style.display = "none";
    document.getElementById("updateTaskBtn").style.display = "inline-block";
  } catch (err) {
    console.error("Erreur lors de la récupération de la tâche :", err);
  }
}

function getTaskDataFromForm() {
  return {
    titre: document.getElementById("titre").value,
    description: document.getElementById("description").value,
    statut: document.getElementById("statut").value,
    categorie: document.getElementById("categorie").value,
    priorite: document.getElementById("priorite").value,
    auteur: {
      nom: document.getElementById("auteurNom").value,
      prenom: document.getElementById("auteurPrenom").value,
      email: document.getElementById("auteurEmail").value,
    },
    etiquettes: document
      .getElementById("etiquettes")
      .value.split(",")
      .map((e) => e.trim()),
    echeance: document.getElementById("echeance").value,
    sousTaches: Array.from(
      document.querySelectorAll(".sous-tache-container")
    ).map((container) => ({
      titre: container.querySelector(".sous-tache-titre").value.trim(),
      statut: container.querySelector(".sous-tache-statut").value,
      priorite: container.querySelector(".sous-tache-priorite").value,
      echeance: container.querySelector(".sous-tache-echeance").value,
    })),
    commentaires: Array.from(
      document.querySelectorAll(".commentaire-container")
    ).map((container) => ({
      contenu: container.querySelector(".commentaire").value.trim(),
      auteur: container.querySelector(".auteur").value.trim(),
    })),
  };
}

document.getElementById("updateTaskBtn").addEventListener("click", async () => {
  const taskId = taskForm.dataset.taskId;
  if (!taskId) {
    console.error("Aucune tâche sélectionnée pour modification.");
    return;
  }

  const taskData = getTaskDataFromForm();

  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok)
      throw new Error("Erreur lors de la mise à jour de la tâche");

    alert("Tâche mise à jour avec succès !");
    resetForm();
    fetchTasks();
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err);
  }
});

// Appliquer le filtrage quand on clique sur "Filtrer"
document.getElementById("applyFilter").addEventListener("click", (e) => {
  e.preventDefault();
  fetchTasks();
});

// Gestion du tri et rechargement des tâches
let isAscending = true;
document.getElementById("sortOrder").addEventListener("click", (e) => {
  e.preventDefault();
  isAscending = !isAscending;
  fetchTasks(); // Rafraîchir les tâches avec le nouvel ordre

  document.getElementById("sortOrder").textContent = isAscending ? "⬆️" : "⬇️";
});

// Toggle (montrer/cacher) le menu des filtres
document.getElementById("toggleFilters").addEventListener("click", function () {
  const menu = document.getElementById("filterMenu");
  if (menu.classList.contains("show")) {
    menu.classList.remove("show");
    this.textContent = "🔍 Afficher les filtres";
  } else {
    menu.classList.add("show");
    this.textContent = "❌ Masquer les filtres";
  }
});

// Charger les tâches au démarrage
fetchTasks();
