const express = require("express");
const router = express.Router();

// Middleware
const { verifyToken } = require("../middleware/authMiddleware");

// Route modules
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const menuRoutes = require("./menuRoutes");
const languageRoutes = require("./languageRoutes");
const codeRoutes = require("./codeRoutes");
const roleRoutes = require("./roleRoutes");
const summaryRoutes = require("./summaryRoutes");
const roleMenuRoutes = require("./roleMenuRoutes");
const userRoleRoutes = require("./userRoleRoutes");
const scheduleRoutes = require("./scheduleRoutes");
const scheduleDetailRoutes = require("./scheduleDetailRoutes");
const interactRoutes = require("./interactRoutes");
const companyRoutes = require("./companyRoutes");
const unitRoutes = require("./unitRoutes");
const matTypeRoutes = require("./matTypeRoutes");
const matClassRoutes = require("./matClassRoutes");

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

module.exports = router;
