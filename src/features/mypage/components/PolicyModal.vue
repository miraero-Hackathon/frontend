<template>
  <MypageModal
    v-model="isOpen"
    :title="policy.title"
    :title-id="`${policyKey}-policy-modal-title`"
    max-width-class="max-w-[480px]"
  >
    <div class="flex-1 overflow-y-auto px-7 py-5">
      <p class="whitespace-pre-wrap text-xs leading-[1.8] text-[#4a5568]">{{ policy.text }}</p>
    </div>
    <div class="border-t border-slate-100 px-7 py-5">
      <button type="button" class="mypage-modal-primary w-full" @click="isOpen = false">
        확인
      </button>
    </div>
  </MypageModal>
</template>

<script setup>
import { computed } from 'vue'
import { MYPAGE_POLICIES } from '@/features/mypage/constants/mypage.constants'
import MypageModal from '@/features/mypage/components/MypageModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  policyKey: { type: String, default: 'terms' },
})

const emit = defineEmits(['update:modelValue'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const policy = computed(() => MYPAGE_POLICIES[props.policyKey] ?? MYPAGE_POLICIES.terms)
</script>
