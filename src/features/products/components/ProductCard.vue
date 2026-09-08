<template>
  <article
    class="group cursor-pointer rounded-2xl border bg-white p-4 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/30 select-none sm:p-5"
    :class="isTopRecommended ? 'border-primary ring-1 ring-primary/40' : 'border-slate-200/80'"
    role="button"
    tabindex="0"
    :aria-label="`${product.productName} 상품 상세 정보 보기`"
    @click="openDetail"
    @keydown.enter="openDetail"
    @keydown.space.prevent="openDetail"
  >
    <div class="flex items-center gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <span
            class="rounded-full px-2 py-1 text-[10px] font-bold"
            :class="
              productType === 'saving'
                ? 'bg-primary/10 text-primary'
                : 'bg-indigo-50 text-indigo-600'
            "
          >
            {{ productType === 'saving' ? '적금' : '예금' }}
          </span>
          <span
            v-if="isHighestRate"
            class="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-600"
          >
            최고금리
          </span>
          <span
            v-if="isTopRecommended"
            class="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary"
          >
            추천
          </span>
        </div>

        <h3
          class="mt-3 truncate text-base font-bold tracking-tight text-[#0a192f] sm:text-lg"
          :title="product.productName"
        >
          {{ product.productName }}
        </h3>

        <p
          class="mt-2 line-clamp-1 text-xs font-semibold leading-relaxed"
          :class="isNeutralRecommendation ? 'text-slate-500' : 'text-primary/80'"
        >
          {{ impactTitle }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1 self-center">
        <div class="text-right">
          <p class="text-xl font-bold tracking-tight text-primary tabular-nums sm:text-2xl">
            연 {{ maximumRateLabel }}%
          </p>
          <p class="mt-0.5 text-[10px] font-bold text-slate-400">우대금리 포함 최고</p>
        </div>
        <span
          class="text-xl text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        >
          ›
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatRateCompact } from '@/features/products/lib/product-formatters'
import { CALCULATION_STATUS } from '@/features/products/lib/recommendation-impact'

const SIMILAR_RATE_THRESHOLD = 0.1

const props = defineProps({
  product: { type: Object, required: true },
  productType: { type: String, required: true },
  isHighestRate: { type: Boolean, default: false },
  isTopRecommended: { type: Boolean, default: false },
  goalName: { type: String, default: '선택한 목표' },
  eligibleMaturityTerms: { type: Array, default: () => [] },
  recommendationImpact: { type: Object, default: null },
  hasLinkedAssets: { type: Boolean, default: false },
  hasOnlyMoneyBox: { type: Boolean, default: false },
  currentInterestRate: { type: Number, default: null },
})

const emit = defineEmits(['view-detail'])

function openDetail() {
  emit('view-detail', props.product)
}

const terms = computed(() =>
  [
    ...new Set([
      ...(props.product.saveTerms ?? []),
      ...(props.product.options ?? []).map((option) => option.saveTerm),
    ]),
  ].sort((a, b) => a - b)
)

const maximumRateLabel = computed(() => formatRateCompact(props.product.maximumInterestRate))

const productInterestRate = computed(() => Number(props.product.maximumInterestRate))

const hasComparableInterestRates = computed(
  () =>
    props.hasLinkedAssets &&
    Number.isFinite(props.currentInterestRate) &&
    Number.isFinite(productInterestRate.value)
)

const interestRateDifference = computed(() =>
  hasComparableInterestRates.value ? productInterestRate.value - props.currentInterestRate : null
)

const impactTitle = computed(() => {
  const impact = props.recommendationImpact
  const status = impact?.calculationStatus

  if (status === CALCULATION_STATUS.CALCULATED) {
    if (impact.estimatedMonthsSaved > 0) {
      return `현재보다 목표 ${impact.estimatedMonthsSaved}개월 단축`
    }

    if (impact.estimatedAdditionalAmount > 0) {
      return `현재보다 ${impact.estimatedAdditionalAmount.toLocaleString()}원 더 모을 수 있어요`
    }
  }

  if (
    status === CALCULATION_STATUS.NOT_APPLICABLE &&
    props.eligibleMaturityTerms.length === 0 &&
    terms.value.length > 0
  ) {
    return '기간을 늘리면 이용할 수 있는 상품이에요'
  }

  if (
    hasComparableInterestRates.value &&
    interestRateDifference.value <= -SIMILAR_RATE_THRESHOLD
  ) {
    return '현재 계획을 유지하는 편이 유리해요'
  }

  if (props.hasOnlyMoneyBox && productInterestRate.value > 0) {
    return `저금통 대비 연 +${formatRateCompact(productInterestRate.value)}%p 높은 금리`
  }

  if (
    hasComparableInterestRates.value &&
    interestRateDifference.value >= SIMILAR_RATE_THRESHOLD
  ) {
    return `현재보다 최대 ${formatRateCompact(interestRateDifference.value)}%p 높은 금리예요`
  }

  if (
    hasComparableInterestRates.value &&
    Math.abs(interestRateDifference.value) < SIMILAR_RATE_THRESHOLD
  ) {
    return '현재 상품과 예상 효과가 비슷해요'
  }

  if (
    props.eligibleMaturityTerms.length > 0 &&
    (status === CALCULATION_STATUS.NOT_APPLICABLE || status === CALCULATION_STATUS.INSUFFICIENT_DATA)
  ) {
    return '가입 가능한 기간 옵션이 있어요'
  }

  if (status === CALCULATION_STATUS.NO_IMPROVEMENT) {
    return '현재 계획과 예상 효과가 비슷해요'
  }
  if (status === CALCULATION_STATUS.NOT_APPLICABLE) {
    return '목표 기간 내 만기 가능한 옵션이 없어요'
  }
  return '목표 달성 효과를 계산할 수 없어요'
})

const isNeutralRecommendation = computed(() =>
  new Set([
    '현재 계획을 유지하는 편이 유리해요',
    '기간을 늘리면 이용할 수 있는 상품이에요',
  ]).has(impactTitle.value)
)
</script>
