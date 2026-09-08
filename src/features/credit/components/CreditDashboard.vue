<template>
  <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
    <!-- 상단 3개 카드 영역 -->
    <CreditSummaryCards
      :credit-score="creditSummary.score"
      :score-percentile="scorePercentile"
      :monthly-change="creditSummary.monthlyChange"
      :target-score="950"
      @open-history="handleOpenHistory"
    />

    <!-- 하단 3개 탭 시뮬레이터 / 가이드 영역 -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- 탭 선택 헤더 -->
      <div class="flex border-b border-gray-100 bg-gray-50/50 p-1.5">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-150',
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50'
              : 'text-gray-400 hover:text-gray-600',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="p-6">
        <!-- TAB 1: 신용 점수대별 금융 혜택 -->
        <div v-if="activeTab === 'BENEFITS'" class="space-y-4">
          <p class="text-xs text-gray-400">점수 구간별 대출 금리 및 금융 우대 혜택 현황입니다.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in benefitRanges"
              :key="item.id"
              :class="[
                'p-4 rounded-xl border transition-all',
                item.isUserRange
                  ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                  : 'border-gray-100 bg-white',
              ]"
            >
              <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-gray-900">{{ item.label }}</span>
                <span
                  v-if="item.isUserRange"
                  class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-medium"
                >
                  내 구간
                </span>
              </div>
              <div class="text-xs text-gray-600 space-y-1.5">
                <div>
                  • 평균 대출 금리: <span class="font-bold text-gray-800">{{ item.avgRate }}</span>
                </div>
                <div>• DSR 한도: {{ item.dsrLimit }}</div>
                <div>• 카드 발급: {{ item.cardIssuance }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: 가점 항목 -->
        <div v-if="activeTab === 'POSITIVE'" class="space-y-3">
          <p class="text-xs text-gray-400">신용 평가 시 긍정적 반영 비율 및 중요 요소입니다.</p>
          <div
            v-for="item in positiveItems"
            :key="item.id"
            class="p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-all space-y-2"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 text-sm">{{ item.name }}</span>
                <span class="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  {{ item.actionText }}
                </span>
              </div>
              <span class="text-xs text-amber-500 font-bold">영향도 {{ item.impactStars }}</span>
            </div>
            <p class="text-xs text-gray-500">{{ item.description }}</p>
            <div class="flex gap-4 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
              <span
                >NICE 비중: <strong class="text-gray-700">{{ item.niceWeight }}</strong></span
              >
              <span
                >KCB 비중: <strong class="text-gray-700">{{ item.kcbWeight }}</strong></span
              >
            </div>
          </div>
        </div>

        <!-- TAB 3: 감점 항목 -->
        <div v-if="activeTab === 'NEGATIVE'" class="space-y-3">
          <p class="text-xs text-gray-400">
            신용 점수 하락에 직접적인 영향을 주는 주요 요인입니다.
          </p>
          <div
            v-for="item in negativeItems"
            :key="item.id"
            class="p-4 border border-rose-100 bg-rose-50/10 rounded-xl space-y-2"
          >
            <div class="flex justify-between items-center">
              <span class="font-bold text-rose-900 text-sm">{{ item.name }}</span>
              <span class="text-xs text-rose-500 font-bold">위험도 {{ item.riskLevel }}</span>
            </div>
            <p class="text-xs text-gray-600">{{ item.description }}</p>
            <div class="text-xs text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg inline-block">
              💡 {{ item.tip }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'
import { useCreditSimulator, useCreditSummary } from '../composables/useCreditSimulator'
import CreditSummaryCards from './CreditSummaryCards.vue'

const props = defineProps({
  creditSummary: {
    type: Object,
    default: () => ({ score: 896, monthlyChange: 15 }),
  },
  scorePercentile: {
    type: Number,
    default: 20,
  },
})

const creditSummaryRef = toRef(props, 'creditSummary')

const { currentScore, scoreChangeHighlightText, scoreChangeDescription, scoreChangeTone } =
  useCreditSummary(creditSummaryRef)

const { activeTab, tabs, benefitRanges, positiveItems, negativeItems } =
  useCreditSimulator(currentScore)

function handleOpenHistory() {
  console.log('신용점수 이력 모달 열기')
}
</script>
