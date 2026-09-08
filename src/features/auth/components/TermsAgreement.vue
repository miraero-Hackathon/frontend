<!-- 회원가입 약관 동의 카드: 전체 동의 + 개별 약관 체크 + 약관 보기 모달 -->
<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs sm:p-6">
    <div class="flex items-start gap-2.5">
      <div class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p class="text-[13px] leading-relaxed text-slate-500 sm:text-sm">
        미래로는 회원님이 연결한 금융기관의 자산·거래 정보를 바탕으로 맞춤 로드맵과 지출 분석을
        제공해요.
      </p>
    </div>

    <label
      class="mt-3 flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 transition-all sm:mt-4 sm:p-3"
      :class="
        allAgreed
          ? 'border-blue-200 bg-[#f0f6ff]'
          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
      "
      @click.prevent="toggleAll"
    >
      <input
        type="checkbox"
        class="sr-only"
        :checked="allAgreed"
        @keydown.space.prevent="toggleAll"
      />
      <span
        class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors"
        :class="allAgreed ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'"
      >
        <svg
          v-if="allAgreed"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-2.5 w-2.5"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span class="text-sm font-bold" :class="allAgreed ? 'text-primary' : 'text-[#0a192f]'">
        약관 전체 동의
      </span>
    </label>

    <ul class="mt-2 divide-y divide-slate-100">
      <li
        v-for="term in terms"
        :key="term.id"
        class="flex items-start justify-between gap-1.5 py-2.5 sm:gap-2"
      >
        <label
          class="flex min-w-0 flex-1 cursor-pointer items-start gap-2 sm:gap-2.5"
          @click.prevent="toggle(term.id)"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="isAgreed(term.id)"
            @keydown.space.prevent="toggle(term.id)"
          />
          <span
            class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-[1.5px] transition-colors"
            :class="isAgreed(term.id) ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'"
          >
            <svg
              v-if="isAgreed(term.id)"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-2.5 w-2.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="flex min-w-0 flex-nowrap items-center gap-1 sm:gap-1.5">
              <span
                class="shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-bold sm:text-xs"
                :class="term.required ? 'bg-blue-50 text-primary' : 'bg-slate-100 text-slate-400'"
              >
                {{ term.required ? '필수' : '선택' }}
              </span>
              <span
                class="min-w-0 truncate whitespace-nowrap text-[13px] font-medium tracking-[-0.02em] text-[#0a192f] sm:text-sm sm:tracking-normal"
              >
                {{ term.label }}
              </span>
            </span>
            <span
              v-if="term.description"
              class="mt-0.5 text-[13px] text-slate-400 [word-break:keep-all]"
            >
              {{ term.description }}
            </span>
          </span>
        </label>
        <button
          type="button"
          class="shrink-0 self-start whitespace-nowrap pt-0.5 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-700 sm:text-[13px]"
          @click="openTerm(term)"
        >
          보기
        </button>
      </li>
    </ul>

    <BaseModal v-model="isModalOpen" hide-default-close>
      <div class="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <h2 class="text-lg font-bold text-gray-900">{{ activeTerm?.label }}</h2>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="닫기"
          @click="closeModal"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-6 py-5">
        <div v-if="activeTerm?.summary" class="rounded-2xl bg-accent-light p-4">
          <p class="flex items-center gap-2 text-sm font-bold text-primary">
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3 w-3"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            쉽게 요약하면
          </p>
          <ul class="mt-3 space-y-2">
            <li
              v-for="(point, index) in activeTerm.summary"
              :key="index"
              class="flex gap-2 text-sm leading-relaxed text-gray-700"
            >
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>

        <div
          v-if="activeTerm?.collectedItems"
          class="mt-4 flex items-start gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm"
        >
          <span class="shrink-0 font-semibold text-gray-900">수집 항목</span>
          <span class="text-gray-500">{{ activeTerm.collectedItems.join(', ') }}</span>
        </div>

        <button
          type="button"
          class="mt-4 flex items-center gap-1.5 text-sm font-semibold transition-colors"
          :class="isFullTextOpen ? 'text-primary' : 'text-gray-400'"
          @click="isFullTextOpen = !isFullTextOpen"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 transition-transform"
            :class="isFullTextOpen ? 'rotate-180' : ''"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          전문 보기
        </button>

        <div v-if="isFullTextOpen" class="mt-3 max-h-48 overflow-y-auto rounded-2xl bg-gray-50 p-4">
          <p class="whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {{ activeTerm?.content }}
          </p>
        </div>
      </div>

      <div class="flex gap-3 border-t border-gray-100 px-6 py-5">
        <button
          type="button"
          class="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          @click="closeModal"
        >
          닫기
        </button>
        <button
          type="button"
          class="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          @click="agreeAndClose"
        >
          동의하고 닫기
        </button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseModal from '@/shared/ui/BaseModal.vue'

const props = defineProps({
  terms: { type: Array, required: true },
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

const isModalOpen = ref(false)
const activeTerm = ref(null)
const isFullTextOpen = ref(false)

const allAgreed = computed(() => props.terms.every((term) => props.modelValue[term.id]))

function isAgreed(termId) {
  return Boolean(props.modelValue[termId])
}

function toggle(termId) {
  emit('update:modelValue', { ...props.modelValue, [termId]: !props.modelValue[termId] })
}

function toggleAll() {
  const nextValue = !allAgreed.value
  const next = {}
  props.terms.forEach((term) => {
    next[term.id] = nextValue
  })
  emit('update:modelValue', next)
}

function openTerm(term) {
  activeTerm.value = term
  isFullTextOpen.value = false
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function agreeAndClose() {
  if (activeTerm.value && !isAgreed(activeTerm.value.id)) {
    toggle(activeTerm.value.id)
  }
  closeModal()
}
</script>
