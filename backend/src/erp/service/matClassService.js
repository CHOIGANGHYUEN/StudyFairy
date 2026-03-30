const { MatClass, MatClassx, sequelize } = require("../../index");

exports.getMatClasses = async (filters = {}) => {
  const where = {};
  if (filters.companyId) where.companyId = filters.companyId;

  return await MatClass.findAll({
    where,
    include: [{ model: MatClassx, as: "names" }],
  });
};

exports.createMatClass = async (data, userId) => {
  const {
    companyId,
    matClass,
    parentClass,
    classLevel,
    useYn,
    langu,
    matClassNm,
    description,
  } = data;

  const t = await sequelize.transaction();
  try {
    const newMatClass = await MatClass.create(
      {
        companyId,
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
          companyId,
          matClass,
          matClassNm,
          description,
          createdBy: userId,
          changedBy: userId,
        },
        { transaction: t },
      );
    }

    await t.commit();
    return newMatClass;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

exports.updateMatClass = async (id, data, userId) => {
  const {
    companyId,
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
    const error = new Error("자재 분류를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    await matClassRecord.update(
      {
        companyId,
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
        where: { langu, companyId, matClass },
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

    await t.commit();
    return matClassRecord;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

exports.deleteMatClass = async (id) => {
  const matClassRecord = await MatClass.findByPk(id);
  if (!matClassRecord) {
    const error = new Error("자재 분류를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    await MatClassx.destroy({
      where: {
        matClass: matClassRecord.matClass,
        companyId: matClassRecord.companyId,
      },
      transaction: t,
    });

    await matClassRecord.destroy({ transaction: t });
    await t.commit();
    return { message: "자재 분류가 삭제되었습니다." };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
