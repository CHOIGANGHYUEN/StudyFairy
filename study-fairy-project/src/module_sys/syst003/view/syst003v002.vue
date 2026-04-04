<template>
  <div class="admin-container">
    <PageTitle />
    <section class="card-section">
      <div class="card-header flex justify-between items-center">
        <h2 class="section-title m-0">
          {{
            isCreateMode
              ? "신규 메뉴 등록"
              : isViewMode
                ? "메뉴 상세 조회"
                : "메뉴 정보 수정"
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
            <label>언어 *</label
            ><input
              type="text"
              v-model="form.langu"
              required
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>메뉴 ID *</label
            ><input
              type="text"
              v-model="form.menuId"
              required
              :disabled="isSubmitting || isViewMode || isEditMode"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>메뉴 레벨 *</label>
            <select
              v-model.number="form.menuLevel"
              @change="form.parentMenuId = ''"
              required
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            >
              <option :value="1">1단계 (대분류)</option>
              <option :value="2">2단계 (중분류)</option>
              <option :value="3">3단계 (소분류)</option>
            </select>
          </div>
          <div class="form-group">
            <label>상위 메뉴</label>
            <input
              type="text"
              v-model="form.parentMenuId"
              :disabled="isSubmitting || isViewMode || form.menuLevel === 1"
              placeholder="상위 메뉴 ID 입력"
              class="form-control"
            />
          </div>
          <div class="form-group full-width">
            <label>메뉴명 *</label
            ><input
              type="text"
              v-model="form.menuNm"
              required
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            />
          </div>
          <div class="form-group full-width">
            <label>설명</label
            ><input
              type="text"
              v-model="form.description"
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>경로 (Path)</label
            ><input
              type="text"
              v-model="form.path"
              :disabled="isSubmitting || isViewMode"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>순번 *</label
            ><input
              type="number"
              v-model.number="form.ordNum"
              min="1"
              required
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
import { useSyst003v002 } from "../function/syst003f002";
const {
  isCreateMode,
  isEditMode,
  isViewMode,
  isSubmitting,
  form,
  handleSave,
  handleClose,
} = useSyst003v002();
</script>
