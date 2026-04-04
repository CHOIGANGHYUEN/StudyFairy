const { MatClass, MatClassx, sequelize } = require("../../index");
const HttpError = require("../../../utils/HttpError");

exports.getMatClasses = async (filters = {}) => {
  const where = {};
  if (filters.company) where.company = filters.company;

  return await MatClass.findAll({
    where,
    include: [{ model: MatClassx, as: "names" }],
  });
};

exports.createMatClass = async (data, userId) => {
  const {
    company,
    matClass,
    parentClass,
    classLevel,
    useYn,
    langu,
    matClassNm,
    description,
  } = data;

  return await sequelize.transaction(async (t) => {
    const newMatClass = await MatClass.create(
      {
        company,
        matClass,
        parentClass: parentClass || null,
        classLevel,
        useYn,
        createdBy: userId,
        changedBy: userId,
      },
      { transaction: t },
    );

    // 다국어 명칭 정보가 함께 넘어온 경우
    if (langu && matClassNm) {
      await MatClassx.create(
        {
          langu,
          company,
          matClass,
          matClassNm,
          description,
          createdBy: userId,
          changedBy: userId,
        },
        { transaction: t },
      );
    }

    return newMatClass;
  });
};

exports.updateMatClass = async (id, data, userId) => {
  const {
    company,
    matClass,
    parentClass,
    classLevel,
    useYn,
    langu,
    matClassNm,
    description,
  } = data;

  const matClassRecord = await MatClass.findByPk(id);
  if (!matClassRecord) {
    throw new HttpError(404, "자재 분류를 찾을 수 없습니다.");
  }

  return await sequelize.transaction(async (t) => {
    await matClassRecord.update(
      {
        company,
        matClass,
        parentClass: parentClass || null,
        classLevel,
        useYn,
        changedBy: userId,
      },
      { transaction: t },
    );

    if (langu && matClassNm) {
      const [matClassxRecord, created] = await MatClassx.findOrCreate({
        where: { langu, company, matClass },
        defaults: {
          matClassNm,
          description,
          createdBy: userId,
          changedBy: userId,
        },
        transaction: t,
      });

      if (!created) {
        await matClassxRecord.update(
          { matClassNm, description, changedBy: userId },
          { transaction: t },
        );
      }
    }

    return matClassRecord;
  });
};

exports.deleteMatClass = async (id) => {
  return await sequelize.transaction(async (t) => {
    const matClassRecord = await MatClass.findByPk(id, { transaction: t });
    if (!matClassRecord) {
      throw new HttpError(404, "자재 분류를 찾을 수 없습니다.");
    }

    await MatClassx.destroy({
      where: {
        matClass: matClassRecord.matClass,
        company: matClassRecord.company,
      },
      transaction: t,
    });

    await matClassRecord.destroy({ transaction: t });
    return { message: "자재 분류가 삭제되었습니다." };
  });
};
