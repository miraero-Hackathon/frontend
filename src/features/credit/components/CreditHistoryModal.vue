<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity"
    @click.self="closeModal"
  >
    <div
      class="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- 헤더 (브랜드 Primary 컬러 적용) -->
      <div class="px-6 pt-6 pb-4 flex justify-between items-start border-b border-gray-100">
        <div>
          <h2 class="text-lg font-bold text-gray-900">최근 신용 점수 변동 이력</h2>
          <p class="text-xs text-primary font-medium mt-0.5">총 {{ totalElements }}건의 기록</p>
        </div>
        <button
          @click="closeModal"
          class="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 내역 리스트 -->
      <div class="p-6 overflow-y-auto flex-1 divide-y divide-gray-50 no-scrollbar">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="py-12 text-center text-gray-400 text-sm">
          이력을 불러오는 중입니다...
        </div>

        <!-- 데이터 없음 -->
        <div
          v-else-if="!historyList || historyList.length === 0"
          class="py-12 text-center text-gray-400 text-sm"
        >
          최근 변동된 신용 점수 이력이 없습니다.
        </div>

        <!-- 토스 스타일 이력 리스트 -->
        <div
          v-else
          v-for="(item, index) in historyList"
          :key="index"
          class="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between"
        >
          <!-- 좌측: 아이콘 + 변동 내용 -->
          <div class="flex items-center gap-3.5">
            <div
              :class="[
                'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm',
                item.delta > 0
                  ? 'bg-blue-50 text-primary'
                  : item.delta < 0
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-gray-100 text-gray-500',
              ]"
            >
              <svg
                v-if="item.delta > 0"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <svg
                v-else-if="item.delta < 0"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                />
              </svg>
              <span v-else>-</span>
            </div>

            <div>
              <div class="font-bold text-gray-900 text-sm">
                {{ item.reasonDisplayName || '신용점수 변동' }}
              </div>
              <div v-if="item.description" class="text-xs text-gray-500 mt-0.5">
                {{ item.description }}
              </div>
              <div class="text-[11px] text-gray-400 mt-0.5">
                {{ formatDate(item.occurredAt) }}
              </div>
            </div>
          </div>

          <!-- 우측: 점수 변동량 및 최종 점수 -->
          <div class="text-right shrink-0">
            <div
              :class="[
                'font-extrabold text-sm',
                item.delta > 0
                  ? 'text-primary'
                  : item.delta < 0
                    ? 'text-rose-500'
                    : 'text-gray-900',
              ]"
            >
              {{ item.delta > 0 ? `+${item.delta}` : item.delta }}점
            </div>
            <div class="text-[11px] text-gray-400 font-medium mt-0.5">{{ item.scoreAfter }}점</div>
          </div>
        </div>
      </div>

      <!-- 푸터 버튼 (Primary 토큰 적용) -->
      <div class="p-4 bg-white border-t border-gray-100">
        <button
          @click="closeModal"
          class="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-sm transition-colors shadow-sm"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, required: true },
  historyList: { type: Array, default: () => [] },
  totalElements: { type: Number, default: 0 },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function closeModal() {
  emit('close')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${month}.${day} ${hours}:${minutes}`
}
</script>
