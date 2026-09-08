<!-- GOAL-02 금액 프리셋 카드: 이름표 있는 프리셋 버튼(예: 스몰 웨딩/일반) + 직접입력 -->
<template>
  <div class="w-full rounded-3xl border border-accent/50 bg-accent-light/70 p-5 shadow-sm sm:p-8">
    <p class="text-base font-bold text-gray-900">{{ label }}</p>

    <div class="mt-4 grid grid-cols-3 gap-2">
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        class="rounded-xl border px-2 py-3 text-center shadow-sm transition-all"
        :class="
          mode === 'preset' && modelValue === preset.value
            ? 'border-[#0066FF] bg-[#EBF3FF] text-[#0066FF] font-bold'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        "
        @click="selectPreset(preset)"
      >
        <span class="block text-sm font-semibold">{{ preset.title }}</span>
        <span
          class="mt-0.5 block text-xs"
          :class="
            mode === 'preset' && modelValue === preset.value ? 'text-white/90' : 'text-gray-400'
          "
        >
          {{ formatKRWCompact(preset.value) }}
        </span>
      </button>

      <button
        type="button"
        class="rounded-xl border px-2 py-3 text-center text-sm font-semibold shadow-sm transition-all"
        :class="
          mode === 'custom'
            ? 'border-primary bg-primary text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        "
        @click="selectCustom"
      >
        직접 입력
      </button>
    </div>

    <div v-if="mode === 'custom'" class="relative mt-4">
      <input
        type="text"
        inputmode="numeric"
        class="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-5 pr-14 text-2xl font-bold text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        :value="formattedValue"
        @input="handleInput"
      />
      <span
        class="absolute inset-y-0 right-5 flex items-center text-base font-medium text-gray-400"
      >
        원
      </span>
    </div>
    <p v-else class="mt-4 text-xs font-semibold text-primary">
      = {{ formatKRWCompact(modelValue) }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatKoreanNumber, formatKRWCompact } from '@/shared/lib/money'

/**
 * @typedef {Object} NamedAmountPreset
 * @property {string} key
 * @property {string} title 프리셋 이름 (예: '스몰 웨딩')
 * @property {number} value
 */

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Number, required: true },
  /** @type {import('vue').PropType<NamedAmountPreset[]>} */
  presets: { type: Array, required: true },
})
const emit = defineEmits(['update:modelValue'])

const mode = ref(
  props.presets.some((preset) => preset.value === props.modelValue) ? 'preset' : 'custom'
)

function selectPreset(preset) {
  mode.value = 'preset'
  emit('update:modelValue', preset.value)
}

function selectCustom() {
  mode.value = 'custom'
}

const formattedValue = computed(() => formatKoreanNumber(props.modelValue))

function handleInput(event) {
  const digitsOnly = event.target.value.replace(/[^0-9]/g, '')
  emit('update:modelValue', digitsOnly ? Number(digitsOnly) : 0)
}
</script>
