<template>
  <MypageModal
    v-model="isOpen"
    title-id="logout-modal-title"
    description-id="logout-modal-description"
    max-width-class="max-w-[380px]"
    role="alertdialog"
    :show-header="false"
  >
    <div class="px-7 pb-3 pt-7">
      <h2 id="logout-modal-title" class="text-lg font-bold text-[#0a192f]">
        로그아웃하시겠습니까?
      </h2>
      <p id="logout-modal-description" class="mt-1.5 text-sm leading-relaxed text-slate-500">
        다시 서비스를 이용하려면 로그인이 필요합니다.
      </p>
    </div>
    <div class="mypage-modal-actions pt-2">
      <button
        type="button"
        class="mypage-modal-secondary"
        autofocus
        :disabled="pending"
        @click="isOpen = false"
      >
        취소
      </button>
      <button
        type="button"
        class="mypage-modal-danger"
        :disabled="pending"
        @click="emit('confirm')"
      >
        {{ pending ? '로그아웃 중...' : '로그아웃' }}
      </button>
    </div>
  </MypageModal>
</template>

<script setup>
import { computed } from 'vue'
import MypageModal from '@/features/mypage/components/MypageModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // 서버 로그아웃 요청이 진행 중이면 중복 클릭과 취소를 막는다.
  pending: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
