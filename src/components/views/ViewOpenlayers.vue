<template>
  <div id="ol-container" class="map"></div>
  <div id="mousePosition"></div>
</template>

<script>
import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS  from 'ol/source/WMTS';
import View from 'ol/View';
import * as control from 'ol/control';
import * as coordinate from 'ol/coordinate';
import Projection from 'ol/proj/Projection';
import * as olProj from 'ol/proj';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {geoloc} from '../../lib/geolocation.js';

export default {
  data() {
    return{
      center: [6.659361,46.779389],
      olmap:null,
      zoom: 17,
      RESOLUTIONS: [
              4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
              1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5
            ],
      extent: [2420000, 130000, 2900000, 1350000],
      matrixIds: [],
      layerConfig: {
        "attribution": "swisstopo",
        "format": "jpeg",
        "serverLayerName": "ch.swisstopo.swissimage",
        "attributionUrl": "https://www.swisstopo.admin.ch/internet/swisstopo/fr/home.html",
        "label": "SWISSIMAGE",
        "timestamps": ["current"]
      },
      geooptions: {
        enableHignAccuracy: true,
        maximumAge        : 30000, 
        timeout           : 27000
      }
    }
  },
  computed:{
    /**
     * Transform coordinate from EPSG:4326 to EPSG:3857
     * 
     * @use center in EPSG:4326
     * @return center in EPSG:3857
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
    center3857(){
      return olProj.transform(this.center, 'EPSG:4326', 'EPSG:2056');
    },
    matrix(){
      for(let i = 0; i < this.RESOLUTIONS.length; i++) {this.matrixIds.push(i);}
    }
  },
  methods: {
    /**
     * Init Openlayers map
     * 
     * @param {number[]} mapcenter center of the map in EPSG:3857
     * @param {number} mapzoom zommlevel
     * @returns {Map} initmap new openlayers map
     */
    setupOpenlayersMap (mapcenter,mapzoom) {
      return new Map({
        target: 'ol-container',
        layers: [
          new TileLayer({
            source: new OSM(),
          }) ],
        view: new View({
          center: mapcenter,
          zoom: mapzoom
        })
      })
    },

    wmtsSource(layerConfig, projection){
      console.log(this.matrixIds);
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
          html: '<a target="new" href="https://www.swisstopo.admin.ch/' +
            'internet/swisstopo/en/home.html">swisstopo</a>'
        })],
        url: '//wmts10.geo.admin.ch/1.0.0/{Layer}/default/' + timestamp + '/2056/{TileMatrix}/{TileCol}/{TileRow}.'+ extension,
        tileGrid: tileGrid,
        projection: projection,
        layer: layerConfig.serverLayerName,
        requestEncoding: 'REST'
      }))
    },

    setupWMTSLayer(wmtssource){
      return new TileLayer({
        source: wmtssource
      })
    },

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
            coordinateFormat: coordinate.createStringXY(4),
            //projection: 'EPSG:2056',
            target: document.getElementById('mousePosition'),
            undefinedHTML: '&nbsp;'
          })
        ]),
        logo: false,
      })
    },

    marker(position){
      console.log(position.timestamp, position.coords.latitude, position.coords.longitude);
      let coord = olProj.transform([position.coords.longitude,position.coords.latitude], 'EPSG:4326', 'EPSG:2056');
      console.log(coord);
    },

    message(mess){
      alert (mess);
    }
  },

  mounted() {
    //this.olmap = this.setupOpenlayersMap(this.center3857,this.zoom);
    this.matrix;
    this.olmap = this.setupMap(this.setupWMTSLayer(this.wmtsSource(this.layerConfig, this.projectionget)),this.center3857, this.zoom, this.projectionget);
    this.geoloc(this.marker, this.message, this.geooptions);
  }

}
</script>

<style scoped>
#ol-container {
  height: 500px;
}
#mousePosition {
  position: relative;
  height: 20px;
  width: 100%;
}
</style>