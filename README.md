# Agregcine
## Un projet pour agréger des cinés

Ce projet permet de déployer un site internet qui présente les films diffusés dans les 7 prochains jours dans une liste de cinémas présents sur Allociné à paramétrer.

Ce readme a pour objectif d'expliquer les fichiers de configuration, et de présenter comment lancer simplement le site en local.

## Configuration du front

Le fichier de configuration à écrire est `agregcine_frontend/config.json`. Un fichier `agregcine_frontend/config-sample.json` est également présent dans le repo pour exemple.

Ce fichier contient deux paramètres:
- L'URL de l'API, qui doit forcément finir par `api/` pour fonctionner.
- Le texte de présentation du site écrit sur la page de garde, pour l'adapter à votre cas d'usage précis.

## Configuration du back

Le fichier de configuration à écrire est `agregcine_backend/config.json`. Un fichier `agregcine_backend/config-sample.json` est également présent dans le repo pour exemple. Par défaut, le fichier de config utilisé sera `./config.json`, cependant il est possible de passer le chemin vers un fichier de configuration arbitraire avec l'argument `-p`.

Structure du fichier de config: 
|__server (configuration serveur)
|  |__address: string (adresse IP du serveur)
|  |__port: number (port sur lequel écouter)
|  |__static_files: string (chemin vers les fichiers statiques à servir)
|
|__database (configuration du fichier de base de donnée ou sont stockées les infos scrappées)
|  |__file: string (chemin vers le dossier de base de donnée, droits d'écritures nécessaires)
|
|__log (configuration des logs du serveur)
|  |__dir: string (chemin vers le dossier de logs, droits d'écriture necessaires)
|  |__level: string (DEBUG,INFO,WARN,ERROR)
|
|__cinemas (tableau d'objets de description de cinés à scrapper)
   |__id: string (id du cinéma dans l'URL allociné)
   |__name: string (nom du cinéma à afficher)

## Lancer le serveur simplement en local

Les fichiers de configs fournis en exemple sont cohérents et doivent vous permettre de lancer le site en local.

Lancez le script install.sh pour construire le front et compiler le back.
Déplacez vous dans agregcine_backend puis lancez target/release/agregcine_backend.
Dans le dossier logs vous devriez voir l'avancement du scrapping.
Une fois le scrapping fini, le site devrait afficher les films sur le port spécifié.

## Détails d'implémentation

A chaque fois qu'il commence a scrapper, le serveur fait sept requêtes a Allociné par cinéma spécifié.

Par défaut, un scrappage sera lancé au lancement du serveur si le fichier de base de donnée n'existe pas ou est vide. Il est possible de forcer un scrappage en passant le flag -r au serveur.

Une fois le serveur lancé, Allociné sera scrappé chaque jour a 00:01 UTC.