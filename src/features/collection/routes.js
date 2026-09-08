// collection 도메인 라우트 (COLL-01~02)
import { ROUTE_NAMES } from '@/shared/constants/routes'

export const collectionRoutes = [
  {
    path: '/collection',
    name: ROUTE_NAMES.COLLECTION,
    component: () => import('@/pages/collection/CollectionPage.vue'),
  },
]
