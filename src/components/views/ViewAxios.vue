<template>
<div id="app-6">
  <p>{{ lieu.lieu }}</p>
  <p>{{ lieu.lat }}</p>
  <p>{{ lieu.long }}</p>
  <input v-model="searchquery" v-on:change="getGeoAdminSearch(searchapiURL,searchquery,searchtype)" placeholder="Recherchez de lieu">
</div>
  <!-- Bulma: menu tabs -->
  <div id="SITG-card" class="card">
    <div class="card-content">
      <p class="title">
        “{{nbPlace}}”
      </p>
      <p class="subtitle">
        SITG
      </p>
    </div>
    <footer class="card-footer">
      <p class="card-footer-item">
        <span>
          Check more on <a target="_blank" rel="noopener noreferrer" :href="SITGURL">SITG Parking en temps réel</a>
        </span>
      </p>
    </footer>
  </div>
  <!-- end Bulma: menu tabs -->
</template>

<script>
import axios from 'axios'
import {getSITGParking} from '../../lib/requete_SITG.js';
//import Vue from 'vue'

export default {
  data(){
    return{
      SITGURL:"https://ge.ch/terags/rest/services/SITG/INFOMOB_PARKING_TEMPS_REEL/MapServer/0",
      SITGapiURL:"https://ge.ch/terags/rest/services/SITG/INFOMOB_PARKING_TEMPS_REEL/MapServer/0/query?",
      SITGquery:"where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson",
      nbPlace:"",
      searchapiURL: "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=",
      searchquery:"",
      searchtype: "&type=locations",
      lieu: {
        lieu: "",
        lat: "",
        long: ""
      }
    }
  },
  methods: {
    /**
     * [Get] dumb quote from Donald Trump
     * 
     * @param {String} url url of the api
     * @param {String} query query send to the api (word)
     * @returns {Promise<String>} quote from the API || default string if quote not found || default string if error
     * @catch error from the request 
     */
    async getSITGParking(url,query){
      let response = await axios.get(url+query)
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
      console.log(response);
      return response.data.features[11].attributes.PLACE_DISPONIBLE;
    },

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
      console.log(response);
      this.lieu.lieu = response.data.results[0].attrs.label;
      this.lieu.lat = response.data.results[0].attrs.lat;
      this.lieu.long = response.data.results[0].attrs.lon;
      //return response.data.results[0].attrs.label;
    }
  },
  async mounted() {
    this.searchquery;
    this.nbPlace = await this.getSITGParking(this.SITGapiURL,this.SITGquery);
    //this.lieu = await this.getGeoAdminSearch(this.searchapiURL,this.searchquery,this.searchtype)
  },
}
</script>

<style scoped>
#SITG-card{
  width: 50%;
  margin: auto;
}
</style>
