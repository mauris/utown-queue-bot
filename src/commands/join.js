const bot = require('../bot');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/join(@\w+)*(\s+(.+))*\s*/i;

bot.onText(COMMAND_REGEX, (msg, match) => {
  let replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }

  let name = msg.chat.first_name;
  if (msg.chat.last_name) {
    name += " " + msg.chat.last_name;
  }

  var eventCode = match[3];
  bot
    .sendMessage(replyChatId, "How many people are joining you in the queue (including yourself)?", {
      reply_markup: {
          inline_keyboard: [[
            {
              text: "1",
              callback_data: JSON.stringify(["join", eventCode, "1"]),
            },
            {
              text: "2",
              callback_data: JSON.stringify(["join", eventCode, "2"]),
            },
            {
              text: "3",
              callback_data: JSON.stringify(["join", eventCode, "3"]),
            },
            {
              text: "4",
              callback_data: JSON.stringify(["join", eventCode, "4"]),
            },
            {
              text: "5",
              callback_data: JSON.stringify(["join", eventCode, "5"]),
            },
            {
              text: "6",
              callback_data: JSON.stringify(["join", eventCode, "6"]),
            }
          ]],
      },
    })
    .catch(console.error);
});
