<template>
  <div class="admin-container">
    <PageTitle />
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title m-0">
          {{
            isCreateMode
              ? "신규 사용자-권한 매핑 등록"
              : isViewMode
                ? "매핑 상세 조회"
                : "매핑 정보 수정"
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
            <label
              >사용자 ID (User ID) <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              v-model="form.userId"
              placeholder="예: user_01"
              required
              :disabled="isSubmitting || isViewMode || isEditMode"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label
              >부여할 권한 (Role) <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.roleId"
              required
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            >
              <option value="" disabled>권한을 선택하세요</option>
              <option
                v-for="role in roles"
                :key="role.roleId"
                :value="role.roleId"
              >
                {{ role.roleId }} ({{ role.description }})
              </option>
            </select>
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
import { useSyst002v022 } from "../function/syst002f022";

const {
  isCreateMode,
  isEditMode,
  isViewMode,
  isSubmitting,
  form,
  roles,
  handleSave,
  handleClose,
} = useSyst002v022();
</script>
