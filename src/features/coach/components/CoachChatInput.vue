<template>
  <div
    class="border-t border-slate-200/80 bg-white px-3.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] sm:px-6 sm:pt-3 sm:pb-3.5 lg:px-10"
  >
    <!-- 추천 질문 칩 (하단 입력창 위 고정 가로 스크롤 탭) -->
    <div
      v-if="!coachStore.isSending"
      class="mb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:flex-wrap"
    >
      <button
        v-for="prompt in SUGGESTED_PROMPTS"
        :key="prompt"
        type="button"
        class="shrink-0 rounded-full border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer select-none"
        :disabled="coachStore.isSending"
        @click="coachStore.sendMessage(prompt)"
      >
        {{ prompt }}
      </button>
    </div>

    <!-- 입력창 및 전송 버튼 -->
    <div
      class="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-1.5 sm:py-2 shadow-xs transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15 sm:px-4"
    >
      <textarea
        ref="textareaRef"
        v-model="draftInput"
        rows="1"
        placeholder="목표 달성에 대해 물어보세요"
        class="min-h-[22px] max-h-[110px] flex-1 resize-none bg-transparent py-1 text-xs leading-[20px] text-[#0a192f] placeholder:text-slate-400 focus:outline-none disabled:cursor-wait disabled:text-slate-400 sm:min-h-[24px] sm:py-1 sm:text-sm sm:leading-[22px]"
        :disabled="coachStore.isSending"
        @input="autoGrow"
        @keydown.enter.exact.prevent="handleAction"
      />
      <button
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 sm:size-9 cursor-pointer"
        :class="
          coachStore.isSending
            ? 'bg-primary text-white hover:bg-primary/90'
            : canSend
              ? 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90'
              : 'bg-slate-200 text-slate-400'
        "
        :disabled="!coachStore.isSending && !canSend"
        :aria-label="coachStore.isSending ? '답변 생성 중지' : '메시지 전송'"
        @click="handleAction"
      >
        <svg
          v-if="!coachStore.isSending"
          class="size-4 transition-transform duration-150"
          :class="canSend ? '-translate-y-0.5' : ''"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" class="size-3.5" aria-hidden="true">
          <rect x="5" y="5" width="14" height="14" rx="2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useCoachStore } from '@/features/coach/store/coach.store'
import { SUGGESTED_PROMPTS } from '@/features/coach/constants/coach.constants'

const coachStore = useCoachStore()
const textareaRef = ref(null)

const draftInput = computed({
  get: () => coachStore.draftInput,
  set: (value) => coachStore.setDraftInput(value),
})

const canSend = computed(() => draftInput.value.trim().length > 0 && !coachStore.isSending)

watch(draftInput, (value) => {
  if (value) return
  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  })
})

function autoGrow(event) {
  const el = event.target
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

function handleAction() {
  if (coachStore.isSending) {
    coachStore.stopGenerating()
    return
  }
  if (!canSend.value) return
  coachStore.sendMessage()
}
</script>
