<template>
  <button
    type="button"
    class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="modelValue ? 'bg-primary' : 'bg-slate-200'"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
      :class="modelValue ? 'translate-x-5' : ''"
    />
  </button>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>
