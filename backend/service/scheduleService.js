const { Schedule } = require("../models");

exports.getSchedules = async (filters = {}) => {
  // 전체 일정 목록을 날짜 오름차순으로 조회합니다.
  return await Schedule.findAll({
    where: filters,
    order: [
      ["schDate", "ASC"],
      ["id", "ASC"],
    ],
  });
};

exports.getMinMaxDates = async (filters = {}) => {
  // DB 쿼리를 통해 최소/최대 날짜를 집계하여 가져옵니다.
  const minDate = await Schedule.min("schDate", { where: filters });
  const maxDate = await Schedule.max("schDate", { where: filters });
  return { minSchDate: minDate, maxSchDate: maxDate };
};

exports.createSchedule = async (scheduleData) => {
  // 단일 일정을 생성합니다.
  return await Schedule.create(scheduleData);
};

exports.createSchedulesBulk = async (schedulesArray) => {
  // 프론트에서 넘어온 1개월 치 배열 데이터를 한 번의 쿼리로 일괄 삽입합니다.
  if (
    !schedulesArray ||
    !Array.isArray(schedulesArray) ||
    schedulesArray.length === 0
  ) {
    const error = new Error("일괄 등록할 데이터가 없습니다.");
    error.statusCode = 400;
    throw error;
  }
  return await Schedule.bulkCreate(schedulesArray);
};

exports.updateSchedule = async (id, updateData) => {
  const schedule = await Schedule.findByPk(id);
  if (!schedule) {
    const error = new Error("해당 일정을 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }
  return await schedule.update(updateData);
};

exports.deleteSchedule = async (id) => {
  const schedule = await Schedule.findByPk(id);
  if (schedule) {
    await schedule.destroy();
  }
  // 삭제 성공 시, 혹은 이미 없는 데이터라도 성공 메시지 반환
  return { message: "일정이 성공적으로 삭제되었습니다." };
};
