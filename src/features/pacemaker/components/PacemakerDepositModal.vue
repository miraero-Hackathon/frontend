<!-- 페이스메이커 저금통 → 목표 연결 자산(계좌·저금통) 직접 입금 모달 -->
<template>
  <BaseModal :model-value="modelValue" hide-default-close @update:model-value="handleClose">
    <div class="flex items-center justify-between border-b border-slate-100 px-7 pb-[17px] pt-6">
      <div>
        <p class="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
          <GoalTypeIcon :goal-type="target?.goalType" size="sm" /> {{ target?.goalName }} 목표
        </p>
        <h3 class="pt-0.5 text-base font-bold text-[#0a192f]">연결 자산에 입금하기</h3>
      </div>
      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-full bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="닫기"
        :disabled="isSubmitting"
        @click="handleClose(false)"
      >
        <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
      </button>
    </div>

    <div class="flex flex-col gap-5 px-7 py-5" :aria-busy="isSubmitting">
      <div
        class="flex items-center justify-between rounded-2xl border border-primary/20 bg-[#eaf2ff] px-4 py-3"
      >
        <p class="text-sm font-bold text-[#0a192f]">사용 가능한 여유자금</p>
        <p class="text-base font-bold text-primary">{{ formatWon(availableBalance) }}</p>
      </div>

      <div
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-200"
      >
        <button
          id="deposit-asset-trigger"
          type="button"
          class="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting || !(target?.depositOptions?.length > 0)"
          :aria-expanded="isAccountListOpen"
          aria-controls="deposit-asset-listbox"
          aria-haspopup="listbox"
          @click="toggleAccountList"
          @keydown.enter.prevent="toggleAccountList"
          @keydown.space.prevent="toggleAccountList"
          @keydown.down.prevent="handleAccountTriggerArrow(1)"
          @keydown.up.prevent="handleAccountTriggerArrow(-1)"
          @keydown.esc.stop.prevent="closeAccountList"
        >
          <span class="min-w-0">
            <span class="block text-xs text-slate-400">입금할 자산</span>
            <span class="block truncate pt-0.5 text-sm font-bold text-[#0a192f]">
              {{ selectedOption?.icon }} {{ selectedOption?.accountNickname }}
            </span>
            <span class="block truncate text-xs text-slate-500">
              {{ selectedOption?.accountNumberMasked }}
            </span>
          </span>
          <span class="flex shrink-0 items-center gap-2.5">
            <span
              v-if="selectedOption?.accountBalance != null"
              class="text-sm font-bold text-[#0a192f]"
            >
              {{ formatWon(selectedOption.accountBalance) }}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4 text-slate-400 transition-transform duration-200"
              :class="isAccountListOpen ? 'rotate-180' : ''"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>

        <Transition name="deposit-asset-accordion">
          <div
            v-if="isAccountListOpen"
            id="deposit-asset-listbox"
            class="deposit-asset-accordion-panel"
            role="listbox"
            aria-label="입금할 연결 자산 선택"
          >
            <div class="min-h-0">
              <div class="border-t border-slate-200/80">
                <button
                  v-for="(option, optionIndex) in target?.depositOptions ?? []"
                  :id="accountOptionId(optionIndex)"
                  :key="`${option.assetType}-${option.assetId}`"
                  type="button"
                  role="option"
                  class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60"
                  :class="[
                    optionIndex > 0 ? 'border-t border-slate-200/70' : '',
                    isSameOption(option, selectedOption)
                      ? 'bg-primary/[0.06] focus-visible:bg-primary/[0.08]'
                      : 'bg-white hover:bg-slate-50 active:bg-slate-100 focus-visible:bg-slate-50',
                    'focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15',
                  ]"
                  :aria-selected="isSameOption(option, selectedOption)"
                  :tabindex="focusedOptionIndex === optionIndex ? 0 : -1"
                  :disabled="isSubmitting"
                  @click="selectOption(option)"
                  @focus="focusedOptionIndex = optionIndex"
                  @keydown.down.prevent="moveAccountFocus(optionIndex, 1)"
                  @keydown.up.prevent="moveAccountFocus(optionIndex, -1)"
                  @keydown.home.prevent="focusAccountOption(0)"
                  @keydown.end.prevent="
                    focusAccountOption((target?.depositOptions?.length ?? 1) - 1)
                  "
                  @keydown.enter.prevent="selectOption(option)"
                  @keydown.space.prevent="selectOption(option)"
                  @keydown.esc.stop.prevent="closeAccountList(true)"
                >
                  <span class="flex min-w-0 items-center gap-2">
                    <span
                      class="flex size-4 shrink-0 items-center justify-center text-primary"
                      aria-hidden="true"
                    >
                      <svg
                        v-if="isSameOption(option, selectedOption)"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="size-3.5"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </span>
                    <span class="min-w-0">
                      <span class="block truncate text-sm font-bold text-[#0a192f]">
                        {{ option.icon }} {{ option.accountNickname }}
                      </span>
                      <span class="block truncate text-xs text-slate-400">
                        {{ option.accountNumberMasked }}
                      </span>
                    </span>
                  </span>
                  <span class="shrink-0 text-sm font-bold tabular-nums text-[#0a192f]">
                    {{ formatWon(option.accountBalance) }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div>
        <p class="pb-2 text-xs font-bold text-slate-500">입금 금액</p>
        <input
          v-model="amountInput"
          type="text"
          inputmode="numeric"
          class="w-full rounded-2xl border bg-white px-5 py-4 text-right text-xl font-bold text-[#0a192f] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          :class="isOverLimit ? 'border-[#fbcfe8]' : 'border-slate-300'"
          :disabled="isSubmitting"
          @input="handleAmountInput"
        />

        <div class="flex gap-2 pt-2.5">
          <button
            v-for="chip in QUICK_ADD_CHIPS"
            :key="chip.label"
            type="button"
            class="flex-1 rounded-full border border-primary/20 bg-primary/[0.06] py-2 text-xs font-bold text-primary"
            :disabled="isSubmitting"
            @click="applyQuickAdd(chip)"
          >
            {{ chip.label }}
          </button>
        </div>

        <div
          v-if="isOverLimit"
          class="mt-2.5 flex items-start gap-2 rounded-[10px] border border-[#fbcfe8] bg-[#fff0f9] px-3.5 py-2.5"
        >
          <img src="@/assets/icons/deposit-warning.svg" alt="" class="mt-px size-3" />
          <p class="text-xs text-[#be185d]">
            여유자금({{ formatWon(availableBalance) }})을 초과하는 금액입니다.
          </p>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        role="alert"
      >
        <p class="text-xs font-bold text-red-600">입금하지 못했어요.</p>
        <p class="mt-1 text-xs leading-5 text-red-500">
          {{ errorMessage }} 입금하기 버튼을 눌러 다시 시도해 주세요.
        </p>
      </div>

      <button
        type="button"
        class="rounded-2xl py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
        :class="
          canSubmit ? 'shadow-[0_6px_10px_rgba(0,102,255,0.28)]' : 'bg-slate-200 !text-slate-400'
        "
        :style="
          canSubmit
            ? 'background-image: linear-gradient(173deg, rgb(0, 102, 255) 0%, rgb(102, 178, 255) 100%)'
            : ''
        "
        :disabled="!canSubmit || isSubmitting"
        @click="handleSubmit"
      >
        {{ submitButtonLabel }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import GoalTypeIcon from '@/shared/ui/GoalTypeIcon.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  target: {
    type: Object,
    default: null, // { goalId, goalName, assetId, assetType, icon, accountNickname, bankName, accountNumberMasked, accountBalance }
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue', 'deposit'])

const QUICK_ADD_CHIPS = [
  { label: '+5만', amount: 50000 },
  { label: '+10만', amount: 100000 },
  { label: '+20만', amount: 200000 },
  { label: '전액', full: true },
]

const amountInput = ref('0')
const isAccountListOpen = ref(false)
const selectedOption = ref(null)
const focusedOptionIndex = ref(-1)

const amount = computed(() => Number(amountInput.value) || 0)
const isOverLimit = computed(() => amount.value > props.availableBalance)
const canSubmit = computed(
  () => amount.value > 0 && !isOverLimit.value && selectedOption.value !== null
)
const submitButtonLabel = computed(() => {
  if (props.isSubmitting) return '입금 중...'
  if (!canSubmit.value) return '금액을 입력해주세요'
  return `${formatWon(amount.value)} ${props.errorMessage ? '다시 입금하기' : '입금하기'}`
})

// 모달이 새로 열릴 때마다 입력값 초기화
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      amountInput.value = '0'
      selectedOption.value =
        props.target?.depositOptions?.find((option) => isSameOption(option, props.target)) ??
        props.target?.depositOptions?.[0] ??
        null
      isAccountListOpen.value = false
      focusedOptionIndex.value = -1
    }
  }
)

function isSameOption(a, b) {
  return a != null && b != null && a.assetId === b.assetId && a.assetType === b.assetType
}

function accountOptionId(optionIndex) {
  return `deposit-asset-option-${optionIndex}`
}

function selectedOptionIndex() {
  const selectedIndex = props.target?.depositOptions?.findIndex((option) =>
    isSameOption(option, selectedOption.value)
  )
  return Math.max(0, selectedIndex ?? 0)
}

async function focusAccountOption(optionIndex) {
  const optionCount = props.target?.depositOptions?.length ?? 0
  if (optionCount === 0) return

  const nextIndex = Math.min(Math.max(optionIndex, 0), optionCount - 1)
  focusedOptionIndex.value = nextIndex
  await nextTick()
  document.getElementById(accountOptionId(nextIndex))?.focus()
}

async function openAccountList() {
  if (!(props.target?.depositOptions?.length > 0) || props.isSubmitting) return
  isAccountListOpen.value = true
  await focusAccountOption(selectedOptionIndex())
}

function toggleAccountList() {
  if (isAccountListOpen.value) {
    closeAccountList()
    return
  }
  openAccountList()
}

function handleAccountTriggerArrow(direction) {
  if (!isAccountListOpen.value) {
    openAccountList()
    return
  }
  moveAccountFocus(focusedOptionIndex.value, direction)
}

function moveAccountFocus(currentIndex, direction) {
  const optionCount = props.target?.depositOptions?.length ?? 0
  if (optionCount === 0) return
  const nextIndex = (currentIndex + direction + optionCount) % optionCount
  focusAccountOption(nextIndex)
}

async function closeAccountList(returnFocus = false) {
  if (!isAccountListOpen.value) return
  isAccountListOpen.value = false
  focusedOptionIndex.value = -1
  if (!returnFocus) return

  await nextTick()
  document.getElementById('deposit-asset-trigger')?.focus()
}

function selectOption(option) {
  selectedOption.value = option
  closeAccountList(true)
}

function handleAmountInput(event) {
  amountInput.value = event.target.value.replace(/[^0-9]/g, '')
}

function applyQuickAdd(chip) {
  amountInput.value = String(chip.full ? props.availableBalance : amount.value + chip.amount)
}

function handleClose(value) {
  if (props.isSubmitting) return
  emit('update:modelValue', value)
}

function handleSubmit() {
  if (!canSubmit.value || !selectedOption.value || props.isSubmitting) return
  emit('deposit', {
    assetId: selectedOption.value.assetId,
    assetType: selectedOption.value.assetType,
    amount: amount.value,
    moneyBoxId: selectedOption.value.moneyBoxId,
    option: selectedOption.value,
  })
}

function formatWon(value) {
  return `${value.toLocaleString()}원`
}
</script>

<style scoped>
.deposit-asset-accordion-panel {
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
}

.deposit-asset-accordion-enter-active,
.deposit-asset-accordion-leave-active {
  transition:
    grid-template-rows 180ms ease,
    opacity 160ms ease;
}

.deposit-asset-accordion-enter-from,
.deposit-asset-accordion-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .deposit-asset-accordion-enter-active,
  .deposit-asset-accordion-leave-active {
    transition: none;
  }
}
</style>
