// 페이스메이커 상태, 대시보드, 자동 저축 내역 관리
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as pacemakerApi from '@/features/pacemaker/api/pacemaker.api'
import { getLocalDateKey } from '@/shared/lib/date'
import { useLocalDateClock } from '@/shared/composables/useLocalDateClock'

export const usePacemakerStore = defineStore('feature-pacemaker', () => {
  /** @type {import('vue').Ref<import('@/features/pacemaker/api/pacemaker.api').PacemakerStatus | null>} */
  const pacemakerStatus = ref(null)
  /** @type {import('vue').Ref<import('@/features/pacemaker/api/pacemaker.api').PacemakerDashboard | null>} */
  const pacemakerDashboard = ref(null)
  const depositTargets = ref([])
  const histories = ref([])
  const isDepositTargetsLoading = ref(false)
  const depositTargetsError = ref(null)
  const isHistoriesLoading = ref(false)
  const historiesError = ref(null)
  const isToggling = ref(false)
  const toggleError = ref(null)
  const isStatusLoading = ref(false)
  const statusError = ref(null)
  const dashboardError = ref(null)
  /** @type {import('vue').Ref<Record<number, import('@/features/pacemaker/api/pacemaker.api').AccountDetail>>} */
  const accountDetails = ref({})
  const accountDetailRequests = new Map()
  let depositTargetsRequestId = 0
  let historiesRequestId = 0
  const { currentDate, localDateKey } = useLocalDateClock()

  function $reset() {
    pacemakerStatus.value = null
    pacemakerDashboard.value = null
    depositTargets.value = []
    histories.value = []
    isDepositTargetsLoading.value = false
    depositTargetsError.value = null
    isHistoriesLoading.value = false
    historiesError.value = null
    isToggling.value = false
    toggleError.value = null
    isStatusLoading.value = false
    statusError.value = null
    dashboardError.value = null
    accountDetails.value = {}
    accountDetailRequests.clear()
    depositTargetsRequestId += 1
    historiesRequestId += 1
  }

  const DAY_OF_WEEK_NAMES = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ]

  // 기존 대시보드 컴포넌트가 최신 API 필드를 사용할 수 있도록 만든 화면용 모델
  const pacemakerView = computed(() => {
    const status = pacemakerStatus.value
    const dashboard = pacemakerDashboard.value
    const currentStatus = dashboard?.status ?? status?.status ?? null
    // 서버가 "오늘" 날짜를 내려주지 않으므로(saved 불리언만 옴) 로컬 오늘 날짜의 월을 기준으로 집계한다.
    const referenceMonth = localDateKey.value.slice(0, 7)
    let monthlySecuredAmount = 0
    let monthlySuccessCountFromHistories = 0
    histories.value.forEach((item) => {
      if (item.status === 'SAVED' && item.date?.startsWith(referenceMonth)) {
        monthlySecuredAmount += item.amount ?? 0
        monthlySuccessCountFromHistories += 1
      }
    })

    return {
      // 상태 조회 전/실패를 실제 미개설(false)과 구분한다.
      registered: status?.registered ?? null,
      status: currentStatus,
      enabled: currentStatus === 'ACTIVE',
      moneyBoxBalance: dashboard?.moneyBox?.balance ?? 0,
      moneyBoxId: dashboard?.moneyBox?.moneyBoxId ?? null,
      maskedAccountNumber: dashboard?.moneyBox?.maskedAccountNumber ?? '',
      todaySavingAmount: dashboard?.todaySaving?.saved ? (dashboard.todaySaving.amount ?? 0) : 0,
      // 서버가 아직 집계를 못 채워 null을 주는 계정이 있어(정상적으로 내려주는 0은 그대로 존중),
      // null일 때만 이미 받아온 저축 내역(histories)으로 같은 값을 대신 계산한다. TODO: 서버가
      // currentStreak/monthlySuccessCount/weeklyStreak를 항상 채워주게 되면 이 폴백은 제거한다.
      currentStreak:
        dashboard?.currentStreak ?? computeStreakFromHistories(histories.value, currentDate.value),
      maxAmount: dashboard?.maxAmount ?? 0,
      monthlySecuredAmount,
      monthlySuccessCount: dashboard?.monthlySuccessCount ?? monthlySuccessCountFromHistories,
      weeklyStreak:
        dashboard?.weeklyStreak ??
        computeWeeklyStreakFromHistories(histories.value, currentDate.value),
    }
  })

  async function fetchPacemakerStatus() {
    isStatusLoading.value = true

    try {
      const status = await pacemakerApi.getPacemakerStatus()
      if (typeof status?.registered !== 'boolean') {
        throw new Error('페이스메이커 상태를 확인할 수 없습니다.')
      }

      pacemakerStatus.value = status
      statusError.value = null
      return status
    } catch (error) {
      statusError.value = error
      throw error
    } finally {
      isStatusLoading.value = false
    }
  }

  // 오늘 또는 어제부터 거꾸로 연속 여부를 센다. 오늘 배치는 아직 안 돌았을 수 있어 하루만 봐주지만,
  // 어제도 기록이 없으면 이미 끊긴 것이므로 봐주지 않는다(과거의 마지막 저축일을 기준으로 삼지 않는다).
  function computeStreakFromHistories(historyItems, referenceDate = new Date()) {
    const savedDates = new Set(
      historyItems.filter((item) => item.status === 'SAVED').map((item) => item.date)
    )
    if (savedDates.size === 0) return 0

    const today = new Date(referenceDate)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    let cursor
    if (savedDates.has(getLocalDateKey(today))) {
      cursor = today
    } else if (savedDates.has(getLocalDateKey(yesterday))) {
      cursor = yesterday
    } else {
      return 0
    }

    let streak = 0
    while (savedDates.has(getLocalDateKey(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }

  function computeWeeklyStreakFromHistories(historyItems, referenceDate = new Date()) {
    const byDate = new Map(historyItems.map((item) => [item.date, item]))
    const today = new Date(referenceDate)
    const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      const item = byDate.get(getLocalDateKey(date))
      const saved = item?.status === 'SAVED'
      return {
        dayOfWeek: DAY_OF_WEEK_NAMES[date.getDay()],
        amount: saved ? (item.amount ?? 0) : 0,
        saved,
      }
    })
  }

  /**
   * 페이스메이커 전용 저금통을 개설합니다. (연동 계좌·상한액·활성화까지 한 번에 처리)
   * 이미 개설된 상태라면 중복 생성하지 않고 alreadyRegistered로 알린다.
   * @param {number} maxAmount
   * @param {number} accountId
   * @returns {Promise<{ status: object, maxAmount: number, alreadyRegistered: boolean }>}
   */
  async function setupPacemaker(maxAmount, accountId) {
    const currentStatus = await fetchPacemakerStatus()

    if (currentStatus.registered) {
      return { status: currentStatus, maxAmount, alreadyRegistered: true }
    }

    const created = await pacemakerApi.createPacemaker({ accountId, maxAmount })
    const status = {
      autoSavingId: created.autoSavingId,
      registered: true,
      status: created.autoSavingStatus,
      enabled: created.autoSavingStatus === 'ACTIVE',
    }
    pacemakerStatus.value = status

    return { status, maxAmount: created.maxAmount, alreadyRegistered: false }
  }

  async function fetchPacemakerDashboard() {
    try {
      pacemakerDashboard.value = await pacemakerApi.getPacemakerDashboard()
      dashboardError.value = null
      return pacemakerDashboard.value
    } catch (error) {
      dashboardError.value = error
      throw error
    }
  }

  async function fetchDepositTargets() {
    const requestId = ++depositTargetsRequestId
    isDepositTargetsLoading.value = true

    try {
      const result = await pacemakerApi.getPacemakerGoals()
      if (requestId === depositTargetsRequestId) {
        depositTargets.value = result?.goals ?? []
        depositTargetsError.value = null
      }
      return depositTargets.value
    } catch (error) {
      if (requestId === depositTargetsRequestId) depositTargetsError.value = error
      throw error
    } finally {
      if (requestId === depositTargetsRequestId) isDepositTargetsLoading.value = false
    }
  }

  /**
   * 계좌/저금통 상세(accountName 등)를 조회해 캐시합니다. 이미 캐시됐거나 요청 중이면 그대로 재사용합니다.
   * @param {number} accountId
   * @returns {Promise<import('@/features/pacemaker/api/pacemaker.api').AccountDetail | null>}
   */
  async function fetchAccountDetail(accountId) {
    if (!accountId) return null
    if (accountDetails.value[accountId]) return accountDetails.value[accountId]
    if (accountDetailRequests.has(accountId)) return accountDetailRequests.get(accountId)

    const request = pacemakerApi
      .getAccountDetail(accountId)
      .then((detail) => {
        accountDetails.value = { ...accountDetails.value, [accountId]: detail }
        return detail
      })
      .catch(() => null)
      .finally(() => accountDetailRequests.delete(accountId))

    accountDetailRequests.set(accountId, request)
    return request
  }

  async function togglePacemaker() {
    if (!pacemakerStatus.value?.autoSavingId || isToggling.value) return null

    const nextStatus = pacemakerStatus.value.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    isToggling.value = true
    toggleError.value = null

    try {
      const result = await pacemakerApi.updatePacemakerStatus(
        pacemakerStatus.value.autoSavingId,
        nextStatus
      )

      pacemakerStatus.value = { ...pacemakerStatus.value, ...result }
      if (pacemakerDashboard.value) pacemakerDashboard.value.status = result.status
      return result
    } catch (error) {
      toggleError.value = error
      return null
    } finally {
      isToggling.value = false
    }
  }

  async function updateMaxAmount(maxAmount) {
    const autoSavingId =
      pacemakerStatus.value?.autoSavingId ?? (await fetchPacemakerStatus()).autoSavingId
    if (!autoSavingId) throw new Error('페이스메이커가 개설되지 않았어요.')

    const result = await pacemakerApi.updatePacemakerMaxAmount(autoSavingId, maxAmount)
    if (pacemakerDashboard.value) pacemakerDashboard.value.maxAmount = result.maxAmount
    return result
  }

  /**
   * @param {number} assetId 목표 연결 자산 ID (`/pace-maker/goals`의 depositAssets[].assetId)
   * @param {'ACCOUNT' | 'MONEY_BOX' | 'LOAN'} assetType
   * @param {number} amount
   * @param {number} moneyBoxId
   */
  async function depositToGoal(assetId, assetType, amount, moneyBoxId) {
    const result = await pacemakerApi.depositToGoalAsset({ assetId, assetType, amount, moneyBoxId })
    if (pacemakerDashboard.value?.moneyBox) {
      pacemakerDashboard.value.moneyBox.balance = result.remainingBalance
    }
    return result
  }

  async function fetchHistories(params) {
    const requestId = ++historiesRequestId
    isHistoriesLoading.value = true

    try {
      const result = await pacemakerApi.getPacemakerHistories(params)
      if (requestId === historiesRequestId) {
        histories.value = result?.content ?? []
        historiesError.value = null
      }
      return histories.value
    } catch (error) {
      if (requestId === historiesRequestId) historiesError.value = error
      throw error
    } finally {
      if (requestId === historiesRequestId) isHistoriesLoading.value = false
    }
  }

  return {
    pacemakerStatus,
    pacemakerDashboard,
    pacemakerView,
    depositTargets,
    histories,
    isDepositTargetsLoading,
    depositTargetsError,
    isHistoriesLoading,
    historiesError,
    isToggling,
    toggleError,
    isStatusLoading,
    statusError,
    dashboardError,
    accountDetails,
    fetchPacemakerStatus,
    setupPacemaker,
    fetchPacemakerDashboard,
    fetchDepositTargets,
    fetchAccountDetail,
    togglePacemaker,
    updateMaxAmount,
    depositToGoal,
    fetchHistories,
    $reset,
  }
})
