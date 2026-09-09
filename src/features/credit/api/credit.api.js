import { client } from '@/shared/api/client'
import { unwrapApiData } from '@/shared/api/unwrapApiData'

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeDateTime(value) {
  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value.map(Number)
    const isValidDateTime =
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      Number.isInteger(hour) &&
      Number.isInteger(minute) &&
      Number.isInteger(second)

    if (isValidDateTime) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(
        hour
      ).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
    }
  }

  return ''
}

/**
 * Swagger GET /api/credit-score 응답 DTO를 화면용 신용 점수 모델로 변환한다.
 */
export function mapCreditScore(data) {
  return {
    currentScore: toFiniteNumber(data?.currentScore, 665),
    updatedAt: normalizeDateTime(data?.updatedAt),
  }
}

/**
 * 로그인 사용자의 현재 신용점수를 조회한다.
 */
export async function getCreditScore() {
  const { data: responseBody } = await client.get('/credit-score')
  const data = unwrapApiData(responseBody)
  return mapCreditScore(data)
}

/**
 * 단일 신용점수 변동 이력 항목을 화면용 모델로 변환한다.
 */
function mapCreditHistoryItem(item) {
  return {
    delta: toFiniteNumber(item?.delta),
    description: item?.description ?? '',
    occurredAt: normalizeDateTime(item?.occurredAt),
    reasonCode: item?.reasonCode ?? '',
    reasonDisplayName: item?.reasonDisplayName ?? '',
    scoreAfter: toFiniteNumber(item?.scoreAfter),
  }
}

/**
 * Swagger PageResponse<CreditScoreHistoryResponse>를 화면용 페이징 모델로 변환한다.
 * 스웨거 페이지는 1부터 시작하며, 최근 변동 이력이 상단에 보이도록 occurredAt 내림차순 정렬한다.
 */
export function mapCreditHistoryPage(page, { requestedPage = 1 }) {
  const content = Array.isArray(page?.content) ? page.content : []
  const historyList = content
    .map(mapCreditHistoryItem)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))

  const totalElements = Math.max(0, Math.trunc(toFiniteNumber(page?.totalElements, content.length)))
  const totalPages = Math.max(0, Math.trunc(toFiniteNumber(page?.totalPages)))
  const currentPage = Math.max(1, Math.trunc(toFiniteNumber(page?.page, requestedPage)))
  const size = Math.max(0, Math.trunc(toFiniteNumber(page?.size, content.length)))

  return {
    historyList,
    page: currentPage,
    size,
    totalElements,
    totalPages,
    first: page?.first ?? currentPage <= 1,
    last: page?.last ?? (totalPages === 0 || currentPage >= totalPages),
  }
}

/**
 * 로그인 사용자의 신용점수 변동 이력을 최신순으로 페이징 조회한다.
 * @param {{ page?: number, size?: number, offset?: number }} params
 */
export async function getCreditScoreHistory(params = {}) {
  const requestedPage = params?.page ?? 1
  const { data: responseBody } = await client.get('/credit-score/history', {
    params: {
      page: requestedPage,
      size: params?.size ?? 10,
      ...(params?.offset != null && { offset: params.offset }),
    },
  })

  const page = unwrapApiData(responseBody)

  return mapCreditHistoryPage({ ...page, page: Number(page?.page) }, { requestedPage })
}
