// Importa el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');
const {decode} = require('base64-arraybuffer');
const nodemailer = require('nodemailer');
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

    /* Funcion para upload una imagen a la galeria */
    async sendEmail(token, refresh, email, img) {
        img = decode(img)

    }
  };