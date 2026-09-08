<!-- 목표가 처음 100%에 도달했을 때 한 번 보여주는 달성 축하 모달 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="relative overflow-hidden rounded-2xl bg-white">
      <canvas
        ref="confettiCanvasRef"
        class="pointer-events-none fixed inset-0 z-[60] size-full"
        aria-hidden="true"
      />

      <div class="bg-[#f4f8ff] px-6 pb-7 pt-8 text-center">
        <div
          class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary shadow-[0_10px_28px_rgba(0,102,255,0.24)]"
        >
          <img :src="finishFlagIcon" alt="완주" class="size-8 brightness-0 invert" />
        </div>
        <h2 class="mt-5 text-2xl font-bold tracking-tight text-[#0a192f]">
          목표 달성 축하드립니다
        </h2>
        <p class="mt-2 text-sm font-medium text-slate-500">목표하신 미래로 한 발짝 가까워졌어요</p>
      </div>

      <div class="px-6 pb-6 pt-5">
        <dl class="rounded-2xl border border-blue-100 bg-[#f8fbff] px-5 py-4">
          <div class="flex items-center justify-between gap-4 py-1.5">
            <dt class="text-sm font-medium text-slate-500">목표명</dt>
            <dd class="text-right text-sm font-bold text-[#0a192f]">{{ goalName }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-1.5">
            <dt class="text-sm font-medium text-slate-500">달성 금액</dt>
            <dd class="text-right text-sm font-bold text-[#0a192f]">{{ achievedAmount }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-1.5">
            <dt class="text-sm font-medium text-slate-500">달성 시기</dt>
            <dd class="text-right text-sm font-bold text-[#0a192f]">{{ achievedDate }}</dd>
          </div>
        </dl>

        <button
          type="button"
          class="mt-5 w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,102,255,0.24)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isAdding"
          @click="$emit('add-to-collection')"
        >
          {{ isAdding ? '컬렉션에 담는 중...' : '달성한 목표 컬렉션에 담기' }}
        </button>
        <button
          type="button"
          class="mt-3 w-full py-1 text-sm font-bold text-slate-400 hover:text-slate-600"
          :disabled="isAdding"
          @click="$emit('later')"
        >
          나중에
        </button>
        <p v-if="errorMessage" class="mt-3 text-center text-xs font-medium text-red-500">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import confetti from 'canvas-confetti'
import BaseModal from '@/shared/ui/BaseModal.vue'
import finishFlagIcon from '@/assets/icons/milestone-final-flag.svg'
import { formatKRWCompact } from '@/shared/lib/money'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  goal: { type: Object, required: true },
  isAdding: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

defineEmits(['update:modelValue', 'add-to-collection', 'later'])

const confettiCanvasRef = ref(null)

const GOAL_TYPE_NAME = {
  INDEPENDENCE: '독립자금',
  WEDDING: '결혼자금',
  EMERGENCY: '비상금',
  LOAN: '학자금 대출 상환',
}

const goalName = computed(
  () => GOAL_TYPE_NAME[props.goal.goalType] ?? props.goal.goalName ?? '목표'
)
const achievedAmount = computed(() => formatKRWCompact(props.goal.goalAmount))
const achievedDate = computed(() => {
  const today = new Date()
  return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
})

function fireConfetti() {
  if (!confettiCanvasRef.value) return

  const launcher = confetti.create(confettiCanvasRef.value, { resize: true, useWorker: true })
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

  launcher({
    particleCount: 190,
    spread: 155,
    startVelocity: 58,
    origin: { x: 0.5, y: 0.42 },
    colors,
    ticks: 290,
    gravity: 0.7,
    decay: 0.9,
    scalar: 1.08,
  })
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    await nextTick()
    fireConfetti()
  },
  { immediate: true }
)
</script>
