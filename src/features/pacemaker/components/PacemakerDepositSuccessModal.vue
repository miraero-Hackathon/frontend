<!-- 페이스메이커 입금 완료 안내 모달 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex flex-col items-center gap-5 px-7 py-10">
      <div
        class="flex size-20 items-center justify-center rounded-full shadow-[0_8px_16px_rgba(0,102,255,0.3)]"
        style="
          background-image: linear-gradient(135deg, rgb(0, 102, 255) 0%, rgb(102, 178, 255) 100%);
        "
      >
        <img src="@/assets/icons/deposit-success-check.svg" alt="" class="size-9" />
      </div>

      <div class="flex flex-col items-center gap-1.5 text-center">
        <h3 class="text-xl font-bold tracking-tight text-[#0a192f]">입금이 완료되었습니다!</h3>
        <p class="text-sm leading-[22.75px] text-slate-500">
          {{ formatWon(amount) }}이<br />
          <span class="font-bold text-[#0a192f]">{{ target?.accountNickname }}</span
          >으로 입금됐어요.
        </p>
      </div>

      <div
        class="flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-[#eaf2ff] px-5 py-4"
      >
        <div>
          <p class="text-xs text-slate-500">
            {{ target?.bankName }} {{ target?.accountNumberMasked }}
          </p>
          <p class="inline-flex items-center gap-1 pt-0.5 text-sm font-bold text-[#0a192f]">
            <GoalTypeIcon :goal-type="target?.goalType" size="sm" /> {{ target?.goalName }}
          </p>
        </div>
        <p class="text-lg font-bold text-primary">+{{ formatWon(amount) }}</p>
      </div>

      <button
        type="button"
        class="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-[0_6px_10px_rgba(0,102,255,0.28)]"
        style="
          background-image: linear-gradient(173deg, rgb(0, 102, 255) 0%, rgb(102, 178, 255) 100%);
        "
        @click="$emit('update:modelValue', false)"
      >
        확인
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/shared/ui/BaseModal.vue'
import GoalTypeIcon from '@/shared/ui/GoalTypeIcon.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  target: {
    type: Object,
    default: null, // { goalId, goalName, icon, accountNickname, bankName, accountNumberMasked }
  },
  amount: {
    type: Number,
    default: 0,
  },
})
defineEmits(['update:modelValue'])

function formatWon(value) {
  return `${value.toLocaleString()}원`
}
</script>
