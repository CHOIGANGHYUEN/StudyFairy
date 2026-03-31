module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      schGroupCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      schYear: {
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      schMonth: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      schDate: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD 형식
        allowNull: false,
      },
      schCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      useYn: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      tableName: "schedules",
      timestamps: true, // createdAt, updatedAt 컬럼 자동 생성
    },
  );

  return Schedule;
};
