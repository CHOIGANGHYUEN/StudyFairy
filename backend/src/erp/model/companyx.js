'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Companyx extends Model {
    static associate(models) {
        Companyx.belongsTo(models.Company, {
            foreignKey: 'companyId',
            targetKey: 'companyId'
        });
    }
  }

  Companyx.init({
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
    companyNm: DataTypes.STRING(45),
    createdBy: DataTypes.STRING(45),
    createdAt: DataTypes.DATE,
    changedBy: DataTypes.STRING(45),
    changedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Companyx',
    tableName: 'sysCompanyx',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'changedAt',
    indexes: [
        {
            unique: true,
            fields: ['langu', 'companyId']
        }
    ]
  });

  return Companyx;
};
