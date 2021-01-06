<template>
  <div id="cesium-container"></div>
</template>

<script>
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from 'cesium';
import {geoloc} from '../../lib/geolocation.js';

export default {
  name: "CesiumGlobeView",
  data() {
    return{
      center: [6.659361,46.779389],
      defaultheight:1500.,
      viewer:null,
      geooptions: {
        enableHignAccuracy: true,
        maximumAge        : 30000, 
        timeout           : 27000
      }
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
      //viewer.scene.primitives.add(Cesium.createOsmBuildings());
      return viewer;
    },

    marker(position){
      console.log(position.timestamp, position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      //let coord = [position.coords.longitude,position.coords.latitude];
      this.posPoint(position.coords.longitude,position.coords.latitude);
    },

    message(mess){
      alert (mess);
    },

    //dessin d'un cercle à la position
    posPoint(long, lat){
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(long, lat),
        Point:{
          pixelSize: 10,
          color: Cesium.Color.YELLOW,
        },
      });
      console.log('coucou')
    }
  },
  mounted() {
    // add cesium ion token to the app
    Cesium.Ion.defaultAccessToken = process.env.VUE_APP_CESIUM_ION_TOKEN;
    
    this.viewer = this.setupCesiumGlobe();
    this.flytodirection(this.center,this.defaultheight,this.viewer);
    // geoloc(this.marker, this.message, this.geooptions);
    this.posPoint(this.center[0], this.center[1]);
    this.viewer = this.posPoint(-75.59777, 40.03883);
  },
};
</script>

<style scoped>
#cesium-container {
  height: 500px;
}
</style>