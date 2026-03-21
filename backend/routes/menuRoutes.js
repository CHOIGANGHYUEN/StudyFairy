const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

// GET /api/menus
router.get("/", menuController.getAllMenus);

module.exports = router;
