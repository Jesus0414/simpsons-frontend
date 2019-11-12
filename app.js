const Container = document.getElementById('container');
const apiUrl = 'https://localhost:5001/simpsons/Character';

const getsimpsonsData = async() =>{
     const response = await fetch(apiUrl);
     const simpsonsData = await response.json();
     simpsonsData.forEach(element => {
          const { firstName, lastName, age, description, photo, id } = element;
          Container.innerHTML  += `<div id="simpson-name">${firstName}</div>
          <div id="simpson-last">${lastName}</div>
          <div id="simpson-age">${age}</div>
          <div id="simpson-description">${description}</div>
          <a href="index2.html?id=${id}" id = ${id}>${firstName}</button>
          <img id="simpson-photo" src="${photo}"></div>`;
     }); 
};

getsimpsonsData();
