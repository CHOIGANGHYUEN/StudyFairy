const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");

// 역할(Role) 관리 API
router.get("/", roleController.getRoles);
router.post("/", roleController.createRole);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

module.exports = router;
