// 목표 달성 공유 카드의 "카카오톡 공유"/"이미지 저장"을 담당하는 composable.
// 백엔드·카카오 SDK 없이 Web Share API + Clipboard API + html-to-image만으로 동작한다.
//
// html2canvas 대신 html-to-image를 쓰는 이유: html2canvas는 DOM/CSS를 읽어서 자체 엔진으로
// "다시 그리는" 방식이라 flexbox gap, align-items 정밀 정렬 등을 완벽히 재현하지 못해
// 모달 화면과 저장된 이미지가 미묘하게 달라지는 문제가 있었다. html-to-image는 DOM을
// SVG <foreignObject>로 감싸 브라우저 자신의 렌더링 엔진으로 그리게 한 뒤 캡처하므로,
// 모달에 보이는 그대로가 항상 이미지에도 반영된다.
import { ref } from 'vue'
import { toPng } from 'html-to-image'
import { PACE_STATE } from '@/features/roadmap/constants/pace-state.constants'

// 컨페티/후광/반짝임 같은 순수 장식용 애니메이션 노드는 `data-html2canvas-ignore="true"`로
// 표시해두고 캡처에서 제외한다. html-to-image는 이 속성을 자동으로 해석하지 않으므로
// filter 옵션에 직접 넘겨서 사용한다 (컴포넌트의 자체 캡처 호출에서도 재사용).
export function shouldCaptureNode(node) {
  return !(node?.dataset && node.dataset.html2canvasIgnore === 'true')
}

/**
 * @typedef {Object} ShareCardData
 * @property {HTMLElement|null} cardEl - 캡처 대상 DOM(공유 카드) 엘리먼트
 * @property {number} progress - 달성률(%) — 공유 카드에 표시되는 값과 동일해야 함
 * @property {'NOT_STARTED'|'ON_TRACK'|'AHEAD'|'BEHIND'} paceState - derivePaceState로 계산한 단일 기준 상태
 * @property {string} [goalName] - 목표 이름(공유 문구·저장 파일명에 사용)
 */

/**
 * @param {() => ShareCardData} getShareData
 *   호출 시점의 공유 카드 상태를 반환하는 함수. ref를 직접 받지 않고 함수로 받아서
 *   호출할 때마다 "지금 화면에 보이는" 최신 값을 읽는다 — 공유 카드 값이 바뀌면
 *   공유 문구도 하드코딩 없이 자동으로 같이 바뀌게 하기 위함.
 * @param {{ onNotify?: (message: string) => void }} [options]
 *   토스트 등 결과 알림 UI를 컴포넌트 쪽에 위임하기 위한 콜백.
 */
export function useShare(getShareData, { onNotify } = {}) {
  const isSaving = ref(false)
  const isSharing = ref(false)

  function notify(message) {
    onNotify?.(message)
  }

  // 저축 시작 전(NOT_STARTED)에는 아직 비교할 달성률/페이스가 없으므로 별도 문구를 쓰고,
  // 그 외에는 달성률 그대로를 보여준다.
  function buildShareText({ progress, paceState, goalName }) {
    if (paceState === PACE_STATE.NOT_STARTED) {
      return '목표를 향해 첫 저축을 시작했어요 🚩\n함께 모아보아요🚀'
    }
    return `내 ${goalName} 달성률 ${progress}%!\n함께 모아보아요🚀`
  }

  /**
   * 공유 카드 DOM을 모달에 보이는 그대로 PNG data URL로 캡처.
   * 모달에서는 카드 모서리가 둥글지만(rounded-3xl), 저장 이미지는 사각 캔버스라
   * 둥근 모서리 바깥이 배경색으로 채워져 어색해 보인다 — `style`은 캡처 순간에만
   * 적용되고 실제 모달 DOM은 그대로라, 저장 이미지에서만 모서리를 각지게 만든다.
   */
  async function captureCard(cardEl) {
    if (!cardEl) return null
    return toPng(cardEl, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: shouldCaptureNode,
      skipFonts: true,
      cacheBust: false,
      style: { borderRadius: '0' },
    })
  }

  /** 공유 카드를 캡처해 PNG로 다운로드 */
  async function saveImage() {
    if (isSaving.value) return
    isSaving.value = true
    try {
      const { cardEl, goalName } = getShareData()
      const dataUrl = await captureCard(cardEl)
      if (!dataUrl) return
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `미래로_${goalName || '목표'}_달성현황.png`
      link.click()
    } catch (error) {
      console.error('이미지 저장 실패:', error)
      notify('이미지 저장에 실패했어요. 다시 시도해 주세요.')
    } finally {
      isSaving.value = false
    }
  }

  async function copyShareLinkToClipboard(text, url) {
    await navigator.clipboard.writeText(`${text}\n\n${url}`)
    notify('클립보드에 복사되었습니다.')
  }

  // 카카오톡 앱을 커스텀 URL 스킴으로 열어본다 — 앱이 설치·등록돼 있지 않으면 그냥 아무
  // 일도 안 일어나는 best-effort 시도라, 실패해도 에러로 취급하지 않는다.
  function openKakaoTalkApp() {
    window.location.href = 'kakaotalk://'
  }

  /**
   * 카카오톡 공유: 항상 클립보드에 문구+전체 링크(href)를 복사한 뒤,
   * 카카오톡 앱을 열어 사용자가 바로 붙여넣게 한다.
   */
  async function shareToKakao() {
    if (isSharing.value) return
    isSharing.value = true
    try {
      const data = getShareData()
      const text = buildShareText(data)
      const url = window.location.origin // /dashboard 경로 대신 기본 루트 도메인(origin) 사용
      await copyShareLinkToClipboard(text, url)
      openKakaoTalkApp()
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
      notify('공유에 실패했어요. 다시 시도해 주세요.')
    } finally {
      isSharing.value = false
    }
  }

  return { isSaving, isSharing, saveImage, shareToKakao }
}
