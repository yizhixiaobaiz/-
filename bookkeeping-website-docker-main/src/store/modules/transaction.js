import { defineStore } from 'pinia'
import { saveData, loadData } from '../../utils/storage'

const STORAGE_KEY = 'expense-tracker-data'

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    categories: {
      income: [
        { label: '工资', value: 'salary' },
        { label: '奖金', value: 'bonus' },
        { label: '投资', value: 'investment' },
        { label: '其他', value: 'other' }
      ],
      expense: [
        { label: '餐饮', value: 'food' },
        { label: '交通', value: 'transport' },
        { label: '购物', value: 'shopping' },
        { label: '娱乐', value: 'entertainment' },
        { label: '其他', value: 'other' }
      ]
    }
  }),
  
  getters: {
    // 获取所有交易记录
    allTransactions: (state) => state.transactions,
    
    // 按日期排序的交易记录
    sortedTransactions: (state) => {
      return [...state.transactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
    },
    
    // 按类型获取交易记录
    getTransactionsByType: (state) => (type) => {
      return state.transactions.filter(transaction => transaction.type === type)
    },
    
    // 按日期范围获取交易记录
    getTransactionsByDateRange: (state) => (startDate, endDate) => {
      return state.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
    },
    
    // 按分类获取交易记录
    getTransactionsByCategory: (state) => (category) => {
      return state.transactions.filter(transaction => transaction.category === category)
    },
    
    // 获取月度统计数据
    getMonthlyStats: (state) => (year, month) => {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      
      const monthTransactions = state.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const balance = income - expense
      
      // 按分类统计支出
      const categoryStats = {}
      monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          if (!categoryStats[t.category]) {
            categoryStats[t.category] = 0
          }
          categoryStats[t.category] += t.amount
        })
      
      return {
        income,
        expense,
        balance,
        categoryStats,
        transactions: monthTransactions
      }
    },
    
    // 获取所有分类
    allCategories: (state) => state.categories,
    
    // 获取指定类型的分类
    getCategoriesByType: (state) => (type) => {
      return state.categories[type] || []
    }
  },
  
  actions: {
    // 初始化数据
    initialize() {
      const data = loadData()
      if (data) {
        this.transactions = data.transactions || []
        this.categories = data.categories || this.categories
      }
    },
    
    // 保存数据到本地存储
    saveData() {
      const data = {
        transactions: this.transactions,
        categories: this.categories
      }
      saveData(data)
    },
    
    // 添加交易记录
    addTransaction(transaction) {
      this.transactions.push(transaction)
      this.saveData()
    },
    
    // 更新交易记录
    updateTransaction(id, updatedTransaction) {
      const index = this.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        this.transactions[index] = { ...this.transactions[index], ...updatedTransaction }
        this.saveData()
      }
    },
    
    // 删除交易记录
    deleteTransaction(id) {
      this.transactions = this.transactions.filter(t => t.id !== id)
      this.saveData()
    },
    
    // 添加分类
    addCategory(type, category) {
      if (!this.categories[type]) {
        this.categories[type] = []
      }
      this.categories[type].push(category)
      this.saveData()
    },
    
    // 更新分类
    updateCategory(type, oldValue, newValue) {
      if (this.categories[type]) {
        const index = this.categories[type].findIndex(c => c.value === oldValue)
        if (index !== -1) {
          this.categories[type][index] = newValue
          this.saveData()
        }
      }
    },
    
    // 删除分类
    deleteCategory(type, value) {
      if (this.categories[type]) {
        this.categories[type] = this.categories[type].filter(c => c.value !== value)
        this.saveData()
      }
    },
    
    // 清空所有数据
    clearAllData() {
      this.transactions = []
      this.saveData()
    }
  }
})