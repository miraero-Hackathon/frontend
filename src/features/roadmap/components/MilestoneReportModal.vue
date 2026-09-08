<!-- 스플릿 기록에서 선택한 마일스톤의 AI 리포트를 보여주는 모달 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <article v-if="milestone" class="overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white">
      <!-- 헤더 (토스 스타일 슬림 1단 레이아웃) -->
      <header
        class="border-b border-blue-100 bg-[linear-gradient(145deg,#f7faff_0%,#eef5ff_100%)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-[0_1px_0_rgba(0,0,0,0.05)]"
            >
              SPLIT {{ milestone.order || Math.round(milestone.percentage / 20) || 1 }}
            </span>
            <span
              class="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              :class="milestoneStatus.className"
            >
              {{ milestoneStatus.label }}
            </span>
          </div>
          <button
            type="button"
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-[0_1px_0_rgba(0,0,0,0.05)] transition hover:bg-white hover:text-slate-700 active:scale-95 cursor-pointer"
            aria-label="닫기"
            @click="$emit('update:modelValue', false)"
          >
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h2 class="mt-3 text-lg sm:text-xl font-bold tracking-tight text-[#0a192f]">
          {{ reportTitle }}
        </h2>
      </header>

      <div class="px-5 pb-6 pt-5 sm:px-6">
        <!-- 핵심 지표 3단 그리드 -->
        <dl
          class="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 px-2 py-3.5 text-center"
        >
          <div class="px-2">
            <dt class="text-[11px] font-bold text-slate-400">목표 금액</dt>
            <dd class="mt-1 text-xs font-bold text-[#0a192f]">{{ formattedAmount }}</dd>
          </div>
          <div class="px-2">
            <dt class="text-[11px] font-bold text-slate-400">목표 지점</dt>
            <dd class="mt-1 text-xs font-bold text-primary">{{ milestone.percentage }}%</dd>
          </div>
          <div class="px-2">
            <dt class="text-[11px] font-bold text-slate-400">달성일</dt>
            <dd class="mt-1 text-xs font-bold text-[#0a192f]">{{ achievedDate }}</dd>
          </div>
        </dl>

        <!-- AI 분석 내용 -->
        <section v-if="reportContent" class="mt-5" aria-label="AI 분석 내용">
          <div class="mb-2.5 flex items-center gap-1.5">
            <span
              class="flex size-[18px] items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600"
            >
              ✓
            </span>
            <p class="text-xs font-bold text-emerald-600">AI 코치 분석</p>
          </div>
          <div
            class="whitespace-pre-line text-[13px] leading-6 text-slate-600 sm:text-sm sm:leading-7"
            v-html="formattedReportContent"
          />
        </section>

        <!-- 빈 상태 (달성 대기 등) -->
        <section
          v-else
          class="mt-5 rounded-2xl border border-dashed border-blue-200 bg-[#f8fbff] px-5 py-8 text-center"
          aria-live="polite"
        >
          <div class="mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100">
            <DashboardIcon :name="emptyState.icon" class="size-6 text-primary" />
          </div>
          <p class="mt-3 text-sm font-bold text-[#0a192f]">{{ emptyState.title }}</p>
          <p class="mt-1.5 text-xs leading-5 text-slate-500">{{ emptyState.description }}</p>
        </section>

        <p class="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-[11px] leading-5 text-slate-400">
          AI 리포트는 목표 진행·연결 자산 데이터를 바탕으로 한 참고 정보예요.
        </p>

        <button
          type="button"
          class="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(0,102,255,0.2)] transition hover:bg-blue-700 active:scale-[0.99] cursor-pointer"
          @click="$emit('update:modelValue', false)"
        >
          확인
        </button>
      </div>
    </article>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import DashboardIcon from '@/pages/dashboard/components/DashboardIcon.vue'
import { formatKRWCompact } from '@/shared/lib/money'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  milestone: { type: Object, default: null },
})

defineEmits(['update:modelValue'])

const reportTitle = computed(
  () =>
    props.milestone?.report?.title ||
    props.milestone?.title ||
    `${props.milestone?.percentage ?? 0}% 마일스톤 구간`
)

const reportContent = computed(() => String(props.milestone?.report?.content ?? '').trim())
const reportStatus = computed(() => String(props.milestone?.report?.status ?? '').toUpperCase())
const formattedAmount = computed(() => formatKRWCompact(props.milestone?.targetAmount ?? 0))
const achievedDate = computed(() => {
  if (!props.milestone?.targetDate) return '달성 전'
  return String(props.milestone.targetDate).replace(/-/g, '.')
})

const milestoneStatus = computed(() => {
  if (props.milestone?.status === 'COMPLETED') {
    return { label: '달성 완료', className: 'bg-emerald-50 text-emerald-600' }
  }
  if (props.milestone?.status === 'IN_PROGRESS') {
    return { label: '진행 중', className: 'bg-blue-100 text-primary' }
  }
  return { label: '도전 대기', className: 'bg-slate-100 text-slate-500' }
})

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// AI 리포트 텍스트 포맷터: [대괄호 소제목]은 파란색 뱃지로, **볼드**는 굵은 글씨로
const formattedReportContent = computed(() => {
  if (!reportContent.value) return ''
  let text = escapeHtml(reportContent.value)
  text = text.replace(
    /(?:\*\*)?(\[[^\]]+\])(?:\*\*)?/g,
    '<span class="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/70 px-2 py-0.5 font-bold text-primary text-[12px] sm:text-[13px] my-1 shadow-[0_1px_0_rgba(0,0,0,0.05)]">$1</span>'
  )
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#0a192f]">$1</strong>')
  return text
})

const emptyState = computed(() => {
  if (['FAILED', 'ERROR'].includes(reportStatus.value)) {
    return {
      icon: 'refresh',
      title: '리포트를 불러오지 못했어요',
      description: 'AI 분석이 다시 완료되면 이곳에서 내용을 확인할 수 있어요.',
    }
  }

  if (props.milestone?.status === 'COMPLETED') {
    return {
      icon: 'report-ready',
      title: 'AI 리포트를 준비하고 있어요',
      description: '달성 데이터를 분석 중이에요. 잠시 후 다시 확인해 주세요.',
    }
  }

  return {
    icon: 'lock',
    title: '달성 후 리포트가 열려요',
    description: '이 마일스톤에 도달하면 AI가 진행 과정을 분석해 드려요.',
  }
})
</script>
