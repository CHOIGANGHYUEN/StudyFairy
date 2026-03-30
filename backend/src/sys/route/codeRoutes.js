const express = require("express");
const router = express.Router();
const codeController = require("../controller/codeController");
router.post("/initialize-categories", codeController.initializeCategories);

// --- Code Head (Group) Routes ---
router.get("/heads/:categoryCode", codeController.getAllHeads);
router.post("/heads", codeController.createHead);
router.put("/heads/:categoryCode/:groupCode", codeController.updateHead);
router.delete("/heads/:categoryCode/:groupCode", codeController.deleteHead);

// --- Code Item (Detail) Routes ---
router.get(
  "/items/:categoryCode/:groupCode",
  codeController.getItemsByGroupCode,
);
router.post("/items", codeController.createItem);
router.put(
  "/items/:categoryCode/:groupCode/:subCode",
  codeController.updateItem,
);
router.delete(
  "/items/:categoryCode/:groupCode/:subCode",
  codeController.deleteItem,
);

module.exports = router;
