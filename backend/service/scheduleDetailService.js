const { ScheduleDetail } = require('../models');

// Get all schedule details
exports.getScheduleDetails = async (filters = {}) => {
  return await ScheduleDetail.findAll({ where: filters });
};

// Get a single schedule detail by ID
exports.getScheduleDetailById = async (id) => {
  return await ScheduleDetail.findByPk(id);
};

// Create a new schedule detail
exports.createScheduleDetail = async (data) => {
  return await ScheduleDetail.create(data);
};

// Update a schedule detail
exports.updateScheduleDetail = async (id, data) => {
  const scheduleDetail = await ScheduleDetail.findByPk(id);
  if (!scheduleDetail) {
    throw new Error('ScheduleDetail not found');
  }
  return await scheduleDetail.update(data);
};

// Delete a schedule detail
exports.deleteScheduleDetail = async (id) => {
  const scheduleDetail = await ScheduleDetail.findByPk(id);
  if (!scheduleDetail) {
    throw new Error('ScheduleDetail not found');
  }
  return await scheduleDetail.destroy();
};
