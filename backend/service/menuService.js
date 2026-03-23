const menuMapper = require("../mapper/menuMapper");

exports.getMenus = async () => {
  const menus = await menuMapper.findAll();

  const menuMap = {};
  const menuTree = [];

  // 1. 각 메뉴를 초기화하고 맵에 추가합니다.
  menus.forEach((menu) => {
    menu.children = [];
    menuMap[menu.menuId] = menu;
  });

  // 2. 트리 구조를 구축합니다.
  menus.forEach((menu) => {
    if (menu.parentMenuId && menuMap[menu.parentMenuId]) {
      // 부모 메뉴가 있으면 children 배열에 추가합니다.
      menuMap[menu.parentMenuId].children.push(menu);
    } else {
      // 부모 메뉴가 없으면 최상위 메뉴(루트 노드)입니다.
      menuTree.push(menu);
    }
  });

  return menuTree;
};

exports.createMenu = async (menuData) => {
  // menuLevel 필수 체크
  if (
    !menuData.langu ||
    !menuData.menuId ||
    !menuData.menuNm ||
    !menuData.menuLevel
  ) {
    const error = new Error(
      "필수 입력 정보(언어, ID, 이름, 레벨)가 누락되었습니다.",
    );
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
