const bot = require('../bot');
require('./join');

bot.on('callback_query', (query) => {
  let callbackId = query.id;
  var replyChatId = query.message.chat.id;
  if (query.message.chat.type !== 'private') {
    return;
  }

  let data = null;
  try {
    data = JSON.parse(query.data);
  } catch (e) {}
  if (!data) {
    return;
  }

  var name = query.message.chat.first_name + " " + query.message.chat.last_name;

  switch (data[0]) {
    case 'join':
      require('./join')(callbackId, replyChatId, name, data[1], data[2]);
      break;
    default:
      break;
  }
});
