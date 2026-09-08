<template>
  <section
    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,35,70,0.03)] sm:p-7 md:p-8"
  >
    <div
      class="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,450px)] lg:items-stretch"
    >
      <!-- 좌측: 뱃지/일시정지 + 메인 목표 금액/현황 + 페이스 3개 인셋 카드 -->
      <div class="flex h-full flex-col justify-between">
        <div>
          <!-- 상단 뱃지 + 목표 일시정지/재개 버튼 -->
          <div class="flex items-center justify-between gap-2 min-w-0">
            <!-- 진행 중 뱃지 -->
            <span
              v-if="!disabled"
              class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"
            >
              <span class="size-1.5 shrink-0 rounded-full bg-primary" />
              <span>진행 중</span>
            </span>
            <!-- 일시정지 뱃지 -->
            <span
              v-else
              class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500"
            >
              <span class="size-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>일시정지</span>
            </span>

            <!-- 진행 중일 때: 목표 일시정지 버튼 (보조 버튼, shrink-0으로 찌그러짐 방지) -->
            <button
              v-if="!disabled"
              type="button"
              class="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-[0_1px_0_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#0a192f] active:scale-95 cursor-pointer select-none"
              @click="$emit('pause')"
            >
              <img src="@/assets/icons/goal-pause.svg" alt="" class="size-2.5 opacity-60" />
              <span class="whitespace-nowrap">목표 일시정지</span>
            </button>
            <!-- 일시정지일 때: 목표 재개하기 버튼 (Primary 강조 버튼, shrink-0) -->
            <button
              v-else
              type="button"
              class="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,102,255,0.28)] transition hover:bg-primary/90 active:scale-95 cursor-pointer select-none"
              @click="$emit('resume')"
            >
              <svg class="size-2.5 fill-current" viewBox="0 0 24 24">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              <span class="whitespace-nowrap">목표 재개하기</span>
            </button>
          </div>

          <!-- 메인 목표 제목 (모바일 단어 단위 줄바꿈 break-keep) -->
          <h1
            class="mt-3.5 text-2xl font-black leading-[1.35] text-[#0a192f] sm:text-3xl lg:text-[34px] break-keep"
          >
            {{ formatManwon(goalAmount) }}만원 목표까지<br />
            <span class="text-primary tabular-nums"
              >{{ formatManwon(animatedCurrentAmount) }}만원</span
            >
            모았어요
          </h1>

          <!-- 달성률 및 도착 예정일 (일시정지 시 안내 캡션 연동) -->
          <div class="mt-3 flex items-center gap-2 text-xs sm:text-sm">
            <span class="text-[#0a192f] font-bold">
              <span class="tabular-nums">{{ progressRate }}%</span>
              <span class="font-normal text-slate-500 ml-0.5">달성</span>
            </span>
            <span class="size-1 rounded-full bg-slate-300" />
            <span v-if="!disabled" class="font-normal text-slate-500">
              예상 도착일 <strong class="font-semibold text-slate-700">{{ formattedEndDate }}</strong>
            </span>
            <span v-else class="font-normal text-slate-400">
              자동이체 해제됨 · 저금통 적립 일시정지
            </span>
          </div>
        </div>

        <!-- 하단: 페이스 정보 — 클릭 시 '나의 로드맵 여정' 섹션으로 스크롤 이동 -->
        <div class="mt-5 border-t border-slate-100 pt-4 sm:mt-6 sm:pt-5">
          <button
            type="button"
            class="-mx-1 w-[calc(100%+0.5rem)] rounded-xl px-1 py-1 text-left transition-colors duration-200 hover:bg-slate-50 active:scale-[0.99] cursor-pointer select-none"
            aria-label="나의 로드맵 여정으로 이동"
            @click="$emit('view-roadmap')"
          >
            <div class="grid grid-cols-3 divide-x divide-slate-200/80 items-center">
              <!-- 1. 현재 페이스: 누적 저축액이 아니라 실제 월평균 저축 속도(currentAmount ÷ 경과 개월) -->
              <div class="px-2 text-center sm:text-left sm:pl-3 sm:pr-2">
                <span class="block text-[11px] font-medium text-slate-500">현재 페이스</span>
                <div class="mt-0.5 flex items-baseline justify-center sm:justify-start gap-0.5">
                  <strong
                    class="text-xs font-bold tabular-nums text-[#0a192f] sm:text-sm md:text-base"
                  >
                    {{ formatManwon(paceMetrics.currentMonthlyPace) }}만원
                  </strong>
                  <span class="text-[11px] font-normal text-slate-400 sm:text-xs">/월</span>
                </div>
              </div>

              <!-- 2. 목표 페이스: 목표 금액 ÷ 전체 목표 개월 -->
              <div class="px-2 text-center sm:text-left sm:pl-4 sm:pr-2">
                <span class="block text-[11px] font-medium text-slate-500">목표 페이스</span>
                <div class="mt-0.5 flex items-baseline justify-center sm:justify-start gap-0.5">
                  <strong
                    class="text-xs font-bold tabular-nums text-slate-700 sm:text-sm md:text-base"
                  >
                    {{ formatManwon(paceMetrics.targetMonthlyPace) }}만원
                  </strong>
                  <span class="text-[11px] font-normal text-slate-400 sm:text-xs">/월</span>
                </div>
              </div>

              <!-- 3. 차이 금액 -->
              <div class="px-2 text-center sm:text-left sm:pl-4 sm:pr-2">
                <span class="block text-[11px] font-medium text-slate-500">페이스 차이</span>
                <div class="mt-0.5 flex items-baseline justify-center sm:justify-start gap-0.5">
                  <strong
                    class="text-xs font-bold tabular-nums sm:text-sm md:text-base"
                    :style="{ color: paceDifferenceColor }"
                  >
                    {{ paceDifferenceLabel }}
                  </strong>
                  <span
                    v-if="paceState !== PACE_STATE.NOT_STARTED"
                    class="text-[11px] font-normal text-slate-400 sm:text-xs"
                    >/월</span
                  >
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- 우측: 스마트 자동 저축 카드 (슬림형 슬레이트 인셋 패널) -->
      <div
        class="flex flex-col justify-between overflow-hidden rounded-2xl border border-blue-100/80 bg-[#f8fbff] p-3.5 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.05)]"
      >
        <div
          v-if="dailyAvailableMoney || monthlyAvailableMoney"
          class="grid grid-cols-2 gap-2 border-b border-slate-200/60 pb-2.5"
        >
          <button
            v-if="dailyAvailableMoney"
            type="button"
            class="group rounded-lg px-2 py-2 text-left transition-colors duration-200 hover:bg-white/70 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 cursor-pointer select-none"
            :class="!monthlyAvailableMoney ? 'col-span-2' : ''"
            :disabled="disabled"
            @click="$emit('open-today')"
          >
            <span
              class="block text-[11px] font-medium text-slate-500 group-hover:text-primary transition-colors"
              >오늘 여유자금</span
            >
            <strong class="mt-0.5 block text-sm font-bold tabular-nums text-primary sm:text-base">
              {{ formatWon(dailyAvailableMoney.todayAvailableMoney) }}
            </strong>
          </button>
          <button
            v-if="monthlyAvailableMoney"
            type="button"
            class="group rounded-lg px-2 py-2 text-left transition-colors duration-200 hover:bg-white/70 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 cursor-pointer select-none"
            :class="!dailyAvailableMoney ? 'col-span-2' : ''"
            :disabled="disabled"
            @click="$emit('open-month')"
          >
            <span
              class="block text-[11px] font-medium text-slate-500 group-hover:text-primary transition-colors"
              >이번 달 여유자금</span
            >
            <strong class="mt-0.5 block text-sm font-bold tabular-nums text-primary sm:text-base">
              {{ formatWon(monthlyAvailableMoney.availableMoney) }}
            </strong>
          </button>
        </div>

        <div class="flex flex-1 flex-col justify-between gap-2.5 pt-2.5">
          <!-- 1. 알아서 모으기: 페이스 상태(시작 전/적정/앞섬/뒤처짐)에 따라 문구만 바뀌고, 항상 서비스 메인 블루 톤 유지 -->
          <button
            type="button"
            class="group flex w-full items-center gap-3.5 rounded-xl py-1 text-left transition active:scale-[0.98] cursor-pointer select-none sm:py-1.5"
            :class="
              disabled || (pacemakerStatusUnavailable && paceState !== PACE_STATE.BEHIND)
                ? 'pointer-events-none opacity-45'
                : ''
            "
            :disabled="disabled || (pacemakerStatusUnavailable && paceState !== PACE_STATE.BEHIND)"
            @click="$emit('cta-click')"
          >
            <span
              class="flex size-8 sm:size-[34px] shrink-0 items-center justify-center rounded-xl bg-[#D8E9FF] text-[#3182f6] shadow-[inset_0_0_0_1px_rgba(49,130,246,0.12)] transition-transform duration-200 group-hover:scale-105"
            >
              <!-- 1. 알아서 모으기 선명한 번개 SVG -->
              <DashboardIcon
                name="spark"
                class="size-[18px] drop-shadow-[0_2px_3px_rgba(49,130,246,0.22)] sm:size-5"
              />
            </span>
            <span class="min-w-0 flex-1">
              <strong
                class="block text-xs sm:text-sm font-bold text-[#0a192f] transition-colors duration-200 group-hover:text-primary"
              >
                {{ primaryCtaTitle }}
              </strong>
              <span class="mt-0.5 block text-[11px] sm:text-xs font-medium text-[#73809c]">
                {{ primaryCtaDescription }}
              </span>
            </span>
            <span
              class="text-xl leading-none text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary"
              >›</span
            >
          </button>

          <!-- 깔끔한 직선 구분선 -->
          <div class="h-px w-full bg-slate-200/60" />

          <!-- 2. 다음 달 자금마련 (스위치 위치 고정 및 인라인 상태 전환) -->
          <button
            type="button"
            class="group flex w-full items-center gap-3 rounded-xl py-1 text-left disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] select-none cursor-pointer"
            :class="disabled ? 'pointer-events-none opacity-45' : ''"
            :disabled="isToggling || disabled || pacemakerStatusUnavailable"
            @click="$emit('toggle')"
          >
            <span
              class="flex size-8 sm:size-[34px] shrink-0 items-center justify-center rounded-xl bg-[#D7F5E8] text-[#00a878] shadow-[inset_0_0_0_1px_rgba(0,168,120,0.12)] transition-transform duration-200 group-hover:scale-105"
            >
              <!-- 2. 다음 달 자금마련 선명한 캘린더 SVG -->
              <DashboardIcon
                name="calendar-check"
                class="size-[18px] drop-shadow-[0_2px_3px_rgba(0,168,120,0.2)] sm:size-5"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between gap-3">
                <span class="min-w-0">
                  <strong class="block text-xs sm:text-sm font-bold text-[#0a192f] truncate"
                    >다음 달 자금마련</strong
                  >
                  <span
                    class="mt-0.5 block text-[11px] sm:text-xs truncate transition-colors"
                    :class="
                      pacemaker?.enabled ? 'font-bold text-primary' : 'font-medium text-[#73809c]'
                    "
                  >
                    {{
                      pacemakerError
                        ? '페이스메이커 정보를 불러오지 못했어요'
                        : pacemaker?.enabled
                        ? `이번달 +${formatWon(pacemaker.monthlySecuredAmount)} 자동 확보`
                        : '하루 여유자금으로 자동 저축'
                    }}
                  </span>
                </span>
                <span
                  class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  :class="pacemaker?.enabled ? 'bg-primary' : 'bg-slate-300'"
                  role="switch"
                  :aria-checked="pacemaker?.enabled === true"
                >
                  <span
                    class="absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all"
                    :class="pacemaker?.enabled ? 'left-[22px]' : 'left-0.5'"
                  />
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import DashboardIcon from '@/pages/dashboard/components/DashboardIcon.vue'
import { computed } from 'vue'
import {
  PACE_STATE,
  derivePaceState,
  deriveGoalPaceMetrics,
} from '@/features/roadmap/constants/pace-state.constants'
import { useCountUp } from '@/shared/composables/useCountUp'

const props = defineProps({
  pace: { type: Object, required: true },
  progressRate: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  currentAmount: { type: Number, default: 0 },
  startAmount: { type: Number, default: 0 },
  goalAmount: { type: Number, default: 0 },
  endDate: { type: String, default: '' },
  goalMonths: { type: Number, default: 0 },
  remainMonths: { type: Number, default: 0 },
  dailyAvailableMoney: { type: Object, default: null },
  monthlyAvailableMoney: { type: Object, default: null },
  pacemaker: { type: Object, default: null },
  isToggling: { type: Boolean, default: false },
  pacemakerError: { type: Boolean, default: false },
  pacemakerStatusUnavailable: { type: Boolean, default: false },
})

// 월 페이스/누적 진행률 계산에 필요한 원본 데이터를 하나로 묶은 goal-like 객체
// (PaceBanner는 개별 scalar prop으로 받기 때문에, 공용 유틸이 기대하는 모양으로 조립한다)
const goalLike = computed(() => ({
  currentAmount: props.currentAmount,
  startAmount: props.startAmount,
  goalAmount: props.goalAmount,
  pace: props.pace,
  period: { goalMonths: props.goalMonths, remainMonths: props.remainMonths },
}))

defineEmits([
  'cta-click',
  'pause',
  'resume',
  'open-today',
  'open-month',
  'toggle',
  'view-roadmap',
])

// 페이스 상태(시작 전/적정/앞섬/뒤처짐)별 CTA 문구 — 항상 서비스 메인 블루 톤 유지
const PACE_CTA_CONTENT = {
  [PACE_STATE.NOT_STARTED]: { title: '첫 저축 시작하기', description: '페이스메이커가 도와드릴게요' },
  [PACE_STATE.ON_TRACK]: { title: '지금 페이스 유지하기', description: '이번 달 목표 금액을 자동으로 모아요' },
  [PACE_STATE.AHEAD]: { title: '더 빨리 달성하는 방법 보기', description: '페이스메이커가 알아서 모아줄게요' },
  [PACE_STATE.BEHIND]: { title: '목표 페이스 따라잡기', description: '페이스메이커가 도와줄게요' },
}

const paceMetrics = computed(() => deriveGoalPaceMetrics(goalLike.value))
const paceState = computed(() => derivePaceState(goalLike.value))
const primaryCtaTitle = computed(() => PACE_CTA_CONTENT[paceState.value].title)
const primaryCtaDescription = computed(() => PACE_CTA_CONTENT[paceState.value].description)

// 페이스 차이: 월 페이스끼리 비교(currentMonthlyPace - targetMonthlyPace).
// 아직 저축을 시작하지 않았다면 비교 대상 자체가 없으므로 숫자 대신 "—"로 표시한다.
// 시작 후에는 현재<목표 -X만원, 현재>목표 +X만원, 동일(반올림 시 0만원) 시 부호 없이 표시
const paceDifferenceLabel = computed(() => {
  if (paceState.value === PACE_STATE.NOT_STARTED) return '—'
  const magnitude = formatManwon(Math.abs(paceMetrics.value.paceDifference))
  if (paceState.value === PACE_STATE.BEHIND) return `-${magnitude}만원`
  if (paceState.value === PACE_STATE.AHEAD) return `+${magnitude}만원`
  return `${magnitude}만원`
})
const paceDifferenceColor = computed(() => {
  if (paceState.value === PACE_STATE.NOT_STARTED) return '#94a3b8'
  return paceState.value === PACE_STATE.BEHIND ? '#be185d' : '#0066FF'
})

const formattedEndDate = computed(() => props.endDate?.replace('-', '.') ?? '')

// 메인 금액 부드러운 카운트업 (1초 감속 롤링)
const currentAmountRef = computed(() => props.currentAmount)
const { displayValue: animatedCurrentAmount } = useCountUp(currentAmountRef, {
  duration: 1000,
  initialValue: 0,
})

function formatManwon(amount) {
  return Math.round(Number(amount || 0) / 10000).toLocaleString()
}

function formatWon(amount) {
  return `${Number(amount ?? 0).toLocaleString('ko-KR')}원`
}
</script>
