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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </template>
    </PageTitle>

    <UserForm :is-submitting="isSubmitting" @register="handleRegister" />
    <UserList :users="users" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { getUsers, createUser } from "@/service/userService";
import PageTitle from "@/components/PageTitle.vue";
import UserForm from "@/components/sys/user/UserForm.vue";
import UserList from "@/components/sys/user/UserList.vue";

const authStore = useAuthStore();
const isSubmitting = ref(false);
const users = ref([]);

// 초기 데이터 로드 (Mock 데이터 예시)
onMounted(() => {
  fetchUsers();
});

const fetchUsers = async () => {
  try {
    const response = await getUsers();
    users.value = response.data;
  } catch (error) {
    console.error("사용자 목록 로드 오류:", error);
  }
};

const handleRegister = async (userId) => {
  if (!userId) return;
  isSubmitting.value = true;
  try {
    await createUser({
      userId: userId,
      createdBy: authStore.user?.id || "SYSTEM",
      changedBy: authStore.user?.id || "SYSTEM",
    });
    alert("사용자가 성공적으로 등록되었습니다.");
    await fetchUsers(); // 목록 새로고침
  } catch (error) {
    const message = error.response?.data?.message || "등록 실패";
    alert(`오류: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped></style>
