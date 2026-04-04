<template>
  <div class="admin-container list-layout">
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

    <div class="card flex-1 flex flex-col min-h-0 mb-0">
      <div class="overflow-y-auto flex-1 p-0">
        <UserList :users="paginatedUsers" />
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
import UserForm from "@/components/sys/user/UserForm.vue";
import UserList from "@/components/sys/user/UserList.vue";
import Pagination from "@/components/Pagination.vue";
import { useUserManagement } from "@/composables/sys/user/useUserManagement";
const {
  isSubmitting,
  currentPage,
  totalPages,
  paginatedUsers,
  handleRegister,
} = useUserManagement();
</script>

<style scoped></style>
