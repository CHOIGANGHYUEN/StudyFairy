const express = require("express");
const router = express.Router();
const interactController = require("../controller/interactController");

router.post("/", interactController.generateAnswer);

module.exports = router;
