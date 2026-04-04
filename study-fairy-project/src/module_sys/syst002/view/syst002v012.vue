<template>
  <div class="admin-container">
    <PageTitle />
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title m-0">
          {{
            isCreateMode
              ? "신규 권한 등록"
              : isViewMode
                ? "권한 상세 조회"
                : "권한 정보 수정"
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
          <div class="form-group">
            <label>권한 ID (Role ID) <span class="text-red-500">*</span></label>
            <input
              type="text"
              v-model="form.roleId"
              placeholder="예: ROLE_ADMIN"
              required
              :disabled="isSubmitting || isViewMode || isEditMode"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>설명 (Description)</label>
            <input
              type="text"
              v-model="form.description"
              placeholder="예: 시스템 최고 관리자"
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>사용 여부</label>
            <select
              v-model.number="form.useYn"
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            >
              <option :value="1">사용</option>
              <option :value="0">미사용</option>
            </select>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { useSyst002v012 } from "../function/syst002f012";

const {
  isCreateMode,
  isEditMode,
  isViewMode,
  isSubmitting,
  form,
  handleSave,
  handleClose,
} = useSyst002v012();
</script>
