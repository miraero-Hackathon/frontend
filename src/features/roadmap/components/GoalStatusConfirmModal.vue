<!-- 목표 일시정지/재개 확인 모달: 문구만 다른 동일한 형태라 mode prop으로 하나의 컴포넌트로 통합 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-5 px-7 pb-6 pt-7">
      <div>
        <h3 class="text-lg font-bold tracking-tight text-[#0a192f]">{{ copy.title }}</h3>
        <p class="pt-2.5 text-sm leading-[22.75px] text-[#4a5568]">
          {{ copy.descBefore }}<strong class="font-bold">{{ copy.descStrong }}</strong
          >{{ copy.descAfter }}
        </p>
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-[14px] border border-slate-200 bg-[#f4f8ff] py-3 text-sm font-bold text-slate-500"
          @click="$emit('update:modelValue', false)"
        >
          취소
        </button>
        <button
          type="button"
          class="flex-1 rounded-[14px] bg-primary py-3 text-sm font-bold text-white shadow-[0_4px_7px_rgba(0,102,255,0.28)]"
          @click="$emit('confirm')"
        >
          확인
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/shared/ui/BaseModal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'resume', // 'pause' | 'resume'
  },
})
defineEmits(['update:modelValue', 'confirm'])

const COPY = {
  pause: {
    title: '목표를 일시정지 하시겠습니까?',
    descBefore: "일시정지하면 이 목표는 '대기 중'이 되고, 저금통의 ",
    descStrong: '자동이체가 해제',
    descAfter: '됩니다. 언제든 다시 시작할 수 있어요.',
  },
  resume: {
    title: '목표를 재개하시겠습니까?',
    descBefore: '재개하면 다음 이체일부터 저금통에 ',
    descStrong: '자동이체가 시작',
    descAfter: '됩니다. 언제든 다시 멈출 수 있어요.',
  },
}

const copy = computed(() => COPY[props.mode] ?? COPY.pause)
</script>
