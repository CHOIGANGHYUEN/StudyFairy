const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

router.post("/google/login", authController.googleLogin);

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     summary: 액세스 토큰 유효성 검증
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 토큰이 유효함
 *       '401':
 *         description: 토큰이 유효하지 않거나 누락됨
 *       '500':
 *         description: 서버 오류
 */
router.post("/verify-token", verifyToken, authController.verifyToken);

module.exports = router;
