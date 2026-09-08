// 페이스메이커 저금통 → 목표 계좌 입금 플로우 (대상 선택, 제출, 재시도) 공용 로직
import { ref } from 'vue'
import { usePacemakerStore } from '@/features/pacemaker/store/pacemaker.store'
import { useGoalStore } from '@/features/goal'
import { PACEMAKER_HISTORY_PAGE_SIZE } from '@/features/pacemaker/constants/pacemaker.constants'

export function usePacemakerDeposit() {
  // 로그아웃 시 store가 폐기되므로 setup 시점에 캡처하지 않고 사용하는 함수 안에서 가져온다.
  // 단, App.vue처럼 이 composable을 언마운트되지 않는 컴포넌트에서 호출하면 이 ref들도
  // 계정이 바뀌어도 그대로 남아있으므로, 로그아웃 시 resetDepositState()로 반드시 비워줘야 한다.
  const selectedDepositTarget = ref(null)
  const depositedAmount = ref(0)
  const isDepositing = ref(false)
  const depositErrorMessage = ref('')
  // 입금 요청이 진행 중일 때 로그아웃해도, 뒤늦게 도착한 응답이 다음 사용자의 상태를
  // 덮어쓰지 않도록 요청마다 번호를 매겨 무효화한다.
  let depositRequestId = 0

  /**
   * 목표(goal)의 연결 자산(depositAssets) 목록으로 입금 옵션을 구성합니다.
   * 자산명은 대시보드가 이미 캐시해둔 계좌 상세(accountDetails)를 재사용한다.
   * @param {Object} group - { goalId, goalName, goalType, depositAssets }
   * @param {Object} [preferredAsset] - 기본으로 선택해둘 자산 (없으면 첫 번째 옵션)
   */
  function openDeposit(group, preferredAsset) {
    const pacemakerStore = usePacemakerStore()
    const depositOptions = (group?.depositAssets ?? []).map((asset) => ({
      assetId: asset.assetId,
      assetType: asset.assetType,
      moneyBoxId: pacemakerStore.pacemakerView.moneyBoxId,
      icon: asset.assetType === 'MONEY_BOX' ? '🪙' : '🏦',
      accountNickname: depositAssetLabel(asset, pacemakerStore),
      accountBalance: asset.balance ?? 0,
      bankName: asset.financialInstitutionName ?? '',
      accountNumberMasked: asset.maskedAccountNumber ?? '',
    }))
    const selectedOption =
      depositOptions.find(
        (option) =>
          option.assetId === preferredAsset?.assetId &&
          option.assetType === preferredAsset?.assetType
      ) ?? depositOptions[0]

    selectedDepositTarget.value = {
      ...selectedOption,
      goalId: group?.goalId,
      goalName: group?.goalName,
      // 입금 완료 모달의 목표 아이콘(GoalTypeIcon)이 goalType을 필요로 한다.
      goalType: group?.goalType,
      depositOptions,
    }
    depositErrorMessage.value = ''
    return selectedDepositTarget.value
  }

  // LOAN/ACCOUNT/MONEY_BOX가 같은 숫자 assetId 공간을 공유할 수 있어(서버 스펙 확인됨),
  // ACCOUNT 전용 캐시(accountDetails)는 assetType이 ACCOUNT일 때만 조회한다.
  // 그렇지 않으면 우연히 같은 id를 가진 다른 타입 자산의 이름이 잘못 표시될 수 있다.
  function depositAssetLabel(asset, pacemakerStore) {
    if (asset.assetType === 'MONEY_BOX') return '저금통'
    if (asset.assetType === 'LOAN') return asset.financialInstitutionName ?? '대출 계좌'
    return (
      pacemakerStore.accountDetails[asset.assetId]?.accountName ??
      asset.financialInstitutionName ??
      '연결 계좌'
    )
  }

  /**
   * @param {{ assetId: number, assetType: string, amount: number, moneyBoxId: number, option: Object }} payload
   * @param {() => void} [onSuccess] - 입금 성공 후 호출 (입금 모달 닫기 등)
   */
  async function submitDeposit({ assetId, assetType, amount, moneyBoxId, option }, onSuccess) {
    if (isDepositing.value) return

    const requestId = ++depositRequestId
    const pacemakerStore = usePacemakerStore()
    isDepositing.value = true
    depositErrorMessage.value = ''
    try {
      await pacemakerStore.depositToGoal(assetId, assetType, amount, moneyBoxId)
      // 응답이 오는 사이 로그아웃(resetDepositState)했다면 이 결과는 이미 무효하다.
      if (requestId !== depositRequestId) return

      selectedDepositTarget.value = { ...selectedDepositTarget.value, ...option }
      depositedAmount.value = amount
      const depositedGoalId = selectedDepositTarget.value.goalId
      await Promise.all([
        pacemakerStore.fetchDepositTargets().catch(() => undefined),
        // 입금 대상 자산은 메인 대시보드(goalStore)와 같은 자산이라, 대시보드로 돌아가기 전에도
        // 잔액이 바로 최신 상태이도록 여기서도 같이 갱신해둔다.
        depositedGoalId
          ? useGoalStore()
              .fetchSupplementaryDashboardData(depositedGoalId)
              .catch(() => undefined)
          : Promise.resolve(),
      ])
      if (requestId !== depositRequestId) return
      onSuccess?.()
    } catch (error) {
      if (requestId !== depositRequestId) return
      depositErrorMessage.value =
        error?.message ?? '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
    } finally {
      if (requestId === depositRequestId) isDepositing.value = false
    }
  }

  async function retryDepositTargets() {
    try {
      await usePacemakerStore().fetchDepositTargets()
    } catch {
      // 스토어의 오류 상태를 통해 같은 영역에서 재시도 UI를 유지합니다.
    }
  }

  async function retryHistories() {
    try {
      await usePacemakerStore().fetchHistories({ page: 0, size: PACEMAKER_HISTORY_PAGE_SIZE })
    } catch {
      // 스토어의 오류 상태를 통해 같은 영역에서 재시도 UI를 유지합니다.
    }
  }

  // 로그아웃 시 이 composable을 들고 있는 컴포넌트가 언마운트되지 않으면(App.vue 등)
  // 이전 사용자의 입금 대상/금액/에러가 다음 사용자에게 그대로 남을 수 있어 명시적으로 비운다.
  function resetDepositState() {
    depositRequestId += 1
    selectedDepositTarget.value = null
    depositedAmount.value = 0
    isDepositing.value = false
    depositErrorMessage.value = ''
  }

  return {
    selectedDepositTarget,
    depositedAmount,
    isDepositing,
    depositErrorMessage,
    openDeposit,
    submitDeposit,
    retryDepositTargets,
    retryHistories,
    resetDepositState,
  }
}
