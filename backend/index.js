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
app.use("/api/users", userRoutes);
app.use("/api/menus", menuRoutes); // 추가
app.use("/api/languages", languageRoutes); // 추가
app.use("/api/codes", codeRoutes);

// morgan 로그를 winston 스트림으로 출력
app.use(morgan("combined", { stream: logger.stream }));

logger.info("서버가 시작되었습니다.");
// 기본 라우트 (테스트용)
app.get("/", (req, res) => {
  res.send("StudyFairy Backend Server is running!");
});

// 서버 실행
app.listen(port, () => {
  console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
