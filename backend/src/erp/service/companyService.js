const { sequelize, Company, Companyx, Sequelize } = require("../../index");
const { Op } = Sequelize;

// 모든 회사 정보와 다국어 이름을 함께 조회
exports.getCompanies = async () => {
  return await Company.findAll({
    include: [
      {
        model: Companyx,
        as: "names",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// 특정 ID의 회사 정보와 다국어 이름을 함께 조회
exports.getCompanyById = async (id) => {
  const company = await Company.findByPk(id, {
    include: [
      {
        model: Companyx,
        as: "names",
      },
    ],
  });
  if (!company) {
    const error = new Error("회사를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }
  return company;
};

// 회사 정보 생성
exports.createCompany = async (companyData) => {
  const t = await sequelize.transaction();
  try {
    const { names, ...mainData } = companyData;

    // 1. Check for required fields
    if (!mainData.companyId) {
      const error = new Error("회사 ID는 필수입니다.");
      error.statusCode = 400;
      throw error;
    }

    // 2. Create main company record
    const newCompany = await Company.create(mainData, { transaction: t });

    // 3. Create multilingual names if they exist
    if (names && names.length > 0) {
      const companyxData = names.map((item) => ({
        ...item,
        companyId: newCompany.companyId,
        createdBy: mainData.createdBy,
      }));
      await Companyx.bulkCreate(companyxData, { transaction: t });
    }

    await t.commit();
    return {
      message: "성공적으로 등록되었습니다.",
      insertId: newCompany.id,
    };
  } catch (err) {
    await t.rollback();
    if (err.name === "SequelizeUniqueConstraintError") {
      const error = new Error("이미 존재하는 회사 ID입니다.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

// 회사 정보 수정
exports.updateCompany = async (id, companyData) => {
  const t = await sequelize.transaction();
  try {
    const { names, companyId, ...mainData } = companyData;

    // 1. Update main company record
    const [affectedRows] = await Company.update(mainData, {
      where: { id },
      transaction: t,
    });

    if (affectedRows === 0) {
      const error = new Error("수정할 회사를 찾을 수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    // 2. Update or create multilingual names
    if (names && names.length > 0) {
      for (const nameData of names) {
        const { langu, companyNm } = nameData;
        const [companyx, created] = await Companyx.findOrCreate({
          where: { companyId, langu },
          defaults: {
            companyNm,
            createdBy: mainData.changedBy,
          },
          transaction: t,
        });

        if (!created) {
          // if found, update it
          companyx.companyNm = companyNm;
          companyx.changedBy = mainData.changedBy;
          await companyx.save({ transaction: t });
        }
      }
    }

    await t.commit();
    return { message: "성공적으로 수정되었습니다." };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// 회사 정보 삭제
exports.deleteCompany = async (id) => {
  const t = await sequelize.transaction();
  try {
    const company = await Company.findByPk(id);
    if (!company) {
      const error = new Error("삭제할 회사를 찾을 수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    // 1. Delete associated multilingual names
    await Companyx.destroy({
      where: { companyId: company.companyId },
      transaction: t,
    });

    // 2. Delete main company record
    await Company.destroy({ where: { id }, transaction: t });

    await t.commit();
    return { message: "성공적으로 삭제되었습니다." };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
