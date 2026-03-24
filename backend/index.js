const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
// index.js 예시
const logger = require("./config/logger");
const morgan = require("morgan");
// 미들웨어 설정
app.use(
  cors({
    origin: "http://localhost:5173", // Vue 프론트엔드 포트 허용
    credentials: true,
  }),
);
app.use(express.json()); // JSON 형태의 요청 body 파싱

// 라우터 설정
const userRoutes = require("./routes/userRoutes");
const menuRoutes = require("./routes/menuRoutes"); // 추가
const languageRoutes = require("./routes/languageRoutes"); // 추가
const codeRoutes = require("./routes/codeRoutes");
const roleRoutes = require("./routes/roleRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const roleMenuRoutes = require("./routes/roleMenuRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoleRoutes = require("./routes/userRoleRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const scheduleDetailRoutes = require("./routes/scheduleDetailRoutes");
const { verifyToken } = require("./middleware/authMiddleware");

app.use("/api/auth", authRoutes); // 인증 라우트 추가
app.use("/api/users", verifyToken, userRoutes);
app.use("/api/menus", verifyToken, menuRoutes);
app.use("/api/languages", verifyToken, languageRoutes);
app.use("/api/codes", verifyToken, codeRoutes);
app.use("/api/roles", verifyToken, roleRoutes);
app.use("/api/summary", verifyToken, summaryRoutes);
app.use("/api/role-menus", verifyToken, roleMenuRoutes);
app.use("/api/user-roles", verifyToken, userRoleRoutes);
app.use("/api/schedules", verifyToken, scheduleRoutes);
app.use("/api/schedule-details", verifyToken, scheduleDetailRoutes);

// morgan 로그를 winston 스트림으로 출력
app.use(morgan("combined", { stream: logger.stream }));

logger.info("서버가 시작되었습니다.");
// 기본 라우트 (테스트용)
app.get("/", (req, res) => {
  res.send("StudyFairy Backend Server is running!");
});

// 전역 에러 처리 미들웨어 (앱이 죽지 않도록 최후의 방어막 역할)
app.use((err, req, res, next) => {
  logger.error(`[Global Error] ${err.message}`);
  res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
});

// 서버 실행
app.listen(port, () => {
  console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
