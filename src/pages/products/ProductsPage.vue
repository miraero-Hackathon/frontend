<template>
  <div class="min-h-full bg-[#f8fafc] pb-28 sm:pb-16">
    <RoadmapSelector
      :goals="goals"
      :selected-goal-id="selectedGoalId"
      :disabled="areGoalsLoading"
      @update:selected-goal-id="goalStore.selectGoal"
    />

    <div class="page-container pb-10 pt-4 sm:pb-14 sm:pt-6">
      <!-- 1. 상단 맞춤 추천 비교 카드 -->
      <section
        class="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,35,70,0.04)] sm:p-6"
        aria-labelledby="recommendation-summary-title"
      >
        <!-- 로딩 상태 -->
        <div v-if="isRecommendationLoading" class="space-y-3 py-2">
          <div class="h-4 w-40 animate-pulse rounded-lg bg-slate-100" />
          <div class="h-14 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <template v-else>
          <p class="flex items-baseline gap-1.5 font-bold">
            <span class="text-base tracking-tight text-primary sm:text-lg">
              {{ selectedGoalName }}
            </span>
            <span class="text-xs text-slate-400">기준</span>
          </p>
          <h2
            id="recommendation-summary-title"
            class="mt-1 text-lg font-bold tracking-tight text-[#0a192f] sm:text-xl"
          >
            <template v-if="hasNoMaturityEligibleProducts">
              목표 기간 내 만기 상품이 없어요
            </template>
            <template v-else-if="hasOnlyMoneyBox"> 저금통 이자 혜택을 더해보세요 </template>
            <template v-else-if="linkedAssets.length > 0"> 추천 상품을 비교했어요 </template>
            <template v-else> 현재 로드맵 연결 자산을 확인하지 못했어요 </template>
          </h2>
          <p
            v-if="hasNoMaturityEligibleProducts"
            class="mt-1 text-xs leading-relaxed text-slate-500"
          >
            기간을 조정하면 이용할 수 있는 상품도 함께 보여드려요.
          </p>

          <!-- 핵심 비교: 현재 금리 → 추천 최고 금리 -->
          <div
            v-if="linkedAssets.length > 0 || bestProduct"
            class="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <span class="text-[11px] font-bold text-slate-400">
                  {{ linkedAssets.length > 0 ? '현재 자산 금리' : '일반 저금통' }}
                </span>
                <p class="mt-1 text-lg font-bold tabular-nums text-[#0a192f] sm:text-xl">
                  {{ linkedAssets.length > 0 ? `연 ${formatRate(currentInterestRate)}%` : '0%' }}
                </p>
              </div>
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary"
                aria-hidden="true"
              >
                →
              </span>
              <div class="min-w-0 text-right">
                <span class="text-[11px] font-bold text-slate-400">추천 상품 금리</span>
                <p class="mt-1 text-lg font-bold tabular-nums text-primary sm:text-xl">
                  최고 연 {{ formatRate(bestRate) }}%
                </p>
              </div>
            </div>
            <div
              class="mt-3 rounded-xl bg-primary/[0.07] px-3 py-2 text-center text-[13px] font-bold text-primary"
            >
              {{
                rateDifference > 0
                  ? `+${formatRate(rateDifference)}%p 더 높은 금리 혜택`
                  : hasOnlyMoneyBox
                    ? `+${formatRate(bestRate)}%p 이자 혜택`
                    : '현재 자산과 같은 수준이에요'
              }}
            </div>
          </div>
        </template>
      </section>

      <section class="mt-3 sm:mt-6" aria-labelledby="product-list-title">
        <div class="flex items-center justify-between gap-3">
          <h2
            id="product-list-title"
            class="shrink-0 text-sm font-bold text-[#0a192f] sm:text-base"
          >
            추천 상품 {{ sortedProducts.length }}개
          </h2>
          <div
            class="no-scrollbar -my-1 flex min-w-0 items-center justify-end gap-1.5 overflow-x-auto px-0.5 py-1"
            role="tablist"
            aria-label="상품 종류"
          >
            <button
              v-for="(tab, tabIndex) in productTabs"
              :id="`${tab.value}-tab`"
              :key="tab.value"
              type="button"
              role="tab"
              class="shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 select-none sm:px-4 sm:py-2 sm:text-xs"
              :class="
                activeFilter === tab.value
                  ? 'border-primary bg-primary text-white shadow-[0_4px_14px_rgba(0,102,255,0.22)]'
                  : 'border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-[#0a192f]'
              "
              :aria-selected="activeFilter === tab.value"
              :aria-controls="`${tab.value}-panel`"
              :tabindex="activeFilter === tab.value ? 0 : -1"
              @click="activeFilter = tab.value"
              @keydown="handleProductTabKeydown($event, tabIndex)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div
          :id="`${activeFilter}-panel`"
          role="tabpanel"
          :aria-labelledby="`${activeFilter}-tab`"
          class="mt-3"
          tabindex="0"
        >
          <div
            v-if="isRecommendationLoading"
            class="grid gap-3 pb-4 sm:gap-4 md:grid-cols-2 xl:grid-cols-3"
            aria-label="상품 목록을 불러오는 중"
          >
            <div
              v-for="index in 6"
              :key="index"
              class="h-[178px] animate-pulse rounded-[18px] border border-[#e1e8f1] bg-white p-5"
            >
              <div class="h-3 w-20 rounded bg-slate-100" />
              <div class="mt-3 h-5 w-2/3 rounded bg-slate-100" />
              <div class="mt-5 h-11 rounded-xl bg-slate-100" />
              <div class="mt-3 h-14 rounded-xl bg-slate-100" />
            </div>
          </div>

          <div
            v-else-if="productsStore.error"
            class="flex min-h-[300px] flex-col items-center justify-center rounded-[18px] border border-[#e1e8f1] bg-white px-6 text-center"
          >
            <div
              class="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-500"
            >
              !
            </div>
            <p class="mt-3 text-[15px] font-bold text-[#10233f]">상품을 불러오지 못했어요</p>
            <p class="mt-1 text-[13px] text-slate-400">잠시 후 다시 시도해 주세요.</p>
            <button
              type="button"
              class="mt-4 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-white"
              @click="fetchAllProducts(true)"
            >
              다시 시도
            </button>
          </div>

          <div
            v-else-if="sortedProducts.length === 0"
            class="flex min-h-[300px] flex-col items-center justify-center rounded-[18px] border border-[#e1e8f1] bg-white px-6 text-center"
          >
            <div
              class="flex size-11 items-center justify-center rounded-full bg-[#eef5ff] text-primary"
            >
              %
            </div>
            <p class="mt-3 text-[15px] font-bold text-[#10233f]">확인 가능한 상품이 아직 없어요</p>
            <button
              type="button"
              class="mt-4 rounded-xl border border-primary/20 px-5 py-2.5 text-[13px] font-bold text-primary"
              @click="activeFilter = 'all'"
            >
              전체 상품 보기
            </button>
          </div>

          <div v-else class="grid gap-3 pb-4 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ProductCard
              v-for="(product, productIndex) in sortedProducts"
              :key="`${product.productType}-${getProductId(product)}`"
              :product="product"
              :product-type="product.productType"
              :is-highest-rate="Number(product.maximumInterestRate) === actualBestRate"
              :is-top-recommended="productIndex === 0"
              :goal-name="selectedGoalName"
              :eligible-maturity-terms="product.eligibleMaturityTerms"
              :recommendation-impact="product.recommendationImpact"
              :has-linked-assets="linkedAssets.length > 0"
              :has-only-money-box="hasOnlyMoneyBox"
              :current-interest-rate="currentInterestRate"
              @view-detail="openProductDetail"
            />
          </div>
        </div>
      </section>

      <div
        class="mt-3 flex items-start gap-2.5 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-[11px] leading-relaxed text-slate-400 shadow-xs sm:mt-6"
      >
        <span
          class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-[10px] font-bold text-slate-600"
          aria-hidden="true"
        >
          i
        </span>
        <p>
          본 정보는 비교를 위한 참고 자료이며 금융상품 구매 권유가 아닙니다. 표시된 금리는 세전
          기준이며, 우대조건 충족 여부와 금융기관 공시에 따라 달라질 수 있습니다. 목표 단축 개월은
          현재 모은 금액과 남은 기간으로 월 목표 저축액을 추정하고 상품 기본금리를 적용한
          예상값입니다.
        </p>
      </div>
    </div>

    <ProductDetailModal
      :open="isDetailOpen"
      :product="productsStore.selectedProduct"
      :product-type="selectedProductType"
      :is-loading="productsStore.isDetailLoading"
      :has-error="Boolean(productsStore.detailError)"
      @close="closeProductDetail"
      @retry="retryProductDetail"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { goalApi, useGoalStore } from '@/features/goal'
import {
  CALCULATION_STATUS,
  ProductCard,
  ProductDetailModal,
  calculateRecommendationImpact,
  getMaturityEligibleTerms,
  calculateWeightedInterestRate,
  formatRate,
  isLinkedProduct,
  useProductsStore,
} from '@/features/products'
import RoadmapSelector from '@/shared/ui/RoadmapSelector.vue'
import productsIcon from '@/assets/icons/products.svg'
import { formatKRWCompact } from '@/shared/lib/money'

const productTabs = [
  { value: 'all', label: '전체' },
  { value: 'saving', label: '적금' },
  { value: 'deposit', label: '예금' },
]

const goalStore = useGoalStore()
const productsStore = useProductsStore()
const { goals, selectedGoalId, selectedGoal, areGoalsLoading } = storeToRefs(goalStore)

const activeFilter = ref('all')
const isDetailOpen = ref(false)
const detailProductId = ref(null)
const selectedProductType = ref('deposit')
const appliedGoalDetail = ref(null)
const linkedAssets = ref([])
const linkedAccounts = ref([])
const isAppliedProductLoading = ref(false)
let appliedProductRequestId = 0

const selectedGoalName = computed(() => selectedGoal.value?.goalName ?? '선택한 목표')
const roadmapHelperText = computed(() =>
  selectedGoal.value
    ? `‘${selectedGoal.value.goalName}’ 로드맵에 맞춘 추천이에요`
    : ''
)
const isRecommendationLoading = computed(
  () => areGoalsLoading.value || productsStore.isLoading || isAppliedProductLoading.value
)

const allProducts = computed(() => [
  ...productsStore.productsByType.saving.map((product) => ({
    ...product,
    productType: 'saving',
  })),
  ...productsStore.productsByType.deposit.map((product) => ({
    ...product,
    productType: 'deposit',
  })),
])

const recommendationProducts = computed(() =>
  allProducts.value
    .filter((product) => !isLinkedProduct(product, product.productType, linkedAccounts.value))
    .map((product) => ({
      ...product,
      eligibleMaturityTerms: getMaturityEligibleTerms(
        product,
        appliedGoalDetail.value?.period?.remainMonths
      ),
      recommendationImpact: calculateRecommendationImpact({
        goal: appliedGoalDetail.value,
        linkedAssets: linkedAssets.value,
        product,
        productType: product.productType,
      }),
    }))
)

const hasNoMaturityEligibleProducts = computed(() => {
  const remainMonths = Number(appliedGoalDetail.value?.period?.remainMonths)
  return (
    Number.isFinite(remainMonths) &&
    remainMonths > 0 &&
    recommendationProducts.value.length > 0 &&
    recommendationProducts.value.every((product) => product.eligibleMaturityTerms.length === 0)
  )
})

const filteredProducts = computed(() => {
  if (activeFilter.value === 'all') return recommendationProducts.value
  return recommendationProducts.value.filter(
    (product) => product.productType === activeFilter.value
  )
})

function needsLongerPeriod(product) {
  const termCount = new Set([
    ...(product.saveTerms ?? []),
    ...(product.options ?? []).map((option) => option.saveTerm),
  ]).size

  return (
    product.recommendationImpact?.calculationStatus === CALCULATION_STATUS.NOT_APPLICABLE &&
    (product.eligibleMaturityTerms?.length ?? 0) === 0 &&
    termCount > 0
  )
}

function sortRecommendedProducts(products) {
  return [...products].sort((a, b) => {
    const aNeedsLongerPeriod = needsLongerPeriod(a)
    const bNeedsLongerPeriod = needsLongerPeriod(b)
    if (aNeedsLongerPeriod !== bNeedsLongerPeriod) {
      return aNeedsLongerPeriod ? 1 : -1
    }
    return Number(b.maximumInterestRate) - Number(a.maximumInterestRate)
  })
}

const sortedProducts = computed(() => sortRecommendedProducts(filteredProducts.value))

// 상단 요약 카드의 "추천 상품 금리"는 실제 목록에서 '추천' 태그가 붙는 1순위 상품과 일치해야 하므로,
// 탭 필터와 무관하게 전체 추천 상품을 동일한 정렬 기준으로 계산한다.
const bestProduct = computed(() => sortRecommendedProducts(recommendationProducts.value)[0] ?? null)

const bestRate = computed(() => Number(bestProduct.value?.maximumInterestRate ?? 0))

// '최고금리' 뱃지는 정렬 순서와 무관하게 실제 금리가 가장 높은 상품에 표시되어야 한다.
const actualBestRate = computed(() =>
  recommendationProducts.value.reduce(
    (max, product) => Math.max(max, Number(product.maximumInterestRate ?? 0)),
    0
  )
)

const hasOnlyMoneyBox = computed(
  () =>
    linkedAssets.value.length > 0 &&
    linkedAssets.value.every((asset) => asset.assetType === 'MONEY_BOX')
)

const currentInterestRate = computed(() => calculateWeightedInterestRate(linkedAssets.value))

const rateDifference = computed(() => bestRate.value - currentInterestRate.value)

const estimatedMonthlyContribution = computed(() => {
  const goalAmount = Number(appliedGoalDetail.value?.goalAmount)
  const currentAmount = Number(appliedGoalDetail.value?.currentAmount)
  const remainMonths = Number(appliedGoalDetail.value?.period?.remainMonths)
  if (![goalAmount, currentAmount, remainMonths].every(Number.isFinite) || remainMonths <= 0) {
    return 0
  }
  return Math.max(0, (goalAmount - currentAmount) / remainMonths)
})

onMounted(async () => {
  await Promise.all([goalStore.fetchGoals(), fetchAllProducts()])
})

watch(selectedGoalId, fetchAppliedProduct, { immediate: true })

async function fetchAppliedProduct(goalId) {
  const requestId = ++appliedProductRequestId

  if (!goalId) {
    appliedGoalDetail.value = null
    linkedAssets.value = []
    linkedAccounts.value = []
    isAppliedProductLoading.value = false
    return
  }

  isAppliedProductLoading.value = true
  try {
    const [linkedAssetData, goalDetail] = await Promise.all([
      goalApi.getGoalLinkedAssets(goalId),
      goalApi.getGoalDetail(goalId),
    ])
    if (requestId !== appliedProductRequestId) return

    const accountAssets = linkedAssetData.linkedAssets.filter(
      (asset) => asset.assetType === 'ACCOUNT'
    )
    let accounts = []
    if (accountAssets.length > 0) {
      try {
        accounts = (await goalApi.getAccounts()).accounts
      } catch {
        accounts = []
      }
    }
    if (requestId !== appliedProductRequestId) return

    linkedAssets.value = linkedAssetData.linkedAssets
    linkedAccounts.value = accountAssets.map((asset) => ({
      asset,
      accountDetail:
        accounts.find((account) => Number(account.accountId) === Number(asset.assetId)) ?? null,
    }))
    appliedGoalDetail.value = goalDetail
  } catch {
    if (requestId === appliedProductRequestId) {
      appliedGoalDetail.value = null
      linkedAssets.value = []
      linkedAccounts.value = []
    }
  } finally {
    if (requestId === appliedProductRequestId) {
      isAppliedProductLoading.value = false
    }
  }
}

async function fetchAllProducts(force = false) {
  await Promise.all([
    productsStore.fetchProducts('deposit', { force }),
    productsStore.fetchProducts('saving', { force }),
  ])
}

function getProductId(product) {
  return product.depositProductId ?? product.savingProductId
}

function handleProductTabKeydown(event, currentIndex) {
  const keyTargets = {
    ArrowRight: (currentIndex + 1) % productTabs.length,
    ArrowLeft: (currentIndex - 1 + productTabs.length) % productTabs.length,
    Home: 0,
    End: productTabs.length - 1,
  }
  const nextIndex = keyTargets[event.key]
  if (nextIndex === undefined) return

  event.preventDefault()
  const nextTab = productTabs[nextIndex]
  activeFilter.value = nextTab.value
  nextTick(() => document.getElementById(`${nextTab.value}-tab`)?.focus())
}

async function openProductDetail(product) {
  selectedProductType.value = product.productType
  detailProductId.value = getProductId(product)
  isDetailOpen.value = true

  if (product.isDetailLoaded) {
    productsStore.selectProduct(product)
    return
  }

  await productsStore.fetchProductDetail(selectedProductType.value, detailProductId.value)
}

function closeProductDetail() {
  isDetailOpen.value = false
  detailProductId.value = null
  productsStore.clearSelectedProduct()
}

function retryProductDetail() {
  if (detailProductId.value) {
    productsStore.fetchProductDetail(selectedProductType.value, detailProductId.value)
  }
}
</script>
