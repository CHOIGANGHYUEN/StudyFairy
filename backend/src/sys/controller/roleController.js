const roleService = require("../service/roleService");
const logger = require("../../../config/logger");

exports.getRoles = async (req, res) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (error) {
    logger.error(`Error fetching roles: ${error.message}`);
    res.status(500).json({ message: "권한 목록을 불러오는데 실패했습니다." });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { roleId, description, useYn, createdBy } = req.body;

    if (!roleId) {
      return res.status(400).json({ message: "권한 ID는 필수입니다." });
    }

    const result = await roleService.createRole({
      roleId,
      description,
      useYn,
      createdBy,
    });
    res.status(201).json({
      message: "권한이 성공적으로 등록되었습니다.",
      id: result.insertId,
    });
  } catch (error) {
    if (error.message === "ALREADY_EXISTS") {
      return res.status(409).json({ message: "이미 존재하는 권한 ID입니다." });
    }
    logger.error(`Error creating role: ${error.message}`);
    res.status(500).json({ message: "권한 등록에 실패했습니다." });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { description, useYn, changedBy } = req.body;

    await roleService.updateRole(id, { description, useYn, changedBy });
    res.json({ message: "권한이 성공적으로 수정되었습니다." });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "수정할 권한을 찾을 수 없습니다." });
    }
    logger.error(`Error updating role ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: "권한 수정에 실패했습니다." });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const id = req.params.id;
    await roleService.deleteRole(id);
    res.json({ message: "권한이 성공적으로 삭제되었습니다." });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "삭제할 권한을 찾을 수 없습니다." });
    }
    logger.error(`Error deleting role ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: "권한 삭제에 실패했습니다." });
  }
};
