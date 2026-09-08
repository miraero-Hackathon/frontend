// products feature 공개 API barrel
export { productsRoutes } from '@/features/products/routes'
export { useProductsStore } from '@/features/products/store/products.store'
export * as productsApi from '@/features/products/api/products.api'
export { default as ProductCard } from '@/features/products/components/ProductCard.vue'
export { default as ProductDetailModal } from '@/features/products/components/ProductDetailModal.vue'
export {
  formatProductLimit,
  formatRate,
  formatRateCompact,
} from '@/features/products/lib/product-formatters'
export { isLinkedProduct } from '@/features/products/lib/linked-product'
export {
  CALCULATION_STATUS,
  INTEREST_RATE_BASIS,
  calculateRecommendationImpact,
  getMaturityEligibleTerms,
  calculateWeightedInterestRate,
} from '@/features/products/lib/recommendation-impact'
