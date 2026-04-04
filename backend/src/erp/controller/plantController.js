const plantService = require("../service/plantService");
const handleControllerError = require("../../../utils/errorHandler");

exports.getPlants = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await plantService.getPlants(req.query, page, limit);
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, "플랜트 목록 조회 실패");
  }
};

exports.createPlant = async (req, res) => {
  try {
    const userId = req.user?.userId || "SYSTEM";
    const result = await plantService.createPlant(req.body, userId);
    res.status(201).json(result);
  } catch (error) {
    handleControllerError(res, error, "플랜트 등록 실패");
  }
};

exports.updatePlant = async (req, res) => {
  try {
    const userId = req.user?.userId || "SYSTEM";
    const result = await plantService.updatePlant(
      req.params.id,
      req.body,
      userId,
    );
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, "플랜트 수정 실패");
  }
};

exports.deletePlant = async (req, res) => {
  try {
    const result = await plantService.deletePlant(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    handleControllerError(res, error, "플랜트 삭제 실패");
  }
};
