const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

router.get("/", menuController.getMenus); // 조회
router.post("/", menuController.createMenu); // 등록
router.put("/:id", menuController.updateMenu); // 수정
router.delete("/:id", menuController.deleteMenu); // 삭제

module.exports = router;
