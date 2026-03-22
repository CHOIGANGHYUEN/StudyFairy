const db = require("../config/db");

exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM sysMenu ORDER BY parentMenuId ASC, id ASC",
  );
  return rows;
};

exports.create = async (menuData) => {
  const { langu, menuId, menuNm, parentMenuId, path, createdBy } = menuData;
  const query = `
    INSERT INTO sysMenu (langu, menuId, menuNm, parentMenuId, path, createdBy, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  const values = [
    langu,
    menuId,
    menuNm,
    parentMenuId || null,
    path || null,
    createdBy || null,
  ];
  const [result] = await db.query(query, values);
  return result;
};

exports.update = async (id, menuData) => {
  const { langu, menuNm, parentMenuId, path, changedBy } = menuData;
  const query = `
    UPDATE sysMenu
    SET langu = ?, menuNm = ?, parentMenuId = ?, path = ?, changedBy = ?, changedAt = NOW()
    WHERE id = ?
  `;
  const values = [
    langu,
    menuNm,
    parentMenuId || null,
    path || null,
    changedBy || null,
    id,
  ];
  const [result] = await db.query(query, values);
  return result;
};

exports.delete = async (id) => {
  return await db.query("DELETE FROM sysMenu WHERE id = ?", [id]);
};

exports.findById = async (id) => {
  const [rows] = await db.query("SELECT * FROM sysMenu WHERE id = ?", [id]);
  return rows[0];
};

exports.countByParentId = async (parentId) => {
  const [rows] = await db.query(
    "SELECT COUNT(*) as count FROM sysMenu WHERE parentMenuId = ?",
    [parentId],
  );
  return rows[0].count;
};
