const cache = require("./cache");
const { get, getAllCache, getCacheById, putRecord, postCache } = require("./remote");

module.exports = {
  pokemon: {

    /* consulta hacia hacia db */
    async getCache() {
      return await getAllCache();
    },

    /* consulta hacia db */
    async getCacheDB(id) {
      return await getCacheById(id);
    },

    /* y esto crea la estructura necesaria */
    getPokemonStructure({ pokemon, fromCache = false }) {
      return {
        fromCache,
        pokemon,
      };
    },

    /* Esto simplemente agrega  el id del pokemon al url*/
    getPokemonUrl(pokemon) {
      return `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
    },

    /* Esta funcion se encarga de consultar el cache o realizar la consulta */
    async get(pokemonId) {
      let fromCache, pokemon;
      var now = new Date();
      var cache = await this.getCacheDB(pokemonId);
      /* Aqui validamos si ya existe el pokemon como registro */
      if (cache!=null)
      {
        date_init = new Date(cache.currentDate)
        date = now - date_init
        minutos = Math.floor(date / (1000*60));
        console.log('Minutos transcurridos: ', minutos)
        if(minutos <= 5)
        {
          pokemon = cache.pokemon;
          fromCache = true;
          console.log(`La informacion viene del cache del servidor sin actualizar.`);
        }
        else{
          pokemon = await this.getPokemonObj(pokemonId);
          if(pokemon==0){
            return 0
          }
          var currentDate = new Date();
          fromCache = false;
          result = await putRecord(pokemonId,{pokemon, currentDate})
          console.log(`La informacion estaba en cache y se actualizo.`);
        }
      } else {
        pokemon = await this.getPokemonObj(pokemonId);
        if(pokemon==0){
          return 0
        }
        var currentDate = new Date();
        await postCache(pokemonId,{pokemon, currentDate})
        fromCache = false;
      }
      return this.getPokemonStructure({
        pokemon,
        fromCache,
      });
    },

    /* Esta funcion se encarga de realizar la consulta y traer los datos */
    async getPokemonObj(pokemon) {
      const rawResponse = await get(
        `https://pokeapi.co/api/v2/pokemon/${pokemon}`
      );
      if(rawResponse==0){
        return 0
      }
      var response = await rawResponse.json();
      var speciesUrl = await get(response.species.url);
      var responseSpecies = await speciesUrl.json();
      var chainUrl = await get(
        responseSpecies.evolution_chain.url
      );
      var responseChain = await chainUrl.json();
      let evolChain = [];
      evolChain.push({
        name: responseChain.chain.species.name,
        is_baby: responseChain.chain.is_baby,
      });
      let child = responseChain.chain.evolves_to;
      while (child.length > 0) {
        evolChain.push({
          name: child[0].species.name,
          is_baby: child[0].is_baby,
        });
        child = child[0].evolves_to;
      }
      return {
        name: `${response.name} (${response.id})`,
        id: response.id,
        sprites: {
          front: response.sprites.front_default,
          back: response.sprites.back_default,
        },
        weight: response.weight,
        height: response.height,
        abilities: response.abilities,
        evolutions: evolChain,
      };
    },

    /* Esta funcion es para hacer la consulta por habilidades */
    async getPokemAbility(abilidad) {
      const rawResponse = await get(
        `https://pokeapi.co/api/v2/ability/${abilidad}/`
      );
      if(rawResponse==0){
        return 0
      }
      const response = await rawResponse.json();
      let pokemones = [];
      for (let i = 0; i < response.pokemon.length; i++) {
        pokemones.push({
          name: response.pokemon[i].pokemon.name,
          is_hidden: response.pokemon[i].is_hidden,
        });
      }
      return { name: response.name, pokemones: pokemones };
    },
  },
};
