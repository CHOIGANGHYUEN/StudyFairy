const { Unit, Sequelize, sequelize } = require("../../index");
const { Op } = Sequelize;
const HttpError = require("../../../utils/HttpError");

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
    throw new HttpError(404, "단위를 찾을 수 없습니다.");
  }
  return unit;
};

// 단위 생성
exports.createUnit = async (unitData) => {
  const { unit, unitNm, baseUnitYn } = unitData;
  if (!unit || !unitNm || baseUnitYn === null || baseUnitYn === undefined) {
    throw new HttpError(400, "단위 ID, 단위명, 기본 단위 여부는 필수입니다.");
  }

  return await sequelize
    .transaction(async (t) => {
      const newUnit = await Unit.create(unitData, { transaction: t });
      return { message: "성공적으로 등록되었습니다.", insertId: newUnit.id };
    })
    .catch((err) => {
      if (err instanceof Sequelize.UniqueConstraintError) {
        throw new HttpError(409, "이미 존재하는 단위 ID입니다.");
      }
      throw err;
    });
};

// 단위 수정
exports.updateUnit = async (id, unitData) => {
  const { unit, unitNm, baseUnitYn } = unitData;
  if (!unit || !unitNm || baseUnitYn === null || baseUnitYn === undefined) {
    throw new HttpError(400, "단위 ID, 단위명, 기본 단위 여부는 필수입니다.");
  }

  return await sequelize.transaction(async (t) => {
    const existingUnit = await Unit.findOne({
      where: {
        unit: unit,
        id: { [Op.ne]: id },
      },
      transaction: t,
    });

    if (existingUnit) {
      throw new HttpError(409, "이미 존재하는 단위 ID입니다.");
    }

    const [affectedRows] = await Unit.update(unitData, {
      where: { id },
      transaction: t,
    });

    if (affectedRows === 0) {
      throw new HttpError(404, "수정할 단위를 찾을 수 없습니다.");
    }

    return { message: "성공적으로 수정되었습니다." };
  });
};

// 단위 삭제
exports.deleteUnit = async (id) => {
  return await sequelize.transaction(async (t) => {
    const affectedRows = await Unit.destroy({
      where: { id },
      transaction: t,
    });

    if (affectedRows === 0) {
      throw new HttpError(404, "삭제할 단위를 찾을 수 없습니다.");
    }
    return { message: "성공적으로 삭제되었습니다." };
  });
};
