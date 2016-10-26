
const bot = require('../bot');
const models = require('utown-queue-db');

const BOT_USERNAME = process.env.BOT_USERNAME;
const COMMAND_REGEX = /^\/status(@\w+)*\s*/i;

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
          },
          include: [
            { model: models.Group, as: 'group', required: false },
            { model: models.Event, as: 'event' }
          ]
        });
    })
    .then((ticket) => {
      if (!ticket) {
        throw new Error('You are not queueing for any events right now.');
      }
      _ticket = ticket;
      if (_ticket.group) {
        return models.Group.count({ where: { eventId: ticket.eventId, groupId: { $lt: _ticket.group.groupId }, datetimeStart: null } })
          .then((count) => {
            if (count < 3) {
              return bot.sendMessage(replyChatId, "Your turn in the queue at " + ticket.event.eventName +" should be coming up real soon.\n\nThe current estimated waiting time (from the end of the queue) is " + Math.ceil(ticket.event.averageWaitingTime / 60) + " mins.");
            }
            return bot.sendMessage(replyChatId, "There are about " + count + " groups before yours in the queue at " + ticket.event.eventName +".\n\nThe current estimated waiting time (from the end of the queue) is " + Math.ceil(ticket.event.averageWaitingTime / 60) + " mins.");
          });
      }
      return bot.sendMessage(replyChatId, "Your ticket has currently waiting to be placed in a group for the queue.");
    })
    .catch((err) => {
      bot.sendMessage(replyChatId, err.message);
    });
});
