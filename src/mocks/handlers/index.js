// MSW 핸들러 barrel: 도메인별 핸들러를 합침
import { authHandlers } from '@/mocks/handlers/auth'
import { goalHandlers } from '@/mocks/handlers/goal'
import { pacemakerHandlers } from '@/mocks/handlers/pacemaker'
import { coachHandlers } from '@/mocks/handlers/coach'
import { productsHandlers } from '@/mocks/handlers/products'
import { mypageHandlers } from '@/mocks/handlers/mypage'
import { youthPolicyHandlers } from '@/mocks/handlers/youthPolicy'
import { creditHandlers } from '@/mocks/handlers/credit'

export const handlers = [
  ...authHandlers,
  ...goalHandlers,
  ...pacemakerHandlers,
  ...creditHandlers,
  ...coachHandlers,
  ...productsHandlers,
  ...mypageHandlers,
  ...youthPolicyHandlers,
]
