const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");

// 🔹 Charger les tâches au démarrage
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
});

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
      <p><strong>Auteur :</strong> ${task.auteur.prenom} ${task.auteur.nom}</p>
      <p><strong>Échéance :</strong> ${echeance}</p>
      <p><em>${task.statut} - Priorité: ${task.priorite}</em></p>

      <div class="task-buttons">
        <button class="btn-green" onclick="viewTask('${task._id}')">Voir</button>
        <button class="btn-green" onclick="editTask('${task._id}', '${task.titre}', '${task.statut}', '${task.priorite}')">Modifier</button>
        <button class="btn-red" onclick="deleteTask('${task._id}')">Supprimer</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// 🔹 Voir les détails d'une tâche
function viewTask(taskId) {
  window.location.href = `taskDetails.html?id=${taskId}`;
}

// 🔹 Ajouter ou Modifier une tâche
// 🔹 Ajouter ou Modifier une tâche
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

    // Sous-tâches : collecter les sous-tâches sous forme de tableau d'objets
    sousTaches: Array.from(document.querySelectorAll(".sous-tache")).map(
      (input) => ({
        titre: input.value.trim(),
        statut: "à faire", // Par défaut, en attente
        echeance: null, // Tu peux ajouter un champ échéance pour chaque sous-tâche si nécessaire
      })
    ),

    // Commentaires : collecter les commentaires sous forme de tableau d'objets
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
    delete taskForm.dataset.taskId; // Réinitialiser l'ID de la tâche modifiée
    document.querySelector("#taskForm button[type='submit']").textContent =
      "Ajouter"; // Remettre le texte du bouton à "Ajouter"
  } else {
    await fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  }

  taskForm.reset(); // Réinitialiser le formulaire après soumission
  fetchTasks(); // Recharger la liste des tâches
});

// 🔹 Ajouter une sous-tâche dynamiquement
document.getElementById("ajouterSousTache").addEventListener("click", () => {
  const container = document.getElementById("sousTachesContainer");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "sous-tache";
  input.placeholder = "Nouvelle sous-tâche";
  container.appendChild(input);
});

// 🔹 Ajouter un commentaire dynamiquement
document.getElementById("ajouterCommentaire").addEventListener("click", () => {
  const container = document.getElementById("commentairesContainer");
  const input = document.createElement("textarea");
  input.className = "commentaire";
  input.placeholder = "Ajouter un commentaire...";
  container.appendChild(input);
});

// 🔹 Modifier une tâche (remplit le formulaire)
function editTask(id, titre, statut, priorite) {
  document.getElementById("titre").value = titre;
  document.getElementById("statut").value = statut;
  document.getElementById("priorite").value = priorite;

  taskForm.dataset.taskId = id; // Stocker l'ID de la tâche à modifier
  document.querySelector("#taskForm button[type='submit']").textContent =
    "Mettre à jour";
}

// 🔹 Supprimer une tâche
async function deleteTask(taskId) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    await fetch(`/tasks/${taskId}`, { method: "DELETE" });
    fetchTasks(); // Recharge la liste
  }
}

// 🚀 Charger les tâches au démarrage
fetchTasks();
