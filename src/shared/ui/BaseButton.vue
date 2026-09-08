<!-- 공용 버튼 컴포넌트 -->
<template>
  <button
    :type="type"
    class="rounded-2xl bg-primary font-semibold text-white transition-colors disabled:bg-gray-300 disabled:text-gray-500"
    :class="[sizeClass, fullWidth ? 'w-full' : '']"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const SIZE_CLASS = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
}

const props = defineProps({
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
})
const emit = defineEmits(['click'])

const sizeClass = computed(() => SIZE_CLASS[props.size] ?? SIZE_CLASS.md)
</script>
