const express = require("express");
const router = express.Router();
const tableController = require("../controller/tableController");

router.get("/", tableController.getTables);
router.post("/", tableController.saveTableSpec);
router.delete("/:tablen", tableController.deleteTableSpec);
router.post("/execute", tableController.executeScript);

module.exports = router;
