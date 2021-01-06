import axios from 'axios'
export async function getSITGParking(url,query){
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
    return response.data;
    
}