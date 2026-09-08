<!-- 계좌·저금통 선택 카드: 선택 가능한 방식(예: 새로 만들기 / 기존 것 연결)을 나열할 때 공용 사용 -->
<template>
  <div
    class="cursor-pointer rounded-2xl border-2 p-4 transition-colors sm:p-5"
    :class="
      selected ? 'border-primary bg-white shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'
    "
    @click="emit('select')"
  >
    <div class="flex items-start gap-2.5 sm:gap-3">
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-light text-primary sm:h-10 sm:w-10"
      >
        <slot name="icon" />
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <p class="whitespace-nowrap text-[15px] font-bold text-gray-900 sm:text-base">
            {{ title }}
          </p>
          <span
            v-if="recommended"
            class="rounded-full bg-accent-light px-2 py-0.5 text-xs font-semibold text-primary"
          >
            추천
          </span>
        </div>
        <p class="mt-1 break-keep text-[13px] leading-relaxed text-gray-500 sm:text-sm">
          {{ description }}
        </p>

        <div v-if="tags.length" class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            v-for="tag in tags"
            :key="tag"
            class="flex items-center gap-1 text-xs text-gray-400"
          >
            <span class="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
            {{ tag }}
          </span>
        </div>
      </div>

      <span
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        :class="selected ? 'bg-primary text-white' : 'border-2 border-gray-200'"
      >
        <svg
          v-if="selected"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </div>

    <div v-if="selected && $slots.default" class="mt-4 border-t border-gray-100 pt-4" @click.stop>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  recommended: { type: Boolean, default: false },
  tags: { type: Array, default: () => [] },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])
</script>
