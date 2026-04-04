import { ref } from "vue";
import {
  getTableDetails,
  saveTableSpec,
  deleteTableSpec as apiDeleteTableSpec,
} from "@/service/tableService";
import { useToast } from "../../useToast";

export function useTableDetail(searchLangu, onReload) {
  const currentTable = ref(null);
  const isEditorLoading = ref(false);
  const isSaving = ref(false);
  const toast = useToast();

  const ensureTranslations = (obj, defaultValues, key) => {
    if (!obj[key] || obj[key].length === 0) {
      obj[key] = [{ langu: searchLangu.value, ...defaultValues }];
    } else {
      obj[key][0] = {
        langu: searchLangu.value,
        ...defaultValues,
        ...obj[key][0],
      };
    }
  };

  const createNewTable = () => {
    if (
      currentTable.value &&
      currentTable.value.tablen !== "New_Table" &&
      !confirm("작성 중인 내용이 초기화됩니다. 새 테이블을 추가하시겠습니까?")
    ) {
      return;
    }

    currentTable.value = {
      tablen: "New_Table",
      module: "SYS",
      tablex: [{ langu: searchLangu.value, tableNm: "", description: "" }],
      field: [
        {
          fieldOrder: 1,
          fieldn: "id",
          fieldType: "BIGINT",
          fieldLength: null,
          fieldPoint: null,
          fieldKey: "PRI",
          isNull: 0,
          isUnique: 0,
          isNonUnique: 0,
          isAutoIncrement: 1,
          fieldx: [
            { langu: searchLangu.value, fieldNm: "ID", description: "" },
          ],
        },
        {
          fieldOrder: 2,
          fieldn: "createdBy",
          fieldType: "VARCHAR",
          fieldLength: 45,
          fieldPoint: null,
          fieldKey: "",
          isNull: 0,
          isUnique: 0,
          isNonUnique: 0,
          isAutoIncrement: 0,
          fieldx: [
            { langu: searchLangu.value, fieldNm: "생성자", description: "" },
          ],
        },
      ],
      tableindex: [],
    };
  };

  const selectTable = async (table) => {
    if (currentTable.value?.tablen === table.tablen) return;
    isEditorLoading.value = true;
    currentTable.value = null;
    try {
      const res = await getTableDetails(table.tablen, searchLangu.value);
      const detailedTable = res.data?.data || res.data || res;
      const copy = JSON.parse(JSON.stringify(detailedTable));

      if (copy.names) {
        copy.tablex = copy.names;
        delete copy.names;
      }
      ensureTranslations(copy, { tableNm: "", description: "" }, "tablex");
      if (copy.field) {
        copy.field.forEach((f) =>
          ensureTranslations(f, { fieldNm: "", description: "" }, "fieldx"),
        );
      }
      if (copy.tableindex) {
        copy.tableindex.forEach((idx) => {
          if (idx.fields) {
            idx.indexfield = idx.fields;
            delete idx.fields;
          }
          ensureTranslations(
            idx,
            { indexNm: "", description: "" },
            "tableindexx",
          );
        });
      }
      currentTable.value = copy;
    } catch (error) {
      console.error(
        `'${table.tablen}' 상세 정보를 불러오지 못했습니다.`,
        error,
      );
      toast.error("테이블 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      isEditorLoading.value = false;
    }
  };

  const saveSpec = async () => {
    isSaving.value = true;
    try {
      const payload = JSON.parse(JSON.stringify(currentTable.value));
      payload.field = payload.field.filter(
        (f) => f.dbAction !== "DROP" && !f.isPhysicalOnly,
      );
      if (payload.tableindex) {
        payload.tableindex.forEach((idx) => {
          if (idx.indexfield) {
            idx.fields = idx.indexfield;
            delete idx.indexfield;
          }
        });
      }
      if (payload.tablex) {
        payload.names = payload.tablex;
        delete payload.tablex;
      }
      await saveTableSpec(payload);
      toast.success("명세서가 성공적으로 저장되었습니다.");
      if (onReload) await onReload();
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      isSaving.value = false;
    }
  };

  const deleteSpec = async () => {
    // 생략(기존 코드 유지) - apiDeleteTableSpec 호출 및 처리...
  };

  return {
    currentTable,
    isEditorLoading,
    isSaving,
    createNewTable,
    selectTable,
    saveSpec,
    deleteSpec,
  };
}
