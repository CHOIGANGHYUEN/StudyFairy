import { ref, onMounted, computed, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getTableById,
  saveTable,
  deleteTable,
  executeSql,
} from "../../systService";
import { useToast } from "@/composables/useToast";

export function useSyst004v002() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const isCreateMode = computed(() => route.params.id === "create");
  const isSubmitting = ref(false);

  const dbms = computed(() => route.query.dbms || "MySQL");
  const langu = computed(() => route.query.langu || "KO");

  const activeTab = ref("fields");

  const currentTable = ref({
    tablen: "New_Table",
    module: "",
    tablex: [{ langu: langu.value, tableNm: "", description: "" }],
    field: [],
    tableindex: [],
  });

  const fetchData = async () => {
    if (isCreateMode.value) return;
    try {
      const res = await getTableById(route.params.id, dbms.value, langu.value);
      currentTable.value = res.data?.data || res.data;
    } catch (error) {
      toast.error("테이블 명세를 불러오는데 실패했습니다.");
      handleClose();
    }
  };

  watchEffect(() => {
    if (!currentTable.value.tablex || currentTable.value.tablex.length === 0) {
      currentTable.value.tablex = [
        { langu: langu.value, tableNm: "", description: "" },
      ];
    }
    if (!currentTable.value.field) currentTable.value.field = [];
    if (!currentTable.value.tableindex) currentTable.value.tableindex = [];
  });

  const handleSave = async () => {
    if (!currentTable.value.tablen) {
      toast.warning("테이블 ID를 입력하세요.");
      return;
    }
    isSubmitting.value = true;
    try {
      await saveTable(currentTable.value);
      toast.success("명세가 정상적으로 저장되었습니다.");
      handleClose();
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleDelete = async () => {
    if (
      !confirm("명세를 삭제하시겠습니까? (실제 DB 테이블은 삭제되지 않습니다)")
    )
      return;
    try {
      await deleteTable(currentTable.value.tablen);
      toast.success("삭제되었습니다.");
      handleClose();
    } catch (error) {
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleClose = () => router.push("/sys/syst004");

  // --- 필드/인덱스 관리 로직 ---
  const addField = () =>
    currentTable.value.field.push({
      fieldOrder: currentTable.value.field.length + 1,
      fieldn: "new_field",
      fieldType: "VARCHAR",
      fieldLength: 45,
      fieldPoint: null,
      fieldKey: "",
      isNull: 0,
      isUnique: 0,
      isNonUnique: 0,
      isAutoIncrement: 0,
      fieldx: [{ langu: langu.value, fieldNm: "", description: "" }],
    });
  const removeField = (index) => currentTable.value.field.splice(index, 1);

  const addIndex = () =>
    currentTable.value.tableindex.push({
      indexn: `idx_new_${currentTable.value.tableindex.length + 1}`,
      isUnique: 0,
      tableindexx: [{ langu: langu.value, indexNm: "", description: "" }],
      indexfield: [],
    });
  const removeIndex = (index) => currentTable.value.tableindex.splice(index, 1);

  const addIndexField = (idx) => {
    if (!idx.indexfield) idx.indexfield = [];
    idx.indexfield.push({
      fieldn: "",
      fieldOrder: idx.indexfield.length + 1,
      orderType: "ASC",
    });
  };
  const removeIndexField = (idx, fieldIndex) =>
    idx.indexfield.splice(fieldIndex, 1);

  // --- 드래그 앤 드롭 로직 ---
  const draggedIndex = ref(null);
  const onDragStart = (e, idx) => {
    draggedIndex.value = idx;
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
  };
  const onDragEnd = (e) => {
    e.target.classList.remove("dragging");
    draggedIndex.value = null;
  };
  const onDrop = (e, targetIdx) => {
    const from = draggedIndex.value;
    if (from === null || from === targetIdx) return;
    const [moved] = currentTable.value.field.splice(from, 1);
    currentTable.value.field.splice(targetIdx, 0, moved);
    currentTable.value.field.forEach((f, i) => (f.fieldOrder = i + 1));
  };

  const draggedIdxIndex = ref(null);
  const draggedIdxFieldIndex = ref(null);
  const onIdxFieldDragStart = (e, iIdx, fIdx) => {
    draggedIdxIndex.value = iIdx;
    draggedIdxFieldIndex.value = fIdx;
    e.target.classList.add("dragging");
  };
  const onIdxFieldDrop = (e, tIdx, tfIdx) => {
    if (draggedIdxIndex.value !== tIdx) return;
    const from = draggedIdxFieldIndex.value;
    if (from === null || from === tfIdx) return;
    const fields = currentTable.value.tableindex[tIdx].indexfield;
    const [moved] = fields.splice(from, 1);
    fields.splice(tfIdx, 0, moved);
    fields.forEach((f, i) => (f.fieldOrder = i + 1));
  };

  // --- 엑셀 붙여넣기 로직 ---
  const handlePaste = (e) => {
    const pasteData = (e.clipboardData || window.clipboardData).getData("text");
    if (!pasteData || (!pasteData.includes("\t") && !pasteData.includes("\n")))
      return;
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    if (
      (activeTag === "input" || activeTag === "select") &&
      !pasteData.includes("\n")
    )
      return;
    e.preventDefault();
    const rows = pasteData.split(/\r\n|\n|\r/).filter((r) => r.trim() !== "");
    const startIndex = currentTable.value.field.length;
    rows.forEach((row, idx) => {
      const cols = row.split("\t");
      if (cols.length >= 1) {
        currentTable.value.field.push({
          fieldOrder: startIndex + idx + 1,
          fieldn: cols[0]?.trim() || "new_field",
          fieldType: cols[2]?.trim().toUpperCase() || "VARCHAR",
          fieldLength:
            cols[3] && !isNaN(parseInt(cols[3]))
              ? parseInt(cols[3].trim())
              : null,
          fieldPoint:
            cols[4] && !isNaN(parseInt(cols[4]))
              ? parseInt(cols[4].trim())
              : null,
          fieldKey:
            cols[5]?.trim().toUpperCase() === "PK" ||
            cols[5]?.trim().toUpperCase() === "PRI"
              ? "PRI"
              : "",
          isAutoIncrement:
            cols[6]?.trim() === "1" || cols[6]?.trim().toUpperCase() === "Y"
              ? 1
              : 0,
          isNull:
            cols[7]?.trim() === "1" || cols[7]?.trim().toUpperCase() === "Y"
              ? 1
              : 0,
          isUnique:
            cols[8]?.trim() === "1" || cols[8]?.trim().toUpperCase() === "Y"
              ? 1
              : 0,
          isNonUnique: 0,
          fieldx: [
            {
              langu: langu.value,
              fieldNm: cols[1]?.trim() || "",
              description: "",
            },
          ],
        });
      }
    });
  };

  // --- SQL 모달 로직 ---
  const showSqlModal = ref(false);
  const sqlSelection = ref("CREATE_TABLE");
  const generatedDDL = ref("");

  const openSqlModal = () => {
    showSqlModal.value = true;
    generateSqlFromModal(sqlSelection.value);
  };
  const generateSqlFromModal = (type) => {
    // 데모용 DDL 생성 로직 (실제 백엔드 호출을 연결할 수 있습니다)
    generatedDDL.value = `-- [${dbms.value}] ${type} 스크립트 생성 예시\n-- API 연동 시 실제 DDL이 노출됩니다.\n\n`;
    if (type === "CREATE_TABLE")
      generatedDDL.value += `CREATE TABLE ${currentTable.value.tablen} (\n  -- 컬럼 명세\n);`;
  };
  watch(sqlSelection, (val) => generateSqlFromModal(val));

  const handleExecuteScript = async () => {
    if (!generatedDDL.value) return;
    try {
      await executeSql({ dbms: dbms.value, sql: generatedDDL.value });
      toast.success("SQL이 성공적으로 실행되었습니다.");
      showSqlModal.value = false;
    } catch (e) {
      toast.error("SQL 실행 중 오류가 발생했습니다.");
    }
  };
  const copyToClipboard = async () => {
    if (!generatedDDL.value) return;
    await navigator.clipboard.writeText(generatedDDL.value);
    toast.success("복사되었습니다.");
  };

  onMounted(fetchData);

  return {
    isCreateMode,
    isSubmitting,
    currentTable,
    activeTab,
    showSqlModal,
    sqlSelection,
    generatedDDL,
    openSqlModal,
    handleExecuteScript,
    copyToClipboard,
    handleSave,
    handleDelete,
    handleClose,
    addField,
    removeField,
    addIndex,
    removeIndex,
    addIndexField,
    removeIndexField,
    handlePaste,
    onDragStart,
    onDragEnd,
    onDrop,
    onIdxFieldDragStart,
    onIdxFieldDrop,
  };
}
