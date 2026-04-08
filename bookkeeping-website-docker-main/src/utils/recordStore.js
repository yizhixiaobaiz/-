// 记录存储工具类

// IndexedDB 存储适配器
class IndexedDBAdapter {
  constructor(dbName = 'expense-tracker', version = 1) {
    this.dbName = dbName
    this.version = version
    this.db = null
  }
  
  // 初始化 IndexedDB
  init() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject('IndexedDB 不受支持')
        return
      }
      
      const request = window.indexedDB.open(this.dbName, this.version)
      
      request.onerror = event => {
        console.error('IndexedDB 初始化失败:', event.target.error)
        reject(event.target.error)
      }
      
      request.onsuccess = event => {
        this.db = event.target.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = event => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('records')) {
          db.createObjectStore('records', { keyPath: 'id' })
        }
      }
    })
  }
  
  // 保存记录到 IndexedDB
  async saveRecords(userId, records) {
    if (!this.db) {
      try {
        await this.init()
      } catch (error) {
        console.error('IndexedDB 初始化失败，无法保存记录:', error)
        return false
      }
    }
    
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['records'], 'readwrite')
      const store = transaction.objectStore('records')
      
      // 清空该用户的旧数据
      const clearRequest = store.clear()
      clearRequest.onerror = () => console.error('清空数据失败')
      
      // 保存新数据
      records.forEach(record => {
        const request = store.add({ ...record, userId })
        request.onerror = () => console.error('保存记录失败')
      })
      
      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => resolve(false)
    })
  }
  
  // 从 IndexedDB 加载记录
  async loadRecords(userId) {
    if (!this.db) {
      try {
        await this.init()
      } catch (error) {
        console.error('IndexedDB 初始化失败，无法加载记录:', error)
        return []
      }
    }
    
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['records'], 'readonly')
      const store = transaction.objectStore('records')
      const request = store.getAll()
      
      request.onsuccess = event => {
        const records = event.target.result.filter(record => record.userId === userId)
        resolve(records)
      }
      request.onerror = () => resolve([])
    })
  }
}

class RecordStore {
  constructor() {
    this.currentUser = null
    this.records = []
    this.subscribers = [] // 订阅者列表
    this.indexedDBAdapter = new IndexedDBAdapter()
    // 初始化时加载记录
    this.init()
  }
  
  // 初始化
  async init() {
    if (this.currentUser) {
      await this.loadRecords()
    }
  }
  
  // 设置当前用户
  async setCurrentUser(userId) {
    this.currentUser = userId
    await this.loadRecords()
    this.notify() // 通知订阅者数据已更新
  }
  
  // 获取存储键名
  getStorageKey() {
    return this.currentUser ? `expense-tracker-records-${this.currentUser}` : 'expense-tracker-records'
  }
  
  // 添加订阅者
  subscribe(callback) {
    this.subscribers.push(callback)
  }
  
  // 通知所有订阅者
  notify() {
    this.subscribers.forEach(callback => callback())
  }

  // 从本地存储加载记录
  async loadRecords() {
    // 确保在浏览器环境中运行
    if (typeof window === 'undefined') {
      console.log('非浏览器环境，返回空记录')
      this.records = []
      return []
    }
    
    try {
      console.log('开始加载记录')
      
      // 首先尝试从 IndexedDB 加载
      if (this.currentUser) {
        const indexedDBRecords = await this.indexedDBAdapter.loadRecords(this.currentUser)
        if (indexedDBRecords.length > 0) {
          console.log('从 IndexedDB 加载记录成功，记录数:', indexedDBRecords.length)
          this.records = indexedDBRecords
          // 同步到 localStorage 作为备份
          this.saveToLocalStorage()
          return this.records
        }
      }
      
      // IndexedDB 没有数据，从 localStorage 加载
      if (window.localStorage) {
        const storageKey = this.getStorageKey()
        const data = localStorage.getItem(storageKey)
        console.log('从 localStorage 获取的数据:', data)
        let records = data ? JSON.parse(data) : []
        
        console.log('从 localStorage 加载的记录数:', records.length)
        this.records = records
        
        // 同步到 IndexedDB
        if (this.currentUser) {
          await this.indexedDBAdapter.saveRecords(this.currentUser, records)
        }
        
        return records
      }
      
      return []
    } catch (error) {
      console.error('加载记录失败:', error)
      this.records = []
      return []
    }
  }
  
  // 保存到 localStorage
  saveToLocalStorage() {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('非浏览器环境，无法保存到 localStorage')
      return false
    }
    
    try {
      const storageKey = this.getStorageKey()
      localStorage.setItem(storageKey, JSON.stringify(this.records))
      return true
    } catch (error) {
      console.error('保存到 localStorage 失败:', error)
      return false
    }
  }

  // 保存记录到本地存储
  async saveRecords() {
    // 确保在浏览器环境中运行
    if (typeof window === 'undefined') {
      console.log('非浏览器环境，无法保存记录')
      return false
    }
    
    let success = true
    
    // 保存到 localStorage
    if (window.localStorage) {
      try {
        const storageKey = this.getStorageKey()
        localStorage.setItem(storageKey, JSON.stringify(this.records))
        console.log('保存到 localStorage 成功')
      } catch (error) {
        console.error('保存到 localStorage 失败:', error)
        success = false
      }
    }
    
    // 保存到 IndexedDB
    if (this.currentUser) {
      try {
        const indexedDBSuccess = await this.indexedDBAdapter.saveRecords(this.currentUser, this.records)
        if (indexedDBSuccess) {
          console.log('保存到 IndexedDB 成功')
        } else {
          console.error('保存到 IndexedDB 失败')
          success = false
        }
      } catch (error) {
        console.error('保存到 IndexedDB 失败:', error)
        success = false
      }
    }
    
    return success
  }

  // 添加记录
  async addRecord(record) {
    console.log('开始添加记录:', record)
    try {
      let formattedDate
      let formattedDateTime
      
      if (record.date instanceof Date) {
        formattedDate = record.date.toISOString().split('T')[0] // 格式化日期为 YYYY-MM-DD
        formattedDateTime = record.date.toISOString().slice(0, 19).replace('T', ' ') // 格式化日期时间为 YYYY-MM-DD HH:MM:SS
      } else if (typeof record.date === 'string') {
        if (record.date.includes(' ')) {
          // 如果已经包含时间
          formattedDate = record.date.split(' ')[0]
          formattedDateTime = record.date
        } else {
          // 只有日期，添加当前时间
          formattedDate = record.date
          const now = new Date()
          const time = now.toTimeString().slice(0, 8)
          formattedDateTime = `${record.date} ${time}`
        }
      } else {
        // 默认使用当前日期和时间
        const now = new Date()
        formattedDate = now.toISOString().split('T')[0]
        formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ')
      }
      
      const newRecord = {
        id: Date.now().toString(),
        ...record,
        date: formattedDate,
        datetime: formattedDateTime // 保存完整的日期时间
      }
      
      console.log('格式化后的记录:', newRecord)
      this.records.push(newRecord)
      await this.saveRecords()
      this.notify() // 通知订阅者
      console.log('记录添加成功，当前记录数:', this.records.length)
      return newRecord
    } catch (error) {
      console.error('添加记录失败:', error)
      throw error
    }
  }

  // 获取所有记录
  getAllRecords() {
    return [...this.records]
  }

  // 获取按日期倒序排序的记录
  getSortedRecords() {
    return [...this.records].sort((a, b) => {
      // 优先使用datetime字段排序，如果没有则使用date字段
      const dateA = a.datetime ? new Date(a.datetime) : new Date(a.date)
      const dateB = b.datetime ? new Date(b.datetime) : new Date(b.date)
      return dateB - dateA
    })
  }

  // 按类型获取记录
  getRecordsByType(type) {
    return this.records.filter(record => record.type === type)
  }

  // 按日期范围获取记录
  getRecordsByDateRange(startDate, endDate) {
    return this.records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // 按分类获取记录
  getRecordsByCategory(category) {
    return this.records.filter(record => record.category === category)
  }

  // 获取当前月份的统计数据
  getCurrentMonthStats() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    return this.getMonthlyStats(year, month)
  }

  // 获取当前日期的统计数据
  getCurrentDayStats() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    
    const startDate = new Date(year, month - 1, day)
    const endDate = new Date(year, month - 1, day, 23, 59, 59)

    const dayRecords = this.records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })

    const income = dayRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)

    const expense = dayRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    const balance = income - expense

    // 按分类统计收支
    const categoryStats = {}
    dayRecords.forEach(r => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = 0
      }
      categoryStats[r.category] += r.amount
    })

    return {
      income,
      expense,
      balance,
      categoryStats,
      records: dayRecords
    }
  }

  // 获取当前年份的统计数据
  getCurrentYearStats() {
    const now = new Date()
    const year = now.getFullYear()
    return this.getYearlyStats(year)
  }

  // 获取指定日期的统计数据
  getDailyStats(year, month, day) {
    const startDate = new Date(year, month - 1, day)
    const endDate = new Date(year, month - 1, day, 23, 59, 59)

    const dayRecords = this.records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })

    const income = dayRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)

    const expense = dayRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    const balance = income - expense

    // 按分类统计收支
    const categoryStats = {}
    dayRecords.forEach(r => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = 0
      }
      categoryStats[r.category] += r.amount
    })

    return {
      income,
      expense,
      balance,
      categoryStats,
      records: dayRecords
    }
  }

  // 获取指定年份的统计数据
  getYearlyStats(year) {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const yearRecords = this.records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })

    const income = yearRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)

    const expense = yearRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    const balance = income - expense

    // 按分类统计收支
    const categoryStats = {}
    yearRecords.forEach(r => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = 0
      }
      categoryStats[r.category] += r.amount
    })

    return {
      income,
      expense,
      balance,
      categoryStats,
      records: yearRecords
    }
  }

  // 获取所有记录的统计数据
  getAllStats() {
    const allRecords = this.records

    const income = allRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)

    const expense = allRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    const balance = income - expense

    // 按分类统计收支
    const categoryStats = {}
    allRecords.forEach(r => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = 0
      }
      categoryStats[r.category] += r.amount
    })

    return {
      income,
      expense,
      balance,
      categoryStats,
      records: allRecords
    }
  }

  // 获取指定月份的统计数据
  getMonthlyStats(year, month) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const monthRecords = this.records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })

    const income = monthRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)

    const expense = monthRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    const balance = income - expense

    // 按分类统计收支
    const categoryStats = {}
    monthRecords.forEach(r => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = 0
      }
      categoryStats[r.category] += r.amount
    })

    return {
      income,
      expense,
      balance,
      categoryStats,
      records: monthRecords
    }
  }

  // 删除记录
  async deleteRecord(id) {
    this.records = this.records.filter(r => r.id !== id)
    await this.saveRecords()
    this.notify() // 通知订阅者
  }

  // 更新记录
  async updateRecord(id, updatedRecord) {
    const index = this.records.findIndex(r => r.id === id)
    if (index !== -1) {
      // 格式化日期
      let formattedDate
      let formattedDateTime
      
      if (updatedRecord.date instanceof Date) {
        formattedDate = updatedRecord.date.toISOString().split('T')[0] // 格式化日期为 YYYY-MM-DD
        formattedDateTime = updatedRecord.date.toISOString().slice(0, 19).replace('T', ' ') // 格式化日期时间为 YYYY-MM-DD HH:MM:SS
      } else if (typeof updatedRecord.date === 'string') {
        if (updatedRecord.date.includes(' ')) {
          // 如果已经包含时间
          formattedDate = updatedRecord.date.split(' ')[0]
          formattedDateTime = updatedRecord.date
        } else {
          // 只有日期，添加当前时间
          formattedDate = updatedRecord.date
          const now = new Date()
          const time = now.toTimeString().slice(0, 8)
          formattedDateTime = `${updatedRecord.date} ${time}`
        }
      } else {
        // 使用原有日期
        formattedDate = this.records[index].date
        formattedDateTime = this.records[index].datetime
      }
      
      this.records[index] = {
        ...this.records[index],
        ...updatedRecord,
        date: formattedDate,
        datetime: formattedDateTime
      }
      await this.saveRecords()
      this.notify() // 通知订阅者
      return true
    }
    return false
  }

  // 清空所有记录
  async clearAllRecords() {
    this.records = []
    await this.saveRecords()
  }
}

// 导出单例实例
export default new RecordStore()