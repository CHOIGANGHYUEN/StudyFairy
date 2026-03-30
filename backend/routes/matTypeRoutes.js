const express = require("express");
const router = express.Router();
const matTypeController = require("../controllers/matTypeController");

router.get("/", matTypeController.getMatTypes);
router.get("/:id", matTypeController.getMatTypeById);
router.post("/", matTypeController.createMatType);
router.put("/:id", matTypeController.updateMatType);
router.delete("/:id", matTypeController.deleteMatType);

module.exports = router;
