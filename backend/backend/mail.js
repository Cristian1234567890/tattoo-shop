// Importa el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');
const {decode} = require('base64-arraybuffer');
const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
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
// Configuración del servicio de correo
const mailgunOptions = {
    auth: {
      api_key: 'TU_API_KEY', // Reemplaza con tu API key de Mailgun
      domain: 'TU_DOMINIO', // Reemplaza con tu dominio de Mailgun
    },
  };
const transporter = nodemailer.createTransport(mailgunTransport(mailgunOptions));

module.exports = {
    /* Funcion para upload una imagen a la galeria */
    async sendEmail(token, refresh, to, email, img) {
        img = decode(img)
        await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
        });
        const mailOptions = {
            from: 'Remitente <remitente@tudominio.com>', // Remplaza con tu dirección de correo
            to: to,
            subject: 'Contacto de cliente',
            html: `<p>${email}</p><br><img src="data:image/jpeg;base64,${img}" alt="Imagen adjunta">`,
          };   
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
            } else {
                console.log('Correo enviado:', info.response);
            }
        });  
    }
  };