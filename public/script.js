const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");

// 🔹 Récupérer les tâches et les afficher
async function fetchTasks() {
  const response = await fetch("/tasks");
  const tasks = await response.json();
  displayTasks(tasks);
}

// 🔹 Afficher les tâches dans un tableau
function displayTasks(tasks) {
  taskList.innerHTML = ""; // Vider la liste avant d'ajouter les tâches

  tasks.forEach((task) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${task.titre}</td>
      <td>${task.statut}</td>
      <td>${task.priorite || "Moyenne"}</td>
      <td>
        <button onclick="viewTask('${task._id}')">Voir</button>
        <button onclick="deleteTask('${task._id}')">Supprimer</button>
      </td>
    `;
    taskList.appendChild(tr);
  });
}

// 🔹 Voir les détails d'une tâche
function viewTask(taskId) {
  window.location.href = `taskDetails.html?id=${taskId}`;
}

// 🔹 Ajouter une nouvelle tâche
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newTask = {
    titre: document.getElementById("titre").value,
    description: document.getElementById("description").value,
    statut: document.getElementById("statut").value,
    categorie: document.getElementById("categorie").value,
    priorite: "moyenne",
    auteur: { nom: "Inconnu", prenom: "Inconnu", email: "" },
  };

  await fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });

  taskForm.reset();
  fetchTasks();
});

// 🔹 Supprimer une tâche
async function deleteTask(taskId) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    await fetch(`/tasks/${taskId}`, { method: "DELETE" });
    fetchTasks();
  }
}

// Charger les tâches au démarrage
fetchTasks();
