import {google} from 'googleapis';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import config from '../config';

export default function useSendMail() {
  async function getAccessToken() {
    const oauth2Client = new google.auth.OAuth2(
      config.SMTP.CLIENT_ID,
      config.SMTP.CLIENT_SECRET,
      config.SMTP.REDIRECT_URI
    );
    oauth2Client.setCredentials({refresh_token: config.SMTP.REFRESH_TOKEN});
    const res = await oauth2Client.getAccessToken();
    return res.token || '';
  }

  async function send(to: string, subject: string, mailContent: string) {
    try {
      const token = await getAccessToken();
      const transporter = nodemailer.createTransport({
        logger: config.NODE_ENV !== 'production',
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: config.SMTP.USER_NAME,
          clientId: config.SMTP.CLIENT_ID,
          clientSecret: config.SMTP.CLIENT_SECRET,
          refreshToken: config.SMTP.REFRESH_TOKEN,
          accessToken: token,
        },
      });

      const mailOptions: Mail.Options = {
        from: config.SMTP.SENDER,
        to,
        subject,
        html: mailContent,
      };

      if (config.SMTP.ENABLED) {
        await transporter.sendMail(mailOptions);
      } else {
        console.info('SMTP is disabled');
      }
    } catch (err) {
      console.error(err);
    }
  }

  return {
    send,
  };
}
