"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  // models/index.js가 클래스 이름을 키로 사용하므로, 서비스에서 import하는 이름과 일치시킵니다.
  class MatTypex extends Model {
    static associate(models) {
      this.belongsTo(models.MatType, {
        foreignKey: "matType",
        targetKey: "matType",
        as: "matTypeHeader", // 컬럼명 'matType'과의 이름 충돌을 방지하기 위한 별칭 추가
      });
    }
  }

  MatTypex.init(
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
      companyId: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      matType: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      matTypeNm: DataTypes.STRING(100),
      description: DataTypes.STRING(300),
      createdBy: DataTypes.STRING(45),
      createdAt: DataTypes.DATE,
      changedBy: DataTypes.STRING(45),
      changedAt: DataTypes.DATE,
    },
    {
      sequelize,
      // modelName을 클래스명(MatTypex)과 일치시켜 일관성을 유지합니다.
      modelName: "MatTypex",
      tableName: "sysMatTypex",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "changedAt",
      indexes: [
        {
          unique: true,
          fields: ["langu", "companyId", "matType"],
        },
      ],
    },
  );

  return MatTypex;
};
