const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = 'http://192.9.242.158:8000'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICAgInJvbGUiOiAiYW5vbiIsCiAgICAiaXNzIjogInN1cGFiYXNlIiwKICAgICJpYXQiOiAxNjg4Mjc0MDAwLAogICAgImV4cCI6IDE4NDYxMjY4MDAKfQ.PVvrpfmyXINhbdIcfTsO3EoVYDPuEuEQJDvIlowFSRk'
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  /* Aqui se hace el get al api externo */
    async get(url) {
      try {
        const response = await fetch(url); 
        if (!response.ok) {
          return 0;
        }
        return response;
      } catch (error) {
        // Handle the error
        console.log('Error:', error.message);
        return 0;
      }
    },
    /* Mediante esta consulta traemos un solo registro de la db de cache */
    async getCacheById(id) {
      try {
        const { data, error } = await supabase
          .from('cache')
          .select('info')
          .eq('id', id)
          .single();
    
        if (error) {
          console.error(error);
          return null;
        }
        /*Validar si hay un registro o solo trajo la respuesta*/
        console.log('Data consultada')
        if ('info' in data)
          return data.info;
        else
          return null
      } catch (error) {
        return null;
      }
    },
    /* Mediante esta consulta podemos traer todos los registros */
    async getAllCache() {
      try {
        const { data, error } = await supabase
          .from('cache')
          .select('*');
    
        if (error) {
          console.error(error);
          return null;
        }
        return data;
      } catch (error) {
        console.log(error)
        return null;
      }
    },
    /* Este modulo esta creado para actualizar los registos */
    async putRecord(recordId, updatedData) {
      try {
        const { data, error } = await supabase
          .from('cache')
          .update({info: updatedData})
          .eq('id', recordId);
    
        if (error) {
          console.error(error);
          return null;
        }
        console.log('Data actualizada')
        return data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    /* Este modulo esta creado para ingresar nuevos registros */
    async postCache(identificador, informacion) {
      try {
        const { data, error } = await supabase
          .from('cache')
          .insert([{id: identificador, info: informacion}])
        if (error) {
          console.error(error);
          return null;
        }
        console.log('Data ingresada')
        return data;
      } catch (error) {
        return null;
      }
    },
  };  