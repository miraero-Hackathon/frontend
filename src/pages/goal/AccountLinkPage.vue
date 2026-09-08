<!-- 계좌·저금통 연결 페이지 (GOAL-04) -->
<template>
  <HeroBackground class="font-['Noto_Sans_KR',sans-serif]">
    <StepHeader @back="handleBack" />

    <div
      class="relative z-10 mx-auto w-full max-w-[660px] animate-fade-in-up px-4 pt-3 sm:pt-6 pb-40 md:pb-8"
    >
      <ProgressBar :current-step="4" :total-steps="4" />

      <h1
        class="mt-4 sm:mt-6 text-2xl font-black tracking-tight leading-snug text-gray-900 sm:text-[28px] break-keep"
      >
        이 목표, 어디에<br class="sm:hidden" /> 모을까요?
      </h1>
      <p class="mt-2 sm:mt-2.5 break-keep text-[13px] sm:text-sm font-medium text-slate-500">
        목표 전용 공간을 정해야 진행률을 정확하게 추적할 수 있어요.
      </p>

      <LoadingSpinner v-if="areAccountsLoading" message="연결 가능한 계좌를 불러오고 있어요" />

      <div
        v-else-if="accountsError"
        class="mt-6 sm:mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-[18px] border border-gray-200 bg-white px-6 text-center"
      >
        <div class="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-500">
          !
        </div>
        <p class="mt-3 text-[15px] font-black text-gray-900">계좌 정보를 불러오지 못했어요</p>
        <p class="mt-1 text-[13px] text-gray-400">잠시 후 다시 시도해 주세요.</p>
        <button
          type="button"
          class="mt-4 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-white"
          @click="loadAccounts"
        >
          다시 시도
        </button>
      </div>

      <template v-else>
        <div class="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          <AccountOptionCard
            title="저금통 만들기"
            description="매달 자동으로 모으는 목표 전용 저금통이에요."
            recommended
            :selected="mode === 'moneybox'"
            @select="mode = 'moneybox'"
          >
            <template #icon>
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4122 4.58203C16.0376 4.58203 14.8462 5.86505 14.6629 6.41491C11.4553 5.04025 4.58203 6.13998 4.58203 10.9971C4.58203 12.6467 4.58203 13.7464 6.41491 15.1211V18.3287H10.0807V16.4958H12.83V18.3287H16.4958V14.6629C17.4122 14.2047 18.0537 13.7464 18.3287 12.83H20.1615V9.16424H18.3287C18.3287 8.2478 17.8704 7.78958 17.4122 7.33136V4.58203Z"
                  stroke="#94A3B8"
                  stroke-width="1.83288"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M1.83203 8.24805V9.16449C1.83203 10.1726 2.65683 10.9974 3.66491 10.9974H4.58136"
                  stroke="#94A3B8"
                  stroke-width="1.83288"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.6641 10.0811H14.6741"
                  stroke="#94A3B8"
                  stroke-width="1.83288"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>

            <div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label for="transfer-amount" class="text-[13px] font-medium text-gray-500">
                    월 이체 금액
                  </label>
                  <div
                    class="mt-1.5 flex items-center rounded-xl border border-gray-200 px-4 py-2.5"
                  >
                    <input
                      id="transfer-amount"
                      type="text"
                      inputmode="numeric"
                      :value="formattedTransferAmount"
                      class="w-full bg-transparent text-base font-bold text-gray-900 outline-none"
                      @input="handleTransferAmountInput"
                    />
                    <span class="shrink-0 text-sm text-gray-400">원</span>
                  </div>
                  <p class="mt-1 text-[13px] text-primary">실현 가능성 분석값을 반영했어요.</p>
                </div>

                <div>
                  <span class="text-[13px] font-medium text-gray-500">이체 날짜</span>
                  <div class="mt-1.5 grid grid-cols-5 gap-1.5">
                    <button
                      v-for="day in TRANSFER_DAYS"
                      :key="day"
                      type="button"
                      class="min-h-10 rounded-xl border px-1 text-[13px] font-medium transition-colors"
                      :class="
                        transferDay === day
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      "
                      @click="transferDay = day"
                    >
                      {{ day }}일
                    </button>
                  </div>
                  <p class="mt-1 text-[13px] text-gray-400">급여일 다음 날을 추천해요.</p>
                </div>
              </div>

              <div class="mt-4 border-t border-gray-100 pt-4">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-[13px] font-medium text-gray-500">출금 계좌</span>
                  <span class="text-[13px] text-gray-400">급여 계좌를 선택해 주세요.</span>
                </div>
                <div class="mt-1.5 space-y-2">
                  <AccountListItem
                    v-for="account in checkingAccounts"
                    :key="account.accountId"
                    :label="`${account.accountName} ${account.maskedAccountNumber}`"
                    :sublabel="
                      account.accountId === checkingAccounts[0]?.accountId ? '급여 계좌' : ''
                    "
                    :selected="selectedAccountId === account.accountId"
                    @select="selectedAccountId = account.accountId"
                  />
                </div>
              </div>
            </div>
          </AccountOptionCard>

          <AccountOptionCard
            title="기존 저축 계좌 연결"
            description="이미 모으고 있는 계좌가 있다면 연결해 보세요."
            :selected="mode === 'account'"
            @select="mode = 'account'"
          >
            <template #icon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </template>

            <div>
              <span class="text-[13px] font-medium text-gray-500">마이데이터 계좌 목록</span>
              <div class="mt-1.5 space-y-2">
                <AccountListItem
                  v-for="account in savingAccounts"
                  :key="account.accountId"
                  :label="`${account.accountName} ${account.maskedAccountNumber}`"
                  :sublabel="`잔액 ${formatKRWCompact(account.balance)} · 연 ${account.interestRate}%`"
                  multiple
                  :selected="selectedExistingAccountIds.includes(account.accountId)"
                  @select="toggleExistingAccount(account.accountId)"
                />
              </div>
            </div>
          </AccountOptionCard>
        </div>

        <p class="mt-4 flex items-start gap-1.5 text-[13px] leading-relaxed text-gray-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mt-0.5 h-3.5 w-3.5 shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
          </svg>
          <span>한 계좌는 하나의 목표에만 연결할 수 있어요.</span>
        </p>
      </template>
    </div>

    <p
      v-if="submitError"
      class="mx-auto w-full max-w-[650px] px-4 text-center text-[13px] text-red-500"
    >
      {{ submitError }}
    </p>
    <BottomCTA
      v-if="!areAccountsLoading && !accountsError"
      :label="ctaLabel"
      :disabled="ctaDisabled"
      desktop-static
      @click="handleSubmit"
    />

    <BaseModal v-model="isAssetConflictModalOpen" hide-default-close>
      <div class="px-5 pb-6 pt-7 text-center sm:px-6">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-xl font-bold text-amber-500"
        >
          !
        </div>
        <h2
          class="mt-4 whitespace-nowrap text-base font-bold tracking-tight text-gray-900 sm:text-lg"
        >
          이미 다른 목표에 연결된 자산이에요
        </h2>
        <p class="mt-2 break-keep text-[13px] leading-relaxed text-gray-500 sm:text-sm">
          이 자산은 다른 목표에서 사용 중이에요.<br />다른 자산을 선택해 주세요.
        </p>
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white"
          @click="handleAssetConflictClose"
        >
          다른 자산 선택하기
        </button>
      </div>
    </BaseModal>

    <BaseModal v-model="isSalaryAccountModalOpen" hide-default-close>
      <div class="px-5 pb-6 pt-7 text-center sm:px-6">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-xl font-bold text-amber-500"
        >
          !
        </div>
        <h2
          class="mt-4 whitespace-nowrap text-base font-bold tracking-tight text-gray-900 sm:text-lg"
        >
          급여계좌를 선택해 주세요
        </h2>
        <p class="mt-2 break-keep text-[13px] leading-relaxed text-gray-500 sm:text-sm">
          저금통 자동이체는 급여가 입금되는<br class="sm:hidden" />
          계좌에서만 설정할 수 있어요.
        </p>
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white"
          @click="handleSalaryAccountErrorClose"
        >
          급여계좌 선택하기
        </button>
      </div>
    </BaseModal>
  </HeroBackground>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import HeroBackground from '@/shared/ui/HeroBackground.vue'
import StepHeader from '@/shared/ui/StepHeader.vue'
import ProgressBar from '@/shared/ui/ProgressBar.vue'
import BottomCTA from '@/shared/ui/BottomCTA.vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import AccountOptionCard from '@/shared/ui/AccountOptionCard.vue'
import AccountListItem from '@/shared/ui/AccountListItem.vue'
import { useGoalStore } from '@/features/goal'
import { GOAL_PRESETS } from '@/features/goal/constants/goal.constants.js'
import { GOAL_API_TYPE_BY_PRESET_ID } from '@/features/goal/constants/goalApiType.js'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { formatKoreanNumber, formatKRWCompact } from '@/shared/lib/money'

const TRANSFER_DAYS = [5, 10, 15, 20, 25]

const router = useRouter()
const goalStore = useGoalStore()
const {
  selectedGoalPresetId,
  goalParams,
  feasibility,
  accounts,
  areAccountsLoading,
  accountsError,
} = storeToRefs(goalStore)

const selectedGoal = computed(() =>
  GOAL_PRESETS.find((preset) => preset.id === selectedGoalPresetId.value)
)

const mode = ref('moneybox')
const transferAmount = ref(0)
const transferDay = ref(10)

const formattedTransferAmount = computed(() => formatKoreanNumber(transferAmount.value))

function handleTransferAmountInput(event) {
  const digitsOnly = event.target.value.replace(/[^0-9]/g, '')
  transferAmount.value = digitsOnly ? Number(digitsOnly) : 0
}
const selectedAccountId = ref(null)
const selectedExistingAccountIds = ref([])

const checkingAccounts = computed(() =>
  accounts.value.filter((account) => account.accountType === 'CHECKING')
)
const savingAccounts = computed(() =>
  accounts.value.filter((account) => account.accountType !== 'CHECKING')
)
function toggleExistingAccount(accountId) {
  selectedExistingAccountIds.value = selectedExistingAccountIds.value.includes(accountId)
    ? selectedExistingAccountIds.value.filter((id) => id !== accountId)
    : [...selectedExistingAccountIds.value, accountId]
}

async function loadAccounts() {
  try {
    const { accounts: fetchedAccounts } = await goalStore.fetchAccounts()
    selectedAccountId.value =
      fetchedAccounts.find((account) => account.accountType === 'CHECKING')?.accountId ?? null
    const firstSavingAccountId = fetchedAccounts.find(
      (account) => account.accountType !== 'CHECKING'
    )?.accountId
    selectedExistingAccountIds.value = firstSavingAccountId ? [firstSavingAccountId] : []
  } catch {
    // accountsError는 store에서 세팅됨. 화면은 아래 재시도 블록으로 안내.
  }
}

onMounted(async () => {
  if (!hasValidGoalDraft()) {
    await router.replace({ name: ROUTE_NAMES.GOAL_SELECT })
    return
  }

  const defaultTransfer =
    feasibility.value?.requiredMonthly || goalParams.value?.loanResult?.monthlyPayment || 525866
  transferAmount.value = defaultTransfer

  await loadAccounts()
})

const isSubmitting = ref(false)
const submitError = ref('')
const isAssetConflictModalOpen = ref(false)
const isSalaryAccountModalOpen = ref(false)

const ctaLabel = computed(() => {
  if (isSubmitting.value) return '만드는 중...'
  return mode.value === 'moneybox' ? '저금통 만들고 시작하기' : '연결하고 시작하기'
})
const ctaDisabled = computed(() => {
  if (isSubmitting.value) return true
  return mode.value === 'moneybox'
    ? !selectedAccountId.value || !transferAmount.value || transferAmount.value <= 0
    : selectedExistingAccountIds.value.length === 0
})

function handleBack() {
  router.push({ name: ROUTE_NAMES.GOAL_FEASIBILITY })
}

function hasValidGoalDraft() {
  const goalType = GOAL_API_TYPE_BY_PRESET_ID[selectedGoalPresetId.value]
  return Boolean(
    goalType &&
    Number.isFinite(goalParams.value?.amount) &&
    goalParams.value.amount > 0 &&
    Number.isInteger(goalParams.value?.months) &&
    goalParams.value.months > 0 &&
    Number.isFinite(goalParams.value?.startAmount) &&
    goalParams.value.startAmount >= 0
  )
}

async function handleAssetConflictClose() {
  isAssetConflictModalOpen.value = false
  selectedAccountId.value = null
  selectedExistingAccountIds.value = []
  try {
    await goalStore.fetchAccounts()
  } catch {
    /* 기존 재시도 UI 사용 */
  }
}

function handleSalaryAccountErrorClose() {
  isSalaryAccountModalOpen.value = false
  selectedAccountId.value = null
}

async function handleSubmit() {
  if (!hasValidGoalDraft()) {
    await router.replace({ name: ROUTE_NAMES.GOAL_SELECT })
    return
  }
  isSubmitting.value = true
  submitError.value = ''
  try {
    const result = await goalStore.submitGoalCreation({
      goalName: selectedGoal.value?.title,
      goalType: GOAL_API_TYPE_BY_PRESET_ID[selectedGoalPresetId.value],
      goalAmount: goalParams.value.amount,
      goalMonths: goalParams.value.months,
      startAmount: goalParams.value.startAmount,
      moneyBox:
        mode.value === 'moneybox'
          ? {
              type: 'GOAL',
              amount: transferAmount.value,
              transferDay: transferDay.value,
              accountId: selectedAccountId.value,
            }
          : null,
      existingAccountIds: mode.value === 'account' ? selectedExistingAccountIds.value : [],
    })

    if (result && result.goalId) {
      router.push({ name: ROUTE_NAMES.DASHBOARD_GOAL, params: { goalId: result.goalId } })
    } else {
      router.push({ name: ROUTE_NAMES.DASHBOARD })
    }
  } catch (error) {
    console.error('Failed to submit goal creation:', error)
    const errorStatus = error?.status ?? error?.response?.status ?? error?.cause?.response?.status
    const errorCode =
      error?.code ?? error?.response?.data?.error?.code ?? error?.cause?.response?.data?.error?.code
    if (
      errorStatus === 400 &&
      (errorCode === 'MONEY_BOX_003' || error?.message?.includes('급여'))
    ) {
      isSalaryAccountModalOpen.value = true
      return
    }
    if (errorStatus === 409) {
      isAssetConflictModalOpen.value = true
      return
    }
    submitError.value = '목표 생성에 실패했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
