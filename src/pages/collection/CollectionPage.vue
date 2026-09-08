<!-- 목표 컬렉션 (Goal Collection) 페이지 (COLL-01~02) -->
<template>
  <div class="flex justify-center bg-[#f8fafc] min-h-[calc(100vh-80px)]">
    <div class="page-container pb-10 pt-4 sm:pb-14 sm:pt-6">
      <!-- 로딩 중일 때 스피너 표시 -->
      <div v-if="collectionStore.isLoading" class="flex h-96 items-center justify-center">
        <LoadingSpinner message="달성한 목표 컬렉션을 불러오고 있어요" />
      </div>

      <!-- 상태 0: 통신 에러 (Error State) -->
      <div
        v-else-if="collectionStore.error"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div
          class="flex size-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 text-amber-600 shadow-xs"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-bold text-[#0a192f] sm:text-xl">
          목표 컬렉션을 불러오지 못했어요
        </h3>
        <p class="mt-1.5 max-w-sm text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
          서버와의 연결이 원활하지 않거나 서버가 켜져 있지 않아요.<br />
          연결 상태를 확인하고 다시 시도해 주세요.
        </p>
        <button
          type="button"
          class="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:translate-y-0 cursor-pointer select-none"
          @click="collectionStore.fetchAchievedGoals()"
        >
          <span>다시 시도</span>
          <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
            <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.451a.75.75 0 000-1.5H4.5a.75.75 0 00-.75.75v3.75a.75.75 0 001.5 0v-2.008l.53.53a7 7 0 0011.758-3.15.75.75 0 00-1.226-.497zM4.688 8.576a5.5 5.5 0 019.201-2.466l.312.311H11.75a.75.75 0 000 1.5h3.75a.75.75 0 00.75-.75V3.424a.75.75 0 00-1.5 0v2.008l-.53-.53A7 7 0 002.462 8.08a.75.75 0 001.226.496z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 상태 1: 빈 컬렉션 (Empty State) -->
      <div v-else-if="!collectionStore.hasGoals" class="py-12">
        <EmptyCollection @start-roadmap="handleGoToGoalSelect" />
      </div>

      <!-- 상태 2: 달성 목표 존재 (Filled State) -->
      <div v-else class="flex flex-col gap-3 sm:gap-5">
        <!-- 상단 명예의 전당 요약 히어로 배너 -->
        <CollectionHeroBanner
          :total-count="collectionStore.totalAchievedCount"
          :total-amount="collectionStore.totalAchievedAmount"
        />

        <!-- 컬렉션 카드 그리드 목록 -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <CollectionCard
            v-for="goal in collectionStore.achievedGoals"
            :key="goal.id"
            :goal="goal"
            @view-roadmap="handleViewRoadmap"
            @share-goal="handleShareGoal"
          />
        </div>

        <!-- 하단 배너 (Call to Action) -->
        <NextGoalBanner class="mt-2" @add-goal="handleGoToGoalSelect" />
      </div>
    </div>

    <!-- 완주 축하 친구 공유 모달 -->
    <ShareGoalModal
      v-if="selectedShareGoal"
      v-model="isShareModalOpen"
      :goal="selectedShareGoal"
      :milestones="shareMilestones"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useCollectionStore,
  EmptyCollection,
  CollectionCard,
  NextGoalBanner,
  CollectionHeroBanner,
} from '@/features/collection'
import ShareGoalModal from '@/features/roadmap/components/ShareGoalModal.vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'

const router = useRouter()
const collectionStore = useCollectionStore()

const isShareModalOpen = ref(false)
const selectedShareGoal = ref(null)

const shareMilestones = computed(() => {
  if (!selectedShareGoal.value) return []
  const amount = Number(selectedShareGoal.value.targetAmount) || 0
  return [
    { step: 1, milestoneAmount: Math.round(amount * 0.25), achieved: true },
    { step: 2, milestoneAmount: Math.round(amount * 0.5), achieved: true },
    { step: 3, milestoneAmount: Math.round(amount * 0.75), achieved: true },
    { step: 4, milestoneAmount: amount, achieved: true },
  ]
})

onMounted(async () => {
  await collectionStore.fetchAchievedGoals()
})

function handleGoToGoalSelect() {
  router.push({ name: ROUTE_NAMES.GOAL_SELECT, query: { from: 'dashboard' } })
}

function handleViewRoadmap(goal) {
  if (goal?.id) {
    router.push({ name: ROUTE_NAMES.DASHBOARD_GOAL, params: { goalId: goal.id } })
  } else {
    router.push({ name: ROUTE_NAMES.DASHBOARD })
  }
}

function handleShareGoal(goal) {
  selectedShareGoal.value = {
    goalId: goal.id,
    goalName: goal.title,
    goalType: goal.goalType,
    targetAmount: goal.achievedAmount,
    currentAmount: goal.achievedAmount,
    progressRate: 100,
  }
  isShareModalOpen.value = true
}
</script>
