const express = require("express");
const router = express.Router();
const scheduleDetailController = require("../controller/scheduleDetailController");

// Routes for sysSchedulerDetail

// GET /api/details - Get all details, with optional filtering
router.get("/", scheduleDetailController.getScheduleDetails);

// POST /api/details - Create a new detail
router.post("/", scheduleDetailController.createScheduleDetail);

// GET /api/details/:id - Get a single detail by ID
router.get("/:id", scheduleDetailController.getScheduleDetailById);

// PUT /api/details/:id - Update a detail by ID
router.put("/:id", scheduleDetailController.updateScheduleDetail);

// DELETE /api/details/:id - Delete a detail by ID
router.delete("/:id", scheduleDetailController.deleteScheduleDetail);

module.exports = router;
