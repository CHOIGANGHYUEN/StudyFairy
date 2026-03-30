'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Schedule.hasMany(models.ScheduleDetail, {
        foreignKey: 'scheduleId',
        as: 'details'
      });
    }
  }
  Schedule.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    schGroupCode: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    schYear: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    schMonth: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    schDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    schCode: DataTypes.STRING(45),
    useYn: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    createdBy: DataTypes.STRING(45),
    createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt' //
    },
    changedBy: DataTypes.STRING(45),
    changedAt: {
        type: DataTypes.DATE,
        field: 'changedAt'
    }
  }, {
    sequelize,
    modelName: 'Schedule',
    tableName: 'sysSchedule', // Explicitly set the table name
    timestamps: true, // Sequelize will manage createdAt and updatedAt
    createdAt: 'createdAt', // Map Sequelize's createdAt to the 'createdAt' column
    updatedAt: 'changedAt' // Map Sequelize's updatedAt to the 'changedAt' column
  });
  return Schedule;
};
