const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");

// 모든 단위 조회
router.get("/", unitController.getUnits);

// 특정 ID의 단위 조회
router.get("/:id", unitController.getUnitById);

// 단위 생성
router.post("/", unitController.createUnit);

// 단위 수정
router.put("/:id", unitController.updateUnit);

// 단위 삭제
router.delete("/:id", unitController.deleteUnit);

module.exports = router;
