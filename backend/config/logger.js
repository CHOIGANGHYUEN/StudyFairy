const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

const { combine, timestamp, printf, colorize } = winston.format;

// 로그가 저장될 디렉토리 설정 (상위 폴더의 logs)
const logDir = path.join(__dirname, "..", "logs");

// 로그 디렉토리가 존재하지 않으면 생성
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 민감 정보 마스킹 처리를 위한 포맷터 추가
const sensitiveDataFilter = winston.format((info) => {
  const sensitiveKeys = [
    "password",
    "accessToken",
    "refreshToken",
    "token",
    "authorization",
    "apiKey",
  ];
  if (info.message && typeof info.message === "string") {
    sensitiveKeys.forEach((key) => {
      // JSON 문자열 내부의 민감한 키-값 패턴을 정규식으로 찾아 마스킹
      const regex = new RegExp(`("${key}"\\s*:\\s*")([^"]+)(")`, "gi");
      info.message = info.message.replace(regex, "$1********$3");
    });
  }
  return info;
});

// 사용자 정의 로그 포맷
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

/**
 * Winston 로거 설정
 */
const logger = winston.createLogger({
  // 환경에 따른 로그 레벨 설정 (운영: info, 개발: debug)
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    sensitiveDataFilter(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat,
  ),
  transports: [
    // 1. 콘솔 출력 (개발용)
    new winston.transports.Console({
      format: combine(
        colorize(), // 콘솔 레벨별 색상 적용
        logFormat,
      ),
      handleExceptions: true,
    }),

    // 2. 전체 로그 파일 (Daily Rotate)
    new winston.transports.DailyRotateFile({
      level: "info",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: "14d", // 14일치 로그 보관
      zippedArchive: true, // 압축 보관
      handleExceptions: true,
    }),

    // 3. 에러 전용 로그 파일 (Daily Rotate)
    new winston.transports.DailyRotateFile({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: path.join(logDir, "error"),
      filename: `%DATE%.error.log`,
      maxFiles: "30d", // 에러 로그는 중요하므로 30일 보관
      zippedArchive: true,
      handleExceptions: true,
    }),
  ],
  // 정의되지 않은 에러 발생 시 처리
  exitOnError: false,
});

// morgan 미들웨어와 연결하기 위한 스트림 설정
logger.stream = {
  write: (message) => {
    // morgan이 보내는 메시지 끝에 개행(\n)이 포함되어 있으므로 제거 후 출력
    logger.info(message.trim());
  },
};

module.exports = logger;
