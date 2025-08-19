import {Injectable} from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as process from 'node:process';

@Injectable()
export class MailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    sgMail.setApiKey(apiKey);
  }
  async sendPasswordReset(email: string, resetLink: string){
    const msg = {
      to: email,
      from: process.env.MAIL_FROM || 'no-reply@furniture.com',
      subject: 'Reset your password',
      text: `Nhấn vào link này để reset password: ${resetLink}`,
      html: `<p>Nhấn vào link để reset password: <a href="${resetLink}" target="_blank">${resetLink}</a></p>
             <p>Link này có hiệu lực trong 15p.</p>
             `,
    };

    await sgMail.send(msg);
    return { message: 'Email reset password đã được gửi' };
  }
}