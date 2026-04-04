<template>
  <div class="admin-container">
    <div class="page-header list-header">
      <PageTitle :title="pageTitle">
        <template #icon>
          <svg
            class="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </template>
        <template #subtitle>{{ pageSubtitle }}</template>
      </PageTitle>

      <div class="action-buttons">
        <button class="btn btn-outline" @click="goBack">목록으로</button>
        <button v-if="isReadOnly" class="btn btn-primary" @click="goToEdit">
          수정하기
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header flex justify-between items-center">
        <span>상세 정보</span>
        <span v-if="isReadOnly" class="badge badge-blue">조회 모드</span>
        <span v-else-if="isEditMode" class="badge badge-yellow">수정 모드</span>
        <span v-else class="badge badge-green">신규 등록</span>
      </div>
      <div class="card-body">
        <!-- 조회 모드일 때 투명도를 주고 클릭/입력을 막습니다 -->
        <div :class="{ 'opacity-80 pointer-events-none': isReadOnly }">
          <ScheduleForm
            :is-edit-mode="isEditMode"
            :is-submitting="isSubmitting"
            :form-data="form"
            :sys001-items="sys001Items"
            :sys002-items="sys002Items"
            :year-options="yearOptions"
            @submit="onFormSubmit"
            @reset="goBack"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import ScheduleForm from "@/components/sys/schedule/ScheduleForm.vue";
import { useScheduleManagement } from "@/composables/sys/schedule/useScheduleManagement";

const route = useRoute();
const router = useRouter();

// 기존 Form Data 및 로직 재사용
const {
  form,
  isSubmitting,
  sys001Items,
  sys002Items,
  yearOptions,
  handleSubmit,
} = useScheduleManagement();

const isReadOnly = computed(
  () => !!route.params.id && !route.path.includes("/edit"),
);
const isEditMode = computed(() => route.path.includes("/edit"));

const pageTitle = computed(() => {
  if (isReadOnly.value) return "일정 상세 내용";
  if (isEditMode.value) return "일정 수정";
  return "새 일정 등록";
});

const pageSubtitle = computed(() => {
  if (isReadOnly.value) return "등록된 일정의 상세 내용을 확인합니다.";
  if (isEditMode.value) return "일정 내용을 수정합니다. (키값 제외)";
  return "새로운 일정을 등록합니다.";
});

onMounted(() => {
  const { id } = route.params;
  if (id) {
    // 실제 환경에서는 API 호출로 상세 데이터를 불러와 form.value에 바인딩합니다.
    // fetchScheduleDetail(id);
  }
});

const onFormSubmit = async () => {
  await handleSubmit();
  // 성공 후 리스트로 이동하거나 상세조회로 이동하는 로직을 추가할 수 있습니다.
  goBack();
};

const goBack = () => router.push("/sys/schedules");
const goToEdit = () => router.push(`/sys/schedules/${route.params.id}/edit`);
</script>
