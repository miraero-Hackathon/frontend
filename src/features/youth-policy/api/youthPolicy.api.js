import { client } from '@/shared/api/client'

/**
 * @typedef {Object} YouthPolicyListItem
 * @property {number} youthPolicyId
 * @property {string} policyName
 * @property {string | null} policyKeyword 콤마로 구분된 정책 키워드 (예: "보조금,주거지원")
 * @property {string | null} region
 * @property {string | null} providerInstitutionName
 * @property {string | null} applicationPeriod
 */

/**
 * @typedef {Object} YouthPolicyPage
 * @property {YouthPolicyListItem[]} content
 * @property {number} page
 * @property {number} size
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {boolean} first
 * @property {boolean} last
 */

/**
 * @typedef {Object} YouthPolicyListParams
 * @property {string} [keyword] 정책 키워드 필터 (카테고리 탭도 이 파라미터에 실어 보낸다)
 * @property {string} [region] 지역
 * @property {string} [search] 정책명 검색어
 * @property {number} page 페이지 번호 (1부터 시작)
 * @property {number} size 페이지 크기
 */

/**
 * 청년 정책 목록 조회 (AUTH/GOAL과 동일하게 UI 단계에서는 MSW mock이 응답한다)
 * @param {YouthPolicyListParams} params
 * @returns {Promise<YouthPolicyPage>}
 */
export async function getYouthPolicies(params) {
  const { data: responseBody } = await client.get('/youth-policies', { params })
  const data = unwrapApiData(responseBody)
  if (!data) return data

  return {
    ...data,
    // 백엔드 PageResponse(0-based)를 화면 UI용 1-based 페이지 번호로 보정
    page: typeof data.page === 'number' ? data.page + 1 : (params?.page ?? 1),
  }
}

/**
 * 나이·소득 조건을 확인할 후보 정책 조회. 목록 페이지네이션과 무관하게 전체 후보를 대상으로 조회한다.
 * @param {{ region?: string }} [params]
 * @returns {Promise<{ content: YouthPolicyListItem[] }>}
 */
export async function getRecommendedYouthPolicies(params) {
  const { data: responseBody } = await client.get('/youth-policies/recommended', { params })
  return unwrapApiData(responseBody)
}

/**
 * @typedef {Object} YouthPolicyDetail
 * @property {number} youthPolicyId
 * @property {string} policyName
 * @property {string | null} policyKeyword
 * @property {string | null} region
 * @property {string | null} policyDescription
 * @property {string | null} supportContent
 * @property {string | null} providerInstitutionName
 * @property {string | null} applicationStartDate
 * @property {string | null} applicationEndDate
 * @property {string | null} applicationPeriod
 * @property {number | null} minAge
 * @property {number | null} maxAge
 * @property {number | null} minIncome
 * @property {number | null} maxIncome
 * @property {string | null} incomeConditionText
 * @property {string | null} qualification
 * @property {string | null} applicationMethod
 * @property {string | null} applicationUrl
 * @property {string | null} referenceUrl
 */

/**
 * 청년 정책 상세 조회
 * @param {number} youthPolicyId
 * @returns {Promise<YouthPolicyDetail>}
 */
export async function getYouthPolicyDetail(youthPolicyId) {
  const { data: responseBody } = await client.get(`/youth-policies/${youthPolicyId}`)
  return unwrapApiData(responseBody)
}

function unwrapApiData(responseBody) {
  if (
    responseBody &&
    typeof responseBody === 'object' &&
    Object.hasOwn(responseBody, 'success') &&
    Object.hasOwn(responseBody, 'data')
  ) {
    if (!responseBody.success) {
      throw new Error(responseBody.error?.message ?? 'API 요청에 실패했습니다.')
    }
    return responseBody.data
  }

  return responseBody
}
