const db = require("../config/db");

// 1. 전체 조회: menuLevel(깊이) 우선, 그 다음 ordNum(순서) 기준으로 정렬
exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM sysMenu ORDER BY menuLevel ASC, ordNum ASC",
  );
  return rows;
};

// 2. 등록: menuLevel 추가
exports.create = async (menuData) => {
  const {
    langu,
    menuId,
    menuLevel, // 추가
    ordNum,
    menuNm,
    parentMenuId,
    path,
    useYn,
    createdBy,
  } = menuData;
  const query = `
    INSERT INTO sysMenu (langu, menuId, menuLevel, ordNum, menuNm, parentMenuId, path, useYn, createdBy, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6))
  `;
  const values = [
    langu,
    menuId,
    menuLevel || 1, // 기본값 1 (대분류)
    ordNum || 1,
    menuNm,
    parentMenuId || null,
    path || null,
    useYn ?? 1,
    createdBy || null,
  ];
  const [result] = await db.query(query, values);
  return result;
};

// 3. 수정: menuLevel 추가
exports.update = async (id, menuData) => {
  const {
    langu,
    menuLevel,
    ordNum,
    menuNm,
    parentMenuId,
    path,
    useYn,
    changedBy,
  } = menuData;
  const query = `
    UPDATE sysMenu
    SET langu = ?, menuLevel = ?, ordNum = ?, menuNm = ?, parentMenuId = ?, path = ?, useYn = ?, changedBy = ?, changedAt = NOW(6)
    WHERE id = ?
  `;
  const values = [
    langu,
    menuLevel || 1,
    ordNum || 1,
    menuNm,
    parentMenuId || null,
    path || null,
    useYn ?? 1,
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
