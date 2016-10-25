
const bot = require('../bot');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/map(@\w+)*\s*/i;

bot.onText(COMMAND_REGEX, (msg, match) => {
  let replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }
  return bot.sendMessage(replyChatId, 'This feature is currently not available yet. But we potentially can send a picture of the UTown map so that people know where to go.');
});
