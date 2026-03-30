const matClassService = require("../service/matClassService");
const logger = require("../../../config/logger");

exports.getMatClasses = async (req, res) => {
  try {
    const matClasses = await matClassService.getMatClasses(req.query);
    res.status(200).json(matClasses);
  } catch (error) {
    logger.error("Failed to fetch matClasses:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "자재 분류 목록 조회에 실패했습니다.",
    });
  }
};

exports.createMatClass = async (req, res) => {
  try {
    const userId = req.user?.userId || "SYSTEM";
    const newMatClass = await matClassService.createMatClass(req.body, userId);
    res.status(201).json(newMatClass);
  } catch (error) {
    logger.error("Failed to create matClass:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "자재 분류 등록에 실패했습니다." });
  }
};

exports.updateMatClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || "SYSTEM";
    const matClassRecord = await matClassService.updateMatClass(
      id,
      req.body,
      userId,
    );
    res.status(200).json(matClassRecord);
  } catch (error) {
    logger.error("Failed to update matClass:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "자재 분류 수정에 실패했습니다." });
  }
};

exports.deleteMatClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await matClassService.deleteMatClass(id);
    res.status(200).json(result);
  } catch (error) {
    logger.error("Failed to delete matClass:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "자재 분류 삭제에 실패했습니다." });
  }
};
