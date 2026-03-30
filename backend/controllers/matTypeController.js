const matTypeService = require("../service/matTypeService");
const logger = require("../config/logger");

const handleControllerError = (res, error, message) => {
  logger.error(`${message}:`, error);
  res
    .status(error.statusCode || 500)
    .json({ message: error.message || "A server error occurred." });
};

exports.getMatTypes = async (req, res) => {
  try {
    const matTypes = await matTypeService.getMatTypes(req.query);
    res.status(200).json(matTypes);
  } catch (err) {
    handleControllerError(res, err, "Error fetching material types");
  }
};

exports.getMatTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const matType = await matTypeService.getMatTypeById(id);
    res.status(200).json(matType);
  } catch (err) {
    handleControllerError(res, err, "Error fetching material type by ID");
  }
};

exports.createMatType = async (req, res) => {
  try {
    const matTypeData = {
      ...req.body,
      createdBy: req.user?.userId || "SYSTEM",
    };
    const result = await matTypeService.createMatType(matTypeData);
    res.status(201).json(result);
  } catch (err) {
    handleControllerError(res, err, "Error creating material type");
  }
};

exports.updateMatType = async (req, res) => {
  try {
    const { id } = req.params;
    const matTypeData = {
      ...req.body,
      changedBy: req.user?.userId || "SYSTEM",
    };
    const result = await matTypeService.updateMatType(id, matTypeData);
    res.status(200).json(result);
  } catch (err) {
    handleControllerError(res, err, "Error updating material type");
  }
};

exports.deleteMatType = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await matTypeService.deleteMatType(id);
    res.status(200).json(result);
  } catch (err) {
    handleControllerError(res, err, "Error deleting material type");
  }
};
