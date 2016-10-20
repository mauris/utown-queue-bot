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
      },
      "eventCode": {
        "type": DataTypes.CHAR(5),
        "allowNull": false
      },
      "averageWaitingTime": {
        "type": DataTypes.INTEGER.UNSIGNED,
        "defaultValue": 0,
        "allowNull": false
      }
    },
    {
      "classMethods": {
        associate: (models) => {
          Event.hasMany(models.Ticket, {
            "as": "tickets",
            "foreignKey": {
              "name": "eventId",
              "allowNull": false
            }
          });

          Event.hasMany(models.Group, {
            "as": "groups",
            "foreignKey": {
              "name": "eventId",
              "allowNull": false
            }
          });
        }
      },
      "timestamps": false,
      "indexes": [
        {
          "name": "idx_eventcode",
          "fields": ["eventCode"],
          "unique": true
        }
      ]
    }
  );

  return Event;
};
