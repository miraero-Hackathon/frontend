// roadmap 도메인 API 함수 골격: 목표 마일스톤 (/api/goals/{goalId}/milestones)
import { client } from '@/shared/api/client'
import { unwrapApiData } from '@/shared/api/unwrapApiData'
/**
 * @typedef {Object} MilestoneResponse
 * @property {number} step
 * @property {number} percentage
 * @property {number} milestoneAmount
 * @property {boolean} achieved
 * @property {string | number[] | null} achievedAt
 * @property {{ milestoneReportId?: number, status?: string, title?: string, content?: string | null } | null} report
 */

/**
 * @param {number} goalId
 * @returns {Promise<Milestone[]>}
 */

export async function getMilestones(goalId) {
  const { data: responseBody } = await client.get(`/goals/${goalId}/milestones`)
  const data = unwrapApiData(responseBody)
  return mapMilestoneResponses(data?.milestones ?? [])
}

/**
 * achievedAt은 ISO 문자열("2026-08-18T11:25:23")과 백엔드 LocalDateTime 배열
 * ([2026, 8, 18, 11, 25, 23]) 두 형태로 모두 내려올 수 있어 정규화가 필요하다.
 * @param {string | number[] | null | undefined} value
 * @returns {string | null}
 */
function formatAchievedAt(value) {
  if (!value) return null

  if (Array.isArray(value)) {
    const [year, month, day] = value
    if (!year || !month || !day) return null
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  if (typeof value === 'string') {
    return value.slice(0, 10)
  }

  return null
}

/**
 * Swagger DTO를 기존 로드맵 컴포넌트가 사용하는 화면 모델로 변환한다.
 * 완료되지 않은 첫 단계만 현재 진행 단계이며, 나머지는 예정 단계다.
 * @param {MilestoneResponse[]} milestones
 */
export function mapMilestoneResponses(milestones) {
  const sorted = [...milestones].sort((a, b) => a.step - b.step)
  const currentStep = sorted.find((milestone) => !milestone.achieved)?.step ?? null

  return sorted.map((milestone) => ({
    milestoneId: milestone.step,
    order: milestone.step,
    targetAmount: milestone.milestoneAmount,
    targetDate: formatAchievedAt(milestone.achievedAt),
    title: milestone.report?.title ?? '',
    report: milestone.report
      ? {
          milestoneReportId: milestone.report.milestoneReportId ?? null,
          status: milestone.report.status ?? '',
          title: milestone.report.title ?? '',
          content: milestone.report.content ?? '',
        }
      : null,
    tags: [],
    status: milestone.achieved
      ? 'COMPLETED'
      : milestone.step === currentStep
        ? 'IN_PROGRESS'
        : 'UPCOMING',
    percentage: milestone.percentage,
  }))
}
