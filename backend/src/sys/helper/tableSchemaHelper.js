exports.assignDbStatus = (plainTable, modifiedSet) => {
  // 복합키(tablen, indexn 등) 조인 한계로 인한 타 테이블 데이터 혼입 방지 필터링
  if (plainTable.fields) {
    plainTable.fields.forEach((f) => {
      if (f.names)
        f.names = f.names.filter((n) => n.tablen === plainTable.tablen);
    });
  }
  if (plainTable.indexes) {
    plainTable.indexes.forEach((idx) => {
      if (idx.fields)
        idx.fields = idx.fields.filter((f) => f.tablen === plainTable.tablen);
      if (idx.names)
        idx.names = idx.names.filter((n) => n.tablen === plainTable.tablen);
    });
  }

  // sysTableHistory에 변경 이력이 존재하는지만 파악
  plainTable.isModified = modifiedSet.has(plainTable.tablen);

  return plainTable;
};
