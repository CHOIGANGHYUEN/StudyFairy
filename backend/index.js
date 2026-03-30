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
const apiRoutes = require("./src/routes"); // 라우트 인덱스 파일 import

// 모든 API 라우트를 /api 접두사 아래에 통합
app.use("/api", apiRoutes);

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
