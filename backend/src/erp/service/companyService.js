const { sequelize, Company, Companyx, Sequelize } = require("../../index");
const { Op } = Sequelize;
const HttpError = require("../../../utils/HttpError");
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
    throw new HttpError(404, "회사를 찾을 수 없습니다.");
  }
  return company;
};

// 회사 정보 생성
exports.createCompany = async (companyData) => {
  return await sequelize
    .transaction(async (t) => {
      const { names, ...mainData } = companyData;

      // 1. Check for required fields
      if (!mainData.company) {
        throw new HttpError(400, "회사 ID는 필수입니다.");
      }

      // 2. Create main company record
      const newCompany = await Company.create(mainData, { transaction: t });

      // 3. Create multilingual names if they exist
      if (names && names.length > 0) {
        const companyxData = names.map((item) => ({
          ...item,
          company: newCompany.company,
          createdBy: mainData.createdBy,
        }));
        await Companyx.bulkCreate(companyxData, { transaction: t });
      }

      return {
        message: "성공적으로 등록되었습니다.",
        insertId: newCompany.id,
      };
    })
    .catch((err) => {
      if (
        err.name === "SequelizeUniqueConstraintError" ||
        err instanceof Sequelize.UniqueConstraintError
      ) {
        throw new HttpError(409, "이미 존재하는 회사 ID입니다.");
      }
      throw err;
    });
};

// 회사 정보 수정
exports.updateCompany = async (id, companyData) => {
  return await sequelize.transaction(async (t) => {
    const { names, company, ...mainData } = companyData;

    // 1. Update main company record
    const [affectedRows] = await Company.update(mainData, {
      where: { id },
      transaction: t,
    });

    if (affectedRows === 0) {
      throw new HttpError(404, "수정할 회사를 찾을 수 없습니다.");
    }

    // 2. Update or create multilingual names
    if (names && names.length > 0) {
      for (const nameData of names) {
        const { langu, companyNm } = nameData;
        const [companyx, created] = await Companyx.findOrCreate({
          where: { company, langu },
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

    return { message: "성공적으로 수정되었습니다." };
  });
};

// 회사 정보 삭제
exports.deleteCompany = async (id) => {
  return await sequelize.transaction(async (t) => {
    const companyInstance = await Company.findByPk(id, { transaction: t });
    if (!companyInstance) {
      throw new HttpError(404, "삭제할 회사를 찾을 수 없습니다.");
    }

    // 1. Delete associated multilingual names
    await Companyx.destroy({
      where: { company: companyInstance.company },
      transaction: t,
    });

    // 2. Delete main company record
    await companyInstance.destroy({ transaction: t });

    return { message: "성공적으로 삭제되었습니다." };
  });
};
