const { Table, Tablex, Field, Fieldx, sequelize } = require("../../index");

exports.getTables = async () => {
  return await Table.findAll({
    include: [
      { model: Tablex, as: "names" },
      {
        model: Field,
        as: "fields",
        include: [{ model: Fieldx, as: "names" }],
      },
    ],
    order: [
      ["module", "ASC"],
      ["tablen", "ASC"],
    ],
  });
};

exports.saveTableSpec = async (tableData, userId) => {
  const { tablen, module, names, fields } = tableData;
  const t = await sequelize.transaction();

  try {
    // 1. Table 갱신 또는 생성
    const [tableInst, created] = await Table.upsert(
      {
        id: tableData.id,
        tablen,
        module,
        createdBy: userId,
        changedBy: userId,
      },
      { transaction: t },
    );

    // 2. Table 다국어 명칭
    if (names && names.length > 0) {
      for (const name of names) {
        await Tablex.upsert(
          {
            langu: name.langu,
            tablen,
            module,
            tableNm: name.tableNm,
            description: name.description,
            createdBy: userId,
            changedBy: userId,
          },
          { transaction: t },
        );
      }
    }

    // 3. Fields 처리 (기존 항목 중 삭제된 것 처리 로직 필요 시 추가)
    if (fields && fields.length > 0) {
      for (const field of fields) {
        await Field.upsert(
          {
            id: field.id,
            tablen,
            fieldn: field.fieldn,
            module,
            fieldOrder: field.fieldOrder,
            fieldType: field.fieldType,
            fieldLength: field.fieldLength,
            isNull: field.isNull,
            isAutoIncrement: field.isAutoIncrement,
            fieldKey: field.fieldKey,
            createdBy: userId,
            changedBy: userId,
          },
          { transaction: t },
        );

        if (field.names && field.names.length > 0) {
          for (const fname of field.names) {
            await Fieldx.upsert(
              {
                langu: fname.langu,
                tablen,
                fieldn: field.fieldn,
                module,
                fieldNm: fname.fieldNm,
                description: fname.description,
                createdBy: userId,
                changedBy: userId,
              },
              { transaction: t },
            );
          }
        }
      }
    }
    await t.commit();
    return tableInst;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
