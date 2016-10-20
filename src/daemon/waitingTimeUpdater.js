const models = require('utown-queue-db');

console.log('Daemon worker #' + process.pid + ' started.');

let $controller = () => {
  models.sequelize.query('UPDATE events RIGHT JOIN (SELECT AVG(TIMESTAMPDIFF(SECOND, datetimeFormed, datetimeStart)) AS AverageWaitingTime, eventId FROM groups WHERE datetimeStart IS NOT NULL GROUP BY eventId) groupwt ON groupwt.eventId = events.eventId RIGHT JOIN (SELECT AVG(TIMESTAMPDIFF(SECOND, datetimeRequested, datetimeStart)) AS AverageFormingTime, eventId FROM tickets WHERE datetimeStart IS NOT NULL GROUP BY eventId) AS ticketwt ON ticketwt.eventId = events.eventId SET events.AverageWaitingTime = groupwt.AverageWaitingTime + ticketwt.AverageFormingTime', { type: models.sequelize.QueryTypes.UPDATE });
};

$controller();
setInterval($controller, 60000);
