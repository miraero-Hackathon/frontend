<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <slot name="label" />
      <div class="flex items-center space-x-2">
        <input
          type="number"
          :value="modelValue"
          class="w-20 rounded-lg border border-gray-300 py-2 text-right font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="$emit('update:modelValue', Number($event.target.value))"
        />
        <span class="text-gray-600">{{ unit }}</span>
      </div>
    </div>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  unit: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>
