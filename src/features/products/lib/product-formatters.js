import { formatKRWCompact } from '@/shared/lib/money'

export function formatRate(rate) {
  const numericRate = Number(rate ?? 0)
  return (Number.isFinite(numericRate) ? numericRate : 0).toFixed(2)
}

export function formatRateCompact(rate) {
  return formatRate(rate).replace(/\.?0+$/, '')
}

export function formatProductLimit(maxLimit, productType) {
  const limit = Number(maxLimit ?? 0)
  if (!Number.isFinite(limit) || limit <= 0) return '제한 없음'
  const prefix = productType === 'saving' ? '월' : '최대'

  if (limit >= 100000000) {
    const uk = limit / 100000000
    return `${prefix} ${Number.isInteger(uk) ? uk : uk.toFixed(1)}억원`
  }

  return `${prefix} ${formatKRWCompact(limit)}`
}
