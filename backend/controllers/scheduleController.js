const scheduleService = require("../service/scheduleService");

exports.getAllSchedules = async (req, res, next) => {
  try {
    const { schGroupCode, userId, schYear, schMonth } = req.query;
    const filters = {};
    if (schGroupCode) filters.schGroupCode = schGroupCode;
    if (userId) filters.userId = userId;
    if (schYear) filters.schYear = schYear;
    if (schMonth) filters.schMonth = schMonth;

    const schedules = await scheduleService.getSchedules(filters);
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};
// backend/controllers/scheduleController.js 에 추가

exports.getMinMaxDates = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.schGroupCode) filters.schGroupCode = req.query.schGroupCode;
    if (req.query.userId) filters.userId = req.query.userId;

    // 서비스 함수 호출
    const result = await scheduleService.getMinMaxDates(filters);

    // { minSchDate, maxSchDate } 객체 반환
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const result = await scheduleService.createSchedule(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
// 일정 일괄 생성 (bulk)
exports.createSchedulesBulk = async (req, res, next) => {
  try {
    const schedulesArray = req.body; // 프론트에서 넘어온 일정 배열 데이터
    const result = await scheduleService.createSchedulesBulk(schedulesArray);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await scheduleService.updateSchedule(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await scheduleService.deleteSchedule(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
