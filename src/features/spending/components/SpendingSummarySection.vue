<template>
  <section class="w-full" aria-labelledby="spending-summary-title">
    <h2 id="spending-summary-title" class="sr-only">이번 달 지출 요약</h2>

    <!-- 모바일 통합 요약 카드 -->
    <article class="rounded-2xl border border-[#D6E4FF] bg-white p-4 md:hidden">
      <div class="flex items-start justify-between gap-4">
        <p class="text-sm font-medium text-[#64748B]">이번 달 총지출</p>

        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0066FF] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/30"
          aria-haspopup="dialog"
          @click="$emit('open-transactions')"
        >
          내역 보기
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div class="mt-2 flex items-end gap-1 whitespace-nowrap">
        <strong class="text-[32px] font-bold leading-none tracking-[-0.04em] tabular-nums text-[#0A192F]">
          {{ formattedTotalSpending }}
        </strong>

        <div class="flex items-center gap-2 pb-0.5">
          <span class="text-sm font-medium text-[#64748B]">만원</span>

          <p class="text-[11px] text-[#64748B]">
            <span>전월 대비 </span>

            <strong class="font-semibold tabular-nums" :class="monthlyDifferenceColorClass">
              {{ desktopMonthlyDifferenceHighlightText }}
            </strong>

            <span v-if="monthlyDifference !== 0" class="tabular-nums"> · {{ monthlyDifferenceRate }}% </span>
          </p>
        </div>
      </div>

      <div
        class="mt-4 grid grid-cols-2 divide-x divide-[#E2E8F0] rounded-xl bg-[#F4F8FF] px-3 py-3"
      >
        <div class="px-2">
          <p class="text-xs text-[#64748B]">이번 달 저축 여력</p>

          <p class="mt-1.5">
            <strong class="text-xl font-bold tabular-nums text-[#0A192F]">
              {{ formattedSavingCapacity }}
            </strong>

            <span class="ml-0.5 text-xs font-medium text-[#64748B]"> 만원 </span>
          </p>
        </div>

        <div class="px-4">
          <p class="text-xs text-[#64748B]">목표 달성까지</p>

          <p class="mt-1.5">
            <strong class="text-xl font-bold tabular-nums text-[#0A192F]">
              {{ formattedRemainingMonths }}
            </strong>

            <span class="ml-0.5 text-xs font-medium text-[#64748B]"> 개월 </span>
          </p>
        </div>
      </div>

      <div class="mt-3">
        <div class="flex items-center justify-between gap-4 text-xs text-[#64748B]">
          <span>목표 달성 진행률</span>
          <span class="font-medium">{{ normalizedGoalProgress }}%</span>
        </div>

        <div
          class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EAF2FF]"
          role="progressbar"
          :aria-valuenow="normalizedGoalProgress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="목표 달성 진행률"
        >
          <div
            class="h-full rounded-full bg-[#0066FF] transition-[width] duration-300"
            :style="{ width: `${normalizedGoalProgress}%` }"
          />
        </div>
      </div>
    </article>

    <!-- 태블릿 및 데스크톱 KPI 카드 -->
    <div class="hidden grid-cols-3 gap-5 md:grid">
      <SpendingSummaryCard
        title="이번 달 총지출"
        :value="totalSpending"
        unit="만원"
        :description="desktopMonthlyDifferenceDescription"
        :description-highlight="desktopMonthlyDifferenceHighlightText"
        :tone="desktopMonthlyDifferenceTone"
        value-tone="default"
        action-label="내역 보기"
        @action="$emit('open-transactions')"
      />

      <SpendingSummaryCard title="이번 달 저축 여력" :value="savingCapacity" unit="만원" />

      <SpendingSummaryCard
        title="목표 달성 현황"
        :value="remainingMonths"
        unit="개월"
        :progress="goalProgress"
        progress-label="목표 달성 진행률"
        :progress-text="`${normalizedGoalProgress}%`"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import SpendingSummaryCard from '@/features/spending/components/SpendingSummaryCard.vue'
import { useSpendingSummaryComparison } from '@/features/spending/composables/useSpendingComparisons'

const props = defineProps({
  totalSpending: {
    type: Number,
    required: true,
  },
  previousMonthSpending: {
    type: Number,
    required: true,
  },
  savingCapacity: {
    type: Number,
    required: true,
  },
  remainingMonths: {
    type: Number,
    required: true,
  },
  monthlyDifference: {
    type: Number,
    required: true,
  },
  goalProgress: {
    type: Number,
    required: true,
  },
})

defineEmits(['open-transactions'])

const {
  formattedTotalSpending,
  formattedSavingCapacity,
  formattedRemainingMonths,
  normalizedGoalProgress,
  monthlyDifferenceRate,
  monthlyDifferenceDirection,
  monthlyDifferenceHighlightText: desktopMonthlyDifferenceHighlightText,
  monthlyDifferenceDescription: desktopMonthlyDifferenceDescription,
  monthlyDifferenceTone: desktopMonthlyDifferenceTone,
} = useSpendingSummaryComparison(props)

const monthlyDifferenceColorClass = computed(() => {
  if (monthlyDifferenceDirection.value === 'increase') {
    return 'text-[#E76F6F]'
  }

  if (monthlyDifferenceDirection.value === 'decrease') {
    return 'text-[#10B981]'
  }

  return 'text-[#64748B]'
})
</script>
