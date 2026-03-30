'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true
    },
    createdBy: DataTypes.STRING(45),
    createdAt: DataTypes.DATE,
    changedBy: DataTypes.STRING(45),
    changedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'sysUser',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'changedAt'
  });
  return User;
};
