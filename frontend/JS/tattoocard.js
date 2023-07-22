var messageBox = document.querySelector('.js-message');
var btn = document.querySelector('.js-message-btn');
var card = document.querySelector('.js-profile-card');
var closeBtn = document.querySelectorAll('.js-message-close');

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