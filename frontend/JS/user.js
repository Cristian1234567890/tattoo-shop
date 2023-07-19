const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', function() {
  menu.classList.toggle('open');
});

document.addEventListener('click', function(event) {
  if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
    menu.classList.remove('open');
  }
});

  