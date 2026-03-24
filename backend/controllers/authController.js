const logger = require("../config/logger");
const userService = require("../service/userService");
const userRoleService = require("../service/userRoleService");

exports.googleLogin = async (req, res) => {
  const { accessToken } = req.body;
  logger.info(
    `Google login initiated with token: ${accessToken.substring(0, 10)}...`,
  );
  if (!accessToken) {
    return res.status(400).json({ message: "Access token is required." });
  }

  try {
    // 1. 구글 토큰 유효성 검증
    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
    );
    if (!googleResponse.ok) {
      logger.warn("Invalid Google token received.");
      return res.status(401).json({ message: "Invalid Google token." });
    }
    const profile = await googleResponse.json();
    logger.info("Google profile received:", profile);

    // 2. DB에서 사용자 조회 또는 생성
    const user = await userService.findOrCreateUser(profile);
    logger.info("User found or created:", user);

    // 3. 사용자의 권한 정보 조회
    const roles = await userRoleService.findRolesByUserId(user.userId);
    logger.info(`Roles found for user ${user.userId}:`, roles);
    user.roles = roles;

    // 4. 프론트엔드로 사용자 정보 응답
    logger.info("Sending final user object to frontend:", user);
    res.status(200).json({ user });
  } catch (error) {
    logger.error("Google login processing error:", error);
    res.status(500).json({ message: "Server error during login process." });
  }
};

/**
 * @summary 토큰 유효성 검증
 * @description 미들웨어에서 이미 토큰 검증이 완료되었으므로,
 *              이 컨트롤러에 도달했다는 것 자체가 토큰이 유효하다는 의미입니다.
 *              따라서 별도 로직 없이 성공 상태를 응답합니다.
 * @param {object} req - Express의 요청(Request) 객체
 * @param {object} res - Express의 응답(Response) 객체
 */
exports.verifyToken = (req, res) => {
  try {
    // authMiddleware.verifyToken 미들웨어를 통과했다면 토큰은 유효합니다.
    logger.info("토큰이 유효합니다.");
    res.status(200).json({ message: "토큰이 유효합니다." });
  } catch (error) {
    logger.error("토큰 검증 컨트롤러에서 오류 발생:", error);
    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
};
