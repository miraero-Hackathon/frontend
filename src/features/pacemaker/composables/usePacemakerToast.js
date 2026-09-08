// src/features/pacemaker/composables/usePacemakerToast.js
import { usePacemakerStore } from '@/features/pacemaker/store/pacemaker.store'
import { useGoalStore } from '@/features/goal/store/goal.store'
import { PACEMAKER_HISTORY_PAGE_SIZE } from '@/features/pacemaker/constants/pacemaker.constants'
// 전역 싱글톤 상태는 로그아웃 시 초기화할 수 있도록 별도 모듈에서 관리한다.
import {
  cancelPendingToastTasks,
  getToastSessionVersion,
  hasUnread,
  isBalanceModalOpen,
  notificationHistory,
  scheduleToastTask,
  toastList,
} from '@/features/pacemaker/composables/pacemakerToast.state'

export function usePacemakerToast() {
  // 로그아웃 시 store가 폐기되므로 setup 시점에 캡처하지 않고 사용하는 함수 안에서 가져온다.
  // (App.vue처럼 언마운트되지 않는 컴포넌트가 죽은 인스턴스를 붙잡는 것을 막는다)

  // 숫자를 한국 원화 형식으로 포맷팅 (ex: 40000 -> "40,000원")
  const formatWon = (val) => (val ? `${Number(val).toLocaleString()}원` : '0원')

  /**
   * 토스트 알림 항목 추가 (badgeIcon: '💰', '🔥' 등)
   */
  const addToast = ({ type, badgeIcon, title, body, duration = 7000 }) => {
    const id = Date.now() + Math.random()
    const newToast = { id, type, badgeIcon, title, body, createdAt: new Date() }

    // 1. 실시간 팝업 카드 추가
    toastList.value.push(newToast)

    // 2. 헤더 알림 센터 히스토리에 추가 & 읽지 않음 뱃지 ON
    notificationHistory.value.unshift(newToast)
    hasUnread.value = true

    if (duration > 0) {
      scheduleToastTask(() => {
        removeToast(id)
      }, duration)
    }
  }

  /**
   * 실시간 토스트 팝업 카드 제거
   */
  const removeToast = (id) => {
    toastList.value = toastList.value.filter((item) => item.id !== id)
  }

  /**
   * 히스토리 알림 항목 제거
   */
  const removeHistoryItem = (id) => {
    notificationHistory.value = notificationHistory.value.filter((item) => item.id !== id)
    removeToast(id)
  }

  /**
   * 읽음 처리
   */
  const markAllAsRead = () => {
    hasUnread.value = false
  }

  /**
   * 히스토리 알림 전체 비우기.
   * 아직 안 뜬(예약된) 다음 토스트도 같이 취소해야 지운 직후 다시 나타나지 않는다.
   */
  const clearHistory = () => {
    cancelPendingToastTasks()
    notificationHistory.value = []
    toastList.value = []
    hasUnread.value = false
  }

  /**
   * 여유자금 모달 제어
   */
  const openBalanceModal = () => {
    isBalanceModalOpen.value = true
  }

  const closeBalanceModal = () => {
    isBalanceModalOpen.value = false
  }

  /**
   * 여유자금은 대시보드 화면이 채우는 값이라 알림이 먼저 실행되면 아직 비어 있다.
   * 그 상태로 0으로 판단하면 💰 알림만 타이밍 때문에 빠지므로 여기서 직접 확보한다.
   * @returns {Promise<boolean | null>} true=확보함, false=조회할 목표가 없음,
   *   null=일시적인 오류로 확인하지 못함
   */
  const ensureDailyAvailableMoney = async (goalStore, forceRefresh) => {
    if (goalStore.selectedGoalId === null) {
      await goalStore.fetchGoals(forceRefresh)
      if (goalStore.goalsError) return null
    }

    const goalId = goalStore.selectedGoalId
    if (goalId === null) return false

    await goalStore.fetchSupplementaryDashboardData(goalId)
    if (goalStore.dashboardSupplementaryErrors.dailyAvailableMoney) return null

    return true
  }

  /**
   * 💰, 🔥 큼직한 이모지 뱃지 알림 2종 발송.
   * 문구에 실제 저축 금액이 들어가므로, 데이터를 확보한 뒤에만 발송한다.
   * (예전에는 데이터가 없으면 예시 숫자를 그대로 노출했다)
   * @param {{ forceRefresh?: boolean }} [options] 날짜 변경 후 전날 대시보드 캐시를 무시할지 여부
   * @returns {Promise<boolean | null>} true=발송함, false=정상적으로 알릴 내용이 없음,
   *   null=일시적인 오류로 확인하지 못함 (호출부가 나중에 다시 시도할 수 있도록 구분해서 알려준다)
   */
  const showDualNotifications = async ({ forceRefresh = false } = {}) => {
    const pacemakerStore = usePacemakerStore()
    const goalStore = useGoalStore()
    const sessionVersion = getToastSessionVersion()

    // 미개설 사용자에게는 알릴 자동 저축 내역 자체가 없다.
    let status = pacemakerStore.pacemakerStatus
    if (!status) {
      try {
        status = await pacemakerStore.fetchPacemakerStatus()
      } catch {
        return null
      }
    }
    if (!status?.registered) return false

    // 날짜가 바뀐 뒤에는 전날의 todaySaving 캐시를 사용하면 안 되므로 대시보드를 강제로 갱신한다.
    if (forceRefresh || !pacemakerStore.pacemakerDashboard) {
      try {
        await pacemakerStore.fetchPacemakerDashboard()
      } catch {
        return null
      }
    }
    if (!pacemakerStore.pacemakerDashboard) return null

    // 서버 currentStreak가 이미 있으면 폴백 계산 자체가 필요 없다.
    // null일 때만 저축 내역을 받아 계산하는데, 이때 조회가 실패하면 폴백이 조용히 0으로 깔려
    // 실제로는 스트릭이 있는데도 🔥 알림이 빠질 수 있다 — 그 상태로 "오늘 확인함"을 기록하지
    // 않도록 실패를 null로 알려 호출부가 나중에 다시 시도하게 한다.
    if (
      pacemakerStore.pacemakerDashboard.currentStreak == null &&
      (forceRefresh || !pacemakerStore.histories.length)
    ) {
      try {
        await pacemakerStore.fetchHistories({ page: 0, size: PACEMAKER_HISTORY_PAGE_SIZE })
      } catch {
        return null
      }
    }

    // 두 알림의 데이터 출처가 달라 한쪽만 준비된 채로 판단하면 나머지 하나가 조용히 빠진다.
    // 여유자금까지 확보한 뒤에 두 조건을 함께 평가한다.
    if (forceRefresh || !goalStore.dailyAvailableMoney) {
      if ((await ensureDailyAvailableMoney(goalStore, forceRefresh)) === null) return null
    }

    const { currentStreak, todaySavingAmount: rawTodaySavingAmount } = pacemakerStore.pacemakerView
    const todaySavingAmount = Number(rawTodaySavingAmount ?? 0)
    const savedToday = pacemakerStore.pacemakerDashboard.todaySaving?.saved === true
    const todayAvailableMoney = Number(goalStore.dailyAvailableMoney?.todayAvailableMoney ?? 0)

    // 목표 대시보드에 표시되는 오늘 여유자금을 동일한 출처로 알린다.
    // 값이 0인 경우에는 "0원" 알림을 만들지 않는다.
    const toasts = []
    if (todayAvailableMoney > 0) {
      toasts.push({
        type: 'AVAILABLE_MONEY',
        badgeIcon: '💰',
        title: `오늘의 여유자금: ${formatWon(todayAvailableMoney)}`,
        body: '오늘 사용 가능한 금액을 계산했어요!',
      })
    }
    // 어제까지의 기록만으로도 스트릭은 유지될 수 있으므로, 오늘 자동저축이 실제로 성공했고
    // 유효한 저축액이 있을 때만 "오늘 확보 완료" 알림을 만든다.
    if (currentStreak > 0 && savedToday && todaySavingAmount > 0) {
      toasts.push({
        type: 'STREAK',
        badgeIcon: '🔥',
        title: `연속 ${currentStreak}일째 페이스 달성 중!`,
        body: `오늘도 저금통에 여유자금 ${formatWon(todaySavingAmount)} 확보 완료!`,
      })
    }
    if (!toasts.length) return false

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const initialDelay = 1200 // 페이지 로드 후 실제 알림이 도착하듯 1.2초 뒤 첫 알림 팝업

    if (isMobile) {
      // 📱 모바일: 앞 알림이 완전히 퇴장한 뒤 다음 알림이 등장 (진짜 스마트폰 푸시 알림 형태)
      const duration = 3500
      const transitionGap = 400
      toasts.forEach((toast, index) => {
        scheduleToastTask(
          () => addToast({ ...toast, duration }),
          initialDelay + index * (duration + transitionGap),
          sessionVersion
        )
      })
    } else {
      // 💻 데스크톱: 페이지 진입 1.2초 후부터 1.2초 간격으로 스택
      toasts.forEach((toast, index) => {
        scheduleToastTask(
          () => addToast({ ...toast, duration: 7000 }),
          initialDelay + index * 1200,
          sessionVersion
        )
      })
    }

    return true
  }

  return {
    toastList,
    notificationHistory,
    hasUnread,
    isBalanceModalOpen,
    addToast,
    removeToast,
    removeHistoryItem,
    markAllAsRead,
    clearHistory,
    openBalanceModal,
    closeBalanceModal,
    showDualNotifications,
  }
}
