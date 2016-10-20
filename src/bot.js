const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN || '';
// Setup polling way

var options = {
  polling: {
    interval: 5000,
    timeout: 20
  }
};

module.exports = new TelegramBot(token, options);
