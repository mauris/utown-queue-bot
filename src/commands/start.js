const bot = require('../bot');
const Promise = require('bluebird');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/start(@\w+)*\s*/i;

bot.onText(COMMAND_REGEX, (msg, match) => {
  var replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }

  let name = msg.chat.first_name;
  if (msg.chat.last_name) {
    name += " " + msg.chat.last_name;
  }
  bot.sendMessage(replyChatId, "Hi " + name + "! Welcome to UTown Pandemonium: Halloween Haunted Houses presented by UTown Residential Colleges.\n\nI will be your tour guide \u{1F608} this evening.\n\n* To join a queue, follow the instructions located at the entrances of the events. \n* Use the /cancel command to cancel your ticket and stop queueing. \n* You may only join one queue at a time.\n* Queue number may not be called in sequence and priority will be given to those who show up promptly after being called.\n* Use the /map command to get a map of what's happening. \n* Use the /status command to get the estimated waiting time for the event you're queueing for.")
});
