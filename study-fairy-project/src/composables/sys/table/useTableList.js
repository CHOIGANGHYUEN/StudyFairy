import { ref, onMounted, watch } from "vue";
import { getTables } from "@/service/tableService";

export function useTableList() {
  const tables = ref([]);
  const searchLangu = ref("KO");
  const selectedDbms = ref("MySQL");

  const loadTables = async () => {
    try {
      const res = await getTables(searchLangu.value);
      const data = res.data?.data || res.data || res;
      if (Array.isArray(data)) {
        data.forEach((t) => {
          if (t.names) {
            t.tablex = t.names;
            delete t.names;
          }
        });
        tables.value = data;
      } else {
        tables.value = [];
      }
    } catch (error) {
      console.error("테이블 목록을 불러오지 못했습니다.", error);
      tables.value = [];
    }
  };

  // 언어가 변경되면 다시 로드
  watch(searchLangu, () => {
    loadTables();
  });

  onMounted(() => {
    loadTables();
  });

  return { tables, searchLangu, selectedDbms, loadTables };
}
