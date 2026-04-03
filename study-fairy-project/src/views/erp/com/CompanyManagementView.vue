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
import { useAuthStore } from "@/stores/useAuthStore";
import * as companyService from "@/service/companyService";
import { getLanguages } from "@/service/languageService";
import PageTitle from "@/components/PageTitle.vue";
import CompanyForm from "@/components/sys/company/CompanyForm.vue";
import CompanyList from "@/components/sys/company/CompanyList.vue";

const isSubmitting = ref(false);
const isEditMode = ref(false);
const editTargetId = ref(null);
const companies = ref([]);
const languages = ref([]);

const authStore = useAuthStore();

const getInitialForm = () => ({
  company: "",
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
    const res = await getLanguages();
    languages.value = res.data;
  } catch (error) {
    console.error("Failed to fetch languages:", error);
  }
};

const fetchCompanies = async () => {
  try {
    const response = await companyService.getCompanies();
    companies.value = response.data;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    alert("회사 목록을 불러오는 데 실패했습니다.");
  }
};

const handleSubmit = async () => {
  if (!form.value.company) return;
  isSubmitting.value = true;
  try {
    const payload = { ...form.value };
    if (isEditMode.value) {
      payload.changedBy = authStore.user?.userid || "SYSTEM";
      await companyService.updateCompany(editTargetId.value, payload);
    } else {
      payload.createdBy = authStore.user?.userid || "SYSTEM";
      await companyService.createCompany(payload);
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
    await companyService.deleteCompany(id);
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
/* Page-specific layout styles can remain here */
</style>
