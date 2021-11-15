import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import config from '../config';

export default function useSendMail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    logger: config.NODE_ENV !== 'production',
    auth: {
      user: config.SMTP.USER_NAME,
      pass: config.SMTP.PASSWORD,
    },
  });

  async function send(to: string, subject: string, mailContent: string) {
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
  }

  return {
    send,
  };
}
