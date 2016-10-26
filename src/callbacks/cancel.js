const bot = require('../bot');

module.exports = (query) => {
  let userId = query.message.chat.id;
  let callbackId = query.id;
  bot.editMessageReplyMarkup({reply_markup: {inline_keyboard: [[]]}}, {chat_id: userId, message_id: query.message.message_id});
  return bot.editMessageText('Okay, your request was cancelled.', {chat_id: userId, message_id: query.message.message_id});
};
