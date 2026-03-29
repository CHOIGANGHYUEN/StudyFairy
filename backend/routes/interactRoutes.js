const express = require("express");
const router = express.Router();
const interactController = require("../controllers/interactController");

router.post("/", interactController.generateAnswer);

module.exports = router;
