<template>
  <MypageSection title="계정 관리" heading-id="account-section-title" body-class="!py-2">
    <MypageRow label="비밀번호 변경">
      <button type="button" class="mypage-subtle-button" @click="emit('change-password')">
        변경
      </button>
    </MypageRow>
    <button type="button" class="mypage-account-row" @click="emit('open-policy', 'terms')">
      <span>서비스 이용약관</span><span aria-hidden="true">›</span>
    </button>
    <button type="button" class="mypage-account-row" @click="emit('open-policy', 'privacy')">
      <span>개인정보 처리방침</span><span aria-hidden="true">›</span>
    </button>
    <MypageRow label="로그아웃" :bordered="false">
      <button
        type="button"
        class="mypage-subtle-button hover:!border-red-200 hover:!text-red-500"
        @click="emit('logout')"
      >
        로그아웃
      </button>
    </MypageRow>
  </MypageSection>
</template>

<script setup>
import MypageRow from '@/features/mypage/components/MypageRow.vue'
import MypageSection from '@/features/mypage/components/MypageSection.vue'

const emit = defineEmits(['change-password', 'open-policy', 'logout'])
</script>
