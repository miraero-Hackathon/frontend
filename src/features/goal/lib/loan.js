/**
 * 학자금 대출 원리금 균등상환 계산 헬퍼
 * @param {Object} params
 * @param {number} params.amount - 대출 잔액 (원금)
 * @param {number} params.months - 상환 기간 (개월)
 * @param {number} [params.annualRate=0.017] - 연 이율 (기본 1.7%)
 */
export function calculateStudentLoan({ amount, months, annualRate = 0.017 }) {
  const p = Number(amount) || 0
  const n = Number(months) || 1
  if (p <= 0 || n <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalPayment: 0,
      principalRatio: 100,
      interestRatio: 0,
    }
  }

  const i = annualRate / 12
  const compound = Math.pow(1 + i, n)
  const monthlyPayment = Math.round((p * i * compound) / (compound - 1))
  const totalPayment = monthlyPayment * n
  const totalInterest = Math.max(0, totalPayment - p)

  const principalRatio = Math.round((p / totalPayment) * 100)
  const interestRatio = 100 - principalRatio

  return {
    monthlyPayment,
    totalInterest,
    totalPayment,
    principalRatio,
    interestRatio,
  }
}

/**
 * 추가 상환 여력 입력 시 절약 이자, 줄어든 기간, 새 총 상환액 계산 헬퍼
 * @param {Object} params
 * @param {number} params.amount - 대출 잔액 (원금)
 * @param {number} params.months - 기존 상환 기간 (개월)
 * @param {number} params.extraPayment - 매달 추가 상환 여력 금액
 * @param {number} [params.annualRate=0.017] - 연 이율
 */
export function calculateExtraLoanRepayment({ amount, months, extraPayment, annualRate = 0.017 }) {
  const base = calculateStudentLoan({ amount, months, annualRate })
  const extra = Number(extraPayment) || 0

  if (extra <= 0) {
    return {
      ...base,
      extraPayment: 0,
      newMonthlyPayment: base.monthlyPayment,
      reducedMonths: 0,
      newMonths: months,
      savedInterest: 0,
      newTotalPayment: base.totalPayment,
    }
  }

  const p = Number(amount) || 0
  const i = annualRate / 12
  const newMonthlyPayment = base.monthlyPayment + extra

  let balance = p
  let currentMonth = 0
  let newTotalInterest = 0

  while (balance > 0 && currentMonth < months) {
    currentMonth++
    const interestForMonth = Math.round(balance * i)
    const principalForMonth = newMonthlyPayment - interestForMonth

    if (balance <= principalForMonth) {
      newTotalInterest += interestForMonth
      balance = 0
      break
    } else {
      newTotalInterest += interestForMonth
      balance -= principalForMonth
    }
  }

  const newMonths = currentMonth
  const reducedMonths = Math.max(0, months - newMonths)
  const savedInterest = Math.max(0, base.totalInterest - newTotalInterest)
  const newTotalPayment = p + newTotalInterest

  return {
    ...base,
    extraPayment: extra,
    newMonthlyPayment,
    reducedMonths,
    newMonths,
    savedInterest,
    newTotalPayment,
    newTotalInterest,
  }
}
