const { Language, Sequelize } = require("../../index");

exports.getLanguages = async () => {
  return await Language.findAll();
};

exports.createLanguage = async (languageData) => {
  const { langu, languNm } = languageData;
  if (!langu || !languNm) {
    const error = new Error("언어 코드(langu)와 언어명(languNm)은 필수입니다.");
    error.statusCode = 400;
    throw error;
  }

  try {
    const newLanguage = await Language.create(languageData);
    return {
      message: "성공적으로 등록되었습니다.",
      insertId: newLanguage.id,
    };
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      const error = new Error("이미 존재하는 언어 코드(langu)입니다.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

exports.updateLanguage = async (id, languageData) => {
  const { languNm } = languageData;
  if (!languNm) {
    const error = new Error("수정할 언어명(languNm)을 입력해주세요.");
    error.statusCode = 400;
    throw error;
  }

  const [affectedRows] = await Language.update(languageData, {
    where: { id },
  });

  if (affectedRows === 0) {
    const error = new Error("수정할 언어를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }

  return { message: "성공적으로 수정되었습니다." };
};

exports.deleteLanguage = async (id) => {
  const affectedRows = await Language.destroy({
    where: { id },
  });

  if (affectedRows === 0) {
    const error = new Error("삭제할 언어를 찾을 수 없습니다.");
    error.statusCode = 404;
    throw error;
  }
  return { message: "성공적으로 삭제되었습니다." };
};
