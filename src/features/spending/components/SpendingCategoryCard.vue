<template>
  <article
    class="flex flex-col rounded-2xl border bg-white p-5 transition-all duration-200 shadow-xs hover:border-slate-300"
    :class="cardBorderClass"
  >
    <!-- 카드 헤더 -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <SpendingCategoryIcon
          :icon="category.icon"
          :category-id="category.id"
          :accent="category.accent"
          size="md"
          :active="hasTarget || selected"
        />

        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <h3 class="text-sm font-bold text-[#0A192F]">
            {{ category.name }}
          </h3>
        </div>
      </div>

      <span
        class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
        :class="
          category.target === null ? 'bg-[#F2F4F6] text-[#94A3B8]' : 'bg-[#E8F3FF] text-primary'
        "
      >
        {{ savingBadge }}
      </span>
    </div>

    <div class="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div class="rounded-xl bg-[#F8FBFF] border border-slate-100 px-3 py-4 text-center">
        <p class="text-xs font-medium text-[#64748B]">기준 지출</p>

        <p class="mt-1 text-base font-bold tabular-nums text-[#0A192F]">
          {{ formatAmount(category.recentThreeMonthAverage) }}만원
        </p>
      </div>

      <svg
        class="h-4 w-4 text-[#B6CCF5]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14m-4-4 4 4-4 4" />
      </svg>

      <div
        class="rounded-xl border px-3 py-4 text-center transition-colors"
        :class="hasTarget ? 'border-[#B9D4FF] bg-[#F4F8FF]' : 'border-transparent bg-[#F2F4F6]'"
      >
        <p class="text-xs font-medium text-[#64748B]">목표 지출</p>

        <p
          class="mt-1 text-base font-bold tabular-nums"
          :class="category.target === null ? 'text-[#94A3B8]' : 'text-primary'"
        >
          {{
            category.target === null ? '슬라이더로 조절' : `${formatAmount(category.target)}만원`
          }}
        </p>
      </div>
    </div>

    <!-- 슬라이더 -->
    <div class="relative mt-6">
      <label :for="rangeInputId" class="sr-only"> {{ category.name }} 목표 지출 조절 </label>

      <input
        :id="rangeInputId"
        class="spending-range block w-full cursor-pointer"
        type="range"
        :min="category.min"
        :max="category.recentThreeMonthAverage"
        :step="category.step ?? 1"
        :value="sliderValue"
        :style="rangeStyle"
        @input="handleRangeInput"
        @change="$emit('adjustment-complete')"
      />

      <div
        class="mt-3 flex items-center justify-between text-xs font-medium tabular-nums text-[#94A3B8]"
      >
        <span>{{ formatAmount(category.min) }}</span>
        <span>{{ formatAmount(category.recentThreeMonthAverage) }}만원</span>
      </div>
    </div>

    <!-- 조절 전 안내 -->
    <div
      v-if="category.target === null"
      class="mt-6 flex items-center gap-2 rounded-xl bg-[#F8FBFF] border border-slate-100 px-3 py-3 text-xs text-[#64748B]"
    >
      <span
        class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600"
        aria-hidden="true"
      >
        i
      </span>

      슬라이더를 움직여 목표 지출을 정해보세요
    </div>

    <!-- 조절 후 결과 -->
    <div
      v-else
      class="mt-6 flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-[#F4F8FF] px-3 py-3 text-xs transition-all"
    >
      <span class="shrink-0 font-bold text-primary">
        {{ formattedShortenedMonths }} 단축 예상
      </span>

      <span class="min-w-0 text-right font-medium text-[#64748B]">
        월
        <strong class="font-bold text-[#0A192F] tabular-nums"
          >{{ formatAmount(savingAmount) }}만원</strong
        >
        절감 가능
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import SpendingCategoryIcon from '@/features/spending/components/SpendingCategoryIcon.vue'
import {
  calculateSavingAmount,
  calculateShortenedMonths,
  formatShortenedPeriod,
} from '@/features/spending/composables/useSpendingSimulator'
import { formatKoreanNumber } from '@/shared/lib/money'

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  selectedGoal: {
    type: String,
    required: true,
  },
  idPrefix: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-target', 'adjustment-complete'])

const formatAmount = formatKoreanNumber

const rangeInputId = computed(() => `spending-range-${props.idPrefix}${props.category.id}`)

const sliderValue = computed(() => props.category.target ?? props.category.recentThreeMonthAverage)
const hasTarget = computed(() => props.category.target !== null)

const savingAmount = computed(() => calculateSavingAmount(props.category))
const shortenedMonths = computed(() => calculateShortenedMonths(savingAmount.value))
const formattedShortenedMonths = computed(() => formatShortenedPeriod(shortenedMonths.value))

const savingBadge = computed(() => {
  if (!hasTarget.value) {
    return '-'
  }

  return `월 ${formatAmount(savingAmount.value)}만원 절감`
})

const rangeProgress = computed(() => {
  const range = props.category.recentThreeMonthAverage - props.category.min

  if (range <= 0) {
    return 100
  }

  return ((sliderValue.value - props.category.min) / range) * 100
})

const cardBorderClass = computed(() => {
  if (hasTarget.value || props.selected) {
    return 'border-primary/40 ring-1 ring-primary/20 shadow-xs'
  }
  return 'border-slate-200/80'
})

const rangeStyle = computed(() => ({
  '--category-accent': props.category.accent || '#0066FF',
  '--range-progress': `${rangeProgress.value}%`,
}))

const handleRangeInput = (event) => {
  emit('update-target', {
    id: props.category.id,
    target: Number(event.target.value),
  })
}
</script>

<style scoped>
.spending-range {
  height: 6px;
  appearance: none;
  border-radius: 9999px;
  outline: none;
  background: linear-gradient(
    to right,
    var(--category-accent) 0%,
    var(--category-accent) var(--range-progress),
    #e2e8f0 var(--range-progress),
    #e2e8f0 100%
  );
}

.spending-range:focus-visible {
  outline: 2px solid var(--category-accent);
  outline-offset: 4px;
}

.spending-range::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  appearance: none;
  border: 2px solid var(--category-accent);
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: transform 0.15s ease;
}

.spending-range::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.15);
}

.spending-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: 2px solid var(--category-accent);
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: transform 0.15s ease;
}
</style>
