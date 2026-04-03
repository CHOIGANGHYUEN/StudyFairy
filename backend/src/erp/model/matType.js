"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  // models/index.js가 클래스 이름을 키로 사용하므로, 서비스에서 import하는 이름과 일치시킵니다.
  class MatType extends Model {
    static associate(models) {
      this.hasMany(models.MatTypex, {
        foreignKey: "matType",
        sourceKey: "matType",
        as: "names",
      });
    }
  }

  MatType.init(
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
      matType: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
      },
      procureType: DataTypes.STRING(10),
      priceCtrlType: DataTypes.STRING(10),
      qtyUpdateYn: DataTypes.INTEGER,
      valUpdateYn: DataTypes.INTEGER,
      useYn: DataTypes.INTEGER,
      createdBy: DataTypes.STRING(45),
      createdAt: DataTypes.DATE,
      changedBy: DataTypes.STRING(45),
      changedAt: DataTypes.DATE,
    },
    {
      sequelize,
      // modelName을 클래스명(MatType)과 일치시켜 일관성을 유지합니다.
      modelName: "MatType",
      tableName: "sysMatType",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "changedAt",
    },
  );

  return MatType;
};
