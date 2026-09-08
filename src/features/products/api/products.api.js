import { client } from '@/shared/api/client'
import { unwrapApiData } from '@/shared/api/unwrapApiData'

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isValidProduct(product, productIdKey) {
  return (
    isRecord(product) &&
    product[productIdKey] != null &&
    typeof product.productName === 'string' &&
    product.productName.trim().length > 0 &&
    product.maximumInterestRate != null &&
    Number.isFinite(Number(product.maximumInterestRate))
  )
}

function validateProductListResponse(data, productIdKey) {
  if (!isRecord(data) || !Array.isArray(data.products)) {
    throw new TypeError('상품 목록 API 응답 형식이 올바르지 않습니다.')
  }

  if (!data.products.every((product) => isValidProduct(product, productIdKey))) {
    throw new TypeError('상품 목록에 필수 정보가 누락되었습니다.')
  }

  return data
}

function validateProductDetailResponse(data, productIdKey) {
  if (!isValidProduct(data, productIdKey) || !Array.isArray(data.options)) {
    throw new TypeError('상품 상세 API 응답 형식이 올바르지 않습니다.')
  }

  return data
}

function mapDepositListProduct(product) {
  return {
    ...product,
    institutionName: product.financialInstitutionName,
    maximumInterestRate: product.maxInterestRate,
    options: [],
  }
}

function mapSavingListProduct(product) {
  return {
    ...product,
    institutionName: product.financialInstitutionName,
    maximumInterestRate: product.highestInterestRate,
    options: [],
  }
}

function mapProductDetail(product) {
  const maximumInterestRate = Math.max(
    0,
    ...(product.options ?? []).map((option) => Number(option.maxInterestRate ?? 0))
  )
  return {
    ...product,
    institutionName: product.financialInstitutionName,
    maximumInterestRate,
  }
}

export async function getDepositProducts(params = {}) {
  const { data: responseBody } = await client.get('/deposits', { params })
  const data = unwrapApiData(responseBody)
  const mapped = { products: data.products.map(mapDepositListProduct) }
  validateProductListResponse(mapped, 'depositProductId')
  return { deposits: mapped.products }
}

export async function getDepositProductDetail(depositProductId) {
  const { data: responseBody } = await client.get(`/deposits/${depositProductId}`)
  return validateProductDetailResponse(
    mapProductDetail(unwrapApiData(responseBody)),
    'depositProductId'
  )
}

export async function getSavingProducts(params = {}) {
  const { data: responseBody } = await client.get('/savings', { params })
  const data = unwrapApiData(responseBody)
  const mapped = { products: data.products.map(mapSavingListProduct) }
  validateProductListResponse(mapped, 'savingProductId')
  return { savings: mapped.products }
}

export async function getSavingProductDetail(savingProductId) {
  const { data: responseBody } = await client.get(`/savings/${savingProductId}`)
  return validateProductDetailResponse(
    mapProductDetail(unwrapApiData(responseBody)),
    'savingProductId'
  )
}

const productApiByType = {
  deposit: {
    getList: getDepositProducts,
    getDetail: getDepositProductDetail,
  },
  saving: {
    getList: getSavingProducts,
    getDetail: getSavingProductDetail,
  },
}

export function isSupportedProductType(productType) {
  return Object.hasOwn(productApiByType, productType)
}

function getProductApi(productType) {
  if (!isSupportedProductType(productType)) {
    throw new TypeError(`지원하지 않는 상품 유형입니다: ${productType}`)
  }

  return productApiByType[productType]
}

export async function getProducts(productType, params = {}) {
  return getProductApi(productType).getList(params)
}

export async function getProductDetail(productType, productId) {
  return getProductApi(productType).getDetail(productId)
}
