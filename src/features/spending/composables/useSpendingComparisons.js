import { computed, ref } from 'vue'
import { useMypageStore } from '@/features/mypage'
import {
  DEFAULT_SPENDING_AGE_GROUP_ID,
  DEFAULT_SPENDING_INCOME_GROUP_ID,
  PEER_SPENDING_BY_BASIS,
  SPENDING_AGE_GROUPS,
  SPENDING_CATEGORY_TYPES,
  SPENDING_CATEGORIES,
  SPENDING_INCOME_GROUPS,
} from '@/features/spending/constants/spending.constants'
import { calculateAge } from '@/shared/lib/date'
import { formatKoreanNumber } from '@/shared/lib/money'

function matchAgeGroupId(age) {
  if (age == null) return DEFAULT_SPENDING_AGE_GROUP_ID

  const matched = SPENDING_AGE_GROUPS.find((group) => age >= group.minAge && age <= group.maxAge)
  if (matched) return matched.id

  const [firstGroup] = SPENDING_AGE_GROUPS
  const lastGroup = SPENDING_AGE_GROUPS[SPENDING_AGE_GROUPS.length - 1]
  return age < firstGroup.minAge ? firstGroup.id : lastGroup.id
}

export function useSpendingSummaryComparison(props) {
  const formattedTotalSpending = computed(() => formatKoreanNumber(props.totalSpending))
  const formattedSavingCapacity = computed(() => formatKoreanNumber(props.savingCapacity))
  const formattedRemainingMonths = computed(() => formatKoreanNumber(props.remainingMonths))
  const normalizedGoalProgress = computed(() => Math.min(Math.max(props.goalProgress, 0), 100))
  const previousMonthSpending = computed(() => props.previousMonthSpending)

  const monthlyDifferenceRate = computed(() => {
    if (previousMonthSpending.value <= 0) {
      return 0
    }

    return Math.round((Math.abs(props.monthlyDifference) / previousMonthSpending.value) * 1000) / 10
  })

  const monthlyDifferenceDirection = computed(() => {
    if (props.monthlyDifference > 0) {
      return 'increase'
    }

    if (props.monthlyDifference < 0) {
      return 'decrease'
    }

    return 'default'
  })

  const monthlyDifferenceHighlightText = computed(() => {
    const absoluteDifference = formatKoreanNumber(Math.abs(props.monthlyDifference))

    if (monthlyDifferenceDirection.value === 'increase') {
      return `${absoluteDifference}만원 증가`
    }

    if (monthlyDifferenceDirection.value === 'decrease') {
      return `${absoluteDifference}만원 감소`
    }

    return '변동 없음'
  })

  const monthlyDifferenceDescription = computed(() => {
    if (monthlyDifferenceDirection.value === 'default') {
      return `전월 대비 ${monthlyDifferenceHighlightText.value}`
    }

    return `전월 대비 ${monthlyDifferenceHighlightText.value} · ${monthlyDifferenceRate.value}%`
  })

  const monthlyDifferenceTone = computed(() => {
    if (monthlyDifferenceDirection.value === 'increase') {
      return 'coral'
    }

    if (monthlyDifferenceDirection.value === 'decrease') {
      return 'positive'
    }

    return 'default'
  })

  return {
    formattedTotalSpending,
    formattedSavingCapacity,
    formattedRemainingMonths,
    normalizedGoalProgress,
    monthlyDifferenceRate,
    monthlyDifferenceDirection,
    monthlyDifferenceHighlightText,
    monthlyDifferenceDescription,
    monthlyDifferenceTone,
  }
}

export function usePeerSpendingComparison(summary) {
  const mypageStore = useMypageStore()
  mypageStore.ensureProfile()

  const selectedComparisonBasis = ref('AGE')

  // 내 나이대에 맞는 구간을 기본으로 보여주되, 사용자가 직접 고른 값이 있으면 그것을 우선한다.
  // (프로필은 나중에 도착하므로, 직접 고르기 전까지는 파생값으로 두어야 도착 시점에 자동으로 반영된다)
  const matchedAgeGroupId = computed(() =>
    matchAgeGroupId(calculateAge(mypageStore.profile?.birthDate))
  )
  const manualAgeGroupId = ref(null)
  const selectedAgeGroupId = computed({
    get: () => manualAgeGroupId.value ?? matchedAgeGroupId.value,
    set: (value) => {
      manualAgeGroupId.value = value
    },
  })

  const selectedIncomeGroupId = ref(DEFAULT_SPENDING_INCOME_GROUP_ID)

  const peerGroupOptions = computed(() =>
    selectedComparisonBasis.value === 'AGE' ? SPENDING_AGE_GROUPS : SPENDING_INCOME_GROUPS
  )

  const selectedPeerGroupId = computed({
    get: () =>
      selectedComparisonBasis.value === 'AGE'
        ? selectedAgeGroupId.value
        : selectedIncomeGroupId.value,
    set: (value) => {
      if (selectedComparisonBasis.value === 'AGE') selectedAgeGroupId.value = value
      else selectedIncomeGroupId.value = value
    },
  })

  const selectedPeerGroupLabel = computed(
    () =>
      peerGroupOptions.value.find((group) => group.id === selectedPeerGroupId.value)?.label ?? ''
  )

  const peerSpending = computed(
    () => PEER_SPENDING_BY_BASIS[selectedComparisonBasis.value][selectedPeerGroupId.value] ?? {}
  )

  const categorySpending = computed(() => summary.value.categorySpending ?? {})

  // 내 지출 데이터가 없는 카테고리도 0원으로 비교하면 "또래보다 훨씬 덜 쓴다"는 거짓 결과가 나온다.
  // 그래서 내 지출 응답에 실제로 존재하는 카테고리만 비교 대상으로 삼는다.
  const comparisonItems = computed(() => {
    return SPENDING_CATEGORIES.filter(
      (category) =>
        category.type === SPENDING_CATEGORY_TYPES.VARIABLE &&
        Object.hasOwn(categorySpending.value, category.id)
    )
      .map((category) => ({
        ...category,
        current: categorySpending.value[category.id] ?? 0,
      }))
      .sort((firstCategory, secondCategory) => secondCategory.current - firstCategory.current)
      .map((category) => {
        const peerAmount = peerSpending.value[category.id] ?? 0
        const maximumAmount = Math.max(category.current, peerAmount, 1)

        return {
          ...category,
          peerAmount,
          difference: category.current - peerAmount,
          currentWidth: (category.current / maximumAmount) * 100,
          peerWidth: (peerAmount / maximumAmount) * 100,
        }
      })
  })

  const currentTotalSpending = computed(() =>
    comparisonItems.value.reduce((total, category) => total + category.current, 0)
  )
  const peerTotalSpending = computed(() =>
    comparisonItems.value.reduce((total, category) => total + category.peerAmount, 0)
  )

  const totalDifference = computed(() => currentTotalSpending.value - peerTotalSpending.value)
  const absoluteTotalDifference = computed(() => Math.abs(totalDifference.value))

  const totalDifferenceLabel = computed(() => {
    if (totalDifference.value > 0) {
      return '더 쓰고 있어요'
    }

    if (totalDifference.value < 0) {
      return '덜 쓰고 있어요'
    }

    return '비슷하게 쓰고 있어요'
  })

  const largestDifferenceCategoryNames = computed(() =>
    joinKoreanNames(
      [...comparisonItems.value]
        .sort(
          (firstCategory, secondCategory) =>
            Math.abs(secondCategory.difference) - Math.abs(firstCategory.difference)
        )
        .slice(0, 2)
        .map((category) => category.name)
    )
  )

  return {
    selectedComparisonBasis,
    selectedPeerGroupId,
    selectedPeerGroupLabel,
    peerGroupOptions,
    comparisonItems,
    totalDifference,
    absoluteTotalDifference,
    totalDifferenceLabel,
    largestDifferenceCategoryNames,
  }
}

function joinKoreanNames(names) {
  if (names.length < 2) return names[0] ?? ''

  const firstName = names[0]
  const lastCharacterCode = firstName.charCodeAt(firstName.length - 1)
  const hasFinalConsonant =
    lastCharacterCode >= 0xac00 &&
    lastCharacterCode <= 0xd7a3 &&
    (lastCharacterCode - 0xac00) % 28 !== 0

  return `${firstName}${hasFinalConsonant ? '과' : '와'} ${names[1]}`
}

export function useMonthlySpendingComparison(summary) {
  const categorySpending = computed(() => summary.value.categorySpending ?? {})
  const previousMonthSpending = computed(() => summary.value.previousMonthCategorySpending ?? {})
  const monthlyComparisonItems = computed(() =>
    SPENDING_CATEGORIES.filter(
      (category) =>
        category.type === SPENDING_CATEGORY_TYPES.VARIABLE &&
        (Object.hasOwn(categorySpending.value, category.id) ||
          Object.hasOwn(previousMonthSpending.value, category.id))
    ).map((category) => {
      const current = categorySpending.value[category.id] ?? 0
      const previousAmount = previousMonthSpending.value[category.id] ?? 0

      return {
        ...category,
        current,
        previousAmount,
        difference: current - previousAmount,
      }
    })
  )

  return {
    monthlyComparisonItems,
  }
}
