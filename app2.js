let photoTexture;
const characterData = {
    firstName : document.getElementById('simpson-name'),
    lastName : document.getElementById('simpson-last'),
    age : document.getElementById('simpson-age'),
    description : document.getElementById('simpson-description'),
    photo : document.getElementById('simpson-photo'),
}

const apiUrl = 'https://localhost:5001/simpsons/Character';

const getnameData = async id =>{
    const response = await fetch(`${apiUrl}/${id}`);
    console.log(response);
    const nameData = await response.json();
    console.log(nameData);
    const { firstName, lastName, age, description, photo } = nameData;
    characterData.firstName.innerText = firstName;
    characterData.lastName.innerText = lastName;
    characterData.age.innerText = age;
    characterData.description.innerText = description;
    characterData.photo.src = photo;
    photoTexture = photo;
    
}

const url = new URL(window.location.href);

const id = url.searchParams.get('id');

getnameData(id);
