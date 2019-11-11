const Container = document.getElementById('container');
const apiUrl = 'https://localhost:5001/simpsons/Character';

const getsimpsonsData = async() =>{
     const response = await fetch(apiUrl);
     //console.log(response);
     const simpsonsData = await response.json();
     //console.log(simpsonsData);
     //const { firstname, lastname, age } = simpsonsData;

     const getnameData = async event =>{
          console.log(event);
          console.log('hello');
          /*
          const response = await fetch(`${apiUrl}/${id}`);
          console.log(response);
          const nameData = await response.json();
          console.log(nameData);*/
     }

     simpsonsData.forEach(element => {
          const { firstName, lastName, age, description, photo, id } = element;
          Container.innerHTML  += `<div id="simpson-name">${firstName}</div>
          <div id="simpson-last">${lastName}</div>
          <div id="simpson-age">${age}</div>
          <div id="simpson-description">${description}</div>
          <button id = ${id}>Link</button>
          <img id="simpson-photo" src="${photo}"></div>`;
          const linkToImage = document.getElementById(id);
          linkToImage.addEventListener('click', getnameData);
     }); 
};




/*const apiResponse = async url=>{
     const response = await fetch(url);
     const data = response.json;
     console.log(data);
}
apiResponse(url);*/
getsimpsonsData();
