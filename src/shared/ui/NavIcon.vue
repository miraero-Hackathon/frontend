<template>
  <span
    class="inline-flex shrink-0 items-center justify-center transition-all duration-200"
    :class="[
      containerClass,
      bare ? 'bg-transparent shadow-none' : 'rounded-xl bg-[#F2F4F6]',
      active && !bare ? 'ring-2 ring-primary/20' : '',
    ]"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      :class="[iconClass, tone, active ? 'scale-105' : '', 'transition-transform']"
    >
      <template v-if="name === 'roadmap'">
        <path
          fill="currentColor"
          d="m2.8 10.3 8-7.1a1.8 1.8 0 0 1 2.4 0l8 7.1c1 .9.4 2.5-1 2.5H19V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7.2H4c-1.5 0-2.1-1.7-1.2-2.5Z"
        />
        <path
          fill="#fff"
          fill-opacity=".72"
          d="M9.2 14.2a1.2 1.2 0 0 1 1.2-1.2h3.2a1.2 1.2 0 0 1 1.2 1.2V22H9.2v-7.8Z"
        />
      </template>
      <template v-else-if="name === 'spending'">
        <rect x="2" y="4" width="20" height="16" rx="4" fill="currentColor" />
        <path d="M2 9h20" stroke="#fff" stroke-opacity=".65" stroke-width="2" />
        <rect x="5" y="14" width="5" height="2" rx="1" fill="#fff" fill-opacity=".82" />
      </template>
      <template v-else-if="name === 'pacemaker'">
        <circle cx="12" cy="13" r="9" fill="currentColor" />
        <path
          d="M9 2h6M12 8.5V13l3 2"
          stroke="currentColor"
          stroke-width="2.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 8.5V13l3 2"
          stroke="#fff"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="13" r="1.2" fill="#fff" />
      </template>
      <template v-else-if="name === 'collection'">
        <path
          fill="currentColor"
          d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        />
        <path
          fill="#fff"
          fill-opacity=".7"
          d="m12 6.5 1.7 3.3 3.7.5-2.7 2.6.7 3.7-3.4-1.8-3.4 1.8.7-3.7-2.7-2.6 3.7-.5L12 6.5Z"
        />
      </template>
      <template v-else-if="name === 'products'">
        <circle cx="9" cy="13.5" r="7" fill="currentColor" fill-opacity=".55" />
        <circle cx="15" cy="10.5" r="7" fill="currentColor" />
        <circle cx="15" cy="10.5" r="4.5" fill="#fff" fill-opacity=".2" />
        <path
          d="m11.4 7.2 1.6 6.7 2-5.1 2 5.1 1.6-6.7M11.9 9.8h6.2M12.3 12h5.4"
          stroke="#fff"
          stroke-width="1.45"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </template>
      <template v-else-if="name === 'policy'">
        <path
          fill="currentColor"
          d="M5 2h11.5L21 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
        />
        <path fill="#fff" fill-opacity=".55" d="M16 2v5h5L16 2Z" />
        <path
          d="M7.5 11h9M7.5 15h7M7.5 18h5"
          stroke="#fff"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </template>
      <template v-else-if="name === 'coach'">
        <path
          fill="currentColor"
          d="M11.1 2.7a1 1 0 0 1 1.8 0l2 5.2 5.2 2a1 1 0 0 1 0 1.8l-5.2 2-2 5.2a1 1 0 0 1-1.8 0l-2-5.2-5.2-2a1 1 0 0 1 0-1.8l5.2-2 2-5.2Z"
        />
        <path
          fill="#fff"
          fill-opacity=".45"
          d="m12 7 .9 2.1L15 10l-2.1.9L12 13l-.9-2.1L9 10l2.1-.9L12 7Z"
        />
        <path
          fill="currentColor"
          d="M19 2.2 19.8 4l1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8.8-1.8Z"
        />
      </template>
      <template v-else-if="name === 'mypage'">
        <circle cx="12" cy="8" r="5" fill="currentColor" />
        <path fill="currentColor" fill-opacity=".78" d="M3 21a9 9 0 0 1 18 0v1H3v-1Z" />
        <path
          d="M8.5 8.2c1.8 1.3 5.2 1.3 7 0"
          stroke="#fff"
          stroke-opacity=".45"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </template>
      <template v-else>
        <rect x="3" y="4" width="18" height="3.5" rx="1.75" fill="currentColor" />
        <rect
          x="3"
          y="10.25"
          width="18"
          height="3.5"
          rx="1.75"
          fill="currentColor"
          fill-opacity=".78"
        />
        <rect
          x="3"
          y="16.5"
          width="18"
          height="3.5"
          rx="1.75"
          fill="currentColor"
          fill-opacity=".56"
        />
      </template>
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' },
  active: { type: Boolean, default: false },
  bare: { type: Boolean, default: false },
})
const tones = {
  roadmap: 'text-[#3182F6]',
  spending: 'text-[#D86F79]',
  pacemaker: 'text-[#00A878]',
  collection: 'text-[#8B5CF6]',
  products: 'text-[#F59E0B]',
  policy: 'text-[#3182F6]',
  coach: 'text-primary',
  mypage: 'text-[#64748B]',
  menu: 'text-[#64748B]',
}
const tone = computed(() => tones[props.name] || tones.menu)
const containerClass = computed(() =>
  props.bare
    ? 'size-6'
    : props.size === 'sm'
      ? 'size-8'
      : props.size === 'lg'
        ? 'size-10 rounded-[14px]'
        : 'size-9'
)
const iconClass = computed(() =>
  props.bare
    ? 'size-[22px]'
    : props.size === 'sm'
      ? 'size-[19px]'
      : props.size === 'lg'
        ? 'size-6'
        : 'size-[21px]'
)
</script>
