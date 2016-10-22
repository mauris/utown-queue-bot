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
}

let $controller = () => {
  let _tickets = [];
  return models.Ticket
    .findAll(
      {
        where: { groupId: null, isActive: true },
        include: [
          { model: models.Event, as: 'event'},
          { model: models.User, as: 'user' }
        ]
      }
    )
    .then((tickets) => {
      _tickets = tickets;
      return Promise.each(_tickets, (ticket) => {
        return models.sequelize.transaction((t) => {
          return ticket.event
            .getGroups({ where: { isPresent: false, totalNoOfPeople: {$lte: ticket.event.maxPeoplePerGroup - ticket.noOfPeople }}, transaction: t })
            .then((groups) => {
              if (groups.length == 0) {
                // no group found
                return createNewGroupAndAssignTicket(ticket.event, ticket, t);
              }
              return assignTicket(groups[0], ticket, t);
            });
        });
      });
    })
    .then(() => {
      return Promise.map(_tickets, (ticket) => {
        return bot.sendMessage(ticket.user.userId, "Your ticket has been matched to a group in the queue! The estimated waiting for " + ticket.event.eventName + " is " + Math.ceil(ticket.event.averageWaitingTime / 60) + " mins.");
      });
    });
};

$controller();
setInterval($controller, 120000);
