const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  "use strict";
  var Event = sequelize.define(
    "Event",
    {
      "eventId":{
        "type": DataTypes.INTEGER.UNSIGNED,
        "autoIncrement": true,
        "primaryKey": true
      },
      "eventName": {
        "type": DataTypes.STRING,
        "allowNull": false
      },
      "datetimeCreated": {
        "type": DataTypes.DATE,
        "defaultValue": Sequelize.NOW,
        "allowNull": false
      },
      "datetimeOpen": {
        "type": DataTypes.DATE,
        "allowNull": false
      },
      "datetimeClose": {
        "type": DataTypes.DATE,
        "allowNull": false
      },
      "minPeoplePerGroup": {
        "type": DataTypes.INTEGER.UNSIGNED,
        "allowNull": false
      },
      "maxPeoplePerGroup": {
        "type": DataTypes.INTEGER.UNSIGNED,
        "allowNull": false
      }
    },
    {
      "classMethods": {
        associate: (models) => {
          Event.hasMany(models.Ticket, {
            "as": "tickets",
            "foreignKey": {
              "name": "ticketId",
              "allowNull": false
            }
          });

          Event.hasMany(models.Group, {
            "as": "groups",
            "foreignKey": {
              "name": "groupId",
              "allowNull": false
            }
          });
        }
      },
      "timestamps": false
    }
  );

  return Event;
};
