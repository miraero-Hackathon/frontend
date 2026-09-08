<template>
  <section
    class="min-w-0 w-full min-[1400px]:contents"
    aria-labelledby="spending-category-monthly-title"
  >
    <article
      class="min-w-0 h-full w-full rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 min-[1400px]:order-3 shadow-xs"
    >
      <div class="category-header">
        <h2 id="spending-category-monthly-title" class="text-base font-bold text-[#0A192F]">
          카테고리별 지난달 대비 변화
        </h2>

        <p class="text-xs text-[#64748B]">각 항목의 지난달과 이번 달 지출을 비교해보세요</p>
      </div>

      <ul class="category-list">
        <li
          v-for="category in monthlyComparisonItems"
          :key="category.id"
          class="category-item grid min-w-0 grid-cols-[minmax(56px,0.8fr)_minmax(88px,1.3fr)_auto] items-center gap-x-1.5 rounded-xl border border-slate-100 bg-[#FBFDFF] px-3 py-3 transition-colors hover:bg-white hover:border-slate-200"
        >
          <div class="flex min-w-0 items-center gap-2">
            <SpendingCategoryIcon
              :icon="category.icon"
              :category-id="category.id"
              :accent="category.accent"
              size="sm"
            />

            <span class="truncate text-xs font-bold text-[#0A192F]">
              {{ category.name }}
            </span>
          </div>

          <div
            class="category-comparison grid min-w-0 -translate-x-2 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 text-center"
          >
            <div>
              <p class="text-[10px] font-medium text-[#94A3B8]">지난달</p>
              <strong class="mt-0.5 block text-xs font-bold tabular-nums text-[#0A192F]">
                {{ formatAmount(category.previousAmount) }}만원
              </strong>
            </div>

            <span class="text-xs text-[#94A3B8]" aria-hidden="true">→</span>

            <div>
              <p class="text-[10px] font-medium text-[#94A3B8]">이번 달</p>
              <strong class="mt-0.5 block text-xs font-bold tabular-nums text-[#0A192F]">
                {{ formatAmount(category.current) }}만원
              </strong>
            </div>
          </div>

          <span
            class="change-amount whitespace-nowrap text-xs font-bold tabular-nums"
            :class="getDifferenceClass(category.difference)"
          >
            {{ formatDifference(category.difference) }}
          </span>
        </li>
      </ul>

      <p
        v-if="monthlyComparisonItems.length === 0"
        class="rounded-xl bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#64748B]"
      >
        비교할 지출 데이터가 없어요
      </p>
    </article>
  </section>
</template>

<script setup>
import { toRef } from 'vue'
import SpendingCategoryIcon from '@/features/spending/components/SpendingCategoryIcon.vue'
import { useMonthlySpendingComparison } from '@/features/spending/composables/useSpendingComparisons'
import { formatKoreanNumber } from '@/shared/lib/money'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})

const formatAmount = formatKoreanNumber
const { monthlyComparisonItems } = useMonthlySpendingComparison(toRef(props, 'summary'))

const getDifferenceClass = (difference) => {
  if (difference > 0) {
    return 'text-[#FF5A67]'
  }

  if (difference < 0) {
    return 'text-[#10B981]'
  }

  return 'text-[#64748B]'
}

const formatDifference = (difference) => {
  if (difference === 0) {
    return '비슷해요'
  }

  return `${difference > 0 ? '↑' : '↓'} ${formatAmount(Math.abs(difference))}만원`
}
</script>

<style scoped>
.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-header {
  margin-bottom: 20px;
}

.category-header h2 {
  margin-bottom: 4px;
}

.change-amount {
  padding-right: 4px;
  text-align: right;
}

@media (min-width: 768px) {
  .category-item {
    display: grid;
    grid-template-columns:
      minmax(120px, 1fr) minmax(72px, 110px) minmax(24px, 40px) minmax(72px, 110px)
      minmax(56px, 80px);
    align-items: center;
    column-gap: 20px;
    min-height: 68px;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }

  .category-comparison {
    display: contents;
    transform: none;
  }
}
</style>
