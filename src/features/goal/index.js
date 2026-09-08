// goal feature 공개 API barrel
export { goalRoutes } from '@/features/goal/routes'
export { useGoalStore } from '@/features/goal/store/goal.store'
export * as goalApi from '@/features/goal/api/goal.api'
export {
  calculateGoalMonths,
  clampGoalMonth,
  formatGoalMonth,
  getMinimumGoalMonth,
  normalizeGoalMonth,
} from '@/features/goal/lib/goal-months'
