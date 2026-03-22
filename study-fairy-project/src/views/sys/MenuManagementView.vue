<template>
  <div class="admin-container">
    <header class="page-header">
      <h1 class="page-title">
        <div class="icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </div>
        메뉴 관리
      </h1>
      <p class="page-subtitle">
        시스템 메뉴 및 다국어 정보를 등록하고 관리합니다.
      </p>
    </header>

    <!-- 메뉴 등록/수정 폼 섹션 -->
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title">
          {{ isEditMode ? "메뉴 수정" : "새 메뉴 등록" }}
        </h2>
        <button
          v-if="isEditMode"
          @click="cancelEdit"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          취소하고 신규 등록으로 변경
        </button>
      </div>
      <form @submit.prevent="handleRegisterOrUpdate" class="registration-form">
        <div class="form-grid">
          <!-- 언어 코드 -->
          <div class="form-group">
            <label for="langu">언어 (Language)</label>
            <div class="input-wrapper">
              <select
                id="langu"
                v-model="menuForm.langu"
                :disabled="isSubmitting"
                required
              >
                <option value="" disabled>언어를 선택하세요</option>
                <option
                  v-for="lang in availableLanguages"
                  :key="lang.langu"
                  :value="lang.langu"
                >
                  {{ lang.langNm }} ({{ lang.langu }})
                </option>
              </select>
            </div>
          </div>

          <!-- 메뉴 ID -->
          <div class="form-group">
            <label for="menuId">메뉴 ID</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="menuId"
                v-model="menuForm.menuId"
                placeholder="예: SETTING"
                required
                :disabled="isSubmitting || isEditMode"
              />
            </div>
          </div>

          <!-- 메뉴명 -->
          <div class="form-group full-width">
            <label for="menuNm">메뉴명</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="menuNm"
                v-model="menuForm.menuNm"
                placeholder="화면에 표시될 메뉴 이름을 입력하세요"
                required
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <!-- 상위 메뉴 ID -->
          <div class="form-group">
            <label for="parentMenuId">상위 메뉴 ID</label>
            <div class="input-wrapper">
              <select
                id="parentMenuId"
                v-model="menuForm.parentMenuId"
                :disabled="isSubmitting"
              >
                <option value="">없음 (최상위 메뉴)</option>
                <option
                  v-for="menu in topLevelMenus"
                  :key="menu.menuId"
                  :value="menu.menuId"
                  :disabled="menu.menuId === menuForm.menuId"
                >
                  {{ menu.menuNm }} ({{ menu.menuId }})
                </option>
              </select>
            </div>
          </div>

          <!-- 이동 경로(Path) -->
          <div class="form-group">
            <label for="path">이동 경로 (Path)</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="path"
                v-model="menuForm.path"
                placeholder="예: /sys/users"
                :disabled="isSubmitting"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            :disabled="isSubmitting || !isValid"
          >
            <span v-if="isSubmitting">처리 중...</span>
            <span v-else>{{
              isEditMode ? "정보 수정하기" : "메뉴 등록하기"
            }}</span>
          </button>
        </div>
      </form>
    </section>

    <!-- 메뉴 리스트 테이블 섹션 -->
    <section class="card-section list-section">
      <div class="card-header list-header">
        <h2 class="section-title">등록된 메뉴 목록</h2>
        <span class="badge">{{ menus.length }}개 항목</span>
      </div>

      <div class="table-container">
        <table class="user-table">
          <thead>
            <tr>
              <th class="w-12 text-center">확장</th>
              <th>ID</th>
              <th>언어</th>
              <th>메뉴 ID</th>
              <th>메뉴명</th>
              <th>상위 메뉴</th>
              <th>경로(Path)</th>
              <th class="text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="menu in treeMenus" :key="menu.id">
              <!-- 상위 메뉴 행 -->
              <tr class="top-level-row">
                <td class="text-center">
                  <button
                    v-if="menu.children && menu.children.length > 0"
                    @click="toggleMenu(menu.menuId)"
                    class="toggle-btn"
                  >
                    {{ expandedMenus.includes(menu.menuId) ? "▼" : "▶" }}
                  </button>
                </td>
                <td>{{ menu.id }}</td>
                <td>
                  <span class="lang-tag">{{ menu.langu }}</span>
                </td>
                <td class="font-mono">{{ menu.menuId }}</td>
                <td class="font-bold text-blue-900">{{ menu.menuNm }}</td>
                <td>
                  <span class="text-slate-400 italic text-xs">최상위</span>
                </td>
                <td class="text-slate-500 italic">{{ menu.path || "-" }}</td>
                <td class="text-center">
                  <div class="action-buttons">
                    <button
                      @click="editMenu(menu)"
                      class="btn-edit"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      @click="deleteMenu(menu.id)"
                      class="btn-delete"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <!-- 하위 메뉴 행 (부모가 펼쳐진 상태일 때만 표시) -->
              <template v-if="expandedMenus.includes(menu.menuId)">
                <tr
                  v-for="child in menu.children"
                  :key="child.id"
                  class="child-level-row"
                >
                  <td></td>
                  <td>{{ child.id }}</td>
                  <td>
                    <span class="lang-tag sub-lang">{{ child.langu }}</span>
                  </td>
                  <td class="font-mono text-xs">{{ child.menuId }}</td>
                  <td class="font-medium">
                    <span class="text-slate-300 ml-4 mr-2">└</span>
                    {{ child.menuNm }}
                  </td>
                  <td>
                    <span class="badge-sm">{{ child.parentMenuId }}</span>
                  </td>
                  <td class="text-slate-500 italic text-xs">
                    {{ child.path || "-" }}
                  </td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <button
                        @click="editMenu(child)"
                        class="btn-edit"
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        @click="deleteMenu(child.id)"
                        class="btn-delete"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-if="menus.length === 0">
              <td colspan="8" class="empty-state">
                데이터베이스에 등록된 메뉴가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);

const menus = ref([]);
const availableLanguages = ref([]);
const expandedMenus = ref([]);

// 폼 초기 상태
const menuForm = ref({
  langu: "ko",
  menuId: "",
  menuNm: "",
  parentMenuId: "",
  path: "",
});

const isValid = computed(() => {
  return menuForm.value.langu && menuForm.value.menuId && menuForm.value.menuNm;
});

// 상위 메뉴 리스트
const topLevelMenus = computed(() => {
  return menus.value.filter((m) => !m.parentMenuId || m.parentMenuId === "");
});

// 트리 구조 생성 로직 (백엔드에서 트리로 주더라도 화면 구성을 위해 재가공)
const treeMenus = computed(() => {
  const tree = [];
  const menuMap = {};

  // 1. Map 생성
  menus.value.forEach((menu) => {
    menuMap[menu.menuId] = { ...menu, children: [] };
  });

  // 2. 계층 연결
  menus.value.forEach((menu) => {
    if (menu.parentMenuId && menuMap[menu.parentMenuId]) {
      menuMap[menu.parentMenuId].children.push(menuMap[menu.menuId]);
    } else if (!menu.parentMenuId || menu.parentMenuId === "") {
      tree.push(menuMap[menu.menuId]);
    }
  });

  return tree;
});

const toggleMenu = (menuId) => {
  const index = expandedMenus.value.indexOf(menuId);
  if (index === -1) {
    expandedMenus.value.push(menuId);
  } else {
    expandedMenus.value.splice(index, 1);
  }
};

onMounted(() => {
  fetchLanguages();
  fetchMenus();
});

// 메뉴 로드 시 상위 메뉴 자동 펼치기
watch(
  topLevelMenus,
  (newVal) => {
    if (newVal.length > 0) {
      newVal.forEach((m) => {
        if (!expandedMenus.value.includes(m.menuId)) {
          expandedMenus.value.push(m.menuId);
        }
      });
    }
  },
  { immediate: true },
);

const fetchLanguages = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/languages");
    if (response.ok) {
      availableLanguages.value = await response.json();
    } else {
      // Mock 데이터
      availableLanguages.value = [
        { langu: "ko", langNm: "한국어" },
        { langu: "en", langNm: "English" },
      ];
    }
  } catch (error) {
    console.error("언어 로드 오류:", error);
  }
};

const fetchMenus = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/menus");
    if (response.ok) {
      const data = await response.json();
      // 백엔드가 트리로 줄 경우 평탄화(Flatten) 처리
      if (data.length > 0 && data[0].children) {
        const flat = [];
        const flatten = (items) => {
          items.forEach((i) => {
            const { children, ...rest } = i;
            flat.push(rest);
            if (children && children.length > 0) flatten(children);
          });
        };
        flatten(data);
        menus.value = flat;
      } else {
        menus.value = data;
      }
    }
  } catch (error) {
    console.error("메뉴 로드 오류:", error);
  }
};

const handleRegisterOrUpdate = async () => {
  if (!isValid.value) return;
  isSubmitting.value = true;

  try {
    const payload = {
      langu: menuForm.value.langu,
      menuId: menuForm.value.menuId,
      menuNm: menuForm.value.menuNm,
      parentMenuId: menuForm.value.parentMenuId || null,
      path: menuForm.value.path,
    };

    const url = isEditMode.value
      ? `http://localhost:3000/api/menus/${editTargetId.value}`
      : "http://localhost:3000/api/menus";

    const method = isEditMode.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert(isEditMode.value ? "수정되었습니다." : "등록되었습니다.");
      resetForm();
      await fetchMenus();
    } else {
      const err = await response.json();
      alert(`실패: ${err.message || "서버 오류"}`);
    }
  } catch (error) {
    alert("네트워크 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const editMenu = (menu) => {
  isEditMode.value = true;
  editTargetId.value = menu.id;
  menuForm.value = {
    langu: menu.langu,
    menuId: menu.menuId,
    menuNm: menu.menuNm,
    parentMenuId: menu.parentMenuId || "",
    path: menu.path || "",
  };
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  menuForm.value = {
    langu: "ko",
    menuId: "",
    menuNm: "",
    parentMenuId: "",
    path: "",
  };
};

const deleteMenu = async (id) => {
  if (
    !confirm(
      "메뉴를 삭제하시겠습니까? 하위 메뉴가 있는 경우 주의가 필요합니다.",
    )
  )
    return;

  try {
    const response = await fetch(`http://localhost:3000/api/menus/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("삭제되었습니다.");
      if (editTargetId.value === id) resetForm();
      await fetchMenus();
    }
  } catch (error) {
    console.error("삭제 오류:", error);
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  return date.split("T")[0];
};
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  text-align: left;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-wrapper {
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #475569;
}

.page-subtitle {
  color: #64748b;
  margin-top: 0.5rem;
  margin-left: 3.25rem;
}

.card-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.registration-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-wrapper input:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn-primary {
  width: 100%;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  background-color: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.user-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
}

.toggle-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.75rem;
}

.toggle-btn:hover {
  color: #2563eb;
}

.lang-tag {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.7rem;
}

.sub-lang {
  background-color: #fff1f2;
  color: #e11d48;
}

.font-mono {
  font-family: ui-monospace, monospace;
  color: #64748b;
}

.badge-sm {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 0.15rem 0.4rem;
  border-radius: 9999px;
  font-size: 0.7rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.1s;
}

.btn-edit:hover {
  transform: scale(1.2);
}
.btn-delete:hover {
  transform: scale(1.2);
}

.empty-state {
  padding: 4rem !important;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}

.top-level-row:hover {
  background-color: #f8fafc;
}

.child-level-row {
  background-color: #fafafa;
}
</style>
