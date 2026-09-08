<!-- 계좌 선택 행: 출금계좌 선택 / 연결할 계좌 목록 등에서 공용 사용 (단일선택 라디오 · 복수선택 체크박스 지원) -->
<template>
  <label
    class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
    :class="selected ? 'border-primary bg-accent-light' : 'border-gray-200 bg-white hover:bg-gray-50'"
    @click.prevent="emit('select')"
  >
    <span class="flex min-w-0 items-center gap-3">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
        </svg>
      </span>
      <span class="min-w-0">
        <span class="block truncate text-sm font-medium text-gray-900">{{ label }}</span>
        <span v-if="sublabel" class="block truncate text-xs text-gray-400">{{ sublabel }}</span>
      </span>
    </span>

    <span class="flex shrink-0 items-center gap-2">
      <span v-if="meta" class="text-right text-xs text-gray-400">{{ meta }}</span>
      <span
        class="flex h-4 w-4 shrink-0 items-center justify-center border-2"
        :class="[
          multiple ? 'rounded-md' : 'rounded-full',
          selected ? 'border-primary bg-primary' : 'border-gray-300',
        ]"
      >
        <svg
          v-if="selected && multiple"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-2.5 w-2.5 text-white"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span v-else-if="selected" class="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
    </span>
  </label>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  sublabel: { type: String, default: '' },
  meta: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])
</script>
