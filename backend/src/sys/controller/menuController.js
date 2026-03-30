const menuService = require("../service/menuService");

// 1. 메뉴 목록 조회
exports.getMenus = async (req, res) => {
  try {
    const tree = await menuService.getMenus();
    // 🔥 [핵심 수정 부분]
    // 프론트엔드(Vue)에서 data.length를 사용하므로
    // 객체 { data: tree } 형태로 감싸지 않고, 배열(tree) 자체를 바로 리턴합니다.
    console.log(tree);
    res.status(200).json(tree);
  } catch (error) {
    console.error("메뉴 조회 오류:", error);
    res.status(500).json({
      error: error.message || "메뉴 조회 중 서버 오류가 발생했습니다.",
    });
  }
};

// 2. 메뉴 등록
exports.createMenu = async (req, res) => {
  try {
    // req.body에 프론트엔드에서 보낸 폼 데이터가 들어있습니다.
    const result = await menuService.createMenu(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("메뉴 등록 오류:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || "메뉴 등록 실패" });
  }
};

// 3. 메뉴 수정
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await menuService.updateMenu(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("메뉴 수정 오류:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || "메뉴 수정 실패" });
  }
};

// 4. 메뉴 삭제
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await menuService.deleteMenu(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("메뉴 삭제 오류:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || "메뉴 삭제 실패" });
  }
};
