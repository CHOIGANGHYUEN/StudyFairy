const { Plant, Plantx, sequelize } = require("../../index");
const HttpError = require("../../../utils/HttpError");

exports.getPlants = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (filters.company) where.company = filters.company;

  const { count, rows } = await Plant.findAndCountAll({
    where,
    include: [{ model: Plantx, as: "names" }],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    distinct: true,
  });
  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page, 10),
    plants: rows,
  };
};

exports.createPlant = async (data, userId) => {
  return await sequelize.transaction(async (t) => {
    const { langu, plantNm, description, ...mainData } = data;
    const newPlant = await Plant.create(
      { ...mainData, createdBy: userId, changedBy: userId },
      { transaction: t },
    );
    if (langu && plantNm) {
      await Plantx.create(
        {
          langu,
          company: mainData.company,
          plant: mainData.plant,
          plantNm,
          description,
          createdBy: userId,
          changedBy: userId,
        },
        { transaction: t },
      );
    }
    return newPlant;
  });
};

exports.updatePlant = async (id, data, userId) => {
  const plantRec = await Plant.findByPk(id);
  if (!plantRec) throw new HttpError(404, "플랜트를 찾을 수 없습니다.");
  return await sequelize.transaction(async (t) => {
    const { langu, plantNm, description, ...mainData } = data;
    await plantRec.update(
      { ...mainData, changedBy: userId },
      { transaction: t },
    );
    if (langu && plantNm) {
      const [px, created] = await Plantx.findOrCreate({
        where: { langu, company: plantRec.company, plant: plantRec.plant },
        defaults: {
          plantNm,
          description,
          createdBy: userId,
          changedBy: userId,
        },
        transaction: t,
      });
      if (!created)
        await px.update(
          { plantNm, description, changedBy: userId },
          { transaction: t },
        );
    }
    return plantRec;
  });
};

exports.deletePlant = async (id) => {
  return await sequelize.transaction(async (t) => {
    const plantRec = await Plant.findByPk(id, { transaction: t });
    if (!plantRec) throw new HttpError(404, "플랜트를 찾을 수 없습니다.");
    await Plantx.destroy({
      where: { plant: plantRec.plant, company: plantRec.company },
      transaction: t,
    });
    await plantRec.destroy({ transaction: t });
    return { message: "삭제되었습니다." };
  });
};
