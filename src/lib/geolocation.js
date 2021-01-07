/**
  * Fonction de geoloccation
  * @param {Fonction} callback fonction appeler si la promesse aboutit
  * @param {Fonction} errorcallback fonction appeler si la promesse n'aboutit pas
  * @param {Dictionnaire} geooptions Differentes options
*/
export function geoloc(callback, errorcallback, geooptions){
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(callback, errorcallback, geooptions);
      } else {
        errorcallback('pas de geolocalisation')
        /* la géolocalisation n'est pas disponible */
      }   
}