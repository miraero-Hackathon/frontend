import { calculateAge } from '@/shared/lib/date'

export { calculateAge }

/**
 * @typedef {Object} EligibilityCheckItem
 * @property {string} label
 * @property {boolean} matched
 */

/**
 * 정책 상세의 나이·소득 조건과 마이페이지 프로필을 비교해 실제 충족 여부를 계산한다.
 * (매칭 판정 자체는 서버가 주는 값이 아니라 두 real API 응답을 프론트에서 비교한 결과다.)
 * @param {{ minAge?: number|null, maxAge?: number|null, minIncome?: number|null, maxIncome?: number|null }} policy
 * @param {{ birthDate?: string|null, monthlyIncome?: number|null } | null} profile
 * @returns {EligibilityCheckItem[]}
 */
export function getEligibilityChecklist(policy, profile) {
  const items = []
  const age = calculateAge(profile?.birthDate)
  const annualIncome = profile?.monthlyIncome != null ? profile.monthlyIncome * 12 : null

  if (policy.minAge != null || policy.maxAge != null) {
    const rangeLabel =
      policy.minAge != null && policy.maxAge != null
        ? `만 ${policy.minAge}~${policy.maxAge}세`
        : policy.minAge != null
          ? `만 ${policy.minAge}세 이상`
          : `만 ${policy.maxAge}세 이하`

    items.push({
      label: age != null ? `나이 조건 (${rangeLabel}, 내 나이 ${age}세)` : `나이 조건 (${rangeLabel})`,
      matched:
        age != null &&
        (policy.minAge == null || age >= policy.minAge) &&
        (policy.maxAge == null || age <= policy.maxAge),
    })
  }

  if (policy.minIncome != null || policy.maxIncome != null) {
    items.push({
      label: '소득 조건',
      matched:
        annualIncome != null &&
        (policy.minIncome == null || annualIncome >= policy.minIncome) &&
        (policy.maxIncome == null || annualIncome <= policy.maxIncome),
    })
  }

  return items
}
