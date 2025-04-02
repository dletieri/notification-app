const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// const emailTransporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Usar host em vez de service para maior controle
  port: 587, // Porta para TLS
  secure: false, // false para porta 587 (TLS), true para porta 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // Timeout de 10 segundos
  greetingTimeout: 10000,
  socketTimeout: 10000,
  logger: true, // Ativar logs detalhados
  debug: true, // Mostrar logs de depuração
});

// Configuração do Telegram
console.log('Configurando Telegram com o seguinte token:');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN);
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Função para capturar chatId (para depuração)
telegramBot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`ChatID do usuário ${msg.from.first_name}: ${chatId}`);
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

// Função de envio de mensagem via Telegram
async function sendTelegram(to, message) {
  try {
    await telegramBot.sendMessage(to, message);
    return { success: true, message: `Telegram enviado para ${to}` };
  } catch (error) {
    return { success: false, message: `Erro ao enviar Telegram: ${error.message}` };
  }
}



module.exports = { sendEmail, sendTelegram };