const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// 일정 마스터 CRUD 라우트
router.get("/", scheduleController.getAllSchedules);
router.post("/bulk", scheduleController.createSchedulesBulk);
router.post("/", scheduleController.createSchedule);
router.put("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
