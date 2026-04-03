"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// Load .env file from the root directory
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const db = {};

let sequelize;
if (process.env.DB_HOST) {
  // Simple check if .env is loaded
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
    },
  );
} else {
  // Fallback or error handling if .env is not loaded
  console.error(
    "Database configuration not found. Make sure .env file is set up correctly.",
  );
  process.exit(1);
}

const modelDirs = ["erp/model", "serv/model", "sys/model", "log/model"];

modelDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  fs.readdirSync(dirPath)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 &&
        file.slice(-3) === ".js" &&
        file.indexOf(".test.js") === -1
      );
    })
    .forEach((file) => {
      const model = require(path.join(dirPath, file))(
        sequelize,
        Sequelize.DataTypes,
      );
      db[model.name] = model;
    });
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
