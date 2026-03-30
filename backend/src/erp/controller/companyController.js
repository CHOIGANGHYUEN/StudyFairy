const companyService = require("../service/companyService");

exports.getCompanies = async (req, res) => {
  try {
    const companies = await companyService.getCompanies();
    res.status(200).json(companies);
  } catch (err) {
    console.error("회사 목록 조회 에러:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "서버 에러가 발생했습니다." });
  }
};

exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await companyService.getCompanyById(id);
        res.status(200).json(company);
    } catch (err) {
        console.error("회사 조회 에러:", err);
        res.status(err.statusCode || 500).json({ message: err.message || "서버 에러가 발생했습니다." });
    }
};

exports.createCompany = async (req, res) => {
  try {
    const companyData = { ...req.body, createdBy: req.user.userid };
    const result = await companyService.createCompany(companyData);
    res.status(201).json(result);
  } catch (err) {
    console.error("회사 등록 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const companyData = { ...req.body, changedBy: req.user.userid };
    const result = await companyService.updateCompany(id, companyData);
    res.status(200).json(result);
  } catch (err) {
    console.error("회사 수정 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await companyService.deleteCompany(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("회사 삭제 에러:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "서버 에러" });
  }
};
