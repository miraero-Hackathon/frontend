import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as youthPolicyApi from '@/features/youth-policy/api/youthPolicy.api'
import {
  DEFAULT_PAGE_SIZE,
  POLICY_CATEGORIES,
  POLICY_CATEGORY_IDS,
} from '@/features/youth-policy/constants/youthPolicy.constants'

const DEFAULT_REGION = '전체'

/**
 * 청년 정책 목록/상세 조회 상태를 관리하는 스토어
 */
export const useYouthPolicyStore = defineStore('feature-youth-policy', () => {
  const categoryId = ref(POLICY_CATEGORY_IDS.ALL)
  const region = ref(DEFAULT_REGION)
  const searchKeyword = ref('')

  const policies = ref([])
  const page = ref(1)
  const size = ref(DEFAULT_PAGE_SIZE)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const isLastPage = ref(true)
  const isLoading = ref(false)
  const error = ref(null)

  const selectedPolicy = ref(null)
  const isDetailLoading = ref(false)
  const detailError = ref(null)

  // 페이지네이션과 무관하게 별도로 조회하는 나이·소득 조건 일치 정책
  const recommendedPolicies = ref([])
  const isRecommendedLoading = ref(false)
  const recommendedError = ref(null)

  const activeCategory = computed(
    () =>
      POLICY_CATEGORIES.find((category) => category.id === categoryId.value) ?? POLICY_CATEGORIES[0]
  )

  const hasActiveFilters = computed(
    () =>
      categoryId.value !== POLICY_CATEGORY_IDS.ALL ||
      region.value !== DEFAULT_REGION ||
      searchKeyword.value !== ''
  )

  let fetchRequestId = 0

  function applyDefaultFilters() {
    categoryId.value = POLICY_CATEGORY_IDS.ALL
    region.value = DEFAULT_REGION
    searchKeyword.value = ''
  }

  function $reset() {
    applyDefaultFilters()
    policies.value = []
    page.value = 1
    size.value = DEFAULT_PAGE_SIZE
    totalElements.value = 0
    totalPages.value = 0
    isLastPage.value = true
    isLoading.value = false
    error.value = null
    selectedPolicy.value = null
    isDetailLoading.value = false
    detailError.value = null
    recommendedPolicies.value = []
    isRecommendedLoading.value = false
    recommendedError.value = null
    fetchRequestId += 1
  }

  /**
   * 카테고리/지역/검색어와 페이지 번호를 기준으로 정책 목록을 조회한다.
   * @param {number} targetPage
   */
  async function fetchPolicies(targetPage = 1) {
    const requestId = ++fetchRequestId
    isLoading.value = true
    error.value = null
    const requestedPage = Math.max(1, targetPage)

    try {
      const response = await youthPolicyApi.getYouthPolicies({
        keyword: activeCategory.value.keyword || undefined,
        region: region.value === '전체' ? undefined : region.value,
        search: searchKeyword.value || undefined,
        page: requestedPage,
        size: size.value,
      })
      if (requestId !== fetchRequestId) return

      policies.value = response.content
      page.value = response.page ?? requestedPage
      totalElements.value = response.totalElements
      totalPages.value = response.totalPages
      isLastPage.value = response.last ?? (page.value >= response.totalPages)
    } catch (caughtError) {
      if (requestId === fetchRequestId) error.value = caughtError
    } finally {
      if (requestId === fetchRequestId) isLoading.value = false
    }
  }

  /**
   * 나이·소득 조건을 충족하는 정책을 조회하며 일반 목록 필터와 분리한다.
   * 지역 필터가 선택된 경우 해당 지역의 추천 정책도 함께 필터링한다.
   * 후보 전체의 상세(나이·소득 조건 등)를 불러와 자격 조건을 하나라도 충족하지 못하면 제외한다.
   * 후보군 자체가 mock 단계에서 소수로 관리되는 값이라 상세를 전부 불러와도 N+1 부담은 작다.
   * @param {string} [overrideRegion]
   */
  async function fetchRecommendedPolicies(overrideRegion) {
    isRecommendedLoading.value = true
    recommendedError.value = null
    const targetRegion = overrideRegion !== undefined ? overrideRegion : region.value
    const requestedRegion = targetRegion === '전체' ? undefined : targetRegion

    try {
      const response = await youthPolicyApi.getRecommendedYouthPolicies({
        region: requestedRegion,
      })

      const detailResults = await Promise.allSettled(
        response.content.map((item) => youthPolicyApi.getYouthPolicyDetail(item.youthPolicyId))
      )
      recommendedPolicies.value = response.content.map((item, index) => {
        const detailResult = detailResults[index]
        return detailResult.status === 'fulfilled' ? detailResult.value : item
      })
    } catch (caughtError) {
      recommendedError.value = caughtError
    } finally {
      isRecommendedLoading.value = false
    }
  }

  /**
   * @param {string} id POLICY_CATEGORY_IDS 값
   */
  async function setCategory(id) {
    const isChanged = categoryId.value !== id
    categoryId.value = id
    page.value = 1

    // 다른 카테고리의 목록이 남아 전환되지 않은 것처럼 보이지 않게 즉시 비운다.
    // 같은 카테고리를 다시 누른 경우에도 재조회해 실패하거나 꼬인 목록을 복구한다.
    if (isChanged) policies.value = []
    await fetchPolicies()
  }

  /**
   * @param {string} nextRegion
   */
  function setRegion(nextRegion) {
    if (region.value === nextRegion) return
    region.value = nextRegion
    fetchPolicies()
    fetchRecommendedPolicies()
  }

  /**
   * @param {string} nextKeyword
   */
  function setSearchKeyword(nextKeyword) {
    searchKeyword.value = nextKeyword
    fetchPolicies()
  }

  /**
   * 카테고리·지역·검색어 필터를 모두 초기 상태로 되돌리고 목록을 다시 조회한다.
   */
  function resetFilters() {
    if (!hasActiveFilters.value) return
    applyDefaultFilters()
    fetchPolicies()
    fetchRecommendedPolicies()
  }

  /**
   * @param {number} youthPolicyId
   */
  async function fetchPolicyDetail(youthPolicyId) {
    isDetailLoading.value = true
    detailError.value = null
    selectedPolicy.value = null
    try {
      selectedPolicy.value = await youthPolicyApi.getYouthPolicyDetail(youthPolicyId)
    } catch (caughtError) {
      detailError.value = caughtError
    } finally {
      isDetailLoading.value = false
    }
  }

  function clearSelectedPolicy() {
    selectedPolicy.value = null
    detailError.value = null
  }

  return {
    categoryId,
    region,
    searchKeyword,
    policies,
    page,
    size,
    totalElements,
    totalPages,
    isLastPage,
    isLoading,
    error,
    selectedPolicy,
    isDetailLoading,
    detailError,
    activeCategory,
    recommendedPolicies,
    isRecommendedLoading,
    recommendedError,
    hasActiveFilters,
    fetchPolicies,
    fetchRecommendedPolicies,
    setCategory,
    setRegion,
    setSearchKeyword,
    resetFilters,
    fetchPolicyDetail,
    clearSelectedPolicy,
    $reset,
  }
})
