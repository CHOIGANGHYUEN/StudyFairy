const logger = require("../config/logger");

const handleControllerError = (res, error, message) => {
  logger.error(`${message}:`, error);
  res
    .status(error.statusCode || 500)
    .json({ message: error.message || "서버 에러가 발생했습니다." });
};

module.exports = handleControllerError;
