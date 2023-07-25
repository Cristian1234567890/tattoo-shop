// Importa el cliente de Supabase
require("dotenv").config();
const nodemailer = require("nodemailer");
const { template } = require("./mail-template.js");

// Configuración del servicio de correo (Gmail)
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSW,
  },
});

module.exports = {
  /* Funcion para upload una imagen a la galeria */
  async sendEmail(to, email, img) {
    imgsrc = "data:image/png;base64," + img;
    const mailOptions = {
      from: process.env.EMAIL, // Remplaza con tu dirección de correo
      to: to,
      subject: "Contacto de cliente",
      text: email,
      html: template(email, imgsrc),
      attachments: [
        {
          filename: "image.jpg", // Replace with the desired image filename
          content: img,
          encoding: "base64",
        },
      ],
    };
    try {
      await this.sender(mailOptions);
      return "Correo enviado";
    } catch (error) {
      return undefined;
    }
  },
  async sender(mailOptions) {
    return transporter.sendMail(mailOptions);
  },
};
