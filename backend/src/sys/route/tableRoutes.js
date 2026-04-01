const express = require("express");
const router = express.Router();
const tableController = require("../controller/tableController");

router.get("/", tableController.getTables);
router.post("/", tableController.saveTableSpec);

module.exports = router;
