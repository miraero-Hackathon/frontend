<!-- "이 목표에 묶인 자금" 모달: 연동된 저금통·계좌·대출 카드 클릭 시 자산별 상세 내역을 보여줌 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex items-center justify-between border-b border-slate-100 px-7 pb-4 pt-6">
      <h3 class="text-base font-bold text-[#0a192f]">이 목표에 묶인 자금</h3>
      <button
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8fbff]"
        aria-label="닫기"
        @click="$emit('update:modelValue', false)"
      >
        <img src="@/assets/icons/modal-close.svg" alt="" class="size-[15px]" />
      </button>
    </div>

    <div class="flex flex-col gap-3 px-7 py-5">
      <div
        v-for="row in rows"
        :key="row.assetId"
        class="flex flex-col gap-3 rounded-2xl border p-4"
        :class="row.highlighted ? 'border-[#c5dcff] bg-[#f4f8ff]' : 'border-slate-200 bg-slate-50'"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-[10px]"
              :class="row.highlighted ? 'bg-[#eaf2ff]' : 'bg-slate-100'"
            >
              <DashboardIcon
                :name="row.assetType === 'MONEY_BOX' ? 'piggy-bank' : row.isLoan ? 'loan' : 'bank'"
                class="size-[18px]"
                :class="
                  row.assetType === 'MONEY_BOX'
                    ? 'text-[#3182f6]'
                    : row.isLoan
                      ? 'text-[#D86F79]'
                      : 'text-[#7c5ce7]'
                "
              />
            </div>
            <div>
              <p class="text-sm font-bold text-[#0a192f]">{{ row.assetName }}</p>
              <p class="pt-0.5 text-xs text-slate-400">
                {{ row.bankName }} {{ row.accountNumberMasked }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p v-if="row.balance != null" class="text-sm font-bold text-[#0a192f]">
              {{ formatKRWCompact(row.balance) }}
            </p>
            <p
              v-if="row.autoTransfer?.amount != null"
              class="pt-0.5 text-xs font-bold"
              :class="row.isLoan ? 'text-rose-500' : 'text-primary'"
            >
              월 {{ formatKRW(row.autoTransfer.amount) }}
            </p>
          </div>
        </div>

        <p class="text-xs text-slate-500">{{ row.caption }}</p>

        <div
          v-if="row.assetDetail && row.countdown"
          class="flex flex-col gap-1.5 border-t border-[#dbeafe] pt-2"
        >
          <p class="text-xs text-slate-400">
            만료일 {{ formatDate(row.assetDetail.maturityDate) }}
          </p>
          <div class="flex items-center justify-between pt-0.5">
            <span
              class="rounded-full px-2 py-0.5 text-xs font-bold"
              :class="row.isLoan ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'"
            >
              연 {{ row.assetDetail.interestRate }}%
            </span>
            <span
              class="flex items-center gap-1.5 rounded-full border border-[#c5dcff] bg-[#eaf2ff] px-2.5 py-1"
            >
              <DashboardIcon name="clock" class="size-3 text-primary" />
              <span class="text-xs font-bold text-primary">
                만료까지 {{ row.countdown.months }}개월 ({{ row.countdown.days }}일)
              </span>
            </span>
          </div>
        </div>
      </div>

      <div v-if="rows.length === 0" class="py-8 text-center text-xs text-slate-400">
        연동된 자산 정보가 없습니다.
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-slate-100 bg-[#f8fbff] px-7 py-4">
      <div>
        <p class="text-xs text-slate-500">합계 잔액</p>
        <p class="pt-0.5 text-sm font-bold text-[#0a192f]">{{ formatKRWCompact(totalBalance) }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-slate-500">월 자동이체 합계</p>
        <p class="pt-0.5 text-sm font-bold text-primary">{{ formatKRW(totalAutoTransfer) }}</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import DashboardIcon from '@/pages/dashboard/components/DashboardIcon.vue'
import { formatKRW, formatKRWCompact } from '@/shared/lib/money'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  assets: {
    type: Array,
    default: () => [],
    // [{ assetType, assetId, assetName, bankName, accountNumberMasked, balance,
    //    assetDetail: { interestRate, maturityDate } | null,
    //    autoTransfer: { amount, transferDay, withdrawalAccount } }]
  },
})
defineEmits(['update:modelValue'])

const CAPTION_BY_TYPE = {
  MONEY_BOX: '자동 저축 저금통 · 수시 입출금 가능',
  LOAN: '대출 상환 · 매달 자동이체',
}

const rows = computed(() =>
  (props.assets ?? []).map((asset) => {
    const hasDetail = !!asset.assetDetail
    const isLoan = asset.assetType === 'LOAN'
    // 이자율·만기 정보가 있는 목표적금류만 강조(하이라이트) 카드로 표시. 대출은 부채라 강조하지 않음.
    const highlighted = hasDetail && !isLoan

    return {
      ...asset,
      isLoan,
      highlighted,
      caption: CAPTION_BY_TYPE[asset.assetType] ?? '목표적금 · 만기 시 자동 해지',
      countdown: asset.assetDetail?.maturityDate
        ? computeMaturityCountdown(asset.assetDetail.maturityDate)
        : null,
    }
  })
)

const totalBalance = computed(() =>
  (props.assets ?? []).reduce((sum, asset) => sum + (asset.balance ?? 0), 0)
)
const totalAutoTransfer = computed(() =>
  (props.assets ?? []).reduce((sum, asset) => sum + (asset.autoTransfer?.amount ?? 0), 0)
)

// 남은 개월수·일수: API가 만기일만 주고 가입일은 안 주기 때문에, Figma의 '가입일~만료일 진행바'는
// 재현할 데이터가 없어 뺐다. 만기일 기준 카운트다운만 오늘 날짜로 계산한다.
function computeMaturityCountdown(maturityDate) {
  if (!maturityDate) return { months: 0, days: 0 }
  const today = new Date()
  const target = new Date(maturityDate)
  if (Number.isNaN(target.getTime())) return { months: 0, days: 0 }
  const days = Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)))
  const months = Math.max(
    0,
    (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth())
  )
  return { months, days }
}

function formatDate(yyyyMMdd) {
  if (!yyyyMMdd) return ''
  return String(yyyyMMdd).replace(/-/g, '.')
}
</script>
