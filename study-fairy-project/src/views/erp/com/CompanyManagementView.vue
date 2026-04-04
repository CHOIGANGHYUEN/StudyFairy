<template>
  <div class="admin-container list-layout">
    <PageTitle title="회사 관리" />

    <!-- 회사 폼 (기존 CompanyForm) -->
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title">
          {{ isEditMode ? "회사 정보 수정" : "새 회사 등록" }}
        </h2>
        <button
          v-if="isEditMode"
          @click="resetForm"
          class="text-sm font-medium text-blue-600 hover:underline"
        >
          취소 및 신규 전환
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid-complex">
          <!-- Main Company Info -->
          <div class="form-group">
            <label>회사 ID *</label>
            <input
              type="text"
              v-model="form.company"
              required
              :disabled="isEditMode"
            />
          </div>
          <div class="form-group">
            <label>대표자명</label>
            <input type="text" v-model="form.repNm" />
          </div>
          <div class="form-group">
            <label>사업자번호</label>
            <input type="text" v-model="form.regNo" />
          </div>
          <div class="form-group">
            <label>법인번호</label>
            <input type="text" v-model="form.corpNo" />
          </div>
          <div class="form-group full-span">
            <label>업태 / 종목</label>
            <div class="flex gap-4">
              <select
                class="flex-1"
                v-model="form.bzType"
                @change="onBzTypeChange"
              >
                <option value="">업태 선택</option>
                <option
                  v-for="type in bzTypes"
                  :key="type.subCode || type.subcode"
                  :value="type.subCode || type.subcode"
                >
                  {{ type.description || type.codeNm }}
                </option>
              </select>
              <select
                class="flex-1"
                v-model="form.bzItem"
                :disabled="!form.bzType"
              >
                <option value="">종목 선택</option>
                <option
                  v-for="item in filteredBzItems"
                  :key="item.subCode || item.subcode"
                  :value="item.subCode || item.subcode"
                >
                  {{ item.description || item.codeNm }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group full-span">
            <label>주소</label>
            <div class="flex gap-2 items-center">
              <input
                style="width: 100px"
                type="text"
                v-model="form.zipCode"
                placeholder="우편번호"
              />
              <button
                type="button"
                class="btn btn-secondary"
                @click="openPostcode"
              >
                주소검색
              </button>
            </div>
            <input
              class="mt-2"
              type="text"
              v-model="form.addr"
              placeholder="주소"
            />
            <input
              class="mt-2"
              type="text"
              v-model="form.addrDetail"
              placeholder="상세주소"
            />
          </div>
          <div class="form-group">
            <label>연락처</label>
            <input type="tel" v-model="form.telNo" />
          </div>
          <div class="form-group">
            <label>팩스</label>
            <input type="tel" v-model="form.faxNo" />
          </div>
          <div class="form-group">
            <label>이메일</label>
            <input type="email" v-model="form.email" />
          </div>
          <div class="form-group">
            <label>주 통화</label>
            <select v-model="form.currency">
              <option value="">선택</option>
              <option v-for="unit in units" :key="unit.unit" :value="unit.unit">
                {{ unit.unitNm }} ({{ unit.unit }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>사용 여부</label>
            <select v-model.number="form.useYn">
              <option :value="1">사용</option>
              <option :value="0">미사용</option>
            </select>
          </div>
        </div>

        <!-- Multilingual Names -->
        <div class="multilang-section">
          <h3 class="subsection-title">다국어 회사명</h3>
          <div
            v-for="(name, index) in form.names"
            :key="index"
            class="form-grid-multilang"
          >
            <select v-model="name.langu" :disabled="isEditMode">
              <option value="" disabled>언어 선택</option>
              <option
                v-for="lang in languages"
                :key="lang.langu"
                :value="lang.langu"
              >
                {{ lang.languNm }}
              </option>
            </select>
            <input type="text" v-model="name.companyNm" placeholder="회사명" />
            <button
              type="button"
              @click="removeName(index)"
              class="btn-icon btn-danger"
            >
              🗑️
            </button>
          </div>
          <button type="button" @click="addName" class="btn btn-outline mt-2">
            언어 추가
          </button>
        </div>

        <div class="p-4 border-t border-slate-200">
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="isSubmitting || !form.company"
          >
            {{
              isSubmitting ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"
            }}
          </button>
        </div>
      </form>
    </section>

    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <!-- 회사 목록 (기존 CompanyList) -->
        <section class="card-section list-section">
          <div class="card-header list-header">
            <h2 class="section-title">등록된 회사 목록</h2>
            <span class="badge badge-purple"
              >{{ paginatedCompanies.length }}개</span
            >
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>회사 ID</th>
                  <th>회사명</th>
                  <th>대표자명</th>
                  <th>사업자번호</th>
                  <th>연락처</th>
                  <th class="w-24 text-center">사용여부</th>
                  <th class="w-24 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="company in paginatedCompanies" :key="company.id">
                  <td class="font-bold text-blue-700">{{ company.company }}</td>
                  <td>
                    <div
                      v-for="name in company.names"
                      :key="name.langu"
                      class="lang-name-pair"
                    >
                      <span class="lang-code-badge">{{ name.langu }}</span>
                      <span>{{ name.companyNm }}</span>
                    </div>
                  </td>
                  <td>{{ company.repNm }}</td>
                  <td>{{ company.regNo }}</td>
                  <td>{{ company.telNo }}</td>
                  <td class="text-center">
                    <span
                      :class="[
                        'status-badge',
                        company.useYn === 1 ? 'active' : 'inactive',
                      ]"
                    >
                      {{ company.useYn === 1 ? "사용" : "미사용" }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <button
                        @click="handleEdit(company)"
                        class="btn-icon"
                        :disabled="isSubmitting"
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        @click="handleDelete(company.id)"
                        class="btn-icon"
                        :disabled="isSubmitting"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedCompanies.length === 0">
                  <td colspan="7" class="empty-state">
                    등록된 회사가 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div class="border-t p-4 flex justify-center bg-white rounded-b-sm">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
//import CompanyForm from "@/components/sys/company/CompanyForm.vue";
//import CompanyList from "@/components/sys/company/CompanyList.vue";
import Pagination from "@/components/Pagination.vue";
import { useCompanyManagement } from "@/composables/erp/com/useCompanyManagement";
const {
  isSubmitting,
  isEditMode,
  form,
  languages,
  currentPage,
  totalPages,
  paginatedCompanies,
  handleSubmit,
  handleEdit,
  handleDelete,
  resetForm,
} = useCompanyManagement();

const bzTypes = ref([]);
const bzItems = ref([]);
const units = ref([]);

const extractData = (res, name) => {
  let result = [];
  if (Array.isArray(res)) result = res;
  else if (res?.data && Array.isArray(res.data)) result = res.data;
  else if (res?.data?.data && Array.isArray(res.data.data))
    result = res.data.data;
  return result;
};

onMounted(async () => {
  try {
    const [bzTypeRes, bzItemRes, unitRes] = await Promise.all([
      api.get("/codes/items/ERP/COM001").catch(() => ({ data: [] })),
      api.get("/codes/items/ERP/COM002").catch(() => ({ data: [] })),
      api.get("/units").catch(() => ({ data: [] })),
    ]);
    bzTypes.value = extractData(bzTypeRes, "COM001");
    bzItems.value = extractData(bzItemRes, "COM002");
    units.value = extractData(unitRes, "UNITS");
  } catch (error) {
    console.error("Failed to load select options:", error);
  }
});

const filteredBzItems = computed(() => {
  if (!form.value.bzType) return [];
  return bzItems.value.filter(
    (item) =>
      item.field2 === form.value.bzType || item.FIELD2 === form.value.bzType,
  );
});

const onBzTypeChange = () => {
  form.value.bzItem = "";
};

const addName = () => {
  if (!form.value.names) form.value.names = [];
  form.value.names.push({ langu: "", companyNm: "" });
};

const removeName = (index) => {
  form.value.names.splice(index, 1);
};

const openPostcode = () => {
  if (window.daum && window.daum.Postcode) {
    new window.daum.Postcode({
      oncomplete: (data) => {
        form.value.zipCode = data.zonecode;
        form.value.addr = data.address;
      },
    }).open();
  }
};
</script>

<style scoped>
.form-grid-complex {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}
.full-span {
  grid-column: span 2;
}
.multilang-section {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.subsection-title {
  font-weight: 600;
  margin-bottom: 1rem;
}
.form-grid-multilang {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.p-4 {
  padding: 1rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.border-t {
  border-top-width: 1px;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
.data-table tr:hover td {
  background-color: #f8fafc;
}
.lang-name-pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.lang-code-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.7rem;
  font-family: monospace;
  border: 1px solid #e2e8f0;
}
</style>
