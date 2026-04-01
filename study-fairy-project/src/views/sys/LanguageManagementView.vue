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
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012 2v.65M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
          />
        </svg>
      </template>
    </PageTitle>

    <LanguageForm :is-submitting="isSubmitting" @register="handleRegister" />
    <LanguageList
      :languages="languages"
      :is-submitting="isSubmitting"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  getLanguages,
  createLanguage,
  deleteLanguage,
} from "@/service/languageService";
import PageTitle from "@/components/PageTitle.vue";
import LanguageForm from "@/components/sys/language/LanguageForm.vue";
import LanguageList from "@/components/sys/language/LanguageList.vue";

const isSubmitting = ref(false);
const languages = ref([]);
const authStore = useAuthStore();

onMounted(() => {
  fetchLanguages();
});

const fetchLanguages = async () => {
  try {
    const response = await getLanguages();
    languages.value = response.data;
  } catch (error) {
    console.error("언어 목록 조회 에러:", error);
    alert("언어 목록을 불러오는 중 오류가 발생했습니다.");
  }
};

const handleRegister = async (newLang) => {
  isSubmitting.value = true;
  try {
    const registrationData = {
      ...newLang,
      createdBy: authStore.user?.userId || "ADMIN",
    };
    await createLanguage(registrationData);
    alert("새로운 언어가 성공적으로 등록되었습니다.");
    await fetchLanguages();
  } catch (error) {
    console.error("언어 등록 에러:", error);
    if (error.response && error.response.status === 409) {
      alert("이미 존재하는 언어 코드입니다. 다른 코드를 입력해주세요.");
    } else {
      alert("언어 등록 중 오류가 발생했습니다.");
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("정말로 이 언어를 삭제하시겠습니까?")) return;

  isSubmitting.value = true;
  try {
    await deleteLanguage(id);
    alert("성공적으로 삭제되었습니다.");
    await fetchLanguages();
  } catch (error) {
    console.error("언어 삭제 에러:", error);
    alert("언어 삭제 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.icon {
  color: #0891b2; /* Cyan color for this page's icon */
}
</style>
