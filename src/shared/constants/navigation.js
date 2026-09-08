// 사이드바 네비게이션 항목 <-> 라우트 <-> 헤더 페이지 타이틀의 단일 소스
import { ROUTE_NAMES } from '@/shared/constants/routes'
import roadmapIcon from '@/assets/icons/roadmap.svg'
import pacemakerIcon from '@/assets/icons/pacemaker.svg'
import collectionIcon from '@/assets/icons/collection.svg'
import spendingIcon from '@/assets/icons/spending.svg'
import productsIcon from '@/assets/icons/products.svg'
import coachIcon from '@/assets/icons/coach.svg'
import mypageIcon from '@/assets/icons/mypage.svg'
import youthPolicyIcon from '@/assets/icons/youth-policy.svg'

export const NAV_ITEMS = [
  {
    routeName: ROUTE_NAMES.DASHBOARD,
    label: '로드맵',
    pageTitle: '나의 로드맵 대시보드',
    icon: roadmapIcon,
  },
  {
    routeName: ROUTE_NAMES.PACEMAKER,
    label: '페이스메이커',
    pageTitle: '페이스메이커',
    icon: pacemakerIcon,
  },
  {
    routeName: ROUTE_NAMES.COLLECTION,
    label: '목표 컬렉션',
    pageTitle: '나의 목표컬렉션',
    icon: collectionIcon,
  },
  {
    routeName: ROUTE_NAMES.SPENDING,
    label: '지출 관리',
    pageTitle: '나의 지출관리',
    icon: spendingIcon,
  },
  {
    routeName: ROUTE_NAMES.CREDIT,
    label: '신용 관리',
    pageTitle: '나의 신용관리',
    // icon: creditIcon,
  },
  {
    routeName: ROUTE_NAMES.PRODUCTS,
    label: 'KB 상품',
    pageTitle: 'KB 상품 추천',
    icon: productsIcon,
  },
  {
    routeName: ROUTE_NAMES.YOUTH_POLICY,
    label: '청년 정책',
    pageTitle: '청년 정책',
    icon: youthPolicyIcon,
  },
  {
    routeName: ROUTE_NAMES.COACH,
    label: 'AI 목표 코치',
    pageTitle: 'AI 목표 코치',
    icon: coachIcon,
  },
  { routeName: ROUTE_NAMES.MYPAGE, label: '마이페이지', pageTitle: '마이페이지', icon: mypageIcon },
]
