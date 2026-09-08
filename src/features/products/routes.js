// products 도메인 라우트 (KB-01~02)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const productsRoutes = [
  {
    path: '/products',
    name: ROUTE_NAMES.PRODUCTS,
    component: () => import('@/pages/products/ProductsPage.vue'),
  },
]
