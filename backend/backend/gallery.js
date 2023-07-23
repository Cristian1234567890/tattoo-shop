// Importa el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');
const {decode} = require('base64-arraybuffer')
require("dotenv").config();
const supabase = createClient(
    process.env.SUPABASEURL,
    process.env.SUPABASEKEY,
    {
      auth: {
        autoRefreshToken: false, // All my Supabase access is from server, so no need to refresh the token
        detectSessionInUrl: false, // We are not using OAuth, so we don't need this. Also, we are manually "detecting" the session in the server-side code
        persistSession: false, // All our access is from server, so no need to persist the session to browser's local storage
      },
    }
  );

module.exports = {
    /* Funcion para extrar una lista de imagenes */
    async getListFromClient(token, refresh, id) {
        await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
        });
        const { data, error } = await supabase
        .storage
        .from('tatto-app-bucket')
        .list('id', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        })
        return data
    },

    /* Funcion para extraer una imagen */
    async getImage(token, refresh, id, img) {
        await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
        });
        const { data, error } = await supabase
        .storage
        .from('tatto-app-bucket')
        .download(`${id}/${img}`);
        return data
    },

    /* Funcion para eliminar imagen de galeria */
    async delImage(token, refresh, id, img) {
        await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
        });
        const { data, error } = await supabase
        .storage
        .from('tatto-app-bucket')
        .remove(`${id}/${img}`);
        return data
    },

    /* Funcion para upload una imagen a la galeria */
    async postImage(token, refresh, id, img) {
        await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
        });
        const { data, error } = await supabase
        .storage
        .from('tatto-app-bucket')
        .upload(`${id}/${img}`, decode(img), {
            contentType: 'image/png',
            upsert: true
        })
        return data
    }
  };