<template>
  <section class="h-full" aria-labelledby="spending-peer-title">
    <article class="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 id="spending-peer-title" class="sr-only">또래 지출과 비교</h2>

      <div
        class="grid grid-cols-[minmax(0,2fr)_minmax(100px,1fr)] items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_140px] sm:gap-2"
        aria-label="또래 지출 비교 조건"
      >
        <div
          class="grid grid-cols-2 rounded-xl bg-[#F1F5F9] p-1"
          role="group"
          aria-label="비교 기준"
        >
          <button
            v-for="basis in SPENDING_COMPARISON_BASES"
            :key="basis.id"
            type="button"
            class="whitespace-nowrap rounded-lg px-1 py-2.5 text-[10px] font-semibold transition-all duration-150 sm:px-2 sm:text-xs"
            :class="
              selectedComparisonBasis === basis.id
                ? 'bg-white text-[#0066FF] shadow-sm font-bold'
                : 'text-[#64748B]'
            "
            :aria-pressed="selectedComparisonBasis === basis.id"
            @click="selectedComparisonBasis = basis.id"
          >
            {{ basis.label }}
          </button>
        </div>

        <div ref="peerGroupContainerRef" class="relative min-w-0">
          <button
            id="spending-peer-group-select"
            type="button"
            class="flex w-full items-center justify-between gap-1 rounded-xl border border-[#D6E4FF] bg-[#F8FBFF] py-2 pl-2.5 pr-2 text-[10px] font-bold text-[#0A192F] shadow-2xs outline-none transition-all duration-150 hover:border-[#0066FF]/60 hover:bg-[#F0F6FF] focus-visible:border-[#0066FF] focus-visible:ring-2 focus-visible:ring-[#0066FF]/20 cursor-pointer sm:py-2 sm:pl-3 sm:pr-2.5 sm:text-xs"
            aria-haspopup="listbox"
            :aria-expanded="isPeerGroupOpen"
            aria-label="비교 그룹 선택"
            @click="isPeerGroupOpen = !isPeerGroupOpen"
          >
            <span class="truncate">{{ selectedPeerGroupLabel }}</span>

            <svg
              class="h-3 w-3 shrink-0 text-[#0066FF] transition-transform duration-150 sm:h-3.5 sm:w-3.5"
              :class="isPeerGroupOpen ? 'rotate-180' : ''"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <ul
            v-if="isPeerGroupOpen"
            role="listbox"
            aria-label="비교 그룹 목록"
            class="absolute right-0 top-full z-20 mt-1.5 min-w-full overflow-hidden rounded-xl border border-[#D6E4FF] bg-white py-1 shadow-[0_12px_28px_rgba(15,35,70,0.12)]"
          >
            <li v-for="group in peerGroupOptions" :key="group.id" role="option" :aria-selected="group.id === selectedPeerGroupId">
              <button
                type="button"
                class="block w-full whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold transition-colors sm:text-xs"
                :class="
                  group.id === selectedPeerGroupId
                    ? 'bg-[#EAF2FF] text-[#0066FF]'
                    : 'text-[#0A192F] hover:bg-[#F8FBFF]'
                "
                @click="selectPeerGroup(group.id)"
              >
                {{ group.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <template v-if="comparisonItems.length > 0">
        <div
          class="mt-4 flex min-h-[64px] flex-col justify-center rounded-xl border border-primary/10 bg-[#F4F8FF] px-3.5 py-2.5 sm:px-4 sm:py-3"
        >
          <p
            class="flex flex-wrap items-baseline gap-x-1 text-xs font-bold tracking-tight text-[#0A192F] sm:text-sm"
          >
            <span class="whitespace-nowrap">
              {{ selectedPeerGroupLabel }} {{ peerComparisonLabel }}보다
            </span>

            <strong class="whitespace-nowrap" :class="totalDifferenceClass">
              월 {{ formatAmount(absoluteTotalDifference) }}만원
              {{ totalDifferenceLabel }}
            </strong>
          </p>

          <p class="mt-1 text-[11px] text-[#64748B] break-keep sm:text-xs">
            가장 차이가 큰 항목은 {{ largestDifferenceCategoryNames }}{{ categoryNamesEnding }}
          </p>
        </div>

        <ul class="mt-2 divide-y divide-slate-100">
          <li
            v-for="category in comparisonItems"
            :key="category.id"
            class="grid min-w-0 grid-cols-[28px_36px_minmax(100px,1fr)_52px] items-center gap-1.5 py-3.5 first:pt-2 last:pb-0 sm:grid-cols-[32px_56px_minmax(140px,1fr)_64px] sm:gap-3"
          >
            <SpendingCategoryIcon
              :icon="category.icon"
              :category-id="category.id"
              :accent="category.accent"
              size="sm"
            />

            <span class="truncate text-xs font-bold text-[#0A192F]">
              {{ category.name }}
            </span>

            <div
              class="grid min-w-0 gap-1.5"
              role="img"
              :aria-label="`${category.name}: 나 ${formatAmount(category.current)}만원, ${peerAverageLabel} ${formatAmount(category.peerAmount)}만원`"
            >
              <div
                class="grid grid-cols-[28px_minmax(0,1fr)_42px] items-center gap-1 text-[9px] text-[#64748B] sm:grid-cols-[32px_minmax(0,1fr)_48px] sm:text-[10px]"
              >
                <span class="font-medium text-[#64748B]">나</span>
                <div class="h-1.5 overflow-hidden rounded-full bg-[#EEF2F7]">
                  <div
                    class="h-full rounded-full bg-[#0066FF] transition-all duration-300 ease-out"
                    :style="{ width: `${category.currentWidth}%` }"
                  />
                </div>
                <strong class="whitespace-nowrap text-right font-bold tabular-nums text-[#0A192F]"
                  >{{ formatAmount(category.current) }}만원</strong
                >
              </div>

              <div
                class="grid grid-cols-[28px_minmax(0,1fr)_42px] items-center gap-1 text-[9px] text-[#64748B] sm:grid-cols-[32px_minmax(0,1fr)_48px] sm:text-[10px]"
              >
                <span class="font-normal text-[#94A3B8]">평균</span>
                <div class="h-1.5 overflow-hidden rounded-full bg-[#EEF2F7]">
                  <div
                    class="h-full rounded-full bg-[#94A3B8] transition-all duration-300 ease-out"
                    :style="{ width: `${category.peerWidth}%` }"
                  />
                </div>
                <span class="whitespace-nowrap text-right font-medium tabular-nums text-[#64748B]"
                  >{{ formatAmount(category.peerAmount) }}만원</span
                >
              </div>
            </div>

            <span
              class="whitespace-nowrap text-right text-xs font-bold tabular-nums"
              :class="getDifferenceClass(category.difference)"
            >
              {{ formatDifference(category.difference) }}
            </span>
          </li>
        </ul>
      </template>

      <p v-else class="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#64748B]">
        비교할 또래 지출 데이터가 없어요
      </p>
    </article>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import SpendingCategoryIcon from '@/features/spending/components/SpendingCategoryIcon.vue'
import { usePeerSpendingComparison } from '@/features/spending/composables/useSpendingComparisons'
import { SPENDING_COMPARISON_BASES } from '@/features/spending/constants/spending.constants'
import { formatKoreanNumber } from '@/shared/lib/money'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})

const formatAmount = formatKoreanNumber

const {
  selectedComparisonBasis,
  selectedPeerGroupId,
  selectedPeerGroupLabel,
  peerGroupOptions,
  comparisonItems,
  totalDifference,
  absoluteTotalDifference,
  totalDifferenceLabel,
  largestDifferenceCategoryNames,
} = usePeerSpendingComparison(toRef(props, 'summary'))

const peerComparisonLabel = computed(() =>
  selectedComparisonBasis.value === 'AGE' ? '또래' : '소득평균'
)

const isPeerGroupOpen = ref(false)
const peerGroupContainerRef = ref(null)

function selectPeerGroup(groupId) {
  selectedPeerGroupId.value = groupId
  isPeerGroupOpen.value = false
}

function handlePeerGroupClickOutside(event) {
  if (!isPeerGroupOpen.value) return
  if (peerGroupContainerRef.value && !peerGroupContainerRef.value.contains(event.target)) {
    isPeerGroupOpen.value = false
  }
}

function handlePeerGroupKeydown(event) {
  if (isPeerGroupOpen.value && event.key === 'Escape') {
    isPeerGroupOpen.value = false
  }
}

// 비교 기준(연령대/월소득)을 바꾸면 그룹 목록 자체가 달라지므로 열려 있던 목록은 닫는다.
watch(selectedComparisonBasis, () => {
  isPeerGroupOpen.value = false
})

onMounted(() => {
  document.addEventListener('click', handlePeerGroupClickOutside)
  window.addEventListener('keydown', handlePeerGroupKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handlePeerGroupClickOutside)
  window.removeEventListener('keydown', handlePeerGroupKeydown)
})

const peerAverageLabel = computed(() =>
  selectedComparisonBasis.value === 'AGE' ? '또래 평균' : '소득평균'
)

const categoryNamesEnding = computed(() => {
  const lastCharacterCode = largestDifferenceCategoryNames.value.charCodeAt(
    largestDifferenceCategoryNames.value.length - 1
  )
  const hasFinalConsonant =
    lastCharacterCode >= 0xac00 &&
    lastCharacterCode <= 0xd7a3 &&
    (lastCharacterCode - 0xac00) % 28 !== 0

  return hasFinalConsonant ? '이에요' : '예요'
})

const totalDifferenceClass = computed(() => {
  if (totalDifference.value > 0) {
    return 'text-[#FF5A67]'
  }

  if (totalDifference.value < 0) {
    return 'text-[#10B981]'
  }

  return 'text-[#0066FF]'
})

const getDifferenceClass = (difference) => {
  if (difference > 0) {
    return 'text-[#FF5A67]'
  }

  if (difference < 0) {
    return 'text-[#10B981]'
  }

  return 'text-[#64748B]'
}

const formatDifference = (difference) => {
  if (difference === 0) {
    return '비슷해요'
  }

  return `${difference > 0 ? '+' : '-'}${formatAmount(Math.abs(difference))}만원`
}
</script>
