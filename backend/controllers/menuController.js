const menuService = require("../service/menuService");

exports.getMenus = async (req, res) => {
  try {
    const tree = await menuService.getMenus();
    res.status(200).json(tree);
  } catch (err) {
    console.error("메뉴 조회 에러:", err);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const result = await menuService.createMenu(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("메뉴 등록 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await menuService.updateMenu(id, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("메뉴 수정 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await menuService.deleteMenu(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("메뉴 삭제 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};
