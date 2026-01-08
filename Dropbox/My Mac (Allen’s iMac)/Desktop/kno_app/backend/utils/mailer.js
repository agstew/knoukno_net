const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter;
if (SMTP_HOST && SMTP_USER){
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
} else {
  // create a test account transporter when no SMTP configured
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS
    }
  });
}

module.exports = {
  sendMail: (opts) => transporter.sendMail({ from: process.env.MAIL_FROM || 'no-reply@knoukn o.com', ...opts })
};
