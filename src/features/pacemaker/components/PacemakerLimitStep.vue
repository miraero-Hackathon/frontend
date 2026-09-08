<!-- 페이스메이커 STEP 1: 하루 자동 저축 상한선 설정 -->
<template>
  <section class="flex min-h-full flex-col" aria-labelledby="limit-title">
    <div class="flex-1 px-5 pb-6 pt-7 sm:px-8 sm:pt-10">
      <h2
        id="limit-title"
        class="text-[28px] font-bold leading-[1.28] tracking-[-0.025em] text-[#0a192f]"
      >
        하루에 얼마까지<br />모을까요?
      </h2>
      <p class="mt-3 text-sm leading-6 text-slate-500">부담 없는 하루 상한선을 정해 주세요.</p>

      <div
        class="mt-8 rounded-[20px] border border-[#d7e7ff] bg-[#eef5ff] px-5 py-5"
        aria-live="polite"
      >
        <p class="text-xs font-semibold text-slate-500">하루 최대 자동 저축 금액</p>
        <p class="mt-2 text-[36px] font-bold leading-none tracking-[-0.035em] text-primary">
          {{ formatNumber(selectedMaxAmount) }}<span class="ml-1 text-xl">원</span>
        </p>
        <p class="mt-3 text-xs font-semibold text-[#3976c9]">
          한 달 최대 {{ formatNumber(selectedMaxAmount * 30) }}원
        </p>
      </div>

      <div class="mt-8">
        <label for="daily-saving-limit" class="sr-only">하루 자동 저축 상한선</label>
        <input
          id="daily-saving-limit"
          v-model.number="selectedMaxAmount"
          type="range"
          :min="MIN_DAILY_LIMIT"
          :max="MAX_DAILY_LIMIT"
          :step="DAILY_LIMIT_STEP"
          class="limit-slider w-full cursor-pointer appearance-none rounded-full"
          :style="limitSliderStyle"
          :disabled="isSubmitting"
        />
        <div class="mt-5 grid grid-cols-5 gap-2">
          <button
            v-for="amount in limitPresets"
            :key="amount"
            type="button"
            class="min-h-9 rounded-xl border px-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            :class="
              selectedMaxAmount === amount
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:border-primary/30 hover:bg-blue-50'
            "
            :aria-pressed="selectedMaxAmount === amount"
            :disabled="isSubmitting"
            @click="selectedMaxAmount = amount"
          >
            {{ formatPreset(amount) }}
          </button>
        </div>
      </div>

      <div class="mt-7 flex items-start gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-slate-500">
        <svg
          class="mt-0.5 size-4 shrink-0 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
        <p class="text-xs leading-5">실제 여유자금이 상한선보다 적으면 남은 금액만 저축해요.</p>
      </div>

      <p
        v-if="errorMessage"
        class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-600"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>

    <div
      class="sticky bottom-0 border-t border-slate-200/70 bg-[#f8fbff]/95 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-8"
    >
      <button
        type="button"
        class="min-h-[52px] w-full rounded-2xl bg-primary px-5 text-base font-bold text-white transition hover:bg-[#005ce6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSubmitting"
        @click="$emit('next')"
      >
        <span v-if="isSubmitting">변경 중...</span>
        <span v-else-if="isEditMode">변경 완료</span>
        <span v-else class="inline-flex items-center gap-1.5">
          다음
          <span aria-hidden="true">→</span>
        </span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const MIN_DAILY_LIMIT = 1000
const MAX_DAILY_LIMIT = 50000
const DAILY_LIMIT_STEP = 1000

const props = defineProps({
  modelValue: { type: Number, required: true },
  isSubmitting: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'next'])
const limitPresets = [1000, 10000, 20000, 30000, 50000]

const selectedMaxAmount = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const limitSliderStyle = computed(() => {
  const progress =
    ((selectedMaxAmount.value - MIN_DAILY_LIMIT) / (MAX_DAILY_LIMIT - MIN_DAILY_LIMIT)) * 100
  return {
    background: `linear-gradient(to right, #0066ff 0%, #0066ff ${progress}%, #dbe5f1 ${progress}%, #dbe5f1 100%)`,
  }
})

function formatNumber(amount) {
  return amount.toLocaleString('ko-KR')
}

function formatPreset(amount) {
  if (amount < 10000) return `${amount / 1000}천`
  return `${amount / 10000}만`
}
</script>

<style scoped>
.limit-slider {
  height: 6px;
}
.limit-slider::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  appearance: none;
  border: 4px solid #fff;
  border-radius: 9999px;
  background: #0066ff;
  box-shadow: 0 2px 8px rgba(0, 102, 255, 0.28);
}
.limit-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 4px solid #fff;
  border-radius: 9999px;
  background: #0066ff;
  box-shadow: 0 2px 8px rgba(0, 102, 255, 0.28);
}
</style>
