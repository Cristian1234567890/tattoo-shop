/*const messageBox = document.querySelector('.js-message');
const btn = document.querySelector('.js-message-btn');
const card = document.querySelector('.js-profile-card');
const closeBtn = document.querySelectorAll('.js-message-close');

btn.addEventListener('click',function (e) {
    e.preventDefault();
    card.classList.add('active');
});

closeBtn.forEach(function (element, index) {
    console.log(element);
    element.addEventListener('click',function (e) {
        e.preventDefault();
        card.classList.remove('active');
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const draggableElement = document.querySelector(".draggable");
    const droppableElement = document.querySelector(".droppable");
  
    // Función para iniciar el arrastre
    draggableElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", event.target.id);
    });
  
    // Función para permitir soltar el elemento arrastrado
    droppableElement.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
  
    // Función para soltar el elemento en el área objetivo
    droppableElement.addEventListener("drop", (event) => {
      event.preventDefault();
      const data = event.dataTransfer.getData("text");
      const element = document.getElementById(data);
      droppableElement.appendChild(element);
    });
  });

  document.getElementById("file-input").addEventListener("change", function(event) {
    var file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      var reader = new FileReader();
      reader.onload = function() {
        var image = document.getElementById("selected-image");
        image.src = reader.result;
        document.getElementById("image-container").style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });*/
