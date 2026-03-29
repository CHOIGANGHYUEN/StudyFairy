const unitService = require("../service/unitService");

// 모든 단위 조회
exports.getUnits = async (req, res) => {
  try {
    const units = await unitService.getUnits();
    res.status(200).json(units);
  } catch (err) {
    console.error("단위 목록 조회 에러:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "서버 에러가 발생했습니다." });
  }
};

// 특정 ID의 단위 조회
exports.getUnitById = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await unitService.getUnitById(id);
        res.status(200).json(unit);
    } catch (err) {
        console.error("단위 조회 에러:", err);
        res.status(err.statusCode || 500).json({ message: err.message || "서버 에러가 발생했습니다." });
    }
};

// 단위 생성
exports.createUnit = async (req, res) => {
  try {
    // 요청자 정보 추가
    const unitData = { ...req.body, createdBy: req.user.userid };
    const result = await unitService.createUnit(unitData);
    res.status(201).json(result);
  } catch (err) {
    console.error("단위 등록 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

// 단위 수정
exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    // 변경자 정보 추가
    const unitData = { ...req.body, changedBy: req.user.userid };
    const result = await unitService.updateUnit(id, unitData);
    res.status(200).json(result);
  } catch (err) {
    console.error("단위 수정 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

// 단위 삭제
exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await unitService.deleteUnit(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("단위 삭제 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};
