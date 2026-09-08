<!-- 페이스메이커 전용 저금통 최초 개설 안내 모달 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- 헤더 -->
    <div class="flex items-center justify-between border-b border-slate-100 px-7 pb-[17px] pt-6">
      <div>
        <p class="text-xs font-bold text-slate-400">페이스메이커 전용 저금통</p>
        <h3 class="pt-0.5 text-base font-bold text-[#0a192f]">지금까지 모인 여유자금</h3>
      </div>
      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-full bg-[#f8fbff]"
        aria-label="닫기"
        @click="$emit('update:modelValue', false)"
      >
        <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
      </button>
    </div>

    <!-- 본문 -->
    <div class="flex flex-col items-center gap-5 px-7 py-6">
      <div class="flex flex-col items-center gap-3 py-4">
        <div
          class="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-[#f8fbff]"
        >
          <span class="text-[28px] leading-none">🪣</span>
        </div>
        <div class="flex flex-col items-center gap-1 text-center">
          <p class="text-base font-bold text-[#0a192f]">여유자금이 아직 없어요</p>
          <p class="text-xs leading-[19.5px] text-slate-500">
            페이스메이커 기능을 활성화하면<br />
            다음 날 오전 8시부터 자동으로 여유자금을 모아드려요
          </p>
        </div>
      </div>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_6px_10px_rgba(0,102,255,0.28)] transition hover:bg-[#005ce6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.99]"
        @click="goToPacemakerIntro"
      >
        <img src="@/assets/icons/pacemaker-setup-cta.svg" alt="" class="size-[15px]" />
        여유자금 저금통 개설하기
      </button>

      <button
        type="button"
        class="text-sm font-bold text-slate-400"
        @click="$emit('update:modelValue', false)"
      >
        닫기
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseModal from '@/shared/ui/BaseModal.vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()

function goToPacemakerIntro() {
  emit('update:modelValue', false)
  router.push({ name: ROUTE_NAMES.PACEMAKER })
}
</script>
