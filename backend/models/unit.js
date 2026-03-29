'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Unit extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  Unit.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    unitId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
      field: 'unitId'
    },
    unitNm: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'unitNm'
    },
    baseUnitYn: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      field: 'baseUnitYn'
    },
    baseUnitId: {
      type: DataTypes.STRING(45),
      field: 'baseUnitId'
    },
    convRate: {
      type: DataTypes.DECIMAL(15, 5),
      field: 'convRate'
    },
    useYn: {
      type: DataTypes.STRING(255),
      field: 'useYn'
    },
    dispOrd: {
      type: DataTypes.INTEGER(6),
      field: 'dispOrd'
    },
    createdBy: {
      type: DataTypes.STRING(45),
      field: 'createdBy'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt'
    },
    changedBy: {
      type: DataTypes.STRING(45),
      field: 'changedBy'
    },
    changedAt: {
      type: DataTypes.DATE,
      field: 'changedAt'
    }
  }, {
    sequelize,
    modelName: 'Unit',
    tableName: 'sysUnit',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'changedAt'
  });

  return Unit;
};
