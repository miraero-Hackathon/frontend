<template>
  <MypageSection title="목표 재설정" heading-id="goal-section-title">
    <div
      class="flex items-start gap-4 rounded-2xl border border-slate-200 bg-[#f4f8ff] p-4 sm:items-center"
    >
      <div
        class="hidden size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2ff] text-xl text-primary sm:flex"
        aria-hidden="true"
      >
        ⌂
      </div>
      <div v-if="goal" class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="text-xs font-medium text-slate-500">현재 목표</p>
          <span
            class="rounded-full px-2 py-0.5 text-[10px] font-bold"
            :class="
              isPaused(goal.status)
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            "
          >
            {{ isPaused(goal.status) ? '일시 정지' : '진행 중' }}
          </span>
        </div>
        <p class="mt-0.5 text-sm font-bold text-[#0a192f]">
          {{ goal.goalName }} {{ formatKRWCompact(goal.goalAmount) }} ·
          {{ goal.period.goalMonths }}개월
        </p>
        <p class="mt-0.5 text-xs text-slate-500">
          현재 {{ formatKRW(goal.currentAmount) }} ·
          {{ formatTargetDate(goal.period.endDate) }} 달성 예정
        </p>
      </div>
      <div v-else class="min-w-0 flex-1">
        <p class="text-sm font-bold text-[#0a192f]">
          {{
            loading
              ? '목표를 확인하고 있어요'
              : hasLoadError
                ? '목표를 불러오지 못했어요'
                : '설정된 목표가 없어요'
          }}
        </p>
        <p class="mt-0.5 text-xs text-slate-500">
          {{
            loading
              ? '잠시만 기다려주세요.'
              : hasLoadError
                ? '잠시 후 다시 시도해주세요.'
                : '목표 설정 흐름에서 안전하게 변경할 수 있어요.'
          }}
        </p>
      </div>
      <button
        type="button"
        class="mypage-primary-small-button"
        :disabled="loading"
        @click="hasLoadError ? emit('retry') : emit('reset')"
      >
        {{ loading ? '확인 중' : hasLoadError ? '다시 시도' : goal ? '재설정' : '목표 설정' }}
      </button>
    </div>
  </MypageSection>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/shared/lib/date'
import { formatKRW, formatKRWCompact } from '@/shared/lib/money'
import MypageSection from '@/features/mypage/components/MypageSection.vue'

const props = defineProps({
  goal: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['reset', 'retry'])
const hasLoadError = computed(() => !props.goal && Boolean(props.error))

function formatTargetDate(value) {
  return value?.length === 7 ? value.replace('-', '년 ') + '월' : formatDate(value)
}

function isPaused(status) {
  return ['PAUSE', 'PAUSED'].includes(status)
}
</script>
