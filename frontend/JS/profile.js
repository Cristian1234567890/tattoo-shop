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
  });