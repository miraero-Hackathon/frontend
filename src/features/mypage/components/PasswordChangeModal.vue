<template>
  <MypageModal
    v-model="isOpen"
    title="비밀번호 변경"
    title-id="password-modal-title"
    max-width-class="max-w-[440px]"
    :close-disabled="saving"
  >
    <form class="flex flex-col gap-4 px-7 py-5" @submit.prevent="submit">
      <label v-for="(field, index) in fields" :key="field.key" class="block">
        <span class="mb-1.5 block text-xs font-semibold text-slate-500">{{ field.label }}</span>
        <div class="relative">
          <input
            v-model="form[field.key]"
            :type="visibility[field.key] ? 'text' : 'password'"
            :autocomplete="field.autocomplete"
            :autofocus="index === 0"
            class="mypage-password-input"
            :aria-invalid="Boolean(errors[field.key])"
            :aria-describedby="errors[field.key] ? `${field.key}-password-error` : undefined"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500"
            :aria-label="visibility[field.key] ? '비밀번호 숨기기' : '비밀번호 보기'"
            @click="visibility[field.key] = !visibility[field.key]"
          >
            {{ visibility[field.key] ? '숨김' : '보기' }}
          </button>
        </div>
        <small
          v-if="errors[field.key]"
          :id="`${field.key}-password-error`"
          class="mt-1.5 block text-xs text-red-700"
        >
          {{ errors[field.key] }}
        </small>
      </label>
      <p v-if="serverError" class="text-xs text-red-700" role="alert">{{ serverError }}</p>
      <div class="mypage-modal-actions -mx-7 -mb-5 mt-1">
        <button
          type="button"
          class="mypage-modal-secondary"
          :disabled="saving"
          @click="isOpen = false"
        >
          취소
        </button>
        <button type="submit" class="mypage-modal-primary" :disabled="saving">
          <span v-if="saving" class="mypage-spinner text-white" aria-hidden="true" />
          {{ saving ? '변경 중' : '비밀번호 변경' }}
        </button>
      </div>
    </form>
  </MypageModal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import MypageModal from '@/features/mypage/components/MypageModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  serverError: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'submit'])
const fields = [
  { key: 'currentPassword', label: '현재 비밀번호', autocomplete: 'current-password' },
  { key: 'newPassword', label: '새 비밀번호', autocomplete: 'new-password' },
  { key: 'newPasswordConfirm', label: '새 비밀번호 확인', autocomplete: 'new-password' },
]
const form = reactive({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
const visibility = reactive({
  currentPassword: false,
  newPassword: false,
  newPasswordConfirm: false,
})
const errors = reactive({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function reset() {
  for (const key of Object.keys(form)) {
    form[key] = ''
    visibility[key] = false
    errors[key] = ''
  }
}

function validate() {
  errors.currentPassword = form.currentPassword ? '' : '현재 비밀번호를 입력해주세요.'
  errors.newPassword = ''
  errors.newPasswordConfirm = ''

  if (form.newPassword.length < 8) {
    errors.newPassword = '8자 이상이어야 합니다.'
  } else if (
    !/[a-zA-Z]/.test(form.newPassword) ||
    !/\d/.test(form.newPassword) ||
    !/[^a-zA-Z0-9]/.test(form.newPassword)
  ) {
    errors.newPassword = '영문, 숫자, 특수문자를 모두 포함해야 합니다.'
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = '현재 비밀번호와 다른 비밀번호를 입력해주세요.'
  }

  if (!form.newPasswordConfirm) {
    errors.newPasswordConfirm = '새 비밀번호 확인을 입력해주세요.'
  } else if (form.newPasswordConfirm !== form.newPassword) {
    errors.newPasswordConfirm = '새 비밀번호가 일치하지 않습니다.'
  }

  return !Object.values(errors).some(Boolean)
}

function submit() {
  if (!validate() || props.saving) return
  emit('submit', {
    currentPassword: form.currentPassword,
    newPassword: form.newPassword,
  })
}

watch(
  () => props.modelValue,
  (opened) => {
    if (opened) reset()
  }
)
</script>
