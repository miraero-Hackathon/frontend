<!-- 로드맵 메인 대시보드 -->
<template>
  <div class="w-full">
    <LoadingSpinner
      v-if="isPageLoading || goalStore.areGoalsLoading || goalStore.isLoading"
      message="홈 화면을 준비하고 있어요"
      container-class="min-h-[calc(100dvh-122px)] md:min-h-[calc(100dvh-80px)]"
    />

    <div
      v-else-if="goalStore.currentGoal"
      class="flex min-h-[calc(100vh-80px)] justify-center bg-[#f8fafc] pb-6"
    >
      <div class="page-container space-y-3 py-4 sm:space-y-6 sm:py-6">
        <div
          v-if="hasSupplementaryError"
          class="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
          role="status"
        >
          <p class="text-xs font-bold text-amber-700">일부 부가 정보를 불러오지 못했어요.</p>
          <button
            type="button"
            class="text-xs font-bold text-amber-800 disabled:opacity-50"
            :disabled="goalStore.isSupplementaryLoading"
            @click="retrySupplementaryData"
          >
            {{ goalStore.isSupplementaryLoading ? '불러오는 중…' : '다시 시도' }}
          </button>
        </div>

        <div
          v-if="hasPacemakerDataError"
          class="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
          role="status"
        >
          <p class="text-xs font-bold text-amber-700">
            {{
              pacemakerStore.statusError
                ? '페이스메이커 상태를 불러오지 못했어요.'
                : '페이스메이커 일부 정보를 불러오지 못했어요.'
            }}
          </p>
          <button
            type="button"
            class="shrink-0 text-xs font-bold text-amber-800 disabled:opacity-50"
            :disabled="isPacemakerDataLoading"
            @click="loadPacemakerData"
          >
            {{ isPacemakerDataLoading ? '불러오는 중…' : '다시 시도' }}
          </button>
        </div>

        <!-- 1. 상단 통합 현황 카드 (PaceBanner: 진행 중/일시정지 상태 및 재개 토글 내장) -->
        <div>
          <PaceBanner
            :pace="displayedGoal.pace"
            :progress-rate="goalStore.currentGoal.progressRate"
            :disabled="isGoalPaused"
            :current-amount="displayedGoal.currentAmount"
            :start-amount="displayedGoal.startAmount"
            :goal-amount="goalStore.currentGoal.goalAmount"
            :end-date="goalStore.currentGoal.period.endDate"
            :goal-months="goalStore.currentGoal.period.goalMonths"
            :remain-months="goalStore.currentGoal.period.remainMonths"
            :daily-available-money="goalStore.dailyAvailableMoney"
            :monthly-available-money="goalStore.monthlyAvailableMoney"
            :pacemaker="displayedPacemaker"
            :is-toggling="pacemakerStore.isToggling"
            :pacemaker-error="hasPacemakerDataError"
            :pacemaker-status-unavailable="isPacemakerStatusUnavailable"
            @cta-click="handlePacemakerCtaClick"
            @toggle="handlePacemakerToggle"
            @pause="openPauseConfirm"
            @resume="openResumeConfirm"
            @open-today="handleOpenTodayAvailableMoneyModal"
            @open-month="handleOpenMonthlyAvailableMoneyModal"
            @view-roadmap="scrollToRoadmapSection"
          />
        </div>

        <!-- 2. 목표 진행 로드맵 카드 (통합 카드 컨테이너) -->
        <!-- 페이스 비교 클릭 시 이 카드의 제목이 화면 위로 잘리지 않도록 여유를 두고(scroll-mt),
             모바일 하단 네비게이션에 카드 끝부분이 가려지지 않도록 여유를 둔다(scroll-mb). -->
        <section
          ref="roadmapSectionRef"
          class="scroll-mt-4 scroll-mb-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,35,70,0.03)] sm:p-6 md:p-7"
          :class="isGoalPaused ? 'opacity-65' : ''"
        >
          <div class="mb-3.5 sm:mb-4 flex items-center justify-between">
            <h2 class="text-base font-bold tracking-tight text-[#0a192f] sm:text-lg">
              나의 로드맵 여정
            </h2>
          </div>

          <MilestoneProgressBar :goal="displayedGoal" :milestones="roadmapStore.milestones" />

          <!-- 스플릿 기록 -->
          <div class="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:mt-5 sm:pt-5">
            <MilestoneList
              :milestones="roadmapStore.milestones"
              :goal="displayedGoal"
              @select-milestone="handleSelectMilestone"
            />
          </div>
        </section>

        <!-- 3. 요약 통계 그룹 (자산 현황 카드) -->
        <div :class="isGoalPaused ? 'opacity-65' : ''">
          <RaceRecordSummary
            :goal="displayedGoal"
            :assets="goalStore.assets ?? []"
            @open-detail="handleOpenLinkedAssets"
            @open="handleOpenShareGoal"
          />
        </div>
      </div>

      <!-- 모달 컴포넌트들 -->
      <PacemakerSetupModal v-model="isPacemakerModalOpen" />
      <TodayAvailableMoneyModal
        v-model="isTodayAvailableMoneyModalOpen"
        :daily="goalStore.dailyAvailableMoney ?? EMPTY_DAILY_AVAILABLE_MONEY"
      />
      <MonthlyAvailableMoneyModal
        v-model="isMonthlyAvailableMoneyModalOpen"
        :monthly="goalStore.monthlyAvailableMoney ?? EMPTY_MONTHLY_AVAILABLE_MONEY"
      />
      <LinkedAssetsModal v-model="isLinkedAssetsModalOpen" :assets="goalStore.assets" />
      <MilestoneReportModal v-model="isMilestoneReportModalOpen" :milestone="selectedMilestone" />
      <GoalStatusConfirmModal
        v-model="isStatusConfirmModalOpen"
        :mode="statusConfirmMode"
        @confirm="handleStatusConfirm"
      />
      <ShareGoalModal
        v-model="isShareGoalModalOpen"
        :goal="goalStore.currentGoal"
        :milestones="roadmapStore.milestones"
      />
      <GoalAchievementModal
        v-model="isGoalAchievementModalOpen"
        :goal="goalStore.currentGoal"
        :is-adding="collectionStore.isAdding"
        :error-message="achievementErrorMessage"
        @add-to-collection="handleAddToCollection"
        @later="handleAchievementLater"
      />
      <PacemakerAssistFlow
        v-model="isPacemakerAssistFlowOpen"
        :goal="assistFlowGoal"
        @goal-adjusted="refreshAdjustedGoal"
      />
    </div>

    <div
      v-else-if="goalStore.dashboardError || goalStore.goalsError"
      class="flex min-h-[420px] items-center justify-center px-6"
    >
      <div class="text-center" role="alert">
        <p class="text-base font-bold text-[#0a192f]">로드맵을 불러오지 못했어요</p>
        <p class="pt-2 text-sm text-slate-500">잠시 후 다시 시도해주세요.</p>
        <button
          type="button"
          class="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
          @click="retryGoalDashboard"
        >
          다시 시도
        </button>
      </div>
    </div>

    <div v-else class="flex min-h-[420px] items-center justify-center px-6 text-center">
      <div class="max-w-[320px]">
        <div
          class="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]"
        >
          <DashboardIcon
            name="plus"
            class="size-6 text-[#3182f6] drop-shadow-[0_3px_5px_rgba(49,130,246,0.22)]"
          />
        </div>
        <p class="text-base font-bold text-[#0a192f]">아직 등록된 목표가 없어요</p>
        <p class="pt-1.5 text-sm text-slate-500">
          첫 번째 목표를 설정하고 맞춤 로드맵을 시작해보세요.
        </p>
        <RouterLink
          :to="{ name: ROUTE_NAMES.GOAL_SELECT, query: { from: 'dashboard' } }"
          class="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
        >
          새 목표 만들기
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useGoalStore } from '@/features/goal'
import { useCollectionStore } from '@/features/collection'
import { GOAL_STATUS } from '@/features/goal/constants/goal.constants'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import {
  useRoadmapStore,
  PaceBanner,
  MilestoneProgressBar,
  MilestoneList,
  MilestoneReportModal,
  TodayAvailableMoneyModal,
  MonthlyAvailableMoneyModal,
  LinkedAssetsModal,
  GoalStatusConfirmModal,
  RaceRecordSummary,
  ShareGoalModal,
  GoalAchievementModal,
} from '@/features/roadmap'
import { usePacemakerStore, PacemakerSetupModal } from '@/features/pacemaker'
import { PACEMAKER_HISTORY_PAGE_SIZE } from '@/features/pacemaker/constants/pacemaker.constants'
import PacemakerAssistFlow from '@/pages/dashboard/components/PacemakerAssistFlow.vue'
import DashboardIcon from '@/pages/dashboard/components/DashboardIcon.vue'
import { useModal } from '@/shared/composables/useModal'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { PACE_STATE, derivePaceState } from '@/features/roadmap/constants/pace-state.constants'

const route = useRoute()
const router = useRouter()
const goalStore = useGoalStore()
const roadmapStore = useRoadmapStore()
const pacemakerStore = usePacemakerStore()
const collectionStore = useCollectionStore()
const isPageLoading = ref(true)
const { isOpen: isPacemakerModalOpen, open: openPacemakerModal } = useModal()
const { isOpen: isPacemakerAssistFlowOpen, open: openPacemakerAssistFlow } = useModal()
const { isOpen: isTodayAvailableMoneyModalOpen } = useModal()
const { isOpen: isMonthlyAvailableMoneyModalOpen } = useModal()
const { isOpen: isLinkedAssetsModalOpen, open: openLinkedAssetsModal } = useModal()
const {
  isOpen: isMilestoneReportModalOpen,
  open: openMilestoneReportModal,
  close: closeMilestoneReportModal,
} = useModal()
const { isOpen: isStatusConfirmModalOpen, open: openStatusConfirmModal } = useModal()
const { isOpen: isShareGoalModalOpen, open: openShareGoalModal } = useModal()
const {
  isOpen: isGoalAchievementModalOpen,
  open: openGoalAchievementModal,
  close: closeGoalAchievementModal,
} = useModal()

const statusConfirmMode = ref('pause')
const selectedMilestone = ref(null)
const achievementErrorMessage = ref('')
const previousProgressRate = ref(null)
const roadmapSectionRef = ref(null)
const isPacemakerDataLoading = ref(false)

const EMPTY_DAILY_AVAILABLE_MONEY = Object.freeze({
  todayAvailableMoney: 0,
  todayExpense: 0,
  remainingAvailableMoney: 0,
})
const EMPTY_MONTHLY_AVAILABLE_MONEY = Object.freeze({
  income: 0,
  fixedExpense: 0,
  targetGoalAutoTransfer: 0,
  otherGoalAutoTransfer: 0,
  variableExpense: 0,
  availableMoney: 0,
  elapsedDays: 0,
  remainingDays: 0,
  periodDays: 0,
})

const isGoalPaused = computed(() => goalStore.currentGoal?.status === GOAL_STATUS.PAUSED)
const isShortagePreview = computed(() => import.meta.env.DEV && route.query.scenario === 'shortage')
const isUnregisteredPacemakerPreview = computed(
  () => import.meta.env.DEV && route.query.pacemaker === 'unregistered'
)
const displayedPacemaker = computed(() => {
  const pacemaker = pacemakerStore.pacemakerView
  if (!isUnregisteredPacemakerPreview.value) return pacemaker

  return {
    ...pacemaker,
    registered: false,
    enabled: false,
    status: null,
  }
})
// 개발 중 BEHIND 화면 미리보기(?scenario=shortage): 화면 전체가 바라보는 단일 파생 상태
// (derivePaceState/deriveGoalPaceMetrics)는 pace.paceStatus/differenceAmount가 아니라
// currentAmount·startAmount·period·pace.expectedAmount로 월평균 페이스를 직접 계산하므로,
// 그 계산에 실제로 영향을 주는 currentAmount를 "시작 금액 + 목표 페이스 절반만큼만 추가 저축"한
// 것으로 낮춰 BEHIND가 실제로 재현되게 한다.
const displayedGoal = computed(() => {
  const goal = goalStore.currentGoal
  if (!goal || !isShortagePreview.value) return goal

  const { goalMonths = 0, remainMonths = 0 } = goal.period ?? {}
  const startAmount = Number(goal.startAmount ?? 0)
  const elapsedMonths = Math.max(1, goalMonths - remainMonths)
  const remainingToSave = Math.max(0, Number(goal.goalAmount ?? 0) - startAmount)
  const targetMonthlyPace = goalMonths > 0 ? remainingToSave / goalMonths : 0
  const shortageSavedSinceStart = Math.max(0, Math.round(targetMonthlyPace * elapsedMonths * 0.5))

  return { ...goal, currentAmount: startAmount + shortageSavedSinceStart }
})
const assistFlowGoal = displayedGoal
const hasSupplementaryError = computed(
  () =>
    Object.keys(goalStore.dashboardSupplementaryErrors).length > 0 || Boolean(roadmapStore.error)
)
const hasPacemakerDataError = computed(
  () =>
    Boolean(pacemakerStore.statusError) ||
    (pacemakerStore.pacemakerStatus?.registered === true &&
      (Boolean(pacemakerStore.dashboardError) || Boolean(pacemakerStore.historiesError)))
)
const isPacemakerStatusUnavailable = computed(
  () =>
    isPacemakerDataLoading.value ||
    pacemakerStore.isStatusLoading ||
    Boolean(pacemakerStore.statusError) ||
    typeof pacemakerStore.pacemakerStatus?.registered !== 'boolean'
)

// 화면 표시(배지/문구/CTA)와 클릭 동작이 서로 다른 상태값을 보고 어긋나지 않도록,
// PaceBanner가 쓰는 것과 동일한 파생 상태를 여기서도 단일하게 계산해 재사용한다.
const paceState = computed(() => derivePaceState(displayedGoal.value))

function handleOpenTodayAvailableMoneyModal() {
  isTodayAvailableMoneyModalOpen.value = true
}

// 전역 여유자금 알림에서 진입한 경우 해당 상세 모달을 열고,
// 같은 알림을 다시 눌러도 동작하도록 일회성 쿼리는 즉시 정리한다.
watch(
  () => route.query.modal,
  (modal) => {
    if (modal !== 'today-available-money') return

    handleOpenTodayAvailableMoneyModal()
    const query = { ...route.query }
    delete query.modal
    router.replace({ query })
  },
  { immediate: true }
)

function handleOpenMonthlyAvailableMoneyModal() {
  isMonthlyAvailableMoneyModalOpen.value = true
}

function handleOpenLinkedAssets() {
  openLinkedAssetsModal()
}

// 페이스 비교 영역 클릭: '나의 로드맵 여정' 카드로 스크롤 이동.
// 헤더가 가리는 여백/하단 네비게이션에 가려지지 않는 여백은 CSS scroll-margin(section의
// scroll-mt/scroll-mb)이 담당하므로, 여기서는 브라우저 기본 동작만 호출하면 된다.
function scrollToRoadmapSection() {
  roadmapSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleSelectMilestone(milestone) {
  selectedMilestone.value = milestone
  openMilestoneReportModal()
}

function handleOpenShareGoal() {
  openShareGoalModal()
}

// 대시보드 카드의 작은 토글 스위치: 개설됐으면 그냥 ON/OFF, 안 됐으면 개설 안내 모달
function handlePacemakerToggle() {
  if (isPacemakerStatusUnavailable.value) return

  if (displayedPacemaker.value?.registered) {
    pacemakerStore.togglePacemaker()
  } else {
    openPacemakerModal()
  }
}

// 뒤처진 목표는 대응전략으로 안내한다. 정상 페이스는 개설 여부에 따라 개설 안내 또는 메인 대시보드로 분기한다.
// (화면에 "첫 저축 시작하기"라고 표시해놓고 클릭 시 BEHIND 대응 모달이 열리는 일이 없도록,
//  버튼 문구를 정한 것과 동일한 paceState를 그대로 사용한다.)
function handlePacemakerCtaClick() {
  if (paceState.value === PACE_STATE.BEHIND) {
    openPacemakerAssistFlow()
    return
  }

  if (isPacemakerStatusUnavailable.value) return

  if (!displayedPacemaker.value?.registered) {
    openPacemakerModal()
    return
  }

  router.push({ name: ROUTE_NAMES.PACEMAKER })
}

// 목표 조정 성공 안내가 닫히면 서버가 다시 계산한 목표 페이스와 마일스톤을 동기화한다.
async function refreshAdjustedGoal() {
  const goalId = goalStore.currentGoal?.goalId
  if (!goalId) return

  await Promise.all([
    goalStore.fetchDashboardData(goalId).catch(() => undefined),
    roadmapStore.fetchMilestones(goalId).catch(() => undefined),
  ])
}

const ACHIEVEMENT_SEEN_KEY_PREFIX = 'miraero:goal-achievement-seen:'

function achievementSeenKey(goalId) {
  return `${ACHIEVEMENT_SEEN_KEY_PREFIX}${goalId}`
}

function hasSeenAchievement(goalId) {
  return localStorage.getItem(achievementSeenKey(goalId)) === 'true'
}

function markAchievementSeen(goalId) {
  localStorage.setItem(achievementSeenKey(goalId), 'true')
}

function showAchievementOnce(goal) {
  if (!goal?.goalId || Number(goal.progressRate) < 100 || hasSeenAchievement(goal.goalId)) return
  achievementErrorMessage.value = ''
  markAchievementSeen(goal.goalId)
  openGoalAchievementModal()
}

function handleAchievementLater() {
  closeGoalAchievementModal()
}

async function handleAddToCollection() {
  const goalId = goalStore.currentGoal?.goalId
  if (!goalId || collectionStore.isAdding) return

  achievementErrorMessage.value = ''
  try {
    await collectionStore.addAchievedGoal(goalId)
    closeGoalAchievementModal()
    await router.push({ name: ROUTE_NAMES.COLLECTION })
  } catch (error) {
    if (error?.response?.status === 409) {
      closeGoalAchievementModal()
      await router.push({ name: ROUTE_NAMES.COLLECTION })
      return
    }
    achievementErrorMessage.value =
      error?.message ?? '컬렉션에 담지 못했어요. 잠시 후 다시 시도해 주세요.'
  }
}

// "목표 일시정지" 버튼: 바로 멈추지 않고 확인 모달을 먼저 염
function openPauseConfirm() {
  statusConfirmMode.value = 'pause'
  openStatusConfirmModal()
}

// 일시정지 배너의 "목표 재개하기" 버튼
function openResumeConfirm() {
  statusConfirmMode.value = 'resume'
  openStatusConfirmModal()
}

// 확인 모달의 "확인" 클릭: 실제 상태 변경
async function handleStatusConfirm() {
  await goalStore.updateCurrentGoalStatus(
    statusConfirmMode.value === 'pause' ? GOAL_STATUS.PAUSED : GOAL_STATUS.ACTIVE
  )
  isStatusConfirmModalOpen.value = false
}

// 목표 상세(대시보드 데이터+마일스톤)를 불러오고 사이드바 로드맵 목록과 선택 상태를 맞춤
async function loadGoalDashboard(goalId) {
  closeMilestoneReportModal()
  selectedMilestone.value = null
  previousProgressRate.value = null
  goalStore.selectGoal(goalId)
  let goal
  try {
    goal = await goalStore.fetchDashboardData(goalId)
  } catch {
    return false
  }

  if (!goal || String(goalStore.selectedGoalId) !== String(goalId)) return false

  await roadmapStore.fetchMilestones(goalId).catch(() => undefined)
  previousProgressRate.value = Number(goal?.progressRate) || 0
  showAchievementOnce(goal)
  return true
}

// 전체 실패 화면의 "다시 시도": 목표 목록부터 대시보드 전체를 다시 불러온다.
async function retryGoalDashboard() {
  if (goalStore.goalsError) await goalStore.fetchGoals(true)
  const goalId = route.params.goalId ? Number(route.params.goalId) : goalStore.selectedGoalId
  if (goalId) await loadGoalDashboard(goalId)
}

// 부가 정보 배너의 "다시 시도": 실패한 부가 정보만 제자리에서 다시 채운다.
// 멀쩡히 떠 있는 목표 상세까지 비우면 화면이 통째로 로딩 스피너로 바뀌므로 전체 재조회는 하지 않는다.
async function retrySupplementaryData() {
  const goalId = goalStore.selectedGoalId
  if (!goalId) return

  await Promise.all([
    goalStore.fetchSupplementaryDashboardData(goalId).catch(() => undefined),
    roadmapStore.error ? roadmapStore.fetchMilestones(goalId).catch(() => undefined) : null,
  ])
}

async function loadPacemakerData() {
  if (isPacemakerDataLoading.value) return

  isPacemakerDataLoading.value = true
  try {
    const status = await pacemakerStore.fetchPacemakerStatus()
    if (!status.registered) return

    await Promise.allSettled([
      pacemakerStore.fetchPacemakerDashboard(),
      pacemakerStore.fetchHistories({ page: 0, size: PACEMAKER_HISTORY_PAGE_SIZE }),
    ])
  } catch {
    // Store 오류 상태를 통해 대시보드에서 재시도 UI를 유지한다.
  } finally {
    isPacemakerDataLoading.value = false
  }
}

// 목표/로드맵/페이스메이커 상태를 모두 확인한 뒤에야 메인 로딩을 끝낸다 — 페이스메이커 상태
// 확인이 끝나기 전에 화면부터 보이면, 이미 등록된 사용자에게도 잠깐 "미등록"처럼 보이거나
// 그 순간 버튼을 누르면 잘못된 설정 모달이 열릴 수 있다.
onMounted(async () => {
  try {
    await goalStore.fetchGoals()

    const goalId = route.params.goalId ? Number(route.params.goalId) : goalStore.selectedGoalId
    if (!goalId) return

    const hasGoal = await loadGoalDashboard(goalId)
    if (!hasGoal) return

    await loadPacemakerData()
  } finally {
    isPageLoading.value = false
  }
})

// 사이드바 로드맵 목록에서 다른 목표를 클릭하면 라우트 파라미터만 바뀌고
// 같은 페이지 컴포넌트가 재사용되므로(onMounted가 다시 안 불림) 별도로 감시
watch(
  () => route.params.goalId,
  (newGoalId, oldGoalId) => {
    if (!newGoalId || newGoalId === oldGoalId) return
    loadGoalDashboard(Number(newGoalId))
  }
)

watch(
  () => goalStore.currentGoal?.progressRate,
  (progressRate, oldProgressRate) => {
    const current = Number(progressRate) || 0
    const previous =
      oldProgressRate == null ? previousProgressRate.value : Number(oldProgressRate) || 0

    if (previous < 100 && current >= 100) {
      showAchievementOnce(goalStore.currentGoal)
    }
    previousProgressRate.value = current
  }
)
</script>
