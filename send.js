// send.js (requires nodemailer)
const nodemailer = require('nodemailer');
async function sendMail({from,to,subject,text,html}) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org', // or smtp.sendgrid.net
    port: 587,
    auth: { user: 'postmaster@YOUR_DOMAIN', pass: 'YOUR_SMTP_PASSWORD' }
  });
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}
