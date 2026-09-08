<template>
  <div class="min-h-full bg-[#f8fafc] text-[#0a192f]">
    <main class="page-container-narrow pb-10 pt-4 sm:pb-14 sm:pt-6">
      <div class="flex flex-col gap-3 sm:gap-5">
        <ProfileSection
          :profile="profile"
          :profile-image-url="displayProfileImageUrl"
          :loading="isProfileLoading"
          :error="profileError"
          @edit-image="openProfileImageModal"
          @retry="refreshProfile(true)"
        />

        <MyDataSection
          :connections="mydataConnections"
          :loading="isMydataConnectionsLoading"
          :syncing="isAccountsSyncing"
          :load-error="mydataConnectionsError"
          :sync-error="accountsSyncError"
          @sync="syncMydata"
          @retry-load="fetchMydataConnections"
        />

        <GoalResetSection
          :goal="currentGoal"
          :loading="isGoalLoading"
          :error="goalLoadError"
          @reset="openGoalResetModal"
          @retry="fetchCurrentGoal"
        />

        <NotificationSection :items="notificationItems" @toggle="toggleNotification" />

        <AccountSection
          @change-password="openPasswordModal"
          @open-policy="openPolicy"
          @logout="logoutModalOpen = true"
        />

        <p class="pb-4 text-center text-xs text-[#c5dcff]">
          미래로 v1.0.0 · 목표 기반 금융생활 관리 서비스
        </p>
      </div>
    </main>

    <ProfileImageModal
      v-model="profileImageModalOpen"
      :initial="profileInitial"
      :current-image-url="displayProfileImageUrl"
      :saving="isProfileImageSaving"
      :error="profileImageError"
      @submit="saveProfileImage"
    />

    <PasswordChangeModal
      v-model="passwordModalOpen"
      :saving="isPasswordChanging"
      :server-error="passwordError"
      @submit="savePassword"
    />

    <GoalResetModal
      v-model="goalResetModalOpen"
      :goal="currentGoal"
      :saving="isGoalSaving"
      :error="goalResetError"
      @submit="saveGoalReset"
    />

    <PolicyModal v-model="policyModalOpen" :policy-key="activePolicy" />

    <LogoutConfirmModal v-model="logoutModalOpen" :pending="isSubmittingLogout" @confirm="logout" />

    <MypageToast :message="toastMessage" :variant="toastVariant" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthFeatureStore } from '@/features/auth'
import { goalApi } from '@/features/goal'
import {
  AccountSection,
  GoalResetModal,
  GoalResetSection,
  LogoutConfirmModal,
  MyDataSection,
  MypageToast,
  NotificationSection,
  PasswordChangeModal,
  PolicyModal,
  ProfileImageModal,
  ProfileSection,
  useMypageStore,
} from '@/features/mypage'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { useAuthStore } from '@/stores/auth.store'
import '@/features/mypage/styles/mypage.css'

const router = useRouter()
const authStore = useAuthStore()
const authFeatureStore = useAuthFeatureStore()
const { isSubmittingLogout } = storeToRefs(authFeatureStore)
const mypageStore = useMypageStore()
const {
  profile,
  displayProfileImageUrl,
  mydataConnections,
  notificationItems,
  isProfileLoading,
  isProfileImageSaving,
  isPasswordChanging,
  isMydataConnectionsLoading,
  isAccountsSyncing,
  profileError,
  mydataConnectionsError,
  accountsSyncError,
} = storeToRefs(mypageStore)

const currentGoal = ref(null)
const isGoalLoading = ref(false)
const isGoalSaving = ref(false)
const goalLoadError = ref('')
const profileImageModalOpen = ref(false)
const passwordModalOpen = ref(false)
const policyModalOpen = ref(false)
const logoutModalOpen = ref(false)
const goalResetModalOpen = ref(false)
const activePolicy = ref('terms')
const profileImageError = ref('')
const passwordError = ref('')
const goalResetError = ref('')
const toastMessage = ref('')
const toastVariant = ref('success')
const profileInitial = computed(() => profile.value?.nickname?.charAt(0) || '')
let toastTimer

function showToast(message, variant = 'success') {
  toastMessage.value = message
  toastVariant.value = variant
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
  }, 3200)
}

async function refreshProfile(showSuccessToast = false) {
  try {
    const fetchedProfile = await mypageStore.fetchProfile()
    authStore.updateUser({
      id: String(fetchedProfile.memberId),
      name: fetchedProfile.nickname,
      email: fetchedProfile.email,
    })
    if (showSuccessToast) showToast('사용자 정보를 새로 확인했습니다.')
  } catch {
    if (showSuccessToast) showToast('사용자 정보를 확인하지 못했습니다.', 'error')
  }
}

async function syncMydata() {
  try {
    const result = await mypageStore.syncAccounts()
    if (!result) return
    showToast('마이데이터 동기화가 완료되었습니다')
    fetchMydataConnections()
  } catch {
    showToast('마이데이터 동기화가 실패하였습니다', 'error')
  }
}

async function fetchMydataConnections() {
  try {
    await mypageStore.fetchMydataConnections()
  } catch {
    // 조회 실패 상태는 store에서 관리하고 화면에 표시한다.
  }
}

async function fetchCurrentGoal() {
  isGoalLoading.value = true
  goalLoadError.value = ''
  try {
    const goals = await goalApi.getGoals()
    // 이미 보고 있던 목표는 일시정지로 상태가 바뀌어도 계속 같은 목표를 보여준다.
    // 목록에서 사라진 경우(달성·삭제)에만 진행 중인 목표로 넘어간다.
    const viewingGoal = currentGoal.value
      ? goals.find((goal) => String(goal.goalId) === String(currentGoal.value.goalId))
      : null
    const targetGoal = viewingGoal ?? goals.find((goal) => goal.status === 'ACTIVE') ?? goals[0]
    currentGoal.value = targetGoal ? await goalApi.getGoalDetail(targetGoal.goalId) : null
  } catch (error) {
    goalLoadError.value = error.message ?? '목표 정보를 불러오지 못했습니다.'
  } finally {
    isGoalLoading.value = false
  }
}

async function saveProfileImage(file) {
  profileImageError.value = ''
  try {
    await mypageStore.updateProfileImage(file)
    profileImageModalOpen.value = false
    showToast('프로필 사진이 변경되었습니다.')
  } catch (error) {
    profileImageError.value = error.message ?? '프로필 사진을 변경하지 못했습니다.'
  }
}

function openProfileImageModal() {
  profileImageError.value = ''
  profileImageModalOpen.value = true
}

async function savePassword(payload) {
  passwordError.value = ''
  try {
    await mypageStore.changePassword(payload)
    passwordModalOpen.value = false
    showToast('비밀번호가 변경되었습니다.')
  } catch (error) {
    passwordError.value = error.message ?? '비밀번호를 변경하지 못했습니다.'
  }
}

function openPasswordModal() {
  passwordError.value = ''
  passwordModalOpen.value = true
}

function toggleNotification(id) {
  const targetItem = notificationItems.value.find((item) => item.id === id)
  if (!targetItem) return

  const willEnable = !targetItem.enabled
  mypageStore.toggleNotification(id)
  showToast(`${targetItem.label}을 ${willEnable ? '켰어요.' : '껐어요.'}`)
}

function openGoalResetModal() {
  if (!currentGoal.value) {
    router.push({ name: ROUTE_NAMES.GOAL_SELECT, query: { from: 'dashboard' } })
    return
  }

  goalResetError.value = ''
  goalResetModalOpen.value = true
}

async function saveGoalReset(payload) {
  if (!currentGoal.value || isGoalSaving.value) return
  const goalId = currentGoal.value.goalId
  const nextStatus = payload.status === 'PAUSE' ? 'PAUSED' : 'ACTIVE'
  const previousStatus = ['PAUSE', 'PAUSED'].includes(currentGoal.value.status)
    ? 'PAUSED'
    : 'ACTIVE'
  // 금액·기간 저장 후 상태 변경이 실패하면 앞의 저장만 반영된 상태이므로 따로 안내한다.
  let isGoalSaved = false
  isGoalSaving.value = true
  goalResetError.value = ''

  try {
    await goalApi.updateGoal(goalId, {
      // 목표명은 이 화면에서 수정하지 않지만 빠뜨리면 NULL로 덮이므로 현재 값을 함께 보낸다.
      goalName: currentGoal.value.goalName,
      goalAmount: payload.goalAmount,
      goalMonths: payload.goalMonths,
    })
    isGoalSaved = true

    // 목표 상태는 PATCH /goals/{goalId}/status 로만 변경된다.
    if (nextStatus !== previousStatus) {
      await goalApi.updateGoalStatus(goalId, nextStatus)
    }
  } catch (error) {
    goalResetError.value = isGoalSaved
      ? `목표 금액·기간은 저장했지만 상태를 변경하지 못했습니다. ${error.message ?? ''}`.trim()
      : (error.message ?? '목표를 재설정하지 못했습니다.')
    if (isGoalSaved) await fetchCurrentGoal()
    return
  } finally {
    isGoalSaving.value = false
  }

  goalResetModalOpen.value = false
  showToast('목표가 재설정되었습니다.')
  await fetchCurrentGoal()
}

function openPolicy(policyKey) {
  activePolicy.value = policyKey
  policyModalOpen.value = true
}

async function logout() {
  // 서버 로그아웃 응답을 기다리는 동안 모달을 유지해 진행 상태를 보여준다.
  await authFeatureStore.submitLogout()
  logoutModalOpen.value = false
  await router.push({ name: ROUTE_NAMES.LOGIN })
}

onMounted(() => {
  refreshProfile()
  fetchMydataConnections()
  fetchCurrentGoal()
})

onBeforeUnmount(() => window.clearTimeout(toastTimer))
</script>
