<!-- 페이스메이커 자동 저축 전체 내역 바텀시트 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex items-center justify-between border-b border-slate-100 px-7 pb-[17px] pt-6">
      <h3 class="text-base font-bold text-[#0a192f]">자동저축 내역</h3>
      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-full bg-[#f8fbff]"
        aria-label="닫기"
        @click="$emit('update:modelValue', false)"
      >
        <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
      </button>
    </div>

    <div class="flex max-h-[420px] flex-col gap-2 overflow-y-auto px-7 py-5">
      <div
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
        role="alert"
      >
        <p class="text-sm font-bold text-red-600">자동 저축 내역을 불러오지 못했어요.</p>
        <button
          type="button"
          class="mt-3 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
          @click="$emit('retry')"
        >
          {{ isLoading ? '불러오는 중...' : '다시 시도' }}
        </button>
      </div>
      <div
        v-for="item in error || isLoading ? [] : histories"
        :key="item.date"
        class="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0"
      >
        <div>
          <p class="text-xs font-bold text-[#0a192f]">{{ formatDate(item.date) }}</p>
          <p class="pt-0.5 text-xs text-slate-400">{{ describeHistory(item) }}</p>
        </div>
        <p
          class="text-sm font-bold"
          :class="item.status === 'SAVED' ? 'text-primary' : 'text-slate-300'"
        >
          {{ item.status === 'SAVED' ? `+${formatWon(item.amount)}` : '—' }}
        </p>
      </div>

      <p v-if="!error && isLoading" class="py-6 text-center text-sm text-slate-400" role="status">
        자동 저축 내역을 불러오는 중이에요
      </p>
      <p
        v-if="!error && !isLoading && histories.length === 0"
        class="py-6 text-center text-sm text-slate-400"
      >
        아직 저축 내역이 없어요
      </p>
    </div>

    <p class="border-t border-slate-100 px-7 py-4 text-center text-[11px] leading-5 text-slate-400">
      최근 자동저축 내역을 최신순으로 보여드려요.
    </p>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/shared/ui/BaseModal.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  histories: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Object,
    default: null,
  },
})
defineEmits(['update:modelValue', 'retry'])

function describeHistory(item) {
  if (item.description) return item.description
  return item.status === 'SAVED' ? '하루 여유자금 자동 저축' : '저축 건너뜀'
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  return String(isoDate).replace(/-/g, '.')
}

function formatWon(amount) {
  return `${(amount ?? 0).toLocaleString()}원`
}
</script>
