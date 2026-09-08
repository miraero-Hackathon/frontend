<!-- 로그인 페이지 (AUTH-02) -->
<template>
  <HeroBackground>
    <StepHeader :show-back="true" @back="router.push({ name: ROUTE_NAMES.ONBOARDING })" />

    <main class="flex min-h-[calc(100dvh-72px)] items-center justify-center px-4 py-6 sm:py-10">
      <div class="w-full max-w-[420px]">
        <div class="flex flex-col items-center text-center">
          <h1
            class="text-2xl font-bold tracking-tight text-gray-900 sm:text-[26px] [word-break:keep-all] break-keep"
          >
            로그인
          </h1>
          <p class="mt-2 text-sm leading-relaxed text-gray-500 [word-break:keep-all] break-keep">
            미래로 계정으로 시작하세요
          </p>
        </div>

        <form class="mt-7 space-y-6" @submit.prevent="handleLogin">
          <div class="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-xs">
            <h2 class="text-sm font-bold text-gray-900">계정 정보</h2>

            <div class="mt-4 space-y-4">
              <BaseInput
                id="email"
                v-model="form.email"
                label="이메일"
                type="email"
                placeholder="example@email.com"
                autofocus
                :error="errors.email"
                @input="handleEmailInput"
                @blur="validateEmail"
              />

              <PasswordInput
                id="password"
                v-model="form.password"
                label="비밀번호"
                placeholder="비밀번호를 입력해 주세요"
                :error="errors.password"
                @input="handlePasswordInput"
                @blur="validatePassword"
              />
            </div>
          </div>

          <div class="space-y-3">
            <p
              v-if="authFeatureStore.loginError"
              class="text-center text-sm font-medium text-red-500 [word-break:keep-all] break-keep"
            >
              {{ authFeatureStore.loginError }}
            </p>
            <BaseButton
              type="submit"
              full-width
              size="lg"
              :disabled="!canSubmit || authFeatureStore.isSubmittingLogin"
            >
              {{ authFeatureStore.isSubmittingLogin ? '로그인 중...' : '로그인' }}
            </BaseButton>

            <div
              class="mt-4 flex items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-500"
            >
              <button
                type="button"
                class="whitespace-nowrap transition hover:text-gray-900"
                @click="isFindPasswordModalOpen = true"
              >
                비밀번호 찾기
              </button>
              <span class="h-3 w-px bg-gray-200 shrink-0" aria-hidden="true" />
              <RouterLink
                :to="{ name: ROUTE_NAMES.SIGNUP }"
                class="whitespace-nowrap font-semibold text-primary transition hover:underline"
              >
                회원가입하기
              </RouterLink>
            </div>
          </div>
        </form>
      </div>
    </main>

    <!-- 비밀번호 찾기 안내 모달 -->
    <BaseModal v-model="isFindPasswordModalOpen" hide-default-close>
      <div class="p-5 sm:p-6 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary"
        >
          <svg
            class="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-gray-900 [word-break:keep-all] break-keep">
          비밀번호를 잊으셨나요?
        </h3>
        <p
          class="mt-2 text-xs sm:text-sm leading-relaxed text-gray-500 [word-break:keep-all] break-keep"
        >
          보안을 위해 비밀번호 초기화는 고객센터 확인 후 진행됩니다.<br />
          아래 고객센터로 문의해 주시면 신속하게 도와드릴게요.
        </p>
        <div class="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p class="font-bold text-slate-800">미래로 고객지원팀</p>
          <p class="mt-0.5 font-mono">support@miraero.io</p>
        </div>
        <div class="mt-5">
          <BaseButton full-width size="md" @click="isFindPasswordModalOpen = false">
            확인
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </HeroBackground>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import HeroBackground from '@/shared/ui/HeroBackground.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import StepHeader from '@/shared/ui/StepHeader.vue'
import { PasswordInput, useAuthFeatureStore } from '@/features/auth'
import { getGoals } from '@/features/goal/api/goal.api'
import { ROUTE_NAMES } from '@/shared/constants/routes'

const route = useRoute()
const router = useRouter()
const authFeatureStore = useAuthFeatureStore()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const form = ref({ email: '', password: '' })
const errors = ref({ email: '', password: '' })
const isFindPasswordModalOpen = ref(false)

const canSubmit = computed(() => {
  return (
    EMAIL_PATTERN.test(form.value.email) &&
    form.value.password.trim().length > 0 &&
    !errors.value.email &&
    !errors.value.password
  )
})

onMounted(() => {
  authFeatureStore.resetLoginError()
  if (route.query.email) {
    form.value.email = String(route.query.email)
  }
})

function handleEmailInput() {
  if (authFeatureStore.loginError) {
    authFeatureStore.resetLoginError()
  }
  if (errors.value.email && EMAIL_PATTERN.test(form.value.email)) {
    errors.value.email = ''
  }
}

function handlePasswordInput() {
  if (authFeatureStore.loginError) {
    authFeatureStore.resetLoginError()
  }
  if (errors.value.password && form.value.password) {
    errors.value.password = ''
  }
}

function validateEmail() {
  if (!form.value.email) {
    errors.value.email = '이메일을 입력해 주세요.'
    return
  }
  errors.value.email = EMAIL_PATTERN.test(form.value.email)
    ? ''
    : '올바른 이메일 형식을 입력해 주세요.'
}

function validatePassword() {
  errors.value.password = form.value.password ? '' : '비밀번호를 입력해 주세요.'
}

async function handleLogin() {
  if (authFeatureStore.isSubmittingLogin) return

  validateEmail()
  validatePassword()

  if (errors.value.email || errors.value.password) return

  try {
    await authFeatureStore.submitLogin(form.value)

    // 기존 목표가 있는 사용자는 대시보드로 바로 이동, 첫 사용자는 온보딩(마이데이터 연동)으로 이동
    try {
      const goals = await getGoals()
      if (Array.isArray(goals) && goals.length > 0) {
        router.push({ name: ROUTE_NAMES.DASHBOARD })
        return
      }
    } catch {
      // 목표 조회 실패 시 기본 온보딩으로 진행
    }

    router.push({ name: ROUTE_NAMES.MYDATA_LOADING })
  } catch {
    // loginError는 store에서 관리
  }
}
</script>
