"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Plantx extends Model {
    static associate(models) {
      Plantx.belongsTo(models.Plant, {
        foreignKey: "plant",
        targetKey: "plant",
      });
    }
  }

  Plantx.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      langu: { type: DataTypes.STRING(45), allowNull: false },
      company: { type: DataTypes.STRING(45), allowNull: false },
      plant: { type: DataTypes.STRING(45), allowNull: false },
      plantNm: DataTypes.STRING(100),
      description: DataTypes.STRING(300),
      createdBy: DataTypes.STRING(45),
      changedBy: DataTypes.STRING(45),
    },
    {
      sequelize,
      modelName: "Plantx",
      tableName: "sysPlantx",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "changedAt",
      indexes: [
        {
          unique: true,
          fields: ["langu", "company", "plant"],
        },
      ],
    },
  );

  return Plantx;
};
