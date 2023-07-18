document.getElementById("createUserForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita que el formulario se envíe y la página se refresque

    const selectedOption = document.getElementById("options").value;

    // Mostrar mensaje solo si la opción seleccionada es "opcion2"
    if (selectedOption === "Tatuador") {
        const mensajeEmergente = document.getElementById("mensajeEmergente");
        mensajeEmergente.style.display = "block";
    }
});

function continuar() {
    // Lógica para continuar
    //alert("Continuar");
    ocultarMensaje();
}

function salir() {
    // Lógica para salir
    //alert("Salir");
    ocultarMensaje();
}

function ocultarMensaje() {
    const mensajeEmergente = document.getElementById("mensajeEmergente");
    if (mensajeEmergente) {
        mensajeEmergente.style.display = "none";
    }
}