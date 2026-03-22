const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  debug: ["ComQueryPacket", "RowDataPacket"], // 👈 디버그 관련 패킷 출력 옵션 추가
});

// 연결 테스트
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ MySQL 데이터베이스 연결 성공");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ MySQL 연결 실패:", err);
  });

module.exports = pool;
