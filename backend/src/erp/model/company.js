'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.Companyx, {
        foreignKey: 'companyId',
        sourceKey: 'companyId',
        as: 'names'
      });
    }
  }

  Company.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    companyId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    regNo: DataTypes.STRING(20),
    corpNo: DataTypes.STRING(20),
    repNm: DataTypes.STRING(45),
    bzType: DataTypes.STRING(100),
    bzItem: DataTypes.STRING(100),
    zipCode: DataTypes.STRING(10),
    addr: DataTypes.STRING(255),
    addrDetail: DataTypes.STRING(255),
    telNo: DataTypes.STRING(20),
    faxNo: DataTypes.STRING(20),
    email: DataTypes.STRING(100),
    currency: DataTypes.STRING(3),
    useYn: DataTypes.INTEGER,
    createdBy: DataTypes.STRING(45),
    createdAt: DataTypes.DATE,
    changedBy: DataTypes.STRING(45),
    changedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'sysCompany',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'changedAt',
  });

  return Company;
};
