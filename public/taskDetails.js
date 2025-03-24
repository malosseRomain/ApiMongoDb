document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");

  if (taskId) {
    try {
      const response = await fetch(`/tasks/${taskId}`);
      if (!response.ok) throw new Error("Tâche non trouvée");
      const task = await response.json();

      // Vérification de la présence des données
      const auteurInfo = task.auteur
        ? `<p>${task.auteur.prenom || "Inconnu"} ${
            task.auteur.nom || ""
          } - <a href="mailto:${task.auteur.email || "#"}">${
            task.auteur.email || "Email non disponible"
          }</a></p>`
        : "<p>Auteur inconnu</p>";

      document.getElementById("taskDetails").innerHTML = `
          <h2>${task.titre}</h2>
          <p><strong>Description :</strong> ${task.description || "Aucune"}</p>
          <p><strong>Statut :</strong> ${task.statut}</p>
          <p><strong>Priorité :</strong> ${task.priorite || "Non définie"}</p>
          <p><strong>Échéance :</strong> ${
            task.echeance
              ? new Date(task.echeance).toLocaleDateString()
              : "Non définie"
          }</p>
          <p><strong>Catégorie :</strong> ${task.categorie || "Non définie"}</p>
          <p><strong>Étiquettes :</strong> ${
            task.etiquettes?.length ? task.etiquettes.join(", ") : "Aucune"
          }</p>
          
          <h3>Auteur</h3>
          ${auteurInfo}
  
          <h3>Sous-tâches</h3>
          ${
            task.sousTaches?.length
              ? `
            <ul>${task.sousTaches
              .map(
                (sub) =>
                  `<li>${sub.titre} - ${sub.statut} (Échéance: ${
                    sub.echeance
                      ? new Date(sub.echeance).toLocaleDateString()
                      : "Non définie"
                  })</li>`
              )
              .join("")}</ul>
          `
              : "<p>Aucune sous-tâche</p>"
          }
  
          <h3>Commentaires</h3>
          ${
            task.commentaires?.length
              ? `
            <ul>${task.commentaires
              .map(
                (com) => `
              <li><strong>${com.auteur?.prenom || "Inconnu"} ${
                  com.auteur?.nom || ""
                }</strong> (${new Date(com.date).toLocaleDateString()})<br>${
                  com.contenu
                }</li>
            `
              )
              .join("")}</ul>
          `
              : "<p>Aucun commentaire</p>"
          }
  
          <h3>Historique des Modifications</h3>
          ${
            task.historiqueModifications?.length
              ? `
            <ul>${task.historiqueModifications
              .map(
                (hist) => `
              <li><strong>${hist.champModifie} :</strong> ${
                  hist.ancienneValeur || "-"
                } ➝ ${hist.nouvelleValeur || "-"} (${new Date(
                  hist.date
                ).toLocaleDateString()})</li>
            `
              )
              .join("")}</ul>
          `
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
