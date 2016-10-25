const bot = require('../bot');
const models = require('utown-queue-db');
const Promise = require('bluebird');
const moment = require('moment');

let createTicket = (numberOfPeople, _user, _event, group, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return createTicket(numberOfPeople, _user, _event, group, t);
      });
  }

  var promises = [];
  promises.push(
    models.Ticket
      .create(
        {
          "userId": _user.userId,
          "eventId": _event.eventId,
          "groupId": group ? group.groupId : null,
          "datetimeStart": group ? models.sequelize.fn("NOW") : null,
          "noOfPeople": numberOfPeople
        },
        { transaction: transaction }
      )
  );

  promises.push(
    _user
      .update(
        {
          "isInQueue": true
        },
        { transaction: transaction }
      )
  );

  return Promise.all(promises);
};

let createTicketAndGroup = (numberOfPeople, _user, _event, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return createTicketAndGroup(numberOfPeople, _user, _event, t);
      });
  }
  return models.Group
    .create(
      {
        eventId: _event.eventId,
        totalNoOfPeople: numberOfPeople
      },
      { transaction: transaction }
    )
    .then((group) => {
      return createTicket(numberOfPeople, _user, _event, group, transaction);
    });
}

module.exports = (query, eventId, num) => {
  let name = query.message.chat.first_name;
  if (query.message.chat.last_name) {
    name += " " + query.message.chat.last_name;
  }
  let userId = query.message.chat.id;
  let callbackId = query.id;

  let _user = null;
  let _event = null;

  // hide the keyboard now that it's done.

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
          return models.Event.findOne({ where: { eventId: eventId }, transaction: t });
        })
        .then((event) => {
          if (!event) {
            throw new Error('The event code entered was not found.');
          }
          _event = event;
          if (num >= _event.minPeoplePerGroup) {
            return createTicketAndGroup(num, _user, _event, t);
          }
          return createTicket(num, _user, _event, null, t);
        })
        .then((result) => {
          let ticket = result[0];
          bot.answerCallbackQuery(callbackId, 'You have joined the queue for ' + _event.eventName + '.', true);
          if (num >= _event.minPeoplePerGroup) {
            return bot.editMessageText('Ticket #' + ticket.ticketId + '\n\nYou have joined the queue for ' + _event.eventName + ' with ' + num + ' people.\n\nI will notify you when your group has been formed and when it is 5 minutes before your turn. Show up promptly or I will give your turn to someone else \u{1F608}.', {chat_id: userId, message_id: query.message.message_id});
          }
          return bot.editMessageText('Ticket #' + ticket.ticketId + '\n\nYou have joined the queue for ' + _event.eventName + ' with ' + num + ' people.\n\nThe bot will now form group for your ticket.\n\nI will notify you when your group has been formed and when it is 5 minutes before your turn. Show up promptly or I will give your turn to someone else \u{1F608}.', {chat_id: userId, message_id: query.message.message_id});
        })
    })
    .catch((err) => {
      bot.sendMessage(userId, err.message);
    });
};
