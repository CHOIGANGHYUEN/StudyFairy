import { ref } from "vue";
import { executeTableScript } from "@/service/tableService";
import { getTableHistories } from "@/service/tableHistoryService";
import { useToast } from "@/composables/useToast";

export function useTableSql(currentTable, selectedDbms) {
  const showSqlModal = ref(false);
  const generatedDDL = ref("");
  const toast = useToast();

  const openSqlModal = () => {
    showSqlModal.value = true;
  };

  const generateSqlFromModal = async (type) => {
    if (!currentTable.value) return;

    let ddl = "";
    const tb = currentTable.value;

    if (selectedDbms.value === "MySQL") {
      if (type === "DROP_TABLE") {
        ddl = `DROP TABLE IF EXISTS ${tb.tablen};\n`;
      } else if (type === "CREATE_TABLE") {
        ddl = `-- === 테이블 생성 ===\n`;
        ddl += `CREATE TABLE ${tb.tablen} (\n`;
        let primaryKeys = [];

        tb.field.forEach((f, idx) => {
          let line = `  ${f.fieldn} ${f.fieldType}`;
          if (
            ["DECIMAL", "NUMERIC", "FLOAT", "DOUBLE"].includes(f.fieldType) &&
            f.fieldLength
          ) {
            line += `(${f.fieldLength}${f.fieldPoint ? "," + f.fieldPoint : ""})`;
          } else if (
            ["VARCHAR", "CHAR", "INT", "BIGINT"].includes(f.fieldType) &&
            f.fieldLength
          ) {
            line += `(${f.fieldLength})`;
          }
          line += f.isNull ? " NULL" : " NOT NULL";
          if (f.isAutoIncrement) line += " AUTO_INCREMENT";
          if (f.isUnique) line += " UNIQUE";
          if (f.fieldx && f.fieldx[0] && f.fieldx[0].fieldNm) {
            line += ` COMMENT '${f.fieldx[0].fieldNm}'`;
          }
          if (f.fieldKey === "PRI") primaryKeys.push(f.fieldn);
          ddl +=
            line +
            (idx < tb.field.length - 1 || primaryKeys.length > 0
              ? ",\n"
              : "\n");
        });

        if (primaryKeys.length > 0) {
          ddl += `  PRIMARY KEY (${primaryKeys.join(", ")})\n`;
        }
        ddl += `);\n`;

        if (tb.tablex && tb.tablex[0] && tb.tablex[0].tableNm) {
          ddl += `ALTER TABLE ${tb.tablen} COMMENT = '${tb.tablex[0].tableNm}';\n`;
        }
        ddl += "\n";

        // 인덱스 생성
        if (tb.tableindex && tb.tableindex.length > 0) {
          ddl += `-- === 인덱스 생성 ===\n`;
          tb.tableindex.forEach((idx) => {
            const uniqueStr = idx.isUnique ? "UNIQUE " : "";
            const indexFields = idx.indexfield || idx.fields || [];
            const fieldsStr = indexFields
              .sort((a, b) => (a.fieldOrder || 0) - (b.fieldOrder || 0))
              .map((f) => `\`${f.fieldn}\``)
              .filter((f) => f)
              .join(", ");
            if (fieldsStr) {
              ddl += `CREATE ${uniqueStr}INDEX \`${idx.indexn}\` ON \`${tb.tablen}\` (${fieldsStr});\n`;
            }
          });
        }
      } else if (type === "ALTER_TABLE" || type === "ALTER_INDEX") {
        let histories = [];
        try {
          const res = await getTableHistories({
            exactTablen: tb.tablen,
            isApplied: false,
            size: 999,
          });
          histories = res.rows || res.data?.rows || res.data || res || [];
          if (!Array.isArray(histories) && Array.isArray(histories.data))
            histories = histories.data;
          if (!Array.isArray(histories)) histories = [];
        } catch (e) {
          console.error("이력 조회 실패", e);
        }

        if (type === "ALTER_TABLE") {
          ddl = "-- === 테이블 수정 ===\n";
          const fieldHistories = histories.filter(
            (h) => h.targetType === "FIELD",
          );
          const latestChanges = {};
          for (const h of fieldHistories) {
            if (
              !latestChanges[h.targetName] ||
              new Date(h.changedAt || h.createdAt) >
                new Date(
                  latestChanges[h.targetName].changedAt ||
                    latestChanges[h.targetName].createdAt,
                )
            ) {
              latestChanges[h.targetName] = h;
            }
          }

          let hasAlter = false;
          for (const [fieldn, h] of Object.entries(latestChanges)) {
            if (h.actionType === "DELETE") {
              ddl += `ALTER TABLE ${tb.tablen} DROP COLUMN ${fieldn};\n`;
              hasAlter = true;
            } else if (h.actionType === "INSERT" || h.actionType === "UPDATE") {
              try {
                const f = JSON.parse(h.afterValue);
                let colDef = `${f.fieldType}`;
                if (
                  ["DECIMAL", "NUMERIC", "FLOAT", "DOUBLE"].includes(
                    f.fieldType,
                  ) &&
                  f.fieldLength
                ) {
                  colDef += `(${f.fieldLength}${f.fieldPoint ? "," + f.fieldPoint : ""})`;
                } else if (
                  ["VARCHAR", "CHAR", "INT", "BIGINT"].includes(f.fieldType) &&
                  f.fieldLength
                ) {
                  colDef += `(${f.fieldLength})`;
                }
                colDef += f.isNull ? " NULL" : " NOT NULL";
                if (f.isAutoIncrement) colDef += " AUTO_INCREMENT";
                if (f.fieldx && f.fieldx[0] && f.fieldx[0].fieldNm)
                  colDef += ` COMMENT '${f.fieldx[0].fieldNm}'`;

                if (h.actionType === "INSERT") {
                  ddl += `ALTER TABLE ${tb.tablen} ADD COLUMN ${fieldn} ${colDef};\n`;
                } else {
                  ddl += `ALTER TABLE ${tb.tablen} MODIFY COLUMN ${fieldn} ${colDef};\n`;
                }
                hasAlter = true;
              } catch (e) {}
            }
          }
          if (!hasAlter)
            ddl += "-- 실행되지 않은 최근 수정/삭제 기록이 없습니다.\n";
        } else if (type === "ALTER_INDEX") {
          ddl = "-- === 인덱스 변경 ===\n";
          const idxHistories = histories.filter(
            (h) => h.targetType === "INDEX" || h.targetType === "INDEX_FIELD",
          );
          const changedIndexNames = new Set();

          idxHistories.forEach((h) => {
            changedIndexNames.add(
              h.targetType === "INDEX_FIELD"
                ? h.targetName.split(".")[0]
                : h.targetName,
            );
          });

          let hasAlter = false;
          changedIndexNames.forEach((indexn) => {
            const currentIdx = (tb.tableindex || []).find(
              (i) => i.indexn === indexn,
            );
            ddl += `DROP INDEX \`${indexn}\` ON \`${tb.tablen}\`;\n`;
            hasAlter = true;
            if (currentIdx) {
              const uniqueStr = currentIdx.isUnique ? "UNIQUE " : "";
              const fieldsStr = (currentIdx.indexfield || [])
                .sort((a, b) => (a.fieldOrder || 0) - (b.fieldOrder || 0))
                .map((f) => `\`${f.fieldn}\``)
                .join(", ");
              if (fieldsStr)
                ddl += `CREATE ${uniqueStr}INDEX \`${indexn}\` ON \`${tb.tablen}\` (${fieldsStr});\n`;
            }
          });
          if (!hasAlter)
            ddl += "-- 실행되지 않은 최근 인덱스 변경 기록이 없습니다.\n";
        }
      }
    } else {
      ddl = `-- ${selectedDbms.value} 문법 지원 예정입니다.\n`;
    }
    generatedDDL.value = ddl;
  };

  const executeScript = async (scriptType) => {
    if (!generatedDDL.value) return;
    if (
      !confirm(
        "정말 이 스크립트를 DB에 실행하시겠습니까?\n주의: 실제 DB의 테이블이나 구조가 변경됩니다.",
      )
    )
      return;
    try {
      await executeTableScript({
        tablen: currentTable.value.tablen,
        script: generatedDDL.value,
        scriptType: scriptType,
      });
      toast.success("스크립트가 성공적으로 실행되어 DB에 반영되었습니다.");
    } catch (error) {
      toast.error(
        "스크립트 실행 중 오류가 발생했습니다.\n" +
          (error.response?.data?.message || error.message),
      );
    }
  };

  return {
    showSqlModal,
    generatedDDL,
    openSqlModal,
    generateSqlFromModal,
    executeScript,
  };
}
