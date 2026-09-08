<template>
  <MypageSection title="프로필" heading-id="profile-section-title">
    <div
      class="mb-5 flex items-center gap-3.5 border-b border-[#f4f8ff] pb-5 sm:gap-5"
      :aria-busy="loading"
    >
      <div
        class="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-[#66b2ff] text-xl font-bold text-white sm:size-16 sm:text-2xl"
        aria-hidden="true"
      >
        <img
          v-if="profileImageUrl && !imageLoadFailed"
          :src="profileImageUrl"
          alt=""
          class="size-full object-cover"
          @error="imageLoadFailed = true"
        />
        <span v-else>{{ profileInitial }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <template v-if="profile">
          <p class="truncate text-lg font-bold text-[#0a192f]">{{ profile.nickname }}</p>
          <p class="truncate text-sm text-slate-500">{{ profile.email }}</p>
        </template>
        <div v-else-if="loading" class="space-y-2" role="status" aria-label="프로필 불러오는 중">
          <div class="h-5 w-24 animate-pulse rounded bg-slate-100" />
          <div class="h-4 w-40 animate-pulse rounded bg-slate-100" />
        </div>
        <p v-else class="text-sm font-medium text-slate-500">
          {{ error ? '프로필 조회 실패' : '프로필 정보 없음' }}
        </p>
      </div>
      <button
        type="button"
        class="mypage-subtle-button"
        :disabled="loading || !profile"
        @click="emit('edit-image')"
      >
        수정
      </button>
    </div>

    <div v-if="profile">
      <MypageRow label="이름">
        <p class="font-medium text-[#0a192f]">{{ profile.nickname }}</p>
      </MypageRow>
      <MypageRow label="이메일">
        <p>{{ profile.email }}</p>
      </MypageRow>
      <MypageRow label="생년월일">
        <p>{{ formatDate(profile.birthDate) }}</p>
      </MypageRow>
      <MypageRow label="직장" description="마이데이터에서 확인">
        <p class="font-medium text-[#0a192f]">{{ profile.company || '확인되지 않음' }}</p>
      </MypageRow>
      <MypageRow label="월 소득" description="마이데이터에서 확인" :bordered="false">
        <p class="font-bold text-primary">
          {{ profile.monthlyIncome === null ? '확인되지 않음' : formatKRW(profile.monthlyIncome) }}
        </p>
      </MypageRow>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      프로필 정보를 불러오지 못했습니다.
      <button type="button" class="ml-1 font-bold underline" @click="emit('retry')">
        다시 시도
      </button>
    </div>
  </MypageSection>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { formatDate } from '@/shared/lib/date'
import { formatKRW } from '@/shared/lib/money'
import MypageRow from '@/features/mypage/components/MypageRow.vue'
import MypageSection from '@/features/mypage/components/MypageSection.vue'

const props = defineProps({
  profile: { type: Object, default: null },
  profileImageUrl: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
})

const emit = defineEmits(['edit-image', 'retry'])
const imageLoadFailed = ref(false)
const profileInitial = computed(() => props.profile?.nickname?.charAt(0) || '')

watch(
  () => props.profileImageUrl,
  () => {
    imageLoadFailed.value = false
  }
)
</script>
