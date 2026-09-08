<!-- 청년정책 카테고리별 2D 라인 SVG 아이콘 및 컬러 스퀘어클 배지 컴포넌트 -->
<template>
  <span
    class="inline-flex shrink-0 items-center justify-center select-none transition-all duration-200"
    :class="[
      sizeClasses.container,
      showBackground ? meta.bgClass : '',
      customClass,
    ]"
    :style="showBackground ? { color: meta.color } : { color: 'currentColor' }"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="sizeClasses.icon"
    >
      <!-- 1. 주거 / 공공임대주택 -->
      <template v-if="categoryKey === 'PUBLIC_RENTAL_HOUSING' || categoryKey === 'HOUSING_SUPPORT' || categoryKey === 'HOUSING'">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
        <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
      </template>

      <!-- 2. 대출 -->
      <template v-else-if="categoryKey === 'LOAN'">
        <path d="M3 9 12 4l9 5" />
        <path d="M5 9v8M9 9v8M15 9v8M19 9v8" />
        <path d="M3 20h18" />
      </template>

      <!-- 3. 보조금 / 지원금 -->
      <template v-else-if="categoryKey === 'SUBSIDY'">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </template>

      <!-- 4. 바우처 / 이용권 -->
      <template v-else-if="categoryKey === 'VOUCHER'">
        <path d="M2 9a3 3 0 0 1 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2M13 11v2M13 17v2" />
      </template>

      <!-- 5. 금리혜택 / 저축 -->
      <template v-else-if="categoryKey === 'INTEREST_BENEFIT'">
        <path d="M19 5 5 19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </template>

      <!-- 6. 신용회복 -->
      <template v-else-if="categoryKey === 'CREDIT_RECOVERY'">
        <path d="M12 3 4 7v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V7Z" />
        <path d="m9 12 2 2 4-4" />
      </template>

      <!-- 7. 전체 -->
      <template v-else-if="categoryKey === 'ALL'">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </template>

      <!-- 8. 기본 정책 아이콘 (문서/체크) -->
      <template v-else>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </template>
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const CATEGORY_META = {
  ALL: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  LOAN: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  SUBSIDY: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  VOUCHER: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  INTEREST_BENEFIT: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  CREDIT_RECOVERY: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  PUBLIC_RENTAL_HOUSING: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  HOUSING_SUPPORT: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  HOUSING: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
  DEFAULT: { color: '#0066FF', bgClass: 'bg-[#EEF5FF]' },
}

const props = defineProps({
  category: { type: String, default: '' },
  keyword: { type: String, default: '' },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // 'xs' | 'sm' | 'md' | 'lg'
  showBackground: { type: Boolean, default: true },
  customClass: { type: String, default: '' },
})

const categoryKey = computed(() => {
  const cat = String(props.category || '').toUpperCase().trim()
  if (CATEGORY_META[cat]) return cat

  const text = `${props.category} ${props.keyword} ${props.title}`.toLowerCase()
  if (text.includes('임대') || text.includes('행복주택') || text.includes('공공주택')) return 'PUBLIC_RENTAL_HOUSING'
  if (text.includes('주거') || text.includes('월세') || text.includes('전세') || text.includes('보증금') || text.includes('부동산')) return 'HOUSING_SUPPORT'
  if (text.includes('대출') || text.includes('융자') || text.includes('보증') || text.includes('학자금')) return 'LOAN'
  if (text.includes('보조금') || text.includes('지원금') || text.includes('장려금') || text.includes('수당')) return 'SUBSIDY'
  if (text.includes('바우처') || text.includes('이용권') || text.includes('교통') || text.includes('문화') || text.includes('패스')) return 'VOUCHER'
  if (text.includes('금리') || text.includes('적금') || text.includes('저축') || text.includes('통장') || text.includes('도약')) return 'INTEREST_BENEFIT'
  if (text.includes('신용') || text.includes('회복') || text.includes('채무') || text.includes('상환')) return 'CREDIT_RECOVERY'
  if (text.includes('전체') || cat === 'ALL') return 'ALL'
  return 'DEFAULT'
})

const meta = computed(() => CATEGORY_META[categoryKey.value] || CATEGORY_META.DEFAULT)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return { container: 'size-5 rounded-md', icon: 'size-3.5' }
    case 'sm':
      return { container: 'size-6 rounded-lg', icon: 'size-3.5' }
    case 'lg':
      return { container: 'size-11 sm:size-12 rounded-2xl', icon: 'size-6 sm:size-7' }
    case 'md':
    default:
      return { container: 'size-8 rounded-xl sm:size-9 sm:rounded-[12px]', icon: 'size-4 sm:size-4.5' }
  }
})
</script>
