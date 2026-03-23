const db = require("../config/db");

// --- Code Head (Group) Functions ---

exports.findAllHeads = async (categoryCode) => {
  const [rows] = await db.query(
    "SELECT * FROM sysCodeHead WHERE categoryCode = ? ORDER BY groupCode ASC",
    [categoryCode],
  );
  return rows;
};

exports.findHead = async (categoryCode, groupCode) => {
  const [rows] = await db.query(
    "SELECT * FROM sysCodeHead WHERE categoryCode = ? AND groupCode = ?",
    [categoryCode, groupCode],
  );
  return rows[0];
};

exports.createHead = async (headData) => {
  const {
    categoryCode,
    groupCode,
    description,
    useYn,
    createdBy,
    fieldNm1,
    fieldNm2,
    fieldNm3,
    fieldNm4,
    fieldNm5,
    fieldNm6,
    fieldNm7,
    fieldNm8,
    fieldNm9,
    fieldNm10,
  } = headData;

  const query = `
    INSERT INTO sysCodeHead (
      categoryCode, groupCode, description, useYn, createdBy, createdAt,
      fieldNm1, fieldNm2, fieldNm3, fieldNm4, fieldNm5,
      fieldNm6, fieldNm7, fieldNm8, fieldNm9, fieldNm10
    )
    VALUES (?, ?, ?, ?, ?, NOW(6), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    categoryCode,
    groupCode,
    description,
    useYn ?? 1,
    createdBy || "ADMIN",
    fieldNm1 || null,
    fieldNm2 || null,
    fieldNm3 || null,
    fieldNm4 || null,
    fieldNm5 || null,
    fieldNm6 || null,
    fieldNm7 || null,
    fieldNm8 || null,
    fieldNm9 || null,
    fieldNm10 || null,
  ];
  const [result] = await db.query(query, values);
  return result;
};

exports.updateHead = async (categoryCode, groupCode, headData) => {
  const {
    description,
    useYn,
    changedBy,
    fieldNm1,
    fieldNm2,
    fieldNm3,
    fieldNm4,
    fieldNm5,
    fieldNm6,
    fieldNm7,
    fieldNm8,
    fieldNm9,
    fieldNm10,
  } = headData;

  const query = `
    UPDATE sysCodeHead
    SET description = ?, useYn = ?, changedBy = ?, changedAt = NOW(6),
        fieldNm1 = ?, fieldNm2 = ?, fieldNm3 = ?, fieldNm4 = ?, fieldNm5 = ?,
        fieldNm6 = ?, fieldNm7 = ?, fieldNm8 = ?, fieldNm9 = ?, fieldNm10 = ?
    WHERE categoryCode = ? AND groupCode = ?
  `;
  const values = [
    description,
    useYn ?? 1,
    changedBy || "ADMIN",
    fieldNm1 || null,
    fieldNm2 || null,
    fieldNm3 || null,
    fieldNm4 || null,
    fieldNm5 || null,
    fieldNm6 || null,
    fieldNm7 || null,
    fieldNm8 || null,
    fieldNm9 || null,
    fieldNm10 || null,
    categoryCode,
    groupCode,
  ];
  const [result] = await db.query(query, values);
  return result;
};

exports.deleteHead = async (connection, categoryCode, groupCode) => {
  return await connection.query(
    "DELETE FROM sysCodeHead WHERE categoryCode = ? AND groupCode = ?",
    [categoryCode, groupCode],
  );
};

exports.deleteItemsByGroup = async (connection, categoryCode, groupCode) => {
  return await connection.query(
    "DELETE FROM sysCodeItem WHERE categoryCode = ? AND groupCode = ?",
    [categoryCode, groupCode],
  );
};

// --- Code Item (Detail) Functions ---

exports.findItemsByGroupCode = async (categoryCode, groupCode) => {
  const [rows] = await db.query(
    "SELECT * FROM sysCodeItem WHERE categoryCode = ? AND groupCode = ? ORDER BY subCode ASC",
    [categoryCode, groupCode],
  );
  return rows;
};

exports.createItem = async (itemData) => {
  const {
    categoryCode,
    groupCode,
    subCode,
    description,
    useYn,
    createdBy,
    ...fields
  } = itemData;
  const query = `
    INSERT INTO sysCodeItem (
      categoryCode, groupCode, subCode, description, useYn, createdBy, createdAt, 
      field1, field2, field3, field4, field5, 
      field6, field7, field8, field9, field10
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW(6), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    categoryCode,
    groupCode,
    subCode,
    description,
    useYn ?? 1,
    createdBy || "ADMIN",
    fields.field1,
    fields.field2,
    fields.field3,
    fields.field4,
    fields.field5,
    fields.field6,
    fields.field7,
    fields.field8,
    fields.field9,
    fields.field10,
  ];
  const [result] = await db.query(query, values);
  return result;
};

exports.updateItem = async (categoryCode, groupCode, subCode, itemData) => {
  const { description, useYn, changedBy, ...fields } = itemData;
  const query = `
    UPDATE sysCodeItem
    SET description = ?, useYn = ?, changedBy = ?, changedAt = NOW(6),
        field1 = ?, field2 = ?, field3 = ?, field4 = ?, field5 = ?,
        field6 = ?, field7 = ?, field8 = ?, field9 = ?, field10 = ?
    WHERE categoryCode = ? AND groupCode = ? AND subCode = ?
  `;
  const values = [
    description,
    useYn ?? 1,
    changedBy || "ADMIN",
    fields.field1,
    fields.field2,
    fields.field3,
    fields.field4,
    fields.field5,
    fields.field6,
    fields.field7,
    fields.field8,
    fields.field9,
    fields.field10,
    categoryCode,
    groupCode,
    subCode,
  ];
  const [result] = await db.query(query, values);
  return result;
};

exports.deleteItem = async (categoryCode, groupCode, subCode) => {
  return await db.query(
    "DELETE FROM sysCodeItem WHERE categoryCode = ? AND groupCode = ? AND subCode = ?",
    [categoryCode, groupCode, subCode],
  );
};

exports.initializeCategories = async () => {
  // Check if categories already exist
  const [existing] = await db.query(
    "SELECT 1 FROM sysCodeItem WHERE categoryCode = 'SYS' AND groupCode = 'CAT001'  LIMIT 1",
  );

  if (existing.length > 0) {
    return { message: "Categories already initialized." };
  }

  const insertQuery = `
    INSERT INTO sysCodeItem (categoryCode, groupCode, subCode, description, useYn, createdBy, createdAt)
    VALUES
    ('SYS', 'CAT001', 'SYS', 'System Codes', 1, 'ADMIN', NOW(6)),
    ('SYS', 'CAT001', 'GEN', 'General Codes', 1, 'ADMIN', NOW(6));
  `;
  const [result] = await db.query(insertQuery);
  return result;
};
