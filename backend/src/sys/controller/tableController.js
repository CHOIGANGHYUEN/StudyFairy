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

exports.deleteTableSpec = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : "system";
    const { tablen } = req.params;
    await tableService.deleteTableSpec(tablen, userId);
    res.status(200).json({
      success: true,
      message: "테이블 명세서가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

exports.executeScript = async (req, res, next) => {
  try {
    const { tablen, script } = req.body;
    if (!script) {
      return res
        .status(400)
        .json({ success: false, message: "실행할 스크립트가 없습니다." });
    }
    const result = await tableService.executeScript(tablen, script);
    res.status(200).json({
      success: true,
      data: result,
      message:
        "명세서 스크립트가 성공적으로 데이터베이스에 실행/반영되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};
