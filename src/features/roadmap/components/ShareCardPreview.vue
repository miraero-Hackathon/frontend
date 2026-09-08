<!-- 친구에게 공유하기 카드 미리보기: 인스타 포스터 감성 러닝 챌린지 카드 (금액 미노출) -->
<template>
  <div
    ref="cardRef"
    class="relative overflow-hidden rounded-3xl border border-[#cde0ff] bg-gradient-to-b from-[#ebf3ff] via-[#f5f9ff] to-[#ffffff] px-4 py-4 sm:px-5 sm:py-5 shadow-sm"
  >
    <!-- 배경 앰비언트 글로우 및 반짝이(Sparkle) 벡터 장식 (저장 이미지에도 영구 보존) -->
    <div class="pointer-events-none absolute -left-10 -top-10 size-36 rounded-full bg-primary/10 blur-2xl" />
    <div class="pointer-events-none absolute -right-10 top-20 size-32 rounded-full bg-[#66b2ff]/15 blur-2xl" />

    <!-- 좌상단 반짝이 ✨ -->
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      class="pointer-events-none absolute left-4 top-4 size-4 text-[#ffc83b]/80"
    >
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>

    <!-- 우상단 미니 반짝이 ✦ -->
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      class="pointer-events-none absolute right-4 top-8 size-3 text-primary/60"
    >
      <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9L12 0Z" />
    </svg>

    <!-- 좌하단 미니 반짝이 ✦ -->
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      class="pointer-events-none absolute bottom-14 left-4 size-2.5 text-[#ff8fab]/70"
    >
      <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9L12 0Z" />
    </svg>

    <!-- 상단 편집 가능한 타이틀 -->
    <div class="relative z-20 flex min-w-0 items-center justify-center gap-1 pb-1 pt-1 text-center whitespace-nowrap">
      <input
        v-if="isEditingTitle"
        ref="titleInputRef"
        v-model="titleText"
        type="text"
        maxlength="20"
        class="w-44 whitespace-nowrap border-b-2 border-primary bg-white/90 px-2 py-0.5 text-center text-sm font-bold text-[#0a192f] outline-none shadow-[0_1px_0_rgba(0,0,0,0.05)] rounded"
        @blur="isEditingTitle = false"
        @keyup.enter="isEditingTitle = false"
      />
      <p v-else class="shrink-0 whitespace-nowrap text-sm sm:text-[15px] font-bold tracking-tight text-[#0a192f]">
        {{ titleText }}
      </p>
      <button
        type="button"
        class="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/80 hover:text-primary active:scale-95 cursor-pointer"
        data-html2canvas-ignore="true"
        aria-label="문구 직접 편집"
        @click="startEditTitle"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-3.5"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>
    </div>

    <!-- 모달 오픈 시 축하 폭죽 캔버스 -->
    <canvas
      ref="confettiCanvasRef"
      class="pointer-events-none absolute inset-0 z-10 size-full"
      data-html2canvas-ignore="true"
    />

    <!-- 캐릭터 러닝 영역 -->
    <div class="relative z-10 my-1">
      <!-- 100%: 완주 축하 캐릭터 -->
      <div
        v-if="isCompleted"
        class="relative mx-auto flex h-40 max-w-[235px] items-end justify-center pb-2 sm:h-44 sm:max-w-[255px]"
      >
        <img
          :src="goalCharacterImage"
          :alt="`${goal.goalName} 캐릭터`"
          class="celebration-character h-[124px] w-[55%] object-contain sm:h-[138px] drop-shadow-sm"
        />
        <div class="-ml-8 flex w-[48%] items-end sm:-ml-9" :style="celebrationColiStyle">
          <img
            :src="coliFriendImage"
            alt="페이스메이커 콜리"
            class="celebration-character h-[114px] w-full object-contain sm:h-[128px] drop-shadow-sm"
          />
        </div>
      </div>

      <!-- 100% 미만: 달리기 캐릭터 + 콜리 -->
      <div
        v-else
        class="relative mx-auto flex h-36 max-w-[230px] items-end justify-center pb-0 sm:h-40"
      >
        <img
          :src="runningGoalCharacterImage"
          :alt="`${goal.goalName} 달리기 캐릭터`"
          class="running-character h-[108px] w-[54%] object-contain sm:h-[120px] drop-shadow-sm"
          :style="runningGoalCharacterStyle"
        />
        <div
          class="relative -ml-7 flex h-[90px] w-[32%] items-end justify-center sm:-ml-8 sm:h-[100px]"
        >
          <img
            :src="coliRunningImage"
            alt="페이스메이커 콜리"
            class="running-character h-[70px] w-full object-contain sm:h-[78px] drop-shadow-sm"
          />
        </div>
      </div>
    </div>

    <!-- 마일스톤 프로그레스 바 -->
    <div class="relative z-20 mt-1 px-1">
      <div class="relative h-16">
        <div class="absolute left-[5%] right-[5%] top-4 h-1.5 rounded-full bg-slate-200/80" />
        <div
          class="absolute left-[5%] top-4 h-1.5 rounded-full bg-gradient-to-r from-primary to-[#54a3ff] shadow-sm transition-[width] duration-500"
          :style="{ width: `${progressFillWidth}%` }"
        />

        <div
          v-for="milestone in shareMilestones"
          :key="milestone.id"
          class="absolute top-[9px] flex -translate-x-1/2 flex-col items-center"
          :style="{ left: `${milestone.position}%` }"
        >
          <span
            class="flex size-5 items-center justify-center rounded-full border-2 transition-all"
            :class="
              milestone.completed
                ? '!border-primary !bg-primary text-white shadow-[0_1px_0_rgba(0,0,0,0.05)]'
                : milestone.current
                  ? 'border-primary bg-white shadow-[0_0_0_3px_rgba(0,102,255,0.18)] scale-110'
                  : 'border-slate-300 bg-white'
            "
          >
            <svg v-if="milestone.completed" viewBox="0 0 16 16" class="size-3" aria-hidden="true">
              <path
                d="m3 8.2 3 3L13 4.8"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
              />
            </svg>
            <span v-else-if="milestone.current" class="size-2 rounded-full bg-primary" />
          </span>
          <span
            class="mt-1.5 whitespace-nowrap text-[11px] font-bold"
            :class="milestone.completed || milestone.current ? 'text-primary' : 'text-slate-400'"
          >
            {{ milestone.percent }}%
          </span>
          <span
            class="mt-0.5 whitespace-nowrap text-[10px]"
            :class="milestone.current ? 'font-bold text-primary' : 'text-slate-400 font-medium'"
          >
            {{ milestone.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- 하단 달성률 빅 타이포그래피 & 칭찬 배지 (카운트업 애니메이션 적용) -->
    <div class="relative z-20 mt-1 flex flex-col items-center justify-center text-center">
      <div class="flex items-baseline justify-center gap-0.5">
        <span class="text-4xl sm:text-5xl font-bold tracking-tight text-[#0a192f]">
          {{ animatedProgress }}
        </span>
        <span class="text-2xl sm:text-3xl font-bold text-primary">%</span>
      </div>

      <p
        class="mt-2 inline-flex items-center rounded-full border border-blue-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold text-[#0a192f] shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur-sm"
      >
        <span>{{ achievementMessage }}</span>
      </p>
    </div>

    <!-- 푸터 워터마크 (공식 인증 로고) -->
    <div class="relative z-20 mt-3.5 border-t border-blue-100/80 pt-2.5">
      <div class="mx-auto flex w-max items-center justify-center gap-1.5 whitespace-nowrap">
        <div class="flex size-4 items-center justify-center rounded-[5px] bg-primary">
          <img src="@/assets/icons/logo.svg" alt="" class="size-2.5" />
        </div>
        <span class="shrink-0 text-xs font-bold tracking-tight text-primary">미래로</span>
        <span class="text-[10px] font-semibold text-slate-400 tracking-wider">MIRAERO CHALLENGE</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import confetti from 'canvas-confetti'
import { useCountUp } from '@/shared/composables/useCountUp'
import duckFriendImage from '@/assets/images/duck_friend.png'
import lamaFriendImage from '@/assets/images/lama_friend.png'
import bearFriendImage from '@/assets/images/bear_friend.png'
import rabbitFriendImage from '@/assets/images/rabbit_friend.png'
import coliFriendImage from '@/assets/images/coli_friend.png'
import duckRunningImage from '@/assets/images/duck_new.png'
import lamaRunningImage from '@/assets/images/lama_new.png'
import bearRunningImage from '@/assets/images/bear_new.png'
import rabbitRunningImage from '@/assets/images/rabbit_3d.png'
import coliRunningImage from '@/assets/images/coli_new.png'

const props = defineProps({
  goal: { type: Object, required: true },
  milestones: { type: Array, required: true },
})

const GOAL_TYPE_CHARACTER = {
  INDEPENDENCE: duckFriendImage,
  WEDDING: lamaFriendImage,
  EMERGENCY: bearFriendImage,
  LOAN: rabbitFriendImage,
}

const GOAL_TYPE_RUNNING_CHARACTER = {
  INDEPENDENCE: duckRunningImage,
  WEDDING: lamaRunningImage,
  EMERGENCY: bearRunningImage,
  LOAN: rabbitRunningImage,
}

const GOAL_TYPE_FOOT_OFFSET = {
  INDEPENDENCE: 7,
  WEDDING: 2.7,
  EMERGENCY: 1.8,
  LOAN: 8,
}

// friend PNG별 하단 투명 여백 차이를 보정해 콜리의 발끝을 왼쪽 캐릭터 기준선에 맞춘다.
const CELEBRATION_COLI_FOOT_OFFSET = {
  INDEPENDENCE: 6,
  WEDDING: 0,
  EMERGENCY: -4,
  LOAN: 4,
}

const goalCharacterImage = computed(
  () => GOAL_TYPE_CHARACTER[props.goal.goalType] ?? rabbitFriendImage
)
const normalizedProgress = computed(() =>
  Math.min(100, Math.max(0, Math.round(Number(props.goal.progressRate) || 0)))
)
const { displayValue: animatedProgress } = useCountUp(normalizedProgress, { duration: 900 })
const isCompleted = computed(() => normalizedProgress.value >= 100)
const celebrationColiStyle = computed(() => ({
  transform: `translateY(${CELEBRATION_COLI_FOOT_OFFSET[props.goal.goalType] ?? 0}px)`,
}))
const runningGoalCharacterImage = computed(
  () => GOAL_TYPE_RUNNING_CHARACTER[props.goal.goalType] ?? rabbitRunningImage
)
const runningGoalCharacterStyle = computed(() => ({
  transform: `translateY(${GOAL_TYPE_FOOT_OFFSET[props.goal.goalType] ?? 4.6}%)`,
}))

// 대시보드와 동일하게 목표 금액 대비 마일스톤 목표 금액의 비율을 사용한다.
const shareMilestones = computed(() => {
  const fallbackPercents = [25, 50, 75, 100]
  const source = props.milestones.length
    ? props.milestones.slice(0, 4).map((milestone, index) => ({
        id: milestone.milestoneId ?? index,
        percent: Math.round((milestone.targetAmount / props.goal.goalAmount) * 100),
      }))
    : fallbackPercents.map((percent) => ({ id: percent, percent }))

  return source.map((milestone, index) => {
    const completed = isCompleted.value || normalizedProgress.value >= milestone.percent
    const previousPercent = source[index - 1]?.percent ?? 0
    const current = !completed && normalizedProgress.value >= previousPercent

    return {
      ...milestone,
      completed,
      current,
      position: 8 + index * (84 / Math.max(1, source.length - 1)),
      label:
        milestone.percent >= 100
          ? completed
            ? '완주!'
            : '완주'
          : current
            ? `${index + 1}단계 (현재)`
            : `${index + 1}단계`,
    }
  })
})

const progressFillWidth = computed(() => (animatedProgress.value / 100) * 90)
const achievementMessage = computed(() =>
  normalizedProgress.value >= 100 ? '멋지게 목표를 완주했어요!' : '목표까지 잘 달려가고 있어요!'
)

const cardRef = ref(null)
const confettiCanvasRef = ref(null)
let confettiRainTimer = null
const titleText = ref('이번 목표 자랑하기')
const isEditingTitle = ref(false)
const titleInputRef = ref(null)

async function startEditTitle() {
  isEditingTitle.value = true
  await nextTick()
  titleInputRef.value?.focus()
}

function fireConfetti() {
  if (!isCompleted.value || !confettiCanvasRef.value) return

  stopConfetti()

  const myConfetti = confetti.create(confettiCanvasRef.value, { resize: true, useWorker: true })
  const colors = [
    '#FFC542',
    '#0066FF',
    '#66B2FF',
    '#FF4D4D',
    '#FF8FAB',
    '#8B5CF6',
    '#10B981',
    '#FFD700',
  ]

  myConfetti({
    particleCount: 55,
    spread: 90,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.25 },
    colors,
    ticks: 220,
    gravity: 0.8,
    decay: 0.92,
    scalar: 0.9,
  })

  setTimeout(() => {
    myConfetti({
      particleCount: 35,
      spread: 110,
      startVelocity: 28,
      origin: { x: 0.5, y: 0.25 },
      colors: colors.slice(0, 6),
      ticks: 180,
      gravity: 0.75,
      decay: 0.91,
      scalar: 0.75,
    })
  }, 120)

  // 첫 폭죽 뒤에는 작은 조각을 위에서 계속 내려 축하 분위기를 유지한다.
  confettiRainTimer = setInterval(() => {
    myConfetti({
      particleCount: 8,
      angle: 270,
      spread: 75,
      startVelocity: 5,
      origin: { x: 0.15 + Math.random() * 0.7, y: -0.05 },
      colors,
      ticks: 240,
      gravity: 0.55,
      drift: (Math.random() - 0.5) * 0.8,
      decay: 0.94,
      scalar: 0.65,
    })
  }, 420)
}

function stopConfetti() {
  if (!confettiRainTimer) return
  clearInterval(confettiRainTimer)
  confettiRainTimer = null
}

onBeforeUnmount(() => {
  stopConfetti()
})

defineExpose({ cardRef, fireConfetti, stopConfetti })
</script>

<style scoped>
.celebration-character {
  animation: characterPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.running-character {
  animation: runnerEnter 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) both;
}

@keyframes characterPop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.82);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes runnerEnter {
  from {
    opacity: 0;
    scale: 0.88;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
</style>
