const roleMenuService = require("../service/roleMenuService");

exports.getAllRoleMenus = async (req, res) => {
  try {
    const mappings = await roleMenuService.getAllRoleMenus();
    res.status(200).json(mappings);
  } catch (error) {
    console.error("권한-메뉴 매핑 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

exports.createRoleMenu = async (req, res) => {
  try {
    const newMapping = await roleMenuService.createRoleMenu(req.body);
    res.status(201).json(newMapping);
  } catch (error) {
    console.error("권한-메뉴 매핑 등록 오류:", error);
    // UNIQUE INDEX(roleId, menuId) 제약조건 위반 에러 처리
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "이미 등록된 권한-메뉴 매핑입니다." });
    }
    res.status(500).json({ message: "매핑 등록에 실패했습니다." });
  }
};

exports.updateRoleMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMapping = await roleMenuService.updateRoleMenu(id, req.body);
    res.status(200).json(updatedMapping);
  } catch (error) {
    console.error("권한-메뉴 매핑 수정 오류:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "이미 동일한 권한-메뉴 매핑이 존재합니다." });
    }
    res.status(500).json({ message: "매핑 수정에 실패했습니다." });
  }
};

exports.deleteRoleMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await roleMenuService.deleteRoleMenu(id);
    res.status(200).json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("권한-메뉴 매핑 삭제 오류:", error);
    res
      .status(500)
      .json({ message: error.message || "매핑 삭제에 실패했습니다." });
  }
};
