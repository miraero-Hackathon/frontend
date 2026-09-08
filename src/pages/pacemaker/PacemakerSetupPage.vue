<!-- 페이스메이커 개설 페이지: 모바일 중심의 2단계 설정 플로우 -->
<template>
  <div class="h-full bg-[#f8fbff]">
    <div class="mx-auto flex h-full w-full max-w-[520px] flex-col bg-[#f8fbff]">
      <template v-if="currentStep !== 'complete'">
        <header
          class="shrink-0 border-b border-slate-200/70 bg-[#f8fbff] px-5 pb-3 pt-[calc(12px+env(safe-area-inset-top))] sm:px-8"
        >
          <div class="flex h-10 items-center justify-between gap-3">
            <button
              type="button"
              class="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-xl text-[#0a192f] transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubmitting"
              aria-label="이전 단계로 이동"
              @click="goBack"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-5"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1
              class="min-w-0 flex-1 truncate text-center text-base font-bold tracking-tight text-[#0a192f]"
            >
              페이스메이커 설정
            </h1>
            <span class="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-slate-500"
              >{{ currentStepNumber }} / {{ totalSteps }}</span
            >
          </div>
          <div
            class="mt-3 grid gap-1.5"
            :class="isEditMode ? 'grid-cols-1' : 'grid-cols-2'"
            aria-label="설정 진행 단계"
          >
            <span class="h-1 rounded-full bg-primary" />
            <span
              v-if="!isEditMode"
              class="h-1 rounded-full transition-colors"
              :class="currentStep === 'account' ? 'bg-primary' : 'bg-[#dce8f7]'"
            />
          </div>
        </header>

        <main class="min-h-0 flex-1 overflow-y-auto">
          <PacemakerLimitStep
            v-if="currentStep === 'limit'"
            v-model="maxAmount"
            :is-submitting="isSubmitting"
            :error-message="submitError"
            :is-edit-mode="isEditMode"
            @next="handleLimitNext"
          />
          <PacemakerAccountStep
            v-else
            v-model:selected-account-id="selectedAccountId"
            :is-submitting="isSubmitting"
            :error-message="submitError"
            @complete="completeSetup"
          />
        </main>
      </template>

      <div v-else class="min-h-0 flex-1 overflow-y-auto px-4 sm:px-8">
        <PacemakerSetupCompleteStep
          :max-amount="maxAmount"
          :account="selectedAccount"
          @open-dashboard="goToDashboard"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  PacemakerAccountStep,
  PacemakerLimitStep,
  PacemakerSetupCompleteStep,
  usePacemakerStore,
} from '@/features/pacemaker'
import { useGoalStore } from '@/features/goal/store/goal.store'
import { ROUTE_NAMES } from '@/shared/constants/routes'

const route = useRoute()
const router = useRouter()
const pacemakerStore = usePacemakerStore()
const goalStore = useGoalStore()
const { accounts } = storeToRefs(goalStore)
const isEditMode = computed(() => route.query.mode === 'max-amount')
const currentStep = ref('limit')
const currentStepNumber = computed(() => (currentStep.value === 'account' ? 2 : 1))
const totalSteps = computed(() => (isEditMode.value ? 1 : 2))
const maxAmount = ref(10000)
const selectedAccountId = ref(null)
const selectedAccount = computed(() =>
  accounts.value.find((account) => account.accountId === selectedAccountId.value)
)
const isSubmitting = ref(false)
const submitError = ref('')

onMounted(async () => {
  if (!isEditMode.value) return
  isSubmitting.value = true
  submitError.value = ''
  try {
    const status = pacemakerStore.pacemakerStatus ?? (await pacemakerStore.fetchPacemakerStatus())
    if (!status.registered) {
      goToIntro()
      return
    }
    if (!pacemakerStore.pacemakerDashboard) await pacemakerStore.fetchPacemakerDashboard()
    maxAmount.value = pacemakerStore.pacemakerDashboard.maxAmount
  } catch (error) {
    submitError.value = error?.message ?? '현재 상한액을 불러오지 못했어요.'
  } finally {
    isSubmitting.value = false
  }
})

function validateMaxAmount() {
  if (
    !Number.isInteger(maxAmount.value) ||
    maxAmount.value < 1000 ||
    maxAmount.value > 50000 ||
    maxAmount.value % 1000 !== 0
  ) {
    submitError.value = '1,000원 이상 50,000원 이하의 금액을 1,000원 단위로 설정해 주세요.'
    return false
  }
  return true
}

function handleLimitNext() {
  if (isSubmitting.value || !validateMaxAmount()) return
  submitError.value = ''
  if (isEditMode.value) {
    completeSetup()
    return
  }
  currentStep.value = 'account'
}

function goToIntro() {
  router.push({ name: ROUTE_NAMES.PACEMAKER })
}

function goBack() {
  if (currentStep.value === 'account') {
    submitError.value = ''
    currentStep.value = 'limit'
    return
  }
  if (isEditMode.value) {
    goToDashboard()
    return
  }
  goToIntro()
}

async function completeSetup() {
  if (isSubmitting.value || !validateMaxAmount()) return
  if (!isEditMode.value && !selectedAccountId.value) {
    submitError.value = '연동할 입출금계좌를 선택해 주세요.'
    return
  }
  isSubmitting.value = true
  submitError.value = ''
  try {
    if (isEditMode.value) {
      await pacemakerStore.updateMaxAmount(maxAmount.value)
      goToDashboard()
      return
    }
    const { alreadyRegistered } = await pacemakerStore.setupPacemaker(
      maxAmount.value,
      selectedAccountId.value
    )
    if (alreadyRegistered) {
      goToDashboard()
      return
    }
    currentStep.value = 'complete'
  } catch (error) {
    submitError.value =
      error?.message ?? '페이스메이커 개설에 실패했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSubmitting.value = false
  }
}

function goToDashboard() {
  router.push({ name: ROUTE_NAMES.PACEMAKER })
}
</script>
