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

    <!-- 메뉴 등록 폼 섹션 -->
    <section class="card-section">
      <div class="card-header">
        <h2 class="section-title">새 메뉴 등록</h2>
      </div>
      <form @submit.prevent="handleRegister" class="registration-form">
        <div class="form-grid">
          <!-- 언어 코드 -->
          <div class="form-group">
            <label for="langu">언어 (Language)</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="langu"
                v-model="newMenu.langu"
                placeholder="예: ko, en"
                required
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <!-- 메뉴 ID -->
          <div class="form-group">
            <label for="menuId">메뉴 ID</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="menuId"
                v-model="newMenu.menuId"
                placeholder="예: MENU_001"
                required
                :disabled="isSubmitting"
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
                v-model="newMenu.menuNm"
                placeholder="화면에 표시될 메뉴 이름을 입력하세요"
                required
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
            {{ isSubmitting ? "등록 중..." : "메뉴 추가" }}
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
              <th>ID</th>
              <th>언어</th>
              <th>메뉴 ID</th>
              <th>메뉴명</th>
              <th>생성일시</th>
              <th>수정자</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in menus" :key="menu.id">
              <td>{{ menu.id }}</td>
              <td>
                <span class="lang-tag">{{ menu.langu }}</span>
              </td>
              <td class="font-mono">{{ menu.menuId }}</td>
              <td class="font-bold">{{ menu.menuNm }}</td>
              <td>{{ formatDate(menu.createdAt) }}</td>
              <td>{{ menu.changedBy || "-" }}</td>
            </tr>
            <tr v-if="menus.length === 0">
              <td colspan="6" class="empty-state">
                등록된 메뉴 정보가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const isSubmitting = ref(false);
const menus = ref([]);

const newMenu = ref({
  langu: "",
  menuId: "",
  menuNm: "",
});

const isValid = computed(() => {
  return newMenu.value.langu && newMenu.value.menuId && newMenu.value.menuNm;
});

onMounted(() => {
  fetchMenus();
});

const fetchMenus = async () => {
  // 임시 데이터 (Mock)
  menus.value = [
    {
      id: 1,
      langu: "ko",
      menuId: "HOME",
      menuNm: "홈",
      createdBy: "ADMIN",
      createdAt: new Date().toISOString(),
      changedBy: "ADMIN",
      changedAt: new Date().toISOString(),
    },
    {
      id: 2,
      langu: "en",
      menuId: "HOME",
      menuNm: "Home",
      createdBy: "ADMIN",
      createdAt: new Date().toISOString(),
      changedBy: "ADMIN",
      changedAt: new Date().toISOString(),
    },
  ];
};

const handleRegister = async () => {
  if (!isValid.value) return;

  isSubmitting.value = true;

  try {
    const registrationData = {
      langu: newMenu.value.langu,
      menuId: newMenu.value.menuId,
      menuNm: newMenu.value.menuNm,
      createdBy: "ADMIN",
      createdAt: new Date().toISOString(),
      changedBy: "ADMIN",
      changedAt: new Date().toISOString(),
    };

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 800));

    menus.value.unshift({
      id: menus.value.length + 1,
      ...registrationData,
    });

    // 필드 초기화
    newMenu.value = { langu: "", menuId: "", menuNm: "" };
    alert("메뉴가 성공적으로 등록되었습니다.");
  } catch (error) {
    alert("등록 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.registration-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.user-table th {
  background-color: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.user-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.lang-tag {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.font-mono {
  font-family: monospace;
  background-color: #f8fafc;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}

.font-bold {
  font-weight: 600;
  color: #0f172a;
}

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
}

.user-table tr:hover td {
  background-color: #f8fafc;
}
</style>
