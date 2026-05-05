# Agregcine
## Un projet pour agréger des cinémas

Ce projet permet de déployer un site internet présentant les films diffusés dans les 7 prochains jours dans une liste de cinémas présents sur Allociné.

## Architecture

Le projet est composé de deux parties :

- **`scraper/`** : Un scraper Rust qui interroge Allociné et produit un fichier `movies.json`. Conçu pour être lancé quotidiennement (cron ou GitHub Actions).
- **`frontend/`** : Une SPA React/TypeScript (Vite + MUI). Elle charge les données depuis une URL distante définie dans `frontend/src/structTransform.ts`.

Il n'y a **pas de serveur applicatif** : le frontend est servi statiquement (GitHub Pages, nginx, etc.).

## Configuration du scraper

Créez `scraper/config.json` (gitignore) en vous basant sur la structure suivante :

```json
{
  "database": { "file": "movies.json" },
  "log": { "level": "INFO" },
  "cinemas": [
    { "id": "C0125", "name": "Mon Cinéma" }
  ]
}
```

L'identifiant `id` correspond à l'identifiant du cinéma dans les URLs Allociné.

## Configuration du frontend

L'URL de chargement des données est définie dans `frontend/src/structTransform.ts` :

```ts
const MOVIES_URL = 'https://...';
```

Adaptez cette URL pour pointer vers votre propre fichier `movies.json` accessible publiquement.

## Déploiement standalone (à la racine)

```bash
cd scraper && cargo build && target/debug/scraper
cd frontend && npm install && npm run build
cp scraper/movies.json frontend/dist/assets/
# Servir frontend/dist/
```

## Intégration sous un préfixe (ex: /cinema)

Ce projet peut être intégré dans un site existant sous un sous-chemin. Il suffit de passer le flag `--base` à Vite :

```bash
cd frontend && npm run build -- --base=/cinema/
```

Les assets seront alors référencés sous `/cinema/assets/...`.

**Note :** pour que la navigation interne fonctionne correctement, il faut également ajouter `basename="/cinema"` au `<BrowserRouter>` dans `frontend/src/App.tsx`.

## Lancer en local

```bash
# Lancer le scraper
cd scraper
# Créer config.json si pas encore fait
cargo run

# Dans un autre terminal, démarrer le dev server
cd frontend
npm install
npm run dev
```
