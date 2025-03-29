# ApiMongoDb

Projet de nouveaux paradigmes de base de données

## Description

ApiMongoDb est une API REST utilisant MongoDB comme base de données NoSQL. Elle permet de stocker, manipuler et récupérer des données de manière flexible. L'API est développée avec Express.js et utilise Mongoose pour l'interaction avec MongoDB.

## Remarque

Pour ajouter des commentaires ou des sous-tâches, il faut cliquer sur 'Modifier la tâche' depuis la liste des tâches.

Vous pouvez retrouver un jeu de donnée dans "models/jeuxDonnée" a importer sur MongoDb

Les filtres ne sont pas supprimés lors d'un simple rafraîchissement de la page (F5) ; un rafraîchissement complet des cookies est nécessaire (Ctrl + F5).

## Prérequis

- Node.js (version 16 ou supérieure)
- MongoDB (installé en local ou via un service cloud comme MongoDB Atlas)
- Un fichier `.env` contenant les variables d'environnement nécessaires (voir Configuration)

## Installation

1. Cloner le projet :
   ```sh
   git clone https://github.com/malosseRomain/ApiMongoDb.git
   ```
2. Accéder au dossier du projet :
   ```sh
   cd ApiMongoDb
   ```
3. Installer les dépendances :
   ```sh
   npm install
   ```

## Configuration

Créer un fichier `.env` à la racine du projet et y ajouter :

```env
MONGO_URI=mongodb://localhost:27017/nom_de_la_base
PORT=5 000
```

Remplace `nom_de_la_base` par le nom souhaité pour ta base de données MongoDB.

## Lancement du serveur

Démarrer l’API en exécutant :

```sh
"npm start" ou "node server.js"
```

L'API sera disponible sur `http://localhost:5000`.

## Documentation API

### Endpoints disponibles

| Méthode | Route        | Description                    |
| ------- | ------------ | ------------------------------ |
| GET     | `/tasks`     | Récupère toutes les tâches     |
| GET     | `/tasks/:id` | Récupère une tâche par son ID  |
| POST    | `/tasks`     | Ajoute une nouvelle tâche      |
| PUT     | `/tasks/:id` | Met à jour une tâche existante |
| DELETE  | `/tasks/:id` | Supprime une tâche             |

### Exemples de requêtes

#### Récupérer toutes les tâches

```sh
curl -X GET http://localhost:5000/tasks
```

## Mode d’emploi

- **Ajout de données** : Utiliser l’endpoint `POST /tasks` en envoyant un JSON contenant les détails de la tâche.
- **Mise à jour** : Utiliser `PUT /tasks/:id` pour modifier une tâche existante.
- **Suppression** : Appeler `DELETE /tasks/:id` pour supprimer une tâche.
- **Filtrage et recherche** :
  - `?statut=à faire` → Filtrer par statut
  - `?priorite=haute` → Filtrer par priorité
  - `?categorie=travail` → Filtrer par catégorie
  - `?q=rapport` → Recherche dans titre et description
