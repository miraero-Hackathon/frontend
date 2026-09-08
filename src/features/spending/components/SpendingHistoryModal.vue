<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end justify-center bg-[#0A192F]/35 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
      @click.self="close"
      @keydown.esc.stop="close"
    >
      <section
        ref="dialogRef"
        class="flex max-h-[calc(100dvh-144px)] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_24px_70px_rgba(10,25,47,0.22)] outline-none sm:max-h-[min(632px,calc(100dvh-160px))] sm:rounded-[20px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spending-history-title"
        tabindex="-1"
        @keydown.tab="trapFocus"
      >
        <header class="flex items-start justify-between gap-5 px-6 pb-4 pt-6 sm:px-7">
          <div>
            <h3 id="spending-history-title" class="text-lg font-bold text-[#0A192F]">
              이번 달 지출 내역
            </h3>
            <p class="mt-1.5 text-xs leading-5 text-[#64748B]">
              마이데이터를 통해 자동으로 분류된 최근 내역이에요
            </p>
          </div>

          <button
            type="button"
            class="flex size-8 shrink-0 items-center justify-center rounded-full text-[#0A192F] transition-colors hover:bg-[#F4F8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/30"
            aria-label="지출 내역 닫기"
            @click="close"
          >
            <img src="@/assets/icons/modal-close.svg" alt="" class="size-4" />
          </button>
        </header>

        <div class="px-6 sm:px-7">
          <div
            class="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#FBFDFF] px-4 py-4"
          >
            <div>
              <p class="text-xs text-[#64748B]">총 금액</p>
              <p class="mt-1 text-xl font-bold tracking-[-0.03em] text-[#0A192F]">
                {{ formattedTotalExpense }}
              </p>
            </div>

            <div class="text-right">
              <p class="text-xs text-[#64748B]">총 건수</p>
              <p class="mt-1 text-xl font-bold text-[#0A192F]">{{ totalCount }}건</p>
            </div>
          </div>

          <div
            v-if="categoryFilters.length > 1"
            class="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="지출 카테고리 필터"
          >
            <button
              v-for="category in categoryFilters"
              :key="category.value"
              type="button"
              class="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/30"
              :class="
                selectedCategory === category.value
                  ? 'border-[#0066FF] bg-[#0066FF] text-white'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#B9D4FF] hover:text-[#0066FF]'
              "
              :aria-pressed="selectedCategory === category.value"
              @click="selectedCategory = category.value"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <div class="mt-3 min-h-0 flex-1 overflow-y-auto px-6 pb-5 sm:px-7">
          <div v-if="loading" class="flex min-h-[280px] items-center justify-center">
            <LoadingSpinner message="최근 지출 내역을 불러오는 중이에요" />
          </div>

          <div
            v-else-if="error"
            class="flex min-h-[280px] flex-col items-center justify-center text-center"
          >
            <p class="text-sm font-semibold text-[#0A192F]">내역을 불러오지 못했어요</p>
            <p class="mt-1 text-xs text-[#64748B]">잠시 후 다시 시도해 주세요</p>
            <button
              type="button"
              class="mt-4 rounded-xl bg-[#EAF2FF] px-4 py-2 text-xs font-semibold text-[#0066FF]"
              @click="$emit('retry')"
            >
              다시 시도
            </button>
          </div>

          <div
            v-else-if="groupedTransactions.length === 0"
            class="flex min-h-[280px] items-center justify-center text-sm text-[#94A3B8]"
          >
            해당 카테고리의 지출 내역이 없어요
          </div>

          <div v-else>
            <div v-for="group in groupedTransactions" :key="group.date" class="pt-3">
              <p class="border-b border-[#EAF2F7] pb-2 text-xs font-medium text-[#64748B]">
                {{ formatDateLabel(group.date) }}
              </p>

              <ul>
                <li
                  v-for="transaction in group.transactions"
                  :key="transaction.transactionId"
                  class="flex items-center gap-3 border-b border-[#EEF2F6] py-3.5 last:border-b-0"
                >
                  <SpendingCategoryIcon
                    :icon="categoryMeta(transaction.categoryName).icon"
                    :category-id="categoryMeta(transaction.categoryName).id"
                    :accent="categoryMeta(transaction.categoryName).accent"
                    size="md"
                  />

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-[#0A192F]">
                      {{ transaction.transactionName }}
                    </p>
                    <p class="mt-0.5 text-xs text-[#64748B]">
                      {{ transaction.categoryName }}
                    </p>
                  </div>

                  <div class="shrink-0 text-right">
                    <p class="text-sm font-bold text-[#0A192F]">
                      {{ formatAmount(transaction.amount) }}
                    </p>
                    <p class="mt-0.5 text-xs text-[#94A3B8]">
                      {{ formatTime(transaction.transactedAt) }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <footer
          v-if="!loading && !error && transactions.length > 0"
          class="border-t border-[#EEF2F6] bg-white px-6 py-4 text-center text-xs text-[#64748B] sm:px-7"
        >
          {{ footerText }}
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import SpendingCategoryIcon from '@/features/spending/components/SpendingCategoryIcon.vue'
import { formatKRW, formatKRWCompact } from '@/shared/lib/money'
import { SPENDING_CATEGORIES } from '@/features/spending/constants/spending.constants'

const DEFAULT_CATEGORY_META = { icon: '💳', softColor: '#F1F5F9' }

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  transactions: {
    type: Array,
    default: () => [],
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Error, Object],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'retry'])

const dialogRef = ref(null)
const selectedCategory = ref('ALL')
let previouslyFocusedElement = null
let appRoot = null
let appWasInert = false
let previousAppAriaHidden = null

const formattedTotalExpense = computed(() => formatKRWCompact(Math.abs(props.totalExpense)))

const categoryFilters = computed(() => {
  const presentCategoryNames = new Set(
    props.transactions.map((transaction) => transaction.categoryName ?? '기타')
  )
  const knownCategories = SPENDING_CATEGORIES.filter((category) =>
    presentCategoryNames.has(category.name)
  ).map(({ name }) => ({ value: name, name }))
  const knownCategoryNames = new Set(knownCategories.map((category) => category.name))
  const additionalCategories = [...presentCategoryNames]
    .filter((categoryName) => !knownCategoryNames.has(categoryName))
    .map((categoryName) => ({ value: categoryName, name: categoryName }))

  return [{ value: 'ALL', name: '전체' }, ...knownCategories, ...additionalCategories]
})

const filteredTransactions = computed(() => {
  if (selectedCategory.value === 'ALL') {
    return props.transactions
  }

  return props.transactions.filter(
    (transaction) => (transaction.categoryName ?? '기타') === selectedCategory.value
  )
})

const selectedCategoryName = computed(
  () =>
    categoryFilters.value.find((category) => category.value === selectedCategory.value)?.name ?? ''
)

const footerText = computed(() => {
  if (selectedCategory.value !== 'ALL') {
    return `${selectedCategoryName.value} ${filteredTransactions.value.length}건을 보여드려요`
  }

  return `전체 ${props.totalCount}건 중 최근 ${props.transactions.length}건을 보여드려요`
})

const groupedTransactions = computed(() => {
  const groups = new Map()

  filteredTransactions.value.forEach((transaction) => {
    const date =
      typeof transaction.transactedAt === 'string'
        ? transaction.transactedAt.slice(0, 10) || 'UNKNOWN'
        : 'UNKNOWN'

    if (!groups.has(date)) {
      groups.set(date, [])
    }

    groups.get(date).push(transaction)
  })

  return [...groups.entries()].map(([date, transactions]) => ({ date, transactions }))
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      selectedCategory.value = 'ALL'
      previouslyFocusedElement = document.activeElement
      await nextTick()
      dialogRef.value?.focus()
      disableBackgroundInteraction()
      return
    }

    restoreBackgroundInteraction()
    previouslyFocusedElement?.focus?.()
  }
)

onBeforeUnmount(() => {
  restoreBackgroundInteraction()
})

function close() {
  emit('update:modelValue', false)
}

function disableBackgroundInteraction() {
  appRoot = document.getElementById('app')

  if (!appRoot) return

  appWasInert = appRoot.hasAttribute('inert')
  previousAppAriaHidden = appRoot.getAttribute('aria-hidden')
  appRoot.setAttribute('inert', '')
  appRoot.setAttribute('aria-hidden', 'true')
}

function restoreBackgroundInteraction() {
  if (!appRoot) return

  if (!appWasInert) {
    appRoot.removeAttribute('inert')
  }

  if (previousAppAriaHidden === null) {
    appRoot.removeAttribute('aria-hidden')
  } else {
    appRoot.setAttribute('aria-hidden', previousAppAriaHidden)
  }

  appRoot = null
}

function trapFocus(event) {
  const focusableElements = [
    ...(dialogRef.value?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []),
  ].filter((element) => element.getClientRects().length > 0)

  if (focusableElements.length === 0) {
    event.preventDefault()
    dialogRef.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

function categoryMeta(categoryName) {
  return (
    SPENDING_CATEGORIES.find((category) => category.name === categoryName) ?? DEFAULT_CATEGORY_META
  )
}

function formatAmount(amount) {
  return formatKRW(Math.abs(Number(amount)))
}

function formatTime(transactedAt) {
  return typeof transactedAt === 'string' ? transactedAt.slice(11, 16) || '--:--' : '--:--'
}

function formatDateLabel(date) {
  if (typeof date !== 'string' || date === 'UNKNOWN') return '날짜 정보 없음'

  const [year, month, day] = date.split('-').map(Number)
  const dayName = DAY_NAMES[new Date(year, month - 1, day).getDay()]

  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${dayName})`
}
</script>
