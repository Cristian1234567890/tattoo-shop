const express = require("express");
const { pokemon } = require("./utils");
const app = express();

const PORT = 3000;

/* Con este get traes la info de los pokemones en el 'cache' */
app.get("/cache", async (req, res) => {
  const result = await pokemon.getCache();
  console.log(result)
  if(result==null){
    res.status(500).json({message: 'Algo sucedio'});
  }else{
    res.json(result);
  }
});

/* Mediante esta ruta se devolvera toda la informacion del pokemon */
app.get("/pokemon/:id", async (req, res, ) => {
  const { id } = req.params;
  const response = await pokemon.get(id);
  if(response==0){
    res.status(500).json({message: 'Algo sucedio'});
  }else{
    res.json(response);
  }
});

/* Mediante esta ruta se devolvera toda la informacion del pokemon */
app.get("/habilidad/:id", async (req, res) => {
  const { id } = req.params;
  const response = await pokemon.getPokemAbility(id);
  if(response==0){
    res.status(500).json({message: 'Algo sucedio'});
  }else{
    res.json(response);
  }
});

/* Esto es para evitar cross origin error, al usar un framework o contenedores en la misma maquina */
app.use(function(req, res, next) {
  req.setTimeout(120000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PATCH, DELETE');
  return next();
});

app.listen(PORT, () => {
  console.log(`Server está ejecutando en el puerto ${PORT}`);
});
