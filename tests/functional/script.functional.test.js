const fs = require('fs');
const path = require('path');

// 1. Simuler le DOM avec jsdom
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <form id="taskForm">
        <input id="titre" value="Test" />
        <button type="submit">Ajouter</button>
      </form>
      <ul id="taskList"></ul>
    </body>
  </html>
`);

// 2. Exposer les objets globaux (window, document, etc.)
global.window = dom.window;
global.document = dom.window.document;

// 3. Importer les fonctions originales de script.js
const { fetchTasks, displayTasks } = require('../../public/script.js');

describe("fetchTasks", () => {
  beforeEach(() => {
    // Mock de fetch pour simuler une réponse réussie
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ titre: "Tâche test", statut: "à faire" }]),
      })
    );
    document.body.innerHTML = '<ul id="taskList"></ul>';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("devrait afficher les tâches après un appel réussi à l'API", async () => {
    await fetchTasks();
    // Vérifie que le DOM contient la tâche mockée
    expect(document.getElementById("taskList").innerHTML).toContain("Tâche test");
  });

  it("devrait gérer les erreurs d'API", async () => {
    // Mock de fetch pour simuler une erreur
    global.fetch.mockImplementationOnce(() => Promise.reject("Erreur API"));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await fetchTasks();
    // Vérifie que console.error a été appelé
    expect(console.error).toHaveBeenCalledWith("Erreur lors de la récupération des tâches :", "Erreur API");
    console.error.mockRestore();
  });
});

describe("Gestion du formulaire de tâche", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="taskForm">
        <input id="titre" value="Tâche test" />
        <button type="submit">Ajouter</button>
      </form>
      <ul id="taskList"></ul>
    `;
    // Mock de fetch pour simuler une réponse réussie
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    // Mock de la fonction submit pour éviter le comportement par défaut
    document.getElementById("taskForm").submit = jest.fn();
  });

  it("devrait soumettre le formulaire et réinitialiser les champs", async () => {
    const form = document.getElementById("taskForm");
    const submitEvent = new Event("submit");
    await form.dispatchEvent(submitEvent);
    // Vérifie que fetch a été appelé
    expect(fetch).toHaveBeenCalled();
  });
});

describe("Gestion du thème sombre", () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="themeToggle">🌙 Mode Sombre</button>';
    // Mock de localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
  });

  it("devrait basculer entre les thèmes au clic", () => {
    const themeToggle = document.getElementById("themeToggle");
    themeToggle.click();
    // Vérifie que localStorage.setItem a été appelé
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });
});

beforeAll(() => {
  // Configuration globale de localStorage
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
});

describe("Test du formulaire de tâche", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="taskForm">
        <input id="titre" value="Tâche test" />
        <button type="submit">Ajouter</button>
      </form>
      <ul id="taskList"></ul>
    `;
    // Mock de fetch pour simuler une réponse réussie
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  it("devrait soumettre le formulaire", async () => {
    const form = document.getElementById("taskForm");
    const submitEvent = new window.Event("submit");
    await form.dispatchEvent(submitEvent);
    // Vérifie que fetch a été appelé
    expect(fetch).toHaveBeenCalled();
  });
});

function displayTasks(tasks) {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-container");

    let echeance = task.echeance ? new Date(task.echeance).toLocaleDateString() : "Aucune";

    li.innerHTML = `
      <h3 class="task-title">${task.titre}</h3>
      <p><strong class="task-label">Auteur :</strong> <span class="task-value">${task.auteur?.prenom || "Inconnu"} ${task.auteur?.nom || ""}</span></p>
      <p><strong class="task-label">Échéance :</strong> <span class="task-value">${echeance}</span></p>
      <p><strong class="task-label">Priorité :</strong> <span class="task-value">${task.priorite}</span></p>
      <p><em class="task-status">${task.statut}</em></p>

      <div class="task-buttons">
        <button class="btn-green">Voir</button>
        <button class="btn-green">Modifier</button>
        <button class="btn-red">Supprimer</button>
      </div>
    `;

    // Ajoutez les écouteurs d'événements
    const voirBtn = li.querySelector(".btn-green:first-of-type");
    const modifierBtn = li.querySelector(".btn-green:last-of-type");
    const supprimerBtn = li.querySelector(".btn-red");

    voirBtn.addEventListener("click", () => viewTask(task._id)); // Supposons que task._id existe
    modifierBtn.addEventListener("click", () => editTask(task._id));
    supprimerBtn.addEventListener("click", () => deleteTask(task._id));

    taskList.appendChild(li);
  });
}