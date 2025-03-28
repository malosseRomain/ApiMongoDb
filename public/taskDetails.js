document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");

  if (!taskId) {
    document.getElementById(
      "taskDetails"
    ).innerHTML = `<p style="color:red;">ID de tâche non fourni</p>`;
    return;
  }

  try {
    const response = await fetch(`/tasks/${taskId}`);
    if (!response.ok) throw new Error("Tâche non trouvée");

    const task = await response.json();

    // Construction des informations sur l'auteur
    const auteurInfo = task.auteur
      ? `${task.auteur.prenom || "Inconnu"} ${task.auteur.nom || ""} 
        - <a href="mailto:${task.auteur.email || "#"}">${
          task.auteur.email || "Email non disponible"
        }</a>`
      : "Auteur inconnu";

    // Construction de l'affichage de l'historique des modifications
    const historiqueHTML = task.historiqueModifications?.length
      ? `<ul>${[
          ...new Set(
            task.historiqueModifications.map(
              (hist) =>
                `<li><strong>${hist.champModifie} :</strong> 
        <span style="color:red;">
          ${hist.ancienneValeur ?? "-"}
          <span style="color:black;"> ➝ </span> 
          <span style="color:green;">${hist.nouvelleValeur ?? "-"}</span>
        </span><br>
        <em style="font-size: 0.9em; color: gray;">(${new Date(
          hist.date
        ).toLocaleString()})</em></li>`
            )
          ),
        ].join("")}</ul>`
      : "<p>Aucune modification enregistrée</p>";

    // Construction de l'affichage principal
    document.getElementById("taskDetails").innerHTML = `
      <table>
        <tr><td><strong>Titre :</strong></td><td>${task.titre}</td></tr>
        <tr><td><strong>Description :</strong></td><td>${
          task.description || "Aucune"
        }</td></tr>
        <tr><td><strong>Statut :</strong></td><td>${task.statut}</td></tr>
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
          task.etiquettes?.length ? task.etiquettes.join(", ") : "Aucune"
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
                  `<li>${sub.titre} - ${sub.statut}<br>
                  Échéance: ${
                    sub.echeance
                      ? new Date(sub.echeance).toLocaleDateString()
                      : "Non définie"
                  }</li>`
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
                  `<li>${com.contenu} <br><em>- ${com.auteur} (${new Date(
                    com.date
                  ).toLocaleDateString()})</em></li>`
              )
              .join("")}</ul>`
          : "<p>Aucun commentaire</p>"
      }

      <h4>Historique des Modifications</h4>
      ${historiqueHTML}
    `;
  } catch (error) {
    document.getElementById(
      "taskDetails"
    ).innerHTML = `<p style="color:red;">Erreur : ${error.message}</p>`;
  }
});
