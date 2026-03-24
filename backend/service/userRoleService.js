const { UserRole, Role } = require("../models");

exports.getAllUserRoles = async () => {
  return await UserRole.findAll({ order: [["id", "DESC"]] });
};

exports.createUserRole = async (data) => {
  return await UserRole.create(data);
};

exports.updateUserRole = async (id, data) => {
  const userRole = await UserRole.findByPk(id);
  if (!userRole) {
    throw new Error("수정할 데이터가 없습니다.");
  }
  await userRole.update(data);
  return userRole;
};

exports.deleteUserRole = async (id) => {
  const userRole = await UserRole.findByPk(id);
  if (!userRole) {
    throw new Error("삭제할 데이터가 없습니다.");
  }
  await userRole.destroy();
  return { success: true };
};

exports.findRolesByUserId = async (userId) => {
  return await UserRole.findAll({
    where: {
      userId: userId,
      useYn: 1,
    },
    include: [{
      model: Role,
      required: true,
      where: {
        useYn: 1
      },
      attributes: ['roleId', 'description']
    }],
    attributes: [] // We only want the fields from the Role model
  }).then(userRoles => userRoles.map(ur => ur.Role)); // Extract only the Role data
};
