<!-- 루트 컴포넌트: 전역 레이아웃 및 대시보드 진입 후 알림 / 모달 관리 -->
<template>
  <div class="relative min-h-screen">
    <!-- 페이지 라우터 뷰 -->
    <RouterView />

    <!-- 🌐 대시보드 영역 전역 알림 토스트 (퍼널/로그인 화면 제외) -->
    <PacemakerToastNotification
      v-if="isDashboardRoute"
      :toast-list="toastList"
      @remove="removeToast"
      @click-toast="handleNotificationClick"
    />

    <!-- 💰 여유자금 알림 클릭 시 띄워주는 여유자금 상세 모달 -->
    <PacemakerBalanceModal
      v-if="isDashboardRoute"
      v-model="isBalanceModalOpen"
      :pacemaker="pacemakerStore.pacemakerView"
      :deposit-targets="pacemakerStore.depositTargets"
      :is-deposit-targets-loading="pacemakerStore.isDepositTargetsLoading"
      :deposit-targets-error="pacemakerStore.depositTargetsError"
      :is-toggling="pacemakerStore.isToggling"
      :toggle-error-message="pacemakerStore.toggleError?.message ?? ''"
      @toggle-auto-saving="pacemakerStore.togglePacemaker()"
      @retry-deposit-targets="retryDepositTargets"
      @deposit="handleDepositClick"
      @view-history="handleViewHistory"
    />

    <template v-if="isDashboardRoute">
      <PacemakerDepositModal
        v-model="isDepositModalOpen"
        :target="selectedDepositTarget"
        :available-balance="pacemakerStore.pacemakerView.moneyBoxBalance"
        :is-submitting="isDepositing"
        :error-message="depositErrorMessage"
        @deposit="handleDepositSubmit"
      />
      <PacemakerDepositSuccessModal
        v-model="isDepositSuccessModalOpen"
        :target="selectedDepositTarget"
        :amount="depositedAmount"
      />
      <PacemakerHistoryModal
        v-model="isHistoryModalOpen"
        :histories="pacemakerStore.histories"
        :is-loading="pacemakerStore.isHistoriesLoading"
        :error="pacemakerStore.historiesError"
        @retry="retryHistories"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  PacemakerToastNotification,
  PacemakerBalanceModal,
  PacemakerDepositModal,
  PacemakerDepositSuccessModal,
  PacemakerHistoryModal,
  usePacemakerDeposit,
  usePacemakerNotification,
  usePacemakerStore,
  usePacemakerToast,
} from '@/features/pacemaker'
import { useAuthStore } from '@/stores/auth.store'
import { useGoalStore } from '@/features/goal'
import { useModal } from '@/shared/composables/useModal'
import { useLocalDateClock } from '@/shared/composables/useLocalDateClock'
import { ROUTE_NAMES } from '@/shared/constants/routes'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { localDateKey: currentLocalDateKey } = useLocalDateClock()
const { requestPermission } = usePacemakerNotification()
const {
  selectedDepositTarget,
  depositedAmount,
  isDepositing,
  depositErrorMessage,
  openDeposit,
  submitDeposit,
  retryDepositTargets,
  retryHistories,
  resetDepositState,
} = usePacemakerDeposit()
const { toastList, removeToast, showDualNotifications, isBalanceModalOpen, closeBalanceModal } =
  usePacemakerToast()
const { isOpen: isDepositModalOpen, open: openDepositModal, close: closeDepositModal } = useModal()
const {
  isOpen: isDepositSuccessModalOpen,
  open: openDepositSuccessModal,
  close: closeDepositSuccessModal,
} = useModal()
const { isOpen: isHistoryModalOpen, open: openHistoryModal, close: closeHistoryModal } = useModal()

// 로그아웃 시 사용자별 store는 $dispose되므로, 언마운트되지 않는 App.vue가 setup 시점에
// 인스턴스를 캡처하면 재로그인 후 죽은 store를 계속 참조하게 된다.
// accessToken을 의존성으로 걸어두고 그때그때 현재 인스턴스를 다시 가져온다.
const pacemakerStore = computed(() => {
  void authStore.accessToken
  return usePacemakerStore()
})
const goalStore = computed(() => {
  void authStore.accessToken
  return useGoalStore()
})

// 퍼널 화면 제외 (루트 '/', 로그인, 회원가입, 온보딩, 목표설정 단계 등)
const EXCLUDED_PREFIXES = ['/login', '/signup', '/mydata', '/onboarding', '/goal']

// 대시보드 / 서비스 영역 라우트 여부 확인
const isDashboardRoute = computed(() => {
  if (!route.path || route.path === '/') return false
  return !EXCLUDED_PREFIXES.some((prefix) => route.path.startsWith(prefix))
})

// 잔액 모달에서 특정 목표의 "입금" 클릭 → 모달을 닫고 실제 입금 모달을 연다.
function handleDepositClick(goal) {
  openDeposit(goal)
  closeBalanceModal()
  openDepositModal()
}

function handleDepositSubmit(payload) {
  submitDeposit(payload, () => {
    closeDepositModal()
    openDepositSuccessModal()
  })
}

// "최근 자동 저축 내역 보기" → 최신 내역을 다시 불러오면서 내역 모달을 연다.
function handleViewHistory() {
  closeBalanceModal()
  retryHistories()
  openHistoryModal()
}

function handleNotificationClick(item) {
  if (item.type === 'AVAILABLE_MONEY') {
    const goalId = goalStore.value.selectedGoalId
    router.push({
      name: goalId ? ROUTE_NAMES.DASHBOARD_GOAL : ROUTE_NAMES.DASHBOARD,
      ...(goalId ? { params: { goalId } } : {}),
      query: { modal: 'today-available-money' },
    })
  } else if (item.type === 'STREAK') {
    if (route.name !== ROUTE_NAMES.PACEMAKER) {
      router.push({ name: ROUTE_NAMES.PACEMAKER })
    }
  }
}

// 알림은 세션당 한 번만 확인한다. (로그아웃하면 다음 사용자를 위해 다시 열어준다)
let isDailyNoticeChecked = false

// 계정마다 "오늘 봤음" 기록을 분리한다. 같은 브라우저에서 다른 계정으로 로그인해도
// 앞 사용자가 이미 오늘 알림을 봤다는 이유로 알림이 스킵되지 않도록 한다.
function noticeStorageKey() {
  return `miraero_last_notice_date:${authStore.user?.id ?? 'anonymous'}`
}

// [초기 접속 / 로그인 직후 1회 발송]
// 알림 문구에 실제 저축 금액이 들어가므로 로그인 후 대시보드 영역에서만 발송한다.
async function runDailyNotice({ forceRefresh = false } = {}) {
  if (isDailyNoticeChecked) return
  if (!authStore.accessToken || !isDashboardRoute.value) return
  isDailyNoticeChecked = true

  const TODAY_DATE = currentLocalDateKey.value
  const lastNoticeDate = localStorage.getItem(noticeStorageKey())

  // 💡 개발 환경(npm run dev)에서는 새로고침마다 팀원들이 언제든 테스트 가능하도록 발송하고,
  // 💡 실서비스 배포 환경에서는 오늘 하루 아직 보지 않은 경우 1회만 발송!
  if (!import.meta.env.DEV && lastNoticeDate === TODAY_DATE) return

  const hasNotified = await showDualNotifications({ forceRefresh })
  if (hasNotified === null) {
    // 일시적인 오류로 확인하지 못했다 — 다음 라우트 전환 때 다시 시도할 수 있게 둔다.
    isDailyNoticeChecked = false
    return
  }
  if (!hasNotified) {
    // 대시보드의 여유자금 데이터가 아직 도착하지 않았을 수 있다.
    // 데이터가 채워지는 시점의 watch에서 다시 확인할 수 있도록 잠금을 푼다.
    isDailyNoticeChecked = false
    return
  }
  // 데이터가 없어 알림을 건너뛴 날에는 "오늘 봤음"으로 기록하지 않는다.
  if (!import.meta.env.DEV) {
    localStorage.setItem(noticeStorageKey(), TODAY_DATE)
  }
}

onMounted(async () => {
  await requestPermission()
  runDailyNotice()
})

// 랜딩·로그인 화면에서 시작한 경우 App.vue는 이미 마운트된 뒤라
// 로그인하고 대시보드에 들어오는 시점에 다시 확인한다.
watch(
  () => [
    authStore.accessToken,
    isDashboardRoute.value,
    goalStore.value.dailyAvailableMoney?.todayAvailableMoney,
    route.path,
  ],
  ([token]) => {
    if (!token) {
      isDailyNoticeChecked = false
      // App.vue는 로그아웃해도 언마운트되지 않으므로, 여기서 들고 있는 모달 열림 상태와
      // 입금 진행 상태를 직접 비워주지 않으면 다음 사용자가 로그인했을 때
      // 이전 사용자가 보던 입금/성공/내역 모달이 그대로 다시 뜰 수 있다.
      closeBalanceModal()
      closeDepositModal()
      closeDepositSuccessModal()
      closeHistoryModal()
      resetDepositState()
      return
    }
    runDailyNotice()
  }
)

// 앱을 종료하지 않고 자정을 넘겨도 다음 날 알림을 다시 확인한다.
// 이때 전날의 todaySaving 캐시가 남아 있을 수 있으므로 서버 데이터를 강제로 갱신한다.
watch(currentLocalDateKey, () => {
  isDailyNoticeChecked = false
  runDailyNotice({ forceRefresh: true })
})

// [페이지 이동 시] 퍼널/로그인 화면일 때만 알림을 지우고, 대시보드 간 이동 시엔 떠 있던 알림이 유지됨
watch(
  () => route.path,
  (newPath) => {
    if (!newPath) return
    if (!isDashboardRoute.value) {
      toastList.value = []
    }
  }
)
</script>
