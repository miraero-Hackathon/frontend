<template>
  <section class="w-full" aria-labelledby="spending-simulator-title">
    <!-- 섹션 헤더 -->
    <div>
      <div class="flex items-baseline">
        <div class="flex shrink-0 items-center gap-1.5">
          <h2 id="spending-simulator-title" class="text-lg font-bold text-[#0A192F] md:text-xl">
            절감 시뮬레이터
          </h2>

          <button
            type="button"
            class="inline-flex size-[19px] shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] text-[#94A3B8] transition-colors hover:border-[#94A3B8] hover:text-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/25"
            aria-label="절감 시뮬레이터 설명 보기"
            aria-haspopup="dialog"
            @click="isInfoSheetOpen = true"
          >
            <svg viewBox="0 0 18 18" fill="none" class="size-3.5" aria-hidden="true">
              <path d="M9 8v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <circle cx="9" cy="5.5" r="0.9" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <p ref="simulatorInstructionRef" class="mt-3 scroll-mt-2 text-center text-xs text-[#64748B]">
        카테고리를 선택하고 지출을 조절해보세요
      </p>
    </div>

    <!-- 모바일 카테고리 선택 -->
    <div class="mt-6 min-[1400px]:hidden">
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="relative flex min-h-[92px] flex-col items-center justify-center rounded-2xl border p-3 transition-all active:scale-[0.98] cursor-pointer select-none"
          :class="
            selectedCategoryId === category.id
              ? 'border-primary/40 bg-[#EAF2FF] shadow-xs'
              : 'border-slate-200/80 bg-white hover:bg-[#F8FAFC]'
          "
          :aria-pressed="selectedCategoryId === category.id"
          @click="handleSelectCategory(category.id)"
        >
          <SpendingCategoryIcon
            :icon="category.icon"
            :category-id="category.id"
            :accent="category.accent"
            size="sm"
            :active="selectedCategoryId === category.id"
          />

          <span class="mt-1.5 text-xs font-bold text-[#0A192F]">
            {{ category.name }}
          </span>

          <span
            v-if="category.target !== null"
            class="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- 모바일에서 선택된 카드 하나만 표시 -->
      <div class="mt-8">
        <SpendingCategoryCard
          v-if="selectedCategory"
          :category="selectedCategory"
          :selected-goal="selectedGoal"
          id-prefix="mobile-"
          selected
          @update-target="handleUpdateCategoryTarget"
          @adjustment-complete="scrollToSimulatorInstruction"
        />
      </div>
    </div>

    <!-- 넓은 데스크톱 -->
    <div class="mt-4 hidden grid-cols-3 gap-4 min-[1400px]:grid">
      <SpendingCategoryCard
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :selected-goal="selectedGoal"
        @update-target="handleUpdateCategoryTarget"
        @adjustment-complete="scrollToSimulatorInstruction"
      />
    </div>

    <!-- 절감 조정 탭에 머무는 동안 화면 하단에 유지되는 전체 절감 결과 -->
    <div class="mt-8 h-16 min-[1400px]:h-auto">
      <div
        class="fixed inset-x-4 bottom-[calc(74px+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[1376px] rounded-xl border px-4 py-3 text-center shadow-[0_4px_18px_rgba(15,35,70,0.08)] transition-all sm:inset-x-6 md:inset-x-8 md:bottom-4 min-[1400px]:static min-[1400px]:max-w-none min-[1400px]:shadow-none"
        :class="
          hasAdjustedInCurrentView
            ? 'border-primary/25 bg-[#EAF2FF]'
            : 'border-slate-100 bg-[#F8FBFF]'
        "
        role="status"
        aria-live="polite"
      >
        <template v-if="hasAdjustedInCurrentView">
          <p class="text-[11px] font-medium text-[#94A3B8]">전체 절감 효과</p>
          <p class="mt-1 text-sm">
            <span class="font-bold text-[#0A192F]">{{ selectedGoal }} 총</span>
            <span class="ml-1 font-bold text-primary">{{ formattedTotalShortenedMonths }} 단축</span>
          </p>
        </template>
        <template v-else>
          <p class="text-xs text-[#94A3B8]">슬라이더를 조절하면 전체 단축 기간이 표시돼요</p>
        </template>
      </div>
    </div>

    <SpendingSimulatorInfoSheet v-model="isInfoSheetOpen" />
  </section>
</template>

<script setup>
import { nextTick, onMounted, ref, toRef, watch } from 'vue'
import SpendingCategoryCard from '@/features/spending/components/SpendingCategoryCard.vue'
import SpendingCategoryIcon from '@/features/spending/components/SpendingCategoryIcon.vue'
import SpendingSimulatorInfoSheet from '@/features/spending/components/SpendingSimulatorInfoSheet.vue'
import { useSpendingSimulator } from '@/features/spending/composables/useSpendingSimulator'
import { DEFAULT_SELECTED_GOAL } from '@/features/spending/constants/spending.constants'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
  selectedGoal: {
    type: String,
    default: DEFAULT_SELECTED_GOAL,
  },
})

const {
  categories,
  selectedCategoryId,
  selectedCategory,
  formattedTotalShortenedMonths,
  loadCategoryTargets,
  refreshSimulation,
  selectCategory,
  updateCategoryTarget,
} = useSpendingSimulator(toRef(props, 'summary'))

const hasAdjustedInCurrentView = ref(false)
const isInfoSheetOpen = ref(false)
const simulatorInstructionRef = ref(null)

async function scrollToSimulatorInstruction() {
  await nextTick()

  if (window.matchMedia('(min-width: 1400px)').matches) return

  simulatorInstructionRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function handleSelectCategory(categoryId) {
  selectCategory(categoryId)
  scrollToSimulatorInstruction()
}

function handleUpdateCategoryTarget(payload) {
  hasAdjustedInCurrentView.value = true
  updateCategoryTarget(payload)
}

onMounted(() => {
  loadCategoryTargets()
})

watch(
  () => props.summary?.referenceMonth,
  () => refreshSimulation()
)
</script>
