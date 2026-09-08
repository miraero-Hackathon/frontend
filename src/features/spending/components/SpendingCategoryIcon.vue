<!-- 지출 카테고리 공통 채움형 아이콘: 회색 받침 + 카테고리 컬러 + 흰색 디테일 -->
<template>
  <span
    class="inline-flex shrink-0 select-none items-center justify-center transition-all duration-200"
    :class="[sizeClasses.container, active ? 'ring-2 ring-primary/20 shadow-xs' : '', customClass]"
    :style="{ backgroundColor: customBg || '#F2F4F6', color: accent || palette.color }"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      :class="[sizeClasses.icon, active ? 'scale-105' : '']"
    >
      <template v-if="normalizedId === 'housing'">
        <path fill="currentColor" d="M3 10.4 10.7 3a1.8 1.8 0 0 1 2.6 0l7.7 7.4c.9.9.3 2.5-1 2.5h-.8v7A2.1 2.1 0 0 1 17.1 22H6.9a2.1 2.1 0 0 1-2.1-2.1v-7H4c-1.3 0-1.9-1.6-1-2.5Z" />
        <path fill="#fff" fill-opacity=".78" d="M9.3 15.1c0-.7.5-1.2 1.2-1.2h3c.7 0 1.2.5 1.2 1.2V22H9.3v-6.9Z" />
      </template>
      <template v-else-if="normalizedId === 'telecommunication'">
        <rect x="6" y="1.5" width="12" height="21" rx="3.2" fill="currentColor" />
        <rect x="8" y="4" width="8" height="14" rx="1.5" fill="#fff" fill-opacity=".72" />
        <circle cx="12" cy="20.2" r="1" fill="#fff" />
      </template>
      <template v-else-if="normalizedId === 'insurance'">
        <path fill="currentColor" d="m12 2 8 3.5v5.3c0 5.3-3.2 9.5-8 11.2-4.8-1.7-8-5.9-8-11.2V5.5L12 2Z" />
        <path d="m8.6 12 2.1 2.1 4.8-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </template>
      <template v-else-if="normalizedId === 'subscription'">
        <rect x="2" y="4" width="20" height="16" rx="4" fill="currentColor" />
        <path fill="#fff" d="m10 8.5 6 3.5-6 3.5v-7Z" />
      </template>
      <template v-else-if="normalizedId === 'loanrepayment'">
        <path fill="currentColor" d="m12 2 10 5.2v2.3H2V7.2L12 2ZM3 19h18v3H3v-3Zm1.5-8h3v6.5h-3V11Zm6 0h3v6.5h-3V11Zm6 0h3v6.5h-3V11Z" />
      </template>
      <template v-else-if="normalizedId === 'savings'">
        <path fill="currentColor" d="M4.7 10.2A7.7 7.7 0 0 1 18.6 11H22v5.2h-3.1a7.8 7.8 0 0 1-3.2 2.7V22h-3v-2.2H9V22H6v-3.7a6.9 6.9 0 0 1-1.3-8.1Z" />
        <rect x="9" y="7" width="6" height="1.8" rx=".9" fill="#fff" fill-opacity=".8" />
        <circle cx="16.8" cy="12.3" r="1" fill="#fff" />
      </template>
      <template v-else-if="normalizedId === 'investment'">
        <rect x="3" y="14" width="4" height="7" rx="1.2" fill="currentColor" fill-opacity=".55" />
        <rect x="10" y="10" width="4" height="11" rx="1.2" fill="currentColor" fill-opacity=".75" />
        <rect x="17" y="4" width="4" height="17" rx="1.2" fill="currentColor" />
        <path d="m4.5 11 6-5 4 2 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </template>
      <template v-else-if="normalizedId === 'food'">
        <path fill="currentColor" d="M3 2.5h2v6h1v-6h2v6h1v-6h2v6.2a4 4 0 0 1-3 3.9V22H5V12.6a4 4 0 0 1-3-3.9V2.5h1Z" />
        <path fill="currentColor" d="M17.7 2c2.4 0 4.3 2.5 4.3 5.7 0 2.6-1.2 4.7-3 5.4V22h-3v-8.9c-1.8-.7-3-2.8-3-5.4C13 4.5 15 2 17.7 2Z" />
        <path fill="#fff" fill-opacity=".5" d="M16.2 4.4c.5-.6 1-.9 1.6-.9.5 0 .9.2 1.3.6-1 .4-1.8 1.2-2.2 2.3-.3.8-.4 1.7-.3 2.5-.5-.6-.8-1.5-.8-2.5 0-.8.1-1.5.4-2Z" />
      </template>
      <template v-else-if="normalizedId === 'cafe'">
        <path fill="currentColor" d="M3 7h14.5v2H19a4 4 0 0 1 0 8h-3a7 7 0 0 1-5.5 2.7H10A7 7 0 0 1 3 13V7Zm14.5 4v2c0 .7-.1 1.3-.3 2H19a2 2 0 1 0 0-4h-1.5Z" />
        <path fill="#fff" fill-opacity=".48" d="M5.5 9.2h9.6v3.5a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8V9.2Z" />
        <path d="M7.8 2.3c-1 1-.9 2 0 3M12.5 2.3c-1 1-.9 2 0 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </template>
      <template v-else-if="normalizedId === 'transportation'">
        <rect x="4" y="2" width="16" height="18" rx="4" fill="currentColor" />
        <rect x="6.5" y="5" width="11" height="6" rx="1.5" fill="#fff" fill-opacity=".75" />
        <circle cx="8" cy="16" r="1.4" fill="#fff" /><circle cx="16" cy="16" r="1.4" fill="#fff" />
        <path d="M7 20v2M17 20v2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </template>
      <template v-else-if="normalizedId === 'shopping'">
        <path fill="currentColor" d="M3.5 7.5h17L19.2 22H4.8L3.5 7.5Z" />
        <path fill="currentColor" fill-opacity=".62" d="M7.5 7.5V6a4.5 4.5 0 0 1 9 0v1.5h-2.7V6a1.8 1.8 0 1 0-3.6 0v1.5H7.5Z" />
        <path d="M9 12.2c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5" stroke="#fff" stroke-opacity=".72" stroke-width="1.8" stroke-linecap="round" />
      </template>
      <template v-else-if="normalizedId === 'culture'">
        <path fill="currentColor" d="M3 8h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm1-6h17v4.5H4V2Z" />
        <path fill="#fff" fill-opacity=".82" d="m10 11 5.5 3.5L10 18v-7Z" />
        <path d="m8.5 2-3 4.5M15.5 2l-3 4.5" stroke="#fff" stroke-opacity=".65" stroke-width="1.5" />
      </template>
      <template v-else-if="normalizedId === 'medical'">
        <path fill="currentColor" d="M9.5 2h5v6.5H21v5h-6.5V20h-5v-6.5H3v-5h6.5V2Z" />
        <path fill="currentColor" fill-opacity=".6" d="M15.8 15.7a3.7 3.7 0 0 1 5.2 5.2 3.7 3.7 0 0 1-5.2-5.2Z" />
        <path d="m17.1 19.6 2.5-2.5" stroke="#fff" stroke-opacity=".78" stroke-width="1.4" stroke-linecap="round" />
      </template>
      <template v-else>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
        <circle cx="7" cy="12" r="1.7" fill="#fff" />
        <circle cx="12" cy="12" r="1.7" fill="#fff" />
        <circle cx="17" cy="12" r="1.7" fill="#fff" />
      </template>
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const CATEGORY_PALETTE = {
  housing: { color: '#3D8BFF', soft: '#EEF5FF' },
  telecommunication: { color: '#0EA5E9', soft: '#F0F9FF' },
  insurance: { color: '#6366F1', soft: '#EEF2FF' },
  subscription: { color: '#8B5CF6', soft: '#F5F3FF' },
  loanrepayment: { color: '#64748B', soft: '#F1F5F9' },
  savings: { color: '#10B981', soft: '#ECFDF5' },
  investment: { color: '#14B8A6', soft: '#F0FDFA' },
  food: { color: '#FF6B6B', soft: '#FFF1F2' },
  cafe: { color: '#F59E0B', soft: '#FFF7E8' },
  transportation: { color: '#3B82F6', soft: '#EFF6FF' },
  shopping: { color: '#EC4899', soft: '#FDF2F8' },
  culture: { color: '#A855F7', soft: '#FAF5FF' },
  medical: { color: '#EF4444', soft: '#FEF2F2' },
  other: { color: '#64748B', soft: '#F1F5F9' },
}

const props = defineProps({
  icon: { type: String, default: '' },
  categoryId: { type: String, default: '' },
  accent: { type: String, default: '' },
  size: { type: String, default: 'md' },
  active: { type: Boolean, default: false },
  customBg: { type: String, default: '' },
  customClass: { type: String, default: '' },
})

const normalizedId = computed(() => (props.categoryId || '').toLowerCase().replace(/[-_]/g, ''))
const palette = computed(() => CATEGORY_PALETTE[normalizedId.value] || CATEGORY_PALETTE.other)
const sizeClasses = computed(() => {
  if (props.size === 'sm')
    return {
      container: 'size-7 rounded-[10px] sm:size-8 sm:rounded-xl',
      icon: 'size-4 sm:size-[18px]',
    }
  if (props.size === 'lg')
    return { container: 'size-11 rounded-2xl sm:size-12', icon: 'size-6 sm:size-7' }
  if (props.size === 'xl') return { container: 'size-14 rounded-2xl', icon: 'size-8' }
  return { container: 'size-9 rounded-xl sm:size-10 sm:rounded-[14px]', icon: 'size-5 sm:size-6' }
})
</script>
