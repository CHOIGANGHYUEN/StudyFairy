"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TableHistory extends Model {}

  TableHistory.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      targetType: { type: DataTypes.STRING(20), allowNull: false },
      tablen: { type: DataTypes.STRING(45), allowNull: false },
      targetName: DataTypes.STRING(45),
      actionType: { type: DataTypes.STRING(10), allowNull: false },
      targetColumn: DataTypes.STRING(45),
      beforeValue: DataTypes.TEXT,
      afterValue: DataTypes.TEXT,
      beforeCreatedAt: DataTypes.DATE,
      beforeChangedAt: DataTypes.DATE,
      afterCreatedAt: DataTypes.DATE,
      afterChangedAt: DataTypes.DATE,
      createdBy: DataTypes.STRING(45),
      changedBy: DataTypes.STRING(45),
      isApplied: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "TableHistory",
      tableName: "sysTableHistory",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "changedAt",
      indexes: [
        { fields: ["tablen", "targetType"], name: "sysTableHistory_IDX1" },
        { fields: ["targetName"], name: "sysTableHistory_IDX2" },
        { fields: ["createdAt"], name: "sysTableHistory_IDX3" },
      ],
    },
  );

  return TableHistory;
};
