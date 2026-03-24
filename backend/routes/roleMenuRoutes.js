const express = require("express");
const router = express.Router();
const roleMenuController = require("../controllers/roleMenuController");

router.get("/", roleMenuController.getAllRoleMenus);
router.post("/", roleMenuController.createRoleMenu);
router.put("/:id", roleMenuController.updateRoleMenu);
router.delete("/:id", roleMenuController.deleteRoleMenu);

module.exports = router;
