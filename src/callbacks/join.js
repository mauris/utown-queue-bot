const bot = require('../bot');
const models = require('../database');
const Promise = require('bluebird');

module.exports = (callbackId, userId, username, code, num) => {
  let _user = null;
  let _event = null;
  return models.User
    .findOrCreate({ where: { name: username, userId: userId } })
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
      return models.sequelize
        .transaction((t) => {
          var promises = [];
          promises.push(
            models.Ticket
              .create(
                {
                  "userId": _user.userId,
                  "eventId": _event.eventId,
                  "noOfPeople": num
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
    })
    .then(() => {
      bot.answerCallbackQuery(callbackId, '', true);
      bot.sendMessage(userId, 'You have joined the queue for ' + _event.eventName + ' with ' + num + ' people.\n\nI will notify you when it is 5 minutes before your turn. Show up promptly or I will give your turn to someone else \u{1F608}.');
    })
    .catch((err) => {
      bot.sendMessage(userId, err.message);
    });
};
