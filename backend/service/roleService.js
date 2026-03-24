const { Role } = require("../models");

exports.getAllRoles = async () => {
  return await Role.findAll({ order: [["id", "ASC"]] });
};

exports.createRole = async (roleData) => {
  try {
    return await Role.create(roleData);
  } catch (error) {
    if (error instanceof require('sequelize').UniqueConstraintError) {
      throw new Error("ALREADY_EXISTS");
    }
    throw error;
  }
};

exports.updateRole = async (id, roleData) => {
  const [affectedRows] = await Role.update(roleData, {
    where: { id },
  });
  if (affectedRows === 0) {
    throw new Error("NOT_FOUND");
  }
  return { affectedRows };
};

exports.deleteRole = async (id) => {
  const affectedRows = await Role.destroy({
    where: { id },
  });
  if (affectedRows === 0) {
    throw new Error("NOT_FOUND");
  }
  return { affectedRows };
};
