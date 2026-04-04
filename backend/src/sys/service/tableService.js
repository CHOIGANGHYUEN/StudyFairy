const {
  Table,
  Tablex,
  Field,
  Fieldx,
  TableIndex,
  TableIndexx,
  IndexField,
  IndexFieldx,
  TableHistory,
  sequelize,
  Sequelize,
} = require("../../index");
const tableSchemaHelper = require("../helper/tableSchemaHelper");
const tableHistoryHelper = require("../helper/tableHistoryHelper");

exports.getTables = async (langu = "KO") => {
  const tables = await Table.findAll({
    include: [
      {
        model: Tablex,
        as: "names",
        required: false,
        on: {
          tablen: Sequelize.col("Table.tablen"),
          langu: langu,
        },
      },
      {
        model: Field,
        as: "field",
        required: false,
        on: { tablen: Sequelize.col("Table.tablen") },
        include: [
          {
            model: Fieldx,
            as: "fieldx",
            required: false,
            on: {
              [Sequelize.Op.and]: [
                Sequelize.where(
                  Sequelize.col("field->fieldx.tablen"),
                  Sequelize.col("field.tablen"),
                ),
                Sequelize.where(
                  Sequelize.col("field->fieldx.fieldn"),
                  Sequelize.col("field.fieldn"),
                ),
                { langu: langu },
              ],
            },
          },
        ],
      },
      {
        model: TableIndex,
        as: "tableindex",
        required: false,
        on: { tablen: Sequelize.col("Table.tablen") },
        include: [
          {
            model: TableIndexx,
            as: "tableindexx",
            required: false,
            on: {
              [Sequelize.Op.and]: [
                Sequelize.where(
                  Sequelize.col("tableindex->tableindexx.tablen"),
                  Sequelize.col("tableindex.tablen"),
                ),
                Sequelize.where(
                  Sequelize.col("tableindex->tableindexx.indexn"),
                  Sequelize.col("tableindex.indexn"),
                ),
                { langu: langu },
              ],
            },
          },
          // --- IndexField 조인 추가 ---
          {
            model: IndexField,
            as: "fields",
            required: false,
            on: {
              [Sequelize.Op.and]: [
                Sequelize.where(
                  Sequelize.col("tableindex->fields.tablen"),
                  Sequelize.col("tableindex.tablen"),
                ),
                Sequelize.where(
                  Sequelize.col("tableindex->fields.indexn"),
                  Sequelize.col("tableindex.indexn"),
                ),
              ],
            },
            include: [
              {
                model: Field,
                as: "field",
                required: false,
                on: {
                  [Sequelize.Op.and]: [
                    Sequelize.where(
                      Sequelize.col("tableindex->fields->field.tablen"),
                      Sequelize.col("tableindex->fields.tablen"),
                    ),
                    Sequelize.where(
                      Sequelize.col("tableindex->fields->field.fieldn"),
                      Sequelize.col("tableindex->fields.fieldn"),
                    ),
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
    order: [["id", "ASC"]],
  });
  // 테이블 변경 이력 유무 파악 (순수 최초 생성 이외의 수정 이력이 존재하는지 확인)
  const modifiedHistories = await TableHistory.findAll({
    attributes: ["tablen"],
    where: {
      isApplied: false,
      [Sequelize.Op.or]: [
        { actionType: { [Sequelize.Op.in]: ["UPDATE", "DELETE"] } },
        { actionType: "INSERT", targetType: { [Sequelize.Op.ne]: "TABLE" } },
      ],
    },
    group: ["tablen"],
    raw: true,
  });
  const modifiedSet = new Set(modifiedHistories.map((h) => h.tablen));

  return tables.map((t) => {
    const plainTable = t.get({ plain: true });
    return tableSchemaHelper.assignDbStatus(plainTable, modifiedSet);
  });
};

exports.getTableDetails = async (tablen, langu = "KO") => {
  return await Table.findOne({
    where: { tablen },
    order: [
      [{ model: Field, as: "field" }, "fieldOrder", "ASC"],
      [{ model: TableIndex, as: "tableindex" }, "id", "ASC"],
      [
        { model: TableIndex, as: "tableindex" },
        { model: IndexField, as: "fields" },
        "fieldOrder",
        "ASC",
      ],
    ],
    include: [
      {
        model: Tablex,
        as: "names",
        required: false,
        where: { langu: langu },
      },
      {
        model: Field,
        as: "field",
        required: false,
        include: [
          {
            model: Fieldx,
            as: "fieldx",
            required: false,
            on: {
              [Sequelize.Op.and]: [
                Sequelize.where(
                  Sequelize.col("field->fieldx.tablen"),
                  Sequelize.col("field.tablen"),
                ),
                Sequelize.where(
                  Sequelize.col("field->fieldx.fieldn"),
                  Sequelize.col("field.fieldn"),
                ),
                { langu: langu },
              ],
            },
          },
        ],
      },
      {
        model: TableIndex,
        as: "tableindex",
        required: false,
        include: [
          {
            model: IndexField,
            as: "fields",
            required: false,
            on: {
              [Sequelize.Op.and]: [
                Sequelize.where(
                  Sequelize.col("tableindex->fields.tablen"),
                  Sequelize.col("tableindex.tablen"),
                ),
                Sequelize.where(
                  Sequelize.col("tableindex->fields.indexn"),
                  Sequelize.col("tableindex.indexn"),
                ),
              ],
            },
            include: [
              {
                model: Field,
                as: "field",
                required: false,
                on: {
                  [Sequelize.Op.and]: [
                    Sequelize.where(
                      Sequelize.col("tableindex->fields->field.tablen"),
                      Sequelize.col("tableindex->fields.tablen"),
                    ),
                    Sequelize.where(
                      Sequelize.col("tableindex->fields->field.fieldn"),
                      Sequelize.col("tableindex->fields.fieldn"),
                    ),
                  ],
                },
              },
            ],
          },
          {
            model: TableIndexx,
            as: "tableindexx",
            required: false,
            on: {
              [Sequelize.Op.and]: [
                Sequelize.where(
                  Sequelize.col("tableindex->tableindexx.tablen"),
                  Sequelize.col("tableindex.tablen"),
                ),
                Sequelize.where(
                  Sequelize.col("tableindex->tableindexx.indexn"),
                  Sequelize.col("tableindex.indexn"),
                ),
                { langu: langu },
              ],
            },
          },
        ],
      },
    ],
  });
};

exports.saveTableSpec = async (tableData, userId) => {
  const { tablen, module, field, tableindex } = tableData;
  const tablex = tableData.names || tableData.tablex;

  // 변경 이력 추적을 위해 저장 전 기존 데이터를 조회합니다.
  const oldTable = await Table.findOne({
    where: { tablen },
    include: [
      { model: Tablex, as: "names" },
      { model: Field, as: "field", include: [{ model: Fieldx, as: "fieldx" }] },
      {
        model: TableIndex,
        as: "tableindex",
        include: [
          { model: IndexField, as: "fields" },
          { model: TableIndexx, as: "tableindexx" },
        ],
      },
    ],
  });
  const oldTableJson = oldTable ? oldTable.get({ plain: true }) : null;

  // 기존 로직(이력 기록 등)과의 호환성을 위해 names를 tablex로 매핑
  if (oldTableJson && oldTableJson.names) {
    oldTableJson.tablex = oldTableJson.names;
    delete oldTableJson.names;
  }

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
    if (tablex && tablex.length > 0) {
      for (const name of tablex) {
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
    if (field && field.length > 0) {
      for (const fItem of field) {
        await Field.upsert(
          {
            id: fItem.id,
            tablen,
            fieldn: fItem.fieldn,
            module,
            fieldOrder: fItem.fieldOrder,
            fieldType: fItem.fieldType,
            fieldLength: fItem.fieldLength,
            fieldPoint: fItem.fieldPoint,
            isNull: fItem.isNull,
            isAutoIncrement: fItem.isAutoIncrement,
            isUnique: fItem.isUnique,
            isNonUnique: fItem.isNonUnique,
            fieldKey: fItem.fieldKey,
            createdBy: userId,
            changedBy: userId,
          },
          { transaction: t },
        );

        if (fItem.fieldx && fItem.fieldx.length > 0) {
          for (const fname of fItem.fieldx) {
            await Fieldx.upsert(
              {
                langu: fname.langu,
                tablen,
                fieldn: fItem.fieldn,
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

    // 4. Indexes 및 IndexFields 처리
    if (tableindex && tableindex.length > 0) {
      for (const idx of tableindex) {
        await TableIndex.upsert(
          {
            tablen,
            indexn: idx.indexn,
            module,
            isUnique: idx.isUnique ? 1 : 0,
            createdBy: userId,
            changedBy: userId,
          },
          { transaction: t },
        );

        if (idx.tableindexx && idx.tableindexx.length > 0) {
          for (const iname of idx.tableindexx) {
            await TableIndexx.upsert(
              {
                langu: iname.langu,
                tablen,
                indexn: idx.indexn,
                module,
                indexNm: iname.indexNm,
                description: iname.description,
                createdBy: userId,
                changedBy: userId,
              },
              { transaction: t },
            );
          }
        }

        if (idx.fields && idx.fields.length > 0) {
          for (const ifield of idx.fields) {
            await IndexField.upsert(
              {
                tablen,
                indexn: idx.indexn,
                fieldn: ifield.fieldn,
                module,
                fieldOrder: ifield.fieldOrder,
                orderType: ifield.orderType || "ASC",
                createdBy: userId,
                changedBy: userId,
              },
              { transaction: t },
            );
          }
        }
      }
    }

    // 5. 누락된(화면에서 삭제된) 필드 및 인덱스 물리적 삭제 처리
    if (oldTableJson) {
      const newFieldNames = (field || []).map((f) => f.fieldn);
      const fieldsToDelete = (oldTableJson.field || []).filter(
        (f) => !newFieldNames.includes(f.fieldn),
      );
      for (const f of fieldsToDelete) {
        await Fieldx.destroy({
          where: { tablen, fieldn: f.fieldn },
          transaction: t,
        });
        await Field.destroy({
          where: { tablen, fieldn: f.fieldn },
          transaction: t,
        });
      }

      const newIndexNames = (tableindex || []).map((idx) => idx.indexn);
      const indexesToDelete = (oldTableJson.tableindex || []).filter(
        (idx) => !newIndexNames.includes(idx.indexn),
      );
      for (const idx of indexesToDelete) {
        if (IndexFieldx) {
          await IndexFieldx.destroy({
            where: { tablen, indexn: idx.indexn },
            transaction: t,
          });
        }
        await IndexField.destroy({
          where: { tablen, indexn: idx.indexn },
          transaction: t,
        });
        await TableIndexx.destroy({
          where: { tablen, indexn: idx.indexn },
          transaction: t,
        });
        await TableIndex.destroy({
          where: { tablen, indexn: idx.indexn },
          transaction: t,
        });
      }

      for (const idx of tableindex || []) {
        const oldIdx = (oldTableJson.tableindex || []).find(
          (i) => i.indexn === idx.indexn,
        );
        if (oldIdx) {
          const newIfNames = (idx.fields || []).map((f) => f.fieldn);
          const ifToDelete = (oldIdx.fields || []).filter(
            (f) => !newIfNames.includes(f.fieldn),
          );
          for (const f of ifToDelete) {
            if (IndexFieldx) {
              await IndexFieldx.destroy({
                where: { tablen, indexn: idx.indexn, fieldn: f.fieldn },
                transaction: t,
              });
            }
            await IndexField.destroy({
              where: { tablen, indexn: idx.indexn, fieldn: f.fieldn },
              transaction: t,
            });
          }
        }
      }
    }

    // 6. 이력(TableHistory) 기록
    await tableHistoryHelper.recordSaveHistory(
      oldTableJson,
      tableData,
      userId,
      t,
    );

    await t.commit();
    return tableInst;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

exports.deleteTableSpec = async (tablen, userId = "SYSTEM") => {
  const oldTable = await Table.findOne({
    where: { tablen },
    include: [
      { model: Tablex, as: "names" },
      { model: Field, as: "field", include: [{ model: Fieldx, as: "fieldx" }] },
      {
        model: TableIndex,
        as: "tableindex",
        include: [
          { model: IndexField, as: "fields" },
          { model: TableIndexx, as: "tableindexx" },
        ],
      },
    ],
  });
  const oldTableJson = oldTable ? oldTable.get({ plain: true }) : null;

  // 기존 로직(이력 기록 등)과의 호환성을 위해 names를 tablex로 매핑
  if (oldTableJson && oldTableJson.names) {
    oldTableJson.tablex = oldTableJson.names;
    delete oldTableJson.names;
  }

  const t = await sequelize.transaction();
  try {
    // 연관된 모든 데이터 삭제
    await Fieldx.destroy({ where: { tablen }, transaction: t });
    await Field.destroy({ where: { tablen }, transaction: t });
    if (IndexFieldx) {
      await IndexFieldx.destroy({ where: { tablen }, transaction: t });
    }
    await IndexField.destroy({ where: { tablen }, transaction: t });
    await TableIndexx.destroy({ where: { tablen }, transaction: t });
    await TableIndex.destroy({ where: { tablen }, transaction: t });
    await Tablex.destroy({ where: { tablen }, transaction: t });
    const result = await Table.destroy({ where: { tablen }, transaction: t });

    await tableHistoryHelper.recordDeleteHistory(
      oldTableJson,
      tablen,
      userId,
      t,
    );

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

exports.executeScript = async (tablen, script, scriptType) => {
  // 여러 세미콜론(;)으로 분리된 다중 쿼리 실행을 위한 로직
  const queries = script
    .split(";")
    .map((q) => q.trim())
    .filter((q) => q.length > 0);
  const t = await sequelize.transaction();

  try {
    for (const q of queries) {
      // 주석만 있는 쿼리 제외
      if (q.startsWith("--") && !q.includes("\n")) continue;
      // DDL 실행
      try {
        await sequelize.query(q, { transaction: t });
      } catch (err) {
        // DROP INDEX 또는 DROP PRIMARY KEY 시 존재하지 않아 발생하는 에러(1091)는 무시하고 계속 진행
        if (err.original && err.original.errno === 1091) {
          console.log(`무시됨(1091 - 존재하지 않는 키/인덱스 삭제 시도): ${q}`);
          continue;
        }
        throw err;
      }
    }

    if (tablen) {
      let targetTypeQuery = "";
      if (scriptType === "ALTER_TABLE") {
        targetTypeQuery = " AND targetType IN ('TABLE', 'FIELD')";
      } else if (scriptType === "ALTER_INDEX") {
        targetTypeQuery = " AND targetType IN ('INDEX', 'INDEX_FIELD')";
      }

      try {
        await sequelize.query(
          `UPDATE sysTableHistory SET isApplied = 1 WHERE tablen = :tablen AND isApplied = 0${targetTypeQuery}`,
          {
            replacements: { tablen },
            transaction: t,
          },
        );
      } catch (err) {
        // 만약 isApplied 컬럼이 없다면 추가하고 재시도
        await sequelize.query(
          `ALTER TABLE sysTableHistory ADD COLUMN isApplied TINYINT(1) DEFAULT 0`,
          { transaction: t },
        );
        await sequelize.query(
          `UPDATE sysTableHistory SET isApplied = 1 WHERE tablen = :tablen AND isApplied = 0${targetTypeQuery}`,
          {
            replacements: { tablen },
            transaction: t,
          },
        );
      }
    }

    await t.commit();
    return { success: true };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
