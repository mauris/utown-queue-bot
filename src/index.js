require('./database').sequelize.sync({ logging: console.log })
  .then(() => {
    require('./daemon');
    require('./commands');
    require('./callbacks');
  })
