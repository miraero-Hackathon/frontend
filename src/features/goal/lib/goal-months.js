const GOAL_MONTH_PATTERN = /^(\d{4})-(\d{2})$/

function parseGoalMonth(value) {
  const match = GOAL_MONTH_PATTERN.exec(value ?? '')
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isInteger(year) || month < 1 || month > 12) return null

  return { year, month }
}

export function normalizeGoalMonth(value) {
  const candidate = String(value ?? '').slice(0, 7)
  return parseGoalMonth(candidate) ? candidate : ''
}

export function calculateGoalMonths(targetMonth, fromDate = new Date()) {
  const target = parseGoalMonth(targetMonth)
  if (!target || Number.isNaN(fromDate.getTime())) return 0

  const currentMonthIndex = fromDate.getFullYear() * 12 + fromDate.getMonth()
  const targetMonthIndex = target.year * 12 + target.month - 1
  return targetMonthIndex - currentMonthIndex
}

export function getMinimumGoalMonth(fromDate = new Date()) {
  if (Number.isNaN(fromDate.getTime())) return ''

  const nextMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 1)
  const year = nextMonth.getFullYear()
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 목표 월 초기값이 선택 가능한 최소 월보다 과거면 최소 월로 올린다.
 * 목표일이 임박·경과한 목표에서 사용자가 아무것도 바꾸지 않아도 저장이 거부되는 것을 막는다.
 * 두 값 모두 zero-padded `YYYY-MM`이라 문자열 비교로 충분하다.
 */
export function clampGoalMonth(value, minimumMonth) {
  const normalized = normalizeGoalMonth(value)
  if (!normalized) return ''

  const minimum = normalizeGoalMonth(minimumMonth)
  if (!minimum) return normalized

  return normalized < minimum ? minimum : normalized
}

export function formatGoalMonth(value) {
  const normalized = normalizeGoalMonth(value)
  return normalized ? normalized.replace('-', '.') : ''
}
