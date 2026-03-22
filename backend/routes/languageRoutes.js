const express = require("express");
const router = express.Router();
const languageController = require("../controllers/languageController");

// 라우팅 설정
router.get("/", languageController.getLanguages); // 조회
router.post("/", languageController.createLanguage); // 등록
router.put("/:id", languageController.updateLanguage); // 수정
router.delete("/:id", languageController.deleteLanguage); // 삭제

module.exports = router;
