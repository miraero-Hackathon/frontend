<!-- 목표설정 퍼널(GOAL-02) 공용 기간 슬라이더 카드: 개월 수 슬라이더 + 계산 결과 박스 -->
<template>
  <div class="w-full rounded-3xl border border-accent/50 bg-accent-light/70 p-5 shadow-sm sm:p-8">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-base font-bold text-gray-900">{{ label }}</p>
        <p v-if="caption" class="mt-0.5 text-xs text-gray-400">{{ caption }}</p>
      </div>
      <span v-if="!presets.length" class="shrink-0 text-base font-bold text-primary">
        {{ modelValue }}개월
      </span>
    </div>

    <div v-if="presets.length" class="mt-4 grid grid-cols-4 gap-2 w-full">
      <button
        v-for="preset in presets"
        :key="preset.value"
        type="button"
        class="w-full whitespace-nowrap rounded-full border px-4 py-2.5 text-center text-xs font-semibold transition-all shadow-sm"
        :class="
          modelValue === preset.value
            ? 'border-[#0066FF] bg-[#EBF3FF] text-[#0066FF] font-bold'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        "
        @click="emit('update:modelValue', preset.value)"
      >
        {{ preset.label }}
      </button>
    </div>

    <div class="mt-5">
      <div v-if="presets.length" class="flex items-center justify-between">
        <p class="text-xs font-medium text-gray-500">세부 조정</p>
        <span class="text-xs font-bold text-primary">{{ modelValue }}개월</span>
      </div>
      <div class="relative mt-2 h-2 w-full">
        <div class="absolute inset-0 rounded-full bg-gray-200" />
        <div
          class="absolute inset-y-0 left-0 rounded-full bg-primary"
          :style="{ width: percent + '%' }"
        />
        <input
          type="range"
          :min="min"
          :max="max"
          :value="modelValue"
          class="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
          @input="emit('update:modelValue', Number($event.target.value))"
        />
      </div>
      <div class="mt-2 flex justify-between text-xs font-medium text-gray-400">
        <span>{{ min }}개월</span>
        <span>{{ max }}개월</span>
      </div>
    </div>

    <div class="mt-5 rounded-2xl border border-accent bg-white p-5 shadow-sm">
      <div>
        <p class="text-xs font-medium text-gray-500">{{ resultLabel }}</p>
        <p class="mt-1 text-2xl font-bold text-primary">{{ resultValue }}</p>
        <p v-if="resultCaption" class="mt-0.5 text-xs text-gray-400">{{ resultCaption }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * @typedef {Object} PeriodPreset
 * @property {string} label 칩에 표시할 문구 (예: '1년')
 * @property {number} value 클릭 시 설정될 개월 수
 */

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 6 },
  max: { type: Number, default: 60 },
  caption: { type: String, default: '' },
  resultLabel: { type: String, required: true },
  resultValue: { type: String, required: true },
  resultCaption: { type: String, default: '' },
  /** @type {import('vue').PropType<PeriodPreset[]>} */
  presets: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const percent = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, ((props.modelValue - props.min) / range) * 100))
})
</script>
