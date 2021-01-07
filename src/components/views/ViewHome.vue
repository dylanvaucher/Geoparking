<template>
  <!-- Titre et logos -->
  <div style="display: inline-block; float: left; padding-left: 10px; padding-top: 20px;">
    <img class="logo-heig-vd" src="@/assets/logo_heig_vd.png" width="200" alt="logo HEIG-VD">
  </div>
  <div style="display: inline-block; float: right; padding-right: 10px; padding-top: 20px;">
    <img class="logo-hes-so" src="@/assets/logo_hes_so.png" width="200" alt="logo HES-SO">
  </div>
  <div style="padding-bottom:30px">
    <p class="title">{{hellomessage}}</p>
    <h1>Projet réalisé par Dylan Vaucher et Seraina Silberschmidt</h1>
    <h1>Géoinformatique opérationnelle : Développement avancé d’outils (GIO1)</h1>
    <h1>Master en développement territorial</h1>
  </div>

<!-- Légende carte 2D -->
<div class="clearfix float">
    <p>Partie 2D - OpenLayers: Visualisation de la disponibilité de places de stationnement à Genève</p>
</div>
<div class="clearfix float">
    <p>Légende</p>   
</div>
<!-- Utilisation de la méthode clearfix pour faire flotter les éléments  -->
<div class="clearfix float">
   <img src="@/assets/parking_vert.png" width=30>
   <p>Parking libre</p>
</div>
<div class="clearfix float">
   <img src="@/assets/parking_orange.png" width=30>
   <p>Peu de places disponibles</p>
</div>
<div class="clearfix float">
   <img src="@/assets/parking_rouge.png" width=30>
   <p>Parking complet</p>
</div>
<div class="clearfix float">
   <img src="@/assets/parking_bleu.png" width=30>
   <p>Information indisponible</p>
</div>

</template>

<script>
export default {
  data(){
    return{
      hellomessage:"Page d'accueil - GEOPARKING"
    }
  }
}
</script>


<style>
/* Texte avec ombrage */
h1 {	
	color: #FFF;
	text-shadow: 1px 1px 1px #333;
} 

/* Légende disponibilité des parkings */
.float > * {
    float:left;
    margin-left:10px;
    margin-right:5px;
    margin-bottom:5px;
}
.clearfix:before,
.clearfix:after {
    content: " ";
    display: table;
}

.clearfix:after {
    clear: both;
}

</style>