<!-- 앱 전역 기능 아이콘: 24px 좌표계, 2px 라인 스타일 -->
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="sizeClass"
    aria-hidden="true"
  >
    <template v-if="iconName === 'home'">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </template>
    <template v-else-if="iconName === 'umbrella'">
      <path d="M4 12a8 8 0 0 1 16 0H4Z" />
      <path d="M12 4v14a3 3 0 0 0 6 0" />
    </template>
    <template v-else-if="iconName === 'ring'">
      <circle cx="12" cy="14" r="7" />
      <path d="m9 5 3-3 3 3-3 3-3-3Z" />
    </template>
    <template v-else-if="iconName === 'cap'">
      <path d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12v4c3 2 7 2 10 0v-4M21 9v6" />
    </template>
    <template v-else-if="iconName === 'lightbulb'">
      <path d="M9 18h6M10 22h4M8.5 15.5A7 7 0 1 1 15.5 15.5L14 17h-4l-1.5-1.5Z" />
    </template>
    <template v-else-if="iconName === 'money'">
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M7 10h.01M17 15h.01M9 12.5h6" />
    </template>
    <template v-else-if="iconName === 'lock'">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </template>
    <template v-else-if="iconName === 'chart'">
      <path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-6" />
      <path d="M15 7h4v4" />
    </template>
    <template v-else-if="iconName === 'target'">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="m14 10 6-6M16 4h4v4" />
    </template>
    <template v-else-if="iconName === 'bank'">
      <path d="m3 9 9-5 9 5M5 10v7M9 10v7M15 10v7M19 10v7M3 20h18" />
    </template>
    <template v-else-if="iconName === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </template>
    <template v-else-if="iconName === 'scissors'">
      <circle cx="6" cy="7" r="3" />
      <circle cx="6" cy="17" r="3" />
      <path d="m8.5 8.5 11 7M8.5 15.5l11-7" />
    </template>
    <template v-else-if="iconName === 'fire'">
      <path d="M12 22c4 0 7-3 7-7 0-3-2-6-5-9 0 3-1 4-2 5-1-3-3-5-5-7 1 5-2 7-2 11 0 4 3 7 7 7Z" />
      <path d="M9 17c0 2 1 3 3 3s3-1 3-3c0-1-1-3-3-4 0 2-3 2-3 4Z" />
    </template>
    <template v-else-if="iconName === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"
      />
    </template>
    <template v-else-if="iconName === 'bell'">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </template>
    <template v-else-if="iconName === 'message'">
      <path d="M6 5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1v2l-3-2H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const ALIASES = {
  '🏠': 'home',
  '☂️': 'umbrella',
  '💍': 'ring',
  '🎓': 'cap',
  '💡': 'lightbulb',
  '💰': 'money',
  '💸': 'money',
  '🔒': 'lock',
  '📊': 'chart',
  '📈': 'chart',
  '🎯': 'target',
  '🏦': 'bank',
  '📅': 'calendar',
  '✂️': 'scissors',
  '🔥': 'fire',
  '☀️': 'sun',
  '🔔': 'bell',
}

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: String, default: 'md' },
  strokeWidth: { type: [Number, String], default: 2 },
})
const iconName = computed(() => ALIASES[props.name] || props.name || 'check')
const sizeClass = computed(
  () => ({ sm: 'size-4', md: 'size-5', lg: 'size-6', xl: 'size-8' })[props.size] || 'size-5'
)
</script>
