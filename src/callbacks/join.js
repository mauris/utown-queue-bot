const bot = require('../bot');
const models = require('utown-queue-db');
const Promise = require('bluebird');

let createTicket = (numberOfPeople, _user, _event) => {
  return models.sequelize
    .transaction((t) => {
      var promises = [];
      promises.push(
        models.Ticket
          .create(
            {
              "userId": _user.userId,
              "eventId": _event.eventId,
              "noOfPeople": numberOfPeople
            },
            { transaction: t }
          )
      );

      promises.push(
        _user
          .update(
            {
              "isInQueue": true
            },
            { transaction: t }
          )
      );

      return Promise.all(promises);
    });
};

module.exports = (query, code, num) => {
  let name = query.message.chat.first_name + " " + query.message.chat.last_name;
  let userId = query.message.chat.id;
  let callbackId = query.id;

  let _user = null;
  let _event = null;

  bot.sendChatAction(userId, "typing");
  bot.editMessageReplyMarkup({reply_markup: {inline_keyboard: [[]]}}, {chat_id: userId, message_id: query.message.message_id});
  return models.User
    .findOrCreate({ where: { name: name, userId: userId } })
    .then((users) => {
      _user = users[0];
      if (_user.isInQueue) {
        throw new Error('You are already queueing up for an activity.');
      }
      return models.Event
        .find({ where: { eventCode: code } });
    })
    .then((event) => {
      if (!event) {
        throw new Error('The event code entered was not found.');
      }
      _event = event;
      return createTicket(num, _user, _event);
    })
    .then((result) => {
      let ticket = result[0];
      bot.answerCallbackQuery(callbackId, 'You have joined the queue for ' + _event.eventName + '.', true);
      bot.sendMessage(userId, 'Ticket #' + ticket.ticketId + '\n\nYou have joined the queue for ' + _event.eventName + ' with ' + num + ' people.\n\nI will notify you when it is 5 minutes before your turn. Show up promptly or I will give your turn to someone else \u{1F608}.', {hide_keyboard: true});
    })
    .catch((err) => {
      bot.sendMessage(userId, err.message);
    });
};
