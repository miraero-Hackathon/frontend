function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ko-KR')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

function normalizeInstitution(value) {
  return normalizeText(value).replace(/은행$/, '')
}

// 계좌 유형(서버 account_type)과 상품 유형(deposit/saving)은 어휘가 다르므로 명시적으로 옮긴다.
// 적금 계좌는 SAVINGS로 내려오고, INSTALLMENT도 같은 적금 상품군이다.
const PRODUCT_TYPE_BY_ACCOUNT_TYPE = {
  DEPOSIT: 'deposit',
  SAVINGS: 'saving',
  INSTALLMENT: 'saving',
}

/**
 * 예적금 상품과 대응되지 않는 계좌(입출금·ISA·CMA 등)는 null을 돌려준다.
 * @param {string | undefined} accountType
 * @returns {'deposit' | 'saving' | null}
 */
function toProductType(accountType) {
  return PRODUCT_TYPE_BY_ACCOUNT_TYPE[String(accountType).toLocaleUpperCase('en-US')] ?? null
}

/**
 * productCode가 없는 연결 계좌를 기관명과 상품명으로 비교한다.
 * 계좌 상세를 조회한 경우 accountType까지 일치해야 같은 상품으로 본다.
 */
export function isLinkedProduct(product, productType, linkedAccounts = []) {
  const normalizedProductName = normalizeText(product?.productName)
  const normalizedProductInstitution = normalizeInstitution(product?.institutionName)
  if (!normalizedProductName) return false

  return linkedAccounts.some(({ asset, accountDetail }) => {
    // 계좌 상세를 조회했다면 상품 유형까지 일치해야 같은 상품으로 본다.
    // 예적금으로 옮길 수 없는 계좌(입출금·ISA·CMA)는 애초에 이 상품일 수 없으므로 제외한다.
    const linkedAccountType = accountDetail?.accountType
    if (linkedAccountType && toProductType(linkedAccountType) !== productType) return false

    const institution = normalizeInstitution(
      accountDetail?.institutionName ?? asset?.institutionName
    )
    if (
      normalizedProductInstitution &&
      institution &&
      normalizedProductInstitution !== institution
    ) {
      return false
    }

    const accountNames = [accountDetail?.accountName, asset?.assetName]
      .map(normalizeText)
      .filter(Boolean)

    return accountNames.includes(normalizedProductName)
  })
}
