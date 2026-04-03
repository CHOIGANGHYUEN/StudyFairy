const { MatType, MatTypex, sequelize, Sequelize } = require("../../index");

exports.getMatTypes = async (filters = {}) => {
  const whereClause = {};
  if (filters.company) {
    whereClause.company = filters.company;
  }

  return await MatType.findAll({
    where: whereClause,
    include: [
      {
        model: MatTypex,
        as: "names",
      },
    ],
    order: [["matType", "ASC"]],
  });
};

exports.getMatTypeById = async (id) => {
  const matTypeInstance = await MatType.findByPk(id, {
    include: [{ model: MatTypex, as: "names" }],
  });
  if (!matTypeInstance) {
    const error = new Error("Material Type not found.");
    error.statusCode = 404;
    throw error;
  }
  return matTypeInstance;
};

exports.createMatType = async (data) => {
  const {
    company,
    matType,
    matTypeNm,
    langu,
    description,
    createdBy,
    ...matTypeData
  } = data;

  if (!company || !matType || !matTypeNm || !langu) {
    const error = new Error(
      "company, matType, matTypeNm, and langu are required.",
    );
    error.statusCode = 400;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    const newMatType = await MatType.create(
      {
        company,
        matType,
        createdBy,
        ...matTypeData,
      },
      { transaction: t },
    );

    await MatTypex.create(
      {
        company,
        matType,
        langu,
        matTypeNm,
        description,
        createdBy,
      },
      { transaction: t },
    );

    await t.commit();
    return newMatType;
  } catch (err) {
    await t.rollback();
    if (err instanceof Sequelize.UniqueConstraintError) {
      let message = "중복된 항목이 이미 존재합니다.";
      // err.fields is an object like { matType: '...' } or { langu: '..', company: '..', matType: '..' }
      if (
        err.fields &&
        Object.keys(err.fields).length === 1 &&
        "matType" in err.fields
      ) {
        message = "이미 존재하는 자재 유형 코드(matType)입니다.";
      } else if (err.fields && "langu" in err.fields) {
        message = "해당 언어(langu)에 대한 자재 유형이 이미 존재합니다.";
      }
      const error = new Error(message);
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

exports.updateMatType = async (id, data) => {
  const { matTypeNm, description, langu, changedBy, ...mainData } = data;

  const matTypeInstance = await MatType.findByPk(id);
  if (!matTypeInstance) {
    const error = new Error("Material Type not found.");
    error.statusCode = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    // 요청에 포함된 필드만 업데이트하여 의도치 않은 null 값 저장을 방지합니다.
    const mainUpdatePayload = { changedBy };
    const mainFields = [
      "procureType",
      "priceCtrlType",
      "qtyUpdateYn",
      "valUpdateYn",
      "useYn",
    ];
    mainFields.forEach((field) => {
      if (mainData[field] !== undefined)
        mainUpdatePayload[field] = mainData[field];
    });
    await matTypeInstance.update(mainUpdatePayload, { transaction: t });

    if (langu) {
      const [matTypexInstance, created] = await matTypex.findOrCreate({
        where: {
          matType: matTypeInstance.matType,
          company: matTypeInstance.company,
          langu: langu,
        },
        defaults: {
          matTypeNm,
          description,
          createdBy: changedBy,
        },
        transaction: t,
      });

      if (!created) {
        // 요청에 포함된 필드만 업데이트
        const namesUpdatePayload = { changedBy };
        if (matTypeNm !== undefined) namesUpdatePayload.matTypeNm = matTypeNm;
        if (description !== undefined)
          namesUpdatePayload.description = description;
        await matTypexInstance.update(namesUpdatePayload, {
          transaction: t,
        });
      }
    }

    await t.commit();
    return await this.getMatTypeById(id);
  } catch (err) {
    await t.rollback();
    if (err instanceof Sequelize.UniqueConstraintError) {
      const error = new Error("데이터 수정 중 중복 오류가 발생했습니다.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

exports.deleteMatType = async (id) => {
  const matTypeInstance = await MatType.findByPk(id);
  if (!matTypeInstance) {
    const error = new Error("Material Type not found.");
    error.statusCode = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    await MatTypex.destroy({
      where: { matType: matTypeInstance.matType },
      transaction: t,
    });
    await matTypeInstance.destroy({ transaction: t });
    await t.commit();
    return { message: "Successfully deleted." };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
