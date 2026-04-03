"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MatClass extends Model {
    static associate(models) {
      MatClass.hasMany(models.MatClassx, {
        foreignKey: "matClass",
        sourceKey: "matClass",
        as: "names",
      });
    }
  }

  MatClass.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      company: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      matClass: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      parentClass: DataTypes.STRING(45),
      classLevel: DataTypes.INTEGER,
      useYn: DataTypes.INTEGER,
      createdBy: DataTypes.STRING(45),
      changedBy: DataTypes.STRING(45),
    },
    {
      sequelize,
      modelName: "MatClass",
      tableName: "sysMatClass",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "changedAt",
      indexes: [
        {
          unique: true,
          fields: ["company", "matClass"],
          name: "sysMatClass_U1",
        },
        { fields: ["company", "parentClass"], name: "sysMatClass_IDX1" },
      ],
    },
  );

  return MatClass;
};
