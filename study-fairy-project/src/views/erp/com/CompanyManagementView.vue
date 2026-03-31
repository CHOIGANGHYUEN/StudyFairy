<template>
  <div class="admin-container">
    <PageTitle title="회사 관리" />
    <CompanyForm
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      v-model:formData="form"
      :available-languages="languages"
      @submit="handleSubmit"
      @reset="resetForm"
    />
    <CompanyList
      :companies="companies"
      :is-submitting="isSubmitting"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services";
import CompanyList from "@/company/CompanyList.vue";
import CompanyForm from "@/company/CompanyForm.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import { useAuthStore } from "@/stores/useAuthStore";
const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);
const companies = ref([]);
const languages = ref([]);

const authStore = useAuthStore();

const searchParams = ref({
  repNm: "",
  regNo: "",
});

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
});

const handleSearch = () => {
  pagination.value.currentPage = 1;
  fetchCompanies();
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchCompanies();
};

const getInitialForm = () => ({
  companyId: "",
  repNm: "",
  regNo: "",
  corpNo: "",
  bzType: "",
  bzItem: "",
  zipCode: "",
  addr: "",
  addrDetail: "",
  telNo: "",
  faxNo: "",
  email: "",
  currency: "KRW",
  useYn: 1,
  names: [],
});

const form = ref(getInitialForm());

onMounted(async () => {
  await fetchCompanies();
  await fetchLanguages();
});

const fetchLanguages = async () => {
  try {
    const res = await api.get("/languages");
    languages.value = res.data;
  } catch (error) {
    console.error("Failed to fetch languages:", error);
  }
};

const fetchCompanies = async () => {
  try {
    const response = await api.get("/companies", {
      params: {
        page: pagination.value.currentPage,
        size: 10,
        repNm: searchParams.value.repNm || undefined,
        regNo: searchParams.value.regNo || undefined,
      },
    });
    if (response.data && response.data.content) {
      companies.value = response.data.content;
      pagination.value.totalPages = response.data.totalPages || 1;
      pagination.value.totalItems = response.data.totalElements || 0;
    } else {
      companies.value = response.data || [];
      pagination.value.totalPages = 1;
    }
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    alert("회사 목록을 불러오는 데 실패했습니다.");
  }
};

const handleSubmit = async () => {
  if (!form.value.companyId) return;
  isSubmitting.value = true;
  try {
    const payload = { ...form.value };
    if (isEditMode.value) {
      payload.changedBy = authStore.user?.userid || "SYSTEM";
      await api.put(`/companies/${editTargetId.value}`, payload);
    } else {
      payload.createdBy = authStore.user?.userid || "SYSTEM";
      await api.post("/companies", payload);
    }
    alert(`성공적으로 ${isEditMode.value ? "수정" : "등록"}되었습니다.`);
    resetForm();
    await fetchCompanies();
  } catch (error) {
    const message = error.response?.data?.message || "작업에 실패했습니다.";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const handleEdit = (company) => {
  isEditMode.value = true;
  editTargetId.value = company.id;
  form.value = { ...company };
  window.scrollTo(0, 0);
};

const handleDelete = async (id) => {
  if (
    !confirm(
      "정말로 이 회사를 삭제하시겠습니까? 연관된 모든 다국어 정보도 함께 삭제됩니다.",
    )
  )
    return;
  isSubmitting.value = true;
  try {
    await api.delete(`/companies/${id}`);
    alert("성공적으로 삭제되었습니다.");
    if (isEditMode.value && editTargetId.value === id) {
      resetForm();
    }
    await fetchCompanies();
  } catch (error) {
    const message = error.response?.data?.message || "삭제에 실패했습니다.";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  isEditMode.value = false;
  editTargetId.value = null;
  form.value = getInitialForm();
};
</script>

<style scoped>
.company-management-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}
.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.search-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
}
.icon-sm {
  width: 1.2rem;
  height: 1.2rem;
}
@media (max-width: 1024px) {
  .company-management-layout {
    grid-template-columns: 1fr;
  }
}
</style>
