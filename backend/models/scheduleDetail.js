'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ScheduleDetail extends Model {
    static associate(models) {
      // define association here
      ScheduleDetail.belongsTo(models.Schedule, {
        foreignKey: 'scheduleId',
        targetKey: 'id'
      });
    }
  }

  ScheduleDetail.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '일련번호 (PK)',
    },
    scheduleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '부모 일정 ID (sysSchedule.id 참조)',
    },
    schGroupCode: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: '일정 그룹 코드 (SGR001/SGR002)',
    },
    schYear: {
      type: DataTypes.STRING(4),
      allowNull: false,
      comment: '일정 연도',
    },
    schMonth: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: '일정 월',
    },
    schDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '일정 일',
    },
    schWeek: {
      type: DataTypes.INTEGER,
      comment: '주차 (SGR001: 업무 주차 등)',
    },
    code1: {
      type: DataTypes.STRING(100),
      comment: '분류1 (SGR001: 회사/PJT, SGR002: 교재)',
    },
    code2: {
      type: DataTypes.STRING(45),
      comment: '분류2 (SGR001: 문의코드, SGR002: 유형)',
    },
    code3: {
      type: DataTypes.STRING(45),
      comment: '분류3 (SGR001: 분류, SGR002: 구분)',
    },
    title: {
      type: DataTypes.STRING(100),
      comment: '제목 (문의/이름)',
    },
    subtitle: {
      type: DataTypes.TEXT,
      comment: '하위제목 (문의상세/상세)',
    },
    content: {
      type: DataTypes.TEXT,
      comment: '상세 내용',
    },
    reqUser: {
      type: DataTypes.STRING(45),
      comment: '요청자 (SGR001용)',
    },
    mgrUser: {
      type: DataTypes.STRING(45),
      comment: '담당자 (SGR001용)',
    },
    startTime: {
      type: DataTypes.DATE,
      comment: '시작 시간',
    },
    endTime: {
      type: DataTypes.DATE,
      comment: '종료 시간 (완료시간)',
    },
    totalQty: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '총 수량 (SGR002: 총 문제 수)',
    },
    passQty: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '성공 수량 (SGR002: 맞춘 문제 수)',
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '점수/이해도 (SGR002: 이해도)',
    },
    useYn: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '사용 여부 (1:사용, 0:미사용)',
    },
    createdBy: {
      type: DataTypes.STRING(45),
      comment: '생성자',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '생성일',
    },
  }, {
    sequelize,
    modelName: 'ScheduleDetail',
    tableName: 'sysSchedulerDetail',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false, // No updatedAt field in the provided schema
  });

  return ScheduleDetail;
};
