const apiUrl = '';

const apiResponse = async url=>{
     const response = await fetch(url);
     const data = response.json;
     console.log(data);
}

apiResponse();