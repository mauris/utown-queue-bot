const models = require('utown-queue-db');
const Promise = require('bluebird');
const bot = require('../bot');

console.log('Daemon worker #' + process.pid + ' started.');

let updateTicket = (group, ticket, transaction) => {
  return ticket.update({groupId: group.groupId, datetimeStart: models.sequelize.fn('NOW')}, {transaction: transaction});
}

let assignTicket = (group, ticket, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return assignTicket(group, ticket, t);
      });
  }
  var promises = [];
  promises.push(group.increment('totalNoOfPeople', {by: ticket.noOfPeople, transaction: transaction}));
  promises.push(updateTicket(group, ticket, transaction));
  return Promise.all(promises);
}

let createNewGroupAndAssignTicket = (event, ticket, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return createNewGroupAndAssignTicket(event, ticket, t);
      });
  }
  return models.Group
    .create(
      {
        eventId: event.eventId,
        totalNoOfPeople: ticket.noOfPeople
      },
      { transaction: transaction }
    )
    .then((group) => {
      return updateTicket(group, ticket, transaction);
    });
};

let processTicket = (event, ticket, transaction) => {
  if (!transaction) {
    return models.sequelize
      .transaction((t) => {
        return processTicket(event, ticket, t);
      });
  }

  return models.Group
    .findOne({ where: { eventId: event.eventId, isPresent: false, totalNoOfPeople: {$lte: event.maxPeoplePerGroup - ticket.noOfPeople }}, transaction: transaction })
    .then((group) => {
      if (group) {
        return assignTicket(group, ticket, transaction);
      }
      return createNewGroupAndAssignTicket(event, ticket, transaction);
    })
    .then(() => {
      bot.sendMessage(ticket.user.userId, "Your ticket has been matched to a group in the queue! The estimated waiting for " + event.eventName + " is " + Math.ceil(event.averageWaitingTime / 60) + " mins.");
    });
};

let $controller = () => {
  return models.Event
    .findAll({})
    .then((events) => {
      return Promise.map(events, (event) => {
        return models.Ticket
          .findAll({
            where: { eventId: event.eventId, groupId: null, isActive: true },
            include: [{ model: models.User, as: 'user' }],
            order: [["noOfPeople", "DESC"]]
          })
          .then((tickets) => {
            return Promise.each(tickets, (ticket) => {
              return processTicket(event, ticket);
            })
          })
      });
    });
};

$controller();
setInterval($controller, 60000);
