const bot = require('../bot');
const models = require('../database');
const Promise = require('bluebird');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/cancel(@\w+)*\s*/i;

let cancelTicket = (ticket, user, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return cancelTicket(ticket, user, t);
      });
  }
  return Promise.all([
    ticket.update(
      { isActive: false },
      { transaction: transaction }
    ),
    user.update(
      { isInQueue: false },
      { transaction: transaction }
    )
  ]);
};

let updateGroupAndCancelTicket = (group, ticket, user, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return updateGroupAndCancelTicket(group, ticket, user, t);
      });
  }

  return Promise.all([
    cancelTicket(ticket, user, transaction),
    group.decrement("totalNoOfPeople", {by: ticket.noOfPeople})
  ])
};

bot.onText(COMMAND_REGEX, (msg, match) => {
  var replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }

  let name = msg.chat.first_name + " " + msg.chat.last_name;
  let _user = null;
  let _ticket = null;

  bot.sendChatAction(replyChatId, "typing");
  models.User
    .findOrCreate({ where: { name: name, userId: replyChatId } })
    .then((users) => {
      _user = users[0];
      return models.Ticket
        .find({
          where: {
            userId: _user.userId,
            isActive: true
          }
        });
    })
    .then((ticket) => {
      _ticket = ticket;
      return _ticket.getGroup();
    })
    .then((group) => {
      if (group) {
        return updateGroupAndCancelTicket(group, _ticket, _user);
      }
      return cancelTicket(_ticket, _user);
    });
});
