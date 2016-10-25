const bot = require('../bot');
const models = require('utown-queue-db');
const Promise = require('bluebird');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/cancel(@\w+)*\s*/i;

let cancelTicket = (ticket, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return cancelTicket(ticket, t);
      });
  }
  return Promise.all([
    ticket.update(
      { isActive: false, groupId: null },
      { transaction: transaction }
    ),
    models.User.update(
      { isInQueue: false },
      { where: { userId: ticket.userId }, transaction: transaction }
    )
  ]);
};

let updateGroupAndCancelTicket = (group, ticket, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return updateGroupAndCancelTicket(group, ticket, t);
      });
  }

  // if there is only one ticket left and the last ticket cancels, then we can say good bye to the group.
  if (group.totalNoOfPeople === ticket.noOfPeople) {
    return cancelTicket(ticket, transaction)
      .then(() => {
        return group.destroy({ transaction: transaction });
      });
  }

  return Promise.all([
    cancelTicket(ticket, transaction),
    group.decrement("totalNoOfPeople", {by: ticket.noOfPeople})
  ])
};

bot.onText(COMMAND_REGEX, (msg, match) => {
  let replyChatId = msg.chat.id;
  if (msg.chat.type !== 'private' || (match[1] && match[1].toLowerCase() !== BOT_USERNAME)) {
    return;
  }

  let name = msg.chat.first_name;
  if (msg.chat.last_name) {
    name += " " + msg.chat.last_name;
  }
  let _user = null;
  let _ticket = null;

  bot.sendChatAction(replyChatId, "typing");
  models.User
    .findOrCreate({ where: { name: name, userId: replyChatId } })
    .then((users) => {
      _user = users[0];
      if (!_user.isInQueue) {
        throw new Error('You are not queueing for any events right now.');
      }
      return models.Ticket
        .find({
          where: {
            userId: _user.userId,
            isActive: true
          }
        });
    })
    .then((ticket) => {
      if (!ticket) {
        throw new Error('You are not queueing for any events right now.');
      }
      _ticket = ticket;
      return _ticket.getGroup();
    })
    .then((group) => {
      if (group) {
        return updateGroupAndCancelTicket(group, _ticket);
      }
      return cancelTicket(_ticket, _user);
    })
    .then(() => {
      bot.sendMessage(replyChatId, "Your ticket #" + _ticket.ticketId + " has been cancelled.\n\nYou need to wait for 2 minutes before you can request for another ticket.")
    })
    .catch((err) => {
      bot.sendMessage(replyChatId, err.message);
    });
});
