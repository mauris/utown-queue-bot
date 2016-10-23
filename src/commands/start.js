const bot = require('../bot');
const Promise = require('bluebird');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/start(@\w+)*\s*/i;

bot.onText(COMMAND_REGEX, (msg, match) => {
  var replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }

  bot.sendMessage(replyChatId, "Hi " + name + "! Welcome to UTown Pandemonium: Halloween Haunted Houses presented by UTown Residential Colleges.\n\nI will be your tour guide \u{1F608} this evening.")
  let name = msg.chat.first_name;
  if (msg.chat.last_name) {
    name += " " + msg.chat.last_name;
  }
});
