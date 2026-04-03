const express = require("express");
const router = express.Router();
const tableHistoryController = require("../controller/tableHistoryController");

router.get("/", tableHistoryController.getHistories);

module.exports = router;
