// MSW 핸들러 barrel: 도메인별 핸들러를 합침
import { authHandlers } from '@/mocks/handlers/auth'
import { goalHandlers } from '@/mocks/handlers/goal'
import { pacemakerHandlers } from '@/mocks/handlers/pacemaker'
import { coachHandlers } from '@/mocks/handlers/coach'
import { productsHandlers } from '@/mocks/handlers/products'
import { mypageHandlers } from '@/mocks/handlers/mypage'
import { youthPolicyHandlers } from '@/mocks/handlers/youthPolicy'

export const handlers = [
  ...authHandlers,
  ...goalHandlers,
  ...pacemakerHandlers,
  ...coachHandlers,
  ...productsHandlers,
  ...mypageHandlers,
  ...youthPolicyHandlers,
]
