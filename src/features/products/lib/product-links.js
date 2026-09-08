const KB_PRODUCT_CATALOG_URL = 'https://obank.kbstar.com/quics?cc=b028364%3Ab061496&page=C016613'

const OFFICIAL_PRODUCT_URLS = {
  DP001:
    'https://obank.kbstar.com/quics?cc=b061496%3Ab061645&isNew=N&page=C016613&prcode=DP01000938',
  SV001:
    'https://obank.kbstar.com/quics?cc=b061496%3Ab061645&isNew=Y&page=C016613&prcode=DP01000472',
  SV002:
    'https://obank.kbstar.com/quics?cc=b061496%3Ab061645&isNew=Y&page=C016613&prcode=DP01001595',
}

function isOfficialKbUrl(value) {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'kbstar.com' || url.hostname.endsWith('.kbstar.com'))
    )
  } catch {
    return false
  }
}

export function getOfficialProductLink(product) {
  const urlCandidate =
    product?.productPageUrl ?? product?.officialUrl ?? OFFICIAL_PRODUCT_URLS[product?.productCode]
  const directUrl = isOfficialKbUrl(urlCandidate) ? urlCandidate : null
  const officialUrlLabel = product?.officialUrlLabel?.trim()

  return directUrl
    ? {
        href: directUrl,
        label: officialUrlLabel || 'KB에서 가입하기',
        description: 'KB국민은행 공식 상품 페이지로 이동해요',
      }
    : {
        href: KB_PRODUCT_CATALOG_URL,
        label: 'KB 상품몰에서 찾아보기',
        description: 'KB국민은행 공식 상품몰에서 판매 여부와 가입 조건을 확인해 주세요',
      }
}
