export function geoloc(callback, errorcallback, geooptions){
    //
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(callback, errorcallback, geooptions);
      } else {
        errorcallback('pas de geolocalisation')
        /* la géolocalisation n'est pas disponible */
      }   
}