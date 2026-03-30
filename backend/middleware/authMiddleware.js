const logger = require("../config/logger");
const userService = require("../src/sys/service/userService");
const userRoleService = require("../src/sys//service/userRoleService");

exports.verifyToken = async (req, res, next) => {
  // 브라우저의 사전 요청(Preflight)은 인증 검증을 생략합니다.
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("인증 헤더가 누락되었거나 형식이 잘못되었습니다.");
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];

    // 1. 구글 토큰 유효성 검증
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`,
    );
    if (!response.ok) {
      logger.warn("만료되었거나 유효하지 않은 토큰입니다.");
      return res
        .status(401)
        .json({ message: "유효하지 않은 토큰입니다. 다시 로그인해주세요." });
    }
    const profile = await response.json();

    // 2. 토큰 정보로 우리 DB의 사용자 정보 조회/생성
    const user = await userService.findOrCreateUser(profile);
    if (!user) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 3. 사용자의 권한 정보 조회
    const roles = await userRoleService.findRolesByUserId(user.userId);
    user.roles = roles;

    // 4. req 객체에 사용자 정보 주입
    req.user = user;

    // 다음 미들웨어 또는 컨트롤러로 이동
    next();
  } catch (error) {
    logger.error("토큰 검증 중 오류 발생:", error);
    res.status(500).json({ message: "인증 처리 중 서버 오류가 발생했습니다." });
  }
};
