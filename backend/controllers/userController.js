const userService = require("../service/userService");

// 전체 사용자 목록 조회
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("사용자 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
