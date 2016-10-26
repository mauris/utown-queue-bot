
const bot = require('../bot');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/about(@\w+)*\s*/i;

bot.onText(COMMAND_REGEX, (msg, match) => {
  let replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }
  return bot.sendMessage(replyChatId, '*UTown Pandemonium: Halloween Haunted Houses*\n\nBrought to you by:\n- Tembusu College\n- Residential College 4\n- College of Alice and Peter Tan\n- Cinnamon College\n- Yale-NUS College\n\nToyol was conceived by ZeQi and written by Sam. You can find my remains at https://github.com/mauris/utown-queue-bot', { parse_mode: 'Markdown', disable_web_page_preview: true });
});
