const db = require("../config/db");

exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT id, langu, languNm, createdBy, createdAt, changedBy, changedAt FROM sysLanguage",
  );
  return rows;
};

exports.create = async (languageData) => {
  const { langu, languNm, createdBy } = languageData;
  const query = `
    INSERT INTO sysLanguage (langu, languNm, createdBy, createdAt) 
    VALUES (?, ?, ?, NOW(6))
  `;
  const [result] = await db.query(query, [langu, languNm, createdBy]);
  return result;
};

exports.update = async (id, languageData) => {
  const { languNm, changedBy } = languageData;
  const query = `
    UPDATE sysLanguage 
    SET languNm = ?, changedBy = ?, changedAt = NOW(6)
    WHERE id = ?
  `;
  const [result] = await db.query(query, [languNm, changedBy, id]);
  return result;
};

exports.delete = async (id) => {
  const query = "DELETE FROM sysLanguage WHERE id = ?";
  const [result] = await db.query(query, [id]);
  return result;
};
