const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  "use strict";
  var Event = sequelize.define(
    "Event",
    {
      "ticketId":{
        "type": DataTypes.INTEGER.UNSIGNED,
        "autoIncrement": true,
        "primaryKey": true
      },
      "datetimeRequested": {
        "type": DataTypes.DATE,
        "defaultValue": Sequelize.NOW,
        "allowNull": false
      },
      "noOfPeople": {
        "type": DataTypes.INTEGER.UNSIGNED,
        "allowNull": false
      }
    },
    {
      "classMethods": {
        associate: (models) => {
          Ticket.belongsTo(models.User, {
            "as": "user",
            "foreignKey": {
              "name": "userId",
              "allowNull": false
            }
          });

          Ticket.belongsTo(models.Event, {
            "as": "event",
            "foreignKey": {
              "name": "eventId",
              "allowNull": false
            }
          });

          Ticket.belongsTo(models.Group, {
            "as": "group",
            "foreignKey": {
              "name": "groupId",
              "allowNull": true
            }
          });
        }
      },
      "timestamps": false
    }
  );

  return Event;
};
