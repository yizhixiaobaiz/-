// 存储工具函数

const STORAGE_KEY = 'expense-tracker-data'

// 保存数据到localStorage
export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('保存数据失败:', error)
    return false
  }
}

// 从localStorage读取数据
export const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('读取数据失败:', error)
    return null
  }
}

// 清空数据
export const clearData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清空数据失败:', error)
    return false
  }
}

// 导出数据为JSON
export const exportData = () => {
  const data = loadData()
  if (!data) return null
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  return true
}

// 导入数据
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData)
    return saveData(data)
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}