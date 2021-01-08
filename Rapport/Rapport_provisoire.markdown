# Rapport de projet GIO1

### Dylan Vaucher, Seraina Silberschmidt

### Janvier 2021

  

---

  

Le présent rapport porte sur le projet qui a été réalisé dans le cadre du cours de *Géoinformatique opérationnelle : Développement avancé d’outils (GIO1)* qui fait partie du Master en développement territorial. L'objectif du projet était la création d'un géoportail contenant une page d'accueil ainsi que des portails cartographiques en 2D et en 3D. Le projet a été réalisé en utilisant le framework javascript Vue.js dont un exemple minimal nous a été mis à disposition par les enseignants.

  

## Concept

Le projet porte sur la visualisation d'un jeu de données en temps réel et montre plus précisément la disponibilité des places de stationnement, agrégées par parking. La visualisation ce fait dans une visualisateur 2D (avec Openlayers) et 3D (avec Cesium).

  
  

## Données

### Calques
Les données utilisées dans le cadre de ce projet sont issues du système d'information du territoire à Genève (SITG). Il s'agit du jeu de données [Infomobilité - informations sur les parking en temps réel](https://ge.ch/sitg/fiche/4869) (Format: ESRI JSON), mis à disposition en accès libre par l'office cantonal des transports. Contenant des points géoréférencés ainsi qu'un nombre d'attributs, cette couche diffuse l'information en temps réel sur les taux de remplissage des principaux parkings de la ville de Genève. Nous tenons à préciser que seuls les parkings disposant d'un système de transmission automatisé du taux de remplissage sont référencés. La particularité de ce jeu de données réside dans le fait que les données sont actualisées toutes les 5 minutes sur la base d'information fournies par la Fondation des Parkings et l'Aéroport de Genève.

En plus de la géométrie, voici les attributs principaux contenus dans ce jeu de données:

| Nom | Type | Description

| ------ | ---- | ------------

| ID | Double | Identifiant du parking

| PARKING | String | Nom du parking

| PLACE_DISPONIBLE| Double | Nombre de places disponibles en temps réel

| EXPLOITANT | String | Société exploitante du parking

| ETAT | String | État du remplissage: - libre - dense - complet - indisponible

| PLACE_TOTALE | Double | Capacité totale du parking

### Fonds de cartes
Il y a deux fonds de carte disponibles pour le projet. Le premier est SWISSIMAGE, un [WMTS](https://www.geo.admin.ch/fr/geo-services-proposes/geoservices/services-de-consultation-applications-cartographie-en-ligne-sig-web/web-map-tiling-services-wmts.html9) fourni par la confédération et formant une orthophoto. Le second est [OpenStreetMap](https://www.openstreetmap.org/) qui forme une carte couleur cette fois-ci. 

Toutes nos données sont ou ont été reprojeté en MN95 (ESPG:2056) pour la partie 2D
et en WGS84 (ESPG:4326) pour la partie 3D.

## Documentation de l'outil

L'outil GEOPARKING est composé d'un menu principal avec trois onglets: la page d'accueil, le portail cartographique 2D réalisé avec OpenLayers et le portail cartographique 3D basé sur Cesium. La navigation sur le site se fait à partir de ce menu. Une en-tête montrant le logo du site s'affiche en-dessus du menu. Ces composants statiques de l'application ont été définis dans le fichier App.vue.

  

### Page d'accueil

En ouvrant l'application, l'utilisateur arrive sur la page d'accueil contenant des informations générales relatives au projet: titre, noms des auteurs, contexte de réalisation du projet, petite description des composants et une légende.

![Paged'accueil](./Images/page_accueil.PNG)
  

### Portail cartographique 2D - OpenLayers
Pour le géoportail 2D, les fonctionnalités suivantes ont été implémentées:

 * Recherche de lieu via l'API de GeoAdmin puis centrage et zoom sur le lieu
 * Géolocalisation directement en arrivant sur la page et affichage de celle-ci 
 * Affichage des données issues des la requête SITG
 * Style d'affichage des données avec différents icones selon l'Etat des parkings (Libre, Peu de places disponible, Complet et Informations indisponible)
 * Affichage des données selon l'Etat des parkings  (filtre d'affichage)
 * Changement de fond de carte (SwissImage, OpenStreetMap)
 * Affichage des coordonnées de la position souris en MN95

![Page 3D Cesium affichage des données SITG avec fond de carte Swissimage](./Images/2D_1.png)

![Page 3D Cesium affichage géolocalisation avec fond de carte OpenStreetMap](./Images/2D_2.png) 

### Portail cartographique 3D - Cesium
Pour le géoportail 3D, les fonctionnalités suivantes ont été développées:

 * Géolocalisation directement en arrivant sur la page et affichage de celle-ci 
 * Affichage des données issues des la requête SITG
 * Affichage via Popup des différentes informations issus des parkings (nom, lien internet, taux de remplissage, nombre de places disponibles, etc.)

![Page 3D Cesium affichage des données SITG ](./Images/3D_1.PNG)

![Page 3D Cesium affichage géolocalisation](./Images/3D_2.PNG)

  

## Démarche et problèmes
Pour arriver au résultat de notre site, nous avons travailler par étape. Nous avons commencé par développé le portail cartographique 2D sur OpenLayers afin de pouvoir déterminer les différentes fonctionnalités utiles pour la partie 3D comme la géolocalisation ou encore la requête Axios pour les données issus du SITG. En effet, ces fonctionnalités utiles dans les deux portails sont développés dans des fichiers ".js" à part afin de les implémenté qu'une fois. Par la suite, nous avons implémenté le portail cartographique 3D sur Cesium puis la page d'accueil. Tout au long du projet, GITHUB a permis de collaborer au sein de notre équipe.

Lors de l'implémentation de ce projet, plusieurs problèmes sont survenus. A commencer par l'accès au données du SITG. En effet, il a fallu trouver le bon URL pour accéder au bonne données. Par la suite, il a fallu s'attarder sur le système de coordonnées. Effectivement, les données du SITG sont fourni en MN95 tant dit que d'autres de données sont en WGS84 comme les coordonnées de la géolocalisation ou encore le globe de Cesium. Une attention particulière a été porté sur le format des données surtout celles issues de la requête SITG. En effet, le format issu de la requête est du JSON d'ESRI qui peut être importer simplement dans le portail cartographique 2D mais qui doit être transformé portail 3D. Cesium peut seulement importer des formats GeoJSON ou TopoJSON. On aussi pu constater que la géolocalisation pouvait afficher plusieurs points si on ce déplaçait. En effet, notre fonction ajoute un point à chaque nouvelle position et ne supprime pas l'ancien au lieu de l'actualisé. Par manque de temps, ce problème n'a pu à résolu. Lors de grand dézoom, une erreur 404 survient sur le WWMTS Swissimage car il n'y a pas de blocage de zoom arrirère implémentée. Pour finir, l'implémentation de l'extrusion des données en fonction du taux de remplissage des parkings a été fait pour le portail 3D mais malheureusement, un problème d'import dans le "viewer" de Cesium est survenu et n'a pas pu être résolu.

![Exemple des plusieurs points affichés](./Images/Plusieurs_points.png)

![Exemple d'erreur de tuile pas trouvées dans le WMTS](./Images/not_found_wmts.PNG)

![Exemple d'extrusion](./Images/Extrusion.png)

## Conclusion et perspectives
 La principale force de projet est l'affichage des données via une requête URL permettant la mise à jour des données à chaque actualisation de la page web. En plus des cette force, les points forts suivant ont pu être dégager:
 
 * Géolocalisation
 * Barre de recherche via API de GeoAdmin (2D)
 * Affichage en MN95 (2D)
 * Affichage des coordonnées (2D)
 * Affichage Swissimage (2D)
 * Affichage selon des filtres (2D)
 * Transformation du format Esri Json en GeoJson et en WGS84 (3D)
 * Affichage via popup (issu directement de l'import) (3D)

Au contraire, les points suivants pourraient être améliorés. Ceci est surtout du par un manque de temps pour les affiner:
 
 * Affichage des plusieurs points lors de la géolocalisation
 * Actualisation automatiques de données
 * Géolocalisation automatique --> bouton pour l'activer
 * Manque d'affichage via popup des données issus de la requête SITG (2D)
 * Barre de recherche via API de GeoAdmin dans le portail 3D
 * Affichage simpliste (3D)
 * Manque d'affichage selon filtre (3D)
 * Extrusion en fonction du taux de remplissage

Pour aller encore plus loin, le développement d'une liste déroulante rattaché à la recherche du lieu permettrait d'affiner le choix du lieu. L'affichage de la précision de la géolocalisation via un un cercle serait fort utile pour mieux estimer la justesse la géolocalisation d'un coup d'œil. Vu que le projet est lié à la mobilité, la possibilité de calculer un itinéraire serait intéressant. L'implémentation davantage de filtre pourrait être utile comme un filtre en fonction de la capacité totale du parking (pour une manifestation). Et pour finit, l'ajout de données autres serait plaisant pour ne pas de confiné à Genève.