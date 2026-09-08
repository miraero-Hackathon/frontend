<!-- 달성 목표 컬렉션 카드 -->
<template>
  <div
    class="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,102,255,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(0,102,255,0.08)]"
    tabindex="0"
    role="button"
    :aria-label="`${goal?.title || '완주 목표'} 로드맵 보기`"
    @click="$emit('view-roadmap', goal)"
    @keydown.enter="$emit('view-roadmap', goal)"
    @keydown.space.prevent="$emit('view-roadmap', goal)"
  >
    <!-- 상단 영역: 마스코트 캐릭터 & 완주 완료 배지 -->
    <div>
      <div class="flex items-start justify-between gap-3">
        <!-- 목표 캐릭터 아바타 (소프트 블루 톤앤매너) -->
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-[#eaf2ff] to-[#f4f8ff] p-1.5 shadow-inner transition-transform duration-200 group-hover:scale-105"
        >
          <img
            v-if="characterImage"
            :src="characterImage"
            :alt="goal?.title"
            class="size-9 object-contain drop-shadow-sm"
          />
          <GoalTypeIcon v-else :goal-type="goal?.goalType || ''" size="md" />
        </div>

        <!-- 완주 완료 배지 (대시보드 블루 톤) -->
        <span
          class="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-[#eaf2ff] px-2.5 py-1 text-xs font-bold text-primary"
        >
          <span class="size-1.5 rounded-full bg-primary" />
          <span>완주 완료</span>
        </span>
      </div>

      <!-- 목표 유형 & 제목 & 달성 금액 -->
      <div class="mt-3.5">
        <span class="text-[11px] font-bold text-slate-400">
          {{ goalTypeLabel }}
        </span>
        <h3
          class="mt-0.5 text-base font-bold text-[#0a192f] transition-colors group-hover:text-primary sm:text-lg"
        >
          {{ goal?.title || '달성된 목표' }}
        </h3>
        <p class="mt-1 text-2xl font-bold tracking-tight text-[#0a192f]">
          {{ formattedAmount }}
          <span class="text-xs font-bold text-slate-400 ml-0.5">달성</span>
        </p>
      </div>
    </div>

    <!-- 하단 상세 정보 박스 & 액션 -->
    <div class="mt-4">
      <!-- 완주 메타 데이터 박스 -->
      <div
        class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs"
      >
        <span class="font-medium text-slate-400">완주 시기</span>
        <span class="font-bold text-[#0a192f]">{{ goal?.achievedDate || '-' }}</span>
      </div>

      <!-- 하단 액션 링크 영역 -->
      <div class="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 shadow-2xs transition-all hover:border-primary/40 hover:bg-white hover:text-primary active:scale-95 cursor-pointer select-none"
          aria-label="완주 카드 자랑하기"
          @click.stop="$emit('share-goal', goal)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          <span>자랑하기</span>
        </button>

        <div
          class="inline-flex items-center gap-0.5 text-xs font-bold text-primary transition-transform group-hover:translate-x-0.5"
        >
          <span>로드맵 보기</span>
          <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatKRWCompact } from '@/shared/lib/money'
import GoalTypeIcon from '@/shared/ui/GoalTypeIcon.vue'
import duckImage from '@/assets/images/duck_new.png'
import lamaImage from '@/assets/images/lama_new.png'
import bearImage from '@/assets/images/bear_new.png'
import rabbitImage from '@/assets/images/rabbit_3d.png'

const props = defineProps({
  goal: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['view-roadmap', 'share-goal'])

const GOAL_TYPE_CHARACTER = {
  INDEPENDENCE: duckImage,
  WEDDING: lamaImage,
  EMERGENCY: bearImage,
  LOAN: rabbitImage,
  SAVE: bearImage,
}

const GOAL_TYPE_LABEL = {
  INDEPENDENCE: '독립자금 로드맵',
  WEDDING: '결혼자금 로드맵',
  EMERGENCY: '비상금 로드맵',
  LOAN: '학자금대출 로드맵',
  SAVE: '저축/목돈 로드맵',
}

const characterImage = computed(() => {
  return GOAL_TYPE_CHARACTER[props.goal?.goalType] ?? null
})

const goalTypeLabel = computed(() => {
  return GOAL_TYPE_LABEL[props.goal?.goalType] || '목표 로드맵'
})

const formattedAmount = computed(() => {
  const amount = Number(props.goal?.achievedAmount) || 0
  return amount > 0 ? formatKRWCompact(amount) : '0원'
})
</script>
