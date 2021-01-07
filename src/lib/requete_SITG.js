//Import Axios
import axios from 'axios'
/**
  *Requete SITG pour les parkings
  * @returns {json} JSon issue de la requete des arkit
 */
export async function getSITGParking(){
    let url = "https://ge.ch/terags/rest/services/SITG/INFOMOB_PARKING_TEMPS_REEL/MapServer/0/query?";
    let query ="where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson";
    let response = await axios.get(url+query)
      .catch(error => {
        console.error(error);
        return 0
      });
    //request error
    if(response == 0){
      return "Ouch an error occurred"
    }
    // don't find an answer
    if(response.data.count == 0){
      return "Didn't found any answers"
    }
    // Get first quote
    return response.data;
    
}