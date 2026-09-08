<template>
  <div ref="containerRef" class="relative w-full">
    <!-- 지역 선택 트리거 버튼 -->
    <button
      ref="triggerRef"
      type="button"
      class="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all hover:border-primary/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 cursor-pointer"
      :class="{ 'border-primary ring-2 ring-primary/10': isOpen }"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="togglePicker"
    >
      <span class="truncate">{{ displayValue }}</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="size-4 shrink-0 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180 text-primary': isOpen }"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <!-- [웹 / 데스크톱] 버튼 바로 아래 열리는 깔끔한 드롭다운 팝오버 -->
    <div
      v-if="isOpen && isDesktop"
      class="absolute right-0 top-[calc(100%+6px)] z-30 flex max-h-72 w-48 flex-col overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.14)]"
      role="listbox"
      aria-label="지역 선택"
    >
      <button
        v-for="region in regions"
        :key="region"
        type="button"
        role="option"
        :aria-selected="props.modelValue === region"
        class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer select-none text-left"
        :class="
          props.modelValue === region
            ? 'bg-blue-50/70 text-primary font-extrabold'
            : 'text-slate-700 hover:bg-slate-50'
        "
        @click="selectAndApply(region)"
      >
        <span>{{ region === '전체' ? '지역 전체' : region }}</span>
        <svg
          v-if="props.modelValue === region"
          class="size-4 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>

    <!-- [모바일] 토스 스타일 바닥 바텀시트 모달 -->
    <Teleport to="body">
      <template v-if="isOpen && !isDesktop">
        <!-- 딤 배경 (클릭 시 닫힘) -->
        <div
          class="fixed inset-0 z-50 bg-[#0a192f]/40 backdrop-blur-[1px] transition-opacity"
          aria-label="지역 선택 닫기"
          @click="closePicker"
        />

        <section
          id="region-select-dialog"
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          aria-labelledby="region-select-title"
          class="fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-[28px] bg-white px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgba(15,23,42,0.2)]"
        >
          <!-- 모바일 상단 손잡이 바 -->
          <div class="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-200" />

          <header class="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h2 id="region-select-title" class="text-base font-bold text-[#0a192f]">
              지역 선택
            </h2>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 active:scale-95 cursor-pointer"
              aria-label="닫기"
              @click="closePicker"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="size-4"
              >
                <path stroke-linecap="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="mt-2 min-h-0 flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
            <label
              v-for="(region, index) in regions"
              :key="region"
              class="flex cursor-pointer items-center justify-between py-3.5 px-3 text-sm font-bold transition-all hover:bg-slate-50 active:bg-slate-100 rounded-xl select-none"
              :class="
                draftRegion === region
                  ? 'text-primary font-extrabold bg-blue-50/50'
                  : 'text-slate-700'
              "
            >
              <input
                v-model="draftRegion"
                class="sr-only"
                type="radio"
                name="youth-policy-region"
                :value="region"
                :aria-describedby="`region-option-${index}`"
              />
              <span :id="`region-option-${index}`" class="text-sm font-bold">
                {{ region === '전체' ? '지역 전체' : region }}
              </span>
              <svg
                v-if="draftRegion === region"
                class="size-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </label>
          </div>

          <footer class="mt-4 border-t border-slate-100 pt-3.5">
            <button
              type="button"
              class="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(0,102,255,0.2)] transition hover:bg-blue-700 active:scale-[0.99] cursor-pointer"
              @click="applyRegion"
            >
              확인
            </button>
          </footer>
        </section>
      </template>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMediaQuery } from '@/shared/composables/useMediaQuery'

const props = defineProps({
  modelValue: { type: String, default: '전체' },
  regions: { type: Array, required: true },
})
const emit = defineEmits(['apply'])

const isDesktop = useMediaQuery('(min-width: 640px)')

const isOpen = ref(false)
const draftRegion = ref(props.modelValue)
const containerRef = ref(null)
const triggerRef = ref(null)
const panelRef = ref(null)

const displayValue = computed(() => (props.modelValue === '전체' ? '지역 전체' : props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    if (!isOpen.value) draftRegion.value = value
  }
)

function togglePicker() {
  if (isOpen.value) {
    closePicker()
  } else {
    openPicker()
  }
}

async function openPicker() {
  draftRegion.value = props.modelValue
  isOpen.value = true
  await nextTick()
  if (!isDesktop.value) {
    panelRef.value?.querySelector('input:checked')?.focus()
  }
}

function closePicker() {
  isOpen.value = false
  nextTick(() => triggerRef.value?.focus({ preventScroll: true }))
}

function selectAndApply(region) {
  emit('apply', region)
  closePicker()
}

function applyRegion() {
  emit('apply', draftRegion.value)
  closePicker()
}

function handleClickOutside(event) {
  if (!isOpen.value) return
  if (isDesktop.value) {
    if (containerRef.value && !containerRef.value.contains(event.target)) {
      closePicker()
    }
  }
}

function handleKeydown(event) {
  if (isOpen.value && event.key === 'Escape') closePicker()
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKeydown)
})
</script>
