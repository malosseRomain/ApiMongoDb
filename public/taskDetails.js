document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");

  if (taskId) {
    try {
      const response = await fetch(`/tasks/${taskId}`);
      if (!response.ok) throw new Error("Tâche non trouvée");
      const task = await response.json();

      const auteurInfo = task.auteur
        ? `${task.auteur.prenom || "Inconnu"} ${task.auteur.nom || ""} 
                   - <a href="mailto:${task.auteur.email || "#"}">${
            task.auteur.email || "Email non disponible"
          }</a>`
        : "Auteur inconnu";

      document.getElementById("taskDetails").innerHTML = `
                <table>
                    <tr><td><strong>Titre :</strong></td><td>${
                      task.titre
                    }</td></tr>
                    <tr><td><strong>Description :</strong></td><td>${
                      task.description || "Aucune"
                    }</td></tr>
                    <tr><td><strong>Statut :</strong></td><td>${
                      task.statut
                    }</td></tr>
                    <tr><td><strong>Priorité :</strong></td><td>${
                      task.priorite || "Non définie"
                    }</td></tr>
                    <tr><td><strong>Échéance :</strong></td><td>${
                      task.echeance
                        ? new Date(task.echeance).toLocaleDateString()
                        : "Non définie"
                    }</td></tr>
                    <tr><td><strong>Catégorie :</strong></td><td>${
                      task.categorie || "Non définie"
                    }</td></tr>
                    <tr><td><strong>Étiquettes :</strong></td><td>${
                      task.etiquettes?.length
                        ? task.etiquettes.join(", ")
                        : "Aucune"
                    }</td></tr>
                </table>

                <h4>Auteur</h4>
                <p>${auteurInfo}</p>

                <h4>Sous-tâches</h4>
                ${
                  task.sousTaches?.length
                    ? `<ul>${task.sousTaches
                        .map(
                          (sub) =>
                            `<li>${sub.titre} - ${sub.statut} (Échéance: ${
                              sub.echeance
                                ? new Date(sub.echeance).toLocaleDateString()
                                : "Non définie"
                            })</li>`
                        )
                        .join("")}</ul>`
                    : "<p>Aucune sous-tâche</p>"
                }

                <h4>Commentaires</h4>
                ${
                  task.commentaires?.length
                    ? `<ul>${task.commentaires
                        .map(
                          (com) =>
                            `<li><strong>${com.auteur?.prenom || "Inconnu"} ${
                              com.auteur?.nom || ""
                            }</strong> 
                    (${new Date(com.date).toLocaleDateString()})<br>${
                              com.contenu
                            }</li>`
                        )
                        .join("")}</ul>`
                    : "<p>Aucun commentaire</p>"
                }

                <h4>Historique des Modifications</h4>
                ${
                  task.historiqueModifications?.length
                    ? `<ul>${task.historiqueModifications
                        .map(
                          (hist) =>
                            `<li><strong>${hist.champModifie} :</strong> ${
                              hist.ancienneValeur || "-"
                            } ➝ ${hist.nouvelleValeur || "-"} 
                    (${new Date(hist.date).toLocaleDateString()})</li>`
                        )
                        .join("")}</ul>`
                    : "<p>Aucune modification</p>"
                }
            `;
    } catch (error) {
      document.getElementById(
        "taskDetails"
      ).innerHTML = `<p style="color:red;">Erreur : ${error.message}</p>`;
    }
  } else {
    document.getElementById(
      "taskDetails"
    ).innerHTML = `<p style="color:red;">ID de tâche non fourni</p>`;
  }
});
