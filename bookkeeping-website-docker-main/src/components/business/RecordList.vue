<template>
  <div class="record-list">
    <!-- 筛选区域 -->
    <div class="filter-bar">
      <el-select v-model="typeFilter" placeholder="选择类型" @change="handleFilterChange" clearable>
        <el-option label="全部" value="" />
        <el-option label="收入" value="income" />
        <el-option label="支出" value="expense" />
      </el-select>
      
      <!-- 记录数量统计 -->
      <div class="record-count">
        共 {{ filteredRecords.length }} 条记录
      </div>
    </div>
    
    <!-- 记录表格 -->
    <el-table 
      :data="filteredRecords" 
      style="width: 100%" 
      stripe 
      border 
      :header-cell-style="{ background: '#f9f9f9', fontWeight: 'bold' }"
      :row-style="{ transition: 'all 0.3s ease' }"
      @row-hover="handleRowHover"
    >
      <el-table-column label="日期" width="200">
        <template #default="scope">
          <span class="date-cell">{{ formatDate(scope.row.datetime || scope.row.date) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'" size="small">
            {{ scope.row.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="scope">
          <span class="category-cell">{{ getCategoryLabel(scope.row.type, scope.row.category) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" width="120">
        <template #default="scope">
          <span :class="scope.row.type === 'income' ? 'income-amount' : 'expense-amount'">
            ¥{{ parseFloat(scope.row.amount).toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注">
        <template #default="scope">
          <span class="note-cell">{{ scope.row.note || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleEdit(scope.row)"
            :title="'编辑记录'"
            class="action-button"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除这条记录吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button 
                type="danger" 
                size="small" 
                :title="'删除记录'"
                class="action-button"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 空状态 -->
    <div v-if="filteredRecords.length === 0" class="empty-state">
      <el-empty 
        description="暂无记录"
        image-size="120"
      >
        <template #description>
          <p>暂无记录，点击添加按钮开始记账</p>
        </template>
        <el-button type="primary" @click="$emit('add-record')">
          <el-icon><Plus /></el-icon>
          添加记录
        </el-button>
      </el-empty>
    </div>
    
    <!-- 编辑记录对话框 -->
    <EditTransaction
      :model-value="showEditDialog"
      @close="showEditDialog = false"
      :record="selectedRecord"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Edit, Delete, Plus, Document, PieChart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRecordStore } from '../../stores/record'
import EditTransaction from './EditTransaction.vue'

const emit = defineEmits(['add-record'])

const recordStore = useRecordStore()
const typeFilter = ref('')
const showEditDialog = ref(false)
const selectedRecord = ref(null)

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 分类数据
const categories = {
  income: [
    { label: '工资', value: '工资' },
    { label: '奖金', value: '奖金' },
    { label: '投资', value: '投资' },
    { label: '其他', value: '其他' }
  ],
  expense: [
    { label: '餐饮', value: '餐饮' },
    { label: '交通', value: '交通' },
    { label: '购物', value: '购物' },
    { label: '娱乐', value: '娱乐' },
    { label: '其他', value: '其他' }
  ]
}

// 初始化数据
onMounted(async () => {
  console.log('初始化记录列表')
  console.log('recordStore.records:', recordStore.records)
  console.log('recordStore.getSortedRecords:', recordStore.getSortedRecords)
  await recordStore.fetchRecords()
  console.log('fetchRecords 完成后 records:', recordStore.records)
  console.log('fetchRecords 完成后 getSortedRecords:', recordStore.getSortedRecords)
})

// 组件卸载时
onUnmounted(() => {
  console.log('组件卸载')
})

// 监听记录变化
watch(() => recordStore.records, () => {
  console.log('记录列表发生变化，重新渲染')
}, { deep: true })

// 过滤并排序交易记录
const filteredRecords = computed(() => {
  let result = recordStore.getSortedRecords
  
  if (typeFilter.value) {
    result = result.filter(record => record.type === typeFilter.value)
  }
  
  return result
})

// 获取分类标签
const getCategoryLabel = (type, value) => {
  if (!value) return '-'
  // 如果是乱码（显示??），直接返回原始值
  if (value === '??') return '未分类'
  const categoryList = categories[type]
  const category = categoryList.find(c => c.value === value)
  return category ? category.label : value
}

// 处理筛选条件变化
const handleFilterChange = () => {
}

// 处理删除记录
const handleDelete = async (id) => {
  console.log('删除记录:', id)
  try {
    await recordStore.deleteRecord(id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除记录失败:', error)
    ElMessage.error('删除失败：' + error.message)
  }
}

// 处理编辑记录
const handleEdit = (record) => {
  console.log('编辑记录:', record)
  selectedRecord.value = record
  showEditDialog.value = true
}

// 处理编辑提交
const handleEditSubmit = async (editedRecord) => {
  console.log('编辑提交:', editedRecord)
  try {
    await recordStore.updateRecord(editedRecord.id, editedRecord)
    console.log('记录编辑成功')
    ElMessage.success('编辑成功')
    showEditDialog.value = false
  } catch (error) {
    console.error('编辑记录失败:', error)
    ElMessage.error('编辑失败：' + error.message)
  }
}

// 处理行悬停
const handleRowHover = (row, column, cell, event) => {
}

// 处理添加记录事件
const handleAddRecord = () => {
  emit('add-record')
}
</script>

<style scoped>
.record-list {
  width: 100%;
}

/* 筛选区域 */
.filter-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.record-count {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-table__header-wrapper) {
  background-color: #f9f9f9;
}

:deep(.el-table th) {
  background-color: #f9f9f9 !important;
  font-weight: bold !important;
  color: #303133;
}

:deep(.el-table tr:hover) {
  background-color: #f5f7fa !important;
}

/* 表格单元格 */
.date-cell {
  font-size: 14px;
  color: #303133;
}

.category-cell {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.note-cell {
  font-size: 14px;
  color: #909399;
}

.income-amount {
  color: #67c23a;
  font-weight: bold;
  font-size: 14px;
}

.expense-amount {
  color: #f56c6c;
  font-weight: bold;
  font-size: 14px;
}

/* 操作按钮 */
.action-button {
  margin-right: 8px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 空状态 */
.empty-state {
  margin: 50px 0;
  text-align: center;
  padding: 40px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-empty__description) {
  margin-top: 20px;
  font-size: 16px;
  color: #909399;
}

:deep(.el-empty__description p) {
  margin: 10px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .record-count {
    margin-top: 10px;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 8px;
  }
  
  .action-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>