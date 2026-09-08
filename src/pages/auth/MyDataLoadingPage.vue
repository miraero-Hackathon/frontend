<!-- 마이데이터 연동 로딩 페이지 (AUTH-03) -->
<template>
  <HeroBackground>
    <StepHeader :show-back="false" />

    <main class="flex min-h-[calc(100dvh-72px)] items-center justify-center px-4 py-3 sm:py-8">
      <div class="w-full max-w-[420px]">
        <div
          v-if="mydataSyncError"
          class="rounded-2xl border border-red-100 bg-white p-5 sm:p-8 text-center shadow-lg"
          role="alert"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              class="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M12 8v5" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <h1
            class="mt-4 text-[22px] font-bold tracking-tight text-gray-900 sm:text-2xl [word-break:keep-all] break-keep"
          >
            마이데이터를 연동하지 못했어요
          </h1>
          <p
            class="mt-1.5 text-[13px] leading-relaxed text-gray-500 sm:text-sm [word-break:keep-all] break-keep"
          >
            {{ mydataSyncError }}
          </p>
          <button
            type="button"
            class="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isMydataLoading"
            @click="runMydataSync(true)"
          >
            다시 시도하기
          </button>
        </div>

        <template v-else>
          <div class="flex flex-col items-center text-center">
            <!-- 시각적 존재감을 살린 80px 스피너 -->
            <div class="relative flex h-20 w-20 items-center justify-center">
              <div class="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div
                class="absolute inset-0 rounded-full border-4 border-transparent transition-all duration-500"
                :class="isComplete ? 'border-primary' : 'animate-spin border-t-primary'"
              />
              <!-- 완료 시 은은하게 퍼지는 블루 펄스 링 -->
              <div
                v-if="isComplete"
                class="absolute h-14 w-14 rounded-full bg-primary/25 animate-ping opacity-60 pointer-events-none"
              />

              <div
                class="relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 shadow-md overflow-hidden"
                :class="
                  isComplete
                    ? 'scale-105 bg-primary text-white shadow-primary/30 ring-4 ring-blue-50'
                    : 'bg-[#FFBC00] shadow-amber-200/50 ring-2 ring-amber-200/60'
                "
              >
                <!-- 완료 시 화이트 체크마크 -->
                <svg
                  v-if="isComplete"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-6 w-6 text-white animate-fade-in"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <!-- 로딩 중 KB 공식 이미지 엠블럼 -->
                <img
                  v-else
                  :src="kbLogoImg"
                  alt="KB국민은행"
                  class="h-full w-full object-cover animate-pulse"
                />
              </div>
            </div>

            <!-- 로그인 페이지와 동일한 20~24px 굵직한 메인 타이틀 -->
            <h1
              class="mt-4 text-[22px] font-bold tracking-tight text-gray-900 sm:text-2xl [word-break:keep-all] break-keep transition-all duration-300"
            >
              {{
                isComplete
                  ? 'KB 정보 분석이 완료되었어요'
                  : 'KB 정보를 불러오는 중이에요'
              }}
            </h1>
            <p
              class="mt-1.5 text-[13px] sm:text-sm leading-relaxed text-gray-500 [word-break:keep-all] break-keep"
            >
              {{
                isComplete
                  ? '분석된 데이터를 바탕으로 맞춤 로드맵을 시작할게요.'
                  : 'KB국민은행과 연결된 자산을 안전하게 분석해요.'
              }}
            </p>
          </div>

          <!-- 로그인 페이지와 동일한 카드 패딩 및 텍스트 스케일 -->
          <div
            class="mt-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <p class="text-[13px] font-semibold text-gray-400 sm:text-sm">데이터 분석 진행 상황</p>
              <span class="text-[13px] font-bold text-primary font-mono sm:text-sm">{{ displayPercent }}%</span>
            </div>

            <ul class="mt-2.5 divide-y divide-slate-100 sm:mt-3">
              <li
                v-for="(item, index) in MYDATA_SYNC_ITEMS"
                :key="item.id"
                class="flex min-h-[38px] items-center justify-between gap-2.5 py-1.5 sm:py-2"
              >
                <span class="flex min-w-0 items-center gap-2.5">
                  <Transition
                    mode="out-in"
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="scale-75 opacity-0"
                    enter-to-class="scale-100 opacity-100"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="scale-100 opacity-100"
                    leave-to-class="scale-75 opacity-0"
                  >
                    <span
                      v-if="statusOf(index) === 'done'"
                      key="done"
                      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-3 w-3"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span
                      v-else-if="statusOf(index) === 'active'"
                      key="active"
                      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary"
                    >
                      <span
                        class="h-2.5 w-2.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                      />
                    </span>
                    <span
                      v-else
                      key="pending"
                      class="h-5 w-5 shrink-0 rounded-full border-2 border-gray-200"
                    />
                  </Transition>

                  <span
                    class="truncate text-[13px] sm:text-sm"
                    :class="
                      statusOf(index) === 'pending' ? 'text-gray-400' : 'font-medium text-gray-900'
                    "
                  >
                    {{ item.label }}
                  </span>
                </span>

                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 translate-x-1"
                  enter-to-class="opacity-100 translate-x-0"
                >
                  <span
                    v-if="statusOf(index) === 'done'"
                    class="shrink-0 whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-primary"
                  >
                    {{ itemDetails[item.id] || '분석 완료' }}
                  </span>
                </Transition>
              </li>
            </ul>
          </div>

          <!-- 프로그레스 바 -->
          <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 sm:mt-4">
            <div
              class="h-1.5 rounded-full bg-primary transition-all duration-300 ease-out"
              :style="{ width: progressPercent + '%' }"
            />
          </div>

          <!-- 금융 꿀팁 롤링 배너 -->
          <div
            class="mt-3 rounded-xl border border-blue-100/70 bg-[#f8fbff] px-3.5 py-2.5 text-center transition-all sm:mt-4 sm:py-3"
          >
            <Transition
              mode="out-in"
              enter-active-class="transition duration-300"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                :key="currentTipIndex"
                class="flex items-center justify-center gap-2 text-[13px] text-slate-600"
              >
                <span
                  class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#F2F4F6] text-primary sm:size-7"
                >
                  <AppIcon :name="TIPS[currentTipIndex].icon" size="sm" />
                </span>
                <span
                  class="text-[13px] font-medium text-slate-700 [word-break:keep-all] break-keep leading-snug"
                  >{{ TIPS[currentTipIndex].text }}</span
                >
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </main>
  </HeroBackground>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeroBackground from '@/shared/ui/HeroBackground.vue'
import StepHeader from '@/shared/ui/StepHeader.vue'
import AppIcon from '@/shared/ui/AppIcon.vue'
import { useAuthFeatureStore } from '@/features/auth'
import { MYDATA_SYNC_ITEMS } from '@/features/auth/constants/auth.constants'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { getAccounts, getGoals } from '@/features/goal/api/goal.api'
import kbLogoImg from '@/assets/images/KB.jpg'

const PROGRESS_INTERVAL_MS = 500
const NAVIGATE_DELAY_MS = 1800

const connectedAccountCount = ref(null)

const itemDetails = computed(() => ({
  accounts:
    connectedAccountCount.value !== null
      ? `${connectedAccountCount.value}개 계좌 연결`
      : '계좌 연결 완료',
  income: '월소득 추정 완료',
  spending: '최근 3개월 분석',
  transactions: '고정지출 분류',
  loans: '상환 스케줄 확인',
}))

const TIPS = [
  { icon: '💡', text: '비상금은 월 고정지출의 3~6개월 치가 가장 적당해요.' },
  { icon: '📊', text: '소비 분석을 통해 숨어있는 구독료와 낭비를 찾아드려요.' },
  { icon: '🔒', text: '회원님의 자산 데이터는 안전하게 암호화되어 관리돼요.' },
  { icon: '🎯', text: '현실적인 저축 여력에 맞춘 최적의 로드맵을 설계해요.' },
]

const router = useRouter()
const authFeatureStore = useAuthFeatureStore()
const { isMydataLoading, mydataSyncError } = storeToRefs(authFeatureStore)

const doneCount = ref(0)
const isComplete = ref(false)
const displayPercent = ref(0)
const currentTipIndex = ref(0)

let isMounted = false
let runId = 0
let progressIntervalId = null
let navigationTimeoutId = null
let tipIntervalId = null
let tweenIntervalId = null

function wait(ms) {
  return new Promise((resolve) => {
    navigationTimeoutId = window.setTimeout(resolve, ms)
  })
}

const progressPercent = computed(() =>
  Math.min((doneCount.value / MYDATA_SYNC_ITEMS.length) * 100, 100)
)

watch(progressPercent, (target) => {
  window.clearInterval(tweenIntervalId)
  tweenIntervalId = window.setInterval(() => {
    if (displayPercent.value < target) {
      displayPercent.value += 1
    } else if (displayPercent.value > target) {
      displayPercent.value = Math.round(target)
      window.clearInterval(tweenIntervalId)
    } else {
      window.clearInterval(tweenIntervalId)
    }
  }, 12)
})

function statusOf(index) {
  if (index < doneCount.value) return 'done'
  if (index === doneCount.value) return 'active'
  return 'pending'
}

function stopProgress() {
  window.clearInterval(progressIntervalId)
  progressIntervalId = null
}

function startProgress() {
  stopProgress()
  doneCount.value = 0
  displayPercent.value = 0
  isComplete.value = false
  progressIntervalId = window.setInterval(() => {
    doneCount.value = Math.min(doneCount.value + 1, MYDATA_SYNC_ITEMS.length - 1)
  }, PROGRESS_INTERVAL_MS)
}

function startTipRotation() {
  tipIntervalId = window.setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % TIPS.length
  }, 3000)
}

function stopTipRotation() {
  window.clearInterval(tipIntervalId)
  tipIntervalId = null
}

async function fetchActualAccountCount() {
  try {
    const res = await getAccounts()
    if (res?.accounts && Array.isArray(res.accounts)) {
      connectedAccountCount.value = res.accounts.length
    }
  } catch {
    // API 조회 실패 시 fallback 텍스트('계좌 연결 완료') 유지
  }
}

async function runMydataSync(isRetry = false) {
  const currentRunId = ++runId
  startProgress()
  fetchActualAccountCount()

  try {
    if (isRetry) {
      await authFeatureStore.retryMydataInitialization()
    } else {
      await authFeatureStore.initializeMydata()
    }
    if (!isMounted || currentRunId !== runId) return

    await fetchActualAccountCount()

    stopProgress()
    doneCount.value = MYDATA_SYNC_ITEMS.length
    isComplete.value = true
    await wait(NAVIGATE_DELAY_MS)

    if (isMounted && currentRunId === runId) {
      try {
        const goals = await getGoals()
        if (Array.isArray(goals) && goals.length > 0) {
          router.replace({ name: ROUTE_NAMES.DASHBOARD })
          return
        }
      } catch {
        // fallback
      }
      router.replace({ name: ROUTE_NAMES.GOAL_SELECT })
    }
  } catch {
    stopProgress()
  }
}

onMounted(() => {
  isMounted = true
  startTipRotation()
  runMydataSync()
})

onBeforeUnmount(() => {
  isMounted = false
  runId += 1
  stopProgress()
  stopTipRotation()
  window.clearInterval(tweenIntervalId)
  window.clearTimeout(navigationTimeoutId)
})
</script>
