<!-- 페이스메이커 STEP 2: 연동할 주 입출금계좌 선택 -->
<template>
  <section class="flex min-h-full flex-col" aria-labelledby="account-title">
    <div class="flex-1 px-5 pb-6 pt-7 sm:px-8 sm:pt-10">
      <h2
        id="account-title"
        class="text-[28px] font-bold leading-[1.28] tracking-[-0.025em] text-[#0a192f]"
      >
        어느 계좌와<br />연결할까요?
      </h2>
      <p class="mt-3 text-sm leading-6 text-slate-500">페이스메이커와 연결할 계좌를 선택해주세요</p>

      <div class="mt-7">
        <p
          v-if="isAccountsLoading"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-400"
          role="status"
        >
          계좌 정보를 불러오는 중이에요...
        </p>
        <div
          v-else-if="accountsError"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-7 text-center"
        >
          <p class="text-sm font-semibold text-slate-500">계좌 정보를 불러오지 못했어요.</p>
          <button
            type="button"
            class="mt-3 text-sm font-bold text-primary underline underline-offset-2"
            @click="loadAccounts"
          >
            다시 시도
          </button>
        </div>
        <p
          v-else-if="checkingAccounts.length === 0"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-400"
        >
          연동 가능한 입출금계좌가 없어요.
        </p>
        <ul v-else class="flex flex-col gap-2.5" aria-label="연동 가능한 입출금계좌">
          <li v-for="account in checkingAccounts" :key="account.accountId">
            <button
              type="button"
              class="flex w-full items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="
                selectedAccountId === account.accountId
                  ? 'border-primary bg-[#f0f6ff]'
                  : 'border-[#e2e8f0] bg-white hover:border-[#b8cbe5] hover:bg-[#fbfdff]'
              "
              :aria-pressed="selectedAccountId === account.accountId"
              :disabled="isSubmitting"
              @click="selectAccount(account.accountId)"
            >
              <span
                class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#e8f2ff] text-primary"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="size-[18px]"
                >
                  <path d="m4 9 8-5 8 5M5 10h14M7 10v7M12 10v7M17 10v7M4 20h16" />
                </svg>
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex min-w-0 items-center gap-2 text-[11px] leading-4 text-slate-400">
                  <span class="shrink-0 font-medium">{{ account.institutionName }}</span>
                  <span class="truncate text-slate-300">{{ account.maskedAccountNumber }}</span>
                </span>
                <span class="block truncate text-[15px] font-semibold leading-5 text-[#0a192f]">{{
                  account.accountName
                }}</span>
                <span
                  class="mt-1 block text-lg font-bold leading-6 tracking-[-0.015em] text-[#0a192f]"
                  >{{ formatNumber(account.balance) }}원</span
                >
              </span>
            </button>
          </li>
        </ul>
      </div>

      <p class="mt-5 text-center text-xs font-semibold text-slate-500">급여통장을 선택해주세요</p>
      <p
        v-if="errorMessage"
        class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-600"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>

    <div
      class="sticky bottom-0 border-t border-slate-200/70 bg-[#f8fbff]/95 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-8"
    >
      <button
        type="button"
        class="min-h-[52px] w-full rounded-2xl bg-primary px-5 text-base font-bold text-white transition hover:bg-[#005ce6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        :disabled="isSubmitting || !selectedAccountId"
        @click="$emit('complete')"
      >
        {{
          isSubmitting
            ? '개설 중...'
            : selectedAccountId
              ? '페이스메이커 개설하기'
              : '계좌를 선택해 주세요'
        }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGoalStore } from '@/features/goal/store/goal.store'

defineProps({
  selectedAccountId: { type: Number, default: null },
  isSubmitting: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})
const emit = defineEmits(['update:selectedAccountId', 'complete'])
const goalStore = useGoalStore()
const { accounts, areAccountsLoading: isAccountsLoading, accountsError } = storeToRefs(goalStore)
const checkingAccounts = computed(() =>
  accounts.value.filter((account) => account.accountType === 'CHECKING')
)

async function loadAccounts() {
  try {
    await goalStore.fetchAccounts('CHECKING')
  } catch {
    /* store 상태로 오류를 표시한다. */
  }
}
function selectAccount(accountId) {
  emit('update:selectedAccountId', accountId)
}
function formatNumber(amount) {
  return Number(amount ?? 0).toLocaleString('ko-KR')
}
onMounted(loadAccounts)
</script>
