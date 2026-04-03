const { Unit, Sequelize } = require("../../index");
const { Op } = Sequelize;

// 모든 단위 조회
exports.getUnits = async () => {
  return await Unit.findAll({
    order: [["dispOrd", "ASC"]],
  });
};

// 특정 ID의 단위 조회
exports.getUnitById = async (id) => {
  const unit = await Unit.findByPk(id);
  if (!unit) {
    const error = new Error("단위를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }
  return unit;
};

// 단위 생성
exports.createUnit = async (unitData) => {
  const { unit, unitNm, baseUnitYn } = unitData;
  if (!unit || !unitNm || baseUnitYn === null || baseUnitYn === undefined) {
    const error = new Error("단위 ID, 단위명, 기본 단위 여부는 필수입니다.");
    error.statusCode = 400;
    throw error;
  }

  try {
    const newUnit = await Unit.create(unitData);
    return {
      message: "성공적으로 등록되었습니다.",
      insertId: newUnit.id,
    };
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      const error = new Error("이미 존재하는 단위 ID입니다.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

// 단위 수정
exports.updateUnit = async (id, unitData) => {
  const { unit, unitNm, baseUnitYn } = unitData;
  if (!unit || !unitNm || baseUnitYn === null || baseUnitYn === undefined) {
    const error = new Error("단위 ID, 단위명, 기본 단위 여부는 필수입니다.");
    error.statusCode = 400;
    throw error;
  }

  // Check for duplicate unit
  const existingUnit = await Unit.findOne({
    where: {
      unit: unit,
      id: { [Op.ne]: id }, // Exclude the current unit being updated
    },
  });

  if (existingUnit) {
    const error = new Error("이미 존재하는 단위 ID입니다.");
    error.statusCode = 409;
    throw error;
  }

  const [affectedRows] = await Unit.update(unitData, {
    where: { id },
  });

  if (affectedRows === 0) {
    const error = new Error("수정할 단위를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }

  return { message: "성공적으로 수정되었습니다." };
};

// 단위 삭제
exports.deleteUnit = async (id) => {
  const affectedRows = await Unit.destroy({
    where: { id },
  });

  if (affectedRows === 0) {
    const error = new Error("삭제할 단위를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }
  return { message: "성공적으로 삭제되었습니다." };
};
