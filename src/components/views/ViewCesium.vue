<template>
  <div id="cesium-container"></div>
</template>

<script>
// Different Import de librairie
//Cesium
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from 'cesium';
//Projection
import Projection from 'ol/proj/Projection';
import * as olProj from 'ol/proj';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
//Geolocation
import {geoloc} from '../../lib/geolocation.js';
//Requete SITG
import {getSITGParking} from '../../lib/requete_SITG.js';
//transformation esri json to GeoJson
import {arcgisToGeoJSON} from '@esri/arcgis-to-geojson-utils';

export default {
  name: "CesiumGlobeView",
  data() {
    return{
      //Variable Viewer
      center: [2500000, 1120000],
      defaultheight:50000.,
      viewer:null,
      //Variable pour la geolocation
      geooptions: {
        enableHignAccuracy: true,
        maximumAge        : 30000, 
        timeout           : 27000
      },
      //Variable pour la projection
      extent: [2420000, 130000, 2900000, 1350000],
      //Variable du layer parking
      parkings: null
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
     *Reprojection du centre MN95 (ESPG:2056) en WGS84 (ESPG:4326)
     * @returns {Projection} Nouvelle Projection
     */
    center4326(){
      return olProj.transform(this.center, 'EPSG:2056', 'EPSG:4326');
    }
  },
  methods: {
    /**
     * Fly to position 
     * 
     * @param {number[]} globecenter position to fly to
     * @param {number} globeheight altitude
     * @param {Viewer} viewer cesium viewer
     */
    flytodirection(globecenter,globeheight,viewer){
      viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(globecenter[0], globecenter[1], globeheight)
      });
    },
    /**
     * Init Cesium globe
     * 
     * @returns {Viewer} viewer from cesium
     */
    setupCesiumGlobe () {
      let viewer = new Cesium.Viewer('cesium-container', {
        terrainProvider: new Cesium.createWorldTerrain()
      });
      viewer.scene.primitives.add(Cesium.createOsmBuildings());
      return viewer;
    },

    /**
     * Fonction appeler pour la géolocation s'il y a une géolocation possible
     * @param {Dictionnaire} position retour de la geolocation
     */
    marker(position){
      console.log(position.timestamp, position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      this.posPoint(position.coords.longitude,position.coords.latitude);
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
    posPoint(long, lat){
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(long, lat),
        point:{
          pixelSize: 12,
          color: Cesium.Color.YELLOW,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
    },

    /**
     * Import Esri Json dans le viewer de MN95 à WGS84 avec transformation esri json to geojson
     * @param {json} json Json ou lien du fichier json
     */
    importjson(json){
      let jsoncopie = JSON.parse(JSON.stringify(json));
      for (let f of jsoncopie.features){
        let coord = olProj.transform([parseFloat(f.geometry.x), parseFloat(f.geometry.y)], 'EPSG:2056', 'EPSG:4326');
        f.geometry.x = coord[0];
        f.geometry.y = coord[1];
      };
      let geojson = arcgisToGeoJSON(jsoncopie);
      this.viewer.dataSources.add(Cesium.GeoJsonDataSource.load(geojson, {
        clampToGround: true
      }));
    },
  },
  async mounted() {
    let projection = this.projectionget;
    // add cesium ion token to the app
    Cesium.Ion.defaultAccessToken = process.env.VUE_APP_CESIUM_ION_TOKEN;
    //Init Viewer
    this.viewer = this.setupCesiumGlobe();
    this.flytodirection(this.center4326,this.defaultheight,this.viewer);
    //Activation et affichage geolocation
    geoloc(this.marker, this.message, this.geooptions);
    //Requete et affichage des parkings 
    this.parkings = await getSITGParking();
    this.importjson(this.parkings);
  },
};
</script>

<style scoped>
#cesium-container {
  height: 500px;
}
</style>