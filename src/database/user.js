const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  "use strict";
  var User = sequelize.define(
    "User",
    {
      "userId":{
        "type": DataTypes.INTEGER,
        "primaryKey": true
      },
      "name": {
        "type": DataTypes.STRING,
        "allowNull": false
      },
      "datetimeJoined": {
        "type": DataTypes.DATE,
        "defaultValue": Sequelize.NOW,
        "allowNull": false
      },
      "isInQueue": {
        "type": DataTypes.BOOLEAN,
        "defaultValue": false,
        "allowNull": false
      }
    },
    {
      "classMethods": {
        associate: (models) => {
          User.hasMany(models.Ticket, {
            "as": "tickets",
            "foreignKey": {
              "name": "ticketId",
              "allowNull": false
            }
          });
        }
      },
      "timestamps": false
    }
  );

  return User;
};
