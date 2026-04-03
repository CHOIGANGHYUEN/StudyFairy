const { TableHistory } = require("../../index");

exports.recordSaveHistory = async (oldTableJson, tableData, userId, t) => {
  const { tablen, module, fields, indexes } = tableData;

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
  if (oldTableJson.module !== module) {
    await TableHistory.create(
      {
        targetType: "TABLE",
        tablen,
        targetName: null,
        actionType: "UPDATE",
        targetColumn: "module",
        beforeValue: JSON.stringify({ module: oldTableJson.module }),
        afterValue: JSON.stringify({ module }),
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
    (oldTableJson.fields || []).map((f) => [f.fieldn, f]),
  );
  const newFieldsMap = new Map((fields || []).map((f) => [f.fieldn, f]));

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
    (oldTableJson.indexes || []).map((idx) => [idx.indexn, idx]),
  );
  const newIdxMap = new Map((indexes || []).map((idx) => [idx.indexn, idx]));

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
      if (String(oldIdx.isUnique || 0) !== String(newIdx.isUnique ? 1 : 0)) {
        await TableHistory.create(
          {
            targetType: "INDEX",
            tablen,
            targetName: indexn,
            actionType: "UPDATE",
            targetColumn: "isUnique",
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
