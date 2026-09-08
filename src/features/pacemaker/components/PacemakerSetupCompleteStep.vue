<!-- 페이스메이커 개설 완료 단계 -->
<template>
  <section
    class="flex min-h-[100dvh] flex-col items-center pb-[calc(24px+env(safe-area-inset-bottom))] text-center motion-safe:animate-fade-in-up sm:pb-[calc(32px+env(safe-area-inset-bottom))]"
    style="padding-top: max(2rem, calc(63dvh - 393px))"
    aria-labelledby="complete-title"
    aria-live="polite"
  >
    <div class="flex w-full flex-col items-center">
      <div
        class="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[#66b2ff] text-[44px] font-bold text-white shadow-[0_12px_40px_rgba(0,102,255,0.3)]"
        aria-hidden="true"
      >
        ✓
      </div>

      <h2 id="complete-title" class="mt-6 text-2xl font-bold tracking-tight text-[#0a192f]">
        개설 완료!
      </h2>
      <p class="mt-2 text-sm leading-6 text-slate-500">
        페이스메이커 전용 저금통이 개설됐어요.<br />
        다음 날 오전 8시부터 자동 저축이 시작돼요.
      </p>

      <dl
        class="mt-10 flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-[0_8px_30px_rgba(15,38,70,0.06)]"
      >
        <div class="flex items-center justify-between gap-4">
          <dt class="text-slate-500">하루 자동 저축 상한선</dt>
          <dd class="font-bold text-primary">{{ formattedMaxAmount }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="text-slate-500">시작일</dt>
          <dd class="font-bold text-[#0a192f]">{{ savingStartDate }} 오전 8시</dd>
        </div>
        <div v-if="account" class="flex items-center justify-between gap-4">
          <dt class="text-slate-500">연결 계좌</dt>
          <dd class="truncate font-bold text-[#0a192f]">
            {{ account.institutionName }} {{ account.maskedAccountNumber }}
          </dd>
        </div>
      </dl>
    </div>

    <button
      type="button"
      class="mt-auto min-h-12 w-full rounded-2xl bg-gradient-to-br from-primary to-[#66b2ff] px-5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(0,102,255,0.28)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.99]"
      @click="$emit('open-dashboard')"
    >
      저금통 대시보드 보기 →
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  maxAmount: {
    type: Number,
    required: true,
  },
  account: {
    type: Object,
    default: null,
  },
})

defineEmits(['open-dashboard'])

const formattedMaxAmount = computed(() => `${props.maxAmount.toLocaleString('ko-KR')}원`)
const savingStartDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(tomorrow)
    .replace(/\. /g, '.')
    .replace(/\.$/, '')
})
</script>
