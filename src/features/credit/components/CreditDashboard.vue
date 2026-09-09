<template>
  <!-- 반응형 컨테이너: 데스크톱 max-w-6xl, 모바일 px-3.5 -->
  <div
    class="page-container py-4 sm:py-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto px-3.5 sm:px-6 bg-slate-50/50 min-h-screen"
  >
    <!-- 1. 상단 Summary Cards 영역 -->
    <section>
      <CreditSummaryCards
        :current-score="currentScore"
        :score-change-highlight-text="scoreChangeHighlightText"
        :score-change-description="scoreChangeDescription"
        :score-change-tone="scoreChangeTone"
        :target-score="900"
        :goal-data="goalData"
        @open-history="$emit('open-history')"
      />
    </section>

    <!-- 2. 신용 관리 시뮬레이터 & 정보 영역 -->
    <section
      class="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-8 space-y-5 sm:space-y-6"
    >
      <!-- 섹션 헤더 -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 sm:pb-5"
      >
        <div>
          <h3 class="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            신용점수 올리기 시뮬레이터
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            점수대별 우대 혜택과 맞춤형 가감점 요인을 확인해보세요.
          </p>
        </div>
      </div>

      <!-- 세그먼트 컨트롤 스타일 탭 (Toss / iOS 스타일) -->
      <div class="bg-slate-100/80 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-200 ease-out select-none text-center truncate',
            activeTab === tab.id
              ? 'bg-white text-primary shadow-xs ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50',
          ]"
        >
          <!-- 반응형 라벨: 모바일 축약어 / 데스크톱 전체 명칭 -->
          <span class="inline sm:hidden">{{ getShortTabLabel(tab.id) }}</span>
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </button>
      </div>

      <!-- 탭 1: 점수대별 금융 혜택 -->
      <div
        v-if="activeTab === 'BENEFITS'"
        class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-1 sm:pt-2"
      >
        <div
          v-for="item in benefitRanges"
          :key="item.id"
          :class="[
            'p-4 sm:p-6 rounded-2xl border transition-all space-y-3.5 sm:space-y-4',
            item.isUserRange
              ? 'border-primary/50 bg-gradient-to-br from-blue-50/50 via-white to-white ring-2 ring-primary/20 shadow-md'
              : 'border-slate-100 bg-white hover:border-slate-200',
          ]"
        >
          <!-- 카드 타이틀 영역 -->
          <div class="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-bold text-primary bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {{ item.tier }}
                </span>
                <span
                  v-if="item.isUserRange"
                  class="text-[11px] font-bold bg-primary text-white px-2.5 py-0.5 rounded-full"
                >
                  내 구간
                </span>
              </div>
              <h4 class="text-base sm:text-lg font-bold text-slate-900 mt-1.5">{{ item.label }}</h4>
              <p v-if="item.niceRange" class="text-xs text-slate-400 mt-0.5">
                {{ item.niceRange }}
              </p>
            </div>
          </div>

          <!-- 핵심 요약 지표 -->
          <div
            class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100/60"
          >
            <div>
              <span class="text-slate-400 block text-[11px] sm:text-xs mb-0.5">평균 대출 금리</span>
              <strong class="text-slate-900 text-xs sm:text-sm font-bold block">{{
                item.avgRate
              }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px] sm:text-xs mb-0.5">신용카드 발급</span>
              <strong
                class="text-slate-900 text-xs sm:text-sm font-semibold block leading-tight break-keep"
              >
                <span class="inline sm:hidden">{{
                  formatCardIssuanceMobile(item.cardIssuance)
                }}</span>
                <span class="hidden sm:inline">{{ item.cardIssuance }}</span>
              </strong>
            </div>
          </div>

          <!-- 혜택 & 제약 상세 -->
          <div class="space-y-2.5 text-xs sm:text-sm pt-1">
            <div>
              <span
                class="font-bold text-emerald-600 text-xs sm:text-sm flex items-center gap-1 mb-1"
              >
                <span>✓</span> 주요 혜택 & 특징
              </span>
              <ul class="space-y-1 text-slate-600 pl-0.5">
                <li
                  v-for="(b, idx) in item.benefits"
                  :key="idx"
                  class="flex items-start gap-1.5 leading-relaxed text-xs sm:text-sm"
                >
                  <span class="text-emerald-500 font-bold shrink-0">•</span>
                  <span class="flex-1">{{ b }}</span>
                </li>
              </ul>
            </div>

            <div class="pt-2 border-t border-slate-100">
              <span class="font-bold text-rose-500 text-xs sm:text-sm flex items-center gap-1 mb-1">
                <span>!</span> 유의사항 & 제약
              </span>
              <ul class="space-y-1 text-slate-500 pl-0.5">
                <li
                  v-for="(d, idx) in item.drawbacks"
                  :key="idx"
                  class="flex items-start gap-1.5 leading-relaxed text-xs sm:text-sm"
                >
                  <span class="text-rose-400 font-bold shrink-0">•</span>
                  <span class="flex-1">{{ d }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 탭 2: 신용 가점 항목 -->
      <div v-if="activeTab === 'POSITIVE'" class="space-y-3 pt-1 sm:pt-2">
        <div
          v-for="item in positiveItems"
          :key="item.id"
          class="p-4 sm:p-5 border border-blue-300 rounded-2xl bg-blue-100/30 hover:border-blue-200 transition-all duration-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4"
        >
          <div class="space-y-2.5 flex-1 min-w-0">
            <div class="flex justify-between items-center flex-wrap gap-2">
              <span
                class="font-bold text-blue-950 text-sm sm:text-base flex items-center gap-2 min-w-0"
              >
                <!-- 가점 파란색 점 -->
                <span class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                {{ item.name }}
              </span>

              <!-- 가점 점수 뱃지 -->
              <span
                class="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md shrink-0 ml-auto"
              >
                {{ item.actionText }}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {{ item.description }}
            </p>
          </div>

          <!-- 평가 반영 비중 영역 -->
          <div
            class="border-t md:border-t-0 pt-3 md:pt-0 border-blue-100 shrink-0 text-left md:text-right"
          >
            <div class="text-[11px] sm:text-xs text-slate-400 mb-0.5">평가 반영 비중</div>

            <div class="text-xs sm:text-sm font-medium text-slate-700 leading-tight space-y-0.5">
              <div>NICE {{ item.niceWeight }}</div>
              <div>KCB {{ item.kcbWeight }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 탭 3: 신용 감점 유의사항 -->
      <div v-if="activeTab === 'NEGATIVE'" class="space-y-3 pt-1 sm:pt-2">
        <div
          v-for="item in negativeItems"
          :key="item.id"
          class="p-4 sm:p-5 border border-rose-300 bg-rose-100/30 rounded-2xl space-y-2.5 transition-all duration-200"
        >
          <div class="flex justify-between items-center gap-2">
            <span
              class="font-bold text-rose-950 text-sm sm:text-base flex items-center gap-2 min-w-0"
            >
              <!-- 감점 빨간색 점 -->
              <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>

              <span class="truncate">{{ item.name }}</span>
            </span>

            <!-- 모바일에서도 오른쪽 끝 -->
            <span
              v-if="item.actionText"
              class="text-xs font-bold text-rose-600 bg-rose-100/80 border border-rose-200 px-2.5 py-0.5 rounded-md shrink-0 ml-auto"
            >
              {{ item.actionText }}
            </span>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {{ item.description }}
          </p>

          <div
            class="text-xs sm:text-sm font-medium text-rose-800 bg-white/90 border border-rose-100 p-3 rounded-xl flex items-start sm:items-center gap-2 shadow-2xs"
          >
            <span class="text-sm shrink-0">💡</span>
            <span class="leading-relaxed">{{ item.tip }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CreditSummaryCards from './CreditSummaryCards.vue'
import { useCreditSimulator, useCreditSummary } from '../composables/useCreditSimulator'

const props = defineProps({
  currentScore: { type: Number, required: true },
  historyList: { type: Array, default: () => [] },
  goalData: { type: Object, default: () => null },
})

defineEmits(['open-history'])

const currentScoreRef = computed(() => props.currentScore)
const historyListRef = computed(() => props.historyList)

const { scoreChangeHighlightText, scoreChangeDescription, scoreChangeTone } = useCreditSummary(
  currentScoreRef,
  historyListRef
)

const { activeTab, tabs, benefitRanges, positiveItems, negativeItems } =
  useCreditSimulator(currentScoreRef)

const getShortTabLabel = (tabId) => {
  switch (tabId) {
    case 'BENEFITS':
      return '금융 혜택'
    case 'POSITIVE':
      return '가점 요인'
    case 'NEGATIVE':
      return '감점 주의'
    default:
      return ''
  }
}

const formatCardIssuanceMobile = (text) => {
  if (!text) return '-'
  if (text.includes('무조건 승인') || text.includes('최고 한도')) return '최고한도 발급 승인'
  if (text.includes('정상 발급')) return '정상 발급 가능'
  if (text.includes('소득 증빙 필수')) return '조건부 발급 (소득증빙)'
  if (text.includes('최소기준') || text.includes('거절 가능성')) return '발급 심사 주의'
  if (text.includes('불가')) return '발급 불가'
  return text
}
</script>
