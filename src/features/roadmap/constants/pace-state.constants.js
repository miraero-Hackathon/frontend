// 목표 페이스 계산 단일 소스
//
// 서버가 내려주는 currentAmount(누적 저축액)/goalAmount(목표 금액)/pace.expectedAmount(현재 시점까지
// 계획상 모았어야 하는 누적 금액)는 전부 "누적" 값이다. 화면에 "/월"로 보여줄 값은 이 누적 값을
// 그대로 쓰면 안 되고, 경과/전체 개월 수로 나눈 실제 월평균 속도로 다시 계산해야 한다.
//
// startAmount(목표 생성 당시 이미 가지고 있던 금액)는 "목표를 위해 모은 돈"이 아니므로
// 페이스 계산(월 저축 속도)에서는 반드시 제외한다 — 아니면 생성 직후부터 페이스가
// 비정상적으로 높게 잡히거나 NOT_STARTED가 아닌 상태로 오판된다.
//
//   savedSinceStart    = max(0, currentAmount - startAmount)  (목표 생성 이후 실제로 추가 저축한 금액)
//   remainingToSave    = max(0, goalAmount - startAmount)     (시작 금액을 제외하고 앞으로 모아야 하는 금액)
//   currentMonthlyPace = savedSinceStart / elapsedMonths      (지금까지의 월평균 저축 속도)
//   targetMonthlyPace  = remainingToSave / totalGoalMonths    (목표 달성에 필요한 월 저축 속도)
//   paceDifference     = currentMonthlyPace - targetMonthlyPace
//
// 로드맵 캐릭터 위치(누적 진행률)는 반대로 시작 금액을 포함한 "전체 누적치"를 그대로 써야 한다
// (마일스톤은 currentAmount 절대값 기준이라 startAmount와 무관하다. 월 페이스와 섞으면 안 됨).
//   currentProgress  = currentAmount / goalAmount * 100
//   expectedProgress = expectedAmount / goalAmount * 100

export const PACE_STATE = {
  NOT_STARTED: 'NOT_STARTED',
  ON_TRACK: 'ON_TRACK',
  AHEAD: 'AHEAD',
  BEHIND: 'BEHIND',
}

// 반올림 시 화면에 "0만원"으로 표시되는 오차 범위는 ON_TRACK으로 취급해
// 표시 상태(state)와 표시 숫자(label)가 항상 일치하도록 한다.
const NEGLIGIBLE_MANWON = 0.5

// 목표 기간이 월 단위(YYYY-MM)로만 관리되어 일 단위 경과를 알 수 없다. 목표를 만든 달에는
// 경과 개월이 0이라 나눗셈이 불가능하므로 최소 1개월로 보정한다 — 1로 나누는 것은 "지금까지
// 모은 금액을 그대로 보여주는 것"과 같아, 여기서 더 줄일수록(0에 가까울수록) 오히려 같은
// 금액이 더 큰 월 페이스로 부풀려진다. 즉 1은 왜곡을 최소화하는 안전한 하한선이다.
const MIN_ELAPSED_MONTHS = 1

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

// 목표 생성 이후 실제로 추가 저축한 금액 (시작 금액 제외, 음수 방지)
function calculateSavedSinceStart(goal) {
  const currentAmount = Number(goal?.currentAmount ?? 0)
  const startAmount = Number(goal?.startAmount ?? 0)
  return Math.max(0, currentAmount - startAmount)
}

/**
 * goal 원본(currentAmount/startAmount/goalAmount/pace.expectedAmount/period.{goalMonths,remainMonths})으로부터
 * 월 페이스와 누적 진행률을 함께 계산한다.
 */
export function deriveGoalPaceMetrics(goal) {
  const currentAmount = Number(goal?.currentAmount ?? 0)
  const startAmount = Number(goal?.startAmount ?? 0)
  const goalAmount = Number(goal?.goalAmount ?? 0)
  const expectedAmount = Number(goal?.pace?.expectedAmount ?? 0)
  const goalMonths = Number(goal?.period?.goalMonths ?? 0)
  const remainMonths = Number(goal?.period?.remainMonths ?? 0)

  const elapsedMonths = Math.max(MIN_ELAPSED_MONTHS, goalMonths - remainMonths)

  const savedSinceStart = calculateSavedSinceStart(goal)
  const remainingToSave = Math.max(0, goalAmount - startAmount)

  const currentMonthlyPace = elapsedMonths > 0 ? savedSinceStart / elapsedMonths : 0
  const targetMonthlyPace = goalMonths > 0 ? remainingToSave / goalMonths : 0
  const paceDifference = currentMonthlyPace - targetMonthlyPace

  // 캐릭터 위치는 시작 금액을 포함한 전체 누적 진행률 그대로(월 페이스와 다른 기준) 사용한다.
  const currentProgress = goalAmount > 0 ? clampPercent((currentAmount / goalAmount) * 100) : 0
  const expectedProgress = goalAmount > 0 ? clampPercent((expectedAmount / goalAmount) * 100) : 0

  return {
    currentMonthlyPace,
    targetMonthlyPace,
    paceDifference,
    currentProgress,
    expectedProgress,
  }
}

// 화면 표시 상태·문구·CTA·클릭 동작이 전부 같은 값을 바라보도록 하는 단일 판정 함수.
// - 목표 생성 이후 실제로 추가 저축한 금액이 없으면(savedSinceStart<=0) 무조건 시작 전(NOT_STARTED)
//   (currentAmount만으로 판단하면 시작 금액 때문에 저축을 시작한 것처럼 오판될 수 있다)
// - 그 외에는 새로 계산한 월 페이스 차이(paceDifference)의 부호로 판정
//   (반올림 시 "0만원"으로 보이는 오차는 ON_TRACK으로 취급해 숫자와 상태를 일치시킨다)
export function derivePaceState(goal) {
  if (!(calculateSavedSinceStart(goal) > 0)) return PACE_STATE.NOT_STARTED

  const { paceDifference } = deriveGoalPaceMetrics(goal)
  const diffManwon = paceDifference / 10000
  if (diffManwon > NEGLIGIBLE_MANWON) return PACE_STATE.AHEAD
  if (diffManwon < -NEGLIGIBLE_MANWON) return PACE_STATE.BEHIND
  return PACE_STATE.ON_TRACK
}
