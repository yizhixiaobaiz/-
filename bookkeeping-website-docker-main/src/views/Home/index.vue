<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <div class="nav-container">
      <el-menu :default-active="activeMenu" class="nav-menu" mode="horizontal" router @select="handleNavClick">
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><Document /></el-icon>
          <span>记录</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
        <el-menu-item index="/ai">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI助手</span>
        </el-menu-item>
        <el-menu-item index="/skills">
          <el-icon><MagicStick /></el-icon>
          <span>技能管理</span>
        </el-menu-item>
      </el-menu>
      <Login />
    </div>
    
    <!-- 页面标题 -->
    <h1 class="page-title">个人记账应用</h1>
    
    <!-- 概览类型切换 -->
    <div class="overview-tabs">
      <el-radio-group v-model="overviewType" @change="updateOverview">
        <el-radio-button label="day">当日概览</el-radio-button>
        <el-radio-button label="month">当月概览</el-radio-button>
        <el-radio-button label="year">当年概览</el-radio-button>
        <el-radio-button label="all">全部概览</el-radio-button>
      </el-radio-group>
    </div>
    
    <!-- 当日概览卡片 -->
    <el-card v-if="overviewType === 'day'" class="overview-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当日概览</span>
        </div>
      </template>
      <div class="overview-stats">
        <div class="stat-item">
          <span class="stat-label">总收入</span>
          <span class="stat-value income">¥{{ dailyStats.income.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总支出</span>
          <span class="stat-value expense">¥{{ dailyStats.expense.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">结余</span>
          <span class="stat-value balance">¥{{ dailyStats.balance.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 月度概览卡片 -->
    <el-card v-else-if="overviewType === 'month'" class="overview-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当月概览</span>
        </div>
      </template>
      <div class="overview-stats">
        <div class="stat-item">
          <span class="stat-label">总收入</span>
          <span class="stat-value income">¥{{ monthlyStats.income.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总支出</span>
          <span class="stat-value expense">¥{{ monthlyStats.expense.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">结余</span>
          <span class="stat-value balance">¥{{ monthlyStats.balance.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 当年概览卡片 -->
    <el-card v-else-if="overviewType === 'year'" class="overview-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当年概览</span>
        </div>
      </template>
      <div class="overview-stats">
        <div class="stat-item">
          <span class="stat-label">总收入</span>
          <span class="stat-value income">¥{{ yearlyStats.income.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总支出</span>
          <span class="stat-value expense">¥{{ yearlyStats.expense.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">结余</span>
          <span class="stat-value balance">¥{{ yearlyStats.balance.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 全部概览卡片 -->
    <el-card v-else-if="overviewType === 'all'" class="overview-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>全部概览</span>
        </div>
      </template>
      <div class="overview-stats">
        <div class="stat-item">
          <span class="stat-label">总收入</span>
          <span class="stat-value income">¥{{ allStats.income.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总支出</span>
          <span class="stat-value expense">¥{{ allStats.expense.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">结余</span>
          <span class="stat-value balance">¥{{ allStats.balance.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 快速添加记录按钮 -->
    <el-button type="primary" size="large" class="add-button" @click="showAddDialog = true">
      <el-icon><Plus /></el-icon>
      快速添加记录
    </el-button>
    
    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 切换按钮 -->
      <div class="toggle-buttons">
        <el-button 
          :type="activeTab === 'records' ? 'primary' : 'default'"
          @click="activeTab = 'records'"
        >
          <el-icon><DocumentFilled /></el-icon>
          最近记录
        </el-button>
        <el-button 
          :type="activeTab === 'stats' ? 'primary' : 'default'"
          @click="activeTab = 'stats'"
        >
          <el-icon><PieChart /></el-icon>
          统计
        </el-button>
      </div>
      
      <!-- 最近记录列表 -->
      <el-card v-if="activeTab === 'records'" class="content-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>最近记录</span>
          </div>
        </template>
        <RecordList @add-record="handleAddRecord" />
      </el-card>
      
      <!-- 月度统计 -->
      <el-card v-else-if="activeTab === 'stats'" class="content-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ getStatTitle() }}统计</span>
          </div>
        </template>
        <!-- 统计类型切换 -->
        <div class="stat-type-tabs">
          <el-radio-group v-model="statType" @change="updateStats">
            <el-radio-button label="day">日度统计</el-radio-button>
            <el-radio-button label="month">月度统计</el-radio-button>
            <el-radio-button label="year">年度统计</el-radio-button>
            <el-radio-button label="all">全部统计</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 日期选择器 -->
        <div class="date-selector" v-if="statType === 'day'">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            @change="updateStats"
          />
        </div>
        <div class="date-selector" v-else-if="statType === 'month'">
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            @change="updateStats"
          />
        </div>
        <div class="date-selector" v-else-if="statType === 'year'">
          <el-date-picker
            v-model="selectedYear"
            type="year"
            placeholder="选择年份"
            @change="updateStats"
          />
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-numbers">
              <div class="stat-item">
                <span class="stat-label">总收入</span>
                <span class="stat-value income">¥{{ currentStats.income.toFixed(2) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总支出</span>
                <span class="stat-value expense">¥{{ currentStats.expense.toFixed(2) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">结余</span>
                <span class="stat-value balance">¥{{ currentStats.balance.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <div class="chart-card">
            <h4>支出分类占比</h4>
            <div ref="pieChart" class="chart"></div>
          </div>
          <div class="chart-card">
            <h4>收入分类占比</h4>
            <div ref="incomePieChart" class="chart"></div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 添加记录对话框 -->
    <AddTransaction
      :visible="showAddDialog"
      @close="showAddDialog = false"
      @submit="handleAddTransaction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { HomeFilled, Document, DataAnalysis, Setting, Plus, PieChart, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useRecordStore } from '../../stores/record'
import { useAuthStore } from '../../stores/auth'
import AddTransaction from '../../components/business/AddTransaction.vue'
import RecordList from '../../components/business/RecordList.vue'
import Login from '../../components/business/Login.vue'

// 路由实例
const router = useRouter()
const recordStore = useRecordStore()
const authStore = useAuthStore()

const showAddDialog = ref(false)
const activeTab = ref('records') // 当前激活的标签
const activeMenu = ref('/') // 当前激活的导航项
const overviewType = ref('month') // 概览类型：day, month, year, all
const statType = ref('month') // 统计类型：day, month, year, all
const selectedDate = ref(new Date()) // 选择的日期
const selectedMonth = ref(new Date()) // 选择的月份
const selectedYear = ref(new Date()) // 选择的年份
const pieChart = ref(null) // 饼图引用
const incomePieChart = ref(null) // 收入饼图引用
let pieInstance = null // 饼图实例
let incomePieInstance = null // 收入饼图实例

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
  console.log('初始化首页')
  console.log('用户登录状态:', authStore.isLoggedIn)
  if (authStore.isLoggedIn) {
    await recordStore.fetchRecords()
    console.log('获取记录成功，记录数量:', recordStore.records.length)
  } else {
    console.log('用户未登录，跳过获取记录')
  }
  
  // 监听标签切换
  watch(activeTab, (newTab) => {
    if (newTab === 'stats') {
      setTimeout(() => {
        initPieChart()
      }, 100)
    }
  })
  
  // 监听记录变化
  watch(() => recordStore.records, () => {
    if (activeTab.value === 'stats') {
      updatePieChart()
      updateIncomePieChart()
    }
  }, { deep: true })
  
  // 监听登录状态变化
  watch(() => authStore.isLoggedIn, async (newValue) => {
    if (newValue) {
      console.log('用户登录成功，获取记录')
      await recordStore.fetchRecords()
      console.log('获取记录成功，记录数量:', recordStore.records.length)
    }
  })
  
  // 监听日期变化
  watch([selectedDate, selectedMonth, selectedYear], () => {
    updateStats()
  })
})

// 组件卸载时
onUnmounted(() => {
  console.log('组件卸载')
  if (pieInstance) {
    pieInstance.dispose()
  }
  if (incomePieInstance) {
    incomePieInstance.dispose()
  }
})

// 获取当日统计数据
const dailyStats = computed(() => recordStore.dailyStats)

// 获取当月统计数据
const monthlyStats = computed(() => recordStore.monthlyStats)

// 获取当年统计数据
const yearlyStats = computed(() => recordStore.yearlyStats)

// 获取所有记录的统计数据
const allStats = computed(() => recordStore.allStats)

// 获取统计标题
const getStatTitle = () => {
  switch (statType.value) {
    case 'day':
      return '日度'
    case 'month':
      return '月度'
    case 'year':
      return '年度'
    case 'all':
      return '全部'
    default:
      return '月度'
  }
}

// 计算当前统计数据
const currentStats = computed(() => {
  switch (statType.value) {
    case 'day':
      return recordStore.getStatsForPeriod('day', selectedDate.value)
    case 'month':
      return recordStore.getStatsForPeriod('month', selectedMonth.value)
    case 'year':
      return recordStore.getStatsForPeriod('year', selectedYear.value)
    case 'all':
      return recordStore.getStatsForPeriod('all')
    default:
      return recordStore.getStatsForPeriod('month')
  }
})

// 更新概览
const updateOverview = () => {
  console.log('概览类型切换为:', overviewType.value)
}

// 更新统计
const updateStats = () => {
  console.log('统计类型切换为:', statType.value)
  // 延迟更新图表，确保DOM已经更新
  setTimeout(() => {
    updatePieChart()
    updateIncomePieChart()
  }, 100)
}

// 初始化饼图
const initPieChart = () => {
  if (pieChart.value) {
    if (pieInstance) {
      pieInstance.dispose()
    }
    pieInstance = echarts.init(pieChart.value)
    updatePieChart()
  }
  if (incomePieChart.value) {
    if (incomePieInstance) {
      incomePieInstance.dispose()
    }
    incomePieInstance = echarts.init(incomePieChart.value)
    updateIncomePieChart()
  }
}

// 更新饼图
const updatePieChart = () => {
  if (!pieInstance) return
  
  const categoryStats = currentStats.value.categoryStats
  const pieData = Object.entries(categoryStats).filter(([value, amount]) => {
    const isExpenseCategory = categories.expense.some(c => c.value === value)
    return isExpenseCategory && amount > 0
  }).map(([value, amount]) => {
    const categoryLabel = getCategoryLabel('expense', value)
    return { value: amount, name: categoryLabel }
  })
  
  pieInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

// 获取分类标签
const getCategoryLabel = (type, value) => {
  const categoryList = categories[type]
  const category = categoryList.find(c => c.value === value)
  return category ? category.label : value
}

// 更新收入饼图
const updateIncomePieChart = () => {
  if (!incomePieInstance) return
  
  const categoryStats = currentStats.value.categoryStats
  const incomeData = Object.entries(categoryStats).filter(([value, amount]) => {
    const isIncomeCategory = categories.income.some(c => c.value === value)
    return isIncomeCategory && amount > 0
  })
  
  const pieData = incomeData.map(([value, amount]) => {
    const categoryLabel = getCategoryLabel('income', value)
    return { value: amount, name: categoryLabel }
  })
  
  incomePieInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: '收入分类',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

// 处理添加交易记录
const handleAddTransaction = async (transaction) => {
  console.log('收到添加交易记录请求:', transaction)
  try {
    await recordStore.addRecord(transaction)
    console.log('添加成功')
    showAddDialog.value = false
    ElMessage.success('添加成功')
  } catch (error) {
    console.error('添加记录失败:', error)
    ElMessage.error('添加失败：' + error.message)
  }
}

// 处理添加记录事件（来自RecordList组件）
const handleAddRecord = () => {
  showAddDialog.value = true
}

// 处理导航点击
const handleNavClick = (index) => {
  console.log('导航点击:', index)
  activeMenu.value = index
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
}

/* 导航栏样式 */
.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.nav-menu {
  flex: 1;
  background-color: transparent;
  box-shadow: none;
}

.page-title {
  text-align: center;
  margin: 30px 0;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

/* 概览类型切换 */
.overview-tabs {
  display: flex;
  justify-content: center;
  margin: 0 auto 30px;
  max-width: 1200px;
  width: 90%;
}

.overview-tabs .el-radio-group {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px;
}

.overview-tabs .el-radio-button__inner {
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
}

/* 统计类型切换 */
.stat-type-tabs {
  display: flex;
  justify-content: center;
  margin: 0 auto 20px;
  max-width: 100%;
}

.stat-type-tabs .el-radio-group {
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 4px;
}

.stat-type-tabs .el-radio-button__inner {
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
}

/* 日期选择器 */
.date-selector {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.date-selector .el-date-picker {
  width: 200px;
}

/* 概览卡片 */
.overview-card {
  max-width: 1200px;
  margin: 0 auto 30px;
  width: 90%;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  flex: 1;
  margin: 0 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.stat-value.income {
  color: #67c23a;
}

.stat-value.expense {
  color: #f56c6c;
}

.stat-value.balance {
  color: #409eff;
}

/* 快速添加按钮 */
.add-button {
  display: block;
  margin: 0 auto 30px;
  width: 220px;
  height: 48px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 内容区域 */
.content-area {
  max-width: 1200px;
  margin: 0 auto 50px;
  width: 90%;
}

.toggle-buttons {
  display: flex;
  justify-content: center;
  margin: 0 0 20px;
  gap: 15px;
}

.toggle-buttons .el-button {
  padding: 0 20px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.content-card {
  margin-top: 0;
  border-radius: 8px;
  overflow: hidden;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card,
.chart-card {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h4 {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
}

.chart {
  height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .stat-item {
    margin: 0;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .add-button {
    width: 90%;
  }
  
  .nav-menu {
    font-size: 14px;
  }
  
  .nav-menu .el-icon {
    margin-right: 4px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overview-card,
.content-card {
  animation: fadeIn 0.5s ease-out;
}

/* 悬停效果 */
.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
</style>