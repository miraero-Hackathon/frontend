<!-- 친구에게 공유하기 모달: 목표 달성 현황(트로피/달성률/로드맵)을 카드로 보여주고 공유 액션을 제공 -->
<template>
  <BaseModal
    :model-value="modelValue"
    hide-default-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="max-h-[90vh] w-full overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
        <h3 class="text-sm font-bold text-[#0a192f] sm:text-base">친구에게 공유하기</h3>
        <button
          type="button"
          class="flex size-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer select-none"
          aria-label="닫기"
          @click="close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-3">
        <ShareCardPreview ref="cardPreviewRef" :goal="goal" :milestones="milestones" />

        <ShareActionButtons
          :is-saving-share-image="isSavingShareImage"
          :is-saving="isSaving"
          :is-sharing-kakao="isSharingKakao"
          @save-image="handleSaveImage"
          @share-instagram="handleShareInstagram"
          @share-kakao="handleShareKakao"
          @share="handleShare"
        />
      </div>
    </div>

    <!-- 토스트 알림 메시지 -->
    <Transition name="fade">
      <div
        v-if="showToast"
        class="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { toPng } from 'html-to-image'
import BaseModal from '@/shared/ui/BaseModal.vue'
import { useShare, shouldCaptureNode } from '@/features/roadmap/composables/useShare'
import ShareCardPreview from '@/features/roadmap/components/ShareCardPreview.vue'
import ShareActionButtons from '@/features/roadmap/components/ShareActionButtons.vue'
import { derivePaceState } from '@/features/roadmap/constants/pace-state.constants'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  goal: { type: Object, required: true },
  milestones: { type: Array, required: true },
})

const emit = defineEmits([
  'update:modelValue',
  'save-image',
  'share-instagram',
  'share-kakao',
  'share',
])

function close() {
  emit('update:modelValue', false)
}

const cardPreviewRef = ref(null)
const cardRef = computed(() => cardPreviewRef.value?.cardRef ?? null)
const isSaving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// 브라우저 자신의 렌더링 엔진으로 그린 뒤 캡처하는 html-to-image 사용 —
// 모달에 보이는 그대로가 항상 이미지에도 반영된다 (useShare.js의 captureCard와 동일한 이유)
async function generateCardImage() {
  if (!cardRef.value) return null
  return toPng(cardRef.value, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    filter: shouldCaptureNode,
    skipFonts: true,
    cacheBust: false,
    style: { borderRadius: '0' },
  })
}

// 공유 카드(cardRef)에 지금 표시되고 있는 값 그대로를 반환
// paceState는 메인 카드와 같은 단일 기준(derivePaceState)을 쓴다 — 백엔드 원본
// pace.paceStatus(누적 기준)를 쓰면 저축 시작 전인데도 "뒤처지는 중"으로 공유되는 등
// 화면에 보이는 상태와 다른 문구가 나갈 수 있다.
function getShareData() {
  return {
    cardEl: cardRef.value,
    progress: props.goal.progressRate,
    paceState: derivePaceState(props.goal),
    goalName: props.goal.goalName,
  }
}

function notifyToast(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const {
  isSaving: isSavingShareImage,
  isSharing: isSharingKakao,
  saveImage,
  shareToKakao,
} = useShare(getShareData, { onNotify: notifyToast })

async function handleSaveImage() {
  await saveImage()
  emit('save-image')
}

async function handleShareKakao() {
  await shareToKakao()
  emit('share-kakao')
}

async function handleShareInstagram() {
  if (!cardRef.value || isSaving.value) return

  isSaving.value = true
  try {
    const image = await generateCardImage()
    if (!image) return
    const link = document.createElement('a')
    link.href = image
    link.download = `미래로_${props.goal.goalName || '목표'}_인스타그램_공유.png`
    link.click()

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = 'instagram://'
    } else {
      window.open('https://www.instagram.com', '_blank')
    }

    toastMessage.value = '이미지가 저장되었습니다 📸'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)

    emit('share-instagram')
  } catch (error) {
    console.error('인스타그램 공유 실패:', error)
    toastMessage.value = '이미지 생성에 실패했어요. 다시 시도해 주세요.'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2500)
  } finally {
    isSaving.value = false
  }
}

async function handleShare() {
  const shareUrl = window.location.origin
  const shareData = {
    title: `미래로 - ${props.goal.goalName || '목표'} 달성 현황`,
    text: `내 ${props.goal.goalName || '목표'} 달성률 ${props.goal.progressRate}%! 함께 모아보아요 🚀`,
    url: shareUrl,
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
      emit('share')
      return
    } catch {
      // 사용자 공유 취소 시 폴백으로 클립보드 복사 실행
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl)
    toastMessage.value = '공유 링크가 클립보드에 복사되었어요! 🔗'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2500)
    emit('share')
  } catch {
    toastMessage.value = '링크 복사에 실패했어요. 다시 시도해 주세요.'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2500)
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      nextTick(() => {
        cardPreviewRef.value?.fireConfetti()
      })
    } else {
      cardPreviewRef.value?.stopConfetti()
    }
  },
  { immediate: true }
)
</script>
