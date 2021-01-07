<template>

  <img id="geoparking-logo" src="./assets/logo_geoparking.png"/>

  <!-- Bulma: menu tabs -->
  <div class="tabs is-centered">
    <ul>
      <li v-for="menu in menulist" :key="menu.name" :class="{ 'is-active': currentRoute === menu.route }">
          <router-link :to="menu.route"> {{menu.menuname}} </router-link>
      </li>
    </ul>
  </div>
  <!-- end Bulma: menu tabs -->
  <router-view />
</template>

<script>
export default {
  name: 'App',
  data(){
    return {
      menulist:[
        {
          menuname:"Page d'accueil",
          route:"/"
        },
        { 
          menuname:"2D OpenLayers",
          route:"/openlayers"
        },
        { 
          menuname:"3D Cesium",
          route:"/cesium"
        }
      ] 
    }
  },
  computed: {
    currentRoute(){
      return this.$route.path;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
  height: 100%;
  width: 100%;
}

#geoparking-logo {
  height: 20%;
  width: 20%;
}

</style>