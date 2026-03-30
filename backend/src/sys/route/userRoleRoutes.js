const express = require("express");
const router = express.Router();
const userRoleController = require("../controller/userRoleController");

router.get("/", userRoleController.getAllUserRoles);
router.post("/", userRoleController.createUserRole);
router.put("/:id", userRoleController.updateUserRole);
router.delete("/:id", userRoleController.deleteUserRole);

module.exports = router;
