const bot = require('../bot');
const models = require('utown-queue-db');
const moment = require('moment');
const Promise = require('bluebird');

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


  bot.sendChatAction(replyChatId, "typing");

  var eventCode = match[3];
  let _user = null;

  return models.User
    .findOrCreate({ where: { name: name, userId: replyChatId } })
    .then((users) => {
      _user = users[0];
      if (_user.isInQueue) {
        throw new Error('You are already queueing up for an activity.');
      }
      return Promise.all([
        models.Event.findOne({ where: { eventCode: eventCode } }),
        models.Ticket.findOne({ where: { userId: _user.userId }, order: [["ticketId", "DESC"]] })
      ]);
    })
    .spread((event, ticket) => {
      if (!event) {
        throw new Error('The event code entered is invalid. ):');
      }

      if (ticket && moment().diff(moment(ticket.datetimeRequested), 'minutes', true) < 2) {
        throw new Error('You have recently requested for a ticket. You need to wait for ' + moment(ticket.datetimeRequested).fromNow(true) + ' before you can request again.');
      }

      let keyboard = [];
      for (var i = 1; i <= event.maxPeoplePerGroup; ++i) {
        keyboard.push({
          text: ''+i,
          callback_data: JSON.stringify(["join", event.eventId, i]),
        });
      }

      return bot
        .sendMessage(replyChatId, "How many people are joining you in the queue (including yourself)?", {
          reply_markup: { inline_keyboard: [keyboard, [{ text: 'Cancel', callback_data: JSON.stringify(["cancel"]) }]] },
        });
    })
    .catch((err) => {
      bot.sendMessage(replyChatId, err.message);
    });

});
