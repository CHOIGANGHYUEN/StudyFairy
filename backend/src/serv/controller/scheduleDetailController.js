const scheduleDetailService = require("../service/scheduleDetailService");

// Controller to get schedule details based on query filters
exports.getScheduleDetails = async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const { schGroupCode, schYear, schMonth, userId, schDate } = req.query;
    const filters = {};
    if (schGroupCode) filters.schGroupCode = schGroupCode;
    if (schYear) filters.schYear = schYear;
    if (schMonth) filters.schMonth = schMonth;
    if (userId) filters.userId = userId; // Assuming userId might be needed
    if (schDate) filters.schDate = schDate;

    const details = await scheduleDetailService.getScheduleDetails(filters);
    res.json(details);
  } catch (error) {
    next(error);
  }
};

// Controller to get a single schedule detail by its ID
exports.getScheduleDetailById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detail = await scheduleDetailService.getScheduleDetailById(id);
    if (!detail) {
      return res.status(404).json({ message: "Schedule detail not found" });
    }
    res.json(detail);
  } catch (error) {
    next(error);
  }
};

// Controller to create a new schedule detail
exports.createScheduleDetail = async (req, res, next) => {
  try {
    const newDetail = await scheduleDetailService.createScheduleDetail(req.body);
    res.status(201).json(newDetail);
  } catch (error) {
    next(error);
  }
};

// Controller to update an existing schedule detail
exports.updateScheduleDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedDetail = await scheduleDetailService.updateScheduleDetail(id, req.body);
    res.json(updatedDetail);
  } catch (error) {
    if (error.message === 'ScheduleDetail not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// Controller to delete a schedule detail
exports.deleteScheduleDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    await scheduleDetailService.deleteScheduleDetail(id);
    res.status(204).send(); // No content
  } catch (error) {
    if (error.message === 'ScheduleDetail not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
