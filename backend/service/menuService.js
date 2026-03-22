const menuMapper = require("../mapper/menuMapper");

exports.getMenus = async () => {
  const rows = await menuMapper.findAll();
  const menuMap = {};
  const tree = [];

  rows.forEach((row) => {
    const id = row.menuId || row.id;
    menuMap[id] = { ...row, children: [] };
  });

  rows.forEach((row) => {
    const id = row.menuId || row.id;
    const currentMenu = menuMap[id];
    const parentId = row.parentMenuId;

    if (
      parentId !== null &&
      parentId !== undefined &&
      parentId !== 0 &&
      menuMap[parentId]
    ) {
      menuMap[parentId].children.push(currentMenu);
    } else {
      tree.push(currentMenu);
    }
  });

  return tree;
};

exports.createMenu = async (menuData) => {
  if (!menuData.langu || !menuData.menuId || !menuData.menuNm) {
    const error = new Error("필수 입력 정보가 누락되었습니다.");
    error.statusCode = 400;
    throw error;
  }

  try {
    const result = await menuMapper.create(menuData);
    return { message: "등록되었습니다.", insertId: result.insertId };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const error = new Error("중복된 메뉴 ID입니다.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

exports.updateMenu = async (id, menuData) => {
  const result = await menuMapper.update(id, menuData);
  if (result.affectedRows === 0) {
    const error = new Error("수정 대상을 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }
  return { message: "수정되었습니다." };
};

exports.deleteMenu = async (id) => {
  const target = await menuMapper.findById(id);
  if (!target) {
    const error = new Error("대상을 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }

  const childCount = await menuMapper.countByParentId(target.menuId);
  if (childCount > 0) {
    const error = new Error("하위 메뉴가 있어 삭제할 수 없습니다.");
    error.statusCode = 400;
    throw error;
  }

  await menuMapper.delete(id);
  return { message: "삭제되었습니다." };
};
