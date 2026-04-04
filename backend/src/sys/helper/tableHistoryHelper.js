const { TableHistory } = require("../../index");

exports.recordSaveHistory = async (oldTableJson, tableData, userId, t) => {
  const { tablen, module, field, tableindex } = tableData;

  if (!oldTableJson) {
    // 신규 테이블 생성 이력
    await TableHistory.create(
      {
        targetType: "TABLE",
        tablen,
        targetName: null,
        actionType: "INSERT",
        afterValue: JSON.stringify(tableData),
        afterCreatedAt: tableData.createdAt,
        afterChangedAt: tableData.changedAt,
        createdBy: userId,
        changedBy: userId,
      },
      { transaction: t },
    );
    return;
  }

  // 테이블 기본 정보 수정 이력
  const oldTableNm =
    oldTableJson.tablex && oldTableJson.tablex.length > 0
      ? oldTableJson.tablex[0].tableNm
      : "";
  const newTableNm =
    tableData.names && tableData.names.length > 0
      ? tableData.names[0].tableNm
      : "";
  const oldTableDesc =
    oldTableJson.tablex && oldTableJson.tablex.length > 0
      ? oldTableJson.tablex[0].description
      : "";
  const newTableDesc =
    tableData.names && tableData.names.length > 0
      ? tableData.names[0].description
      : "";

  const tableChanges = {};
  if (oldTableJson.module !== module)
    tableChanges.module = { before: oldTableJson.module, after: module };
  if (oldTableNm !== newTableNm)
    tableChanges.tableNm = { before: oldTableNm, after: newTableNm };
  if (oldTableDesc !== newTableDesc)
    tableChanges.description = { before: oldTableDesc, after: newTableDesc };

  if (Object.keys(tableChanges).length > 0) {
    await TableHistory.create(
      {
        targetType: "TABLE",
        tablen,
        targetName: null,
        actionType: "UPDATE",
        targetColumn: Object.keys(tableChanges).join(", "),
        beforeValue: JSON.stringify({
          module: oldTableJson.module,
          tableNm: oldTableNm,
          description: oldTableDesc,
        }),
        afterValue: JSON.stringify({
          module,
          tableNm: newTableNm,
          description: newTableDesc,
        }),
        beforeCreatedAt: oldTableJson.createdAt,
        beforeChangedAt: oldTableJson.changedAt,
        afterCreatedAt: tableData.createdAt,
        afterChangedAt: tableData.changedAt,
        createdBy: userId,
        changedBy: userId,
      },
      { transaction: t },
    );
  }

  // 필드(Field) 변경 이력 추적
  const oldFieldsMap = new Map(
    (oldTableJson.field || []).map((f) => [f.fieldn, f]),
  );
  const newFieldsMap = new Map((field || []).map((f) => [f.fieldn, f]));

  for (const [fieldn, oldField] of oldFieldsMap) {
    if (!newFieldsMap.has(fieldn)) {
      await TableHistory.create(
        {
          targetType: "FIELD",
          tablen,
          targetName: fieldn,
          actionType: "DELETE",
          beforeValue: JSON.stringify(oldField),
          beforeCreatedAt: oldField.createdAt,
          beforeChangedAt: oldField.changedAt,
          createdBy: userId,
          changedBy: userId,
        },
        { transaction: t },
      );
    }
  }
  for (const [fieldn, newField] of newFieldsMap) {
    const oldField = oldFieldsMap.get(fieldn);
    if (!oldField) {
      await TableHistory.create(
        {
          targetType: "FIELD",
          tablen,
          targetName: fieldn,
          actionType: "INSERT",
          afterValue: JSON.stringify(newField),
          afterCreatedAt: newField.createdAt,
          afterChangedAt: newField.changedAt,
          createdBy: userId,
          changedBy: userId,
        },
        { transaction: t },
      );
    } else {
      const keysToCompare = [
        "fieldType",
        "fieldLength",
        "fieldPoint",
        "isNull",
        "isAutoIncrement",
        "isUnique",
        "isNonUnique",
        "fieldKey",
        "fieldOrder",
      ];
      const changes = {};
      for (const k of keysToCompare) {
        if (String(oldField[k] || "") !== String(newField[k] || "")) {
          changes[k] = { before: oldField[k], after: newField[k] };
        }
      }

      const oldFieldNm =
        oldField.fieldx && oldField.fieldx.length > 0
          ? oldField.fieldx[0].fieldNm
          : "";
      const newFieldNm =
        newField.fieldx && newField.fieldx.length > 0
          ? newField.fieldx[0].fieldNm
          : "";
      const oldFieldDesc =
        oldField.fieldx && oldField.fieldx.length > 0
          ? oldField.fieldx[0].description
          : "";
      const newFieldDesc =
        newField.fieldx && newField.fieldx.length > 0
          ? newField.fieldx[0].description
          : "";

      if (oldFieldNm !== newFieldNm)
        changes.fieldNm = { before: oldFieldNm, after: newFieldNm };
      if (oldFieldDesc !== newFieldDesc)
        changes.description = { before: oldFieldDesc, after: newFieldDesc };

      if (Object.keys(changes).length > 0) {
        await TableHistory.create(
          {
            targetType: "FIELD",
            tablen,
            targetName: fieldn,
            actionType: "UPDATE",
            targetColumn: Object.keys(changes).join(", "),
            beforeValue: JSON.stringify(oldField),
            afterValue: JSON.stringify(newField),
            beforeCreatedAt: oldField.createdAt,
            beforeChangedAt: oldField.changedAt,
            afterCreatedAt: newField.createdAt,
            afterChangedAt: newField.changedAt,
            createdBy: userId,
            changedBy: userId,
          },
          { transaction: t },
        );
      }
    }
  }

  // 인덱스(Index) 변경 이력 추적
  const oldIdxMap = new Map(
    (oldTableJson.tableindex || []).map((idx) => [idx.indexn, idx]),
  );
  const newIdxMap = new Map((tableindex || []).map((idx) => [idx.indexn, idx]));

  for (const [indexn, oldIdx] of oldIdxMap) {
    if (!newIdxMap.has(indexn)) {
      await TableHistory.create(
        {
          targetType: "INDEX",
          tablen,
          targetName: indexn,
          actionType: "DELETE",
          beforeValue: JSON.stringify(oldIdx),
          beforeCreatedAt: oldIdx.createdAt,
          beforeChangedAt: oldIdx.changedAt,
          createdBy: userId,
          changedBy: userId,
        },
        { transaction: t },
      );
    }
  }
  for (const [indexn, newIdx] of newIdxMap) {
    const oldIdx = oldIdxMap.get(indexn);
    if (!oldIdx) {
      await TableHistory.create(
        {
          targetType: "INDEX",
          tablen,
          targetName: indexn,
          actionType: "INSERT",
          afterValue: JSON.stringify(newIdx),
          afterCreatedAt: newIdx.createdAt,
          afterChangedAt: newIdx.changedAt,
          createdBy: userId,
          changedBy: userId,
        },
        { transaction: t },
      );
    } else {
      const indexChanges = {};
      if (String(oldIdx.isUnique || 0) !== String(newIdx.isUnique ? 1 : 0)) {
        indexChanges.isUnique = {
          before: oldIdx.isUnique,
          after: newIdx.isUnique,
        };
      }

      const oldIndexNm =
        oldIdx.tableindexx && oldIdx.tableindexx.length > 0
          ? oldIdx.tableindexx[0].indexNm
          : "";
      const newIndexNm =
        newIdx.tableindexx && newIdx.tableindexx.length > 0
          ? newIdx.tableindexx[0].indexNm
          : "";
      if (oldIndexNm !== newIndexNm)
        indexChanges.indexNm = { before: oldIndexNm, after: newIndexNm };

      if (Object.keys(indexChanges).length > 0) {
        await TableHistory.create(
          {
            targetType: "INDEX",
            tablen,
            targetName: indexn,
            actionType: "UPDATE",
            targetColumn: Object.keys(indexChanges).join(", "),
            beforeValue: JSON.stringify(oldIdx),
            afterValue: JSON.stringify(newIdx),
            beforeCreatedAt: oldIdx.createdAt,
            beforeChangedAt: oldIdx.changedAt,
            afterCreatedAt: newIdx.createdAt,
            afterChangedAt: newIdx.changedAt,
            createdBy: userId,
            changedBy: userId,
          },
          { transaction: t },
        );
      }

      // 인덱스 필드(IndexField) 변경 이력 추적
      const oldIfMap = new Map((oldIdx.fields || []).map((f) => [f.fieldn, f]));
      const newIfMap = new Map((newIdx.fields || []).map((f) => [f.fieldn, f]));

      for (const [fieldn, oldIf] of oldIfMap) {
        if (!newIfMap.has(fieldn)) {
          await TableHistory.create(
            {
              targetType: "INDEX_FIELD",
              tablen,
              targetName: `${indexn}.${fieldn}`,
              actionType: "DELETE",
              beforeValue: JSON.stringify(oldIf),
              beforeCreatedAt: oldIf.createdAt,
              beforeChangedAt: oldIf.changedAt,
              createdBy: userId,
              changedBy: userId,
            },
            { transaction: t },
          );
        }
      }
      for (const [fieldn, newIf] of newIfMap) {
        const oldIf = oldIfMap.get(fieldn);
        if (!oldIf) {
          await TableHistory.create(
            {
              targetType: "INDEX_FIELD",
              tablen,
              targetName: `${indexn}.${fieldn}`,
              actionType: "INSERT",
              afterValue: JSON.stringify(newIf),
              afterCreatedAt: newIf.createdAt,
              afterChangedAt: newIf.changedAt,
              createdBy: userId,
              changedBy: userId,
            },
            { transaction: t },
          );
        } else if (
          String(oldIf.orderType || "ASC") !==
            String(newIf.orderType || "ASC") ||
          String(oldIf.fieldOrder) !== String(newIf.fieldOrder)
        ) {
          await TableHistory.create(
            {
              targetType: "INDEX_FIELD",
              tablen,
              targetName: `${indexn}.${fieldn}`,
              actionType: "UPDATE",
              targetColumn: "orderType, fieldOrder",
              beforeValue: JSON.stringify(oldIf),
              afterValue: JSON.stringify(newIf),
              beforeCreatedAt: oldIf.createdAt,
              beforeChangedAt: oldIf.changedAt,
              afterCreatedAt: newIf.createdAt,
              afterChangedAt: newIf.changedAt,
              createdBy: userId,
              changedBy: userId,
            },
            { transaction: t },
          );
        }
      }
    }
  }
};

exports.recordDeleteHistory = async (oldTableJson, tablen, userId, t) => {
  if (oldTableJson) {
    await TableHistory.create(
      {
        targetType: "TABLE",
        tablen,
        targetName: null,
        actionType: "DELETE",
        beforeValue: JSON.stringify(oldTableJson),
        beforeCreatedAt: oldTableJson.createdAt,
        beforeChangedAt: oldTableJson.changedAt,
        createdBy: userId,
        changedBy: userId,
      },
      { transaction: t },
    );
  }
};
