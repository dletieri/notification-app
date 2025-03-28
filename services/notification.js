const nodemailer = require('nodemailer');
require('dotenv').config();

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };
  try {
    await emailTransporter.sendMail(mailOptions);
    return { success: true, message: `E-mail enviado para ${to}` };
  } catch (error) {
    return { success: false, message: `Erro ao enviar e-mail: ${error.message}` };
  }
}

module.exports = { sendEmail };