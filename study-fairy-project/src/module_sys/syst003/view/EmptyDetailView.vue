<template>
  <div class="admin-container">
    <PageTitle />

    <section class="card-section">
      <!-- 헤더 및 상단 액션 버튼 -->
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title m-0">
          {{
            isCreateMode
              ? "신규 데이터 등록"
              : isViewMode
                ? "데이터 상세 조회"
                : "데이터 정보 수정"
          }}
        </h2>
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="handleClose">닫기</button>
          <button
            v-if="!isViewMode"
            class="btn btn-primary"
            @click="handleSave"
            :disabled="isSubmitting"
          >
            저장
          </button>
        </div>
      </div>

      <!-- 폼 입력 영역 -->
      <div class="card-body">
        <form @submit.prevent="handleSave" class="form-grid">
          <div class="form-group full-width">
            <label for="dataName"
              >데이터 명칭 <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              id="dataName"
              v-model="form.name"
              placeholder="예: 기준 데이터 1"
              required
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            />
            <p class="input-hint" v-if="isCreateMode">
              새로 등록하는 데이터의 고유한 이름을 입력하세요.
            </p>
          </div>
          <!-- 추가 입력 필드들을 form-grid 안에 배치하세요 -->
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useEmptyLogicDetail } from "./emptyLogic";

const {
  isCreateMode,
  isEditMode,
  isViewMode,
  isSubmitting,
  form,
  handleSave,
  handleClose,
} = useEmptyLogicDetail();
</script>
