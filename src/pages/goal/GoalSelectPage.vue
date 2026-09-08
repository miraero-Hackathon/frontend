<template>
  <HeroBackground class="font-['Noto_Sans_KR',sans-serif]">
    <!-- 목표설정 퍼널 공통 상단 헤더 -->
    <StepHeader @back="handleBack" />

    <!-- 본문 콘텐츠 -->
    <div
      class="relative z-10 mx-auto w-full max-w-[660px] animate-fade-in-up px-4 pt-3 sm:pt-6 pb-28 md:pb-6"
    >
      <ProgressBar :current-step="1" :total-steps="4" />

      <!-- 메인 헤드라인 & 서브 텍스트 -->
      <h1
        class="mt-4 sm:mt-6 text-2xl sm:text-[28px] font-black tracking-tight leading-snug text-gray-900 break-keep"
      >
        어떤 목표를 향해 <br class="sm:hidden" />달려볼까요?
      </h1>
      <p class="mt-2 sm:mt-2.5 text-[13px] sm:text-sm font-medium text-slate-500 break-keep">
        지금 가장 집중하고 싶은 목표를 선택해 주세요.
      </p>

      <!-- 1) 로딩 스켈레톤 UI -->
      <div v-if="isLoading" class="mt-6 sm:mt-8 space-y-3.5 sm:space-y-4">
        <div
          v-for="i in 4"
          :key="i"
          class="rounded-2xl border-2 border-transparent bg-[#F4F7FA] p-5 sm:p-6 animate-pulse flex items-center justify-between"
        >
          <div class="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
            <div class="size-10 rounded-[14px] bg-slate-200/70 shrink-0" />
            <div class="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
              <div class="h-4 sm:h-4.5 w-24 sm:w-32 rounded bg-slate-200/70" />
              <div class="h-3 sm:h-3.5 w-36 sm:w-48 rounded bg-slate-200/50" />
            </div>
          </div>
          <div class="size-5 rounded-full bg-slate-200/70 shrink-0 ml-2" />
        </div>
      </div>

      <!-- 2) 에러 발생 시 재시도 UI -->
      <div
        v-else-if="isError"
        class="mt-8 rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-xs"
      >
        <div
          class="mx-auto w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-3"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 class="text-base font-bold text-gray-900 mb-1">목표 목록을 불러오지 못했어요</h3>
        <p class="mb-4 text-[13px] text-gray-500">네트워크 연결 상태를 확인하고 다시 시도해 주세요.</p>
        <button
          type="button"
          class="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-[13px] font-bold text-white transition-transform active:scale-95 cursor-pointer"
          @click="fetchPresets"
        >
          다시 시도
        </button>
      </div>

      <!-- 3) 목표 카드 리스트 (1열 세로 리스트) -->
      <div v-else class="mt-6 sm:mt-8 space-y-3.5 sm:space-y-4">
        <GoalCard
          v-for="preset in presets"
          :key="preset.id"
          v-bind="preset"
          :is-selected="goalStore.selectedGoalPresetId === preset.id"
          @select="selectGoal(preset.id)"
          @guide="openGuideModal(preset)"
        />
      </div>
    </div>

    <!-- 하단 반응형 CTA (모바일: 화면 고정 / 데스크톱: 카드 아래 인라인) -->
    <BottomCTA
      :label="buttonText"
      :disabled="!selectedGoal"
      caption="목표는 나중에 변경할 수 있어요"
      desktop-static
      @click="handleNext"
    />

    <!-- 목표 상세 안내 바텀시트 / 모달 -->
    <BaseModal v-model="isGuideModalOpen" hide-default-close>
      <div v-if="selectedGuidePreset" class="p-5 sm:p-6">
        <!-- 상단 헤더: 아이콘 + 제목 + 닫기 버튼 -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div
              class="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-[#EBF3FF] text-[#0066FF] shrink-0"
            >
              <GoalTypeIcon :goal-type="selectedGuidePreset.id" size="lg" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-[#0a192f]">
                {{ selectedGuidePreset.title }}
              </h2>
              <p class="mt-0.5 text-[13px] font-medium text-slate-500">
                {{ selectedGuidePreset.description }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition cursor-pointer"
            aria-label="닫기"
            @click="isGuideModalOpen = false"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <!-- 본문: 누구에게 맞을까요? 안내 박스 -->
        <div class="mt-4 sm:mt-5 rounded-2xl border border-blue-100 bg-[#F8FAFC] p-4">
          <div class="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#0066FF]">
            <AppIcon name="lightbulb" size="sm" />
            <span>누구에게 맞을까요?</span>
          </div>
          <p class="text-[13px] sm:text-sm font-medium leading-relaxed text-slate-700 break-keep">
            {{ selectedGuidePreset.guideInfo }}
          </p>
        </div>

        <!-- 태그 목록 -->
        <div v-if="selectedGuidePreset.tags?.length" class="mt-3.5 flex flex-wrap gap-1.5">
          <span
            v-for="tag in selectedGuidePreset.tags"
            :key="tag"
            class="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs sm:text-[13px] font-semibold text-slate-600"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- 하단 액션 버튼 -->
        <div class="mt-6 flex gap-2">
          <button
            type="button"
            class="w-full rounded-xl bg-primary py-3 sm:py-3.5 text-center text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,102,255,0.25)] transition hover:bg-primary/90 active:scale-[0.98] cursor-pointer"
            @click="handleSelectFromGuide(selectedGuidePreset.id)"
          >
            이 목표로 시작하기
          </button>
        </div>
      </div>
    </BaseModal>
  </HeroBackground>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeroBackground from '@/shared/ui/HeroBackground.vue'
import StepHeader from '@/shared/ui/StepHeader.vue'
import ProgressBar from '@/shared/ui/ProgressBar.vue'
import BottomCTA from '@/shared/ui/BottomCTA.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import AppIcon from '@/shared/ui/AppIcon.vue'
import GoalTypeIcon from '@/shared/ui/GoalTypeIcon.vue'
import GoalCard from '@/features/goal/components/GoalCard.vue'
import { useGoalStore } from '@/features/goal/store/goal.store'
import { getGoalPresets } from '@/features/goal/api/goal.api'
import { ROUTE_NAMES } from '@/shared/constants/routes'

const router = useRouter()
const route = useRoute()
const goalStore = useGoalStore()
const presets = ref([])
const isLoading = ref(true)
const isError = ref(false)

const isGuideModalOpen = ref(false)
const selectedGuidePreset = ref(null)

function openGuideModal(preset) {
  selectedGuidePreset.value = preset
  isGuideModalOpen.value = true
}

function handleSelectFromGuide(presetId) {
  selectGoal(presetId)
  isGuideModalOpen.value = false
  goalStore.moveToNextStep()
}

const selectedGoal = computed(() => {
  return presets.value.find((p) => p.id === goalStore.selectedGoalPresetId)
})

// CTA 문구 단순화
const buttonText = computed(() => {
  if (!selectedGoal.value) return '목표를 선택해 주세요'
  return '선택한 목표로 시작하기'
})

// 선택 해제 방지: 항상 해당 목표를 선택 상태로 유지
function selectGoal(id) {
  goalStore.selectGoalPreset(id)
}

function handleBack() {
  if (route.query.from === 'dashboard') {
    router.push({ name: ROUTE_NAMES.DASHBOARD })
  } else {
    router.push({ name: ROUTE_NAMES.ONBOARDING })
  }
}

async function fetchPresets() {
  isLoading.value = true
  isError.value = false
  try {
    presets.value = await getGoalPresets()
  } catch (error) {
    console.error('Failed to fetch goal presets:', error)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPresets()
})

function handleNext() {
  goalStore.moveToNextStep()
}
</script>
