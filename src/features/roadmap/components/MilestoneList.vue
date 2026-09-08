<!-- 전체 마일스톤 리스트 (러닝 스플릿 기록판 스타일 · 가로 카드 + 커넥터) -->
<template>
  <div class="w-full">
    <!-- 헤더 (모바일 한 줄 최적화 레이아웃) -->
    <div class="flex items-center justify-between gap-2 pb-3 sm:pb-3.5">
      <div class="flex min-w-0 items-baseline gap-2">
        <h3 class="text-base font-bold tracking-tight text-[#0a192f] whitespace-nowrap sm:text-lg">
          스플릿 기록
        </h3>
        <p class="text-xs font-medium text-slate-400 truncate whitespace-nowrap sm:text-xs">
          구간별 달성 현황
        </p>
      </div>
      <span
        class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 whitespace-nowrap"
      >
        총 {{ milestones.length }}개 구간
      </span>
    </div>

    <!-- 가로 스크롤 스플릿 카드 리스트 (모바일 스냅 스크롤 & 터치 피드백) -->
    <div
      ref="scrollContainer"
      class="no-scrollbar -mx-2 -my-3 flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto px-2 py-3.5 sm:-mx-3 sm:-my-4 sm:px-3 sm:py-4 snap-x snap-mandatory scroll-smooth scroll-px-2 sm:scroll-px-3 touch-pan-x"
      @scroll="handleScroll"
    >
      <template v-for="(milestone, index) in milestones" :key="milestone.milestoneId">
        <button
          type="button"
          :data-in-progress="milestone.status === 'IN_PROGRESS' ? 'true' : null"
          class="group relative flex min-w-[170px] sm:min-w-[175px] flex-1 cursor-pointer flex-col justify-between rounded-xl border p-3 text-left sm:p-3.5 transition-all duration-200 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.97] select-none snap-start"
          :class="[
            milestone.status === 'COMPLETED'
              ? 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-white hover:shadow-[0_1px_0_rgba(0,0,0,0.05)]'
              : milestone.status === 'IN_PROGRESS'
                ? 'border-primary/80 bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:border-primary hover:shadow-sm'
                : 'border-slate-200/60 bg-slate-50/40 opacity-70 hover:border-slate-300 hover:bg-white hover:opacity-100 hover:shadow-[0_1px_0_rgba(0,0,0,0.05)]',
          ]"
          @click="$emit('select-milestone', milestone)"
        >
          <div>
            <!-- 상단 뱃지 & 단계 (한 줄 유지) -->
            <div class="flex items-center justify-between gap-1.5 whitespace-nowrap">
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight transition-transform duration-200 group-hover:scale-105"
                :class="
                  milestone.status === 'COMPLETED'
                    ? 'bg-slate-200/80 text-slate-700'
                    : milestone.status === 'IN_PROGRESS'
                      ? 'bg-primary text-white shadow-[0_1px_0_rgba(0,0,0,0.05)]'
                      : 'bg-slate-200/60 text-slate-400'
                "
              >
                SPLIT {{ index + 1 }}
              </span>

              <span
                class="flex shrink-0 items-center gap-0.5 text-[10px] font-medium tabular-nums transition-colors duration-200"
                :class="
                  milestone.status === 'COMPLETED'
                    ? 'text-primary font-bold'
                    : 'text-slate-400 group-hover:text-slate-600'
                "
              >
                <span v-if="milestone.status === 'COMPLETED'" class="text-xs font-bold">✓</span>
                {{ milestone.percentage }}%
              </span>
            </div>

            <!-- 목표 금액 (한 줄 유지) -->
            <p
              class="pt-2 text-base font-bold tracking-tight whitespace-nowrap tabular-nums transition-colors duration-200"
              :class="
                milestone.status === 'COMPLETED' || milestone.status === 'IN_PROGRESS'
                  ? 'text-[#0a192f]'
                  : 'text-slate-400 group-hover:text-slate-700'
              "
            >
              {{ formatManwon(milestone.targetAmount) }}원
            </p>

            <p
              v-if="milestone.title"
              class="pt-0.5 text-[11px] font-medium text-slate-500 truncate whitespace-nowrap"
            >
              {{ milestone.title }}
            </p>
          </div>

          <!-- 하단 상태 및 진행률 바 -->
          <div class="pt-3">
            <!-- 진행 중인 구간 게이지 (한 줄 유지) -->
            <div v-if="milestone.status === 'IN_PROGRESS' && goal" class="space-y-1.5">
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                <div
                  class="h-1.5 rounded-full bg-primary transition-all duration-500"
                  :style="{ width: `${segmentProgress(milestone, index)}%` }"
                />
              </div>
              <div
              class="flex items-center justify-between text-[11px] font-medium whitespace-nowrap gap-1"
              >
                <span class="text-primary font-bold tabular-nums shrink-0"
                  >{{ segmentProgress(milestone, index) }}% 달성</span
                >
                <span class="text-slate-400 tabular-nums shrink-0"
                  >{{ formatManwon(remainingToNext(milestone)) }}원 남음</span
                >
              </div>
            </div>

            <!-- 완료/예정 상태 텍스트 (한 줄 유지) -->
            <div
              v-else
              class="flex items-center justify-between text-[11px] font-medium text-slate-400 whitespace-nowrap gap-1"
            >
              <span
                v-if="milestone.status === 'COMPLETED'"
                class="font-semibold text-primary shrink-0"
              >
                달성 완료
              </span>
              <span v-else class="transition-colors group-hover:text-slate-600 shrink-0"
                >도전 대기 중</span
              >
            </div>
          </div>
        </button>
      </template>
    </div>

    <!-- 가로 스크롤 가능함을 알리는 페이지 인디케이터 -->
    <div v-if="milestones.length > 1" class="mt-2.5 flex items-center justify-center gap-1.5">
      <span
        v-for="(milestone, index) in milestones"
        :key="milestone.milestoneId"
        class="size-1.5 rounded-full transition-colors duration-200"
        :class="index === activeIndex ? 'bg-primary' : 'bg-slate-300'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const scrollContainer = ref(null)
const activeIndex = ref(0)

defineEmits(['select-milestone'])

const props = defineProps({
  milestones: {
    type: Array,
    required: true,
  },
  goal: {
    type: Object,
    default: null,
  },
})

let hasScrolledToInProgress = false

// 목표가 바뀌면(goalId 변경) 이전 목표에서 이미 스크롤했다는 플래그를 초기화해
// 새 목표의 진행 중인 마일스톤으로 다시 자동 스크롤되게 한다. 같은 목표 안에서
// 마일스톤 목록만 갱신되는 경우(goalId 동일)에는 초기화하지 않아 스크롤이
// 불필요하게 반복 실행되지 않는다.
watch(
  () => props.goal?.goalId,
  (goalId, previousGoalId) => {
    if (goalId === previousGoalId) return
    hasScrolledToInProgress = false
  }
)

watch(
  () => props.milestones,
  (milestones) => {
    if (hasScrolledToInProgress || !milestones?.length) return
    const container = scrollContainer.value
    const inProgressIndex = milestones.findIndex((milestone) => milestone.status === 'IN_PROGRESS')
    const inProgressCardEl = container?.querySelector('[data-in-progress="true"]')
    if (!container || !inProgressCardEl) return

    const centeredLeft =
      inProgressCardEl.offsetLeft - (container.clientWidth - inProgressCardEl.clientWidth) / 2
    container.scrollLeft = Math.max(0, centeredLeft)
    if (inProgressIndex >= 0) activeIndex.value = inProgressIndex
    hasScrolledToInProgress = true
  },
  { immediate: true, flush: 'post' }
)

// 스크롤 중 뷰포트 중앙에 가장 가까운 카드를 찾아 하단 페이지 인디케이터에 반영
function handleScroll() {
  const container = scrollContainer.value
  if (!container) return

  const containerCenter = container.scrollLeft + container.clientWidth / 2
  let closestIndex = 0
  let closestDistance = Infinity

  ;[...container.children].forEach((child, index) => {
    const childCenter = child.offsetLeft + child.offsetWidth / 2
    const distance = Math.abs(childCenter - containerCenter)
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  })

  activeIndex.value = closestIndex
}

function formatManwon(amount) {
  return `${Math.round(amount / 10000).toLocaleString()}만`
}

function segmentProgress(milestone, index) {
  const from = props.milestones[index - 1]?.targetAmount ?? 0
  const to = milestone.targetAmount
  if (to <= from) return 100
  return Math.min(
    100,
    Math.max(0, Math.round(((props.goal.currentAmount - from) / (to - from)) * 100))
  )
}

function remainingToNext(milestone) {
  return Math.max(0, milestone.targetAmount - (props.goal?.currentAmount ?? 0))
}
</script>
