<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- 카드 1: 이번 달 내 신용 점수 -->
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
          <span class="text-3xl font-extrabold text-gray-900">{{ creditScore }}</span>
          <span class="text-lg font-bold text-gray-900">점</span>
        </div>
        <p class="text-xs text-gray-400 mt-1">상위 {{ scorePercentile }}% (NICE · KCB 기준)</p>
      </div>
    </div>

    <!-- 카드 2: 이번 달 점수 변동 -->
    <div
      class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]"
    >
      <span class="text-sm font-medium text-gray-500">이번 달 점수 변동</span>
      <div>
        <div class="flex items-baseline gap-1">
          <span
            class="text-3xl font-extrabold"
            :class="monthlyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'"
          >
            {{ monthlyChange >= 0 ? `+${monthlyChange}` : monthlyChange }}
          </span>
          <span
            class="text-lg font-bold"
            :class="monthlyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'"
          >
            점
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">
          전월 대비 {{ monthlyChange === 0 ? '변동 없음' : monthlyChange > 0 ? '상승' : '하락' }}
        </p>
      </div>
    </div>

    <!-- 카드 3: 목표 신용 점수 달성 현황 (기존 지출 카드의 목표 달성 현황과 동일한 UI) -->
    <div
      class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]"
    >
      <span class="text-sm font-medium text-gray-500">목표 신용 점수 ({{ targetScore }}점)</span>
      <div>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-extrabold text-gray-900">{{ remainingScore }}</span>
          <span class="text-lg font-bold text-gray-900">점 남음</span>
        </div>
        <!-- 프로그래스 바 -->
        <div class="mt-2">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-400">목표 달성 진행률</span>
            <span class="font-bold text-blue-600">{{ progressPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
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
  creditScore: { type: Number, default: 896 },
  scorePercentile: { type: Number, default: 20 },
  monthlyChange: { type: Number, default: 15 },
  targetScore: { type: Number, default: 950 },
})

defineEmits(['open-history'])

// 남은 점수 계산
const remainingScore = computed(() => Math.max(0, props.targetScore - props.creditScore))

// 달성 진행률 (%)
const progressPercentage = computed(() => {
  if (props.creditScore >= props.targetScore) return 100
  // 예: 600점을 기본 베이스로 잡았을 때의 진행률 계산 (필요시 조정 가능)
  const baseScore = 600
  const currentProgress = props.creditScore - baseScore
  const targetProgress = props.targetScore - baseScore
  if (targetProgress <= 0) return 0

  const percentage = Math.round((currentProgress / targetProgress) * 100)
  return Math.min(Math.max(percentage, 0), 100)
})
</script>
