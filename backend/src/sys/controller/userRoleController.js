const userRoleService = require("../service/userRoleService");

exports.getAllUserRoles = async (req, res) => {
  try {
    const mappings = await userRoleService.getAllUserRoles();
    res.status(200).json(mappings);
  } catch (error) {
    console.error("사용자-권한 매핑 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

exports.createUserRole = async (req, res) => {
  try {
    const newMapping = await userRoleService.createUserRole(req.body);
    res.status(201).json(newMapping);
  } catch (error) {
    console.error("사용자-권한 매핑 등록 오류:", error);
    // UNIQUE INDEX(userId, roleId) 제약조건 위반 처리
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "해당 사용자에게 이미 등록된 권한입니다." });
    }
    res.status(500).json({ message: "권한 등록에 실패했습니다." });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMapping = await userRoleService.updateUserRole(id, req.body);
    res.status(200).json(updatedMapping);
  } catch (error) {
    console.error("사용자-권한 매핑 수정 오류:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "이미 동일한 사용자-권한 매핑이 존재합니다." });
    }
    res.status(500).json({ message: "권한 수정에 실패했습니다." });
  }
};

exports.deleteUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    await userRoleService.deleteUserRole(id);
    res.status(200).json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("사용자-권한 매핑 삭제 오류:", error);
    res
      .status(500)
      .json({ message: error.message || "권한 삭제에 실패했습니다." });
  }
};
