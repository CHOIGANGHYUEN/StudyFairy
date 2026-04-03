"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MatClassx extends Model {
    static associate(models) {
      this.belongsTo(models.MatClass, {
        foreignKey: "matClass",
        targetKey: "matClass",
        as: "matClassHeader",
      });
    }
  }

  MatClassx.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      langu: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      company: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      matClass: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      matClassNm: DataTypes.STRING(100),
      description: DataTypes.STRING(300),
      createdBy: DataTypes.STRING(45),
      changedBy: DataTypes.STRING(45),
    },
    {
      sequelize,
      modelName: "MatClassx",
      tableName: "sysMatClassx",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "changedAt",
      indexes: [
        {
          unique: true,
          fields: ["langu", "company", "matClass"],
          name: "sysMatClassx_U1",
        },
        { fields: ["company"], name: "sysMatClassx_IDX1" },
      ],
    },
  );

  return MatClassx;
};
