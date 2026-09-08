export const CALCULATION_STATUS = Object.freeze({
  CALCULATED: 'CALCULATED',
  NO_IMPROVEMENT: 'NO_IMPROVEMENT',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
})

export const INTEREST_RATE_BASIS = Object.freeze({
  BASE: 'BASE',
  MAX: 'MAX',
})

const SUPPORTED_PRODUCT_TYPES = new Set(['deposit', 'saving'])

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function getOptionId(option, productType) {
  return productType === 'deposit' ? option.depositOptionId : option.savingOptionId
}

function getOptionRate(option, interestRateBasis) {
  const rateKey =
    interestRateBasis === INTEREST_RATE_BASIS.MAX ? 'maxInterestRate' : 'baseInterestRate'
  return toFiniteNumber(option[rateKey])
}

function getMonthlyRate(annualRate) {
  return annualRate / 100 / 12
}

function getCappedAmount(amount, limit) {
  const normalizedLimit = toFiniteNumber(limit)
  if (normalizedLimit === null || normalizedLimit <= 0) return amount
  return Math.min(amount, normalizedLimit)
}

function hasReachedGoal(balance, goalAmount) {
  return balance >= goalAmount - 0.01
}

/**
 * 연결된 전체 자산을 하나의 현재 계획으로 보고 잔액 가중평균 금리를 계산한다.
 * 금리가 없는 저금통은 0%로 계산한다.
 */
export function calculateWeightedInterestRate(linkedAssets = []) {
  const assetsWithBalance = linkedAssets
    .map((asset) => ({
      balance: toFiniteNumber(asset.balance),
      interestRate: toFiniteNumber(asset.interestRate) ?? 0,
    }))
    .filter(({ balance }) => balance !== null && balance > 0)

  const totalBalance = assetsWithBalance.reduce((sum, asset) => sum + asset.balance, 0)
  if (totalBalance <= 0) return 0

  const weightedInterest = assetsWithBalance.reduce(
    (sum, asset) => sum + asset.balance * asset.interestRate,
    0
  )
  return weightedInterest / totalBalance
}

function simulateCurrentPlan({
  currentAmount,
  goalAmount,
  monthlyContribution,
  annualRate,
  months,
}) {
  let balance = currentAmount
  let completionMonth = hasReachedGoal(balance, goalAmount) ? 0 : null
  const monthlyRate = getMonthlyRate(annualRate)

  for (let month = 1; month <= months; month += 1) {
    balance *= 1 + monthlyRate
    balance += monthlyContribution

    if (completionMonth === null && hasReachedGoal(balance, goalAmount)) {
      completionMonth = month
    }
  }

  return { completionMonth, endingBalance: balance }
}

function simulateDepositPlan({
  currentAmount,
  goalAmount,
  monthlyContribution,
  currentAnnualRate,
  productAnnualRate,
  productTerm,
  maxLimit,
  months,
}) {
  let productBalance = getCappedAmount(currentAmount, maxLimit)
  let currentPlanBalance = currentAmount - productBalance
  let completionMonth = hasReachedGoal(currentAmount, goalAmount) ? 0 : null
  const productMonthlyRate = getMonthlyRate(productAnnualRate)
  const currentMonthlyRate = getMonthlyRate(currentAnnualRate)

  for (let month = 1; month <= months; month += 1) {
    currentPlanBalance *= 1 + currentMonthlyRate
    currentPlanBalance += monthlyContribution

    if (productBalance > 0) {
      productBalance *= 1 + productMonthlyRate
    }

    if (month === productTerm) {
      currentPlanBalance += productBalance
      productBalance = 0
    }

    const totalBalance = currentPlanBalance + productBalance
    if (completionMonth === null && hasReachedGoal(totalBalance, goalAmount)) {
      completionMonth = month
    }
  }

  return {
    completionMonth,
    endingBalance: currentPlanBalance + productBalance,
  }
}

function simulateSavingPlan({
  currentAmount,
  goalAmount,
  monthlyContribution,
  currentAnnualRate,
  productAnnualRate,
  productTerm,
  maxLimit,
  months,
}) {
  let productBalance = 0
  let currentPlanBalance = currentAmount
  let completionMonth = hasReachedGoal(currentAmount, goalAmount) ? 0 : null
  const productMonthlyRate = getMonthlyRate(productAnnualRate)
  const currentMonthlyRate = getMonthlyRate(currentAnnualRate)
  const productMonthlyContribution = getCappedAmount(monthlyContribution, maxLimit)
  const remainingMonthlyContribution = monthlyContribution - productMonthlyContribution

  for (let month = 1; month <= months; month += 1) {
    currentPlanBalance *= 1 + currentMonthlyRate
    currentPlanBalance += remainingMonthlyContribution

    if (month <= productTerm) {
      productBalance *= 1 + productMonthlyRate
      productBalance += productMonthlyContribution
    } else {
      currentPlanBalance += productMonthlyContribution
    }

    if (month === productTerm) {
      currentPlanBalance += productBalance
      productBalance = 0
    }

    const totalBalance = currentPlanBalance + productBalance
    if (completionMonth === null && hasReachedGoal(totalBalance, goalAmount)) {
      completionMonth = month
    }
  }

  return {
    completionMonth,
    endingBalance: currentPlanBalance + productBalance,
  }
}

function getEligibleOptions(product, productType, remainMonths, interestRateBasis) {
  return (product.options ?? [])
    .map((option) => ({
      option,
      optionId: getOptionId(option, productType),
      saveTerm: toFiniteNumber(option.saveTerm),
      interestRate: getOptionRate(option, interestRateBasis),
    }))
    .filter(
      ({ optionId, saveTerm, interestRate }) =>
        optionId != null &&
        saveTerm !== null &&
        saveTerm > 0 &&
        saveTerm <= remainMonths &&
        interestRate !== null &&
        interestRate >= 0
    )
}

export function getMaturityEligibleTerms(product, remainMonths) {
  const normalizedRemainMonths = toFiniteNumber(remainMonths)
  if (normalizedRemainMonths === null || normalizedRemainMonths <= 0) {
    return []
  }

  const terms = [
    ...(product?.saveTerms ?? []),
    ...(product?.options ?? []).map((option) => option.saveTerm),
  ]

  return [...new Set(terms.map(toFiniteNumber))]
    .filter((saveTerm) => saveTerm !== null && saveTerm > 0 && saveTerm <= normalizedRemainMonths)
    .sort((firstTerm, secondTerm) => firstTerm - secondTerm)
}

function createEmptyResult(calculationStatus, interestRateBasis) {
  return {
    optionId: null,
    estimatedMonthsSaved: 0,
    estimatedAdditionalAmount: 0,
    calculationStatus,
    interestRateBasis,
    assumedInterestRate: null,
    optionTerm: null,
    currentInterestRate: null,
    monthlyContribution: null,
    currentCompletionMonths: null,
    estimatedCompletionMonths: null,
  }
}

/**
 * 현재 로드맵과 추천 상품 적용 시나리오를 같은 월 저축액으로 비교한다.
 *
 * - 계산 시작 금액: goal.currentAmount
 * - 월 저축액: (goalAmount - currentAmount) / remainMonths
 * - 현재 금리: 연결 자산 잔액 가중평균
 * - 상품 금리: 기본금리(BASE), 세전 월 단위 이자 근사
 * - 상품 만기는 목표 잔여기간 안에 도래하는 옵션만 사용
 */
export function calculateRecommendationImpact({
  goal,
  linkedAssets = [],
  product,
  productType,
  interestRateBasis = INTEREST_RATE_BASIS.BASE,
}) {
  const emptyResult = (status) => createEmptyResult(status, interestRateBasis)
  const goalAmount = toFiniteNumber(goal?.goalAmount)
  const currentAmount = toFiniteNumber(goal?.currentAmount)
  const remainMonths = toFiniteNumber(goal?.period?.remainMonths)

  if (
    !SUPPORTED_PRODUCT_TYPES.has(productType) ||
    !product ||
    goalAmount === null ||
    goalAmount <= 0 ||
    currentAmount === null ||
    currentAmount < 0 ||
    remainMonths === null ||
    remainMonths <= 0
  ) {
    return emptyResult(CALCULATION_STATUS.INSUFFICIENT_DATA)
  }

  const eligibleOptions = getEligibleOptions(product, productType, remainMonths, interestRateBasis)
  if (eligibleOptions.length === 0) {
    return emptyResult(CALCULATION_STATUS.NOT_APPLICABLE)
  }

  const currentInterestRate = calculateWeightedInterestRate(linkedAssets)
  const monthlyContribution = Math.max(0, (goalAmount - currentAmount) / remainMonths)
  const currentPlan = simulateCurrentPlan({
    currentAmount,
    goalAmount,
    monthlyContribution,
    annualRate: currentInterestRate,
    months: remainMonths,
  })

  const optionResults = eligibleOptions.map((eligibleOption) => {
    const commonParams = {
      currentAmount,
      goalAmount,
      monthlyContribution,
      currentAnnualRate: currentInterestRate,
      productAnnualRate: eligibleOption.interestRate,
      productTerm: eligibleOption.saveTerm,
      maxLimit: product.maxLimit,
      months: remainMonths,
    }
    const simulation =
      productType === 'deposit'
        ? simulateDepositPlan(commonParams)
        : simulateSavingPlan(commonParams)

    return { ...eligibleOption, ...simulation }
  })

  optionResults.sort((a, b) => {
    const completionDifference =
      (a.completionMonth ?? Number.POSITIVE_INFINITY) -
      (b.completionMonth ?? Number.POSITIVE_INFINITY)
    if (completionDifference !== 0) return completionDifference
    if (a.endingBalance !== b.endingBalance) return b.endingBalance - a.endingBalance
    return b.interestRate - a.interestRate
  })

  const selectedOption = optionResults[0]
  const currentCompletionMonths = currentPlan.completionMonth
  const estimatedCompletionMonths = selectedOption.completionMonth
  const estimatedMonthsSaved =
    currentCompletionMonths !== null && estimatedCompletionMonths !== null
      ? Math.max(0, currentCompletionMonths - estimatedCompletionMonths)
      : 0
  const estimatedAdditionalAmount = Math.max(
    0,
    Math.round(selectedOption.endingBalance - currentPlan.endingBalance)
  )

  return {
    optionId: selectedOption.optionId,
    estimatedMonthsSaved,
    estimatedAdditionalAmount,
    calculationStatus:
      estimatedMonthsSaved > 0 || estimatedAdditionalAmount > 0
        ? CALCULATION_STATUS.CALCULATED
        : CALCULATION_STATUS.NO_IMPROVEMENT,
    interestRateBasis,
    assumedInterestRate: selectedOption.interestRate,
    optionTerm: selectedOption.saveTerm,
    currentInterestRate,
    monthlyContribution,
    currentCompletionMonths,
    estimatedCompletionMonths,
  }
}
