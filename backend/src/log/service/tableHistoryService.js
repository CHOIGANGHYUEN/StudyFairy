const { TableHistory, Sequelize } = require("../../index");
const { Op } = Sequelize;

exports.getHistories = async (filters = {}) => {
  const where = {};

  if (filters.exactTablen) {
    where.tablen = filters.exactTablen;
  } else if (filters.tablen) {
    where.tablen = { [Op.like]: `%${filters.tablen}%` };
  }

  if (filters.targetType) where.targetType = filters.targetType;
  if (filters.actionType) where.actionType = filters.actionType;
  if (filters.isApplied !== undefined && filters.isApplied !== "") {
    where.isApplied = filters.isApplied === "true" || filters.isApplied === true;
  }

  const page = parseInt(filters.page) || 1;
  const size = parseInt(filters.size) || 20;
  const offset = (page - 1) * size;

  const { count, rows } = await TableHistory.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: size,
    offset,
  });

  return { total: count, rows };
};
