import { defineStore } from 'pinia'
import { getCreditScore, getCreditScoreHistory } from '../api/credit.api'

export const useCreditStore = defineStore('credit', {
  state: () => ({
    currentScore: 665,
    updatedAt: '',
    historyList: [],
    totalElements: 0,
    isLoading: false,
  }),

  actions: {
    async fetchCreditData() {
      this.isLoading = true
      try {
        const [scoreData, historyPage] = await Promise.all([
          getCreditScore(),
          getCreditScoreHistory({ page: 1, size: 20 }),
        ])

        this.currentScore = scoreData.currentScore
        this.updatedAt = scoreData.updatedAt
        this.historyList = historyPage.historyList
        this.totalElements = historyPage.totalElements
      } catch (error) {
        console.error('신용 정보 조회 실패:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
