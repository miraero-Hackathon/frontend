<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- 카드 1: 내 신용 점수 -->
    <div
      class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]"
    >
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-500">내 신용 점수</span>
        <button
          @click="$emit('open-history')"
          class="text-xs text-blue-600 hover:underline font-medium"
        >
          내역 보기 &rsaquo;
        </button>
      </div>
      <div>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-extrabold text-gray-900">{{ currentScore }}</span>
          <span class="text-lg font-bold text-gray-900">점</span>
        </div>
        <p class="text-xs text-gray-400 mt-1">NICE · KCB 기준</p>
      </div>
    </div>

    <!-- 카드 2: 최근 6개월 점수 변동 -->
    <div
      class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]"
    >
      <span class="text-sm font-medium text-gray-500">최근 6개월 점수 변동</span>
      <div>
        <div class="flex items-baseline gap-1">
          <span
            class="text-3xl font-extrabold"
            :class="{
              'text-emerald-500': scoreChangeTone === 'positive',
              'text-rose-500': scoreChangeTone === 'coral',
              'text-gray-900': scoreChangeTone === 'default',
            }"
          >
            {{ scoreChangeHighlightText }}
          </span>
          <span
            class="text-lg font-bold"
            :class="{
              'text-emerald-500': scoreChangeTone === 'positive',
              'text-rose-500': scoreChangeTone === 'coral',
              'text-gray-900': scoreChangeTone === 'default',
            }"
          >
            점
          </span>
        </div>
        <!-- 예: "2026.03.01 이후 변동 합계" 출력 -->
        <p class="text-xs text-gray-400 mt-1">{{ scoreChangeDescription }}</p>
      </div>
    </div>

    <!-- 카드 3: 대출 상환 및 신용 관리 페이스 (목표 미러링) -->
    <div
      class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]"
    >
      <!-- 헤더 & 페이스 상태 -->
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-500">
          {{ goalData?.goalName ? `${goalData.goalName} 상환` : '대출 상환' }}
        </span>
        <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', paceBadge.style]">
          {{ paceBadge.label }}
        </span>
      </div>

      <!-- 금액 & 프로그래스 바 -->
      <div>
        <!-- 1. 지금까지 상환한 금액 (currentAmount) -->
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-extrabold text-gray-900">
            {{ formatCurrency(goalData?.currentAmount || 0) }}
          </span>
          <span class="text-lg font-bold text-gray-900">원 상환</span>
        </div>

        <div class="mt-2">
          <div class="flex justify-between text-xs mb-1">
            <!-- 2. 최종 목표 상환 금액 (goalAmount) -->
            <span class="text-gray-400">
              대출 원금 {{ formatCurrency(goalData?.goalAmount || 0) }}원 중
            </span>
            <!-- 3. 상환 진행률 % (progressRate) -->
            <span class="font-bold text-blue-600">
              {{ (goalData?.progressRate ?? 0).toFixed(1) }}% 상환
            </span>
          </div>

          <!-- 프로그래스 바 -->
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(goalData?.progressRate || 0, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentScore: { type: Number, required: true },
  scoreChangeHighlightText: { type: String, required: true },
  scoreChangeDescription: { type: String, required: true },
  scoreChangeTone: { type: String, required: true },
  targetScore: { type: Number, default: 900 },
  goalData: {
    type: Object,
    default: () => ({
      goalName: '대출',
      goalAmount: 10000000,
      currentAmount: 0,
      progressRate: 0,
      pace: { paceStatus: 'ON_TRACK' },
    }),
  },
})

defineEmits(['open-history'])

// 금액 한글 단위 포맷팅 함수 (예: 10,000,000 -> 1,000만)
function formatCurrency(value) {
  if (!value) return '0'

  if (value >= 10000) {
    const uk = Math.floor(value / 100000000)
    const man = Math.floor((value % 100000000) / 10000)

    let result = ''
    if (uk > 0) result += `${uk}억 `
    if (man > 0) result += `${man.toLocaleString()}만`
    return result.trim() || '0'
  }

  return value.toLocaleString()
}

// paceStatus에 따른 배지 스타일 매핑 (ON_TRACK, AHEAD, BEHIND)
const paceBadge = computed(() => {
  const status = props.goalData?.pace?.paceStatus || 'ON_TRACK'

  switch (status) {
    case 'AHEAD':
      return { label: '빠른 페이스', style: 'text-emerald-600 bg-emerald-50' }
    case 'ON_TRACK':
      return { label: '안정적 페이스', style: 'text-emerald-600 bg-emerald-50' }
    case 'BEHIND':
      return { label: '지연 페이스', style: 'text-rose-500 bg-rose-50' }
    default:
      return { label: '진행 중', style: 'text-gray-600 bg-gray-100' }
  }
})
</script>
