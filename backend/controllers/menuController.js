const db = require("../config/db");

// 1. 메뉴 목록 조회 (트리 구조 생성)
exports.getMenus = async (req, res) => {
  try {
    // DB에서 모든 메뉴 데이터를 가져옵니다.
    const [rows] = await db.query(
      "SELECT * FROM sysMenu ORDER BY parentMenuId ASC, id ASC",
    );

    // [중요] 변수 선언 누락 해결
    const menuMap = {};
    const tree = [];

    // 1단계: 모든 메뉴를 Map에 등록 (상위 메뉴를 찾기 위한 인덱스 생성)
    rows.forEach((row) => {
      // row 데이터를 복사하고 children 배열을 추가하여 Map에 저장
      menuMap[row.menuId] = { ...row, children: [] };
    });

    // 2단계: parentMenuId를 확인하여 트리 구조 생성
    rows.forEach((row) => {
      const currentMenu = menuMap[row.menuId];
      const parentId = row.parentMenuId;

      if (parentId && menuMap[parentId]) {
        // 부모 ID가 있고, 그 부모가 Map에 존재하면 부모의 children에 추가
        menuMap[parentId].children.push(currentMenu);
      } else {
        // 부모가 없으면 최상위 메뉴이므로 tree 배열에 직접 추가
        tree.push(currentMenu);
      }
    });

    // 최종적으로 생성된 트리 구조 반환
    res.status(200).json(tree);
  } catch (err) {
    console.error("메뉴 조회 에러:", err);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

// 2. 메뉴 등록 (Create)
exports.createMenu = async (req, res) => {
  try {
    const { langu, menuId, menuNm, parentMenuId, path, createdBy } = req.body;

    if (!langu || !menuId || !menuNm) {
      return res
        .status(400)
        .json({ message: "필수 입력 정보가 누락되었습니다." });
    }

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

    res
      .status(201)
      .json({ message: "등록되었습니다.", insertId: result.insertId });
  } catch (err) {
    console.error("메뉴 등록 에러:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "중복된 메뉴 ID입니다." });
    res.status(500).json({ message: "서버 에러" });
  }
};

// 3. 메뉴 수정 (Update)
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params; // PK id
    const { langu, menuNm, parentMenuId, path, changedBy } = req.body;

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

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "수정 대상을 찾을 수 없습니다." });
    res.status(200).json({ message: "수정되었습니다." });
  } catch (err) {
    console.error("메뉴 수정 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 4. 메뉴 삭제 (Delete)
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // 하위 메뉴 체크를 위해 menuId 조회
    const [target] = await db.query("SELECT menuId FROM sysMenu WHERE id = ?", [
      id,
    ]);
    if (target.length === 0)
      return res.status(404).json({ message: "대상을 찾을 수 없습니다." });

    const targetMenuId = target[0].menuId;

    // 하위 메뉴 존재 여부 확인
    const [childRows] = await db.query(
      "SELECT COUNT(*) as count FROM sysMenu WHERE parentMenuId = ?",
      [targetMenuId],
    );
    if (childRows[0].count > 0) {
      return res
        .status(400)
        .json({ message: "하위 메뉴가 있어 삭제할 수 없습니다." });
    }

    await db.query("DELETE FROM sysMenu WHERE id = ?", [id]);
    res.status(200).json({ message: "삭제되었습니다." });
  } catch (err) {
    console.error("메뉴 삭제 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};
