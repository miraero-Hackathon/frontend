<!-- 페이스메이커 잔액/자동저축/입금 가능 계좌 모달 (개설됨 상태에서 CTA 클릭 시) -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex items-center justify-between border-b border-slate-100 px-7 pb-[17px] pt-6">
      <div>
        <p class="text-xs font-bold text-slate-400">페이스메이커 전용 저금통</p>
        <h3 class="pt-0.5 text-base font-bold text-[#0a192f]">지금까지 모인 여유자금</h3>
      </div>
      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-full bg-[#f8fbff]"
        aria-label="닫기"
        @click="$emit('update:modelValue', false)"
      >
        <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
      </button>
    </div>

    <div class="flex flex-col gap-4 px-7 py-5">
      <div
        class="relative overflow-hidden rounded-2xl px-5 py-4 shadow-[0_8px_24px_rgba(0,102,255,0.22)]"
        style="
          background-image: linear-gradient(163deg, rgb(0, 102, 255) 0%, rgb(102, 178, 255) 100%);
        "
      >
        <span class="absolute -right-6 -top-7 size-24 rounded-full bg-white/10" />
        <p class="relative text-xs font-bold text-white/80">페이스메이커 저금통 잔액</p>
        <p class="relative pt-1 text-[28px] font-bold tracking-tight text-white">
          {{ formatNumber(pacemaker.moneyBoxBalance) }}<span class="text-base"> 원</span>
        </p>
        <div class="relative flex items-center gap-2 pt-2 text-xs text-white/70">
          <span>오늘 +{{ formatNumber(pacemaker.todaySavingAmount) }}원</span>
          <span class="inline-flex items-center gap-1">
            <svg
              class="size-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 22C16.4183 22 20 18.4183 20 14C20 10.5 17.5 7.5 15 4C15 7 13.5 8 12.5 9C11.5 6 9 3 9 2C5.5 6.5 4 10 4 14C4 18.4183 7.58172 22 12 22Z"
                fill="#FF6B00"
              />
              <path
                d="M12 20C14.2091 20 16 18.2091 16 16C16 13.8 14.5 12 13 10.5C12.5 12 11.5 12.5 11 13C10.5 11.5 9 10 9 9.5C7.5 11.5 7 13.5 7 16C7 18.2091 8.79086 20 12 20Z"
                fill="#FFD233"
              />
            </svg>
            <span>연속 {{ pacemaker.currentStreak }}일</span>
          </span>
        </div>
      </div>

      <div
        class="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#f4f8ff] px-4 py-3"
      >
        <div>
          <p class="text-sm font-bold text-[#0a192f]">자동 저축</p>
          <p class="text-xs text-slate-500">
            하루 상한선 {{ formatNumber(pacemaker.maxAmount) }}원
          </p>
        </div>
        <button
          type="button"
          class="relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :class="pacemaker.enabled ? 'bg-primary' : 'bg-slate-300'"
          :disabled="isToggling"
          :aria-pressed="pacemaker.enabled"
          :aria-label="pacemaker.enabled ? '자동 저축 끄기' : '자동 저축 켜기'"
          @click="$emit('toggle-auto-saving')"
        >
          <span
            class="absolute top-0.5 size-[18px] rounded-full bg-white transition-all"
            :class="pacemaker.enabled ? 'left-[23px]' : 'left-0.5'"
          />
        </button>
      </div>
      <p
        v-if="toggleErrorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600"
        role="alert"
      >
        {{ toggleErrorMessage }} 다시 시도해 주세요.
      </p>

      <div>
        <p class="pb-2 text-xs font-bold text-slate-500">연동된 목표 자산 · 입금 가능</p>
        <div class="flex flex-col gap-2">
          <div
            v-if="depositTargetsError"
            class="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center"
            role="alert"
          >
            <p class="text-xs font-bold text-red-600">입금 대상을 불러오지 못했어요.</p>
            <button
              type="button"
              class="mt-3 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isDepositTargetsLoading"
              @click="$emit('retry-deposit-targets')"
            >
              {{ isDepositTargetsLoading ? '불러오는 중...' : '다시 시도' }}
            </button>
          </div>
          <p
            v-else-if="isDepositTargetsLoading"
            class="rounded-2xl border border-slate-200 px-4 py-5 text-center text-xs text-slate-400"
            role="status"
          >
            입금 대상을 불러오는 중이에요.
          </p>
          <div
            v-for="goal in depositTargetsError || isDepositTargetsLoading ? [] : depositTargets"
            :key="goal.goalId"
            class="flex items-center justify-between rounded-2xl border border-[#edf2ff] bg-[#f8fbff] px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex size-8 items-center justify-center rounded-lg bg-[#F2F4F6] text-primary"
              >
                <GoalTypeIcon :goal-type="goal.goalType" size="sm" />
              </span>
              <div>
                <p class="text-xs font-bold text-[#0a192f]">{{ goal.goalName }}</p>
                <p v-if="goal.depositAssets?.[0]" class="text-xs text-slate-400">
                  {{
                    goal.depositAssets[0].assetType === 'MONEY_BOX'
                      ? '저금통'
                      : (goal.depositAssets[0].financialInstitutionName ?? '연결 계좌')
                  }}
                  {{ goal.depositAssets[0].maskedAccountNumber ?? '' }}
                </p>
                <p v-else class="text-xs text-slate-400">연결된 입금 자산 없음</p>
              </div>
            </div>
            <button
              type="button"
              class="rounded-full px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!goal.depositAssets?.length"
              style="
                background-image: linear-gradient(
                  149deg,
                  rgb(0, 102, 255) 0%,
                  rgb(102, 178, 255) 100%
                );
              "
              @click="$emit('deposit', goal)"
            >
              입금
            </button>
          </div>
          <p
            v-if="!depositTargetsError && !isDepositTargetsLoading && depositTargets.length === 0"
            class="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400"
          >
            연결된 입금 자산이 없어요.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="rounded-2xl border border-primary/20 bg-primary/[0.06] py-3 text-sm font-bold text-primary"
        @click="$emit('view-history')"
      >
        최근 자동 저축 내역 보기
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/shared/ui/BaseModal.vue'
import GoalTypeIcon from '@/shared/ui/GoalTypeIcon.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  pacemaker: {
    type: Object,
    required: true,
  },
  depositTargets: {
    type: Array,
    default: () => [],
  },
  isDepositTargetsLoading: {
    type: Boolean,
    default: false,
  },
  depositTargetsError: {
    type: Object,
    default: null,
  },
  isToggling: {
    type: Boolean,
    default: false,
  },
  toggleErrorMessage: {
    type: String,
    default: '',
  },
})
defineEmits([
  'update:modelValue',
  'toggle-auto-saving',
  'deposit',
  'view-history',
  'retry-deposit-targets',
])

function formatNumber(amount) {
  return (amount ?? 0).toLocaleString()
}
</script>
