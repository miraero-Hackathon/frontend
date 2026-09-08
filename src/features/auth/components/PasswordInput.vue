<!-- 로그인·회원가입 공통 비밀번호 입력: BaseInput + 보기/숨기기 토글 -->
<template>
  <BaseInput
    :id="id"
    :model-value="modelValue"
    :label="label"
    :type="showPassword ? 'text' : 'password'"
    :placeholder="placeholder"
    :error="error"
    @update:model-value="emit('update:modelValue', $event)"
    @blur="emit('blur', $event)"
    @input="emit('input', $event)"
  >
    <template v-if="$slots.action" #action>
      <slot name="action" />
    </template>
    <template #suffix>
      <button
        type="button"
        class="text-gray-400 transition-colors hover:text-gray-600"
        :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
        @click="togglePassword"
      >
        <svg
          v-if="showPassword"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
        >
          <path d="M3 3l18 18" />
          <path
            d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a13.4 13.4 0 0 1-3.1 4M6.2 6.2C3.6 8 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.2-.9"
          />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      </button>
    </template>
  </BaseInput>
</template>

<script setup>
import { ref } from 'vue'
import BaseInput from '@/shared/ui/BaseInput.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'blur', 'input'])

const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>
