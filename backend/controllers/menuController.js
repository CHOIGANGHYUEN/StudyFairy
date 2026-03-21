const db = require("../config/db");

exports.getAllMenus = async (req, res) => {
  try {
    // sort_order 기준으로 정렬하여 가져옴
    const [rows] = await db.query("SELECT * FROM sysMenu");
    res.json(rows);
  } catch (error) {
    console.error("메뉴 조회 오류:", error);
    res
      .status(500)
      .json({ message: "메뉴를 불러오는 중 오류가 발생했습니다." });
  }
};
