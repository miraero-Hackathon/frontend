<!-- 청년정책 스타일의 모던 커스텀 로드맵 선택기 (데스크톱: 플로팅 카드 팝오버 / 모바일: 바텀시트) -->
<template>
  <section
    class="flex min-h-[52px] sm:min-h-[58px] items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-2 sm:px-6 md:px-8"
    aria-labelledby="roadmap-selector-title"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5">
      <p id="roadmap-selector-title" class="shrink-0 text-xs font-medium text-slate-500 whitespace-nowrap">
        적용 대상
      </p>

      <!-- 커스텀 드롭다운 트리거 영역 -->
      <div ref="containerRef" class="relative min-w-0 w-full sm:w-[260px]">
        <button
          ref="triggerRef"
          type="button"
          class="flex h-9 sm:h-10 w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-[#0a192f] shadow-2xs outline-none transition-all duration-150 hover:border-slate-300 hover:bg-slate-50/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 select-none cursor-pointer"
          :disabled="disabled || goals.length === 0"
          aria-haspopup="dialog"
          :aria-expanded="isOpen"
          aria-label="로드맵 선택 드롭다운"
          @click="togglePicker"
        >
          <!-- 좌측 선택된 목표 2D 라인 아이콘 + 이름 -->
          <div class="flex min-w-0 items-center gap-2">
            <span
              class="flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
              aria-hidden="true"
            >
              <GoalTypeIcon
                :goal-type="matchedSelectedGoal?.goalType || matchedSelectedGoal?.goalName || ''"
                size="sm"
              />
            </span>
            <span class="truncate text-xs font-bold text-[#0a192f]">
              {{ selectedGoalLabel }}
            </span>
          </div>

          <!-- 우측 회전 화살표 아이콘 -->
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="size-3.5 shrink-0 text-slate-400 transition-transform duration-200"
            :class="isOpen ? 'rotate-180 text-primary' : ''"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <!-- 팝오버 / 바텀시트 상자 -->
        <template v-if="isOpen">
          <!-- 모바일 백드롭 -->
          <button
            type="button"
            class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
            aria-label="로드맵 선택 상자 닫기"
            @click="closePicker"
          />

          <!-- 드롭다운 박스 레이어 -->
          <section
            id="roadmap-select-dialog"
            ref="panelRef"
            role="dialog"
            aria-modal="true"
            aria-label="로드맵 선택 목록"
            class="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white p-5 shadow-[0_-16px_48px_rgba(15,23,42,0.18)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-[calc(100%+0.5rem)] sm:max-h-[420px] sm:w-[320px] sm:rounded-2xl sm:border sm:border-slate-200/90 sm:p-3 sm:shadow-[0_18px_48px_rgba(15,23,42,0.14)]"
          >
            <!-- 모바일 헤더 (데스크톱에서는 숨김) -->
            <header class="flex items-center justify-between border-b border-slate-100 pb-3 sm:hidden">
              <h2 class="text-base font-bold text-[#0a192f]">로드맵 선택</h2>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="닫기"
                @click="closePicker"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4">
                  <path stroke-linecap="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <!-- 로드맵 목록 -->
            <div class="mt-3 sm:mt-0 min-h-0 flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              <button
                v-for="goal in goals"
                :key="goal.goalId"
                type="button"
                class="group flex w-full items-center justify-between rounded-xl border p-2.5 sm:p-2.5 text-left transition-all duration-150 cursor-pointer select-none"
                :class="
                  String(goal.goalId) === String(selectedGoalId)
                    ? 'border-primary/40 bg-[#f0f6ff] shadow-2xs'
                    : 'border-transparent bg-[#f8fbff] hover:bg-slate-100/80 hover:border-slate-200'
                "
                @click="handleSelect(goal)"
              >
                <div class="flex min-w-0 items-center gap-2.5">
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-105"
                    :class="
                      String(goal.goalId) === String(selectedGoalId)
                        ? 'bg-white text-primary shadow-xs'
                        : 'bg-white/80 text-slate-500 group-hover:text-primary'
                    "
                  >
                    <GoalTypeIcon :goal-type="goal.goalType || goal.goalName || ''" size="sm" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <p
                        class="truncate text-xs font-bold transition-colors"
                        :class="
                          String(goal.goalId) === String(selectedGoalId)
                            ? 'text-primary'
                            : 'text-[#0a192f]'
                        "
                      >
                        {{ goal.goalName }} 로드맵
                      </p>
                    </div>
                    <p
                      v-if="goal.goalAmount"
                      class="mt-0.5 truncate text-[11px] font-medium text-slate-400"
                    >
                      {{ formatGoalSubText(goal) }}
                    </p>
                  </div>
                </div>

                <!-- 우측 체크마크 원 -->
                <div
                  class="flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-150"
                  :class="
                    String(goal.goalId) === String(selectedGoalId)
                      ? 'bg-primary text-white shadow-xs scale-100'
                      : 'border border-slate-200 bg-white text-transparent scale-90 group-hover:border-slate-300'
                  "
                >
                  <svg
                    class="size-3 stroke-[3]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>
          </section>
        </template>
      </div>
    </div>

    <p v-if="trailingText" class="shrink-0 text-[11px] font-medium text-slate-400">
      {{ trailingText }}
    </p>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import GoalTypeIcon from '@/shared/ui/GoalTypeIcon.vue'

const props = defineProps({
  goals: {
    type: Array,
    default: () => [],
  },
  selectedGoalId: {
    type: [Number, String],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  helperText: {
    type: String,
    default: '',
  },
  trailingText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:selectedGoalId', 'change'])

const isOpen = ref(false)
const containerRef = ref(null)
const triggerRef = ref(null)
const panelRef = ref(null)

const matchedSelectedGoal = computed(() =>
  props.goals.find((goal) => String(goal.goalId) === String(props.selectedGoalId))
)

const selectedGoalLabel = computed(() => {
  if (props.disabled || props.goals.length === 0) {
    return props.disabled ? '로드맵을 불러오는 중…' : '선택 가능한 로드맵 없음'
  }
  if (matchedSelectedGoal.value) {
    return `${matchedSelectedGoal.value.goalName} 로드맵`
  }
  return '로드맵 선택'
})

function formatGoalSubText(goal) {
  const parts = []
  if (goal.progressRate !== undefined && goal.progressRate !== null) {
    parts.push(`달성률 ${Math.round(Number(goal.progressRate))}%`)
  }
  if (goal.goalAmount) {
    const manwon = Math.round(Number(goal.goalAmount) / 10000)
    if (manwon >= 10000) {
      const eok = (manwon / 10000).toFixed(1).replace('.0', '')
      parts.push(`${eok}억원 목표`)
    } else {
      parts.push(`${manwon.toLocaleString()}만원 목표`)
    }
  }
  return parts.join(' · ')
}

function togglePicker() {
  if (props.disabled || props.goals.length === 0) return
  isOpen.value = !isOpen.value
}

function closePicker() {
  isOpen.value = false
}

function handleSelect(goal) {
  const goalId = goal.goalId ?? null
  emit('update:selectedGoalId', goalId)
  emit('change', goal)
  closePicker()
  nextTick(() => {
    triggerRef.value?.focus()
  })
}

function handleClickOutside(event) {
  if (!isOpen.value) return
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    closePicker()
  }
}

function handleKeydown(event) {
  if (isOpen.value && event.key === 'Escape') {
    closePicker()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKeydown)
})
</script>
