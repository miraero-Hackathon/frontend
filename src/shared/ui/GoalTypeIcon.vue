<!-- /goal/select를 기준으로 한 목표 유형 공통 SVG -->
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    :class="sizeClass"
    aria-hidden="true"
  >
    <template v-if="normalizedType === 'INDEPENDENCE'">
      <path fill="currentColor" d="M2.8 10.3 10.8 3a1.8 1.8 0 0 1 2.4 0l8 7.3c1 .9.4 2.5-1 2.5H19V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7.2H4c-1.5 0-2.1-1.7-1.2-2.5Z" />
      <path fill="#fff" fill-opacity=".72" d="M9.2 14.2a1.2 1.2 0 0 1 1.2-1.2h3.2a1.2 1.2 0 0 1 1.2 1.2V22H9.2v-7.8Z" />
    </template>
    <template v-else-if="normalizedType === 'EMERGENCY'">
      <rect x="2" y="5" width="20" height="15" rx="4" fill="currentColor" />
      <path fill="#fff" fill-opacity=".55" d="M2 8.5h20v3H2z" />
      <circle cx="17.5" cy="15.5" r="2" fill="#fff" fill-opacity=".82" />
      <path d="M17.5 13.9v3.2M16.4 14.5h1.6a.7.7 0 0 1 0 1.4h-1a.7.7 0 0 0 0 1.4h1.6" stroke="currentColor" stroke-width=".9" stroke-linecap="round" />
    </template>
    <template v-else-if="normalizedType === 'MARRIAGE'">
      <path fill="currentColor" d="M12 21 4.1 13.5A5.5 5.5 0 0 1 12 5.8a5.5 5.5 0 0 1 7.9 7.7L12 21Z" />
      <path fill="#fff" fill-opacity=".68" d="m12 5.8 2.2-3.5h3.3l2.1 3.5-3.8 4.1L12 5.8Z" />
      <circle cx="12" cy="12.2" r="3.2" stroke="#fff" stroke-opacity=".72" stroke-width="1.6" />
    </template>
    <template v-else-if="normalizedType === 'STUDENT_LOAN'">
      <path fill="currentColor" d="m12 3 10.5 5.5L12 14 1.5 8.5 12 3Z" />
      <path fill="currentColor" fill-opacity=".7" d="M5 11.4 12 15l7-3.6v5.2c-1.8 2.2-4.1 3.4-7 3.4s-5.2-1.2-7-3.4v-5.2Z" />
      <path d="M21 9v7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="21" cy="17.5" r="1.5" fill="currentColor" />
    </template>
    <circle v-else cx="12" cy="12" r="9" fill="currentColor" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const TYPE_ALIASES = {
  WEDDING: 'MARRIAGE',
  LOAN: 'STUDENT_LOAN',
  HOUSE: 'INDEPENDENCE',
  HOME: 'INDEPENDENCE',
  UMBRELLA: 'EMERGENCY',
  RING: 'MARRIAGE',
  CAP: 'STUDENT_LOAN',
  '🏠': 'INDEPENDENCE',
  '☂️': 'EMERGENCY',
  '💍': 'MARRIAGE',
  '🎓': 'STUDENT_LOAN',
}

const props = defineProps({
  goalType: { type: String, default: '' },
  size: { type: String, default: 'md' },
})
const normalizedType = computed(() => {
  const value = props.goalType.toUpperCase()
  return TYPE_ALIASES[value] || TYPE_ALIASES[props.goalType] || value
})
const sizeClass = computed(
  () => ({ sm: 'size-4', md: 'size-5', lg: 'size-6', xl: 'size-8' })[props.size] || 'size-5'
)
</script>
