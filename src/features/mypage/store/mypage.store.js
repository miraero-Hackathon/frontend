import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as mypageApi from '@/features/mypage/api/mypage.api'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  MYPAGE_NOTIFICATION_ITEMS,
  MYPAGE_NOTIFICATION_STORAGE_KEY,
} from '@/features/mypage/constants/mypage.constants'
import { useAuthStore } from '@/stores/auth.store'

// 알림 설정은 계정별 화면 설정이므로 저장 키에 userId를 붙인다.
// 로그인 정보가 없으면(로그아웃 상태) 저장소를 읽거나 쓰지 않고 기본값만 사용한다.
function getNotificationStorageKey() {
  const userId = useAuthStore().user?.id
  return userId ? `${MYPAGE_NOTIFICATION_STORAGE_KEY}:${userId}` : null
}

function loadNotificationSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_NOTIFICATION_SETTINGS }

  const storageKey = getNotificationStorageKey()
  if (!storageKey) return { ...DEFAULT_NOTIFICATION_SETTINGS }

  try {
    const savedSettings = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')

    // 목록에서 삭제된 알림 항목의 값이 저장소에 남지 않도록 현재 항목만 반영한다.
    return Object.fromEntries(
      Object.entries(DEFAULT_NOTIFICATION_SETTINGS).map(([id, defaultEnabled]) => [
        id,
        typeof savedSettings[id] === 'boolean' ? savedSettings[id] : defaultEnabled,
      ])
    )
  } catch {
    return { ...DEFAULT_NOTIFICATION_SETTINGS }
  }
}

export const useMypageStore = defineStore('feature-mypage', () => {
  const profile = ref(null)
  const profileImagePreviewUrl = ref('')
  const mydataConnections = ref([])
  const isProfileLoading = ref(false)
  const isProfileImageSaving = ref(false)
  const isPasswordChanging = ref(false)
  const isMydataConnectionsLoading = ref(false)
  const isAccountsSyncing = ref(false)
  const profileError = ref(null)
  const mydataConnectionsError = ref(null)
  const accountsSyncError = ref(null)
  const notificationSettings = ref(loadNotificationSettings())
  // 진행 중인 프로필 요청. 여러 화면이 동시에 프로필을 요구해도 요청은 하나만 나가게 한다.
  let profileRequest = null

  const displayProfileImageUrl = computed(
    () => profileImagePreviewUrl.value || profile.value?.profileImageUrl || ''
  )
  const notificationItems = computed(() =>
    MYPAGE_NOTIFICATION_ITEMS.map((item) => ({
      ...item,
      enabled: notificationSettings.value[item.id] ?? item.defaultEnabled,
    }))
  )

  function $reset() {
    clearProfile()
    isProfileLoading.value = false
    isProfileImageSaving.value = false
    isPasswordChanging.value = false
    isMydataConnectionsLoading.value = false
    isAccountsSyncing.value = false
    // 로그아웃 후에는 로그인 정보가 없으므로 기본값으로 돌아간다.
    notificationSettings.value = loadNotificationSettings()
  }

  async function fetchProfile() {
    isProfileLoading.value = true
    profileError.value = null

    try {
      const fetchedProfile = await mypageApi.getProfile()
      profile.value = fetchedProfile
      return fetchedProfile
    } catch (error) {
      profileError.value = error
      throw error
    } finally {
      isProfileLoading.value = false
    }
  }

  // 프로필이 필요한 화면이 여러 개라 각자 "없으면 불러오기"를 구현하면 요청이 중복되거나 조건이 서로 어긋난다.
  // 이미 불러왔으면 그대로 쓰고, 요청이 진행 중이면 같은 요청을 함께 기다린다.
  // 실패해도 호출부가 따로 처리할 필요 없도록 null을 반환한다(에러는 profileError에 남는다).
  function ensureProfile() {
    if (profile.value) return Promise.resolve(profile.value)

    if (!profileRequest) {
      profileRequest = fetchProfile()
        .catch(() => null)
        .finally(() => {
          profileRequest = null
        })
    }

    return profileRequest
  }

  async function updateProfileImage(file) {
    isProfileImageSaving.value = true
    profileError.value = null

    try {
      const result = await mypageApi.updateProfileImage(file)
      if (profileImagePreviewUrl.value) URL.revokeObjectURL(profileImagePreviewUrl.value)
      profileImagePreviewUrl.value = URL.createObjectURL(file)
      if (profile.value) profile.value.profileImageUrl = result.profileImageUrl
      return result
    } catch (error) {
      profileError.value = error
      throw error
    } finally {
      isProfileImageSaving.value = false
    }
  }

  async function changePassword(payload) {
    isPasswordChanging.value = true

    try {
      await mypageApi.changePassword(payload)
    } finally {
      isPasswordChanging.value = false
    }
  }

  async function fetchMydataConnections() {
    isMydataConnectionsLoading.value = true
    mydataConnectionsError.value = null

    try {
      const connections = await mypageApi.getMydataConnections()
      mydataConnections.value = connections
      return connections
    } catch (error) {
      mydataConnectionsError.value = error
      throw error
    } finally {
      isMydataConnectionsLoading.value = false
    }
  }

  async function syncAccounts() {
    if (isAccountsSyncing.value) return null

    isAccountsSyncing.value = true
    accountsSyncError.value = null

    try {
      return await mypageApi.syncAccounts()
    } catch (error) {
      accountsSyncError.value = error
      throw error
    } finally {
      isAccountsSyncing.value = false
    }
  }

  function toggleNotification(id) {
    if (!Object.hasOwn(notificationSettings.value, id)) return
    notificationSettings.value = {
      ...notificationSettings.value,
      [id]: !notificationSettings.value[id],
    }

    // 알림 API가 제공되기 전까지 이 기기의 화면 설정으로만 보관한다.
    const storageKey = typeof window !== 'undefined' ? getNotificationStorageKey() : null
    if (storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify(notificationSettings.value))
    }
  }

  function clearProfile() {
    if (profileImagePreviewUrl.value) URL.revokeObjectURL(profileImagePreviewUrl.value)
    // 로그아웃 후에는 이전 계정의 진행 중인 요청을 재사용하지 않는다.
    profileRequest = null
    profile.value = null
    profileImagePreviewUrl.value = ''
    mydataConnections.value = []
    profileError.value = null
    mydataConnectionsError.value = null
    accountsSyncError.value = null
  }

  return {
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
    fetchProfile,
    ensureProfile,
    updateProfileImage,
    changePassword,
    fetchMydataConnections,
    syncAccounts,
    toggleNotification,
    clearProfile,
    $reset,
  }
})
