import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSpendingSummary, getTransactions } from '@/features/spending/api/spending.api'

export const useSpendingStore = defineStore('spending', () => {
  const spendingSummary = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const transactionHistory = ref(null)
  const areTransactionsLoading = ref(false)
  const transactionsError = ref(null)
  let spendingRequestId = 0
  let transactionsRequestId = 0

  function $reset() {
    spendingSummary.value = null
    isLoading.value = false
    error.value = null
    transactionHistory.value = null
    areTransactionsLoading.value = false
    transactionsError.value = null
    spendingRequestId += 1
    transactionsRequestId += 1
  }

  async function loadSpendingData(goalId) {
    const requestId = ++spendingRequestId
    isLoading.value = true
    error.value = null
    spendingSummary.value = null

    try {
      const summary = await getSpendingSummary(goalId)
      if (requestId === spendingRequestId) spendingSummary.value = summary
    } catch (caughtError) {
      if (requestId === spendingRequestId) error.value = caughtError
    } finally {
      if (requestId === spendingRequestId) isLoading.value = false
    }
  }

  async function loadTransactions(params) {
    const requestId = ++transactionsRequestId
    areTransactionsLoading.value = true
    transactionsError.value = null
    transactionHistory.value = null

    try {
      const history = await getTransactions(params)
      if (requestId === transactionsRequestId) transactionHistory.value = history
    } catch (caughtError) {
      if (requestId === transactionsRequestId) transactionsError.value = caughtError
    } finally {
      if (requestId === transactionsRequestId) areTransactionsLoading.value = false
    }
  }

  return {
    spendingSummary,
    isLoading,
    error,
    transactionHistory,
    areTransactionsLoading,
    transactionsError,
    loadSpendingData,
    loadTransactions,
    $reset,
  }
})
