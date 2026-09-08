import { http, HttpResponse } from 'msw'

const productBase = {
  institutionName: 'KB국민은행',
  joinMethod: '인터넷, 스마트폰',
  joinRestriction: '1',
  joinTarget: '실명의 개인',
}

const deposits = [
  {
    ...productBase,
    depositProductId: 1,
    productCode: 'DP001',
    productName: 'KB Star 정기예금',
    maxLimit: 100000000,
    minimumBaseInterestRate: 2.5,
    maximumBaseInterestRate: 3.0,
    maximumInterestRate: 3.5,
    options: [
      {
        depositOptionId: 9,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        saveTerm: 6,
        baseInterestRate: 2.5,
        maxInterestRate: 3.0,
      },
      {
        depositOptionId: 10,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        saveTerm: 12,
        baseInterestRate: 3.0,
        maxInterestRate: 3.5,
      },
    ],
  },
  {
    ...productBase,
    depositProductId: 2,
    productCode: 'DP002',
    productName: 'KB Hi-Save 예금',
    maxLimit: null,
    minimumBaseInterestRate: 2.75,
    maximumBaseInterestRate: 3.15,
    maximumInterestRate: 3.95,
    options: [
      {
        depositOptionId: 11,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        saveTerm: 3,
        baseInterestRate: 2.75,
        maxInterestRate: 3.25,
      },
      {
        depositOptionId: 12,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        saveTerm: 12,
        baseInterestRate: 3.15,
        maxInterestRate: 3.95,
      },
    ],
  },
  {
    ...productBase,
    depositProductId: 3,
    productCode: 'DP003',
    productName: 'KB 든든 정기예금',
    maxLimit: 300000000,
    minimumBaseInterestRate: 2.7,
    maximumBaseInterestRate: 3.25,
    maximumInterestRate: 4.05,
    options: [
      {
        depositOptionId: 13,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        saveTerm: 12,
        baseInterestRate: 3.0,
        maxInterestRate: 3.8,
      },
      {
        depositOptionId: 14,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        saveTerm: 24,
        baseInterestRate: 3.25,
        maxInterestRate: 4.05,
      },
    ],
  },
]

const savings = [
  {
    ...productBase,
    savingProductId: 1,
    productCode: 'SV001',
    productName: 'KB국민행복적금',
    joinMethod: '영업점, 인터넷, 스마트폰',
    maxLimit: 3000000,
    minimumBaseInterestRate: 2.5,
    maximumBaseInterestRate: 3.0,
    maximumInterestRate: 4.0,
    options: [
      {
        savingOptionId: 9,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        reserveType: 'S',
        reserveTypeName: '정액적립식',
        saveTerm: 12,
        baseInterestRate: 3.0,
        maxInterestRate: 4.0,
      },
      {
        savingOptionId: 10,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        reserveType: 'F',
        reserveTypeName: '자유적립식',
        saveTerm: 12,
        baseInterestRate: 2.8,
        maxInterestRate: 3.8,
      },
    ],
  },
  {
    ...productBase,
    savingProductId: 2,
    productCode: 'SV002',
    productName: 'KB 스타적금',
    maxLimit: 500000,
    minimumBaseInterestRate: 3.0,
    maximumBaseInterestRate: 3.5,
    maximumInterestRate: 4.5,
    options: [
      {
        savingOptionId: 11,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        reserveType: 'F',
        reserveTypeName: '자유적립식',
        saveTerm: 12,
        baseInterestRate: 3.0,
        maxInterestRate: 4.0,
      },
      {
        savingOptionId: 12,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        reserveType: 'F',
        reserveTypeName: '자유적립식',
        saveTerm: 36,
        baseInterestRate: 3.5,
        maxInterestRate: 4.5,
      },
    ],
  },
  {
    ...productBase,
    savingProductId: 3,
    productCode: 'SV003',
    productName: 'KB Dream 적금',
    maxLimit: 300000,
    minimumBaseInterestRate: 2.8,
    maximumBaseInterestRate: 3.2,
    maximumInterestRate: 3.8,
    options: [
      {
        savingOptionId: 13,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        reserveType: 'S',
        reserveTypeName: '정액적립식',
        saveTerm: 6,
        baseInterestRate: 2.8,
        maxInterestRate: 3.4,
      },
      {
        savingOptionId: 14,
        interestRateType: 'S',
        interestRateTypeName: '단리',
        reserveType: 'S',
        reserveTypeName: '정액적립식',
        saveTerm: 24,
        baseInterestRate: 3.2,
        maxInterestRate: 3.8,
      },
    ],
  },
]

function toDetail(product, productType) {
  return {
    ...product,
    joinRestrictionName: '제한 없음',
    specialCondition:
      productType === 'deposit'
        ? 'KB스타뱅킹 가입 및 비대면 채널 이용 시 우대금리를 적용합니다.'
        : '자동이체 등록 및 목표 저축 조건 충족 시 우대금리를 적용합니다.',
    maturityInterest: '만기 후 1개월 이내 기본이율의 50%',
    notice:
      productType === 'deposit'
        ? '가입 금액과 기간에 따라 적용 금리가 달라질 수 있습니다.'
        : '월 납입한도와 적립 방식은 상품 옵션별로 다를 수 있습니다.',
    disclosureMonth: '202607',
    disclosureStartDate: '2026-07-01',
    disclosureEndDate: '2026-07-31',
    submittedAt: '2026-07-01T10:30:00',
    updatedAt: '2026-07-20T09:30:00',
  }
}

export const productsHandlers = [
  http.get('*/api/deposits', () => {
    return HttpResponse.json({
      success: true,
      data: {
        products: deposits.map((product) => ({
          ...product,
          financialInstitutionName: product.institutionName,
          maxInterestRate: product.maximumInterestRate,
          saveTerms: product.options.map((option) => option.saveTerm),
        })),
      },
      error: null,
    })
  }),
  http.get('*/api/deposits/:depositProductId', ({ params }) => {
    const product = deposits.find(
      (item) => item.depositProductId === Number(params.depositProductId)
    )
    return product
      ? HttpResponse.json({ success: true, data: toDetail(product, 'deposit'), error: null })
      : HttpResponse.json({ message: '상품을 찾을 수 없습니다.' }, { status: 404 })
  }),
  http.get('*/api/savings', () => {
    return HttpResponse.json({
      success: true,
      data: {
        products: savings.map((product) => ({
          ...product,
          financialInstitutionName: product.institutionName,
          highestInterestRate: product.maximumInterestRate,
          saveTerms: product.options.map((option) => option.saveTerm),
        })),
      },
      error: null,
    })
  }),
  http.get('*/api/savings/:savingProductId', ({ params }) => {
    const product = savings.find((item) => item.savingProductId === Number(params.savingProductId))
    return product
      ? HttpResponse.json({ success: true, data: toDetail(product, 'saving'), error: null })
      : HttpResponse.json({ message: '상품을 찾을 수 없습니다.' }, { status: 404 })
  }),
]
