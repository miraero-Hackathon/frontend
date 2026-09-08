<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    :close-on-backdrop="!isSubmitting"
    @update:model-value="closeFlow"
  >
    <section role="dialog" aria-modal="true" :aria-labelledby="titleId" class="overflow-hidden">
      <header
        class="flex items-center justify-between gap-3 border-b border-slate-100 px-6 pb-4 pt-6 sm:px-7"
      >
        <div class="flex min-w-0 items-center gap-2.5">
          <button
            v-if="canGoBack"
            type="button"
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8fbff] text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="이전 단계"
            :disabled="isSubmitting"
            @click="goBack"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-[15px]"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-400">{{ eyebrow }}</p>
            <h3 :id="titleId" class="truncate pt-0.5 text-base font-bold text-[#0a192f]">
              {{ title }}
            </h3>
          </div>
        </div>
        <button
          type="button"
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8fbff] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          aria-label="닫기"
          :disabled="isSubmitting"
          @click="closeFlow(false)"
        >
          <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
        </button>
      </header>

      <div v-if="step === 'strategy'" class="flex flex-col gap-2.5 px-6 py-5 sm:gap-3 sm:px-7">
        <div class="rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3.5">
          <p class="text-sm leading-relaxed text-slate-700 break-keep">
            현재 목표 페이스가
            <strong class="font-bold text-[#be185d]">{{ shortageLabel }} 부족해요.</strong>
          </p>
          <p class="mt-0.5 text-sm leading-relaxed text-slate-700 break-keep">지금 상황에 맞는 대응 방법을 골라보세요.</p>
        </div>

        <button
          v-for="option in strategyOptions"
          :key="option.id"
          type="button"
          class="group flex w-full items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 cursor-pointer sm:p-4"
          @click="selectStrategy(option.id)"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0a192f]"
          >
            <DashboardIcon :name="option.icon" class="size-[21px] text-primary" />
          </span>
          <span class="min-w-0 flex-1">
            <strong class="block text-sm font-bold text-[#0a192f]">
              {{ option.title }}
            </strong>
            <span class="mt-0.5 block whitespace-nowrap text-[11px] leading-relaxed tracking-tight text-slate-500 sm:text-xs">
              {{ option.description }}
            </span>
          </span>
          <span
            class="text-lg text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
            aria-hidden="true"
            >›</span
          >
        </button>
      </div>

      <div v-else-if="step === 'accounts'" class="px-6 py-5 sm:px-7">
        <div
          v-if="goalStore.areAccountsLoading"
          class="rounded-2xl border border-slate-200 px-4 py-8 text-center text-sm font-bold text-slate-400"
          role="status"
        >
          사용 가능한 계좌를 불러오는 중이에요.
        </div>

        <div
          v-else-if="goalStore.accountsError"
          class="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center"
          role="alert"
        >
          <p class="text-sm font-bold text-red-600">계좌를 불러오지 못했어요.</p>
          <button
            type="button"
            class="mt-3 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600"
            @click="loadAccounts"
          >
            다시 시도
          </button>
        </div>

        <div v-else-if="availableAccounts.length" class="flex flex-col gap-3">
          <button
            v-for="account in availableAccounts"
            :key="account.accountId"
            type="button"
            class="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 cursor-pointer"
            @click="selectAccount(account)"
          >
            <span class="min-w-0">
              <strong class="block truncate text-sm font-bold text-[#0a192f]">
                {{ account.accountName }}
              </strong>
              <span class="mt-0.5 block truncate text-xs text-slate-400">
                {{ account.institutionName }} {{ account.maskedAccountNumber }}
              </span>
            </span>
            <span class="shrink-0 text-right">
              <strong class="block text-sm font-bold tabular-nums text-[#0a192f]">
                {{ formatKRW(account.balance) }}
              </strong>
              <span class="text-xs font-bold text-slate-500 group-hover:text-[#0a192f]">선택 →</span>
            </span>
          </button>
        </div>

        <div v-else class="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
          <p class="text-sm font-bold text-[#0a192f]">끌어쓸 수 있는 입출금계좌가 없어요.</p>
          <p class="mt-1 text-xs text-slate-400">
            마이데이터에 다른 계좌를 연결한 뒤 다시 시도해 주세요.
          </p>
        </div>
      </div>

      <form
        v-else-if="step === 'amount'"
        class="px-6 py-5 sm:px-7"
        :aria-busy="isSubmitting"
        @submit.prevent="confirmPull"
      >
        <!-- 상단 계좌 정보 카드 (깨끗한 화이트 카드) -->
        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-3">
            <span
              class="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-lg"
              aria-hidden="true"
              >🏦</span
            >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-[#0a192f]">
                {{ selectedAccount.accountName }}
              </p>
              <p class="truncate text-xs text-slate-400">
                {{ selectedAccount.institutionName }} {{ selectedAccount.maskedAccountNumber }}
              </p>
            </div>
          </div>
          <div class="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
            <span class="text-xs text-slate-400">현재 잔액</span>
            <strong class="text-sm font-bold tabular-nums text-[#0a192f]">
              {{ formatKRW(selectedAccount.balance) }}
            </strong>
          </div>
        </div>

        <label for="pacemaker-pull-amount" class="mt-4 block text-xs font-bold text-[#0a192f]">
          채울 금액
        </label>
        <div class="relative mt-2">
          <!-- 금액 인풋 (깨끗한 화이트 배경) -->
          <input
            id="pacemaker-pull-amount"
            :value="formattedPullAmount"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="0"
            class="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-4 pr-10 text-right text-xl font-bold tracking-tight text-[#0a192f] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            aria-describedby="pacemaker-pull-help"
            :disabled="isPullLocked"
            @input="handlePullAmountInput"
          />
          <span
            class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-slate-400"
            >원</span
          >
        </div>

        <div class="mt-2.5 grid grid-cols-4 gap-2">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            class="flex items-center justify-center rounded-full border py-2 text-xs transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            :class="
              pullAmount === amount
                ? 'border-primary bg-[#ebf3ff] font-bold text-primary shadow-sm'
                : 'border-slate-200 bg-white font-bold text-slate-700 shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:border-slate-300 hover:bg-slate-50'
            "
            :disabled="isPullLocked"
            @click="setPullAmount(amount)"
          >
            {{ formatKRWCompact(amount) }}
          </button>
        </div>

        <p
          v-if="isPullOutcomeUnknown"
          id="pacemaker-pull-help"
          class="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold leading-relaxed text-amber-800"
          role="alert"
        >
          이체 결과를 확인하지 못했어요. 이미 처리됐을 수도 있어서 다시 보내지 않았어요. 목표 자산을
          확인한 뒤 필요하면 다시 시도해 주세요.
        </p>
        <p
          v-else-if="pullFormError"
          id="pacemaker-pull-help"
          class="mt-4 rounded-xl border border-pink-200 bg-pink-50 px-3 py-2.5 text-xs font-bold leading-relaxed text-[#be185d]"
          role="alert"
        >
          {{ pullFormError }}
        </p>
        <p
          v-else-if="pullAmount > selectedAccount.balance"
          id="pacemaker-pull-help"
          class="mt-4 rounded-xl border border-pink-200 bg-pink-50 px-3 py-2.5 text-xs font-bold leading-relaxed text-[#be185d]"
          role="alert"
        >
          계좌 잔액보다 큰 금액이에요. {{ formatKRW(selectedAccount.balance) }} 이하로 입력해
          주세요.
        </p>
        <p v-else id="pacemaker-pull-help" class="mt-4 text-xs leading-relaxed text-slate-400">
          선택한 금액만큼 이번 달 부족분을 채우는 계획에 반영돼요.
        </p>

        <div class="mt-5 flex gap-3">
          <!-- 결과를 모를 때는 재전송 대신 실제 상태를 확인하러 보낸다. -->
          <button
            v-if="isPullOutcomeUnknown"
            type="button"
            class="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,102,255,0.28)] transition hover:bg-blue-700"
            @click="closeFlow(false)"
          >
            목표 자산 확인하기
          </button>
          <template v-else>
            <button
              type="button"
              class="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-200"
              :disabled="isSubmitting"
              @click="goBack"
            >
              이전
            </button>
            <button
              type="submit"
              class="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,102,255,0.28)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:shadow-none"
              :disabled="!isPullAmountValid || isSubmitting"
            >
              {{
                isSubmitting
                  ? '끌어오는 중…'
                  : isPullAmountValid
                    ? `${formatKRW(pullAmount)} 끌어쓰기`
                    : '금액을 입력해 주세요'
              }}
            </button>
          </template>
        </div>
      </form>

      <form
        v-else-if="step === 'goal'"
        class="px-6 py-5 sm:px-7"
        :aria-busy="isSubmitting"
        @submit.prevent="saveGoalAdjustment"
      >
        <label for="pacemaker-goal-amount" class="block text-xs font-bold text-[#0a192f]"
          >목표 금액</label
        >
        <div class="relative mt-2">
          <input
            id="pacemaker-goal-amount"
            :value="formattedGoalAmount"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            :disabled="isSubmitting"
            class="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-4 pr-10 text-right text-base font-bold text-[#0a192f] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            @input="handleGoalAmountInput"
          />
          <span
            class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-slate-400"
            >원</span
          >
        </div>

        <label for="pacemaker-goal-month" class="mt-4 block text-xs font-bold text-[#0a192f]"
          >목표 월</label
        >
        <input
          id="pacemaker-goal-month"
          v-model="goalMonth"
          type="month"
          :min="minimumGoalMonth"
          :disabled="isSubmitting"
          class="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-[#0a192f] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        <div class="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p class="text-xs leading-relaxed text-slate-600">
            목표일은 선택한 월의 마지막 날로 저장되고, 월별 페이스를 다시 계산해요.
          </p>
        </div>

        <p v-if="goalFormError" class="mt-3 text-xs font-bold text-red-600" role="alert">
          {{ goalFormError }}
        </p>

        <div class="mt-5 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
            :disabled="isSubmitting"
            @click="goBack"
          >
            이전
          </button>
          <button
            type="submit"
            class="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,102,255,0.28)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:shadow-none"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '반영하는 중…' : '저장 · 로드맵 반영' }}
          </button>
        </div>
      </form>

      <div v-else class="flex flex-col items-center px-6 py-8 text-center sm:px-7">
        <div
          class="flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl"
          aria-hidden="true"
        >
          <AppIcon :name="successState.icon" size="xl" />
        </div>
        <h4 class="mt-4 text-lg font-bold text-[#0a192f]">{{ successState.title }}</h4>
        <p class="mt-2 text-sm leading-relaxed text-slate-500">{{ successState.description }}</p>
        <div class="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="text-slate-500">{{ successState.detailLabel }}</span>
            <strong class="text-right font-bold text-[#0a192f]">{{
              successState.detailValue
            }}</strong>
          </div>
        </div>
        <button
          type="button"
          class="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,102,255,0.28)] transition hover:bg-blue-700"
          @click="closeFlow(false)"
        >
          확인
        </button>
      </div>
    </section>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalStore } from '@/features/goal/store/goal.store'
import {
  calculateGoalMonths,
  clampGoalMonth,
  formatGoalMonth,
  getMinimumGoalMonth,
  normalizeGoalMonth,
} from '@/features/goal/lib/goal-months'
import BaseModal from '@/shared/ui/BaseModal.vue'
import AppIcon from '@/shared/ui/AppIcon.vue'
import DashboardIcon from '@/pages/dashboard/components/DashboardIcon.vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { formatKRW, formatKRWCompact } from '@/shared/lib/money'
import { deriveGoalPaceMetrics } from '@/features/roadmap/constants/pace-state.constants'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  goal: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue', 'goal-adjusted'])

const router = useRouter()
const goalStore = useGoalStore()
const titleId = 'pacemaker-assist-flow-title'
const step = ref('strategy')
const selectedAccount = ref(null)
const pullAmount = ref(0)
const goalAmount = ref(0)
const goalMonth = ref('')
const minimumGoalMonth = ref('')
const pullFormError = ref('')
// 이체 성공/실패를 확인하지 못한 상태. 재전송이 이중 이체가 될 수 있어 폼을 잠근다.
const isPullOutcomeUnknown = ref(false)
const goalFormError = ref('')
const isSubmitting = ref(false)
const shouldRefreshGoal = ref(false)
const successState = ref({
  icon: '✓',
  title: '',
  description: '',
  detailLabel: '',
  detailValue: '',
})

const strategyOptions = Object.freeze([
  {
    id: 'spending',
    icon: 'scissors',
    title: '지출 줄이기',
    description: '이번 달 소비를 확인하고 조절해요',
  },
  {
    id: 'pull',
    icon: 'coin',
    title: '끌어쓰기',
    description: '여유 통장에서 부족한 금액을 채워요',
  },
  {
    id: 'goal',
    icon: 'calendar-edit',
    title: '목표 조정하기',
    description: '목표 금액이나 기간을 조정해요',
  },
])

const quickAmounts = Object.freeze([50000, 100000, 200000, 300000])
const availableAccounts = computed(() =>
  goalStore.accounts.filter(
    (account) => account.accountType === 'CHECKING' && Number(account.balance) > 0
  )
)
// 이 화면은 BEHIND일 때만 열리므로, 메인 카드와 같은 월평균 페이스 차이(누적 금액 아님)로 부족분을 안내한다
const shortageLabel = computed(
  () => `월 ${formatKRWCompact(Math.abs(deriveGoalPaceMetrics(props.goal).paceDifference))}`
)
const formattedPullAmount = computed(() =>
  pullAmount.value ? pullAmount.value.toLocaleString('ko-KR') : ''
)
const formattedGoalAmount = computed(() =>
  goalAmount.value ? goalAmount.value.toLocaleString('ko-KR') : ''
)
const isPullAmountValid = computed(
  () => pullAmount.value > 0 && pullAmount.value <= Number(selectedAccount.value?.balance ?? 0)
)
const isPullLocked = computed(() => isSubmitting.value || isPullOutcomeUnknown.value)
// 결과를 모르는 동안은 계좌·금액을 바꿔 재시도하는 경로를 막고 상태 확인만 남긴다.
const canGoBack = computed(
  () => !['strategy', 'success'].includes(step.value) && !isPullOutcomeUnknown.value
)

const eyebrow = computed(() => {
  if (step.value === 'accounts' || step.value === 'amount') return '끌어쓰기'
  if (step.value === 'goal') return '로드맵 반영'
  if (step.value === 'success') return '대응 전략 적용'
  return '대응 방법 선택'
})

const title = computed(() => {
  if (step.value === 'accounts') return '어떤 통장에서 채울까요?'
  if (step.value === 'amount') return '얼마를 채울까요?'
  if (step.value === 'goal') return '목표 조정하기'
  if (step.value === 'success') return '준비가 끝났어요'
  return '어떻게 할까요?'
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) resetFlow()
  }
)

function resetFlow() {
  step.value = 'strategy'
  selectedAccount.value = null
  pullAmount.value = 0
  goalAmount.value = Number(props.goal?.goalAmount ?? 0)
  minimumGoalMonth.value = getMinimumGoalMonth()
  goalMonth.value = clampGoalMonth(props.goal?.period?.endDate, minimumGoalMonth.value)
  pullFormError.value = ''
  isPullOutcomeUnknown.value = false
  goalFormError.value = ''
  isSubmitting.value = false
  shouldRefreshGoal.value = false
}

function closeFlow(value) {
  if (isSubmitting.value) return
  const isOpen = value === true
  emit('update:modelValue', isOpen)
  if (!isOpen && shouldRefreshGoal.value) {
    shouldRefreshGoal.value = false
    emit('goal-adjusted')
  }
}

async function selectStrategy(strategy) {
  if (strategy === 'spending') {
    emit('update:modelValue', false)
    await router.push({ name: ROUTE_NAMES.SPENDING })
    return
  }

  if (strategy === 'pull') {
    step.value = 'accounts'
    await loadAccounts()
    return
  }

  step.value = 'goal'
}

async function loadAccounts() {
  await goalStore.fetchAccounts('CHECKING', { excludeGoalLinked: true }).catch(() => undefined)
}

function selectAccount(account) {
  selectedAccount.value = account
  pullAmount.value = 0
  pullFormError.value = ''
  step.value = 'amount'
}

function handlePullAmountInput(event) {
  const digitsOnly = event.target.value.replace(/[^0-9]/g, '')
  pullAmount.value = digitsOnly ? Number(digitsOnly) : 0
  pullFormError.value = ''
}

function setPullAmount(amount) {
  if (isPullLocked.value) return
  pullAmount.value = amount
  pullFormError.value = ''
}

function handleGoalAmountInput(event) {
  const digitsOnly = event.target.value.replace(/[^0-9]/g, '')
  goalAmount.value = digitsOnly ? Number(digitsOnly) : 0
}

async function confirmPull() {
  if (!isPullAmountValid.value || isPullLocked.value) return

  pullFormError.value = ''
  isSubmitting.value = true
  try {
    const result = await goalStore.pullGoalFunds(props.goal.goalId, {
      sourceAccountId: selectedAccount.value.accountId,
      amount: pullAmount.value,
    })

    successState.value = {
      icon: '💸',
      title: '부족분을 채웠어요',
      description: `${selectedAccount.value.accountName}에서 목표 자산으로 자금을 옮겼어요.`,
      detailLabel: '끌어온 금액',
      detailValue: formatKRW(result.pulledAmount),
    }
    shouldRefreshGoal.value = true
    step.value = 'success'
  } catch (error) {
    // status 0은 응답을 못 받은 경우(네트워크 끊김·타임아웃), 5xx는 서버가 처리 중 실패한 경우다.
    // 둘 다 이체가 이미 커밋됐을 수 있어 재전송을 막는다.
    // 4xx와 본문으로 거절된 경우(status 없는 Error)는 서버가 처리하지 않은 것이라 재시도해도 안전하다.
    const status = error?.status
    if (status === 0 || status >= 500) {
      isPullOutcomeUnknown.value = true
      shouldRefreshGoal.value = true
      return
    }

    pullFormError.value = error?.message ?? '자금을 끌어오지 못했어요. 잠시 후 다시 시도해 주세요.'
    return
  } finally {
    isSubmitting.value = false
  }

  // 이체 후 잔액은 다른 화면과 공유하는 스토어 상태라 갱신해두되,
  // 성공 화면을 곧바로 닫을 수 있어야 하므로 isSubmitting을 푼 뒤에 재조회한다.
  await goalStore.fetchAccounts('CHECKING', { excludeGoalLinked: true }).catch(() => undefined)
}

async function saveGoalAdjustment() {
  goalFormError.value = ''
  const goalMonths = calculateGoalMonths(goalMonth.value)

  if (!Number.isFinite(goalAmount.value) || goalAmount.value < 10000) {
    goalFormError.value = '목표 금액을 10,000원 이상으로 입력해 주세요.'
    return
  }
  if (goalAmount.value < Number(props.goal?.currentAmount ?? 0)) {
    goalFormError.value = '목표 금액은 현재 모인 금액보다 작게 설정할 수 없어요.'
    return
  }
  if (!normalizeGoalMonth(goalMonth.value) || goalMonths <= 0) {
    goalFormError.value = '목표 월은 다음 달 이후로 선택해 주세요.'
    return
  }

  isSubmitting.value = true
  try {
    await goalStore.updateGoal(props.goal.goalId, {
      // 목표명은 이 화면에서 수정하지 않지만 빠뜨리면 NULL로 덮이므로 현재 값을 함께 보낸다.
      goalName: props.goal.goalName,
      goalAmount: goalAmount.value,
      goalMonths,
    })

    successState.value = {
      icon: '📅',
      title: '새 계획을 로드맵에 반영했어요',
      description: '변경한 목표를 기준으로 앞으로의 페이스를 이어가요.',
      detailLabel: '새 목표',
      detailValue: `${formatKRW(goalAmount.value)} · ${formatGoalMonth(goalMonth.value)}`,
    }
    shouldRefreshGoal.value = true
    step.value = 'success'
  } catch (error) {
    goalFormError.value = error?.message ?? '목표를 수정하지 못했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  pullFormError.value = ''
  goalFormError.value = ''
  if (step.value === 'amount') {
    step.value = 'accounts'
    return
  }
  step.value = 'strategy'
}
</script>
