const express = require("express");
const router = express.Router();

// Middleware
const { verifyToken } = require("../middleware/authMiddleware");

// Route modules
const authRoutes = require("./auth/route/authRoutes");
const userRoutes = require("./sys/route/userRoutes");
const menuRoutes = require("./sys/route/menuRoutes");
const languageRoutes = require("./sys/route/languageRoutes");
const codeRoutes = require("./sys/route/codeRoutes");
const roleRoutes = require("./sys/route/roleRoutes");
const summaryRoutes = require("./serv/route/summaryRoutes");
const roleMenuRoutes = require("./sys/route/roleMenuRoutes");
const userRoleRoutes = require("./sys/route/userRoleRoutes");
const scheduleRoutes = require("./serv/route/scheduleRoutes");
const scheduleDetailRoutes = require("./serv/route/scheduleDetailRoutes");
const interactRoutes = require("./serv/route/interactRoutes");
const companyRoutes = require("./erp/route/companyRoutes");
const unitRoutes = require("./erp/route/unitRoutes");
const matTypeRoutes = require("./erp/route/matTypeRoutes");
const matClassRoutes = require("./erp/route/matClassRoutes");
const tableRoutes = require("./sys/route/tableRoutes");

// Public routes
router.use("/auth", authRoutes);

// Protected routes (all routes below will use verifyToken middleware)
router.use(verifyToken);

router.use("/users", userRoutes);
router.use("/menus", menuRoutes);
router.use("/languages", languageRoutes);
router.use("/codes", codeRoutes);
router.use("/roles", roleRoutes);
router.use("/summary", summaryRoutes);
router.use("/interact", interactRoutes);
router.use("/role-menus", roleMenuRoutes);
router.use("/user-roles", userRoleRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/schedule-details", scheduleDetailRoutes);
router.use("/companies", companyRoutes);
router.use("/units", unitRoutes);
router.use("/mat-types", matTypeRoutes);
router.use("/mat-classes", matClassRoutes); // 프론트엔드의 api.get("/mat-classes")에 맞춤
router.use("/tables", tableRoutes); // 프론트엔드의 api.get("/mat-classes")에 맞춤

module.exports = router;
