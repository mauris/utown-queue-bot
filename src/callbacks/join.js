const bot = require('../bot');
const models = require('utown-queue-db');
const Promise = require('bluebird');
const moment = require('moment');

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
  let name = query.message.chat.first_name;
  if (query.message.chat.last_name) {
    name += " " + query.message.chat.last_name;
  }
  let userId = query.message.chat.id;
  let callbackId = query.id;

  let _user = null;
  let _event = null;

  bot.sendChatAction(userId, "typing");
  bot.editMessageReplyMarkup({reply_markup: {inline_keyboard: [[]]}}, {chat_id: userId, message_id: query.message.message_id});
  return models.sequelize
    .transaction((t) => {
      return models.User
        .findOrCreate({ where: { name: name, userId: userId } })
        .then((users) => {
          _user = users[0];
          if (_user.isInQueue) {
            throw new Error('You are already queueing up for an activity.');
          }
          return Promise.all([
            models.Event.find({ where: { eventCode: code } }),
            _user.getTickets({ order: [["ticketId", "DESC"]], limit: 1 })
          ]);
        })
        .spread((event, tickets) => {
          if (!event) {
            throw new Error('The event code entered was not found.');
          }
          _event = event;
          console.log(moment().diff(moment(tickets[0].datetimeRequested), 'minutes', true));
          if (tickets[0] && moment().diff(moment(tickets[0].datetimeRequested), 'minutes', true) < 2) {
            throw new Error('You have recently requested for a ticket. You need to wait for ' + moment(tickets[0].datetimeRequested).fromNow(true) + ' before you can request again.');
          }
          return createTicket(num, _user, _event);
        })
        .then((result) => {
          let ticket = result[0];
          bot.answerCallbackQuery(callbackId, 'You have joined the queue for ' + _event.eventName + '.', true);
          bot.sendMessage(userId, 'Ticket #' + ticket.ticketId + '\n\nYou have joined the queue for ' + _event.eventName + ' with ' + num + ' people.\n\nThe bot will now form group for your ticket.\n\nI will notify you when your group has been formed and when it is 5 minutes before your turn. Show up promptly or I will give your turn to someone else \u{1F608}.', {hide_keyboard: true});
        })
    })
    .catch((err) => {
      bot.sendMessage(userId, err.message);
    });
};
