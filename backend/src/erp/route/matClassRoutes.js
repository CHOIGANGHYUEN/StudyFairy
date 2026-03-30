const express = require("express");
const router = express.Router();
const matClassController = require("../controller/matClassController");

router.get("/", matClassController.getMatClasses);
router.post("/", matClassController.createMatClass);
router.put(
  "/:id",

  matClassController.updateMatClass,
);
router.delete(
  "/:id",

  matClassController.deleteMatClass,
);

module.exports = router;
