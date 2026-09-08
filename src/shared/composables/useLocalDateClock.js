import { computed, onScopeDispose, ref } from 'vue'
import { getLocalDateKey } from '@/shared/lib/date'

/**
 * 로컬 자정마다 현재 날짜를 갱신하는 반응형 시계입니다.
 * 탭이 백그라운드에 있어 타이머 실행이 늦어져도 실행 시점의 실제 날짜로 보정합니다.
 */
export function useLocalDateClock() {
  const currentDate = ref(new Date())
  let midnightTimer = null

  function scheduleNextMidnight() {
    const now = new Date()
    currentDate.value = now

    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0)
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime() + 100)

    midnightTimer = setTimeout(scheduleNextMidnight, delay)
  }

  scheduleNextMidnight()
  onScopeDispose(() => clearTimeout(midnightTimer))

  const localDateKey = computed(() => getLocalDateKey(currentDate.value))

  return { currentDate, localDateKey }
}
