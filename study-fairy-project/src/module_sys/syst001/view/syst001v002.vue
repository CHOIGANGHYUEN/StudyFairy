<template>
  <div class="admin-container">
    <PageTitle />

    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title m-0">
          {{
            isCreateMode
              ? "신규 사용자 등록"
              : isViewMode
                ? "사용자 상세 조회"
                : "사용자 정보 수정"
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

      <div class="card-body">
        <form @submit.prevent="handleSave" class="form-grid">
          <div class="form-group full-width">
            <label for="userId"
              >사용자 ID <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              id="userId"
              v-model="userForm.userId"
              placeholder="예: user_01"
              required
              :disabled="isSubmitting || isEditMode || isViewMode"
              class="form-control"
            />
            <p class="input-hint" v-if="isCreateMode">
              ID는 중복될 수 없으며 저장 후에는 수정할 수 없습니다.
            </p>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useSyst001v002 } from "../function/syst001f002";

const {
  isCreateMode,
  isEditMode,
  isViewMode,
  isSubmitting,
  userForm,
  handleSave,
  handleClose,
} = useSyst001v002();
</script>
