<template>
  <MypageModal
    v-model="isOpen"
    title="프로필 사진 수정"
    title-id="profile-image-modal-title"
    max-width-class="max-w-[420px]"
    :close-disabled="saving"
  >
    <div class="flex flex-col items-center gap-5 px-7 py-7">
      <div
        class="flex size-24 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#c5dcff] bg-gradient-to-br from-primary to-[#66b2ff] text-3xl font-bold text-white"
        aria-hidden="true"
      >
        <img v-if="previewUrl" :src="previewUrl" alt="" class="size-full object-cover" />
        <span v-else>{{ initial }}</span>
      </div>
      <input
        ref="fileInput"
        class="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        @change="selectImage"
      />
      <button
        type="button"
        class="mypage-image-select-button"
        autofocus
        @click="fileInput?.click()"
      >
        이미지 선택하기
      </button>
      <p v-if="file" class="max-w-full truncate text-xs text-slate-500">선택됨: {{ file.name }}</p>
      <p v-if="validationError || error" class="text-center text-xs text-red-600" role="alert">
        {{ validationError || error }}
      </p>
    </div>
    <div class="mypage-modal-actions">
      <button
        type="button"
        class="mypage-modal-secondary"
        :disabled="saving"
        @click="isOpen = false"
      >
        취소
      </button>
      <button
        type="button"
        class="mypage-modal-primary"
        :disabled="!file || saving"
        @click="emit('submit', file)"
      >
        <span v-if="saving" class="mypage-spinner text-white" aria-hidden="true" />
        {{ saving ? '저장 중' : '저장' }}
      </button>
    </div>
  </MypageModal>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import MypageModal from '@/features/mypage/components/MypageModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initial: { type: String, default: '' },
  currentImageUrl: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'submit'])
const fileInput = ref(null)
const file = ref(null)
const previewUrl = ref('')
const validationError = ref('')
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function revokePreview() {
  if (previewUrl.value && previewUrl.value !== props.currentImageUrl)
    URL.revokeObjectURL(previewUrl.value)
}

function reset() {
  revokePreview()
  file.value = null
  previewUrl.value = props.currentImageUrl
  validationError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function selectImage(event) {
  const selectedFile = event.target.files?.[0]
  if (!selectedFile) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
    validationError.value = 'JPG, PNG, WEBP 이미지만 선택할 수 있습니다.'
    return
  }
  if (selectedFile.size > 5 * 1024 * 1024) {
    validationError.value = '5MB 이하의 이미지를 선택해주세요.'
    return
  }

  revokePreview()
  file.value = selectedFile
  previewUrl.value = URL.createObjectURL(selectedFile)
  validationError.value = ''
}

watch(
  () => props.modelValue,
  (opened) => {
    if (opened) {
      reset()
      return
    }

    revokePreview()
    file.value = null
    previewUrl.value = ''
    validationError.value = ''
  }
)

onBeforeUnmount(revokePreview)
</script>
