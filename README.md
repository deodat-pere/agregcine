# Agregcine
## Un projet pour agréger des cinés

Ce projet permet de déployer un site internet qui présente les films diffusés dans les 7 prochains jours dans une liste de cinémas présents sur Allociné à paramétrer.

Ce readme a pour objectif d'expliquer les fichiers de configuration, et de présenter comment lancer simplement le site en local.

## Configuration du front

Par défaut, en dev, les requêtes à l'api seront faites à http://localhost:3000/, et en build sur la même URL que le serveur statique. Ce comportement peut etre modifié dans `agregcine_frontend/cite.config.ts`.

## Configuration du back

Le fichier de configuration à écrire est `agregcine_backend/config.json`. Un fichier `agregcine_backend/config-sample.json` est également présent dans le repo pour exemple. Par défaut, le fichier de config utilisé sera `./config.json`, cependant il est possible de passer le chemin vers un fichier de configuration arbitraire avec l'argument `-p`.

Structure du fichier de config: 
|__server (configuration serveur)
|  |__address: string (adresse IP du serveur)
|  |__port: number (port sur lequel écouter)
|  |__static_files: string (chemin vers les fichiers statiques à servir)
|
|__frontend (éléments à envoyer directement au frontend)
|  |__presentation_text: string (texte expliquant quels cinémas sont agrégés)
|
|__database (configuration du fichier de base de donnée ou sont stockées les infos scrappées)
|  |__file: string (chemin vers le fichier (json) de base de donnée, droits d'écritures nécessaires)
|
|__log (configuration des logs du serveur)
|  |__dir: string (chemin vers le dossier de logs, droits d'écriture necessaires)
|  |__level: string (DEBUG,INFO,WARN,ERROR)
|
|__cinemas (tableau d'objets de description de cinés à scrapper)
   |__id: string (id du cinéma dans l'URL allociné)
   |__name: string (nom du cinéma à afficher)

## Lancer le serveur simplement en local

Le fichier de config fourni en exemple vous permets de lancer le site en local. Recopiez son contenu dans `agregcine_backend/config.json`.

Lancez le script install.sh pour construire le front et compiler le back.
Déplacez vous dans agregcine_backend puis lancez target/release/agregcine_backend.
Dans le dossier logs vous devriez voir l'avancement du scrapping.
Une fois le scrapping fini, le site devrait afficher les films sur le port spécifié.

## Détails d'implémentation

A chaque fois qu'il commence a scrapper, le serveur fait sept requêtes a Allociné par cinéma spécifié.

Par défaut, un scrappage sera lancé au lancement du serveur si le fichier de base de donnée n'existe pas, est vide, ou si la structure des données n'est pas bonne. Il est possible de forcer un scrappage en passant le flag -r au serveur.

Une fois le serveur lancé, Allociné sera scrappé chaque jour a 00:01 UTC.