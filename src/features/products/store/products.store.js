import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import * as productsApi from '@/features/products/api/products.api'

const PRODUCT_DETAIL_CONCURRENCY = 5

function getProductId(product, productType) {
  return productType === 'deposit' ? product.depositProductId : product.savingProductId
}

async function hydrateProductDetails(products, productType) {
  const hydratedProducts = [...products]
  let nextProductIndex = 0

  async function hydrateNextProduct() {
    while (nextProductIndex < products.length) {
      const productIndex = nextProductIndex
      nextProductIndex += 1
      const product = products[productIndex]

      try {
        const detail = await productsApi.getProductDetail(
          productType,
          getProductId(product, productType)
        )
        hydratedProducts[productIndex] = { ...product, ...detail, isDetailLoaded: true }
      } catch {
        // 일부 상세 조회가 실패해도 목록에서 받은 상품 정보는 그대로 노출한다.
      }
    }
  }

  const workerCount = Math.min(PRODUCT_DETAIL_CONCURRENCY, products.length)
  await Promise.all(Array.from({ length: workerCount }, () => hydrateNextProduct()))
  return hydratedProducts
}

export const useProductsStore = defineStore('feature-products', () => {
  const productsByType = reactive({ deposit: [], saving: [] })
  const loadedTypes = reactive({ deposit: false, saving: false })
  const isLoading = ref(false)
  const error = ref(null)
  let pendingListRequestCount = 0
  const listRequestIds = { deposit: 0, saving: 0 }

  const selectedProduct = ref(null)
  const isDetailLoading = ref(false)
  const detailError = ref(null)
  let detailRequestId = 0

  function $reset() {
    productsByType.deposit = []
    productsByType.saving = []
    loadedTypes.deposit = false
    loadedTypes.saving = false
    isLoading.value = false
    error.value = null
    pendingListRequestCount = 0
    listRequestIds.deposit += 1
    listRequestIds.saving += 1
    selectedProduct.value = null
    isDetailLoading.value = false
    detailError.value = null
    detailRequestId += 1
  }

  async function fetchProducts(productType, { force = false } = {}) {
    if (!productsApi.isSupportedProductType(productType)) {
      throw new TypeError(`지원하지 않는 상품 유형입니다: ${productType}`)
    }
    if (!force && loadedTypes[productType]) return

    const requestId = ++listRequestIds[productType]
    pendingListRequestCount += 1
    isLoading.value = true
    error.value = null

    try {
      const response = await productsApi.getProducts(productType)
      if (requestId !== listRequestIds[productType]) return

      const responseKey = productType === 'deposit' ? 'deposits' : 'savings'
      const products = response[responseKey] ?? []
      const hydratedProducts = await hydrateProductDetails(products, productType)
      if (requestId !== listRequestIds[productType]) return

      productsByType[productType] = hydratedProducts
      loadedTypes[productType] = true
    } catch (caughtError) {
      if (requestId === listRequestIds[productType]) {
        error.value = caughtError
      }
    } finally {
      pendingListRequestCount -= 1
      isLoading.value = pendingListRequestCount > 0
    }
  }

  async function fetchProductDetail(productType, productId) {
    const requestId = ++detailRequestId
    selectedProduct.value = null
    isDetailLoading.value = true
    detailError.value = null

    try {
      const product = await productsApi.getProductDetail(productType, productId)
      if (requestId === detailRequestId) {
        selectedProduct.value = product
      }
    } catch (caughtError) {
      if (requestId === detailRequestId) {
        detailError.value = caughtError
      }
    } finally {
      if (requestId === detailRequestId) {
        isDetailLoading.value = false
      }
    }
  }

  function selectProduct(product) {
    detailRequestId += 1
    selectedProduct.value = product
    isDetailLoading.value = false
    detailError.value = null
  }

  function clearSelectedProduct() {
    detailRequestId += 1
    selectedProduct.value = null
    isDetailLoading.value = false
    detailError.value = null
  }

  return {
    productsByType,
    isLoading,
    error,
    selectedProduct,
    isDetailLoading,
    detailError,
    fetchProducts,
    fetchProductDetail,
    selectProduct,
    clearSelectedProduct,
    $reset,
  }
})
