<template>
  <div class="import-export-container">
    <h3>数据导入导出</h3>
    
    <!-- 自动备份设置 -->
    <el-card class="auto-backup-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>自动备份设置</span>
        </div>
      </template>
      <div class="auto-backup-content">
        <el-switch v-model="autoBackupEnabled" @change="handleAutoBackupChange" />
        <span class="auto-backup-label">启用自动备份</span>
        <el-select v-model="backupInterval" class="backup-interval-select" :disabled="!autoBackupEnabled">
          <el-option label="每天" value="day" />
          <el-option label="每周" value="week" />
          <el-option label="每月" value="month" />
        </el-select>
        <el-button type="info" @click="triggerBackupNow">
          <el-icon><Refresh /></el-icon>
          立即备份
        </el-button>
      </div>
    </el-card>
    
    <!-- 导出功能 -->
    <el-card class="export-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>导出数据</span>
        </div>
      </template>
      <div class="export-content">
        <p>将所有记账记录导出为文件</p>
        <div class="export-options">
          <el-select v-model="exportFormat" placeholder="选择导出格式" class="format-select">
            <el-option label="Excel" value="excel" />
            <el-option label="CSV" value="csv" />
            <el-option label="JSON" value="json" />
          </el-select>
          <el-button type="primary" @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 导入功能 -->
    <el-card class="import-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>导入数据</span>
        </div>
      </template>
      <div class="import-content">
        <p>从文件导入记账记录</p>
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".csv,.xlsx,.xls,.json"
          :show-file-list="false"
        >
          <el-button type="info">
            <el-icon><Upload /></el-icon>
            选择文件
          </el-button>
        </el-upload>
        <p v-if="file" class="file-info">已选择文件: {{ file.name }}</p>
        <el-button 
          v-if="file" 
          type="success" 
          @click="importData"
          style="margin-top: 10px"
        >
          <el-icon><Check /></el-icon>
          开始导入
        </el-button>
      </div>
    </el-card>
    
    <!-- 备份历史 -->
    <el-card class="backup-history-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>备份历史</span>
          <el-button type="danger" size="small" @click="clearBackupHistory" :disabled="backupHistory.length === 0">
            清空历史
          </el-button>
        </div>
      </template>
      <div class="backup-history-content">
        <el-empty v-if="backupHistory.length === 0" description="暂无备份历史" />
        <el-table v-else :data="backupHistory" style="width: 100%">
          <el-table-column prop="date" label="备份时间" width="200" />
          <el-table-column prop="format" label="格式" width="100" />
          <el-table-column prop="records" label="记录数" width="100" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="downloadBackup(scope.row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 打印数据 -->
    <el-card class="print-data-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>打印全部数据</span>
          <el-button type="primary" size="small" @click="printAllData">
            <el-icon><View /></el-icon>
            显示全部数据
          </el-button>
        </div>
      </template>
      <div class="print-data-content">
        <div v-if="!displayedData" class="print-data-placeholder">
          <p>点击上方按钮显示全部记账数据</p>
        </div>
        <div v-else class="print-data-display">
          <div class="print-data-header">
            <span>记账数据</span>
            <el-button type="success" size="small" @click="copyData">
              <el-icon><DocumentCopy /></el-icon>
              复制数据
            </el-button>
          </div>
          <pre class="print-data-text">{{ displayedData }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Download, Upload, Check, Refresh, View, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { useRecordStore } from '../../stores/record'

const recordStore = useRecordStore()

const file = ref(null)
const exportFormat = ref('excel')
const autoBackupEnabled = ref(false)
const backupInterval = ref('day')
const backupHistory = ref([])
const displayedData = ref(null)
let autoBackupTimer = null

// 初始化
onMounted(() => {
  loadAutoBackupSettings()
  loadBackupHistory()
  if (autoBackupEnabled.value) {
    scheduleAutoBackup()
  }
})

// 清理定时器
onUnmounted(() => {
  if (autoBackupTimer) {
    clearInterval(autoBackupTimer)
  }
})

// 加载自动备份设置
const loadAutoBackupSettings = () => {
  try {
    const settings = localStorage.getItem('autoBackupSettings')
    if (settings) {
      const { enabled, interval } = JSON.parse(settings)
      autoBackupEnabled.value = enabled
      backupInterval.value = interval
    }
  } catch (error) {
    console.error('加载自动备份设置失败:', error)
  }
}

// 保存自动备份设置
const saveAutoBackupSettings = () => {
  try {
    const settings = {
      enabled: autoBackupEnabled.value,
      interval: backupInterval.value
    }
    localStorage.setItem('autoBackupSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('保存自动备份设置失败:', error)
  }
}

// 处理自动备份开关变化
const handleAutoBackupChange = () => {
  saveAutoBackupSettings()
  if (autoBackupEnabled.value) {
    scheduleAutoBackup()
  } else {
    if (autoBackupTimer) {
      clearInterval(autoBackupTimer)
      autoBackupTimer = null
    }
  }
}

// 调度自动备份
const scheduleAutoBackup = () => {
  if (autoBackupTimer) {
    clearInterval(autoBackupTimer)
  }
  
  let intervalMs
  switch (backupInterval.value) {
    case 'day':
      intervalMs = 24 * 60 * 60 * 1000
      break
    case 'week':
      intervalMs = 7 * 24 * 60 * 60 * 1000
      break
    case 'month':
      intervalMs = 30 * 24 * 60 * 60 * 1000
      break
    default:
      intervalMs = 24 * 60 * 60 * 1000
  }
  
  autoBackupTimer = setInterval(() => {
    triggerBackupNow()
  }, intervalMs)
}

// 立即触发备份
const triggerBackupNow = async () => {
  try {
    const records = recordStore.getSortedRecords
    if (records.length === 0) {
      ElMessage.warning('没有记录可备份')
      return
    }
    
    // 导出为JSON格式
    const backupData = {
      records,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    // 创建备份历史记录
    const backupRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      format: 'json',
      records: records.length
    }
    
    // 保存到备份历史
    backupHistory.value.unshift(backupRecord)
    // 只保留最近10条备份历史
    if (backupHistory.value.length > 10) {
      backupHistory.value = backupHistory.value.slice(0, 10)
    }
    saveBackupHistory()
    
    // 下载备份文件
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `记账备份_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('备份成功')
  } catch (error) {
    console.error('备份失败:', error)
    ElMessage.error('备份失败：' + error.message)
  }
}

// 加载备份历史
const loadBackupHistory = () => {
  try {
    const history = localStorage.getItem('backupHistory')
    if (history) {
      backupHistory.value = JSON.parse(history)
    }
  } catch (error) {
    console.error('加载备份历史失败:', error)
  }
}

// 保存备份历史
const saveBackupHistory = () => {
  try {
    localStorage.setItem('backupHistory', JSON.stringify(backupHistory.value))
  } catch (error) {
    console.error('保存备份历史失败:', error)
  }
}

// 下载备份
const downloadBackup = (backup) => {
  // 这里简化处理，实际应该从存储中获取备份数据
  ElMessage.info('备份下载功能开发中')
}

// 清空备份历史
const clearBackupHistory = () => {
  backupHistory.value = []
  saveBackupHistory()
  ElMessage.success('备份历史已清空')
}

// 导出数据
const exportData = async () => {
  try {
    const records = recordStore.getSortedRecords
    
    if (records.length === 0) {
      ElMessage.warning('没有记录可导出')
      return
    }
    
    if (exportFormat.value === 'excel') {
      await exportToExcel(records)
    } else if (exportFormat.value === 'csv') {
      await exportToCSV(records)
    } else if (exportFormat.value === 'json') {
      await exportToJSON(records)
    }
    
    // 添加到备份历史
    const backupRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      format: exportFormat.value,
      records: records.length
    }
    backupHistory.value.unshift(backupRecord)
    if (backupHistory.value.length > 10) {
      backupHistory.value = backupHistory.value.slice(0, 10)
    }
    saveBackupHistory()
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败：' + error.message)
  }
}

// 导出数据为Excel
const exportToExcel = (records) => {
  return new Promise((resolve, reject) => {
    try {
      // 转换记录为导出格式
      const exportRecords = records.map(record => {
        const type = record.type === 'income' ? '收入' : '支出'
        return {
          '日期': record.date,
          '类型': type,
          '分类': getCategoryLabel(record.type, record.category),
          '金额': record.amount,
          '备注': record.note || ''
        }
      })
      
      // 创建工作簿
      const wb = XLSX.utils.book_new()
      
      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(exportRecords)
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '记账记录')
      
      // 生成Excel文件并下载
      XLSX.writeFile(wb, `记账记录_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      ElMessage.success('Excel导出成功')
      resolve()
    } catch (error) {
      console.error('Excel导出失败:', error)
      ElMessage.error('Excel导出失败：' + error.message)
      reject(error)
    }
  })
}

// 导出数据为CSV
const exportToCSV = (records) => {
  return new Promise((resolve, reject) => {
    try {
      // 转换记录为导出格式
      const exportRecords = records.map(record => {
        const type = record.type === 'income' ? '收入' : '支出'
        return {
          '日期': record.date,
          '类型': type,
          '分类': getCategoryLabel(record.type, record.category),
          '金额': record.amount,
          '备注': record.note || ''
        }
      })
      
      // CSV表头
      const headers = ['日期', '类型', '分类', '金额', '备注']
      
      // 转换记录为CSV行
      const rows = exportRecords.map(record => {
        return [
          record['日期'],
          record['类型'],
          record['分类'],
          record['金额'],
          record['备注']
        ]
      })
      
      // 组合CSV内容
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
      
      // 创建Blob对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `记账记录_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success('CSV导出成功')
      resolve()
    } catch (error) {
      console.error('CSV导出失败:', error)
      ElMessage.error('CSV导出失败：' + error.message)
      reject(error)
    }
  })
}

// 导出数据为JSON
const exportToJSON = (records) => {
  return new Promise((resolve, reject) => {
    try {
      const exportData = {
        records,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
      
      // 创建Blob对象
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      
      // 创建下载链接
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `记账记录_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success('JSON导出成功')
      resolve()
    } catch (error) {
      console.error('JSON导出失败:', error)
      ElMessage.error('JSON导出失败：' + error.message)
      reject(error)
    }
  })
}

// 处理文件选择
const handleFileChange = (fileObj) => {
  file.value = fileObj.raw
}

// 从文件导入数据
const importData = () => {
  if (!file.value) {
    ElMessage.warning('请选择文件')
    return
  }
  
  const fileName = file.value.name
  const fileExtension = fileName.split('.').pop().toLowerCase()
  
  if (fileExtension === 'csv') {
    importFromCSVFile()
  } else if (['xlsx', 'xls'].includes(fileExtension)) {
    importFromExcelFile()
  } else if (fileExtension === 'json') {
    importFromJSONFile()
  } else {
    ElMessage.error('不支持的文件格式')
    return
  }
}

// 从CSV文件导入数据
const importFromCSVFile = () => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const csvContent = e.target.result
      const lines = csvContent.split('\n')
      
      // 跳过表头
      const records = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line) {
          const [date, type, category, amount, remark] = line.split(',')
          
          if (date && type && category && amount) {
            // 转换类型
            const recordType = type === '收入' ? 'income' : 'expense'
            // 转换分类
            const recordCategory = getCategoryValue(recordType, category)
            
            if (recordCategory) {
              records.push({
                date,
                type: recordType,
                category: recordCategory,
                amount: parseFloat(amount),
                note: remark || ''
              })
            }
          }
        }
      }
      
      await processImportedRecords(records)
    } catch (error) {
      console.error('CSV导入失败:', error)
      ElMessage.error('CSV导入失败：' + error.message)
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsText(file.value, 'utf-8')
}

// 从Excel文件导入数据
const importFromExcelFile = () => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      
      // 获取第一个工作表
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]
      
      // 转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      // 处理导入的记录
      const records = []
      jsonData.forEach(row => {
        const date = row['日期'] || row['date']
        const type = row['类型'] || row['type']
        const category = row['分类'] || row['category']
        const amount = row['金额'] || row['amount']
        const remark = row['备注'] || row['note'] || row['remark'] || ''
        
        if (date && type && category && amount) {
          // 转换类型
          let recordType = type
          if (typeof type === 'string') {
            recordType = type === '收入' ? 'income' : 'expense'
          }
          
          // 转换分类
          const recordCategory = getCategoryValue(recordType, category)
          
          if (recordCategory) {
            records.push({
              date: typeof date === 'string' ? date : date.toISOString().split('T')[0],
              type: recordType,
              category: recordCategory,
              amount: parseFloat(amount),
              note: remark
            })
          }
        }
      })
      
      await processImportedRecords(records)
    } catch (error) {
      console.error('Excel导入失败:', error)
      ElMessage.error('Excel导入失败：' + error.message)
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsArrayBuffer(file.value)
}

// 从JSON文件导入数据
const importFromJSONFile = () => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const jsonContent = e.target.result
      const importData = JSON.parse(jsonContent)
      
      // 处理导入的记录
      const records = []
      if (importData.records && Array.isArray(importData.records)) {
        importData.records.forEach(record => {
          if (record.date && record.type && record.category && record.amount) {
            records.push({
              date: record.date,
              type: record.type,
              category: record.category,
              amount: parseFloat(record.amount),
              note: record.note || ''
            })
          }
        })
      }
      
      await processImportedRecords(records)
    } catch (error) {
      console.error('JSON导入失败:', error)
      ElMessage.error('JSON导入失败：' + error.message)
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsText(file.value, 'utf-8')
}

// 处理导入的记录
const processImportedRecords = async (records) => {
  if (records.length > 0) {
    // 批量添加记录
    for (const record of records) {
      await recordStore.addRecord(record)
    }
    ElMessage.success(`成功导入 ${records.length} 条记录`)
    file.value = null
  } else {
    ElMessage.warning('文件中没有有效的记录')
  }
}

// 分类数据
const categories = {
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

// 获取分类标签
const getCategoryLabel = (type, value) => {
  const categoryList = categories[type]
  const category = categoryList.find(c => c.value === value)
  return category ? category.label : value
}

// 获取分类值
const getCategoryValue = (type, label) => {
  const categoryList = categories[type]
  const category = categoryList.find(c => c.label === label)
  return category ? category.value : 'other'
}

// 显示全部数据
const printAllData = () => {
  try {
    const records = recordStore.getSortedRecords
    
    if (records.length === 0) {
      ElMessage.warning('没有记录可显示')
      return
    }
    
    // 转换记录为简洁格式
    const formattedRecords = records.map((record, index) => {
      const type = record.type === 'income' ? '收入' : '支出'
      const category = getCategoryLabel(record.type, record.category)
      // 只保留关键字段，日期格式简化
      const simplifiedDate = record.date.split('T')[0]
      return `${index + 1}. ${simplifiedDate} ${type} ${category} ${record.amount}元${record.note ? ' 备注:' + record.note : ''}`
    })
    
    // 转换为简单文本格式
    displayedData.value = formattedRecords.join('\n')
  } catch (error) {
    console.error('显示数据失败:', error)
    ElMessage.error('显示数据失败：' + error.message)
  }
}

// 复制数据
const copyData = () => {
  if (!displayedData.value) {
    ElMessage.warning('没有数据可复制')
    return
  }
  
  // 复制到剪贴板
  navigator.clipboard.writeText(displayedData.value)
    .then(() => {
      ElMessage.success('数据已复制到剪贴板')
    })
    .catch(error => {
      console.error('复制失败:', error)
      ElMessage.error('复制失败：' + error.message)
    })
}
</script>

<style scoped>
.import-export-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.auto-backup-card,
.export-card,
.import-card,
.backup-history-card,
.print-data-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auto-backup-content,
.export-content,
.import-content,
.backup-history-content {
  padding: 20px;
}

.auto-backup-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auto-backup-label {
  margin-right: 10px;
  color: #606266;
}

.backup-interval-select {
  width: 120px;
}

.export-content p,
.import-content p {
  margin-bottom: 20px;
  color: #606266;
}

.file-info {
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}

/* 导出选项 */
.export-options {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
}

.format-select {
  width: 120px;
}

/* 备份历史 */
.backup-history-content {
  min-height: 200px;
}

/* 打印数据卡片样式 */
.print-data-content {
  padding: 20px;
  min-height: 300px;
}

.print-data-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #f5f7fa;
  border-radius: 8px;
  color: #909399;
  text-align: center;
}

.print-data-display {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.print-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.print-data-header span {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.print-data-text {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .auto-backup-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .export-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .format-select,
  .backup-interval-select {
    width: 100%;
  }
  
  .print-data-text {
    max-height: 300px;
  }
}
</style>