"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Plant extends Model {
    static associate(models) {
      Plant.hasMany(models.Plantx, {
        foreignKey: "plant",
        sourceKey: "plant",
        as: "names",
      });
    }
  }

  Plant.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      company: { type: DataTypes.STRING(45), allowNull: false },
      plant: { type: DataTypes.STRING(45), allowNull: false, unique: true },
      regNo: DataTypes.STRING(20),
      telNo: DataTypes.STRING(20),
      zipCode: DataTypes.STRING(10),
      addr: DataTypes.STRING(255),
      addrDetail: DataTypes.STRING(255),
      useYn: DataTypes.INTEGER,
      createdBy: DataTypes.STRING(45),
      changedBy: DataTypes.STRING(45),
    },
    {
      sequelize,
      modelName: "Plant",
      tableName: "sysPlant",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "changedAt",
      indexes: [
        {
          unique: true,
          fields: ["company", "plant"],
        },
      ],
    },
  );

  return Plant;
};
