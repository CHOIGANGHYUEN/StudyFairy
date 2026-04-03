const tableHistoryService = require("../service/tableHistoryService");

exports.getHistories = async (req, res, next) => {
  try {
    const histories = await tableHistoryService.getHistories(req.query);
    res.status(200).json({ success: true, data: histories });
  } catch (error) {
    console.error("이력 조회 오류:", error);
    next(error);
  }
};
