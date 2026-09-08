<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#071426]/45 p-4 backdrop-blur-[2px] sm:p-6"
        @mousedown.self="$emit('close')"
      >
        <section
          ref="modalRef"
          class="flex max-h-[calc(100vh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(10,25,47,0.24)] sm:max-h-[calc(100vh-3rem)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
          aria-describedby="product-detail-description"
          tabindex="-1"
        >
          <header
            class="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7"
          >
            <div>
              <h2 id="product-detail-title" class="text-xs font-bold text-primary">
                {{ modalTitle }}
              </h2>
              <p id="product-detail-description" class="mt-0.5 text-[11px] font-medium text-slate-400">
                가입 전 공시 정보를 확인해 주세요
              </p>
            </div>
            <button
              type="button"
              class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500 transition hover:bg-slate-200 cursor-pointer"
              aria-label="상품 상세 닫기"
              @click="$emit('close')"
            >
              ✕
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto">
            <LoadingSpinner
              v-if="isLoading"
              message="상품 정보를 불러오고 있어요"
              container-class="min-h-[420px]"
            />

            <div
              v-else-if="hasError"
              class="flex min-h-[420px] flex-col items-center justify-center px-8 text-center"
              role="alert"
            >
              <div
                class="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-500"
              >
                !
              </div>
              <p class="mt-4 text-sm font-bold text-[#10233f]">상세 정보를 불러오지 못했어요</p>
              <button
                type="button"
                class="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white"
                @click="$emit('retry')"
              >
                다시 시도
              </button>
            </div>

            <div v-else-if="product" class="px-5 py-6 sm:px-7">
              <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {{ product.institutionName }}
              </span>
              <h3 class="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-[#0a192f]">
                {{ product.productName }}
              </h3>
              <p class="mt-1 text-xs text-slate-400">{{ product.productCode }}</p>

              <div
                class="mt-5 rounded-2xl border border-primary/15 bg-gradient-to-br from-[#F4F8FF] to-[#EAF2FF] px-6 py-5 shadow-[0_6px_18px_rgba(15,35,70,0.08)]"
              >
                <div class="flex items-end justify-between gap-4">
                  <div>
                    <p class="text-xs font-bold text-[#64748B]">최고 금리</p>
                    <p class="mt-1 text-sm font-bold text-primary">
                      연
                      <strong class="ml-1 text-3xl sm:text-4xl font-bold tabular-nums">
                        {{ formatRate(product.maximumInterestRate) }}
                      </strong>
                      %
                    </p>
                  </div>
                  <p class="pb-1 text-xs font-bold text-[#64748B]">
                    기본 연 {{ formatRate(product.minimumBaseInterestRate) }}~{{
                      formatRate(product.maximumBaseInterestRate)
                    }}%
                  </p>
                </div>
              </div>

              <section class="mt-7">
                <h3 class="text-base font-bold text-[#0a192f]">가입 정보</h3>
                <dl class="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-[#f8fbff] px-4">
                  <div
                    v-for="item in joinInfo"
                    :key="item.label"
                    class="grid grid-cols-[88px_1fr] gap-3 py-3.5"
                  >
                    <dt class="text-xs font-bold text-slate-400">{{ item.label }}</dt>
                    <dd class="text-xs sm:text-sm font-bold leading-relaxed text-slate-700">
                      {{ item.value }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="mt-7">
                <div class="flex items-end justify-between">
                  <h3 class="text-base font-bold text-[#0a192f]">기간별 금리</h3>
                  <p class="text-[11px] font-medium text-slate-400">단위: 연 %</p>
                </div>
                <div class="mt-3 overflow-hidden rounded-2xl border border-slate-200/80">
                  <div
                    class="grid bg-[#f8fbff] px-4 py-3 text-xs font-bold text-slate-500"
                    :class="productType === 'saving' ? 'grid-cols-4' : 'grid-cols-3'"
                  >
                    <span>기간</span>
                    <span v-if="productType === 'saving'">적립 방식</span>
                    <span class="text-right">기본</span>
                    <span class="text-right">최고</span>
                  </div>
                  <div
                    v-for="option in product.options ?? []"
                    :key="option.depositOptionId ?? option.savingOptionId"
                    class="grid border-t border-slate-100 px-4 py-3.5 text-sm"
                    :class="productType === 'saving' ? 'grid-cols-4' : 'grid-cols-3'"
                  >
                    <span class="font-bold text-slate-700">{{ option.saveTerm }}개월</span>
                    <span v-if="productType === 'saving'" class="text-xs text-slate-500">
                      {{ option.reserveTypeName }}
                    </span>
                    <span class="text-right text-slate-500">
                      {{ formatRate(option.baseInterestRate) }}
                    </span>
                    <span class="text-right font-bold text-primary">
                      {{ formatRate(option.maxInterestRate) }}
                    </span>
                  </div>
                </div>
              </section>

              <section class="mt-7 space-y-3">
                <h3 class="text-base font-bold text-[#0a192f]">꼭 확인해요</h3>
                <div
                  v-for="item in conditions"
                  :key="item.label"
                  class="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4 shadow-xs"
                >
                  <p class="text-[11px] font-bold text-slate-400">{{ item.label }}</p>
                  <p class="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-700">
                    {{ item.value }}
                  </p>
                </div>
              </section>
            </div>
          </div>

          <footer
            v-if="product && !isLoading"
            class="border-t border-slate-100 bg-white p-4 sm:px-7"
          >
            <p class="mb-3 text-center text-[11px] leading-relaxed text-slate-400">
              {{ officialProductLink.description }}. 새 탭에서 열립니다.
            </p>
            <div class="grid gap-2.5 sm:grid-cols-[0.65fr_1.35fr]">
              <button
                type="button"
                class="flex h-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                @click="$emit('close')"
              >
                닫기
              </button>
              <a
                :href="officialProductLink.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex h-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                {{ officialProductLink.label }}
                <span class="ml-1.5 text-base" aria-hidden="true">↗</span>
              </a>
            </div>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import { formatProductLimit, formatRate } from '@/features/products/lib/product-formatters'
import { getOfficialProductLink } from '@/features/products/lib/product-links'

const props = defineProps({
  open: { type: Boolean, default: false },
  product: { type: Object, default: null },
  productType: { type: String, required: true },
  isLoading: { type: Boolean, default: false },
  hasError: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'retry'])
const modalRef = ref(null)
let previouslyFocusedElement = null

const modalTitle = computed(() =>
  props.product?.productName
    ? `${props.product.productName} 상세`
    : `${props.productType === 'deposit' ? '정기예금' : '적금'} 상품 상세`
)

const limitLabel = computed(() => formatProductLimit(props.product?.maxLimit, props.productType))

const joinInfo = computed(() => [
  { label: '가입 대상', value: props.product?.joinTarget ?? '-' },
  { label: '가입 방법', value: props.product?.joinMethod ?? '-' },
  { label: '가입 제한', value: props.product?.joinRestrictionName ?? '상품별 확인' },
  { label: '가입 한도', value: limitLabel.value },
])

const conditions = computed(() => [
  { label: '우대 조건', value: props.product?.specialCondition ?? '상품별 확인' },
  { label: '만기 후 이율', value: props.product?.maturityInterest ?? '상품별 확인' },
  { label: '유의 사항', value: props.product?.notice ?? '상품별 확인' },
])

const officialProductLink = computed(() => getOfficialProductLink(props.product))

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function trapFocus(event) {
  const focusableElements = [...(modalRef.value?.querySelectorAll(focusableSelector) ?? [])]
  if (focusableElements.length === 0) {
    event.preventDefault()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)
  const activeElement = document.activeElement

  if (
    event.shiftKey &&
    (activeElement === firstElement || !focusableElements.includes(activeElement))
  ) {
    event.preventDefault()
    lastElement.focus()
  } else if (
    !event.shiftKey &&
    (activeElement === lastElement || !focusableElements.includes(activeElement))
  ) {
    event.preventDefault()
    firstElement.focus()
  }
}

function handleKeydown(event) {
  if (!props.open) return

  if (event.key === 'Escape') {
    emit('close')
  } else if (event.key === 'Tab') {
    trapFocus(event)
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    if (isOpen) {
      previouslyFocusedElement = document.activeElement
      await nextTick()
      modalRef.value?.focus()
    } else {
      previouslyFocusedElement?.focus?.()
      previouslyFocusedElement = null
    }
  }
)

window.addEventListener('keydown', handleKeydown)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>
