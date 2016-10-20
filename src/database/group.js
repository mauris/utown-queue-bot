const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  "use strict";
  var Group = sequelize.define(
    "Group",
    {
      "ticketId":{
        "type": DataTypes.INTEGER.UNSIGNED,
        "autoIncrement": true,
        "primaryKey": true
      },
      "datetimeFormed": {
        "type": DataTypes.DATE,
        "defaultValue": Sequelize.NOW,
        "allowNull": false
      },
      "datetimeStart": {
        "type": DataTypes.DATE,
        "allowNull": true
      },
      "totalNoOfPeople": {
        "type": DataTypes.INTEGER.UNSIGNED,
        "allowNull": false
      }
    },
    {
      "classMethods": {
        associate: (models) => {
          Group.belongsTo(models.Event, {
            "as": "event",
            "foreignKey": {
              "name": "eventId",
              "allowNull": false
            }
          });

          Group.hasMany(models.Ticket, {
            "as": "ticket",
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

  return Group;
};
