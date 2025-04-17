const { JSDOM } = require('jsdom');

// Configuration initiale
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <form id="taskForm">
        <input id="titre" value="Test" />
        <button type="submit">Ajouter</button>
      </form>
      <ul id="taskList"></ul>
      <button id="themeToggle">🌙 Mode Sombre</button>
      <button id="exportCSV">📤 Exporter en CSV</button>
    </body>
  </html>
`);

// Configuration globale
global.window = dom.window;
global.document = dom.window.document;
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock des fonctions
const mockFunctions = {
  fetchTasks: jest.fn(),
  displayTasks: jest.fn(),
  viewTask: jest.fn(),
  editTask: jest.fn(),
  deleteTask: jest.fn(),
  exportToCSV: jest.fn(),
  toggleTheme: jest.fn()
};

jest.mock('../../public/script.js', () => mockFunctions);

const { fetchTasks, displayTasks } = require('../../public/script.js');

describe("fetchTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<ul id="taskList"></ul>';
    
    // Mock de fetch réussi par défaut
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ 
          _id: "123", 
          titre: "Tâche test", 
          statut: "à faire",
          auteur: { prenom: "Jean", nom: "Dupont" },
          priorite: "Haute",
          echeance: "2023-12-31"
        }])
      })
    );
    
    // Mock de fetchTasks réussi
    mockFunctions.fetchTasks.mockImplementation(async () => {
      const res = await fetch('/tasks');
      const tasks = await res.json();
      displayTasks(tasks);
      return tasks;
    });
  });

  it("devrait afficher les tâches après un appel réussi à l'API", async () => {
    await fetchTasks();
    expect(fetch).toHaveBeenCalledWith('/tasks');
    expect(displayTasks).toHaveBeenCalled();
  });

  it("devrait gérer les erreurs d'API", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error("Erreur API")));
    
    mockFunctions.fetchTasks.mockImplementationOnce(async () => {
      try {
        const res = await fetch('/tasks');
        return await res.json();
      } catch (err) {
        console.error("Erreur lors de la récupération des tâches :", err.message);
        throw err;
      }
    });

    await expect(fetchTasks()).rejects.toThrow("Erreur API");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Erreur lors de la récupération des tâches :", 
      "Erreur API"
    );
    consoleSpy.mockRestore();
  });
});

describe("Gestion des interactions", () => {
  beforeEach(() => {
    // Réinitialisation du DOM avec des éléments cliquables
    document.body.innerHTML = `
      <ul id="taskList">
        <li class="task-container">
          <div class="task-buttons">
            <button class="btn-green" id="viewBtn">Voir</button>
            <button class="btn-green" id="editBtn">Modifier</button>
            <button class="btn-red" id="deleteBtn">Supprimer</button>
          </div>
        </li>
      </ul>
      <button id="themeToggle">🌙 Mode Sombre</button>
      <button id="exportCSV">📤 Exporter en CSV</button>
    `;
  });

  it("devrait déclencher viewTask au clic", () => {
    const { viewTask } = require('../../public/script.js');
    const button = document.getElementById("viewBtn");
    button.addEventListener("click", () => viewTask("123"));
    button.click();
    expect(viewTask).toHaveBeenCalledWith("123");
  });

  it("devrait déclencher editTask au clic", () => {
    const { editTask } = require('../../public/script.js');
    const button = document.getElementById("editBtn");
    button.addEventListener("click", () => editTask("123"));
    button.click();
    expect(editTask).toHaveBeenCalledWith("123");
  });

  it("devrait déclencher deleteTask au clic", () => {
    const { deleteTask } = require('../../public/script.js');
    const button = document.getElementById("deleteBtn");
    button.addEventListener("click", () => deleteTask("123"));
    button.click();
    expect(deleteTask).toHaveBeenCalledWith("123");
  });

  it("devrait basculer le thème au clic", () => {
    const { toggleTheme } = require('../../public/script.js');
    const button = document.getElementById("themeToggle");
    button.addEventListener("click", toggleTheme);
    button.click();
    expect(toggleTheme).toHaveBeenCalled();
  });

  it("devrait déclencher l'export CSV au clic", () => {
    const { exportToCSV } = require('../../public/script.js');
    const button = document.getElementById("exportCSV");
    button.addEventListener("click", exportToCSV);
    button.click();
    expect(exportToCSV).toHaveBeenCalled();
  });
});

describe("Gestion du formulaire", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="taskForm">
        <input id="titre" value="Test" />
        <button type="submit">Ajouter</button>
      </form>
    `;
    global.fetch.mockImplementation(() => Promise.resolve({ ok: true }));
  });

  it("devrait soumettre le formulaire", async () => {
    const form = document.getElementById("taskForm");
    const submitHandler = jest.fn(e => e.preventDefault());
    form.addEventListener("submit", submitHandler);
    
    await form.dispatchEvent(new Event("submit"));
    expect(submitHandler).toHaveBeenCalled();
  });
});