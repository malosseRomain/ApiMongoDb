const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");

// 🔹 Charger les tâches au démarrage
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
  setMinDate(); // Définir la date min à l'ouverture de la page
});

// 🔹 Fonction pour définir la date minimum sur les champs de date
function setMinDate() {
  const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
  document.getElementById("echeance").min = today; // Échéance principale

  document.querySelectorAll(".sous-tache-echeance").forEach((input) => {
    input.min = today;
  });
}

// 🔹 Fonction async pour récupérer les tâches et les afficher via displayTasks()
async function fetchTasks() {
  try {
    const response = await fetch("/tasks");
    const tasks = await response.json();
    displayTasks(tasks);
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches :", err);
  }
}

// 🔹 Afficher les tâches dans un tableau
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

// 🔹 Voir les détails d'une tâche
function viewTask(taskId) {
  window.location.href = `taskDetails.html?id=${taskId}`;
}

// 🔹 Réinitialiser complètement le formulaire après soumission
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

// 🔹 Ajouter ou Modifier une tâche (avec reset après confirmation)
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
    commentaires: Array.from(document.querySelectorAll(".commentaire")).map(
      (input) => ({
        auteur: `${document.getElementById("auteurPrenom").value} ${
          document.getElementById("auteurNom").value
        }`,
        contenu: input.value.trim(),
        date: new Date().toISOString(),
      })
    ),
  };

  // Vérifie si on est dans un mode de modification ou d'ajout
  if (taskId) {
    await fetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  } else {
    await fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  }

  resetForm(); // 🔹 Réinitialiser le formulaire après ajout ou modification
  fetchTasks(); // Recharger la liste des tâches
});

// 🔹 Ajouter une sous-tâche dynamiquement avec priorité, échéance et statut
document.getElementById("ajouterSousTache").addEventListener("click", () => {
  const container = document.getElementById("sousTachesContainer");
  const today = new Date().toISOString().split("T")[0]; // Date actuelle

  const sousTacheDiv = document.createElement("div");
  sousTacheDiv.className = "sous-tache-container";

  sousTacheDiv.innerHTML = `
    <input type="text" class="sous-tache-titre" placeholder="Titre de la sous-tâche">
    <select class="sous-tache-priorite">
      <option value="Basse">Basse</option>
      <option value="Moyenne">Moyenne</option>
      <option value="Haute">Haute</option>
      <option value="Critique">Critique</option>
    </select>
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

// 🔹 Ajouter un commentaire dynamiquement avec un bouton de suppression
document.getElementById("ajouterCommentaire").addEventListener("click", () => {
  const container = document.getElementById("commentairesContainer");

  const divComment = document.createElement("div");
  divComment.className = "commentaire-container";

  divComment.innerHTML = `
    <input type="text" class="commentaire" placeholder="Ajouter un commentaire..."></input>
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

// 🔹 Modifier une tâche (remplit le formulaire avec les données existantes)
async function editTask(id) {
  try {
    const response = await fetch(`/tasks/${id}`);
    const task = await response.json();

    // Remplir les champs du formulaire
    document.getElementById("titre").value = task.titre;
    document.getElementById("description").value = task.description || "";
    document.getElementById("statut").value = task.statut;
    document.getElementById("categorie").value = task.categorie || "";
    document.getElementById("priorite").value = task.priorite;
    document.getElementById("echeance").value = task.echeance
      ? new Date(task.echeance).toISOString().split("T")[0]
      : "";

    // Remplir les infos de l'auteur
    document.getElementById("auteurNom").value = task.auteur?.nom || "";
    document.getElementById("auteurPrenom").value = task.auteur?.prenom || "";
    document.getElementById("auteurEmail").value = task.auteur?.email || "";

    // Remplir les étiquettes
    document.getElementById("etiquettes").value = task.etiquettes
      ? task.etiquettes.join(", ")
      : "";

    // Supprimer les anciennes sous-tâches et commentaires affichés
    document.getElementById("sousTachesContainer").innerHTML = "";
    document.getElementById("commentairesContainer").innerHTML = "";

    // Ajouter dynamiquement les sous-tâches
    if (Array.isArray(task.sousTaches)) {
      task.sousTaches.forEach((sousTache) => {
        const today = new Date().toISOString().split("T")[0];

        const sousTacheDiv = document.createElement("div");
        sousTacheDiv.className = "sous-tache-container";

        sousTacheDiv.innerHTML = `
          <input type="text" class="sous-tache-titre" value="${
            sousTache.titre
          }">
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
          <input type="date" class="sous-tache-echeance" min="${today}" value="${
          sousTache.echeance
            ? new Date(sousTache.echeance).toISOString().split("T")[0]
            : ""
        }">
          <button type="button" class="supprimerSousTache">❌</button>
        `;

        sousTacheDiv
          .querySelector(".supprimerSousTache")
          .addEventListener("click", () => {
            sousTacheDiv.remove();
          });

        document
          .getElementById("sousTachesContainer")
          .appendChild(sousTacheDiv);
      });
    }

    // Ajouter dynamiquement les commentaires
    if (Array.isArray(task.commentaires)) {
      task.commentaires.forEach((commentaire) => {
        const divComment = document.createElement("div");
        divComment.className = "commentaire-container";

        divComment.innerHTML = `
          <textarea class="commentaire">${commentaire.contenu}</textarea>
          <button type="button" class="supprimerCommentaire">❌</button>
        `;

        divComment
          .querySelector(".supprimerCommentaire")
          .addEventListener("click", () => {
            divComment.remove();
          });

        document
          .getElementById("commentairesContainer")
          .appendChild(divComment);
      });
    }

    // Mettre l'ID de la tâche dans le formulaire pour la modification
    taskForm.dataset.taskId = id;
    document.querySelector("#taskForm button[type='submit']").textContent =
      "Mettre à jour";

    setMinDate(); // S'assurer que les dates ne peuvent pas être passées
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Erreur lors de la récupération de la tâche :", err);
  }
}

// 🔹 Supprimer une tâche
async function deleteTask(taskId) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    await fetch(`/tasks/${taskId}`, { method: "DELETE" });
    fetchTasks();
  }
}

document.getElementById("applyFilter").addEventListener("click", () => {
  fetchTasks();
});

// 🔹 Modifier `fetchTasks()` pour inclure les filtres
async function fetchTasks() {
  try {
    // Récupérer les valeurs des filtres
    const statut = document.getElementById("filterStatut").value;
    const priorite = document.getElementById("filterPriorite").value;
    const categorie = document.getElementById("filterCategorie").value;
    const etiquette = document.getElementById("filterEtiquette").value;
    const echeanceAvant = document.getElementById("filterEcheance").value;
    const tri = document.getElementById("sortBy").value;

    // Construire l'URL des filtres
    let url = "/tasks?";
    if (statut) url += `statut=${encodeURIComponent(statut)}&`;
    if (priorite) url += `priorite=${encodeURIComponent(priorite)}&`;
    if (categorie) url += `categorie=${encodeURIComponent(categorie)}&`;
    if (etiquette) url += `etiquette=${encodeURIComponent(etiquette)}&`;
    if (echeanceAvant) url += `avant=${encodeURIComponent(echeanceAvant)}&`;
    if (tri) url += `tri=${encodeURIComponent(tri)}&ordre=asc`; // Ordre par défaut ascendant

    // Appel API avec les filtres
    const response = await fetch(url);
    const tasks = await response.json();

    // Afficher les tâches
    displayTasks(tasks);
  } catch (err) {
    console.error("Erreur lors de la récupération des tâches :", err);
  }
}

// 🔹 Toggle (montrer/cacher) le menu des filtres
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

// 🚀 Charger les tâches au démarrage
fetchTasks();
