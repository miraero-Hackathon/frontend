import { computed, ref } from 'vue'
import {
  MONTHS_SHORTENED_PER_SAVING_UNIT,
  SPENDING_CATEGORY_TYPES,
  SPENDING_CATEGORIES,
} from '@/features/spending/constants/spending.constants'
import {
  getExpenseCategoryTargets,
  saveExpenseCategoryTargets,
  simulateExpenseTargets,
} from '@/features/spending/api/spending.api'

const roundToOneDecimal = (value) => Math.round(value * 10) / 10
const DAYS_PER_MONTH = 30
const wonToTenThousands = (value) => Math.round((Number(value) / 10000) * 10) / 10

export function calculateSavingAmount(category) {
  if (category.target === null) {
    return 0
  }

  return Math.max(category.recentThreeMonthAverage - category.target, 0)
}

/**
 * 절감액을 단축 개월 수(반올림 없는 원값)로 환산한다.
 * 카드별 표시값과 총합 표시값이 같은 원값에서 계산돼야 서로 어긋나지 않는다.
 */
export function calculateShortenedMonths(savingAmount) {
  if (savingAmount <= 0) {
    return 0
  }

  return savingAmount * MONTHS_SHORTENED_PER_SAVING_UNIT
}

/**
 * 1개월 미만은 일 단위, 이상은 개월 단위(소수 첫째 자리)로 표시한다.
 * 0.04개월처럼 "개월" 그릇에 담기엔 너무 작은 값을 억지로 부풀리지 않기 위함.
 */
export function formatShortenedPeriod(months) {
  if (months <= 0) {
    return '0일'
  }

  if (months < 1) {
    return `${Math.max(Math.round(months * DAYS_PER_MONTH), 1)}일`
  }

  const rounded = roundToOneDecimal(months)
  return `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)}개월`
}

export function useSpendingSimulator(summary) {
  const categoryTargets = ref({})
  const categoryTargetIds = ref({})
  const simulatedSavingAmount = ref(null)
  const categorySpending = computed(() => summary?.value?.categorySpending ?? {})
  const recentThreeMonthAverageSpending = computed(
    () => summary?.value?.recentThreeMonthAverageSpending ?? {}
  )
  // 내 지출 응답에 없는 카테고리는 상수의 목 금액(category.current)으로 되돌리지 않는다.
  // 비교 탭은 같은 카테고리를 0으로 보여주는데 여기만 지어낸 금액을 쓰면 화면끼리 어긋난다.
  const categories = computed(() =>
    SPENDING_CATEGORIES.filter(
      (category) =>
        category.type === SPENDING_CATEGORY_TYPES.VARIABLE &&
        category.id !== 'transportation' &&
        Object.hasOwn(categorySpending.value, category.id)
    )
      .map((category) => ({
        ...category,
        current: categorySpending.value[category.id] ?? 0,
        categoryId: categoryTargetIds.value[category.id] ?? summary?.value?.categoryIds?.[category.id],
        target: categoryTargets.value[category.id] ?? null,
        // 기준 지출 = 최근 3개월 평균 소비. API가 해당 카테고리의 평균을 안 주면
        // 이번 달 지출로, 그마저 없으면 0으로 대체한다.
        // 슬라이더의 step은 1(만원)인데 이 값에 소수(예: 14.3)가 섞이면, 건드리지 않은 상태의
        // value(=이 값)가 브라우저의 step 스냅 규칙에 의해 max보다 작은 정수로 스냅되어
        // thumb이 카테고리마다 제각각 오른쪽 끝에서 살짝씩 어긋나 보인다. 정수로 반올림해 맞춘다.
        recentThreeMonthAverage: Math.round(
          recentThreeMonthAverageSpending.value[category.id] ??
            categorySpending.value[category.id] ??
            0
        ),
      }))
      // 기준 지출이 min과 같으면(대부분 0) 슬라이더의 min===max가 되어 조절할 범위가 없다.
      // 이 경우 네이티브 range input이 브라우저마다 thumb 위치를 다르게 그려서
      // 카테고리마다 슬라이더 위치가 제각각으로 보이는 버그가 생기므로 아예 목록에서 뺀다.
      .filter((category) => category.recentThreeMonthAverage > category.min)
  )
  // categories 구성은 API 응답에 따라 달라지므로, 고른 카테고리가 목록에서 빠지면
  // 첫 번째 카테고리로 되돌려 selectedCategory가 undefined가 되지 않게 한다.
  const rawSelectedCategoryId = ref(categories.value[0]?.id ?? null)

  const selectedCategoryId = computed({
    get: () =>
      categories.value.some((category) => category.id === rawSelectedCategoryId.value)
        ? rawSelectedCategoryId.value
        : (categories.value[0]?.id ?? null),
    set: (value) => {
      rawSelectedCategoryId.value = value
    },
  })

  const selectedCategoryIndex = computed(() =>
    categories.value.findIndex((category) => category.id === selectedCategoryId.value)
  )

  const selectedCategory = computed(() =>
    categories.value.find((category) => category.id === selectedCategoryId.value)
  )

  const localSavingAmount = computed(() =>
    categories.value.reduce(
      (totalSaving, category) => totalSaving + calculateSavingAmount(category),
      0
    )
  )

  const totalSavingAmount = computed(() =>
    simulatedSavingAmount.value ?? localSavingAmount.value
  )

  const totalShortenedMonths = computed(() => calculateShortenedMonths(totalSavingAmount.value))

  const formattedTotalShortenedMonths = computed(() =>
    formatShortenedPeriod(totalShortenedMonths.value)
  )

  function selectCategory(categoryId) {
    if (categories.value.some((category) => category.id === categoryId)) {
      selectedCategoryId.value = categoryId
    }
  }

  function selectCategoryByOffset(offset) {
    const nextCategory = categories.value[selectedCategoryIndex.value + offset]

    if (nextCategory) {
      selectedCategoryId.value = nextCategory.id
    }
  }

  async function loadCategoryTargets() {
    const targets = await getExpenseCategoryTargets()
    const nextIds = {}
    const nextTargets = {}

    targets.forEach((target) => {
      const category = SPENDING_CATEGORIES.find((item) => item.name === target.categoryName)
      const categoryId = Number(target.categoryId)
      const targetAmount = Number(target.targetAmount)
      if (!category || !Number.isInteger(categoryId) || categoryId <= 0) return

      nextIds[category.id] = categoryId
      const baselineAmount = Number(
        recentThreeMonthAverageSpending.value[category.id] ?? categorySpending.value[category.id] ?? 0
      ) * 10000
      if (Number.isFinite(targetAmount) && targetAmount >= 0 && targetAmount < baselineAmount) {
        nextTargets[category.id] = wonToTenThousands(targetAmount)
      }
    })

    categoryTargetIds.value = nextIds
    categoryTargets.value = nextTargets
    await refreshSimulation()
  }

  async function updateCategoryTarget({ id, target }) {
    const category = categories.value.find((item) => item.id === id)

    if (!category) {
      return
    }

    categoryTargets.value[category.id] = target < category.recentThreeMonthAverage ? target : null
    await saveCategoryTargets()
    await refreshSimulation()
  }

  async function saveCategoryTargets() {
    const targets = categories.value
      // 사용자가 실제로 조절한 목표만 저장한다. 조절 전 카테고리는 target이 null이므로
      // 최초 접근 시 기준 지출(슬라이더 오른쪽 끝)에서 시작하고, 저장된 목표만 재접속 때 복원된다.
      .filter(
        (category) =>
          category.target !== null &&
          Number.isInteger(category.categoryId) &&
          category.categoryId > 0
      )
      .map((category) => ({
        categoryId: category.categoryId,
        targetAmount: Math.round(category.target * 10000),
      }))

    // 모두 기준 지출로 되돌린 경우에도 빈 목록을 보내 기존 저장 목표를 제거한다.
    await saveExpenseCategoryTargets(targets)
  }

  async function refreshSimulation() {
    const [year, month] = String(summary?.value?.referenceMonth ?? '').split('-').map(Number)
    const categoriesForSimulation = categories.value
      .filter((category) => Number.isInteger(category.categoryId) && category.categoryId > 0)
      .map((category) => ({
        categoryId: category.categoryId,
        targetExpense: Math.round((category.target ?? category.current) * 10000),
      }))

    if (!Number.isInteger(year) || !Number.isInteger(month) || categoriesForSimulation.length === 0) {
      simulatedSavingAmount.value = null
      return
    }

    const response = await simulateExpenseTargets({
      year,
      month,
      categories: categoriesForSimulation,
    })
    simulatedSavingAmount.value = wonToTenThousands(response?.totalReductionAmount)
  }

  return {
    categories,
    selectedCategoryId,
    selectedCategoryIndex,
    selectedCategory,
    formattedTotalShortenedMonths,
    loadCategoryTargets,
    refreshSimulation,
    selectCategory,
    selectCategoryByOffset,
    updateCategoryTarget,
  }
}
