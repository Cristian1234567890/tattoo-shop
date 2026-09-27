import { Request, Response } from 'express';
import { mailService } from '../services/mail.service';

export class MailController {
  async sendMail(req: Request, res: Response): Promise<void> {
    const { to, email, img } = req.body || {};

    if (!to || typeof to !== 'string' || to.trim().length === 0) {
      res.status(400).type('text/plain').send('Error al enviar correo');
      return;
    }

    const sent = await mailService.sendEmail(to, email, img);
    if (sent) {
      res.status(200).type('text/plain').send('Mensaje enviado');
    } else {
      res.status(500).type('text/plain').send('Error al enviar correo');
    }
  }
}

export const mailController = new MailController();
