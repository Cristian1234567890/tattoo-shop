import nodemailer from 'nodemailer';
import { env } from '../config/env';
import {
  renderMailTemplate,
  renderWelcomeUserTemplate,
  renderAppointmentReceiptTemplate,
  renderReferralInvitationTemplate,
} from '../templates/mail.template';

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
      from: `"Tattoo Hub" <${env.EMAIL}>`,
      to: to.trim(),
      subject: '⚡ Nueva solicitud de consulta de cliente - Tattoo Hub',
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
    } catch {
      return false;
    }
  }

  /**
   * Dispatches user creation / onboarding confirmation email
   */
  async sendWelcomeEmail(to: string, name: string, role: string = 'Cliente'): Promise<boolean> {
    if (!to || typeof to !== 'string' || !to.trim()) return false;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Tattoo Hub" <${env.EMAIL}>`,
      to: to.trim(),
      subject: '✨ ¡Bienvenido a Tattoo Hub! Tu cuenta ha sido confirmada',
      html: renderWelcomeUserTemplate(name, role),
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Dispatches appointment receipt and reminder
   */
  async sendAppointmentReceipt(
    to: string,
    data: {
      clientName: string;
      artistName: string;
      studioName: string;
      date: string;
      time: string;
      deposit: string;
      address: string;
    }
  ): Promise<boolean> {
    if (!to || typeof to !== 'string' || !to.trim()) return false;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Tattoo Hub" <${env.EMAIL}>`,
      to: to.trim(),
      subject: '📅 Cita Confirmada en Tattoo Hub - ' + data.artistName,
      html: renderAppointmentReceiptTemplate(data),
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Dispatches friend referral invitation
   */
  async sendReferralInvite(
    to: string,
    inviterName: string,
    inviteUrl: string,
    code: string
  ): Promise<boolean> {
    if (!to || typeof to !== 'string' || !to.trim()) return false;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Tattoo Hub" <${env.EMAIL}>`,
      to: to.trim(),
      subject: `🎁 ${inviterName} te ha invitado a unirte a Tattoo Hub (5% Dto)`,
      html: renderReferralInvitationTemplate(inviterName, inviteUrl, code),
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch {
      return false;
    }
  }
}

export const mailService = new MailService();
