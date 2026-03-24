<template>
  <div class="admin-container">
    <PageTitle>
      <template #icon>
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
      </template>
    </PageTitle>

    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title">
          {{ isEditMode ? "메뉴 정보 수정" : "신규 메뉴 등록" }}
        </h2>
        <button
          v-if="isEditMode"
          @click="resetForm"
          class="text-sm text-blue-600 font-medium"
        >
          취소 및 신규 전환
        </button>
      </div>
      <form @submit.prevent="handleRegisterOrUpdate" class="registration-form">
        <div class="form-grid">
          <!-- 언어 선택 부분 수정 (동적 바인딩) -->
          <div class="form-group">
            <label>언어 *</label>
            <select v-model="menuForm.langu" required>
              <option
                v-for="lang in availableLanguages"
                :key="lang.langu"
                :value="lang.langu"
              >
                {{ lang.languNm }} ({{ lang.langu }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>메뉴 ID *</label>
            <input
              type="text"
              v-model="menuForm.menuId"
              placeholder="예: M1000"
              :disabled="isEditMode"
              required
            />
          </div>

          <div class="form-group">
            <label>메뉴 레벨 *</label>
            <select
              v-model.number="menuForm.menuLevel"
              @change="menuForm.parentMenuId = ''"
              required
            >
              <option :value="1">1단계 (대분류)</option>
              <option :value="2">2단계 (중분류)</option>
              <option :value="3">3단계 (소분류)</option>
            </select>
          </div>

          <div class="form-group">
            <label>상위 메뉴</label>
            <select
              v-model="menuForm.parentMenuId"
              :disabled="menuForm.menuLevel === 1"
            >
              <option value="">없음 (최상위)</option>
              <option
                v-for="parent in filteredParentOptions"
                :key="parent.menuId"
                :value="parent.menuId"
              >
                [{{ parent.menuLevel }}단] {{ parent.menuNm }} ({{
                  parent.menuId
                }})
              </option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>메뉴명 *</label>
            <input type="text" v-model="menuForm.menuNm" required />
          </div>

          <div class="form-group full-width">
            <label>설명 (Description)</label>
            <input
              type="text"
              v-model="menuForm.description"
              placeholder="메뉴에 대한 설명을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label>경로 (Path)</label>
            <input
              type="text"
              v-model="menuForm.path"
              placeholder="/example/path"
            />
          </div>

          <div class="form-group">
            <label>순번 *</label>
            <input
              type="number"
              v-model.number="menuForm.ordNum"
              min="1"
              required
            />
          </div>

          <div class="form-group">
            <label>사용 여부</label>
            <select v-model.number="menuForm.useYn">
              <option :value="1">사용함</option>
              <option :value="0">사용 안함</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{
            isSubmitting
              ? "처리 중..."
              : isEditMode
                ? "정보 수정하기"
                : "메뉴 등록하기"
          }}
        </button>
      </form>
    </section>

    <section class="card-section">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-16 text-center">확장</th>
              <th class="w-16">ID</th>
              <th>메뉴 체계 (레벨/명칭/ID)</th>
              <th class="w-20 text-center">순번</th>
              <th class="w-24 text-center">상태</th>
              <th class="w-24 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="l1 in menuTree" :key="l1.id">
              <tr class="row-l1">
                <td class="text-center">
                  <button
                    v-if="l1.children.length"
                    @click="toggleMenu(l1.menuId)"
                    class="toggle-btn"
                  >
                    {{ expandedMenus.includes(l1.menuId) ? "▼" : "▶" }}
                  </button>
                </td>
                <td>{{ l1.id }}</td>
                <td class="font-bold">
                  <span class="badge l1">대</span> {{ l1.menuNm }}
                  <span class="mid">{{ l1.menuId }}</span>
                </td>
                <td class="text-center font-bold text-blue-600">
                  {{ l1.ordNum }}
                </td>
                <td class="text-center">
                  <span
                    :class="[
                      'status-badge',
                      l1.useYn === 1 ? 'active' : 'inactive',
                    ]"
                    >{{ l1.useYn === 1 ? "사용" : "미사용" }}</span
                  >
                </td>
                <td class="text-center">
                  <div class="action-buttons">
                    <button @click="editMenu(l1)" class="btn-icon">✏️</button>
                    <button @click="deleteMenu(l1.id)" class="btn-icon">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <template v-if="expandedMenus.includes(l1.menuId)">
                <template v-for="l2 in l1.children" :key="l2.id">
                  <tr class="row-l2">
                    <td class="text-center">
                      <button
                        v-if="l2.children.length"
                        @click="toggleMenu(l2.menuId)"
                        class="toggle-btn"
                      >
                        {{ expandedMenus.includes(l2.menuId) ? "▼" : "▶" }}
                      </button>
                    </td>
                    <td>{{ l2.id }}</td>
                    <td class="pl-indent-1">
                      <span class="tree-line">└</span>
                      <span class="badge l2">중</span> {{ l2.menuNm }}
                      <span class="mid">{{ l2.menuId }}</span>
                    </td>
                    <td class="text-center">{{ l2.ordNum }}</td>
                    <td class="text-center">
                      <span
                        :class="[
                          'status-badge sm',
                          l2.useYn === 1 ? 'active' : 'inactive',
                        ]"
                        >{{ l2.useYn === 1 ? "사용" : "미사용" }}</span
                      >
                    </td>
                    <td class="text-center">
                      <div class="action-buttons">
                        <button @click="editMenu(l2)" class="btn-icon">
                          ✏️
                        </button>
                        <button @click="deleteMenu(l2.id)" class="btn-icon">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  <template v-if="expandedMenus.includes(l2.menuId)">
                    <tr v-for="l3 in l2.children" :key="l3.id" class="row-l3">
                      <td></td>
                      <td>{{ l3.id }}</td>
                      <td class="pl-indent-2">
                        <span class="tree-line">└</span>
                        <span class="badge l3">소</span> {{ l3.menuNm }}
                        <span class="mid">{{ l3.menuId }}</span>
                      </td>
                      <td class="text-center text-slate-400">
                        {{ l3.ordNum }}
                      </td>
                      <td class="text-center">
                        <span
                          :class="[
                            'status-badge sm',
                            l3.useYn === 1 ? 'active' : 'inactive',
                          ]"
                          >{{ l3.useYn === 1 ? "사용" : "미사용" }}</span
                        >
                      </td>
                      <td class="text-center">
                        <div class="action-buttons">
                          <button @click="editMenu(l3)" class="btn-icon">
                            ✏️
                          </button>
                          <button @click="deleteMenu(l3.id)" class="btn-icon">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>
                </template>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/service/api";
import PageTitle from "@/components/PageTitle.vue";

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);
const menuTree = ref([]);
const expandedMenus = ref([]);
// 빈 배열로 초기화
const availableLanguages = ref([]);

const authStore = useAuthStore();

const menuForm = ref({
  langu: "KO",
  menuId: "",
  menuNm: "",
  description: "",
  parentMenuId: "",
  path: "",
  menuLevel: 1,
  ordNum: 1,
  useYn: 1,
});

const flatMenus = computed(() => {
  const result = [];
  const traverse = (nodes) => {
    if (!nodes || !nodes.length) return;
    for (const node of nodes) {
      const { children, ...rest } = node;
      result.push(rest);
      traverse(children);
    }
  };
  traverse(menuTree.value);
  return result;
});

const filteredParentOptions = computed(() => {
  return flatMenus.value.filter(
    (m) =>
      m.menuLevel === menuForm.value.menuLevel - 1 &&
      m.langu === menuForm.value.langu,
  );
});

const toggleMenu = (id) => {
  const idx = expandedMenus.value.indexOf(id);
  if (idx > -1) expandedMenus.value.splice(idx, 1);
  else expandedMenus.value.push(id);
};

// --- Languages 데이터 호출 함수 추가 ---
const fetchLanguages = async () => {
  try {
    const res = await api.get("/languages");
    availableLanguages.value = res.data;
    if (availableLanguages.value.length > 0 && !menuForm.value.langu) {
      menuForm.value.langu = availableLanguages.value[0].langu;
    }
  } catch (error) {
    console.error("Error fetching languages:", error);
  }
};

const fetchMenus = async () => {
  try {
    const res = await api.get("/menus");
    menuTree.value = res.data;
  } catch (error) {
    console.error("Error fetching menus:", error);
    menuTree.value = [];
  }
};

const handleRegisterOrUpdate = async () => {
  isSubmitting.value = true;
  try {
    const url = isEditMode.value ? `/menus/${editTargetId.value}` : "/menus";
    const method = isEditMode.value ? "put" : "post";
    const payload = {
      ...menuForm.value,
      parentMenuId: menuForm.value.parentMenuId || null,
    };
    await api[method](url, payload);
    alert("완료되었습니다.");
    resetForm();
    await fetchMenus(); // 데이터 다시 로드
  } catch (error) {
    const message = error.response?.data?.message || "작업에 실패했습니다.";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const editMenu = (m) => {
  isEditMode.value = true;
  editTargetId.value = m.id;
  menuForm.value = { ...m, parentMenuId: m.parentMenuId || "" };
  window.scrollTo(0, 0);
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  menuForm.value = {
    langu:
      availableLanguages.value.length > 0
        ? availableLanguages.value[0].langu
        : "KO",
    menuId: "",
    menuNm: "",
    description: "",
    parentMenuId: "",
    path: "",
    menuLevel: 1,
    ordNum: 1,
    useYn: 1,
  };
};

const deleteMenu = async (id) => {
  if (!confirm("하위 메뉴까지 모두 삭제될 수 있습니다. 정말 삭제하시겠습니까?"))
    return;
  try {
    await api.delete(`/menus/${id}`);
    alert("삭제되었습니다.");
    await fetchMenus(); // 데이터 다시 로드
  } catch (error) {
    const message = error.response?.data?.message || "삭제에 실패했습니다.";
    alert(`오류: ${message}`);
  }
};

onMounted(() => {
  fetchLanguages(); // 컴포넌트 로드 시 언어 데이터 호출
  fetchMenus();
});
</script>

<style scoped>
/* 트리 테이블에 특화된 스타일 */
.mid {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-left: 0.5rem;
  font-family: monospace;
}
.tree-line {
  color: #cbd5e1;
  margin-right: 0.5rem;
  font-weight: bold;
}
.pl-indent-1 {
  padding-left: 2.5rem !important;
}
.pl-indent-2 {
  padding-left: 4.5rem !important;
}

/* 레벨 배지 */
.badge {
  font-size: 0.6rem;
  padding: 2px 5px;
  border-radius: 4px;
  color: white;
  margin-right: 4px;
}
.badge.l1 {
  background: #2563eb;
}
.badge.l2 {
  background: #10b981;
}
.badge.l3 {
  background: #8b5cf6;
}

.toggle-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 2px 5px;
  cursor: pointer;
  font-size: 0.6rem;
  border-radius: 4px;
}
</style>
