const { RoleMenu } = require("../../index");

exports.getAllRoleMenus = async () => {
  return await RoleMenu.findAll({ order: [["id", "DESC"]] });
};

exports.createRoleMenu = async (data) => {
  return await RoleMenu.create(data);
};

exports.updateRoleMenu = async (id, data) => {
  const roleMenu = await RoleMenu.findByPk(id);
  if (!roleMenu) {
    throw new Error("수정할 데이터가 없습니다.");
  }
  await roleMenu.update(data);
  return roleMenu;
};

exports.deleteRoleMenu = async (id) => {
  const roleMenu = await RoleMenu.findByPk(id);
  if (!roleMenu) {
    throw new Error("삭제할 데이터가 없습니다.");
  }
  await roleMenu.destroy();
  return { success: true };
};
