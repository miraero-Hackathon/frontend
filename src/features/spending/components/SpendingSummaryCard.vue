<template>
  <article class="flex h-[140px] flex-col rounded-2xl border border-[#E2E8F0] bg-white px-6 py-5">
    <div>
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-[#64748B]">
          {{ title }}
        </p>

        <button
          v-if="actionLabel"
          type="button"
          class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0066FF] transition-colors hover:text-[#0047B3] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/30"
          aria-haspopup="dialog"
          @click="$emit('action')"
        >
          {{ actionLabel }}
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div class="mt-2 flex items-end gap-1">
        <strong
          class="text-[30px] font-bold leading-none tracking-[-0.03em]"
          :class="valueColorClass"
        >
          {{ formattedValue }}
        </strong>

        <span class="pb-0.5 text-[13px] font-medium text-[#64748B]">
          {{ unit }}
        </span>
      </div>
    </div>

    <div v-if="hasProgress" class="mt-auto">
      <div class="mb-1.5 flex items-center justify-between gap-3">
        <span class="text-xs text-[#64748B]">
          {{ progressLabel }}
        </span>

        <span class="text-xs font-semibold text-[#0066FF]">
          {{ progressText }}
        </span>
      </div>

      <div
        class="h-1.5 overflow-hidden rounded-full bg-[#EAF2FF]"
        role="progressbar"
        :aria-valuenow="normalizedProgress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="progressLabel"
      >
        <div
          class="h-full rounded-full bg-[#0066FF] transition-[width] duration-300"
          :style="{ width: `${normalizedProgress}%` }"
        />
      </div>
    </div>

    <div v-else-if="description" class="mt-auto">
      <p class="whitespace-nowrap text-xs leading-5 text-[#64748B]">
        <span>{{ descriptionBeforeHighlight }}</span>
        <strong v-if="descriptionHighlight" class="font-semibold" :class="descriptionColorClass">
          {{ descriptionHighlight }}
        </strong>
        <span>{{ descriptionAfterHighlight }}</span>
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatKoreanNumber } from '@/shared/lib/money'

const TONE_CLASSES = {
  default: 'text-[#0A192F]',
  primary: 'text-[#0066FF]',
  positive: 'text-[#10B981]',
  warning: 'text-[#F59E0B]',
  coral: 'text-[#E76F6F]',
}

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  unit: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  descriptionHighlight: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'positive', 'warning', 'coral'].includes(value),
  },
  valueTone: {
    type: String,
    default: null,
    validator: (value) =>
      value === null || ['default', 'primary', 'positive', 'warning', 'coral'].includes(value),
  },
  progress: {
    type: Number,
    default: null,
  },
  progressLabel: {
    type: String,
    default: '목표 달성 진행률',
  },
  progressText: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['action'])

const formattedValue = computed(() => {
  if (typeof props.value !== 'number') {
    return props.value
  }

  return formatKoreanNumber(props.value)
})

const hasProgress = computed(() => props.progress !== null)

const normalizedProgress = computed(() => {
  if (!hasProgress.value) {
    return 0
  }

  return Math.min(Math.max(props.progress, 0), 100)
})

const descriptionHighlightIndex = computed(() => {
  if (!props.descriptionHighlight) {
    return -1
  }

  return props.description.indexOf(props.descriptionHighlight)
})

const descriptionBeforeHighlight = computed(() => {
  if (descriptionHighlightIndex.value < 0) {
    return props.description
  }

  return props.description.slice(0, descriptionHighlightIndex.value)
})

const descriptionAfterHighlight = computed(() => {
  if (descriptionHighlightIndex.value < 0) {
    return ''
  }

  return props.description.slice(
    descriptionHighlightIndex.value + props.descriptionHighlight.length
  )
})

const valueColorClass = computed(() => TONE_CLASSES[props.valueTone ?? props.tone])

const descriptionColorClass = computed(() => TONE_CLASSES[props.tone])
</script>
