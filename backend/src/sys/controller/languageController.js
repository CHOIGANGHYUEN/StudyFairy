const languageService = require("../service/languageService");

exports.getLanguages = async (req, res) => {
  try {
    const languages = await languageService.getLanguages();
    res.status(200).json(languages);
  } catch (err) {
    console.error("언어 목록 조회 에러:", err);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

exports.createLanguage = async (req, res) => {
  try {
    const result = await languageService.createLanguage(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("언어 등록 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

exports.updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await languageService.updateLanguage(id, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("언어 수정 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

exports.deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await languageService.deleteLanguage(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("언어 삭제 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};
