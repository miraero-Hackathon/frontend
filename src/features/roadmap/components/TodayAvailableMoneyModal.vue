<!-- 오늘의 여유자금 상세 모달: 오늘 쓸 수 있는 돈이 어떻게 계산됐는지 항목별로 보여줌 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex items-start justify-between border-b border-slate-100 px-7 pb-[17px] pt-6">
      <div>
        <p class="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
          <AppIcon name="sun" size="sm" /> 오늘의 여유자금
        </p>
        <p class="pt-1 text-2xl font-bold tracking-tight text-primary">
          {{ formatKRW(daily.todayAvailableMoney) }}
        </p>
      </div>
      <button
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8fbff]"
        aria-label="닫기"
        @click="$emit('update:modelValue', false)"
      >
        <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
      </button>
    </div>

    <div class="flex flex-col gap-4 px-7 py-5">
      <p class="text-xs font-bold uppercase tracking-wider text-slate-400">오늘의 자금 현황</p>

      <div class="flex flex-col">
        <div v-for="(row, index) in rows" :key="row.label">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-[#0a192f]">{{ row.label }}</p>
              <p class="pt-0.5 text-xs text-slate-400">{{ row.caption }}</p>
            </div>
            <p class="shrink-0 whitespace-nowrap text-sm font-bold" :class="row.colorClass">
              {{ formatKRW(row.amount) }}
            </p>
          </div>
          <div v-if="index < rows.length - 1" class="my-3 h-px w-full bg-slate-100" />
        </div>
      </div>

      <div
        class="flex items-center justify-between rounded-2xl border border-primary/20 bg-[#eaf2ff] px-5 py-4"
      >
        <p class="text-sm font-bold text-[#0a192f]">오늘의 여유자금</p>
        <p class="text-lg font-bold text-primary">{{ formatKRW(daily.todayAvailableMoney) }}</p>
      </div>

      <p class="text-[11px] sm:text-xs tracking-tight text-slate-400">
        이 금액 내에서 지출하면 목표 저축 계획이 지켜져요
      </p>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import AppIcon from '@/shared/ui/AppIcon.vue'
import { formatKRW } from '@/shared/lib/money'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  daily: {
    type: Object,
    required: true, // { todayAvailableMoney, todayExpense, remainingAvailableMoney }
  },
})
defineEmits(['update:modelValue'])

const rows = computed(() => [
  {
    label: '오늘 지출',
    caption: '오늘 발생한 실제 지출',
    amount: props.daily.todayExpense,
    colorClass: 'text-rose-500',
  },
  {
    label: '이번 기간 남은 가용금액',
    caption: '현재 기간에 앞으로 사용할 수 있는 금액',
    amount: props.daily.remainingAvailableMoney,
    colorClass: 'text-emerald-600',
  },
])
</script>
