import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useRecordStore = defineStore('record', () => {
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchRecords = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.record.getAll()
      if (response.success) {
        records.value = response.data || []
      }
    } catch (err) {
      error.value = err.message || '获取记录失败'
      console.error('获取记录失败:', err)
    } finally {
      loading.value = false
    }
  }

  const addRecord = async (record) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.record.add(record)
      if (response.success) {
        records.value.unshift(response.data)
        return response.data
      }
    } catch (err) {
      error.value = err.message || '添加记录失败'
      console.error('添加记录失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRecord = async (id, record) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.record.update(id, record)
      if (response.success) {
        const index = records.value.findIndex(r => r.id === id)
        if (index !== -1) {
          records.value[index] = { ...records.value[index], ...record }
        }
        return { ...records.value.find(r => r.id === id) }
      }
    } catch (err) {
      error.value = err.message || '更新记录失败'
      console.error('更新记录失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRecord = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.record.delete(id)
      if (response.success) {
        records.value = records.value.filter(r => r.id !== id)
      }
    } catch (err) {
      error.value = err.message || '删除记录失败'
      console.error('删除记录失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStats = async (startDate, endDate) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.record.getStats(startDate, endDate)
      if (response.success) {
        return response.data
      }
    } catch (err) {
      error.value = err.message || '获取统计失败'
      console.error('获取统计失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSortedRecords = computed(() => {
    return [...records.value].sort((a, b) => {
      const dateA = a.datetime ? new Date(a.datetime) : new Date(a.date)
      const dateB = b.datetime ? new Date(b.datetime) : new Date(b.date)
      return dateB - dateA
    })
  })

  const getStatsForPeriod = (period, selectedDate = null) => {
    const now = selectedDate || new Date()
    let startDate, endDate

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        break
      default:
        startDate = null
        endDate = null
    }

    const filteredRecords = records.value.filter(record => {
      const recordDate = new Date(record.date)
      if (startDate && endDate) {
        return recordDate >= startDate && recordDate <= endDate
      }
      return true
    })

    const income = filteredRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0)

    const expense = filteredRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0)

    const categoryStats = {}
    filteredRecords.forEach(r => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = 0
      }
      categoryStats[r.category] += parseFloat(r.amount)
    })

    return {
      income,
      expense,
      balance: income - expense,
      categoryStats,
      records: filteredRecords
    }
  }

  const dailyStats = computed(() => getStatsForPeriod('day'))
  const monthlyStats = computed(() => getStatsForPeriod('month'))
  const yearlyStats = computed(() => getStatsForPeriod('year'))
  const allStats = computed(() => getStatsForPeriod('all'))

  return {
    records,
    loading,
    error,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    getStats,
    getSortedRecords,
    dailyStats,
    monthlyStats,
    yearlyStats,
    allStats,
    getStatsForPeriod
  }
})
