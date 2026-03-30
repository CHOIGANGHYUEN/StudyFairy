const express = require("express");
const router = express.Router();
const summaryController = require("../controller/summaryController");

router.post("/", summaryController.generateSummary);

module.exports = router;
