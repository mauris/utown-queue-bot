require('./commands');
require('./callbacks');

require('./database').sequelize.sync({ logging: console.log });
