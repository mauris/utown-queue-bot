
const bot = require('../bot');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/map(@\w+)*\s*/i;

bot.onText(COMMAND_REGEX, (msg, match) => {
  let replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }
  bot.sendChatAction(replyChatId, 'upload_photo');
  bot.sendPhoto(replyChatId, "https://scontent-sit4-1.xx.fbcdn.net/v/t1.0-9/14691139_10210466760522686_7236882079378429634_n.jpg?oh=a6f834653bcd2343704417f00d410419&oe=58A59525");
  bot.sendPhoto(replyChatId, "https://scontent-sit4-1.xx.fbcdn.net/v/t1.0-0/s480x480/14702359_10205731133598106_6823097246719895381_n.jpg?oh=75c1457eaf2278d0323369abed996b34&oe=58A01DC3", {caption: "There's also an amazing line up of performances at Basement of Residential College 4."});
});
