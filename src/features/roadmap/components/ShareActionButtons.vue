<!-- 친구에게 공유하기 액션 버튼 그리드 (이미지 저장 / 인스타그램 / 카카오톡 / 공유하기) -->
<template>
  <div class="mt-2 grid grid-cols-3 border-y border-slate-100 py-2">
    <button
      type="button"
      class="flex flex-col items-center justify-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-primary disabled:opacity-60 cursor-pointer select-none"
      :disabled="isSavingShareImage"
      @click="$emit('save-image')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-6 text-slate-600">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      <span class="inline-block text-center">{{
        isSavingShareImage ? '저장 중...' : '이미지 저장'
      }}</span>
    </button>
    <button
      type="button"
      class="flex flex-col items-center justify-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-primary disabled:opacity-60 cursor-pointer select-none"
      :disabled="isSaving"
      @click="$emit('share-instagram')"
    >
      <img src="@/assets/icons/instagram.svg" alt="" class="size-6 object-contain" />
      <span class="inline-block text-center">{{ isSaving ? '저장 중...' : '인스타그램' }}</span>
    </button>
    <button
      type="button"
      class="flex flex-col items-center justify-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-primary disabled:opacity-60 cursor-pointer select-none"
      :disabled="isSharingKakao"
      @click="$emit('share-kakao')"
    >
      <img src="@/assets/icons/kakaotalk.svg" alt="" class="size-6 object-contain" />
      <span class="inline-block text-center">{{
        isSharingKakao ? '공유 중...' : '카카오톡'
      }}</span>
    </button>
  </div>

  <button
    type="button"
    class="mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all duration-150 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] cursor-pointer select-none"
    @click="$emit('share')"
  >
    공유하기
  </button>
</template>

<script setup>
defineProps({
  isSavingShareImage: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false },
  isSharingKakao: { type: Boolean, default: false },
})

defineEmits(['save-image', 'share-instagram', 'share-kakao', 'share'])
</script>
