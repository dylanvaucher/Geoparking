<template>
  <!-- Barre de recherhe -->
  <div><input v-model="searchquery" v-on:change="getGeoAdminSearch(searchapiURL,searchquery,searchtype)" placeholder="Rechercher un lieu"></div><br>
  <!-- Different bouton activant dirrecent filtre -->
  <div class="field has-addons has-addons-centered">
    <p class="control"><button class="button"><span class="icon"><input type="checkbox" id="checkbox_OSM" :checked="false" v-model="OSMVisible" @change="osmcheck(OSMVisible)"></span><label for="checkbox_OSM"> OSM Layer</label></button></p>
      <p class="control"><button class="button"><span class="icon"><input type="checkbox" id="checkbox_parking" :checked="true" v-model="parkingVisible" @change="parkingcheck(parkingVisible)"></span><label for="checkbox_parking"> Parkings</label></button></p>
      <p class="control"><button class="button" v-on:click="vivsibleLayer(layerLibre)"><span class="icon"><img class="prefix" src="../../assets/parking_vert.png"></span><span> Libre</span></button></p>
      <p class="control"><button class="button" v-on:click="vivsibleLayer(layerDense)"><span class="icon"><img class="prefix" src="../../assets/parking_orange.png"></span><span> Peu de places diponibles</span></button></p>
      <p class="control"><button class="button" v-on:click="vivsibleLayer(layerComplet)"><span class="icon"><img class="prefix" src="../../assets/parking_rouge.png"></span><span> Complet</span></button></p>
      <p class="control"><button class="button" v-on:click="vivsibleLayer(layerIndispo)"><span class="icon"><img class="prefix" src="../../assets/parking_bleu.png"></span><span> Information indisponible</span></button></p>
  </div>
  <!-- Carte -->
  <div id="ol-container" class="map"></div>
  <!-- Coordonnees de la souris -->
  <div id="mousePosition"></div>
</template>

<script>
// Different Import de librairie
// Axios
import axios from 'axios'
// Openlayer
import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS  from 'ol/source/WMTS';
import View from 'ol/View';
import * as control from 'ol/control';
import * as coordinate from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import {Fill, Stroke, Circle, Style, Icon} from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import Projection from 'ol/proj/Projection';
import * as olProj from 'ol/proj';
// Projection
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
// Geolocation
import {geoloc} from '../../lib/geolocation.js';
// Requete SITG pour affichage des donnees
import {getSITGParking} from '../../lib/requete_SITG.js';

// Constante des images pour les utilisees sur les bouton et l'affichage des donnees
const parkingVert = require('@/assets/parking_vert.png');
const parkingBleu = require('@/assets/parking_bleu.png');
const parkingRouge = require('@/assets/parking_rouge.png');
const parkingOrange = require('@/assets/parking_orange.png');

export default {
  data() {
    return{
      // Variables map
      center: [2500000, 1120000],
      olmap: null,
      zoom: 9,
      // Variables de reprojection et 'daffichage wmts
      RESOLUTIONS: [
              4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
              1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5
            ],
      extent: [2420000, 130000, 2900000, 1350000],
      matrixIds: [],
      // Vaariables layer fonds de carte
      layerConfig: {
        "attribution": "swisstopo",
        "format": "jpeg",
        "serverLayerName": "ch.swisstopo.swissimage",
        "attributionUrl": "https://www.swisstopo.admin.ch/internet/swisstopo/fr/home.html",
        "label": "SWISSIMAGE",
        "timestamps": ["current"]
      },
      osmlayer:null,
      wmtsLayer:null,
      // Variables geolocation
      geooptions: {
        enableHignAccuracy: true,
        maximumAge        : 30000, 
        timeout           : 27000
      },
      // Variables
      searchapiURL: "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=",
      searchquery:"",
      searchtype: "&type=locations",
      searchLieu: {
        lieu:"",
        lat: "",
        long: ""
      },
      // Variables definition de l'affichage des donnees parking
      stylecache: {
        'Libre': new Style({
          image: new Icon({
            imgsize: [512, 512],
            scale: 0.05,
            src: parkingVert,
          }),
        }),
        'Dense': new Style({
          image: new Icon({
            imgsize: [512, 512],
            scale: 0.05,
            src: parkingOrange,
          }),
        }),
        'Complet': new Style({
          image: new Icon({
            imgsize: [512, 512],
            scale: 0.05,
            src: parkingRouge,
          }),
        }),
        'Indisponible': new Style({
          image: new Icon({
            imgsize: [512, 512],
            scale: 0.05,
            src: parkingBleu,
          }),
        })
      },
      // Variables layer Parking avec leur condition d'affichage
      parkings: null,
      layerLibre: {
       layer: null,
       condition: true,
      },
      layerDense: {
       layer: null,
       condition: true,
      },
      layerComplet: {
       layer: null,
       condition: true,
      },
      layerIndispo: {
       layer: null,
       condition: true,
      },
      parkingVisible: true
    }
  },
  computed:{
    /** 
     * Definition de la projection MN95 (ESPG:2056)
     * @returns {Projection} Nouvelle Projection
     */
    projectionget(){
      proj4.defs("EPSG:2056",
        "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
      );
      register(proj4);
      let projection = new Projection({
        code: 'EPSG:2056',
        extent: this.extent
      })
      return projection
    },

    /**
     * Création de la matrice d'affichage pour le wmts de geoadmin
     * @returns {matrice} matrice d'affichage pour le WMTS
     */
    matrix(){
      for(let i = 0; i < this.RESOLUTIONS.length; i++) {this.matrixIds.push(i);}
    }
  },
  methods: {
    // Création et ajout du fond de carte OpenStreetMap
    setupOSMlayer () {
      this.osmlayer = new TileLayer({
          source: new OSM()
      });
      this.olmap.addLayer(this.osmlayer);
      this.osmlayer.setVisible(false);

    },

    /**
     * Cration de la source du WMTS
     * @param {Dictionnaire} layerConfig configuration du wmts
     * @param {Projection} projection projection du wmts
     * @returns {WMTS} WMTS
     */
    wmtsSource(layerConfig, projection){
      let resolutions = layerConfig.resolutions || this.RESOLUTIONS;
      let tileGrid = new WMTSTileGrid({
        origin: [this.extent[0], this.extent[3]],
        resolutions: resolutions,
        matrixIds: this.matrixIds
      });
      let extension = layerConfig.format || 'png';
      let timestamp = layerConfig['timestamps'][0];
      return new WMTS(({
        attributions: [new control.Attribution({
          html: '<a target="new" href="https://www.swisstopo.admin.ch/internet/swisstopo/en/home.html">swisstopo</a>'
        })],
        url: '//wmts10.geo.admin.ch/1.0.0/{Layer}/default/' + timestamp + '/2056/{TileMatrix}/{TileCol}/{TileRow}.'+ extension,
        tileGrid: tileGrid,
        projection: projection,
        layer: layerConfig.serverLayerName,
        requestEncoding: 'REST'
      }))
    },

    /**
     * Cration du layer WMTS
     * @param {WMTS} wmtssource configuration du wmts
     * @returns {Layer} layer WMTS (Tile Layer)
     */
    setupWMTSLayer(wmtssource){
      return new TileLayer({
        source: wmtssource
      })
    },

    /**
     * Initialisation de la carte
     * @param {Layer} layer calque à ajouter à la carte
     * @param {Number[]} mapcenter centre de la carte
     * @param {Number} mapzoom niveau de zoom d'affichage
     * @param {projection} projection système de projection de la carte
     * @returns {MAp} layer WMTS (Tile Layer)
     */
    setupMap(layer, mapcenter, mapzoom, projection){
      return new Map({
        layers: [layer],
        target: 'ol-container',
        view: new View({
          center: mapcenter,
          zoom: mapzoom,
          projection: projection,
          resolution: 100
        }),
        controls: control.defaults({
          attributionOptions:({
            collapsible: false
          })
        }).extend([
          new control.ScaleLine({
            units: 'metric'
          }),
          new control.MousePosition({
            coordinateFormat: coordinate.createStringXY(0),
            //projection: 'EPSG:2056',
            target: document.getElementById('mousePosition'),
            undefinedHTML: '&nbsp;'
          })
        ]),
        logo: false,
      })
    },

    /**
     * Fonction appeler pour la géolocation s'il y a une géolocation possible
     * @param {Dictionnaire} position retour de la geolocation
     */
    marker(position){
      console.log(position.timestamp, position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      let coord = olProj.transform([position.coords.longitude,position.coords.latitude], 'EPSG:4326', 'EPSG:2056');
      this.posPoint(coord);
    },

    /**
     * Fonction appeler pour la géolocation s'il n'y a pas une géolocation possible
     * @param {string} mess retour de la geolocation
     */
    message(mess){
      alert (mess);
    },

    /**
     * Affichage d'un point sur la carte
     * @param {Number[]} coordinates coordonnées d'un point
     */
    posPoint(coordinates){
      let positionFeature = new Feature();
      positionFeature.setGeometry(coordinates ?
        new Point(coordinates): null);

      let layer = new VectorLayer({
        source: new VectorSource({
          features:[positionFeature]
        }),
        style: new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: '#3399CC'
            }),
          })          
        }),
      });
      this.olmap.addLayer(layer);
    },

    /**
     * Requete Axios pour la recherche de lieu via API de GeoAdmin et centrage sur le lieu
     * @param {string} url première partie de l'url
     * @param {string} query lieu issu de la barre de recherche
     * @param {string} type type de recherche
     * @returns {Dictionnaire} Retour de la requete
     */
    async getGeoAdminSearch(url,query,type){
      let response = await axios.get(url+query+type)
      .catch(error => {
        console.error(error);
        return 0
      })
      //request error
      if(response == 0){
        return "Ouch an error occurred"
      }
      // don't find an answer
      if(response.data.count == 0){
        return "Didn't found any answers"
      }
      // Get first quote
      this.searchLieu.lieu = response.data.results[0].attrs.label;
      this.searchLieu.lat = response.data.results[0].attrs.lat;
      this.searchLieu.long = response.data.results[0].attrs.lon;
      this.olmap.getView().setCenter(olProj.transform([this.searchLieu.long,this.searchLieu.lat], 'EPSG:4326', 'EPSG:2056'));
      this.olmap.getView().setZoom(9);
    },

    /**
     * Filtre du json
     * @param {json} json Json ou lien du fichier json
     * @param {string} filtre filtre du json
     * @returns {json} json filtré
     */
    filterJSON(json, filtre){
      let jsoncopie = JSON.parse(JSON.stringify(json));
      let jsonfilter = json.features.filter(function (entry){
        return entry.attributes.ETAT === filtre;
      });
      jsoncopie.features = jsonfilter;
      return jsoncopie;
    },

    /**
     * Import d'un Esri Json et affichage différencié selon filtre
     * @param {json} json Json ou lien du fichier json
     * @param {string} filtre filtre du json
     * @returns {layer} Layer filtré
     */
    importEsriJSON(json, filtre){
      let layer = new VectorLayer({
        source: new VectorSource({
          features: new EsriJSON().readFeatures(this.filterJSON(json, filtre))
        }),
        style: this.stylecache[filtre],
      });
      this.olmap.addLayer(layer);
      return layer;
    },

    /**
     * Condition d'affichage de la carte OpenStreetMap
     * @param {boolean} checked Booléen issu de la checkbox
     */
    osmcheck(checked){
      this.osmlayer.setVisible(checked);
      this.wmtsLayer.setVisible(!checked);
    },

    /**
     * Condition d'affichage de tout les parkings
     * @param {boolean} checked Booléen issu de la checkbox
     */
    parkingcheck(checked){
      if (checked == true){
        this.layerLibre.layer.setVisible(this.layerLibre.condition);
        this.layerDense.layer.setVisible(this.layerDense.condition);
        this.layerComplet.layer.setVisible(this.layerComplet.condition);
        this.layerIndispo.layer.setVisible(this.layerIndispo.condition);
      };
      if (checked == false){
        this.layerLibre.layer.setVisible(false);
        this.layerDense.layer.setVisible(false);
        this.layerComplet.layer.setVisible(false);
        this.layerIndispo.layer.setVisible(false);
      };
    },

    /**
     * Condition d'affichage des parkings en fonction des filtre
     * @param {layer} layer layer issus du bouton cliquer
     */
    vivsibleLayer(layer){
      if (this.parkingVisible == true){
        if (this.layerLibre.condition == true & this.layerDense.condition == true &
          this.layerComplet.condition == true & this.layerIndispo.condition == true){
            this.layerLibre.condition = !this.layerLibre.condition;
            this.layerDense.condition = !this.layerDense.condition;
            this.layerComplet.condition = !this.layerComplet.condition;
            this.layerIndispo.condition = !this.layerIndispo.condition;
            layer.condition = !layer.condition;
            this.layerLibre.layer.setVisible(this.layerLibre.condition);
            this.layerDense.layer.setVisible(this.layerDense.condition);
            this.layerComplet.layer.setVisible(this.layerComplet.condition);
            this.layerIndispo.layer.setVisible(this.layerIndispo.condition);
        } else if (layer.condition == false) {
          layer.condition = !layer.condition;
          layer.layer.setVisible(layer.condition);
        } else if (layer.condition == true) {
          layer.condition = !layer.condition;
          if (this.layerLibre.condition == false & this.layerDense.condition == false &
            this.layerComplet.condition == false & this.layerIndispo.condition == false){
              this.layerLibre.condition = !this.layerLibre.condition;
              this.layerDense.condition = !this.layerDense.condition;
              this.layerComplet.condition = !this.layerComplet.condition;
              this.layerIndispo.condition = !this.layerIndispo.condition;
              this.layerLibre.layer.setVisible(this.layerLibre.condition);
              this.layerDense.layer.setVisible(this.layerDense.condition);
              this.layerComplet.layer.setVisible(this.layerComplet.condition);
              this.layerIndispo.layer.setVisible(this.layerIndispo.condition);
          } else {
            layer.layer.setVisible(layer.condition);
          };
        };
      };
    }
  },

  async mounted() {
    //Affichage des fonds de cartes
    this.matrix;
    this.wmtsLayer = this.setupWMTSLayer(this.wmtsSource(this.layerConfig, this.projectionget));
    this.olmap = this.setupMap(this.wmtsLayer,this.center, this.zoom, this.projectionget);
    this.setupOSMlayer();
    //activation et afffichage de la geolocation
    geoloc(this.marker, this.message, this.geooptions);
    //Requete et affichage des parkings 
    this.parkings = await getSITGParking();
    this.layerLibre.layer = this.importEsriJSON(this.parkings, 'Libre');
    this.layerIndispo.layer = this.importEsriJSON(this.parkings, 'Indisponible');
    this.layerDense.layer = this.importEsriJSON(this.parkings, 'Dense');
    this.layerComplet.layer = this.importEsriJSON(this.parkings, 'Complet');
  }

}
</script>

<style scoped>
#ol-container {
  height: 450px;
}
#mousePosition {
  position: relative;
  height: 20px;
  width: 100%;
}
</style>