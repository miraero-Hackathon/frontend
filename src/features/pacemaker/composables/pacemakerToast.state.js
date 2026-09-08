// 페이스메이커 토스트/알림 히스토리의 전역 싱글톤 상태.
// 로그아웃 정리 코드(@/stores/reset-user-stores)가 store를 거치지 않고 직접 비울 수 있도록
// composable에서 분리했다. 이 모듈은 vue 외의 의존성을 갖지 않는다.
import { ref } from 'vue'

export const toastList = ref([])
export const notificationHistory = ref([])
export const hasUnread = ref(false)
export const isBalanceModalOpen = ref(false)

// 예약된 토스트 타이머
const toastTimers = new Set()

// 로그아웃 전/후 토스트 작업을 구분하기 위한 버전
let toastSessionVersion = 0

export function getToastSessionVersion() {
  return toastSessionVersion
}

/**
 * 페이스메이커 토스트 관련 setTimeout을 등록한다.
 */
export function scheduleToastTask(callback, delay, sessionVersion = toastSessionVersion) {
  // 이미 로그아웃된 이전 세션의 작업이라면 예약하지 않음
  if (sessionVersion !== toastSessionVersion) return

  const timerId = setTimeout(() => {
    toastTimers.delete(timerId)

    // 예약 후 로그아웃했다면 실행하지 않음
    if (sessionVersion !== toastSessionVersion) return

    callback()
  }, delay)

  toastTimers.add(timerId)
}

/**
 * 예약된 토스트 타이머를 모두 취소한다.
 */
function clearToastTimers() {
  toastTimers.forEach((timerId) => {
    clearTimeout(timerId)
  })

  toastTimers.clear()
}

/**
 * 로그아웃이 아닌, "전체 지우기" 같은 사용자 액션으로 아직 안 뜬 예약 토스트만 취소한다.
 * 세션 버전은 올리지 않으므로 이후 새로 예약되는 토스트는 정상적으로 동작한다.
 */
export function cancelPendingToastTasks() {
  clearToastTimers()
}

export function resetPacemakerToastState() {
  // 기존 세션에서 예약된 작업을 전부 무효화
  toastSessionVersion += 1

  clearToastTimers()

  toastList.value = []
  notificationHistory.value = []
  hasUnread.value = false
  isBalanceModalOpen.value = false
}
