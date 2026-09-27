import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { renderMailTemplate } from '../templates/mail.template';

// Reusable transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL,
    pass: env.PASSW,
  },
});

export class MailService {
  /**
   * Dispatches customer inquiry email with optional image attachment
   */
  async sendEmail(to?: string, emailText?: string, img?: string): Promise<boolean> {
    if (!to || typeof to !== 'string' || to.trim().length === 0) {
      return false;
    }

    const messageText = emailText || '';
    let rawBase64 = '';
    let imgSrc = '';

    if (img && typeof img === 'string') {
      const trimmedImg = img.trim();
      if (trimmedImg.startsWith('data:')) {
        const commaIdx = trimmedImg.indexOf(',');
        if (commaIdx !== -1) {
          rawBase64 = trimmedImg.substring(commaIdx + 1);
          imgSrc = trimmedImg;
        } else {
          rawBase64 = trimmedImg;
          imgSrc = `data:image/png;base64,${trimmedImg}`;
        }
      } else {
        rawBase64 = trimmedImg;
        imgSrc = `data:image/png;base64,${trimmedImg}`;
      }
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: env.EMAIL,
      to: to.trim(),
      subject: 'Contacto de cliente',
      text: messageText,
      html: renderMailTemplate(messageText, imgSrc),
      attachments: rawBase64
        ? [
            {
              filename: 'image.jpg',
              content: rawBase64,
              encoding: 'base64',
            },
          ]
        : [],
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      // In development / testing or when dummy credentials are provided, return false gracefully
      return false;
    }
  }
}

export const mailService = new MailService();
