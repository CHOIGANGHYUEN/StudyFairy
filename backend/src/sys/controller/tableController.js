const tableService = require("../service/tableService");

exports.getTables = async (req, res, next) => {
  try {
    const tables = await tableService.getTables();
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

exports.saveTableSpec = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : "system";
    const tableData = req.body;
    const result = await tableService.saveTableSpec(tableData, userId);
    res.status(200).json({
      success: true,
      data: result,
      message: "테이블 명세서가 저장되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};
