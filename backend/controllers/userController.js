const db = require("../config/db");

// 전체 사용자 목록 조회
exports.getAllUsers = async (req, res) => {
  try {
    // 실제 테이블명(users)에 맞게 쿼리 수정 필요
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error("사용자 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
