<template>
  <div class="statistics-container">
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
      </el-menu>
      <Login />
    </div>
    
    <h1>统计分析</h1>
    
    <div class="stat-type-tabs">
      <el-radio-group v-model="statType" @change="updateStats">
        <el-radio-button label="day">日度统计</el-radio-button>
        <el-radio-button label="month">月度统计</el-radio-button>
        <el-radio-button label="year">年度统计</el-radio-button>
        <el-radio-button label="all">全部统计</el-radio-button>
      </el-radio-group>
    </div>
    
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
        <h3>{{ getStatTitle() }}收支</h3>
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
        <h3>支出分类占比</h3>
        <div ref="pieChart" class="chart"></div>
      </div>
      <div class="chart-card">
        <h3>收入分类占比</h3>
        <div ref="incomePieChart" class="chart"></div>
      </div>
      <div class="chart-card">
        <h3>{{ getStatTitle() }}收支趋势</h3>
        <div ref="lineChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, Document, DataAnalysis, Setting } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRecordStore } from '../../stores/record'
import Login from '../../components/business/Login.vue'

const router = useRouter()
const recordStore = useRecordStore()
const activeMenu = ref('/statistics')

const handleNavClick = (index) => {
  console.log('导航点击:', index)
  activeMenu.value = index
}

const statType = ref('month')
const selectedDate = ref(new Date())
const selectedMonth = ref(new Date())
const selectedYear = ref(new Date())
const pieChart = ref(null)
const incomePieChart = ref(null)
const lineChart = ref(null)
let pieInstance = null
let incomePieInstance = null
let lineInstance = null

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

onMounted(async () => {
  initCharts()
  window.addEventListener('resize', handleResize)
  await recordStore.fetchRecords()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (pieInstance) pieInstance.dispose()
  if (incomePieInstance) incomePieInstance.dispose()
  if (lineInstance) lineInstance.dispose()
})

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

const updateStats = () => {
  updateCharts()
}

const initCharts = () => {
  if (pieChart.value) {
    pieInstance = echarts.init(pieChart.value)
  }
  if (incomePieChart.value) {
    incomePieInstance = echarts.init(incomePieChart.value)
  }
  if (lineChart.value) {
    lineInstance = echarts.init(lineChart.value)
  }
  updateCharts()
}

const updateCharts = () => {
  updatePieChart()
  updateIncomePieChart()
  updateLineChart()
}

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

const updateLineChart = () => {
  if (!lineInstance) return
  
  let dates = []
  let incomeData = []
  let expenseData = []
  
  switch (statType.value) {
    case 'month':
      const monthDate = selectedMonth.value
      const monthYear = monthDate.getFullYear()
      const monthNum = monthDate.getMonth() + 1
      const daysInMonth = new Date(monthYear, monthNum, 0).getDate()
      
      const dailyData = {}
      for (let i = 1; i <= daysInMonth; i++) {
        dailyData[i] = { income: 0, expense: 0 }
      }
      
      const monthRecords = currentStats.value.records
      monthRecords.forEach(record => {
        const recordDate = new Date(record.date)
        const day = recordDate.getDate()
        if (dailyData[day]) {
          if (record.type === 'income') {
            dailyData[day].income += parseFloat(record.amount)
          } else {
            dailyData[day].expense += parseFloat(record.amount)
          }
        }
      })
      
      for (let i = 1; i <= daysInMonth; i += 5) {
        dates.push(`${i}日`)
        incomeData.push(dailyData[i]?.income || 0)
        expenseData.push(dailyData[i]?.expense || 0)
      }
      break
    default:
      dates = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
      incomeData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      expenseData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  
  lineInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '支出']
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '收入',
        type: 'line',
        data: incomeData,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '支出',
        type: 'line',
        data: expenseData,
        itemStyle: {
          color: '#f56c6c'
        }
      }
    ]
  })
}

const handleResize = () => {
  pieInstance?.resize()
  incomePieInstance?.resize()
  lineInstance?.resize()
}

const getCategoryLabel = (type, value) => {
  const categoryList = categories[type]
  const category = categoryList.find(c => c.value === value)
  return category ? category.label : value
}
</script>

<style scoped>
.statistics-container {
  padding: 0;
  max-width: 100%;
  margin: 0;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  margin-bottom: 20px;
}

.nav-menu {
  flex: 1;
  background-color: transparent;
  box-shadow: none;
}

.statistics-container h1 {
  text-align: center;
  color: #303133;
  margin: 20px 0;
  font-size: 24px;
}

.stat-type-tabs {
  display: flex;
  justify-content: center;
  margin: 0 auto 20px;
  max-width: 1200px;
}

.stat-type-tabs .el-radio-group {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px;
}

.stat-type-tabs .el-radio-button__inner {
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
}

.date-selector {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.date-selector .el-date-picker {
  width: 200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stat-card,
.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-card h3,
.chart-card h3 {
  margin: 0 0 20px;
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

.stat-numbers {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
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

.chart {
  height: 300px;
  margin-top: 20px;
}
</style>
