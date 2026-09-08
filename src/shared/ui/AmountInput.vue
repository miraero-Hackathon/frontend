<template>
  <div class="relative">
    <input
      type="text"
      :value="formattedValue"
      class="w-full rounded-xl border border-gray-300 py-4 pl-4 pr-12 text-right text-lg font-semibold transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      placeholder="0"
      @input="handleInput"
    />
    <span class="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">원</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])

const formattedValue = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) return ''
  return props.modelValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

const handleInput = (e) => {
  const value = e.target.value.replace(/,/g, '')
  if (value === '' || /^\d+$/.test(value)) {
    emit('update:modelValue', value === '' ? 0 : Number(value))
  }
}
</script>
